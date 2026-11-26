// GEO(생성형 엔진 최적화) 한 벌 - 구조화 데이터 · llms.txt · 마크다운 대응본. 2026-11-26 loginexio.com 점검표를 itmoou.com에 적용.
// 회사 사실(법인명 · 사업자등록번호 · 주소 · 연락처)은 바닥글과 같은 값. sameAs 는 실제로 운영하거나 회사를 가리키는 공개 프로필만(11-26 실측 200).

export const SITE = 'https://itmoou.com'
export const ORG_ID = `${SITE}/#organization`
export const WEBSITE_ID = `${SITE}/#website`

export const ORGANIZATION = {
  '@type': 'Organization',
  '@id': ORG_ID,
  name: '아이티무유',
  legalName: '아이티무유 주식회사',
  alternateName: ['ITMOOU CO., LTD.', 'ITmoou', '아이티무유 주식회사'],
  url: SITE,
  logo: { '@type': 'ImageObject', url: `${SITE}/images/logo-web.png` },
  image: `${SITE}/images/og-image.png`,
  description: '수출 중소기업을 위한 B2B 물류 SaaS LogiNexio(로지넥시오)를 만드는 소프트웨어 회사',
  sameAs: [
    'https://loginexio.com',
    'https://recruit.itmoou.com',
    'https://github.com/itmoou',
    'https://groupby.kr/startups/2521',
    'https://thevc.kr/itmoou',
  ],
  taxID: '229-81-43410',
  email: 'sales@itmoou.com',
  telephone: '+82-43-715-8553',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '공단로126번길 51, 청주산단스타트업센터 502호',
    addressLocality: '청주시 흥덕구',
    addressRegion: '충청북도',
    postalCode: '28576',
    addressCountry: 'KR',
  },
  contactPoint: [
    { '@type': 'ContactPoint', contactType: 'sales', email: 'sales@itmoou.com', telephone: '+82-43-715-8553', availableLanguage: ['ko'], areaServed: 'KR' },
  ],
  founder: { '@type': 'Person', name: '심영민', jobTitle: '대표이사' },
  brand: { '@type': 'Brand', name: 'LogiNexio', alternateName: '로지넥시오', url: 'https://loginexio.com' },
}

export const WEBSITE = {
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  url: SITE,
  name: '아이티무유',
  alternateName: 'ITmoou',
  inLanguage: 'ko',
  publisher: { '@id': ORG_ID },
}

export interface HeadOpts {
  /** 페이지 종류 - 없으면 경로로 정한다(/company AboutPage, /contact ContactPage). */
  type?: 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage'
  /** 글(처리방침 · 공고 상세)이면 Article 노드를 더하고 날짜를 적는다. 화면의 날짜와 같은 값이어야 한다. */
  article?: boolean
  datePublished?: string
  dateModified?: string
  /** 그 페이지에 실제로 보이는 질문 · 답 한 벌 → FAQPage. */
  faq?: readonly { q: string; a: string }[]
  faqAnchor?: string
}

function pageType(path: string, opts: HeadOpts): string {
  if (opts.type) return opts.type
  if (path === '/company') return 'AboutPage'
  if (path === '/contact') return 'ContactPage'
  if (path === '/newsroom' || path === '/announcements') return 'CollectionPage'
  return 'WebPage'
}

export function mdPath(path: string): string {
  return path === '/' ? '/index.md' : `${path}.md`
}

/** <head> 에 들어가는 GEO 조각: 구조화 데이터 @graph · 마크다운 대응본 링크 · 글꼴 CDN preconnect. */
export function geoHead(path: string, title: string, desc: string, opts: HeadOpts = {}): string {
  const url = `${SITE}${path === '/' ? '/' : path}`
  const pageId = `${url}#webpage`
  const page: Record<string, unknown> = {
    '@type': pageType(path, opts),
    '@id': pageId,
    url,
    name: title,
    description: desc,
    inLanguage: 'ko',
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
    ...(opts.datePublished ? { datePublished: opts.datePublished } : {}),
    ...(opts.dateModified ? { dateModified: opts.dateModified } : {}),
  }
  const nodes: Record<string, unknown>[] = [ORGANIZATION, WEBSITE, page]
  if (opts.article) {
    const articleId = `${url}#article`
    page.mainEntity = { '@id': articleId }
    nodes.push({
      '@type': 'Article',
      '@id': articleId,
      headline: title.replace(/ \| .*$/, ''),
      description: desc,
      inLanguage: 'ko',
      isAccessibleForFree: true,
      mainEntityOfPage: { '@id': pageId },
      author: { '@id': ORG_ID },
      publisher: { '@id': ORG_ID },
      ...(opts.datePublished ? { datePublished: opts.datePublished } : {}),
      ...(opts.dateModified ? { dateModified: opts.dateModified } : {}),
    })
  }
  if (opts.faq && opts.faq.length) {
    const faqUrl = `${url}#${opts.faqAnchor ?? 'faq'}`
    nodes.push({
      '@type': 'FAQPage',
      '@id': faqUrl,
      url: faqUrl,
      name: '자주 묻는 질문',
      inLanguage: 'ko',
      isPartOf: { '@id': WEBSITE_ID },
      mainEntity: opts.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    })
  }
  const graph = JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes })
  return `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="alternate" type="text/markdown" href="${SITE}${mdPath(path)}">
<script type="application/ld+json">${graph}</script>`
}

/** /service 자주 묻는 질문 - loginexio.com 에 게시된 승인 문안 그대로(components/landing/faq.ts, 2026-11). 바꿀 때 둘 다. */
export const SERVICE_FAQ: readonly { q: string; a: string }[] = [
  { q: '포워더도 가입해야 하나요?', a: '필수는 아닙니다. 가입하지 않은 포워더는 견적 요청과 부킹 요청에 함께 가는 링크로 회신하고 확정합니다. 가입한 포워더는 포워더 앱에서 같은 선적을 이어서 봅니다.' },
  { q: '거래하던 포워더를 그대로 쓸 수 있나요?', a: '네. 회사 설정에 거래하던 포워더를 등록하면 그대로 견적을 요청할 수 있습니다.' },
  { q: '구독료 말고 드는 비용이 있나요?', a: '운임 수수료나 중개 마진은 없습니다. 요금제마다 정해진 선적 건수만큼 추적이 들어 있고, 더 필요한 달에는 선적 크레딧을 미리 사서 씁니다. 저절로 결제되지 않습니다.' },
  { q: '도입하면 무엇부터 하나요?', a: '영업 담당이 회사 정보와 거래처, 품목 셋업부터 첫 선적까지 같이 진행합니다. 쓰던 엑셀이 있으면 초기 셋업에 씁니다.' },
  { q: '회사 데이터는 안전한가요?', a: '데이터는 회사 단위로 나뉘어 저장되고 다른 회사는 볼 수 없습니다. 관리자 계정은 2단계 인증을 씁니다.' },
]

export function faqSectionHtml(faq: readonly { q: string; a: string }[], anchor = 'faq'): string {
  return `
  <section class="faq-band" id="${anchor}" aria-labelledby="${anchor}-title">
    <div class="wrap">
      <p class="eyebrow">FAQ</p>
      <h2 id="${anchor}-title">자주 묻는 질문</h2>
      <div class="faq">
        ${faq.map((f) => `<details open><summary><h3>${f.q}</h3></summary><p>${f.a}</p></details>`).join('\n        ')}
      </div>
    </div>
  </section>`
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', middot: '·', hellip: '…', rarr: '→', copy: '©' }

export function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-z]+);/g, (m, n) => ENTITIES[n] ?? m)
}

/** 페이지 HTML(<main> 안) → 마크다운. 화면과 같은 글을 그대로 옮긴다(별도 원고 없음). */
export function htmlToMarkdown(html: string, path: string, title: string, desc: string): string {
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
  let s = mainMatch ? mainMatch[1] : html
  s = s.replace(/<(script|style|svg|form|button|noscript|nav)[^>]*>[\s\S]*?<\/\1>/gi, '')
  s = s.replace(/<p class="crumb">[\s\S]*?<\/p>/gi, '')
  s = s.replace(/<!--[\s\S]*?-->/g, '')
  const abs = (href: string): string => (href.startsWith('/') ? `${SITE}${href}` : href)
  s = s.replace(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => {
    const t = text.replace(/<[^>]+>/g, '').trim()
    if (!t || href.startsWith('#') || href.includes('cdn-cgi')) return t
    return `[${t}](${abs(href)})`
  })
  s = s.replace(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi, (_, t) => `\n\n# ${t.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').trim()}\n\n`)
  s = s.replace(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi, (_, t) => `\n\n## ${t.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').trim()}\n\n`)
  s = s.replace(/<h3\b[^>]*>([\s\S]*?)<\/h3>/gi, (_, t) => `\n\n### ${t.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').trim()}\n\n`)
  s = s.replace(/<h4\b[^>]*>([\s\S]*?)<\/h4>/gi, (_, t) => `\n\n#### ${t.replace(/<[^>]+>/g, '').trim()}\n\n`)
  s = s.replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, (_, t) => `\n- ${t.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').trim()}`)
  s = s.replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_, _t, t) => `**${t.replace(/<[^>]+>/g, '').trim()}**`)
  s = s.replace(/<summary\b[^>]*>([\s\S]*?)<\/summary>/gi, (_, t) => `\n\n### ${t.replace(/<[^>]+>/g, '').trim()}\n\n`)
  s = s.replace(/<br\s*\/?>/gi, '\n')
  s = s.replace(/<\/(p|div|section|tr|table|details|ul|ol|blockquote|figure)>/gi, '\n\n')
  s = s.replace(/<\/t[dh]>/gi, ' | ')
  s = s.replace(/<[^>]+>/g, '')
  s = decodeEntities(s)
  s = s
    .split('\n')
    .map((l) => l.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  const head = `> ${desc}\n\n원본 페이지: ${SITE}${path === '/' ? '/' : path} · 운영: 아이티무유 주식회사 · 제품: https://loginexio.com`
  const h1 = s.match(/^# .*$/m)
  if (!h1) return `# ${title.replace(/ \| .*$/, '')}\n\n${head}\n\n${s}\n`
  // 첫 H1 을 맨 위로 올리고 바로 아래에 요약 · 원본 주소를 둔다. 그 앞에 있던 글(눈썹 글 등)은 뒤로.
  const before = s.slice(0, h1.index).trim()
  const after = s.slice((h1.index ?? 0) + h1[0].length).trim()
  return `${h1[0]}\n\n${head}\n\n${before ? `${before}\n\n` : ''}${after}\n`
}

export function llmsTxt(): string {
  return `# 아이티무유 (ITmoou)

> 수출 중소기업을 위한 B2B 물류 SaaS LogiNexio(로지넥시오)를 만드는 소프트웨어 회사. 충청북도 청주에 있으며, 수출 현장의 실무 경험에서 출발해 수주 · 견적 비교 · 부킹 · 서류 · 적재 계산 · 선적 추적을 하나의 흐름으로 잇는 제품을 개발 · 운영합니다.

## 주요 페이지

- [회사 소개 (홈)](${SITE}/): 비전과 하는 일. 마크다운 ${SITE}/index.md
- [회사소개](${SITE}/company): 비전 · 미션 · 걸어온 길 · 오시는 길. 마크다운 ${SITE}/company.md
- [서비스](${SITE}/service): 수출 물류 SaaS LogiNexio 소개와 자주 묻는 질문. 마크다운 ${SITE}/service.md
- [연구개발](${SITE}/rnd): 적재 최적화 · 문서 자동화 · 물류 데이터 연구. 마크다운 ${SITE}/rnd.md
- [뉴스룸](${SITE}/newsroom): 소식과 공고, 보도 문의. 마크다운 ${SITE}/newsroom.md
- [공고](${SITE}/announcements): 정관에 따른 전자 공고. 마크다운 ${SITE}/announcements.md
- [문의하기](${SITE}/contact): 파일럿 참여 · 제품 데모 · 파트너십 문의. 마크다운 ${SITE}/contact.md
- [개인정보처리방침](${SITE}/privacy-policy): 마크다운 ${SITE}/privacy-policy.md
- [전체 글(llms-full.txt)](${SITE}/llms-full.txt): 위 페이지 본문을 한 파일로

## 제품

- [LogiNexio (로지넥시오)](https://loginexio.com): 수출 화주를 위한 물류 플랫폼. 제품 안내 파일 https://loginexio.com/llms.txt
- [LogiNexio 도입 문의](https://loginexio.com/contact)

## 회사

- 아이티무유 주식회사 · 대표이사 심영민 · 사업자등록번호 229-81-43410
- 충청북도 청주시 흥덕구 공단로126번길 51, 청주산단스타트업센터 502호
- 전화 043-715-8553 · 이메일 sales@itmoou.com
- 채용: ${SITE}/careers · GitHub: https://github.com/itmoou
`
}
