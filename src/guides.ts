import { v2Shell } from './site-v2'

/**
 * 안내 글(/guide). 글은 전부 이 사이트에 이미 게시된 문장(서비스 · 연구개발 페이지)을 그대로 모은 것이라 새 주장이 없다.
 * 글 페이지는 수집기가 「본문 구조 · 발행일 · 저자」를 읽는 자리라, 제목 · 소제목(닻 id) · 목차 · 게시일 · 수정일 · 저자를 기계가 읽게 적는다.
 * 글을 고치면 dateModified 를 그날로(화면 날짜 줄과 구조화 데이터가 이 값 하나를 읽는다).
 */
export interface Guide {
  slug: string
  title: string
  desc: string
  datePublished: string
  dateModified: string
  lead: string
  sections: { title: string; body: string[] }[]
}

export const GUIDES: readonly Guide[] = [
  {
    slug: 'loginexio',
    title: '수주 하나가 완료되기까지, 네 가지가 자동으로 이어집니다',
    desc: '아이티무유가 만드는 수출 물류 SaaS LogiNexio의 네 가지 기능(3D 적재 시뮬레이션 · 포워더 견적 비교 · 수출 서류 자동 생성 · 선적 트래킹)과 2026 파일럿 파트너 모집, 요금 안내.',
    datePublished: '2026-11-26',
    dateModified: '2026-11-26',
    lead: '아이티무유는 수출 물류 SaaS LogiNexio를 만듭니다. 수출 업무 전체를 하나의 흐름으로 잇는 물류 올인원 SaaS입니다.',
    sections: [
      { title: '3D 적재 시뮬레이션', body: ['박스 치수와 수량만 입력하면 최적 배치를 계산합니다. 컨테이너 1대를 줄이는 순간이 눈에 보입니다.'] },
      { title: '포워더 견적 비교', body: ['포워더는 가입 없이 이메일 답장만 하면 됩니다. 회신이 자동 파싱되어 항목별 최저가가 강조됩니다.'] },
      { title: '수출 서류 자동 생성', body: ['수주 데이터에서 CI/PL이 자동으로 채워집니다. A4 미리보기 후 포워더에게 원클릭 발송.'] },
      { title: '선적 트래킹', body: ['부킹부터 도착까지, 선박 위치와 일정 변동을 한 화면에서 확인합니다.'] },
      {
        title: '2026 파일럿 파트너를 모집합니다',
        body: ['LogiNexio를 가장 먼저 도입하고 제품의 방향을 함께 만들 수출 제조기업을 찾습니다. 온보딩과 기술 지원을 저희 팀이 직접 제공합니다.'],
      },
      { title: '요금과 플랜', body: ['도입 문의를 주시면 기업 규모와 물동량에 맞춰 안내드립니다.'] },
    ],
  },
  {
    slug: 'rnd',
    title: '논문 속 기술이 아니라, 수출 현장의 문제를 푸는 기술을 만듭니다',
    desc: '아이티무유 연구개발부서의 세 가지 연구 분야(적재 최적화 · 문서 자동화 · 물류 데이터)와 함께 연구할 동료를 찾는 이야기.',
    datePublished: '2026-11-26',
    dateModified: '2026-11-26',
    lead: '아이티무유 연구개발부서는 LogiNexio의 핵심 기술을 직접 설계하고 구현합니다. 현장의 문제를 푸는 기술, 세 가지 연구 분야를 소개합니다.',
    sections: [
      {
        title: '적재 최적화',
        body: ['화물 치수·수량 기반 3D 적재 시뮬레이션과 배치 알고리즘을 연구합니다. 컨테이너 공간 활용을 계산해 현장의 감에 의존하던 적재를 데이터로 바꿉니다.'],
      },
      {
        title: '문서 자동화',
        body: ['수출 서류(CI/PL) 자동 생성, 견적 회신 이메일 파싱 등 문서 처리 기술을 개발합니다. 같은 데이터를 세 번 타이핑하던 업무를 한 번으로 줄입니다.'],
      },
      { title: '물류 데이터', body: ['선박 운항(AIS)·일정 데이터를 수집하고 처리하는 트래킹 기술을 개발합니다. 부킹부터 도착까지의 흐름을 한 화면에 담습니다.'] },
      {
        title: '함께 연구할 동료를 찾습니다',
        body: ['오래된 산업을 소프트웨어로 다시 만드는 일. 그 초기 멤버가 될 분을 기다립니다. 채용 공고와 지원은 <a href="/careers">인재영입</a> 페이지에서 안내합니다.'],
      },
    ],
  },
]

export function guide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug)
}

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** 저자 · 게시일 · 최근 수정일 - 구조화 데이터(Article)와 같은 값. 수정이 없어도 둘 다 보인다. */
function byline(g: Guide): string {
  return `<p class="sub byline"><span class="author">심영민</span>(아이티무유 주식회사 대표이사) · 게시 <time datetime="${g.datePublished}">${g.datePublished}</time> · 최근 수정 <time datetime="${g.dateModified}">${g.dateModified}</time></p>`
}

/** 안내 글 한 장 - 목차(소제목 자체의 id 로 간다) + 절. */
export function v2Guide(slug: string): string | null {
  const g = guide(slug)
  if (!g) return null
  const toc = `<nav class="toc" aria-label="목차"><p class="toc-head">목차</p><ul class="toc-list">${g.sections
    .map((s, k) => `<li><a href="#sec-${k + 1}">${esc(s.title)}</a></li>`)
    .join('')}</ul></nav>`
  const secs = g.sections
    .map((s, k) => `<section class="g-sec"><h2 id="sec-${k + 1}">${esc(s.title)}</h2>${s.body.map((p) => `<p>${p}</p>`).join('')}</section>`)
    .join('\n')
  const main = `
  <section class="subhero">
    <div class="wrap">
      <p class="crumb"><a href="/guide">안내</a></p>
      <h1>${esc(g.title)}</h1>
      <p class="sub">${esc(g.lead)}</p>
      ${byline(g)}
    </div>
  </section>
  <section style="padding: 70px 0 100px;">
    <div class="wrap" style="max-width: 860px; line-height: 1.85;"><article>${toc}
${secs}
    </article></div>
  </section>`
  return v2Shell(`/guide/${g.slug}`, `${g.title} | 아이티무유`, g.desc, main, {
    article: true,
    datePublished: g.datePublished,
    dateModified: g.dateModified,
  })
}

const GUIDE_DESC = '아이티무유가 하는 일을 글로 정리했습니다. LogiNexio의 네 가지 기능과 파일럿 모집, 연구개발부서의 세 가지 연구 분야.'

/** /guide 목록. */
export function v2GuideIndex(): string {
  const main = `
  <section class="subhero">
    <div class="wrap">
      <p class="crumb">ITmoou — Guide</p>
      <h1>안내</h1>
      <p class="sub">${GUIDE_DESC}</p>
    </div>
  </section>
  <section style="padding: 70px 0 100px;">
    <div class="wrap" style="max-width: 860px; line-height: 1.85;">
${GUIDES.map(
  (g) => `      <section class="g-sec"><h2 id="${g.slug}"><a href="/guide/${g.slug}">${esc(g.title)}</a></h2><p>${esc(g.desc)}</p><p class="byline-sm">게시 <time datetime="${g.datePublished}">${g.datePublished}</time></p></section>`,
).join('\n')}
    </div>
  </section>`
  return v2Shell('/guide', '안내 | 아이티무유', GUIDE_DESC, main, { type: 'CollectionPage' })
}

/** /careers - 채용 사이트로 바로 보내던 것을 한 장으로(메뉴 「인재영입」의 목적지가 정상 페이지가 되게). 글은 연구개발 페이지의 채용 구역과 같다. */
export function v2Careers(jobsUrl: string): string {
  const main = `
  <section class="subhero">
    <div class="wrap">
      <p class="crumb">ITmoou — Careers</p>
      <h1>인재영입</h1>
      <p class="sub">함께 연구할 동료를 찾습니다. 오래된 산업을 소프트웨어로 다시 만드는 일. 그 초기 멤버가 될 분을 기다립니다.</p>
    </div>
  </section>
  <section style="padding: 70px 0 100px;">
    <div class="wrap" style="max-width: 860px; line-height: 1.85;">
      <h2 id="jobs">채용 공고와 지원</h2>
      <p>채용 공고와 지원은 채용 사이트에서 진행합니다. 아이티무유 연구개발부서는 LogiNexio의 핵심 기술을 직접 설계하고 구현합니다.</p>
      <p><a class="btn btn-dark" href="${esc(jobsUrl)}" target="_blank" rel="noopener">채용 공고 보기 ↗</a></p>
      <h2 id="what-we-do">우리가 하는 일</h2>
      <p>수출 기업의 하루를 다시 설계합니다. 물류 담당자가 엑셀과 이메일 사이에서 잃어버리는 시간을, 소프트웨어로 되찾는 일을 합니다. 자세한 이야기는 <a href="/rnd">연구개발</a>과 <a href="/guide">안내</a>에 있습니다.</p>
    </div>
  </section>`
  return v2Shell('/careers', '인재영입 | 아이티무유', '아이티무유 채용 안내. 함께 연구할 동료를 찾습니다. 채용 공고와 지원은 채용 사이트에서 진행합니다.', main)
}
