import { Hono } from 'hono'
import type { Env, Announcement, Attachment } from './types'
import { v2Shell } from './site-v2'

const announcements = new Hono<Env>()
export const announcementsEn = new Hono<Env>()

// 공개 공고 목록
announcements.get('/', async (c) => {
  const db = c.env.itmoou_db
  const category = c.req.query('category') || ''
  const page = parseInt(c.req.query('page') || '1')
  const pageSize = 10
  const offset = (page - 1) * pageSize

  let query = 'SELECT * FROM announcements'
  const params: string[] = []
  if (category) {
    query += ' WHERE category = ?'
    params.push(category)
  }

  const countResult = await db.prepare(
    category ? 'SELECT COUNT(*) as cnt FROM announcements WHERE category = ?' : 'SELECT COUNT(*) as cnt FROM announcements'
  ).bind(...params).first<{ cnt: number }>()

  const total = countResult?.cnt ?? 0
  const totalPages = Math.ceil(total / pageSize)

  query += ' ORDER BY number DESC LIMIT ? OFFSET ?'
  params.push(String(pageSize), String(offset))

  const { results } = await db.prepare(query).bind(...params).all<Announcement>()

  return c.html(getAnnouncementsListHTML(results, category, page, totalPages, total))
})

// 공개 공고 상세
announcements.get('/:id', async (c) => {
  const id = parseInt(c.req.param('id'))
  const db = c.env.itmoou_db

  const item = await db.prepare('SELECT * FROM announcements WHERE id = ?').bind(id).first<Announcement>()
  if (!item) return c.html(getNotFoundHTML(), 404)

  const { results: attachments } = await db.prepare(
    'SELECT * FROM attachments WHERE announcement_id = ?'
  ).bind(id).all<Attachment>()

  return c.html(getAnnouncementDetailHTML(item, attachments))
})

// 첨부파일 다운로드
announcements.get('/:id/files/:attachmentId', async (c) => {
  const id = parseInt(c.req.param('id'))
  const attachmentId = parseInt(c.req.param('attachmentId'))
  const db = c.env.itmoou_db
  const r2 = c.env.itmoou_files

  const attachment = await db.prepare(
    'SELECT * FROM attachments WHERE id = ? AND announcement_id = ?'
  ).bind(attachmentId, id).first<Attachment>()

  if (!attachment) return c.notFound()

  const object = await r2.get(attachment.storage_key)
  if (!object) return c.notFound()

  const encodedFilename = encodeURIComponent(attachment.filename)
  return new Response(object.body as ReadableStream, {
    headers: {
      'Content-Type': object.httpMetadata?.contentType ?? 'application/octet-stream',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodedFilename}`,
    },
  })
})

// ──────────────── HTML 생성 (site-v2 디자인) ────────────────

const CATEGORIES = ['일반공고', '주주총회', '기타']

// 영문(레거시) 템플릿에서 참조 - 유지
function getSharedHead() {
  return `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon">
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <link href="/static/styles.css" rel="stylesheet">
  `
}

function annSubhero(sub: string) {
  return `
  <section class="subhero">
    <div class="wrap">
      <p class="crumb">ITMOOU — NOTICE</p>
      <h1>공고</h1>
      <p class="sub">${sub}</p>
    </div>
  </section>`
}

function getAnnouncementsListHTML(
  items: Announcement[],
  category: string,
  page: number,
  totalPages: number,
  total: number
) {
  const tabs = ['', ...CATEGORIES].map(cat => {
    const label = cat || '전체'
    const isActive = category === cat
    return `<a href="/announcements${cat ? '?category=' + encodeURIComponent(cat) : ''}" class="cat-tab ${isActive ? 'active' : ''}">${label}</a>`
  }).join('')

  const rows = items.length === 0
    ? `<tr><td colspan="4" class="notice-empty">등록된 공고가 없습니다.</td></tr>`
    : items.map(item => `
        <tr>
          <td>${item.number}</td>
          <td><span class="cat-badge">${item.category}</span></td>
          <td><a href="/announcements/${item.id}" style="color:var(--ink); font-weight:600">${escapeHtml(item.title)}</a></td>
          <td>${item.notice_date}</td>
        </tr>`).join('')

  const pages: string[] = []
  if (page > 1) pages.push(`<a href="/announcements?${category ? 'category=' + encodeURIComponent(category) + '&' : ''}page=${page - 1}" class="page-btn">‹</a>`)
  for (let i = 1; i <= totalPages; i++) {
    pages.push(`<a href="/announcements?${category ? 'category=' + encodeURIComponent(category) + '&' : ''}page=${i}" class="page-btn ${i === page ? 'active' : ''}">${i}</a>`)
  }
  if (page < totalPages) pages.push(`<a href="/announcements?${category ? 'category=' + encodeURIComponent(category) + '&' : ''}page=${page + 1}" class="page-btn">›</a>`)

  const main = `
  ${annSubhero('아이티무유 주식회사는 정관에 따라 전자적 방법(홈페이지 게시)으로 공고합니다.')}
  <section style="padding: 72px 0 128px;">
    <div class="wrap">
      <div class="cat-tabs">${tabs}</div>
      <p style="margin: 0 0 14px; font-size: 0.88rem; color: var(--ink-faint);">총 ${total}건</p>
      <div style="overflow-x: auto;">
        <table class="notice-table">
          <thead>
            <tr><th style="width:70px">번호</th><th style="width:120px">분류</th><th>제목</th><th style="width:120px">공고일</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      ${totalPages > 1 ? `<div class="pagination">${pages.join('')}</div>` : ''}
    </div>
  </section>`

  return v2Shell('/announcements', '공고 | 아이티무유', '아이티무유 주식회사의 공식 공고를 번호 · 분류 · 공고일과 함께 게시합니다. 정관에 따른 전자 공고로 파일럿 모집, 채용, 계약 · 정정 공고를 여기서 확인합니다.', main)
}

function getAnnouncementDetailHTML(item: Announcement, attachments: Attachment[]) {
  const files = attachments.length === 0 ? '' : `
      <div class="ann-files">
        <h3>첨부파일</h3>
        ${attachments.map(a => `<a href="/announcements/${item.id}/files/${a.id}">📎 ${escapeHtml(a.filename)}${a.size ? ` <span style="color:var(--ink-faint); font-weight:500">(${formatFileSize(a.size)})</span>` : ''}</a>`).join('')}
      </div>`

  const contentHtml = escapeHtml(item.content).replace(/\n/g, '<br>')

  const main = `
  ${annSubhero('아이티무유 주식회사는 정관에 따라 전자적 방법(홈페이지 게시)으로 공고합니다.')}
  <section style="padding: 72px 0 128px;">
    <div class="wrap">
      <article class="ann-detail">
        <div class="ann-head">
          <span class="cat-badge">${item.category}</span>
          <h1 class="ann-title">${escapeHtml(item.title)}</h1>
          <p class="ann-meta">공고 제${item.number}호 · ${item.notice_date}</p>
        </div>
        <div class="ann-body">${contentHtml}</div>
        ${files}
        <a class="ann-back" href="/announcements">← 공고 목록으로</a>
      </article>
    </div>
  </section>`

  return v2Shell(`/announcements/${item.id}`, `${escapeHtml(item.title)} | 공고 | 아이티무유`, `아이티무유 주식회사 공고 제${item.number}호(${item.category}, ${item.notice_date}): ${escapeHtml(item.title)}`, main, { article: true, datePublished: item.notice_date, dateModified: item.notice_date })
}

function getNotFoundHTML() {
  const main = `
  ${annSubhero('아이티무유 주식회사는 정관에 따라 전자적 방법(홈페이지 게시)으로 공고합니다.')}
  <section style="padding: 72px 0 128px;">
    <div class="wrap">
      <div class="empty">
        <h3>공고를 찾을 수 없습니다</h3>
        <p>삭제되었거나 존재하지 않는 공고입니다.</p>
        <p style="margin-top: 20px;"><a href="/announcements" class="ann-back" style="margin-top:0">← 공고 목록으로</a></p>
      </div>
    </div>
  </section>`
  return v2Shell('/announcements', '공고 | 아이티무유', '아이티무유 주식회사의 공식 공고를 번호 · 분류 · 공고일과 함께 게시합니다. 정관에 따른 전자 공고로 파일럿 모집, 채용, 계약 · 정정 공고를 여기서 확인합니다.', main)
}

// ──────────────── 영문 공고 라우트 ────────────────

const CATEGORY_EN: Record<string, string> = {
  '일반공고': 'General Notice',
  '주주총회': "Shareholders' Meeting",
  '기타': 'Other',
}

announcementsEn.get('/', async (c) => {
  const db = c.env.itmoou_db
  const category = c.req.query('category') || ''
  const page = parseInt(c.req.query('page') || '1')
  const pageSize = 10
  const offset = (page - 1) * pageSize

  let query = 'SELECT * FROM announcements'
  const params: string[] = []
  if (category) {
    query += ' WHERE category = ?'
    params.push(category)
  }

  const countResult = await db.prepare(
    category ? 'SELECT COUNT(*) as cnt FROM announcements WHERE category = ?' : 'SELECT COUNT(*) as cnt FROM announcements'
  ).bind(...params).first<{ cnt: number }>()

  const total = countResult?.cnt ?? 0
  const totalPages = Math.ceil(total / pageSize)

  query += ' ORDER BY number DESC LIMIT ? OFFSET ?'
  params.push(String(pageSize), String(offset))

  const { results } = await db.prepare(query).bind(...params).all<Announcement>()
  return c.html(getEnAnnouncementsListHTML(results, category, page, totalPages, total))
})

announcementsEn.get('/:id', async (c) => {
  const id = parseInt(c.req.param('id'))
  const db = c.env.itmoou_db
  const item = await db.prepare('SELECT * FROM announcements WHERE id = ?').bind(id).first<Announcement>()
  if (!item) return c.html(getEnNotFoundHTML(), 404)
  const { results: attachments } = await db.prepare(
    'SELECT * FROM attachments WHERE announcement_id = ?'
  ).bind(id).all<Attachment>()
  return c.html(getEnAnnouncementDetailHTML(item, attachments))
})

announcementsEn.get('/:id/files/:attachmentId', async (c) => {
  const id = parseInt(c.req.param('id'))
  const attachmentId = parseInt(c.req.param('attachmentId'))
  const db = c.env.itmoou_db
  const r2 = c.env.itmoou_files
  const attachment = await db.prepare(
    'SELECT * FROM attachments WHERE id = ? AND announcement_id = ?'
  ).bind(attachmentId, id).first<Attachment>()
  if (!attachment) return c.notFound()
  const object = await r2.get(attachment.storage_key)
  if (!object) return c.notFound()
  const encodedFilename = encodeURIComponent(attachment.filename)
  return new Response(object.body as ReadableStream, {
    headers: {
      'Content-Type': object.httpMetadata?.contentType ?? 'application/octet-stream',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodedFilename}`,
    },
  })
})

// ──────────────── 영문 HTML 생성 ────────────────

function getEnNav() {
  return `
      <div class="mobile-nav-header">
        <div class="mobile-nav-actions">
          <a href="#" class="mobile-language-toggle"><i class="fas fa-globe"></i></a>
          <button class="mobile-menu-close" aria-label="Close menu"><i class="fas fa-times"></i></button>
        </div>
        <div class="mobile-language-dropdown">
          <a href="/announcements" class="mobile-language-item">🇰🇷 한국어</a>
          <a href="/en/announcements" class="mobile-language-item active">🇺🇸 English</a>
        </div>
      </div>
      <ul class="main-nav">
        <li class="nav-item"><a href="/en/company" class="nav-link">About</a>
          <div class="dropdown">
            <a href="/en/company" class="dropdown-item">ITMoou</a>
            <a href="/en/company/ceo" class="dropdown-item">CEO Message</a>
            <a href="/en/company/news" class="dropdown-item">News</a>
            <a href="/en/announcements" class="dropdown-item">Notices</a>
            <a href="/en/company/history" class="dropdown-item">History</a>
            <a href="/en/company/esg" class="dropdown-item">ESG</a>
            <a href="/en/company/location" class="dropdown-item">Location</a>
          </div>
        </li>
        <li class="nav-item"><a href="/en/solutions/loginexio" class="nav-link">Solutions</a>
          <div class="dropdown">
            <a href="/en/solutions/loginexio" class="dropdown-item">LogiNexio</a>
            <a href="/en/solutions/bizsupport" class="dropdown-item">BizSupport Pro</a>
          </div>
        </li>
        <li class="nav-item"><a href="/en/rnd/lab" class="nav-link">R&amp;D</a>
          <div class="dropdown">
            <a href="/en/rnd/lab" class="dropdown-item">Laboratory</a>
            <a href="/en/rnd/activities" class="dropdown-item">R&amp;D Activities</a>
          </div>
        </li>
        <li class="nav-item"><a href="/en/careers/talent" class="nav-link">Careers</a>
          <div class="dropdown">
            <a href="/en/careers/talent" class="dropdown-item">Talent</a>
            <a href="/en/careers" class="dropdown-item" target="_blank" rel="noopener noreferrer">Job Openings</a>
          </div>
        </li>
        <li class="nav-item"><a href="/en/support/customer" class="nav-link">Support</a>
          <div class="dropdown">
            <a href="/en/support/customer" class="dropdown-item">Customer Support</a>
            <a href="/en/support/contact" class="dropdown-item">Contact Us</a>
          </div>
        </li>
        <li class="nav-item language-switcher">
          <a href="#" class="nav-link"><i class="fas fa-globe"></i></a>
          <div class="dropdown">
            <a href="/announcements" class="dropdown-item">🇰🇷 한국어</a>
            <a href="/en/announcements" class="dropdown-item active">🇺🇸 English</a>
          </div>
        </li>
      </ul>`
}

function getEnAnnouncementsListHTML(
  items: Announcement[],
  category: string,
  page: number,
  totalPages: number,
  total: number
) {
  const categoryTabs = [{ val: '', label: 'All' }, ...Object.entries(CATEGORY_EN).map(([k, v]) => ({ val: k, label: v }))].map(({ val, label }) => {
    const isActive = category === val
    return `<a href="/en/announcements${val ? '?category=' + encodeURIComponent(val) : ''}"
               class="category-tab ${isActive ? 'active' : ''}">${label}</a>`
  }).join('')

  const rows = items.length === 0
    ? `<tr><td colspan="4" style="text-align:center;padding:3rem;color:#999;">No notices found.</td></tr>`
    : items.map(item => {
        const titleEn = item.title_en || item.title
        return `
        <tr>
          <td class="ann-number">${item.number}</td>
          <td class="ann-category"><span class="cat-badge cat-${item.category}">${CATEGORY_EN[item.category] || item.category}</span></td>
          <td class="ann-title"><a href="/en/announcements/${item.id}">${escapeHtml(titleEn)}</a></td>
          <td class="ann-date">${item.notice_date}</td>
        </tr>`
      }).join('')

  const paginationItems = []
  if (page > 1) {
    paginationItems.push(`<a href="/en/announcements?${category ? 'category=' + encodeURIComponent(category) + '&' : ''}page=${page - 1}" class="page-btn">‹ Prev</a>`)
  }
  for (let i = 1; i <= totalPages; i++) {
    paginationItems.push(`<a href="/en/announcements?${category ? 'category=' + encodeURIComponent(category) + '&' : ''}page=${i}" class="page-btn ${i === page ? 'active' : ''}">${i}</a>`)
  }
  if (page < totalPages) {
    paginationItems.push(`<a href="/en/announcements?${category ? 'category=' + encodeURIComponent(category) + '&' : ''}page=${page + 1}" class="page-btn">Next ›</a>`)
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Notices | IT moou</title>
  ${getSharedHead()}
  <style>${announcementStyles}</style>
</head>
<body>
  <header class="header">
    <div class="header-container">
      <a href="/en" class="logo"><img src="/images/logo.png" alt="IT moou" style="height:80px;"></a>
      <button class="mobile-menu-toggle" aria-label="Toggle menu"><span></span><span></span><span></span></button>
      <nav class="mobile-nav">
        ${getEnNav()}
      </nav>
    </div>
  </header>

  <div class="page-content" style="padding-top:80px;">
    <div class="page-header" style="background:linear-gradient(135deg,#003366,#0052A5);color:#fff;padding:3rem 0;text-align:center;">
      <h1 style="font-size:2rem;font-weight:700;margin:0;">Notices</h1>
      <p style="margin:0.5rem 0 0;opacity:0.8;">Official notices from IT moou</p>
    </div>
    <div class="container" style="max-width:1000px;margin:0 auto;padding:2rem 1rem;">
      <div class="category-tabs" style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1.5rem;">
        ${categoryTabs}
      </div>
      <p style="color:#666;font-size:0.9rem;margin-bottom:1rem;">Total ${total} notices</p>
      <table class="ann-table">
        <thead>
          <tr>
            <th style="width:80px;">No.</th>
            <th style="width:140px;">Category</th>
            <th>Title</th>
            <th style="width:120px;">Date</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      ${totalPages > 1 ? `<div class="pagination">${paginationItems.join('')}</div>` : ''}
    </div>
  </div>

  <footer class="footer">
    <div class="footer-container">
      <div class="footer-content">
        <div class="footer-section footer-logo">
          <img src="/images/footericon.png" alt="IT moou" style="height:90px;margin-bottom:1.5rem;">
          <p class="footer-main-info">Phone<br><span class="footer-phone">043.715.8553</span></p>
          <p class="footer-copyright">© 2026 ITmoou Co., Ltd. ALL RIGHTS RESERVED.</p>
        </div>
        <div class="footer-section footer-info">
          <p class="footer-small">CEO : Young-Min Shim<br>Privacy Officer : Young-Min Shim<br>
          <a href="/en/privacy-policy" class="footer-link">Privacy Policy</a></p>
          <p class="footer-address">502, Cheongju Sandan Startup Center, 51, Gongdan-ro 126beon-gil, Heungdeok-gu, Cheongju-si, Chungcheongbuk-do, Republic of Korea<br>
          Business Reg. No. : 229-81-43410<br>
          Email <a href="mailto:sales@itmoou.com" class="footer-link">sales@itmoou.com</a></p>
          <div class="social-links" style="margin-top:2rem;">
            <a href="https://www.instagram.com/itmoou/" target="_blank" rel="noopener noreferrer" class="social-link" title="Instagram"><i class="fab fa-instagram"></i></a>
            <a href="https://www.linkedin.com/in/moou-it-6414573a8/" target="_blank" rel="noopener noreferrer" class="social-link" title="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
            <a href="https://www.youtube.com/@%EC%95%84%EC%9D%B4%ED%8B%B0%EB%AC%B4%EC%9C%A0" target="_blank" rel="noopener noreferrer" class="social-link" title="YouTube"><i class="fab fa-youtube"></i></a>
          </div>
        </div>
      </div>
    </div>
  </footer>
  <script src="/static/app.js"></script>
</body>
</html>`
}

function getEnAnnouncementDetailHTML(item: Announcement, attachments: Attachment[]) {
  const titleEn = item.title_en || item.title
  const contentEn = item.content_en || item.content

  const attachmentList = attachments.length === 0
    ? ''
    : `<div class="attachments-section">
        <h3><i class="fas fa-paperclip"></i> Attachments</h3>
        <ul class="attachment-list">
          ${attachments.map(a => `
            <li>
              <a href="/en/announcements/${item.id}/files/${a.id}" class="attachment-link">
                <i class="fas fa-file"></i>
                ${escapeHtml(a.filename)}
                ${a.size ? `<span class="file-size">(${formatFileSize(a.size)})</span>` : ''}
              </a>
            </li>`).join('')}
        </ul>
      </div>`

  const contentHtml = escapeHtml(contentEn).replace(/\n/g, '<br>')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <title>${escapeHtml(titleEn)} | Notices | IT moou</title>
  ${getSharedHead()}
  <style>${announcementStyles}</style>
</head>
<body>
  <header class="header">
    <div class="header-container">
      <a href="/en" class="logo"><img src="/images/logo.png" alt="IT moou" style="height:80px;"></a>
      <button class="mobile-menu-toggle" aria-label="Toggle menu"><span></span><span></span><span></span></button>
      <nav class="mobile-nav">
        ${getEnNav()}
      </nav>
    </div>
  </header>

  <div class="page-content" style="padding-top:80px;">
    <div class="page-header" style="background:linear-gradient(135deg,#003366,#0052A5);color:#fff;padding:3rem 0;text-align:center;">
      <h1 style="font-size:2rem;font-weight:700;margin:0;">Notices</h1>
    </div>
    <div class="container" style="max-width:900px;margin:0 auto;padding:2rem 1rem;">
      <div style="margin-bottom:1rem;">
        <a href="/en/announcements" style="color:#0052A5;text-decoration:none;font-size:0.9rem;">
          <i class="fas fa-arrow-left"></i> Back to list
        </a>
      </div>
      <div class="announcement-detail">
        <div class="detail-header">
          <span class="cat-badge cat-${item.category}">${CATEGORY_EN[item.category] || item.category}</span>
          <span class="ann-num-badge">No. ${item.number}</span>
        </div>
        <h2 class="detail-title">${escapeHtml(titleEn)}</h2>
        <div class="detail-meta">
          <span><i class="fas fa-calendar"></i> Date: ${item.notice_date}</span>
          <span><i class="fas fa-clock"></i> Posted: ${item.created_at.substring(0, 10)}</span>
        </div>
        <div class="detail-content">${contentHtml}</div>
        ${attachmentList}
      </div>
      <div style="margin-top:2rem;text-align:center;">
        <a href="/en/announcements" class="btn-back">Back to list</a>
      </div>
    </div>
  </div>

  <footer class="footer">
    <div class="footer-container">
      <div class="footer-content">
        <div class="footer-section footer-logo">
          <img src="/images/footericon.png" alt="IT moou" style="height:90px;margin-bottom:1.5rem;">
          <p class="footer-main-info">Phone<br><span class="footer-phone">043.715.8553</span></p>
          <p class="footer-copyright">© 2026 ITmoou Co., Ltd. ALL RIGHTS RESERVED.</p>
        </div>
        <div class="footer-section footer-info">
          <p class="footer-small">CEO : Young-Min Shim<br>Privacy Officer : Young-Min Shim<br>
          <a href="/en/privacy-policy" class="footer-link">Privacy Policy</a></p>
          <p class="footer-address">502, Cheongju Sandan Startup Center, 51, Gongdan-ro 126beon-gil, Heungdeok-gu, Cheongju-si, Chungcheongbuk-do, Republic of Korea<br>
          Business Reg. No. : 229-81-43410<br>
          Email <a href="mailto:sales@itmoou.com" class="footer-link">sales@itmoou.com</a></p>
          <div class="social-links" style="margin-top:2rem;">
            <a href="https://www.instagram.com/itmoou/" target="_blank" rel="noopener noreferrer" class="social-link" title="Instagram"><i class="fab fa-instagram"></i></a>
            <a href="https://www.linkedin.com/in/moou-it-6414573a8/" target="_blank" rel="noopener noreferrer" class="social-link" title="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
            <a href="https://www.youtube.com/@%EC%95%84%EC%9D%B4%ED%8B%B0%EB%AC%B4%EC%9C%A0" target="_blank" rel="noopener noreferrer" class="social-link" title="YouTube"><i class="fab fa-youtube"></i></a>
          </div>
        </div>
      </div>
    </div>
  </footer>
  <script src="/static/app.js"></script>
</body>
</html>`
}

function getEnNotFoundHTML() {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>404</title></head>
  <body style="text-align:center;padding:4rem;font-family:sans-serif;">
  <h2>Notice not found.</h2>
  <a href="/en/announcements">Back to list</a></body></html>`
}

// ──────────────── 유틸 ────────────────

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// ──────────────── 스타일 ────────────────

const announcementStyles = `
.category-tab {
  display: inline-block;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  text-decoration: none;
  font-size: 0.9rem;
  color: #555;
  background: #f0f0f0;
  transition: all 0.2s;
}
.category-tab:hover, .category-tab.active {
  background: #0052A5;
  color: #fff;
}
.ann-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}
.ann-table th {
  background: #003366;
  color: #fff;
  padding: 0.8rem 1rem;
  text-align: left;
  font-weight: 500;
}
.ann-table td {
  padding: 0.9rem 1rem;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
}
.ann-table tr:hover td { background: #f8f9ff; }
.ann-title a { color: #222; text-decoration: none; font-weight: 500; }
.ann-title a:hover { color: #0052A5; }
.ann-number, .ann-date { color: #888; font-size: 0.85rem; }
.cat-badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  font-size: 0.78rem;
  font-weight: 600;
  white-space: nowrap;
}
.cat-일반공고 { background: #e6f0ff; color: #0052A5; }
.cat-주주총회 { background: #fff3e0; color: #e65100; }
.cat-인사공고 { background: #e8f5e9; color: #2e7d32; }
.cat-기타     { background: #f5f5f5; color: #666; }
.pagination {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
}
.page-btn {
  display: inline-block;
  padding: 0.4rem 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-decoration: none;
  color: #333;
  font-size: 0.9rem;
}
.page-btn.active { background: #0052A5; color: #fff; border-color: #0052A5; }
.page-btn:hover:not(.active) { background: #f0f0f0; }
.announcement-detail {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 2rem;
}
.detail-header { display: flex; gap: 0.5rem; align-items: center; margin-bottom: 1rem; }
.ann-num-badge { color: #888; font-size: 0.9rem; }
.detail-title { font-size: 1.5rem; font-weight: 700; color: #111; margin: 0.5rem 0 1rem; line-height: 1.4; }
.detail-meta { display: flex; gap: 1.5rem; color: #888; font-size: 0.88rem; margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid #eee; }
.detail-meta i { margin-right: 0.3rem; }
.detail-content { font-size: 1rem; line-height: 1.8; color: #333; white-space: pre-wrap; }
.attachments-section { margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #eee; }
.attachments-section h3 { font-size: 1rem; color: #555; margin-bottom: 0.8rem; }
.attachment-list { list-style: none; padding: 0; margin: 0; }
.attachment-list li { margin-bottom: 0.5rem; }
.attachment-link { display: inline-flex; align-items: center; gap: 0.5rem; color: #0052A5; text-decoration: none; font-size: 0.9rem; }
.attachment-link:hover { text-decoration: underline; }
.file-size { color: #999; font-size: 0.8rem; }
.btn-back {
  display: inline-block;
  padding: 0.6rem 1.5rem;
  background: #0052A5;
  color: #fff;
  border-radius: 4px;
  text-decoration: none;
  font-size: 0.95rem;
}
.btn-back:hover { background: #003d7a; }
`

export default announcements
