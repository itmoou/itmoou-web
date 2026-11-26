import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { getTranslation, getLocalizedPath, type Language } from './i18n'
import announcements, { announcementsEn } from './announcements'
import admin from './admin'
import { v2Home, v2Company, v2Service, v2Rnd, v2Newsroom, v2Contact, v2Privacy, type AnnouncementRow } from './site-v2'
import { htmlToMarkdown, llmsTxt } from './geo'
import { GUIDES, v2Careers, v2Guide, v2GuideIndex } from './guides'
import type { NewsItem, SlideItem, HistoryItem, SolutionData, SolutionFeature, ContactSubmission } from './types'

const app = new Hono<{ Bindings: { itmoou_db: D1Database; itmoou_files: R2Bucket; ADMIN_PASSWORD: string; FORM_SECRET?: string } }>()

// Accept: text/markdown 으로 페이지를 부르면(콘텐츠 협상) 마크다운 대응본을 준다. 브라우저는 text/html 이 앞서므로 영향 없음.
app.use('*', async (c, next) => {
  const accept = c.req.header('accept') || ''
  const path = new URL(c.req.url).pathname
  const wantsMd = accept.includes('text/markdown') && (accept.indexOf('text/markdown') < (accept.indexOf('text/html') === -1 ? 1e9 : accept.indexOf('text/html')))
  if (c.req.method === 'GET' && wantsMd && /^\/(company|service|rnd|newsroom|contact|announcements(\/\d+)?|privacy-policy)?$/.test(path)) {
    const md = await pageMarkdown(c, path || '/')
    if (md) return c.text(md, 200, { 'Content-Type': 'text/markdown; charset=utf-8', Vary: 'Accept' })
  }
  await next()
})


// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files from public directory
app.use('/static/*', serveStatic({ root: './public' }))
app.use('/images/*', serveStatic({ root: './public' }))

// 공통 DB 조회 헬퍼
async function fetchCmsData(db: D1Database) {
  const [newsRes, slidesRes, historyRes] = await Promise.all([
    db.prepare('SELECT * FROM news ORDER BY order_num ASC').all<NewsItem>().catch(() => ({ results: [] as NewsItem[] })),
    db.prepare('SELECT * FROM slides WHERE active = 1 ORDER BY order_num ASC').all<SlideItem>().catch(() => ({ results: [] as SlideItem[] })),
    db.prepare('SELECT * FROM history_items ORDER BY order_num ASC').all<HistoryItem>().catch(() => ({ results: [] as HistoryItem[] })),
  ])
  return {
    news: newsRes.results,
    slides: slidesRes.results,
    history: historyRes.results,
  }
}

async function fetchSolution(db: D1Database, slug: string): Promise<SolutionData | null> {
  return db.prepare('SELECT * FROM solutions WHERE slug = ?').bind(slug).first<SolutionData>().catch(() => null)
}

async function fetchSolutionFeatures(db: D1Database, slug: string): Promise<SolutionFeature[]> {
  const res = await db.prepare('SELECT * FROM solution_features WHERE solution_slug = ? ORDER BY order_num ASC')
    .bind(slug).all<SolutionFeature>().catch(() => ({ results: [] as SolutionFeature[] }))
  return res.results
}

async function fetchJobsUrl(db: D1Database): Promise<string> {
  const s = await db.prepare('SELECT value FROM site_settings WHERE key = ?').bind('jobs_url')
    .first<{value: string}>().catch(() => null)
  return s?.value || 'https://recruit.itmoou.com'
}

async function fetchPageSections(db: D1Database, page: string): Promise<Record<string, string>> {
  const res = await db.prepare('SELECT section_key, content FROM page_sections WHERE page = ?')
    .bind(page).all<{section_key: string; content: string}>().catch(() => ({ results: [] as {section_key: string; content: string}[] }))
  const sections: Record<string, string> = {}
  for (const r of res.results) sections[r.section_key] = r.content
  return sections
}

// ─────────────────────────────────────────────
// 2026-07 재구축(site-v2) 라우트
// 구 URL은 SEO 보존을 위해 301로 새 IA에 매핑
// ─────────────────────────────────────────────

app.get('/', (c) => c.html(v2Home()))

app.get('/company', async (c) => {
  const history = await c.env.itmoou_db
    .prepare('SELECT year, content FROM history_items ORDER BY year DESC, order_num ASC')
    .all<{ year: string; content: string }>()
    .then(r => r.results)
    .catch(() => [] as { year: string; content: string }[])
  return c.html(v2Company(history))
})
app.get('/company/ceo', (c) => c.redirect('/company', 301))
app.get('/company/history', (c) => c.redirect('/company', 301))
app.get('/company/esg', (c) => c.redirect('/company', 301))
app.get('/company/location', (c) => c.redirect('/company', 301))
app.get('/company/news', (c) => c.redirect('/newsroom', 301))

app.get('/service', (c) => c.html(v2Service()))
app.get('/solutions/loginexio', (c) => c.redirect('/service', 301))
app.get('/solutions/bizsupport', (c) => c.redirect('/service', 301))

app.get('/rnd', (c) => c.html(v2Rnd()))
app.get('/rnd/lab', (c) => c.redirect('/rnd', 301))
app.get('/rnd/activities', (c) => c.redirect('/rnd', 301))

app.get('/newsroom', async (c) => {
  const anns = await c.env.itmoou_db
    .prepare('SELECT id, number, category, title, notice_date FROM announcements ORDER BY number DESC LIMIT 10')
    .all<AnnouncementRow>()
    .then(r => r.results)
    .catch(() => [] as AnnouncementRow[])
  return c.html(v2Newsroom(anns))
})

// Careers - 한 장(채용 사이트로 가는 단추 포함). 메뉴 「인재영입」의 목적지가 정상 페이지(200)가 되게 - 전엔 302 로 밖으로 보내 수집기가 확인 못 함.
app.get('/careers', async (c) => {
  return c.html(v2Careers(await fetchJobsUrl(c.env.itmoou_db)))
})

// 안내 글 - 하는 일을 글로(제목 · 소제목 닻 · 목차 · 게시일 · 저자)
app.get('/guide', (c) => c.html(v2GuideIndex()))
app.get('/guide/:slug{[a-z0-9-]+}', (c) => {
  const html = v2Guide(c.req.param('slug'))
  return html ? c.html(html) : c.notFound()
})
app.get('/careers/talent', (c) => c.redirect('/careers', 301))

// Privacy Policy page
app.get('/privacy-policy', (c) => {
  return c.html(v2Privacy())
})

// 문의 (신규 경로) - 기존 스팸 방어 파이프라인 재사용
app.get('/contact', async (c) => {
  const formToken = c.env.FORM_SECRET ? await generateFormToken(c.env.FORM_SECRET) : ''
  return c.html(v2Contact({ formToken }))
})

app.post('/contact', async (c) => {
  const ip = c.req.header('CF-Connecting-IP') || ''
  const body = await c.req.formData()
  const honeypot = (body.get('_hp') as string) || ''
  const formToken = (body.get('_t') as string) || ''
  const company = (body.get('company') as string)?.trim() || ''
  const name = (body.get('name') as string)?.trim() || ''
  const email = (body.get('email') as string)?.trim() || ''
  const phone = (body.get('phone') as string)?.trim() || ''
  const inquiry_type = (body.get('inquiry_type') as string)?.trim() || ''
  const rawMessage = (body.get('message') as string)?.trim() || ''
  const message = company ? `[회사] ${company}\n\n${rawMessage}` : rawMessage

  if (honeypot) {
    await logSpam(c.env.itmoou_db, ip, email, 'honeypot')
    return c.html(v2Contact({ success: true }))
  }

  const tokenCheck = await verifyFormToken(formToken, c.env.FORM_SECRET)
  if (tokenCheck.blocked) {
    await logSpam(c.env.itmoou_db, ip, email, tokenCheck.reason || 'invalid_token')
    return c.html(v2Contact({ success: true }))
  }

  if (await checkRateLimit(c.env.itmoou_db, ip)) {
    await logSpam(c.env.itmoou_db, ip, email, 'rate_limit')
    return c.html(v2Contact({ success: true }))
  }

  const emailDomain = email.split('@')[1]?.toLowerCase() || ''
  if (DISPOSABLE_DOMAINS.has(emailDomain) || isSuspiciousEmail(email)) {
    await logSpam(c.env.itmoou_db, ip, email, DISPOSABLE_DOMAINS.has(emailDomain) ? 'disposable_email' : 'suspicious_email')
    return c.html(v2Contact({ success: true }))
  }

  if (!name || !email || !inquiry_type || !rawMessage) {
    return c.html(v2Contact({ error: '필수 항목을 모두 입력해주세요.' }))
  }

  const ticketNo = generateTrackingId()
  await c.env.itmoou_db.prepare(
    'INSERT INTO contact_submissions (name, email, phone, inquiry_type, message, lang, ticket_no, ip) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(name, email, phone, inquiry_type, message, 'ko', ticketNo, ip).run()

  await sendContactEmail(c.env.RESEND_API_KEY, { name, email, phone, inquiry_type, message, lang: 'ko', ticketNo })
  if (c.env.TEAMS_WEBHOOK_URL) await sendTeamsNotification(c.env.TEAMS_WEBHOOK_URL, { name, email, phone, inquiry_type, message, ticketNo, lang: 'ko', created_at: new Date().toISOString() })

  return c.html(v2Contact({ success: true, ticketNo }))
})

// 구 지원센터 경로 → 문의
app.get('/support/customer', (c) => c.redirect('/contact', 301))
app.get('/support/contact', (c) => c.redirect('/contact', 301))
// 구 폼에서 들어오는 POST는 새 문의로 안내
app.post('/support/contact', (c) => c.redirect('/contact', 301))

// 영문 사이트 제거(기획안 D-2 확정): 전 경로 국문으로 301
app.get('/en', (c) => c.redirect('/', 301))
app.get('/en/*', (c) => c.redirect('/', 301))

app.get('/robots.txt', (c) => {
  return c.text(`User-agent: *
Allow: /
Disallow: /admin/

Sitemap: https://itmoou.com/sitemap.xml`)
})

app.get('/sitemap.xml', (c) => {
  const base = 'https://itmoou.com'
  // lastmod = 그 페이지 글이 마지막으로 바뀐 날(빌드마다 오늘로 찍지 않는다). 처리방침은 부칙 개정일.
  const pages: [string, string][] = [
    ['/', '2026-11-26'], ['/company', '2026-11-26'], ['/service', '2026-11-26'], ['/rnd', '2026-11-26'],
    ['/newsroom', '2026-11-26'], ['/contact', '2026-11-26'], ['/announcements', '2026-11-26'], ['/privacy-policy', '2026-07-30'],
    ['/guide', '2026-11-26'], ...GUIDES.map((g): [string, string] => [`/guide/${g.slug}`, g.dateModified]), ['/careers', '2026-11-26'],
  ]
  const urls = pages.map(([p, d]) =>
    `<url><loc>${base}${p}</loc><lastmod>${d}</lastmod><changefreq>weekly</changefreq><priority>${p === '/' ? '1.0' : '0.8'}</priority></url>`
  ).join('\n  ')
  return c.body(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls}
</urlset>`, 200, { 'Content-Type': 'application/xml' })
})

// GEO: AI 안내 파일과 마크다운 대응본(화면 HTML 을 그대로 변환 - 별도 원고 없음)
app.get('/llms.txt', (c) => c.text(llmsTxt(), 200, { 'Content-Type': 'text/plain; charset=utf-8' }))
app.get('/.md', async (c) => {
  const md = await pageMarkdown(c, '/')
  return md ? c.text(md, 200, { 'Content-Type': 'text/markdown; charset=utf-8' }) : c.notFound()
})

async function pageMarkdown(c: any, path: string): Promise<string | null> {
  const res = await app.request(path, undefined, c.env)
  if (res.status !== 200) return null
  const html = await res.text()
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '아이티무유'
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || ''
  return htmlToMarkdown(html, path, title, desc)
}

app.get('/llms-full.txt', async (c) => {
  const parts: string[] = []
  for (const p of ['/', '/company', '/service', '/rnd', '/guide', ...GUIDES.map((g) => `/guide/${g.slug}`), '/careers', '/newsroom', '/contact', '/privacy-policy']) {
    const md = await pageMarkdown(c, p)
    if (md) parts.push(md)
  }
  return c.text(parts.join('\n\n---\n\n'), 200, { 'Content-Type': 'text/markdown; charset=utf-8' })
})

app.get('/guide/:file{[a-z0-9-]+\\.md}', async (c) => {
  const md = await pageMarkdown(c, `/guide/${c.req.param('file').replace(/\.md$/, '')}`)
  return md ? c.text(md, 200, { 'Content-Type': 'text/markdown; charset=utf-8' }) : c.notFound()
})

app.get('/announcements/:file{[0-9]+\\.md}', async (c) => {
  const md = await pageMarkdown(c, `/announcements/${c.req.param('file').replace(/\.md$/, '')}`)
  return md ? c.text(md, 200, { 'Content-Type': 'text/markdown; charset=utf-8' }) : c.notFound()
})

app.get('/:file{[a-z0-9-]+\\.md}', async (c) => {
  const slug = c.req.param('file').replace(/\.md$/, '')
  const md = await pageMarkdown(c, slug === 'index' ? '/' : `/${slug}`)
  return md ? c.text(md, 200, { 'Content-Type': 'text/markdown; charset=utf-8' }) : c.notFound()
})

// 공고 라우트 (공개)
app.route('/announcements', announcements)
app.route('/en/announcements', announcementsEn)

// 관리자 라우트 (비공개)
app.route('/admin', admin)

// Solution feature image API (public)
app.get('/api/solution-feature/:id/image', async (c) => {
  const id = parseInt(c.req.param('id'))
  const feature = await c.env.itmoou_db.prepare('SELECT image_key FROM solution_features WHERE id = ?')
    .bind(id).first<{image_key: string}>().catch(() => null)
  if (!feature?.image_key || feature.image_key.startsWith('/')) return c.notFound()
  const obj = await c.env.itmoou_files.get(feature.image_key)
  if (!obj) return c.notFound()
  return new Response(obj.body as ReadableStream, {
    headers: {
      'Content-Type': obj.httpMetadata?.contentType ?? 'image/jpeg',
      'Cache-Control': 'public, max-age=86400',
    },
  })
})

// Page image API (public)
app.get('/api/page-image/:page/:key', async (c) => {
  const { page, key } = c.req.param()
  const db = c.env.itmoou_db
  const record = await db.prepare('SELECT content FROM page_sections WHERE page = ? AND section_key = ?')
    .bind(page, key).first<{content: string}>().catch(() => null)
  if (!record?.content) return c.notFound()
  const obj = await c.env.itmoou_files.get(record.content)
  if (!obj) return c.notFound()
  return new Response(obj.body as ReadableStream, {
    headers: {
      'Content-Type': obj.httpMetadata?.contentType ?? 'image/jpeg',
      'Cache-Control': 'public, max-age=3600',
    },
  })
})

// API routes
app.get('/api/hello', (c) => {
  return c.json({ message: 'Hello from ITMoou API!' })
})

// ── 고객 답장 수신 웹훅 (Power Automate → cs@itmoou.com 수신 시 호출) ──
app.post('/api/inbound-reply', async (c) => {
  const secret = c.req.query('secret') || c.req.header('X-Webhook-Secret')
  if (!secret || secret !== c.env.ADMIN_PASSWORD) {
    return c.json({ error: 'unauthorized' }, 401)
  }

  let body: any
  try { body = await c.req.json() } catch { return c.json({ error: 'invalid json' }, 400) }

  const { ticket_no, from_email, from_name, subject, body: emailBody } = body
  if (!ticket_no || !from_email) return c.json({ error: 'missing fields: ticket_no, from_email' }, 400)

  const db = c.env.itmoou_db
  const contact = await db.prepare('SELECT id, status FROM contact_submissions WHERE ticket_no = ?')
    .bind(String(ticket_no)).first<{id:number; status:string}>()

  await db.prepare(
    'INSERT INTO customer_replies (contact_id, ticket_no, from_email, from_name, subject, body) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(contact?.id ?? null, String(ticket_no), String(from_email), String(from_name || ''), String(subject || ''), String(emailBody || '')).run()

  // 미처리 상태면 처리중으로 자동 전환
  if (contact && contact.status === 'new') {
    await db.prepare("UPDATE contact_submissions SET status = 'in_progress' WHERE id = ?").bind(contact.id).run()
  }

  return c.json({ success: true, contact_id: contact?.id ?? null })
})

// Helper functions for HTML templates
function getHeader(lang: Language = 'ko') {
  const t = getTranslation(lang)
  const currentPath = lang === 'en' ? '/en' : ''
  const homePath = lang === 'en' ? '/en' : '/'
  
  return `
    <header class="header">
      <div class="header-container">
        <a href="${homePath}" class="logo">
          <img src="/images/logo.png" alt="ITMoou" style="height: 80px;">
        </a>
        <button class="mobile-menu-toggle" aria-label="Toggle menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <nav class="mobile-nav">
          <div class="mobile-nav-header">
            <div class="mobile-nav-actions">
              <a href="#" class="mobile-language-toggle">
                <i class="fas fa-globe"></i>
              </a>
              <button class="mobile-menu-close" aria-label="Close menu">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="mobile-language-dropdown">
              <a href="${lang === 'en' ? '/' : ''}" class="mobile-language-item ${lang === 'ko' ? 'active' : ''}">🇰🇷 한국어</a>
              <a href="${lang === 'ko' ? '/en' : ''}" class="mobile-language-item ${lang === 'en' ? 'active' : ''}">🇺🇸 English</a>
            </div>
          </div>
          <ul class="main-nav">
            <li class="nav-item">
              <a href="${currentPath}/company" class="nav-link">${t.nav.company}</a>
              <div class="dropdown">
                <a href="${currentPath}/company" class="dropdown-item">${t.nav.companyInfo}</a>
                <a href="${currentPath}/company/ceo" class="dropdown-item">${t.nav.ceoMessage}</a>
                <a href="${currentPath}/company/news" class="dropdown-item">${t.nav.companyNews}</a>
                <a href="${currentPath}/announcements" class="dropdown-item">${t.nav.announcements}</a>
                <a href="${currentPath}/company/history" class="dropdown-item">${t.nav.history}</a>
                <a href="${currentPath}/company/esg" class="dropdown-item">${t.nav.esg}</a>
                <a href="${currentPath}/company/location" class="dropdown-item">${t.nav.location}</a>
              </div>
            </li>
            <li class="nav-item">
              <a href="${currentPath}/solutions/loginexio" class="nav-link">${t.nav.solutions}</a>
              <div class="dropdown">
                <a href="${currentPath}/solutions/loginexio" class="dropdown-item">${t.nav.logiNexio}</a>
                <a href="${currentPath}/solutions/bizsupport" class="dropdown-item">${t.nav.bizSupport}</a>
              </div>
            </li>
            <li class="nav-item">
              <a href="${currentPath}/rnd/lab" class="nav-link">${t.nav.rd}</a>
              <div class="dropdown">
                <a href="${currentPath}/rnd/lab" class="dropdown-item">${t.nav.lab}</a>
                <a href="${currentPath}/rnd/activities" class="dropdown-item">${t.nav.rdActivity}</a>
              </div>
            </li>
            <li class="nav-item">
              <a href="${currentPath}/careers/talent" class="nav-link">${t.nav.careers}</a>
              <div class="dropdown">
                <a href="${currentPath}/careers/talent" class="dropdown-item">${t.nav.talent}</a>
                <a href="${currentPath}/careers" class="dropdown-item" target="_blank" rel="noopener noreferrer">${t.nav.jobs}</a>
              </div>
            </li>
            <li class="nav-item">
              <a href="${currentPath}/support/customer" class="nav-link">${t.nav.support}</a>
              <div class="dropdown">
                <a href="${currentPath}/support/customer" class="dropdown-item">${t.nav.customer}</a>
                <a href="${currentPath}/support/contact" class="dropdown-item">${t.nav.contact}</a>
              </div>
            </li>
            <li class="nav-item language-switcher">
              <a href="#" class="nav-link"><i class="fas fa-globe"></i></a>
              <div class="dropdown">
                <a href="${lang === 'en' ? '/' : ''}" class="dropdown-item ${lang === 'ko' ? 'active' : ''}">🇰🇷 한국어</a>
                <a href="${lang === 'ko' ? '/en' : ''}" class="dropdown-item ${lang === 'en' ? 'active' : ''}">🇺🇸 English</a>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  `
}

function getFooter(lang: Language = 'ko') {
  const t = getTranslation(lang)
  const currentPath = lang === 'en' ? '/en' : ''
  
  return `
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-content">
          <div class="footer-section footer-logo">
            <img src="/images/footericon.png" alt="ITMoou" style="height: 90px; margin-bottom: 1.5rem;">
            <p class="footer-main-info">${t.footer.phone}<br><span class="footer-phone">043.715.8553</span></p>
            <p class="footer-copyright">${t.footer.copyright}</p>
          </div>
          <div class="footer-section footer-info">
            <p class="footer-small">${t.footer.ceo} : ${t.footer.ceoName}<br>
            ${t.footer.privacyOfficer} : ${t.footer.ceoName}<br>
            <a href="${currentPath}/privacy-policy" class="footer-link">${t.footer.privacyPolicy}</a></p>
            <p class="footer-address">${t.location.addressDetail}<br>
            ${t.footer.businessNumber} : 229-81-43410<br>
            ${t.footer.email} <a href="mailto:sales@itmoou.com" class="footer-link">sales@itmoou.com</a></p>
            <div class="social-links" style="margin-top: 2rem;">
              <a href="https://www.instagram.com/itmoou/" target="_blank" rel="noopener noreferrer" class="social-link" title="Instagram"><i class="fab fa-instagram"></i></a>
              <a href="https://www.linkedin.com/in/moou-it-6414573a8/" target="_blank" rel="noopener noreferrer" class="social-link" title="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
              <a href="https://www.youtube.com/@%EC%95%84%EC%9D%B4%ED%8B%B0%EB%AC%B4%EC%9C%A0" target="_blank" rel="noopener noreferrer" class="social-link" title="YouTube"><i class="fab fa-youtube"></i></a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `
}

function getBaseHTML(title: string, content: string, bodyClass: string = '', lang: Language = 'ko', desc?: string, canonicalPath?: string, seoOverrideTitle?: string, seoOverrideDesc?: string) {
  const pageTitle = seoOverrideTitle || (title ? `${title} | ITMoou` : 'ITMoou')
  const defaultDesc = lang === 'en'
    ? 'ITMoou provides enterprise SaaS solutions for global logistics (LogiNexio) and business management (BizSupport Pro).'
    : 'ITMoou는 글로벌 물류 SaaS 솔루션 LogiNexio와 경영지원 AI 솔루션 BizSupport Pro를 제공하는 기업 소프트웨어 전문 기업입니다.'
  const metaDesc = seoOverrideDesc || desc || defaultDesc
  const base = 'https://itmoou.com'
  const canonicalUrl = canonicalPath
    ? `${base}${lang === 'en' ? '/en' : ''}${canonicalPath}`
    : null
  const altKo = canonicalPath ? `${base}${canonicalPath}` : null
  const altEn = canonicalPath ? `${base}/en${canonicalPath}` : null

  return `
    <!DOCTYPE html>
    <html lang="${lang === 'en' ? 'en' : 'ko'}">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${pageTitle}</title>
        <meta name="description" content="${metaDesc}">
        <meta property="og:title" content="${pageTitle}">
        <meta property="og:description" content="${metaDesc}">
        <meta property="og:type" content="website">
        <meta property="og:image" content="${base}/images/og-image.jpg">
        <meta property="og:locale" content="${lang === 'en' ? 'en_US' : 'ko_KR'}">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="${pageTitle}">
        <meta name="twitter:description" content="${metaDesc}">
        ${canonicalUrl ? `<link rel="canonical" href="${canonicalUrl}">` : ''}
        ${altKo ? `<link rel="alternate" hreflang="ko" href="${altKo}">` : ''}
        ${altEn ? `<link rel="alternate" hreflang="en" href="${altEn}">` : ''}
        ${altKo ? `<link rel="alternate" hreflang="x-default" href="${altKo}">` : ''}
        <meta name="google-site-verification" content="KhGq0NfIOoXgDx4WuQvY1oDfxoRarwb01z1TRYDUYrQ">
        <meta name="naver-site-verification" content="891252343b02692b4a90f8d07ad88ce500e77512">
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon">
        <link rel="icon" href="/favicon.ico" type="image/x-icon">
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png">
        <link rel="apple-touch-icon" href="/favicon-96x96.png">
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet">
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/styles.css" rel="stylesheet">
    </head>
    <body${bodyClass ? ` class="${bodyClass}"` : ''}>
        ${getHeader(lang)}
        ${content}
        ${getFooter(lang)}
        <script src="/static/app.js"></script>
    </body>
    </html>
  `
}

function getMainHTML(lang: Language = 'ko', news: NewsItem[] = [], slides: SlideItem[] = [], seoSections: Record<string, string> = {}) {
  const t = getTranslation(lang)
  const seoTitle = seoSections['seo_title'] || undefined
  const seoDesc = seoSections['seo_description'] || undefined
  const slideItems = slides.length > 0 ? slides : [
    { id: 0, order_num: 0, title: t.home.slide1Title, description: t.home.slide1Desc, title_en: t.home.slide1Title, description_en: t.home.slide1Desc, image_filename: 'slide1.jpg', active: 1 },
    { id: 1, order_num: 1, title: t.home.slide2Title, description: t.home.slide2Desc, title_en: t.home.slide2Title, description_en: t.home.slide2Desc, image_filename: 'slide2.jpg', active: 1 },
    { id: 2, order_num: 2, title: t.home.slide3Title, description: t.home.slide3Desc, title_en: t.home.slide3Title, description_en: t.home.slide3Desc, image_filename: 'slide3.jpg', active: 1 },
  ]
  const slidesHTML = slideItems.map((s, i) => {
    const slideTitle = (lang === 'en' && s.title_en) ? s.title_en : s.title
    const slideDesc = (lang === 'en' && s.description_en) ? s.description_en : s.description
    return `
    <div class="slide ${i === 0 ? 'active' : ''}">
      <img src="/images/${s.image_filename}" alt="ITMoou Slide ${i + 1}">
      <div class="slide-content">
        <h2>${slideTitle}</h2>
        <p>${slideDesc}</p>
      </div>
    </div>`}).join('')
  const dotsHTML = slideItems.map((_, i) => `<span class="slider-dot ${i === 0 ? 'active' : ''}"></span>`).join('')

  const newsItems = news.length > 0 ? news.slice(0, 6) : []
  const newsHTML = newsItems.map(n => {
    const title = (lang === 'en' && n.title_en) ? n.title_en : n.title
    const description = (lang === 'en' && n.description_en) ? n.description_en : n.description
    return `
    <div style="padding: 1.5rem; border: 1px solid #e0e0e0; border-radius: 8px; transition: all 0.3s; cursor: pointer;">
      <h3 style="color: #0052A5; margin-bottom: 0.5rem; font-size: 1.1rem;">${title}</h3>
      <p style="color: #666; line-height: 1.6; font-size: 0.95rem;">${description}</p>
      <p style="color: #999; font-size: 0.85rem; margin-top: 1rem;">${n.date}</p>
    </div>`}).join('')

  return getBaseHTML(t.home.title, `
    <div class="main-slider">
      <div class="slider-container">
        ${slidesHTML}
      </div>
      <div class="slider-controls">
        ${dotsHTML}
      </div>
    </div>

    <section class="content-section" style="background: #f9f9f9;">
      <div class="section-header">
        <h2 class="section-title">${t.home.whyUs}</h2>
        <p class="section-subtitle">${t.home.whyUsSubtitle}</p>
      </div>
      <div class="grid-3">
        <div class="card">
          <div class="card-content">
            <h3 class="card-title"><i class="fas fa-microchip" style="color: #0052A5; margin-right: 0.5rem;"></i>${t.home.advancedTech}</h3>
            <p class="card-text">${t.home.advancedTechDesc}</p>
          </div>
        </div>
        <div class="card">
          <div class="card-content">
            <h3 class="card-title"><i class="fas fa-headset" style="color: #0052A5; margin-right: 0.5rem;"></i>${t.home.expertSupport}</h3>
            <p class="card-text">${t.home.expertSupportDesc}</p>
          </div>
        </div>
        <div class="card">
          <div class="card-content">
            <h3 class="card-title"><i class="fas fa-globe" style="color: #0052A5; margin-right: 0.5rem;"></i>${t.home.globalNetwork}</h3>
            <p class="card-text">${t.home.globalNetworkDesc}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="content-section">
      <div class="section-header">
        <h2 class="section-title">${t.home.ourSolutions}</h2>
        <p class="section-subtitle">${t.home.ourSolutionsSubtitle}</p>
      </div>
      <div class="grid-3">
        <div class="card">
          <div class="card-content">
            <h3 class="card-title">LogiNexio</h3>
            <p class="card-text">${t.home.logiNexioDesc}</p>
            <a href="${getLocalizedPath('/solutions/loginexio', lang)}" style="color: #0052A5; text-decoration: none;">${t.home.learnMore}</a>
          </div>
        </div>
        <div class="card">
          <img src="/images/bizsupport.jpg" alt="BizSupport Pro" class="card-image" style="display: none;">
          <div class="card-content">
            <h3 class="card-title">BizSupport Pro</h3>
            <p class="card-text">${t.home.bizSupportDesc}</p>
            <a href="${getLocalizedPath('/solutions/bizsupport', lang)}" style="color: #0052A5; text-decoration: none;">${t.home.learnMore}</a>
          </div>
        </div>
      </div>
    </section>

    <section style="background: linear-gradient(135deg, #0052A5 0%, #003366 100%); color: white; max-width: 1400px; margin: 0 auto; padding: 4rem 2rem 10rem 2rem;">
      <div class="section-header">
        <h2 class="section-title" style="color: white;">${t.home.successStories}</h2>
        <p class="section-subtitle" style="color: rgba(255,255,255,0.9);">${t.home.successStoriesSubtitle}</p>
      </div>
      <div class="grid-3">
        <div class="card">
          <div class="card-content">
            <h3 class="card-title">${t.home.successCase1Title}</h3>
            <p class="card-text">${t.home.successCase1Desc}</p>
            <p style="margin-top: 1rem; color: #666; font-size: 0.9rem;">${t.home.successCase1Role}</p>
          </div>
        </div>
        <div class="card">
          <div class="card-content">
            <h3 class="card-title">${t.home.successCase2Title}</h3>
            <p class="card-text">${t.home.successCase2Desc}</p>
            <p style="margin-top: 1rem; color: #666; font-size: 0.9rem;">${t.home.successCase2Role}</p>
          </div>
        </div>
        <div class="card">
          <div class="card-content">
            <h3 class="card-title">${t.home.successCase3Title}</h3>
            <p class="card-text">${t.home.successCase3Desc}</p>
            <p style="margin-top: 1rem; color: #666; font-size: 0.9rem;">${t.home.successCase3Role}</p>
          </div>
        </div>
      </div>
      <div class="text-center mt-4">
        <a href="${getLocalizedPath('/support/contact', lang)}" style="display: inline-block; padding: 1rem 2rem; background: white; color: #0052A5; text-decoration: none; border-radius: 4px; font-weight: bold; transition: all 0.3s;">${t.home.visitSupport}</a>
      </div>
    </section>

    <section class="content-section" style="background: white; padding: 4rem 2rem;">
      <div class="section-header">
        <h2 class="section-title">${t.home.companyNewsTitle}</h2>
        <p class="section-subtitle">${t.home.companyNewsSubtitle}</p>
      </div>
      <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
        ${newsHTML}
      </div>
      <div class="text-center mt-4" style="margin-top: 2rem;">
        <a href="/company/news" style="display: inline-block; padding: 1rem 2rem; background: #0052A5; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; transition: all 0.3s;">${t.home.viewMore}</a>
      </div>
    </section>
  `, 'home-page', lang, undefined, '/', seoTitle, seoDesc)
}

function getCompanyHTML(lang: Language = 'ko', sections: Record<string, string> = {}) {
  const t = getTranslation(lang)
  const s = (key: string, fallback: string) => (lang === 'en' ? sections[key + '_en'] : sections[key]) || fallback
  const seoTitle = sections['seo_title'] || undefined
  const seoDesc = sections['seo_description'] || undefined
  const aboutImageKey = sections['about_image'] || ''
  const aboutImageHTML = aboutImageKey
    ? `<div style="max-width:900px;margin:1.5rem auto 0;"><img src="/api/page-image/company/about_image" alt="회사 소개 이미지" style="width:100%;border-radius:10px;object-fit:cover;max-height:400px;"></div>`
    : ''
  return getBaseHTML(t.company.title, `
    <div style="margin-top: 80px;">
      <section style="background: linear-gradient(135deg, #0052A5 0%, #003366 100%); color: white; padding: 4rem 2rem; text-align: center;">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">${t.company.title}</h1>
        <p style="font-size: 1.2rem;">${s('subtitle', t.company.subtitle)}</p>
      </section>

      <section class="content-section">
        <div class="section-header">
          <h2 class="section-title">${s('about_title', t.company.aboutTitle)}</h2>
        </div>
        <div style="max-width: 900px; margin: 0 auto; line-height: 1.8; color: #666;">
          <p style="margin-bottom: 1.5rem;">
            ${s('about_intro', t.company.aboutIntro)}
          </p>
          <p style="margin-bottom: 1.5rem;">
            ${s('about_desc', t.company.aboutDesc)}
          </p>
        </div>
        ${aboutImageHTML}
      </section>

      <section class="content-section" style="background: #f9f9f9;">
        <div class="grid-3">
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-eye"></i> ${t.company.visionTitle}</h3>
              <p class="card-text">${s('vision_desc', t.company.visionDesc)}</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-bullseye"></i> ${t.company.missionTitle}</h3>
              <p class="card-text">${s('mission_desc', t.company.missionDesc)}</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-heart"></i> ${t.company.coreValuesTitle}</h3>
              <p class="card-text">${s('core_values_desc', t.company.coreValuesDesc)}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `, '', lang, undefined, '/company', seoTitle, seoDesc)
}

function getCEOHTML(lang: Language = 'ko', sections: Record<string, string> = {}) {
  const t = getTranslation(lang)
  const s = (key: string, fallback: string) => (lang === 'en' ? sections[key + '_en'] : sections[key]) || fallback
  const seoTitle = sections['seo_title'] || undefined
  const seoDesc = sections['seo_description'] || undefined
  return getBaseHTML(t.ceo.title, `
    <div style="margin-top: 80px;">
      <section style="background: linear-gradient(135deg, #0052A5 0%, #003366 100%); color: white; padding: 4rem 2rem; text-align: center;">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">${t.ceo.title}</h1>
        <p style="font-size: 1.2rem;">${t.ceo.subtitle}</p>
      </section>

      <section class="content-section">
        <div style="max-width: 1000px; margin: 0 auto;">
          <div style="display: flex; gap: 3rem; align-items: flex-start;">
            <div style="flex: 1; line-height: 1.8; color: #666;">
              <p style="margin-bottom: 1.5rem; font-size: 1.1rem;">
                ${s('message1', t.ceo.message1)}
              </p>
              <p style="margin-bottom: 1.5rem;">
                ${s('message2', t.ceo.message2)}
              </p>
              <p style="margin-bottom: 1.5rem;">
                ${s('message3', t.ceo.message3)}
              </p>
              <p style="margin-bottom: 1.5rem;">
                ${s('message4', t.ceo.message4)}
              </p>
              <p style="margin-bottom: 1.5rem;">
                ${s('message5', t.ceo.message5)}
              </p>
              <p style="margin-bottom: 1.5rem;">
                ${s('message6', t.ceo.message6)}
              </p>
              <p style="margin-top: 3rem;">
                <strong style="color: #0052A5; font-size: 1.2rem;">${s('signature', t.ceo.signature)}</strong>
              </p>
            </div>
            <div style="flex: 0 0 250px; text-align: center;">
              <img src="/images/ceo.jpg" alt="${t.ceo.ceoName}" style="width: 100%; border-radius: 10px; object-fit: cover; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h3 style="font-size: 1.2rem; color: #0052A5; margin-top: 1rem;">${t.ceo.name}</h3>
              <p style="color: #666; font-size: 0.9rem;">${t.ceo.ceoTitle}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `, '', lang, undefined, '/company/ceo', seoTitle, seoDesc)
}

function getHistoryHTML(lang: Language = 'ko', historyItems: HistoryItem[] = []) {
  const t = getTranslation(lang)
  // 연도별 그룹핑
  const grouped: Record<string, string[]> = {}
  for (const item of historyItems) {
    if (!grouped[item.year]) grouped[item.year] = []
    const content = (lang === 'en' && item.content_en) ? item.content_en : item.content
    grouped[item.year].push(content)
  }
  const years = Object.keys(grouped).sort((a, b) => parseInt(b) - parseInt(a))
  const historyHTML = years.map(year => `
    <div style="margin-bottom: 3rem;">
      <h3 style="color: #0052A5; font-size: 1.8rem; margin-bottom: 0.5rem;">${year}</h3>
      <ul style="list-style: none; padding: 0; color: #666; line-height: 2;">
        ${grouped[year].map(c => `<li>• ${c}</li>`).join('')}
      </ul>
    </div>`).join('')

  return getBaseHTML(t.history.title, `
    <div style="margin-top: 80px;">
      <section style="background: linear-gradient(135deg, #0052A5 0%, #003366 100%); color: white; padding: 4rem 2rem; text-align: center;">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">${t.history.title}</h1>
        <p style="font-size: 1.2rem;">${t.history.subtitle}</p>
      </section>
      <section class="content-section">
        <div style="max-width: 900px; margin: 0 auto;">
          <div style="border-left: 3px solid #0052A5; padding-left: 2rem;">
            ${historyHTML}
          </div>
        </div>
      </section>
    </div>
  `, '', lang)
}

function getESGHTML(lang: Language = 'ko', sections: Record<string, string> = {}) {
  const t = getTranslation(lang)
  const s = (key: string, fallback: string) => (lang === 'en' ? sections[key + '_en'] : sections[key]) || fallback
  const seoTitle = sections['seo_title'] || undefined
  const seoDesc = sections['seo_description'] || undefined
  return getBaseHTML(t.esg.title, `
    <div style="margin-top: 80px;">
      <section style="background: linear-gradient(135deg, #0052A5 0%, #003366 100%); color: white; padding: 4rem 2rem; text-align: center;">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">${t.esg.title}</h1>
        <p style="font-size: 1.2rem;">${t.esg.subtitle}</p>
      </section>

      <section class="content-section">
        <div class="grid-3">
          <div class="card">
            <div class="card-content">
              <h3 class="card-title" style="color: #00A651;"><i class="fas fa-leaf"></i> ${s('env_title', t.esg.environmentTitle)}</h3>
              <p class="card-text">${s('env_desc', t.esg.environmentDesc)}</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title" style="color: #0052A5;"><i class="fas fa-users"></i> ${s('social_title', t.esg.socialTitle)}</h3>
              <p class="card-text">${s('social_desc', t.esg.socialDesc)}</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title" style="color: #FF6B00;"><i class="fas fa-balance-scale"></i> ${s('gov_title', t.esg.governanceTitle)}</h3>
              <p class="card-text">${s('gov_desc', t.esg.governanceDesc)}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `, '', lang, undefined, '/company/esg', seoTitle, seoDesc)
}

function getLocationHTML(lang: Language = 'ko', sections: Record<string, string> = {}) {
  const t = getTranslation(lang)
  const s = (key: string, fallback: string) => (lang === 'en' ? sections[key + '_en'] : sections[key]) || fallback
  const seoTitle = sections['seo_title'] || undefined
  const seoDesc = sections['seo_description'] || undefined
  const defaultMapEmbed = `<div id="daumRoughmapContainer1769348918868" class="root_daum_roughmap root_daum_roughmap_landing" style="width: 100%;"></div>
              <script charset="UTF-8" class="daum_roughmap_loader_script" src="https://ssl.daumcdn.net/dmaps/map_js_init/roughmapLoader.js"></script>
              <script charset="UTF-8">
                new daum.roughmap.Lander({
                  "timestamp" : "1769348918868",
                  "key" : "gmuvtvo88pm",
                  "mapWidth" : "100%",
                  "mapHeight" : "400"
                }).render();
              </script>`
  const mapEmbed = sections['map_embed'] || defaultMapEmbed
  return getBaseHTML(t.location.title, `
    <div style="margin-top: 80px;">
      <section style="background: linear-gradient(135deg, #0052A5 0%, #003366 100%); color: white; padding: 4rem 2rem; text-align: center;">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">${t.location.title}</h1>
        <p style="font-size: 1.2rem;">${t.location.subtitle}</p>
      </section>

      <section class="content-section">
        <div style="max-width: 1200px; margin: 0 auto;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: start;">
            <!-- 왼쪽: 정보 -->
            <div>
              <div style="margin-bottom: 3rem;">
                <h3 style="color: #0052A5; font-size: 1.5rem; margin-bottom: 1rem;"><i class="fas fa-map-marker-alt"></i> ${t.location.address}</h3>
                <p style="color: #666; line-height: 1.8;">
                  ${s('address_detail', t.location.addressDetail)}
                </p>
              </div>

              <div style="margin-bottom: 3rem;">
                <h3 style="color: #0052A5; font-size: 1.5rem; margin-bottom: 1rem;"><i class="fas fa-phone"></i> ${t.location.contact}</h3>
                <p style="color: #666; line-height: 1.8;">
                  ${t.location.phone}: ${s('phone', '043.715.8553')}<br>
                  ${t.location.email}: ${s('email', 'cs@itmoou.com')}
                </p>
              </div>

              <div>
                <h3 style="color: #0052A5; font-size: 1.5rem; margin-bottom: 1rem;"><i class="fas fa-car"></i> ${t.location.byCar}</h3>
                <p style="color: #666; line-height: 1.8;">
                  ${s('car_direction', t.location.carDirection)}<br>
                  ${s('parking', t.location.parking)}
                </p>
              </div>
            </div>

            <!-- 오른쪽: 카카오맵 -->
            <div style="border: 3px solid #0052A5; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
              ${mapEmbed}
            </div>
          </div>
        </div>
      </section>

      <!-- 반응형: 모바일에서는 세로로 배치 -->
      <style>
        @media (max-width: 768px) {
          .content-section > div > div {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
      </style>
    </div>
  `, '', lang, undefined, '/company/location', seoTitle, seoDesc)
}

function getCompanyNewsHTML(lang: Language = 'ko', newsItems: NewsItem[] = []) {
  const t = getTranslation(lang)
  const colors = [
    { bg: 'linear-gradient(135deg, #0052A5 0%, #003366 100%)', icon: 'fa-globe' },
    { bg: 'linear-gradient(135deg, #28a745 0%, #1e7e34 100%)', icon: 'fa-boxes' },
    { bg: 'linear-gradient(135deg, #6f42c1 0%, #4e2a84 100%)', icon: 'fa-file-alt' },
    { bg: 'linear-gradient(135deg, #fd7e14 0%, #c35a00 100%)', icon: 'fa-chart-line' },
    { bg: 'linear-gradient(135deg, #17a2b8 0%, #117a8b 100%)', icon: 'fa-handshake' },
    { bg: 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)', icon: 'fa-trophy' },
    { bg: 'linear-gradient(135deg, #20c997 0%, #17a2b8 100%)', icon: 'fa-cloud' },
  ]
  const newsHTML = newsItems.map((n, i) => {
    const c = colors[i % colors.length]
    const title = (lang === 'en' && n.title_en) ? n.title_en : n.title
    const description = (lang === 'en' && n.description_en) ? n.description_en : n.description
    return `<div class="news-item" data-title="${title}" style="display: flex; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; transition: all 0.3s;">
      <div style="background: ${c.bg}; min-width: 150px; display: flex; align-items: center; justify-content: center;">
        <i class="fas ${c.icon}" style="font-size: 3rem; color: white;"></i>
      </div>
      <div style="padding: 1.5rem; flex: 1;">
        <h3 style="color: #0052A5; margin-bottom: 0.5rem; font-size: 1.2rem;">${title}</h3>
        <p style="color: #999; font-size: 0.85rem; margin-bottom: 0.8rem;">${n.date}</p>
        <p style="color: #666; line-height: 1.6; font-size: 0.95rem;">${description}</p>
      </div>
    </div>`
  }).join('')

  return getBaseHTML(t.news.title, `
    <div style="margin-top: 80px;">
      <section style="background: linear-gradient(135deg, #0052A5 0%, #003366 100%); color: white; padding: 4rem 2rem; text-align: center;">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">${t.news.title}</h1>
        <p style="font-size: 1.2rem;">${t.news.subtitle}</p>
      </section>

      <section class="content-section">
        <div style="max-width: 900px; margin: 0 auto;">
          <div style="margin-bottom: 2rem;">
            <input type="text" id="searchInput" placeholder="${t.news.searchPlaceholder}" style="width: 100%; padding: 1rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;" onkeyup="filterNews()">
          </div>

          <div id="newsList" style="display: flex; flex-direction: column; gap: 1.5rem;">
            ${newsHTML}
          </div>
        </div>
      </section>
    </div>

    <script>
      function filterNews() {
        const searchValue = document.getElementById('searchInput').value.toLowerCase();
        const newsItems = document.getElementsByClassName('news-item');
        
        for (let item of newsItems) {
          const title = item.getAttribute('data-title').toLowerCase();
          if (title.includes(searchValue)) {
            item.style.display = 'flex';
          } else {
            item.style.display = 'none';
          }
        }
      }
    </script>
  `, '', lang)
}

function renderFeatures(features: SolutionFeature[], lang: Language = 'ko') {
  if (features.length === 0) return ''
  return features.map(f => {
    const imgSrc = f.image_key
      ? (f.image_key.startsWith('/') ? f.image_key : `/api/solution-feature/${f.id}/image`)
      : null
    const reverse = f.image_position === 'left'
    const title = (lang === 'en' && f.title_en) ? f.title_en : f.title
    const description = (lang === 'en' && f.description_en) ? f.description_en : f.description
    return `
    <div style="display:flex;gap:2rem;align-items:center;margin-bottom:3rem;padding:2rem;background:white;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.1);${reverse ? 'flex-direction:row-reverse;' : ''}">
      <div style="flex:1;">
        <h3 style="color:#0052A5;font-size:1.5rem;margin-bottom:1rem;">
          <i class="${f.icon}" style="margin-right:0.5rem;"></i> ${title}
        </h3>
        <p style="color:#666;line-height:1.8;">${description}</p>
      </div>
      ${imgSrc ? `<div style="flex:0 0 250px;"><img src="${imgSrc}" alt="${title}" style="width:100%;border-radius:8px;object-fit:cover;"></div>` : ''}
    </div>`
  }).join('')
}

function getLogiNexioHTML(lang: Language = 'ko', sol: SolutionData | null = null, dbFeatures: SolutionFeature[] = []) {
  const t = getTranslation(lang)
  const subtitle = sol ? ((lang === 'en' && sol.subtitle_en) ? sol.subtitle_en : sol.subtitle) : t.solutions.logiNexioSubtitle
  const description = sol ? ((lang === 'en' && sol.description_en) ? sol.description_en : sol.description) : t.solutions.logiNexioDesc
  return getBaseHTML(t.solutions.logiNexioTitle, `
    <div style="margin-top: 80px;">
      <section style="background: linear-gradient(135deg, #0052A5 0%, #003366 100%); color: white; padding: 4rem 2rem; text-align: center;">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">LogiNexio</h1>
        <p style="font-size: 1.2rem;">${subtitle}</p>
      </section>
      <section class="content-section">
        <div style="max-width: 900px; margin: 0 auto; line-height: 1.8; color: #666; margin-bottom: 3rem;">
          <p style="margin-bottom: 1.5rem; text-align: center; font-size: 1.1rem;">${description}</p>
        </div>
        <div class="section-header">
          <h2 class="section-title">${t.solutions.logiNexioFeatures}</h2>
        </div>
        <div style="max-width: 1000px; margin: 0 auto;">
          ${renderFeatures(dbFeatures, lang)}
        </div>
      </section>
    </div>
  `, '', lang)
}

function getBizSupportHTML(lang: Language = 'ko', sol: SolutionData | null = null, dbFeatures: SolutionFeature[] = []) {
  const t = getTranslation(lang)
  const subtitle = sol ? ((lang === 'en' && sol.subtitle_en) ? sol.subtitle_en : sol.subtitle) : t.solutions.bizSupportSubtitle
  const description = sol ? ((lang === 'en' && sol.description_en) ? sol.description_en : sol.description) : t.solutions.bizSupportDesc
  return getBaseHTML(t.solutions.bizSupportTitle, `
    <div style="margin-top: 80px;">
      <section style="background: linear-gradient(135deg, #0052A5 0%, #003366 100%); color: white; padding: 4rem 2rem; text-align: center;">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">BizSupport Pro</h1>
        <p style="font-size: 1.2rem;">${subtitle}</p>
      </section>
      <section class="content-section">
        <div style="max-width: 900px; margin: 0 auto; line-height: 1.8; color: #666; margin-bottom: 3rem;">
          <p style="margin-bottom: 1.5rem;">${description}</p>
        </div>
        <div class="section-header">
          <h2 class="section-title">${t.solutions.bizSupportFeatures}</h2>
        </div>
        <div style="max-width: 1000px; margin: 0 auto;">
          ${renderFeatures(dbFeatures, lang)}
        </div>
      </section>
    </div>
  `, '', lang)
}

function getLabHTML(lang: Language = 'ko', sections: Record<string, string> = {}) {
  const t = getTranslation(lang)
  const s = (key: string, fallback: string) => (lang === 'en' ? sections[key + '_en'] : sections[key]) || fallback
  const seoTitle = sections['seo_title'] || undefined
  const seoDesc = sections['seo_description'] || undefined
  return getBaseHTML(t.rd.labTitle, `
    <div style="margin-top: 80px;">
      <section style="background: linear-gradient(135deg, #0052A5 0%, #003366 100%); color: white; padding: 4rem 2rem; text-align: center;">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">${t.rd.labTitle}</h1>
        <p style="font-size: 1.2rem;">${t.rd.labSubtitle}</p>
      </section>

      <section class="content-section">
        <div style="max-width: 900px; margin: 0 auto; line-height: 1.8; color: #666;">
          <p style="margin-bottom: 1.5rem;">${s('intro', t.rd.labDesc)}</p>
        </div>

        <div class="grid-3">
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-microscope"></i> ${s('facility_title', t.rd.facilityTitle)}</h3>
              <p class="card-text">${s('facility_desc', t.rd.facilityDesc)}</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-user-graduate"></i> ${s('expert_title', t.rd.expertTitle)}</h3>
              <p class="card-text">${s('expert_desc', t.rd.expertDesc)}</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-handshake"></i> ${s('cooperation_title', t.rd.cooperationTitle)}</h3>
              <p class="card-text">${s('cooperation_desc', t.rd.cooperationDesc)}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `, '', lang, s('intro', t.rd.labDesc), '/rnd/lab', seoTitle, seoDesc)
}

function getActivitiesHTML(lang: Language = 'ko', sections: Record<string, string> = {}) {
  const t = getTranslation(lang)
  const s = (key: string, fallback: string) => (lang === 'en' ? sections[key + '_en'] : sections[key]) || fallback
  const seoTitle = sections['seo_title'] || undefined
  const seoDesc = sections['seo_description'] || undefined
  const actIcons = ['fas fa-truck', 'fas fa-database', 'fas fa-chart-line']
  const actDefaults = [
    [t.rd.logisticsOptTitle, t.rd.logisticsOptDesc],
    [t.rd.bigdataTitle, t.rd.bigdataDesc],
    [t.rd.bizSolutionTitle, t.rd.bizSolutionDesc],
  ]
  const actsHTML = actDefaults.map((d, i) => `
    <div class="card">
      <div class="card-content">
        <h3 class="card-title"><i class="${actIcons[i]}"></i> ${s('act' + (i+1) + '_title', d[0])}</h3>
        <p class="card-text">${s('act' + (i+1) + '_desc', d[1])}</p>
      </div>
    </div>`).join('')
  return getBaseHTML(t.rd.activityTitle, `
    <div style="margin-top: 80px;">
      <section style="background: linear-gradient(135deg, #0052A5 0%, #003366 100%); color: white; padding: 4rem 2rem; text-align: center;">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">${t.rd.activityTitle}</h1>
        <p style="font-size: 1.2rem;">${s('intro', t.rd.activitySubtitle)}</p>
      </section>

      <section class="content-section">
        <div class="section-header">
          <h2 class="section-title">${t.rd.activityFeatures}</h2>
        </div>
        <div class="grid-3">${actsHTML}</div>
      </section>
    </div>
  `, '', lang, s('intro', t.rd.activitySubtitle), '/rnd/activities', seoTitle, seoDesc)
}

function getTalentHTML(lang: Language = 'ko', sections: Record<string, string> = {}) {
  const t = getTranslation(lang)
  const s = (key: string, fallback: string) => (lang === 'en' ? sections[key + '_en'] : sections[key]) || fallback
  const seoTitle = sections['seo_title'] || undefined
  const seoDesc = sections['seo_description'] || undefined
  const currentPath = lang === 'en' ? '/en' : ''
  const icons = ['fas fa-lightbulb', 'fas fa-handshake', 'fas fa-star', 'fas fa-heart', 'fas fa-globe', 'fas fa-graduation-cap']
  const defaults = [
    [t.careers.innovationTitle, t.careers.innovationDesc],
    [t.careers.teamworkTitle, t.careers.teamworkDesc],
    [t.careers.expertiseTitle, t.careers.expertiseDesc],
    [t.careers.responsibilityTitle, t.careers.responsibilityDesc],
    [t.careers.globalTitle, t.careers.globalDesc],
    [t.careers.learningTitle, t.careers.learningDesc],
  ]
  const cardsHTML = defaults.map((d, i) => `
    <div class="card">
      <div class="card-content">
        <h3 class="card-title"><i class="${icons[i]}"></i> ${s('card' + (i+1) + '_title', d[0])}</h3>
        <p class="card-text">${s('card' + (i+1) + '_desc', d[1])}</p>
      </div>
    </div>`).join('')
  return getBaseHTML(t.careers.talentTitle, `
    <div style="margin-top: 80px;">
      <section style="background: linear-gradient(135deg, #0052A5 0%, #003366 100%); color: white; padding: 4rem 2rem; text-align: center;">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">${t.careers.talentTitle}</h1>
        <p style="font-size: 1.2rem;">${t.careers.talentSubtitle}</p>
      </section>

      <section class="content-section">
        <div class="section-header">
          <h2 class="section-title">${t.careers.ourTalent}</h2>
        </div>
        <div class="grid-3">
          ${cardsHTML}
        </div>

        <div style="margin-top: 4rem; text-align: center;">
          <a href="${currentPath}/careers" style="display: inline-block; padding: 1rem 3rem; background: #0052A5; color: white; text-decoration: none; border-radius: 4px; font-size: 1.1rem; font-weight: bold; transition: all 0.3s;">${t.careers.viewJobs}</a>
        </div>
      </section>
    </div>
  `, '', lang, undefined, '/careers/talent', seoTitle, seoDesc)
}

function getCustomerSupportHTML(lang: Language = 'ko', sections: Record<string, string> = {}) {
  const t = getTranslation(lang)
  const s = (key: string, fallback: string) => (lang === 'en' ? sections[key + '_en'] : sections[key]) || fallback
  const seoTitle = sections['seo_title'] || undefined
  const seoDesc = sections['seo_description'] || undefined
  return getBaseHTML(t.support.customerTitle, `
    <div style="margin-top: 80px;">
      <section style="background: linear-gradient(135deg, #0052A5 0%, #003366 100%); color: white; padding: 4rem 2rem; text-align: center;">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">${t.support.customerTitle}</h1>
        <p style="font-size: 1.2rem;">${t.support.customerSubtitle}</p>
      </section>

      <section class="content-section">
        <div class="grid-3">
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-headset"></i> ${s('tech_title', t.support.techSupportTitle)}</h3>
              <p class="card-text">${s('tech_desc', t.support.techSupportDesc)}</p>
              <p style="margin-top: 1rem; color: #0052A5; font-weight: bold;">${t.support.techSupportContact}</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-book"></i> ${s('training_title', t.support.trainingTitle)}</h3>
              <p class="card-text">${s('training_desc', t.support.trainingDesc)}</p>
              <p style="margin-top: 1rem; color: #0052A5; font-weight: bold;">${t.support.trainingContact}</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-tools"></i> ${s('maintenance_title', t.support.maintenanceTitle)}</h3>
              <p class="card-text">${s('maintenance_desc', t.support.maintenanceDesc)}</p>
              <p style="margin-top: 1rem; color: #0052A5; font-weight: bold;">${t.support.maintenanceContact}</p>
            </div>
          </div>
        </div>

        <div style="max-width: 900px; margin: 4rem auto; padding: 2rem; background: #f9f9f9; border-radius: 8px;">
          <h3 style="color: #0052A5; font-size: 1.5rem; margin-bottom: 1rem; text-align: center;"><i class="fas fa-clock"></i> ${t.support.operatingHours}</h3>
          <p style="text-align: center; color: #666; line-height: 1.8;">
            ${s('hours', t.support.weekdays + ' / ' + t.support.lunchTime + ' / ' + t.support.weekends)}
          </p>
        </div>
      </section>
    </div>
  `, '', lang, t.support.customerSubtitle, '/support/customer', seoTitle, seoDesc)
}

async function sendTeamsNotification(webhookUrl: string, data: { name: string; email: string; phone: string; inquiry_type: string; message: string; ticketNo: string; lang: string; created_at: string }) {
  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ticketNo: data.ticketNo,
      name: data.name,
      email: data.email,
      phone: data.phone,
      inquiry_type: data.inquiry_type,
      message: data.message,
      lang: data.lang,
      created_at: data.created_at,
    }),
  }).catch(() => {})
}

function generateTrackingId(): string {
  const now = new Date()
  const pad = (n: number, len = 2) => String(n).padStart(len, '0')
  const ts = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return ts + rand
}

// ── Spam prevention ──────────────────────────────────────────────────────────

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org',
  'guerrillamail.biz', 'guerrillamail.de', 'guerrillamailblock.com', 'grr.la',
  'sharklasers.com', 'spam4.me', 'yopmail.com', 'yopmail.fr', 'cool.fr.nf',
  'jetable.fr.nf', 'tempmail.com', 'temp-mail.org', 'throwam.com',
  'trashmail.at', 'trashmail.com', 'trashmail.io', 'trashmail.me',
  'trashmail.net', 'trashmail.org', 'fakeinbox.com', 'mailnull.com',
  'maildrop.cc', 'dispostable.com', 'spamgourmet.com', 'mailnesia.com',
  'wegwerfmail.de', 'wegwerfmail.net', 'wegwerfmail.org', 'discard.email',
  'spamex.com', 'spam.su', 'mailscrap.com', 'getairmail.com',
])

async function generateFormToken(secret: string): Promise<string> {
  const ts = String(Date.now())
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret || 'default'),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(ts))
  const hex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
  return `${ts}.${hex}`
}

async function verifyFormToken(token: string | null, secret: string | undefined): Promise<{ blocked: boolean; reason?: string }> {
  if (!secret) return { blocked: false }
  if (!token) return { blocked: true, reason: 'missing_token' }
  const dotIdx = token.lastIndexOf('.')
  if (dotIdx === -1) return { blocked: true, reason: 'invalid_token' }
  const ts = token.slice(0, dotIdx)
  const sig = token.slice(dotIdx + 1)
  try {
    const key = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
    )
    const sigBytes = new Uint8Array((sig.match(/.{2}/g) || []).map(h => parseInt(h, 16)))
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(ts))
    if (!valid) return { blocked: true, reason: 'invalid_hmac' }
    const elapsed = Date.now() - parseInt(ts)
    if (elapsed < 3000) return { blocked: true, reason: 'too_fast' }
    if (elapsed > 3600000) return { blocked: true, reason: 'expired_token' }
    return { blocked: false }
  } catch {
    return { blocked: true, reason: 'token_error' }
  }
}

async function checkRateLimit(db: D1Database, ip: string): Promise<boolean> {
  if (!ip) return false
  // created_at is stored in KST (+9h); compute KST cutoff 5 minutes ago
  const cutoff = new Date(Date.now() - 5 * 60 * 1000 + 9 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19)
  const result = await db.prepare(
    'SELECT COUNT(*) as cnt FROM contact_submissions WHERE ip = ? AND created_at >= ?'
  ).bind(ip, cutoff).first<{ cnt: number }>().catch(() => null)
  return (result?.cnt ?? 0) >= 3
}

function isSuspiciousEmail(email: string): boolean {
  const local = email.split('@')[0]
  if (/[bcdfghjklmnpqrstvwxyz]{5,}/i.test(local)) return true
  if (local.length > 40) return true
  return false
}

async function logSpam(db: D1Database, ip: string, email: string, reason: string): Promise<void> {
  await db.prepare('INSERT INTO spam_logs (ip, email, reason) VALUES (?, ?, ?)')
    .bind(ip || null, email || null, reason).run().catch(() => {})
}

async function sendContactEmail(apiKey: string, data: { name: string; email: string; phone: string; inquiry_type: string; message: string; lang: string; ticketNo: string }) {
  const inquiryLabels: Record<string, string> = {
    product: '제품 문의', solution: '솔루션 문의', support: '기술 지원', partnership: '파트너십', etc: '기타',
  }
  const label = inquiryLabels[data.inquiry_type] || data.inquiry_type
  const html = `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
  <div style="background:#003366;padding:1.5rem 2rem;color:white;">
    <h2 style="margin:0;font-size:1.3rem;">ITMoou — 새 문의가 접수되었습니다</h2>
  </div>
  <div style="padding:2rem;background:#fff;">
    <table style="width:100%;border-collapse:collapse;font-size:0.95rem;">
      <tr><td style="padding:0.6rem 0;color:#888;width:120px;">TrackingID</td><td style="padding:0.6rem 0;color:#222;font-weight:700;font-family:monospace;">TrackingID#${data.ticketNo}</td></tr>
      <tr><td style="padding:0.6rem 0;color:#888;">이름</td><td style="padding:0.6rem 0;color:#222;font-weight:600;">${data.name}</td></tr>
      <tr><td style="padding:0.6rem 0;color:#888;">이메일</td><td style="padding:0.6rem 0;color:#0052A5;">${data.email}</td></tr>
      <tr><td style="padding:0.6rem 0;color:#888;">전화번호</td><td style="padding:0.6rem 0;color:#222;">${data.phone || '—'}</td></tr>
      <tr><td style="padding:0.6rem 0;color:#888;">문의 유형</td><td style="padding:0.6rem 0;"><span style="background:#e6f0ff;color:#0052A5;padding:0.2rem 0.6rem;border-radius:4px;font-size:0.85rem;">${label}</span></td></tr>
      <tr><td style="padding:0.6rem 0;color:#888;">언어</td><td style="padding:0.6rem 0;color:#666;">${data.lang === 'en' ? '🇺🇸 English' : '🇰🇷 한국어'}</td></tr>
    </table>
    <div style="margin-top:1.5rem;padding:1.2rem;background:#f9f9f9;border-radius:6px;border-left:3px solid #0052A5;">
      <p style="color:#888;font-size:0.85rem;margin-bottom:0.5rem;">문의 내용</p>
      <p style="color:#222;line-height:1.7;white-space:pre-wrap;">${data.message}</p>
    </div>
  </div>
  <div style="padding:1rem 2rem;background:#f5f5f5;font-size:0.8rem;color:#aaa;text-align:center;">
    itmoou.com Contact Us 폼을 통해 접수된 문의입니다.
  </div>
</div>`

  const replyHtml = data.lang === 'en' ? `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
  <div style="background:#003366;padding:1.5rem 2rem;color:white;">
    <h2 style="margin:0;font-size:1.3rem;">ITMoou — Inquiry Received</h2>
  </div>
  <div style="padding:2rem;background:#fff;line-height:1.7;color:#333;">
    <p>Dear <strong>${data.name}</strong>,</p>
    <p>Thank you for contacting ITMoou. We have received your inquiry and will get back to you as soon as possible.</p>
    <p style="margin-top:1.5rem;padding:1rem;background:#f9f9f9;border-left:3px solid #0052A5;border-radius:4px;">
      <strong>TrackingID:</strong> <span style="font-family:monospace;font-weight:700;">TrackingID#${data.ticketNo}</span><br>
      <strong>Inquiry Type:</strong> ${label}<br>
      <strong>Message:</strong> ${data.message}
    </p>
    <p style="margin-top:1.5rem;">Best regards,<br><strong>ITMoou Customer Support</strong><br>cs@itmoou.com / 043-715-8553</p>
  </div>
</div>` : `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
  <div style="background:#003366;padding:1.5rem 2rem;color:white;">
    <h2 style="margin:0;font-size:1.3rem;">ITMoou — 문의 접수 확인</h2>
  </div>
  <div style="padding:2rem;background:#fff;line-height:1.7;color:#333;">
    <p><strong>${data.name}</strong> 님, 안녕하세요.</p>
    <p>ITMoou에 문의해 주셔서 감사합니다. 문의가 정상적으로 접수되었으며, 빠른 시일 내에 답변 드리겠습니다.</p>
    <p style="margin-top:1.5rem;padding:1rem;background:#f9f9f9;border-left:3px solid #0052A5;border-radius:4px;">
      <strong>TrackingID:</strong> <span style="font-family:monospace;font-weight:700;">TrackingID#${data.ticketNo}</span><br>
      <strong>문의 유형:</strong> ${label}<br>
      <strong>문의 내용:</strong> ${data.message}
    </p>
    <p style="margin-top:1.5rem;">감사합니다.<br><strong>ITMoou 고객지원팀</strong><br>cs@itmoou.com / 043-715-8553</p>
  </div>
</div>`

  await Promise.all([
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'ITMoou Contact <no-reply@itmoou.com>',
        to: ['cs@itmoou.com'],
        reply_to: data.email,
        subject: `[문의] ${label} — ${data.name} / TrackingID#${data.ticketNo}`,
        html,
      }),
    }),
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'ITMoou <no-reply@itmoou.com>',
        to: [data.email],
        subject: data.lang === 'en' ? `[ITMoou] Your inquiry has been received - TrackingID#${data.ticketNo}` : `[ITMoou] 문의가 접수되었습니다 - TrackingID#${data.ticketNo}`,
        html: replyHtml,
      }),
    }),
  ])
}

function getContactHTML(lang: Language = 'ko', error?: string, success = false, ticketNo?: string, formToken?: string) {
  const t = getTranslation(lang)
  const action = lang === 'en' ? '/en/support/contact' : '/support/contact'

  const successMsg = `
    <div style="background:#e8f5e9;color:#2e7d32;border-radius:8px;padding:1.5rem 2rem;text-align:center;margin-bottom:2rem;">
      <i class="fas fa-check-circle" style="font-size:2rem;margin-bottom:0.5rem;display:block;"></i>
      <strong style="font-size:1.1rem;">${lang === 'en' ? 'Your inquiry has been submitted!' : '문의가 접수되었습니다!'}</strong><br>
      <span style="font-size:0.95rem;color:#388e3c;">${lang === 'en' ? 'We will get back to you as soon as possible.' : '빠른 시일 내에 답변 드리겠습니다.'}</span>
    </div>`

  const errorMsg = error ? `<div style="background:#fff0f0;color:#d32f2f;border-radius:8px;padding:1rem 1.5rem;margin-bottom:1.5rem;"><i class="fas fa-exclamation-circle"></i> ${error}</div>` : ''

  return getBaseHTML('Contact Us', `
    <div style="margin-top: 80px;">
      <section style="background: linear-gradient(135deg, #0052A5 0%, #003366 100%); color: white; padding: 4rem 2rem; text-align: center;">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">Contact Us</h1>
        <p style="font-size: 1.2rem;">${t.support.contactSubtitle}</p>
      </section>

      <section class="content-section">
        <div style="max-width: 600px; margin: 0 auto;">
          <div style="background:#fff8e1;color:#7a5800;border-left:4px solid #ffc107;border-radius:4px;padding:1rem 1.25rem;margin-bottom:1.5rem;font-size:0.95rem;line-height:1.6;">
            <i class="fas fa-exclamation-triangle" style="margin-right:0.4rem;"></i>
            ${lang === 'en'
              ? 'Inquiries submitted before March 10, 2026 cannot be answered due to a platform migration. We apologize for the inconvenience — please resubmit your inquiry.'
              : '2026년 03월 10일 이전 문의건은 플랫폼 변경으로 인해 답변이 어렵습니다. 다시 제출해주시면 감사하겠습니다. 이용에 불편을 드려 죄송합니다.'}
          </div>
          ${success ? successMsg : `
          ${errorMsg}
          <form method="POST" action="${action}" style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="position:absolute;left:-9999px;top:-9999px;overflow:hidden;" aria-hidden="true"><input type="text" name="_hp" tabindex="-1" autocomplete="off" value=""></div>
            <input type="hidden" name="_t" value="${formToken || ''}">
            <div style="margin-bottom: 1.5rem;">
              <label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">${t.support.nameLabel} <span style="color:#d32f2f;">*</span></label>
              <input type="text" name="name" required style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
            </div>
            <div style="margin-bottom: 1.5rem;">
              <label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">${t.support.emailLabel} <span style="color:#d32f2f;">*</span></label>
              <input type="email" name="email" required style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
            </div>
            <div style="margin-bottom: 1.5rem;">
              <label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">${t.support.phoneLabel}</label>
              <input type="tel" name="phone" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
            </div>
            <div style="margin-bottom: 1.5rem;">
              <label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">${t.support.inquiryTypeLabel} <span style="color:#d32f2f;">*</span></label>
              <select name="inquiry_type" required style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
                <option value="">${t.support.inquiryTypePlaceholder}</option>
                <option value="product">${t.support.inquiryTypeProduct}</option>
                <option value="solution">${t.support.inquiryTypeSolution}</option>
                <option value="support">${t.support.inquiryTypeSupport}</option>
                <option value="partnership">${t.support.inquiryTypePartnership}</option>
                <option value="etc">${t.support.inquiryTypeEtc}</option>
              </select>
            </div>
            <div style="margin-bottom: 1.5rem;">
              <label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">${t.support.messageLabel} <span style="color:#d32f2f;">*</span></label>
              <textarea name="message" required rows="6" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem; resize: vertical;"></textarea>
            </div>
            <div style="text-align: center;">
              <button type="submit" style="padding: 1rem 3rem; background: #0052A5; color: white; border: none; border-radius: 4px; font-size: 1.1rem; font-weight: bold; cursor: pointer; transition: all 0.3s;">${t.support.submitButton}</button>
            </div>
          </form>`}

          <div style="margin-top: 3rem; text-align: center; color: #666;">
            <p style="margin-bottom: 1rem;">${t.support.orContact}</p>
            <p style="font-size: 1.1rem;">
              <i class="fas fa-phone"></i> 043-715-8553<br>
              <i class="fas fa-envelope"></i> cs@itmoou.com
            </p>
          </div>
        </div>
      </section>
    </div>
  `, '', lang)
}

function getPrivacyPolicyHTML(lang: Language = 'ko') {
  const t = getTranslation(lang)
  return getBaseHTML(t.privacy.title, `
    <div class="main-content">
      <section class="hero-section" style="background: linear-gradient(135deg, #0052A5 0%, #003366 100%); padding: 4rem 2rem; text-align: center;">
        <h1 class="hero-title" style="color: white; font-size: 3rem; margin-bottom: 1rem;">${t.privacy.title}</h1>
        <p class="hero-subtitle" style="color: rgba(255,255,255,0.9); font-size: 1.2rem;">${t.privacy.subtitle}</p>
      </section>

      <section style="max-width: 900px; margin: 4rem auto; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="line-height: 1.8; color: #333;">
          <p style="margin-bottom: 2rem; font-size: 1.1rem;">${t.privacy.intro}</p>

          <h2 style="color: #0052A5; margin-top: 2.5rem; margin-bottom: 1rem; font-size: 1.5rem; border-bottom: 2px solid #0052A5; padding-bottom: 0.5rem;">${t.privacy.section1Title}</h2>
          <p style="margin-bottom: 1rem;">${t.privacy.section1Content1}</p>
          <p style="margin-bottom: 1rem;">${t.privacy.section1Content2}</p>
          <p style="margin-bottom: 1rem;">${t.privacy.section1Content3}</p>
          <p style="margin-bottom: 1rem;">${t.privacy.section1Content4}</p>
          <p style="margin-bottom: 1rem;">${t.privacy.section1Content5}</p>
          <ul style="margin-left: 2rem; margin-bottom: 1rem;">
            <li><strong>${t.privacy.section1Items}:</strong> ${t.privacy.section1ItemsValue}</li>
            <li><strong>${t.privacy.section1Purpose}:</strong> ${t.privacy.section1PurposeValue}</li>
            <li><strong>${t.privacy.section1Retention}:</strong> ${t.privacy.section1RetentionValue}</li>
          </ul>

          <h2 style="color: #0052A5; margin-top: 2.5rem; margin-bottom: 1rem; font-size: 1.5rem; border-bottom: 2px solid #0052A5; padding-bottom: 0.5rem;">${t.privacy.section2Title}</h2>
          <p style="margin-bottom: 1rem;">${t.privacy.section2Intro}</p>
          <ul style="margin-left: 2rem; margin-bottom: 1rem;">
            <li>${t.privacy.section2Item1}</li>
            <li>${t.privacy.section2Item2}</li>
            <li>${t.privacy.section2Item3}</li>
            <li>${t.privacy.section2Item4}</li>
          </ul>

          <h2 style="color: #0052A5; margin-top: 2.5rem; margin-bottom: 1rem; font-size: 1.5rem; border-bottom: 2px solid #0052A5; padding-bottom: 0.5rem;">${t.privacy.section3Title}</h2>
          <p style="margin-bottom: 1rem;">${t.privacy.section3Intro}</p>
          <ul style="margin-left: 2rem; margin-bottom: 1rem;">
            <li>${t.privacy.section3Item1}</li>
            <li>${t.privacy.section3Item2}</li>
            <li>${t.privacy.section3Item3}</li>
          </ul>

          <h2 style="color: #0052A5; margin-top: 2.5rem; margin-bottom: 1rem; font-size: 1.5rem; border-bottom: 2px solid #0052A5; padding-bottom: 0.5rem;">${t.privacy.section4Title}</h2>
          <p style="margin-bottom: 1rem;">${t.privacy.section4Content1}</p>
          <p style="margin-bottom: 1rem;">${t.privacy.section4Content2}</p>

          <h2 style="color: #0052A5; margin-top: 2.5rem; margin-bottom: 1rem; font-size: 1.5rem; border-bottom: 2px solid #0052A5; padding-bottom: 0.5rem;">${t.privacy.section5Title}</h2>
          <p style="margin-bottom: 1rem;">${t.privacy.section5Intro}</p>
          <ul style="margin-left: 2rem; margin-bottom: 1rem;">
            <li>${t.privacy.section5Item1}</li>
            <li>${t.privacy.section5Item2}</li>
            <li>${t.privacy.section5Item3}</li>
            <li>${t.privacy.section5Item4}</li>
          </ul>

          <h2 style="color: #0052A5; margin-top: 2.5rem; margin-bottom: 1rem; font-size: 1.5rem; border-bottom: 2px solid #0052A5; padding-bottom: 0.5rem;">${t.privacy.section6Title}</h2>
          <p style="margin-bottom: 1rem;">${t.privacy.section6Intro}</p>
          <p style="margin-bottom: 1rem;">${t.privacy.section6Content1}</p>
          <p style="margin-bottom: 1rem;">${t.privacy.section6Content2}</p>
          <p style="margin-bottom: 1rem;">${t.privacy.section6Content3}</p>

          <h2 style="color: #0052A5; margin-top: 2.5rem; margin-bottom: 1rem; font-size: 1.5rem; border-bottom: 2px solid #0052A5; padding-bottom: 0.5rem;">${t.privacy.section7Title}</h2>
          <p style="margin-bottom: 1rem;">${t.privacy.section7Content1}</p>
          <p style="margin-bottom: 1rem;">${t.privacy.section7Content2}</p>

          <h2 style="color: #0052A5; margin-top: 2.5rem; margin-bottom: 1rem; font-size: 1.5rem; border-bottom: 2px solid #0052A5; padding-bottom: 0.5rem;">${t.privacy.section8Title}</h2>
          <p style="margin-bottom: 1rem;">${t.privacy.section8Content1}</p>
          <p style="margin-bottom: 1rem;">${t.privacy.section8Content2}</p>
          <p style="margin-bottom: 1rem;">${t.privacy.section8Content3}</p>
          
          <div style="background: #f5f5f5; padding: 1.5rem; border-radius: 6px; margin-top: 1.5rem; margin-bottom: 1.5rem;">
            <strong style="color: #0052A5;">${t.privacy.section8LawTitle}</strong>
            <ul style="margin-left: 2rem; margin-top: 0.5rem; line-height: 2;">
              <li>${t.privacy.section8Law1}</li>
              <li>${t.privacy.section8Law2}</li>
              <li>${t.privacy.section8Law3}</li>
              <li>${t.privacy.section8Law4}</li>
            </ul>
          </div>

          <h2 style="color: #0052A5; margin-top: 2.5rem; margin-bottom: 1rem; font-size: 1.5rem; border-bottom: 2px solid #0052A5; padding-bottom: 0.5rem;">${t.privacy.section9Title}</h2>
          <p style="margin-bottom: 1rem;">${t.privacy.section9Intro}</p>
          
          <div style="background: #f0f8ff; padding: 1.5rem; border-radius: 6px; border-left: 4px solid #0052A5; margin-top: 1.5rem; margin-bottom: 1.5rem;">
            <p style="margin-bottom: 0.5rem;"><strong>${t.privacy.section9Officer}:</strong> ${t.privacy.section9OfficerName}</p>
            <p style="margin-bottom: 0.5rem;"><strong>${t.privacy.section9Position}:</strong> ${t.ceo.ceoTitle}</p>
            <p style="margin-bottom: 0.5rem;"><strong>${t.privacy.section9Contact}:</strong> 043-715-8553</p>
            <p><strong>${t.location.email}:</strong> cs@itmoou.com</p>
          </div>

          <h2 style="color: #0052A5; margin-top: 2.5rem; margin-bottom: 1rem; font-size: 1.5rem; border-bottom: 2px solid #0052A5; padding-bottom: 0.5rem;">${t.privacy.section10Title}</h2>
          <p style="margin-bottom: 1rem;">${t.privacy.section10Intro}</p>
          <ul style="margin-left: 2rem; margin-bottom: 1rem;">
            <li>${t.privacy.section10Item1}</li>
            <li>${t.privacy.section10Item2}</li>
            <li>${t.privacy.section10Item3}</li>
          </ul>

          <h2 style="color: #0052A5; margin-top: 2.5rem; margin-bottom: 1rem; font-size: 1.5rem; border-bottom: 2px solid #0052A5; padding-bottom: 0.5rem;">${t.privacy.section11Title}</h2>
          <p style="margin-bottom: 1rem;">${t.privacy.section11Content}</p>

          <h2 style="color: #0052A5; margin-top: 2.5rem; margin-bottom: 1rem; font-size: 1.5rem; border-bottom: 2px solid #0052A5; padding-bottom: 0.5rem;">${t.privacy.section12Title}</h2>
          <p style="margin-bottom: 1rem;">${t.privacy.section12Intro}</p>
          
          <div style="margin-left: 2rem;">
            <h3 style="color: #003366; font-size: 1.2rem; margin-top: 1.5rem; margin-bottom: 0.75rem;">${t.privacy.section12AdminTitle}</h3>
            <ul style="margin-left: 2rem; margin-bottom: 1rem;">
              <li>${t.privacy.section12Admin1}</li>
              <li>${t.privacy.section12Admin2}</li>
            </ul>

            <h3 style="color: #003366; font-size: 1.2rem; margin-top: 1.5rem; margin-bottom: 0.75rem;">${t.privacy.section12TechTitle}</h3>
            <ul style="margin-left: 2rem; margin-bottom: 1rem;">
              <li>${t.privacy.section12Tech1}</li>
              <li>${t.privacy.section12Tech2}</li>
              <li>${t.privacy.section12Tech3}</li>
              <li>${t.privacy.section12Tech4}</li>
            </ul>

            <h3 style="color: #003366; font-size: 1.2rem; margin-top: 1.5rem; margin-bottom: 0.75rem;">${t.privacy.section12PhysicalTitle}</h3>
            <ul style="margin-left: 2rem; margin-bottom: 1rem;">
              <li>${t.privacy.section12Physical1}</li>
            </ul>
          </div>

          <div style="background: #e8f4f8; padding: 1.5rem; border-radius: 6px; margin-top: 3rem; text-align: center;">
            <h3 style="color: #0052A5; margin-bottom: 1rem;">${t.privacy.addendumTitle}</h3>
            <p style="font-weight: bold; font-size: 1.1rem;">${t.privacy.addendumContent}</p>
          </div>

          <div style="text-align: center; margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #ddd;">
            <p style="color: #666; margin-bottom: 1rem;">${t.privacy.contactQuestion}</p>
            <p style="font-size: 1.1rem; color: #0052A5;">
              <i class="fas fa-phone"></i> 043-715-8553 | 
              <i class="fas fa-envelope"></i> cs@itmoou.com
            </p>
          </div>
        </div>
      </section>
    </div>
  `, '', lang)
}

export default app
