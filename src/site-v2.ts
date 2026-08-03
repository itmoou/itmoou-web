// site-v2: 2026-07 재구축 디자인 (기획안 v1.1 · 시안 v8.5 기준)
// 구 템플릿(getXXXHTML)은 index.tsx에 남아 있으나 라우트에서 분리됨.

const LOGINEXIO_URL = 'https://loginexio.com' // D-7 확정 (2026-07-20)

export interface AnnouncementRow {
  id: number
  number: number
  category: string
  title: string
  notice_date: string
}

function v2Head(path: string, title: string, desc: string): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="https://itmoou.com${path === '/' ? '/' : path}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:type" content="website">
<meta property="og:locale" content="ko_KR">
<meta property="og:url" content="https://itmoou.com${path === '/' ? '' : path}">
<meta property="og:image" content="https://itmoou.com/images/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "아이티무유",
  "alternateName": "ITMOOU Inc.",
  "url": "https://itmoou.com",
  "logo": "https://itmoou.com/images/logo-web.png",
  "description": "수출 중소기업을 위한 B2B 물류 SaaS LogiNexio(로지넥시오)를 만드는 소프트웨어 회사",
  "email": "sales@itmoou.com",
  "brand": { "@type": "Brand", "name": "LogiNexio", "url": "https://loginexio.com" }
}
</script>
<meta name="google-site-verification" content="KhGq0NfIOoXgDx4WuQvY1oDfxoRarwb01z1TRYDUYrQ">
<meta name="naver-site-verification" content="891252343b02692b4a90f8d07ad88ce500e77512">
<link rel="shortcut icon" href="/favicon.ico" type="image/x-icon">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png">
<link rel="apple-touch-icon" href="/apple-icon-180x180.png">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<link rel="stylesheet" href="/static/site-v2.css?v=20260803">
<!-- GA4 - 유입·전환 측정 (개인정보처리방침 §부칙 고지) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-2LV7ZK818L"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-2LV7ZK818L');
</script>
<!-- Microsoft Clarity - 히트맵·세션 분석 -->
<script type="text/javascript">
(function(c,l,a,r,i,t,y){
c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "xujhkypwa3");
</script>
</head>
<body>`
}

const V2_TAIL = `<script src="/static/site-v2.js?v=20260720d"></script>
</body>
</html>`

export function v2Home(): string {
  return v2Head('/', '아이티무유 | 기술로 세상을 움직이다', '아이티무유는 수출 현장의 실무 경험에서 출발한 B2B 소프트웨어 회사입니다. 수출 물류 SaaS LogiNexio를 만듭니다.') + `
<header class="gnb" id="gnb">
  <div class="wrap gnb-inner">
    <a href="/" class="logo"><img src="/images/logo-web.png" alt="아이티무유"></a>
    <nav class="menu" aria-label="주 메뉴">
      <a class="item" href="/company">회사소개</a>
      <a class="item" href="/service">서비스</a>
      <a class="item" href="/rnd">연구개발</a>
      <a class="item" href="/newsroom">뉴스룸</a>
      <a class="item" href="/careers" target="_blank" rel="noopener">인재영입<span class="ext">↗</span></a>
    </nav>
    <div class="gnb-right">
      <a class="btn btn-dark btn-sm" href="/contact">문의하기</a>
      <button class="menu-toggle" type="button" aria-label="메뉴 열기" aria-expanded="false">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
    </div>
  </div>
  <nav class="m-nav" aria-label="모바일 메뉴">
    <a href="/company">회사소개</a>
    <a href="/service">서비스</a>
    <a href="/rnd">연구개발</a>
    <a href="/newsroom">뉴스룸</a>
    <a href="/careers" target="_blank" rel="noopener">인재영입<span class="ext">↗</span></a>
    <a href="/contact">문의하기</a>
  </nav>
</header>

<main>
  <!-- 히어로: 브랜드 선언 -->
  <section class="hero">
    <svg class="routes" viewBox="0 0 1440 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <path d="M -40 480 C 260 400, 520 440, 760 350 S 1250 210, 1500 270" />
      <path class="lit" d="M -40 550 C 300 480, 600 510, 880 400 S 1300 270, 1500 340" />
      <path d="M -40 620 C 340 570, 680 600, 980 480 S 1350 350, 1500 420" />
      <circle cx="352" cy="507" r="3" /><text x="336" y="494">KRPUS</text>
      <circle cx="1122" cy="332" r="3" /><text x="1104" y="319">USLGB</text>
      <g class="motion-only">
        <circle class="shipglow" r="9">
          <animateMotion dur="22s" repeatCount="indefinite" path="M -40 550 C 300 480, 600 510, 880 400 S 1300 270, 1500 340" />
        </circle>
        <circle class="shipdot" r="3.5">
          <animateMotion dur="22s" repeatCount="indefinite" path="M -40 550 C 300 480, 600 510, 880 400 S 1300 270, 1500 340" />
        </circle>
      </g>
    </svg>
    <div class="wrap hero-inner">
      <p class="eng">ITmoou — B2B Software Company</p>
      <h1>기술로 세상을<br>움직이다</h1>
      <p class="lede">
        아이티무유는 수출 현장의 실무 경험에서 출발한 소프트웨어 회사입니다.
        물류 담당자가 엑셀과 이메일 사이에서 잃어버리는 시간을, 소프트웨어로 되찾는 일을 합니다.
      </p>
      <span class="scroll-hint">SCROLL</span>
    </div>
  </section>

  <!-- 큰 문장 -->
  <section class="statement">
    <div class="wrap reveal">
      <p class="label">우리가 하는 일</p>
      <h2>
        <span class="lead-seg">물류 담당자의 하루는 엑셀 복사와 이메일 대기로 사라집니다.</span>
        <span class="dim">우리는 그 시간을 소프트웨어로 되찾아,
        수출 기업의 하루를 다시 설계합니다.</span>
      </h2>
      <p class="follow">
        데이터와 AI로 중소 수출 기업의 운영을 표준화하는 디지털 운영 OS.
        그것이 아이티무유가 그리는 미래입니다.
      </p>
    </div>
  </section>

  <!-- 서비스 -->
  <section class="service-band">
    <div class="wrap">
      <div class="sec-head reveal">
        <p class="label">Our Service</p>
        <h2>우리의 서비스</h2>
        <p class="sub">아이티무유는 수출 물류 SaaS LogiNexio를 만듭니다.</p>
      </div>
      <div class="svc reveal">
        <div class="svc-body">
          <div class="svc-logo">Logi<b>Nexio</b></div>
          <span class="svc-tag"><span class="dot" aria-hidden="true"></span>2026 V1 베타 · 파일럿 모집 중</span>
          <h3>수출 업무 전체를 하나의 흐름으로 잇는<br>물류 올인원 SaaS</h3>
          <p class="desc">
            수주 등록부터 3D 적재 시뮬레이션, 포워더 견적 비교, 수출 서류 자동 생성,
            선적 트래킹까지. 한 번 입력한 데이터가 끝까지 흘러갑니다.
          </p>
          <ul class="points">
            <li><b>3D 적재 시뮬레이션</b> — 컨테이너 1대를 줄이는 순간이 보입니다</li>
            <li><b>견적 비교</b> — 포워더는 가입 없이 이메일 답장만 하면 됩니다</li>
            <li><b>서류 자동 생성</b> — CI/PL이 30초에 완성됩니다</li>
            <li><b>선적 트래킹</b> — 도착까지 한 화면에서 확인합니다</li>
          </ul>
          <div class="svc-ctas">
            <a class="btn btn-dark" href="${LOGINEXIO_URL}" target="_blank" rel="noopener">LogiNexio 사이트 가기 ↗</a>
            <a class="btn btn-ghost" href="/contact">도입 문의</a>
          </div>
        </div>
        <div class="svc-visual">
          <div class="shot" role="img" aria-label="LogiNexio 3D 적재 시뮬레이션 화면 예시">
            <div class="shot-chrome">
              <span class="d"></span><span class="d"></span><span class="d"></span>
              <span class="addr">loginexio.com</span>
            </div>
            <div class="shot-body">
              <div class="p-head"><span class="p-title">3D 적재 시뮬레이션</span><span class="p-meta">40FT HC · 샘플</span></div>
              <svg class="iso" viewBox="0 0 380 216" aria-hidden="true"><polygon points="150.0,108.0 283.4,185.0 235.7,212.5 102.4,135.5" fill="rgba(49,109,202,0.18)" stroke="rgba(121,184,255,0.45)" stroke-width="1" stroke-linejoin="round"/><polygon points="150.0,108.0 283.4,185.0 283.4,130.0 150.0,53.0" fill="none" stroke="rgba(121,184,255,0.45)" stroke-width="1" opacity="0.85" stroke-linejoin="round"/><polygon points="150.0,108.0 102.4,135.5 102.4,80.5 150.0,53.0" fill="none" stroke="rgba(121,184,255,0.45)" stroke-width="1" opacity="0.85" stroke-linejoin="round"/><polygon points="150.0,53.0 283.4,130.0 235.7,157.5 102.4,80.5" fill="none" stroke="rgba(121,184,255,0.45)" stroke-width="1" opacity="0.4" stroke-linejoin="round"/><polygon points="283.4,185.0 235.7,212.5 235.7,157.5 283.4,130.0" fill="none" stroke="rgba(121,184,255,0.45)" stroke-width="1" opacity="0.4" stroke-linejoin="round"/><polygon points="130.9,119.0 159.5,135.5 159.5,113.5 130.9,97.0" fill="#2f6cb8" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="178.6,124.5 159.5,135.5 159.5,113.5 178.6,102.5" fill="#24578f" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="150.0,86.0 178.6,102.5 159.5,113.5 130.9,97.0" fill="#5fa9ee" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="102.4,135.5 130.9,152.0 130.9,130.0 102.4,113.5" fill="#4f89cf" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="159.5,135.5 130.9,152.0 130.9,130.0 159.5,113.5" fill="#3d6ea8" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="130.9,97.0 159.5,113.5 130.9,130.0 102.4,113.5" fill="#8cc4f7" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="130.9,97.0 159.5,113.5 159.5,91.5 130.9,75.0" fill="#245c9e" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="178.6,102.5 159.5,113.5 159.5,91.5 178.6,80.5" fill="#1c4a7f" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="150.0,64.0 178.6,80.5 159.5,91.5 130.9,75.0" fill="#3c86d6" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="159.5,135.5 188.1,152.0 188.1,130.0 159.5,113.5" fill="#4f89cf" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="207.2,141.0 188.1,152.0 188.1,130.0 207.2,119.0" fill="#3d6ea8" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="178.6,102.5 207.2,119.0 188.1,130.0 159.5,113.5" fill="#8cc4f7" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="102.4,113.5 130.9,130.0 130.9,108.0 102.4,91.5" fill="#2f6cb8" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="159.5,113.5 130.9,130.0 130.9,108.0 159.5,91.5" fill="#24578f" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="130.9,75.0 159.5,91.5 130.9,108.0 102.4,91.5" fill="#5fa9ee" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="130.9,75.0 159.5,91.5 159.5,80.5 130.9,64.0" fill="#4f89cf" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="178.6,80.5 159.5,91.5 159.5,80.5 178.6,69.5" fill="#3d6ea8" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="150.0,53.0 178.6,69.5 159.5,80.5 130.9,64.0" fill="#8cc4f7" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="130.9,152.0 159.5,168.5 159.5,146.5 130.9,130.0" fill="#245c9e" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="188.1,152.0 159.5,168.5 159.5,146.5 188.1,130.0" fill="#1c4a7f" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="159.5,113.5 188.1,130.0 159.5,146.5 130.9,130.0" fill="#3c86d6" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="159.5,113.5 188.1,130.0 188.1,108.0 159.5,91.5" fill="#2f6cb8" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="207.2,119.0 188.1,130.0 188.1,108.0 207.2,97.0" fill="#24578f" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="178.6,80.5 207.2,97.0 188.1,108.0 159.5,91.5" fill="#5fa9ee" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="188.1,152.0 216.7,168.5 216.7,146.5 188.1,130.0" fill="#2f6cb8" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="235.7,157.5 216.7,168.5 216.7,146.5 235.7,135.5" fill="#24578f" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="207.2,119.0 235.7,135.5 216.7,146.5 188.1,130.0" fill="#5fa9ee" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="102.4,91.5 130.9,108.0 130.9,97.0 102.4,80.5" fill="#245c9e" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="159.5,91.5 130.9,108.0 130.9,97.0 159.5,80.5" fill="#1c4a7f" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="130.9,64.0 159.5,80.5 130.9,97.0 102.4,80.5" fill="#3c86d6" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="130.9,130.0 159.5,146.5 159.5,124.5 130.9,108.0" fill="#4f89cf" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="188.1,130.0 159.5,146.5 159.5,124.5 188.1,108.0" fill="#3d6ea8" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="159.5,91.5 188.1,108.0 159.5,124.5 130.9,108.0" fill="#8cc4f7" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="159.5,91.5 188.1,108.0 188.1,97.0 159.5,80.5" fill="#2f6cb8" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="207.2,97.0 188.1,108.0 188.1,97.0 207.2,86.0" fill="#24578f" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="178.6,69.5 207.2,86.0 188.1,97.0 159.5,80.5" fill="#5fa9ee" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="159.5,168.5 188.1,185.0 188.1,163.0 159.5,146.5" fill="#4f89cf" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="216.7,168.5 188.1,185.0 188.1,163.0 216.7,146.5" fill="#3d6ea8" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="188.1,130.0 216.7,146.5 188.1,163.0 159.5,146.5" fill="#8cc4f7" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="188.1,130.0 216.7,146.5 216.7,124.5 188.1,108.0" fill="#c58c3d" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="235.7,135.5 216.7,146.5 216.7,124.5 235.7,113.5" fill="#a4732f" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="207.2,97.0 235.7,113.5 216.7,124.5 188.1,108.0" fill="#f0bd6e" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="216.7,168.5 245.3,185.0 245.3,163.0 216.7,146.5" fill="#c58c3d" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="264.3,174.0 245.3,185.0 245.3,163.0 264.3,152.0" fill="#a4732f" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="235.7,135.5 264.3,152.0 245.3,163.0 216.7,146.5" fill="#f0bd6e" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="130.9,108.0 159.5,124.5 159.5,113.5 130.9,97.0" fill="#4f89cf" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="188.1,108.0 159.5,124.5 159.5,113.5 188.1,97.0" fill="#3d6ea8" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="159.5,80.5 188.1,97.0 159.5,113.5 130.9,97.0" fill="#8cc4f7" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="159.5,146.5 188.1,163.0 188.1,141.0 159.5,124.5" fill="#245c9e" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="216.7,146.5 188.1,163.0 188.1,141.0 216.7,124.5" fill="#1c4a7f" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="188.1,108.0 216.7,124.5 188.1,141.0 159.5,124.5" fill="#3c86d6" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="188.1,185.0 216.7,201.5 216.7,179.5 188.1,163.0" fill="#2f6cb8" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="245.3,185.0 216.7,201.5 216.7,179.5 245.3,163.0" fill="#24578f" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="216.7,146.5 245.3,163.0 216.7,179.5 188.1,163.0" fill="#5fa9ee" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="216.7,146.5 245.3,163.0 245.3,141.0 216.7,124.5" fill="#4f89cf" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="264.3,152.0 245.3,163.0 245.3,141.0 264.3,130.0" fill="#3d6ea8" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="235.7,113.5 264.3,130.0 245.3,141.0 216.7,124.5" fill="#8cc4f7" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="188.1,163.0 216.7,179.5 216.7,157.5 188.1,141.0" fill="#2f6cb8" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="245.3,163.0 216.7,179.5 216.7,157.5 245.3,141.0" fill="#24578f" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="216.7,124.5 245.3,141.0 216.7,157.5 188.1,141.0" fill="#5fa9ee" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/></svg>
              <div class="load-stats">
                <span class="big">87%</span>
                <div class="bar"><i></i></div>
                <span class="lbl">적재율</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- 일하는 방식 -->
  <section class="ways">
    <div class="wrap">
      <div class="sec-head reveal">
        <p class="label">How we work</p>
        <h2>아이티무유가 일하는 방식</h2>
      </div>
      <div class="way-grid reveal">
        <div class="way">
          <span class="no">01</span>
          <h3>현장에서 출발합니다</h3>
          <p>회의실의 가설이 아니라 수출 실무의 하루에서 문제를 찾습니다. 서류 필드 하나, 적재 순서 하나까지 실측으로 확인합니다.</p>
        </div>
        <div class="way">
          <span class="no">02</span>
          <h3>검증된 것만 말합니다</h3>
          <p>모든 수치는 출처와 함께 표기합니다. 고객 사례는 실제 고객이 생긴 뒤에만 싣습니다. 과장은 제품을 이길 수 없습니다.</p>
        </div>
        <div class="way">
          <span class="no">03</span>
          <h3>한 번에, 오류 없이</h3>
          <p>같은 데이터를 두 번 입력하지 않게 만듭니다. 사람의 실수가 끼어들 틈을 줄이는 것이 우리가 생각하는 좋은 소프트웨어입니다.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- 지금 아이티무유는 -->
  <section class="now-band">
    <div class="wrap">
      <div class="sec-head reveal">
        <p class="label">Now</p>
        <h2>지금 아이티무유는</h2>
      </div>
      <div class="now-grid reveal">
        <div class="now-card">
          <span class="tag">Pilot</span>
          <h3>2026 파일럿 파트너를 모집하고 있습니다</h3>
          <p>LogiNexio를 가장 먼저 도입하고 제품의 방향을 함께 만들 수출 제조기업을 찾습니다. 온보딩과 기술 지원을 팀이 직접 제공합니다.</p>
          <a class="go" href="/contact">파일럿 문의 →</a>
        </div>
        <div class="now-card">
          <span class="tag">R&amp;D</span>
          <h3>현장의 문제를 푸는 기술을 연구합니다</h3>
          <p>적재 최적화 알고리즘, 수출 서류 자동화, 선박 운항(AIS) 데이터 처리. 연구개발부서가 LogiNexio의 핵심 기술을 직접 만듭니다.</p>
          <a class="go" href="/rnd">연구개발 →</a>
        </div>
        <div class="now-card">
          <span class="tag">Careers</span>
          <h3>함께 성장할 동료를 찾고 있습니다</h3>
          <p>수출 물류라는 오래된 산업을 소프트웨어로 다시 만드는 일. 그 초기 멤버가 될 분을 기다립니다.</p>
          <a class="go" href="/careers" target="_blank" rel="noopener">채용 홈페이지 ↗</a>
        </div>
      </div>
    </div>
  </section>

  <!-- 채용 밴드 -->
  <section class="careers">
    <div class="wrap reveal">
      <p class="label">We're hiring</p>
      <h2>오래된 산업을 다시 만드는 일,<br>함께 하시겠습니까?</h2>
      <p class="sub">수출 물류의 하루를 바꾸는 소프트웨어를 만듭니다. 청주에서, 그리고 어디서든.</p>
      <a class="btn btn-white btn-lg" href="/careers" target="_blank" rel="noopener">인재영입 바로가기 ↗</a>
    </div>
  </section>

  <!-- 회사 정보 -->
  <section class="info-sec">
    <div class="wrap">
      <div class="sec-head reveal">
        <p class="label">Company</p>
        <h2>아이티무유 주식회사</h2>
      </div>
      <div class="info reveal">
        <div class="info-card">
          <span class="c-label">오시는 길</span>
          <p><b>충청북도 청주시 흥덕구 공단로126번길 51</b><br>청주산단스타트업센터 502호</p>
          <a class="go" href="https://map.kakao.com/link/search/청주산단스타트업센터" target="_blank" rel="noopener">지도 보기 ↗</a>
        </div>
        <div class="info-card">
          <span class="c-label">문의</span>
          <p><b>043-715-8553</b><br>sales@itmoou.com · 평일 09:00–18:00</p>
          <a class="go" href="/contact">문의하기 →</a>
        </div>
        <div class="info-card">
          <span class="c-label">공고</span>
          <p><b>공식 공고사항</b><br>주주총회 및 법정 공고를 게시합니다.</p>
          <a class="go" href="/newsroom">공고 보기 →</a>
        </div>
      </div>
    </div>
  </section>
</main>

<footer class="foot">
  <div class="wrap foot-grid">
    <div>
      <span class="flogo"><img src="/images/logo-web.png" alt="아이티무유"></span>
      <p style="margin: 10px 0 0; font-size: 0.92rem; font-weight: 700; color: var(--ink-soft);">기술로 세상을 움직이다</p>
      <p class="corp">
        아이티무유 주식회사 · 대표이사 심영민<br>
        사업자등록번호 229-81-43410<br>
        충청북도 청주시 흥덕구 공단로126번길 51, 청주산단스타트업센터 502호<br>
        © 2026 ITmoou Co., Ltd.
      </p>
    </div>
    <div>
      <h4>서비스</h4>
      <ul>
        <li><a href="${LOGINEXIO_URL}" target="_blank" rel="noopener">LogiNexio ↗</a></li>
        <li><a href="/rnd">연구개발</a></li>
        <li><a href="/contact">도입 문의</a></li>
      </ul>
    </div>
    <div>
      <h4>회사</h4>
      <ul>
        <li><a href="/company">회사소개</a></li>
        <li><a href="/newsroom">뉴스룸</a></li>
        <li><a href="/careers" target="_blank" rel="noopener">인재영입 ↗</a></li>
        <li><a href="/newsroom">공고</a></li>
        <li><a href="/privacy-policy">개인정보처리방침</a></li>
      </ul>
    </div>
  </div>
</footer>
` + V2_TAIL
}

function esc(v: string): string {
  return v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function v2Company(history: { year: string; content: string }[] = []): string {
  const byYear = new Map<string, string[]>()
  for (const h of history) {
    if (!byYear.has(h.year)) byYear.set(h.year, [])
    byYear.get(h.year)!.push(esc(h.content))
  }
  const timelineHtml = history.length
    ? '<ul class="timeline reveal">' + [...byYear.entries()].map(([yr, items]) =>
        `<li><span class="yr">${yr}</span><span class="tx">${items.join('<br>')}</span></li>`).join('') + '</ul>'
    : '<ul class="timeline reveal"><li><span class="yr">2026</span><span class="tx">LogiNexio V1 베타 · 파일럿 파트너 모집</span></li></ul>'

  return v2Head('/company', '회사소개 | 아이티무유', '기술로 세상을 움직이다. 아이티무유의 비전, 미션, 걸어온 길을 소개합니다.') + `
<header class="gnb" id="gnb">
  <div class="wrap gnb-inner">
    <a href="/" class="logo"><img src="/images/logo-web.png" alt="아이티무유"></a>
    <nav class="menu" aria-label="주 메뉴">
      <a class="item" href="/company">회사소개</a>
      <a class="item" href="/service">서비스</a>
      <a class="item" href="/rnd">연구개발</a>
      <a class="item" href="/newsroom">뉴스룸</a>
      <a class="item" href="/careers" target="_blank" rel="noopener">인재영입<span class="ext">↗</span></a>
    </nav>
    <div class="gnb-right">
      <a class="btn btn-dark btn-sm" href="/contact">문의하기</a>
      <button class="menu-toggle" type="button" aria-label="메뉴 열기" aria-expanded="false">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
    </div>
  </div>
  <nav class="m-nav" aria-label="모바일 메뉴">
    <a href="/company">회사소개</a>
    <a href="/service">서비스</a>
    <a href="/rnd">연구개발</a>
    <a href="/newsroom">뉴스룸</a>
    <a href="/careers" target="_blank" rel="noopener">인재영입<span class="ext">↗</span></a>
    <a href="/contact">문의하기</a>
  </nav>
</header>

<main>
  <section class="subhero">
    <div class="wrap">
      <p class="crumb">ITmoou — About</p>
      <h1>회사소개</h1>
      <p class="sub">기술로 세상을 움직이다. 아이티무유를 소개합니다.</p>
    </div>
  </section>

  <section class="statement" style="padding: 120px 0 110px;">
    <div class="wrap reveal">
      <p class="label">About us</p>
      <h2>
        <span class="lead-seg">아이티무유는 수출 현장의 실무 경험에서 출발한 소프트웨어 회사입니다.</span>
        <span class="dim">회의실의 가설이 아니라, 물류 담당자의 하루에서 문제를 찾고 소프트웨어로 풉니다.</span>
      </h2>
    </div>
  </section>

  <section class="ways" style="padding: 0 0 120px;">
    <div class="wrap">
      <div class="sec-head reveal">
        <p class="label">Vision · Mission · Values</p>
        <h2>복잡한 업무를, 한 번에, 오류 없이</h2>
      </div>
      <div class="cols reveal">
        <div class="col">
          <span class="c-label">비전</span>
          <h3>중소 수출 기업의 운영을 표준화하는 디지털 운영 OS</h3>
          <p>기업마다 제각각인 수출 업무를 하나의 표준 흐름으로 만듭니다.</p>
        </div>
        <div class="col">
          <span class="c-label">미션</span>
          <h3>모든 업무를 한 번에, 오류 없이 처리하는 원스톱 SaaS</h3>
          <p>같은 데이터를 두 번 입력하지 않고, 실수가 끼어들 틈을 줄입니다.</p>
        </div>
        <div class="col">
          <span class="c-label">핵심 가치</span>
          <h3>혁신 · 고객 성공 · 정직</h3>
          <p>검증된 것만 말하고, 고객의 성과로 증명합니다.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="now-band" style="padding: 110px 0 120px;">
    <div class="wrap reveal">
      <div class="sec-head">
        <p class="label">CEO Message</p>
        <h2>대표의 한마디</h2>
      </div>
      <blockquote class="quote">
        <p class="q">"저는 수출 기업에서 물류 실무를 직접 해봤습니다.
        LogiNexio는 그 시절의 저에게 필요했던 도구입니다.
        같은 하루를 보내고 계신 분들께, 다른 하루를 만들어드리겠습니다."</p>
        <cite>아이티무유 대표이사 심영민</cite>
      </blockquote>
    </div>
  </section>

  <section class="ways" style="padding: 120px 0;">
    <div class="wrap">
      <div class="sec-head reveal">
        <p class="label">History</p>
        <h2>걸어온 길</h2>
      </div>
      ${timelineHtml}
    </div>
  </section>

  <section class="info-sec" style="padding: 0 0 128px;">
    <div class="wrap">
      <div class="sec-head reveal">
        <p class="label">Location</p>
        <h2>오시는 길</h2>
      </div>
      <div class="reveal">
        <div class="map-box">
          <div id="daumRoughmapContainer1769348918868" class="root_daum_roughmap root_daum_roughmap_landing" style="width:100%;"></div>
        </div>
        <script charset="UTF-8" class="daum_roughmap_loader_script" src="https://ssl.daumcdn.net/dmaps/map_js_init/roughmapLoader.js"></script>
        <script charset="UTF-8">
          new daum.roughmap.Lander({
            "timestamp" : "1769348918868",
            "key" : "gmuvtvo88pm",
            "mapWidth" : "100%",
            "mapHeight" : "400"
          }).render();
        </script>
        <div class="info">
          <div class="info-card">
            <span class="c-label">주소</span>
            <p><b>충청북도 청주시 흥덕구 공단로126번길 51</b><br>청주산단스타트업센터 502호 (우 28576)</p>
          </div>
          <div class="info-card">
            <span class="c-label">자가용</span>
            <p>중부고속도로 서청주IC → 청주산단스타트업센터<br>건물 뒤편 주차장 이용 가능</p>
          </div>
          <div class="info-card">
            <span class="c-label">연락처</span>
            <p><b>043-715-8553</b><br>sales@itmoou.com · 평일 09:00–18:00</p>
          </div>
        </div>
      </div>
    </div>
  </section>

</main>

<footer class="foot">
  <div class="wrap foot-grid">
    <div>
      <span class="flogo"><img src="/images/logo-web.png" alt="아이티무유"></span>
      <p style="margin: 10px 0 0; font-size: 0.92rem; font-weight: 700; color: var(--ink-soft);">기술로 세상을 움직이다</p>
      <p class="corp">
        아이티무유 주식회사 · 대표이사 심영민<br>
        사업자등록번호 229-81-43410<br>
        충청북도 청주시 흥덕구 공단로126번길 51, 청주산단스타트업센터 502호<br>
        © 2026 ITmoou Co., Ltd.
      </p>
    </div>
    <div>
      <h4>서비스</h4>
      <ul>
        <li><a href="${LOGINEXIO_URL}" target="_blank" rel="noopener">LogiNexio ↗</a></li>
        <li><a href="/rnd">연구개발</a></li>
        <li><a href="/contact">도입 문의</a></li>
      </ul>
    </div>
    <div>
      <h4>회사</h4>
      <ul>
        <li><a href="/company">회사소개</a></li>
        <li><a href="/newsroom">뉴스룸</a></li>
        <li><a href="/careers" target="_blank" rel="noopener">인재영입 ↗</a></li>
        <li><a href="/newsroom">공고</a></li>
        <li><a href="/privacy-policy">개인정보처리방침</a></li>
      </ul>
    </div>
  </div>
</footer>
` + V2_TAIL
}

export function v2Service(): string {
  return v2Head('/service', '서비스 | 아이티무유', '수출 업무 전체를 하나의 흐름으로 잇는 물류 올인원 SaaS, LogiNexio를 소개합니다.') + `
<header class="gnb" id="gnb">
  <div class="wrap gnb-inner">
    <a href="/" class="logo"><img src="/images/logo-web.png" alt="아이티무유"></a>
    <nav class="menu" aria-label="주 메뉴">
      <a class="item" href="/company">회사소개</a>
      <a class="item" href="/service">서비스</a>
      <a class="item" href="/rnd">연구개발</a>
      <a class="item" href="/newsroom">뉴스룸</a>
      <a class="item" href="/careers" target="_blank" rel="noopener">인재영입<span class="ext">↗</span></a>
    </nav>
    <div class="gnb-right">
      <a class="btn btn-dark btn-sm" href="/contact">문의하기</a>
      <button class="menu-toggle" type="button" aria-label="메뉴 열기" aria-expanded="false">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
    </div>
  </div>
  <nav class="m-nav" aria-label="모바일 메뉴">
    <a href="/company">회사소개</a>
    <a href="/service">서비스</a>
    <a href="/rnd">연구개발</a>
    <a href="/newsroom">뉴스룸</a>
    <a href="/careers" target="_blank" rel="noopener">인재영입<span class="ext">↗</span></a>
    <a href="/contact">문의하기</a>
  </nav>
</header>

<main>
  <section class="subhero">
    <div class="wrap">
      <p class="crumb">ITmoou — Service</p>
      <h1>서비스</h1>
      <p class="sub">아이티무유는 수출 물류 SaaS LogiNexio를 만듭니다.</p>
    </div>
  </section>

  <section class="service-band" style="padding: 110px 0 120px;">
    <div class="wrap">
      <div class="svc reveal">
        <div class="svc-body">
          <div class="svc-logo">Logi<b>Nexio</b></div>
          <span class="svc-tag"><span class="dot" aria-hidden="true"></span>2026 V1 베타 · 파일럿 모집 중</span>
          <h3>수출 업무 전체를 하나의 흐름으로 잇는<br>물류 올인원 SaaS</h3>
          <p class="desc">
            수주 등록부터 3D 적재 시뮬레이션, 포워더 견적 비교, 수출 서류 자동 생성,
            선적 트래킹까지. 한 번 입력한 데이터가 끝까지 흘러갑니다.
          </p>
          <div class="svc-ctas">
            <a class="btn btn-dark" href="${LOGINEXIO_URL}" target="_blank" rel="noopener">LogiNexio 사이트 가기 ↗</a>
            <a class="btn btn-ghost" href="/contact">도입 문의</a>
          </div>
        </div>
        <div class="svc-visual">
          <div class="shot" role="img" aria-label="LogiNexio 3D 적재 시뮬레이션 화면 예시">
            <div class="shot-chrome">
              <span class="d"></span><span class="d"></span><span class="d"></span>
              <span class="addr">loginexio.com</span>
            </div>
            <div class="shot-body">
              <div class="p-head"><span class="p-title">3D 적재 시뮬레이션</span><span class="p-meta">40FT HC · 샘플</span></div>
              <svg class="iso" viewBox="0 0 380 216" aria-hidden="true"><polygon points="150.0,108.0 283.4,185.0 235.7,212.5 102.4,135.5" fill="rgba(49,109,202,0.18)" stroke="rgba(121,184,255,0.45)" stroke-width="1" stroke-linejoin="round"/><polygon points="150.0,108.0 283.4,185.0 283.4,130.0 150.0,53.0" fill="none" stroke="rgba(121,184,255,0.45)" stroke-width="1" opacity="0.85" stroke-linejoin="round"/><polygon points="150.0,108.0 102.4,135.5 102.4,80.5 150.0,53.0" fill="none" stroke="rgba(121,184,255,0.45)" stroke-width="1" opacity="0.85" stroke-linejoin="round"/><polygon points="150.0,53.0 283.4,130.0 235.7,157.5 102.4,80.5" fill="none" stroke="rgba(121,184,255,0.45)" stroke-width="1" opacity="0.4" stroke-linejoin="round"/><polygon points="283.4,185.0 235.7,212.5 235.7,157.5 283.4,130.0" fill="none" stroke="rgba(121,184,255,0.45)" stroke-width="1" opacity="0.4" stroke-linejoin="round"/><polygon points="130.9,119.0 159.5,135.5 159.5,113.5 130.9,97.0" fill="#2f6cb8" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="178.6,124.5 159.5,135.5 159.5,113.5 178.6,102.5" fill="#24578f" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="150.0,86.0 178.6,102.5 159.5,113.5 130.9,97.0" fill="#5fa9ee" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="102.4,135.5 130.9,152.0 130.9,130.0 102.4,113.5" fill="#4f89cf" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="159.5,135.5 130.9,152.0 130.9,130.0 159.5,113.5" fill="#3d6ea8" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="130.9,97.0 159.5,113.5 130.9,130.0 102.4,113.5" fill="#8cc4f7" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="130.9,97.0 159.5,113.5 159.5,91.5 130.9,75.0" fill="#245c9e" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="178.6,102.5 159.5,113.5 159.5,91.5 178.6,80.5" fill="#1c4a7f" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="150.0,64.0 178.6,80.5 159.5,91.5 130.9,75.0" fill="#3c86d6" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="159.5,135.5 188.1,152.0 188.1,130.0 159.5,113.5" fill="#4f89cf" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="207.2,141.0 188.1,152.0 188.1,130.0 207.2,119.0" fill="#3d6ea8" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="178.6,102.5 207.2,119.0 188.1,130.0 159.5,113.5" fill="#8cc4f7" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="102.4,113.5 130.9,130.0 130.9,108.0 102.4,91.5" fill="#2f6cb8" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="159.5,113.5 130.9,130.0 130.9,108.0 159.5,91.5" fill="#24578f" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="130.9,75.0 159.5,91.5 130.9,108.0 102.4,91.5" fill="#5fa9ee" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="130.9,75.0 159.5,91.5 159.5,80.5 130.9,64.0" fill="#4f89cf" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="178.6,80.5 159.5,91.5 159.5,80.5 178.6,69.5" fill="#3d6ea8" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="150.0,53.0 178.6,69.5 159.5,80.5 130.9,64.0" fill="#8cc4f7" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="130.9,152.0 159.5,168.5 159.5,146.5 130.9,130.0" fill="#245c9e" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="188.1,152.0 159.5,168.5 159.5,146.5 188.1,130.0" fill="#1c4a7f" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="159.5,113.5 188.1,130.0 159.5,146.5 130.9,130.0" fill="#3c86d6" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="159.5,113.5 188.1,130.0 188.1,108.0 159.5,91.5" fill="#2f6cb8" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="207.2,119.0 188.1,130.0 188.1,108.0 207.2,97.0" fill="#24578f" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="178.6,80.5 207.2,97.0 188.1,108.0 159.5,91.5" fill="#5fa9ee" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="188.1,152.0 216.7,168.5 216.7,146.5 188.1,130.0" fill="#2f6cb8" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="235.7,157.5 216.7,168.5 216.7,146.5 235.7,135.5" fill="#24578f" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="207.2,119.0 235.7,135.5 216.7,146.5 188.1,130.0" fill="#5fa9ee" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="102.4,91.5 130.9,108.0 130.9,97.0 102.4,80.5" fill="#245c9e" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="159.5,91.5 130.9,108.0 130.9,97.0 159.5,80.5" fill="#1c4a7f" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="130.9,64.0 159.5,80.5 130.9,97.0 102.4,80.5" fill="#3c86d6" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="130.9,130.0 159.5,146.5 159.5,124.5 130.9,108.0" fill="#4f89cf" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="188.1,130.0 159.5,146.5 159.5,124.5 188.1,108.0" fill="#3d6ea8" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="159.5,91.5 188.1,108.0 159.5,124.5 130.9,108.0" fill="#8cc4f7" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="159.5,91.5 188.1,108.0 188.1,97.0 159.5,80.5" fill="#2f6cb8" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="207.2,97.0 188.1,108.0 188.1,97.0 207.2,86.0" fill="#24578f" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="178.6,69.5 207.2,86.0 188.1,97.0 159.5,80.5" fill="#5fa9ee" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="159.5,168.5 188.1,185.0 188.1,163.0 159.5,146.5" fill="#4f89cf" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="216.7,168.5 188.1,185.0 188.1,163.0 216.7,146.5" fill="#3d6ea8" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="188.1,130.0 216.7,146.5 188.1,163.0 159.5,146.5" fill="#8cc4f7" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="188.1,130.0 216.7,146.5 216.7,124.5 188.1,108.0" fill="#c58c3d" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="235.7,135.5 216.7,146.5 216.7,124.5 235.7,113.5" fill="#a4732f" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="207.2,97.0 235.7,113.5 216.7,124.5 188.1,108.0" fill="#f0bd6e" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="216.7,168.5 245.3,185.0 245.3,163.0 216.7,146.5" fill="#c58c3d" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="264.3,174.0 245.3,185.0 245.3,163.0 264.3,152.0" fill="#a4732f" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="235.7,135.5 264.3,152.0 245.3,163.0 216.7,146.5" fill="#f0bd6e" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="130.9,108.0 159.5,124.5 159.5,113.5 130.9,97.0" fill="#4f89cf" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="188.1,108.0 159.5,124.5 159.5,113.5 188.1,97.0" fill="#3d6ea8" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="159.5,80.5 188.1,97.0 159.5,113.5 130.9,97.0" fill="#8cc4f7" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="159.5,146.5 188.1,163.0 188.1,141.0 159.5,124.5" fill="#245c9e" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="216.7,146.5 188.1,163.0 188.1,141.0 216.7,124.5" fill="#1c4a7f" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="188.1,108.0 216.7,124.5 188.1,141.0 159.5,124.5" fill="#3c86d6" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="188.1,185.0 216.7,201.5 216.7,179.5 188.1,163.0" fill="#2f6cb8" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="245.3,185.0 216.7,201.5 216.7,179.5 245.3,163.0" fill="#24578f" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="216.7,146.5 245.3,163.0 216.7,179.5 188.1,163.0" fill="#5fa9ee" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="216.7,146.5 245.3,163.0 245.3,141.0 216.7,124.5" fill="#4f89cf" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="264.3,152.0 245.3,163.0 245.3,141.0 264.3,130.0" fill="#3d6ea8" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="235.7,113.5 264.3,130.0 245.3,141.0 216.7,124.5" fill="#8cc4f7" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="188.1,163.0 216.7,179.5 216.7,157.5 188.1,141.0" fill="#2f6cb8" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="245.3,163.0 216.7,179.5 216.7,157.5 245.3,141.0" fill="#24578f" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/><polygon points="216.7,124.5 245.3,141.0 216.7,157.5 188.1,141.0" fill="#5fa9ee" stroke="#161b22" stroke-width="0.7" stroke-linejoin="round"/></svg>
              <div class="load-stats">
                <span class="big">87%</span>
                <div class="bar"><i></i></div>
                <span class="lbl">적재율</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="ways" style="padding: 120px 0;">
    <div class="wrap">
      <div class="sec-head reveal">
        <p class="label">Features</p>
        <h2>수주 하나가 완료되기까지,<br>네 가지가 자동으로 이어집니다</h2>
      </div>
      <div class="vcards">
        <div class="vcard reveal">
          <div class="vig vig-load">
            <div class="mini">
              <div class="mini-head"><span class="mini-title">LOAD PLAN · 40FT HC</span><span class="mini-chip">적재율 87%</span></div>
              <svg class="iso-mini" viewBox="0 0 380 216" aria-hidden="true"><polygon points="150.0,108.0 283.4,185.0 235.7,212.5 102.4,135.5" fill="rgba(120,158,205,0.16)" stroke="rgba(90,130,175,0.5)" stroke-width="1" stroke-linejoin="round"/><polygon points="150.0,108.0 283.4,185.0 283.4,130.0 150.0,53.0" fill="none" stroke="rgba(90,130,175,0.5)" stroke-width="1" opacity="0.85" stroke-linejoin="round"/><polygon points="150.0,108.0 102.4,135.5 102.4,80.5 150.0,53.0" fill="none" stroke="rgba(90,130,175,0.5)" stroke-width="1" opacity="0.85" stroke-linejoin="round"/><polygon points="150.0,53.0 283.4,130.0 235.7,157.5 102.4,80.5" fill="none" stroke="rgba(90,130,175,0.5)" stroke-width="1" opacity="0.4" stroke-linejoin="round"/><polygon points="283.4,185.0 235.7,212.5 235.7,157.5 283.4,130.0" fill="none" stroke="rgba(90,130,175,0.5)" stroke-width="1" opacity="0.4" stroke-linejoin="round"/><polygon points="130.9,119.0 159.5,135.5 159.5,113.5 130.9,97.0" fill="#3f7fd0" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="178.6,124.5 159.5,135.5 159.5,113.5 178.6,102.5" fill="#2f66ab" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="150.0,86.0 178.6,102.5 159.5,113.5 130.9,97.0" fill="#7db6f2" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="102.4,135.5 130.9,152.0 130.9,130.0 102.4,113.5" fill="#6b9edd" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="159.5,135.5 130.9,152.0 130.9,130.0 159.5,113.5" fill="#5480ba" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="130.9,97.0 159.5,113.5 130.9,130.0 102.4,113.5" fill="#a9cef7" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="130.9,97.0 159.5,113.5 159.5,91.5 130.9,75.0" fill="#2e66ad" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="178.6,102.5 159.5,113.5 159.5,91.5 178.6,80.5" fill="#22528e" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="150.0,64.0 178.6,80.5 159.5,91.5 130.9,75.0" fill="#4e90dd" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="159.5,135.5 188.1,152.0 188.1,130.0 159.5,113.5" fill="#6b9edd" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="207.2,141.0 188.1,152.0 188.1,130.0 207.2,119.0" fill="#5480ba" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="178.6,102.5 207.2,119.0 188.1,130.0 159.5,113.5" fill="#a9cef7" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="102.4,113.5 130.9,130.0 130.9,108.0 102.4,91.5" fill="#3f7fd0" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="159.5,113.5 130.9,130.0 130.9,108.0 159.5,91.5" fill="#2f66ab" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="130.9,75.0 159.5,91.5 130.9,108.0 102.4,91.5" fill="#7db6f2" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="130.9,75.0 159.5,91.5 159.5,80.5 130.9,64.0" fill="#6b9edd" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="178.6,80.5 159.5,91.5 159.5,80.5 178.6,69.5" fill="#5480ba" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="150.0,53.0 178.6,69.5 159.5,80.5 130.9,64.0" fill="#a9cef7" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="130.9,152.0 159.5,168.5 159.5,146.5 130.9,130.0" fill="#2e66ad" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="188.1,152.0 159.5,168.5 159.5,146.5 188.1,130.0" fill="#22528e" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="159.5,113.5 188.1,130.0 159.5,146.5 130.9,130.0" fill="#4e90dd" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="159.5,113.5 188.1,130.0 188.1,108.0 159.5,91.5" fill="#3f7fd0" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="207.2,119.0 188.1,130.0 188.1,108.0 207.2,97.0" fill="#2f66ab" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="178.6,80.5 207.2,97.0 188.1,108.0 159.5,91.5" fill="#7db6f2" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="188.1,152.0 216.7,168.5 216.7,146.5 188.1,130.0" fill="#3f7fd0" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="235.7,157.5 216.7,168.5 216.7,146.5 235.7,135.5" fill="#2f66ab" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="207.2,119.0 235.7,135.5 216.7,146.5 188.1,130.0" fill="#7db6f2" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="102.4,91.5 130.9,108.0 130.9,97.0 102.4,80.5" fill="#2e66ad" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="159.5,91.5 130.9,108.0 130.9,97.0 159.5,80.5" fill="#22528e" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="130.9,64.0 159.5,80.5 130.9,97.0 102.4,80.5" fill="#4e90dd" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="130.9,130.0 159.5,146.5 159.5,124.5 130.9,108.0" fill="#6b9edd" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="188.1,130.0 159.5,146.5 159.5,124.5 188.1,108.0" fill="#5480ba" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="159.5,91.5 188.1,108.0 159.5,124.5 130.9,108.0" fill="#a9cef7" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="159.5,91.5 188.1,108.0 188.1,97.0 159.5,80.5" fill="#3f7fd0" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="207.2,97.0 188.1,108.0 188.1,97.0 207.2,86.0" fill="#2f66ab" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="178.6,69.5 207.2,86.0 188.1,97.0 159.5,80.5" fill="#7db6f2" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="159.5,168.5 188.1,185.0 188.1,163.0 159.5,146.5" fill="#6b9edd" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="216.7,168.5 188.1,185.0 188.1,163.0 216.7,146.5" fill="#5480ba" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="188.1,130.0 216.7,146.5 188.1,163.0 159.5,146.5" fill="#a9cef7" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="188.1,130.0 216.7,146.5 216.7,124.5 188.1,108.0" fill="#cf964a" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="235.7,135.5 216.7,146.5 216.7,124.5 235.7,113.5" fill="#ad7b3a" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="207.2,97.0 235.7,113.5 216.7,124.5 188.1,108.0" fill="#f2c47c" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="216.7,168.5 245.3,185.0 245.3,163.0 216.7,146.5" fill="#cf964a" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="264.3,174.0 245.3,185.0 245.3,163.0 264.3,152.0" fill="#ad7b3a" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="235.7,135.5 264.3,152.0 245.3,163.0 216.7,146.5" fill="#f2c47c" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="130.9,108.0 159.5,124.5 159.5,113.5 130.9,97.0" fill="#6b9edd" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="188.1,108.0 159.5,124.5 159.5,113.5 188.1,97.0" fill="#5480ba" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="159.5,80.5 188.1,97.0 159.5,113.5 130.9,97.0" fill="#a9cef7" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="159.5,146.5 188.1,163.0 188.1,141.0 159.5,124.5" fill="#2e66ad" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="216.7,146.5 188.1,163.0 188.1,141.0 216.7,124.5" fill="#22528e" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="188.1,108.0 216.7,124.5 188.1,141.0 159.5,124.5" fill="#4e90dd" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="188.1,185.0 216.7,201.5 216.7,179.5 188.1,163.0" fill="#3f7fd0" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="245.3,185.0 216.7,201.5 216.7,179.5 245.3,163.0" fill="#2f66ab" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="216.7,146.5 245.3,163.0 216.7,179.5 188.1,163.0" fill="#7db6f2" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="216.7,146.5 245.3,163.0 245.3,141.0 216.7,124.5" fill="#6b9edd" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="264.3,152.0 245.3,163.0 245.3,141.0 264.3,130.0" fill="#5480ba" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="235.7,113.5 264.3,130.0 245.3,141.0 216.7,124.5" fill="#a9cef7" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="188.1,163.0 216.7,179.5 216.7,157.5 188.1,141.0" fill="#3f7fd0" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="245.3,163.0 216.7,179.5 216.7,157.5 245.3,141.0" fill="#2f66ab" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/><polygon points="216.7,124.5 245.3,141.0 216.7,157.5 188.1,141.0" fill="#7db6f2" stroke="#ffffff" stroke-width="0.7" stroke-linejoin="round"/></svg>
            </div>
          </div>
          <div class="vbody">
            <h3>3D 적재 시뮬레이션</h3>
            <p>박스 치수와 수량만 입력하면 최적 배치를 계산합니다. 컨테이너 1대를 줄이는 순간이 눈에 보입니다.</p>
          </div>
        </div>
        <div class="vcard reveal">
          <div class="vig vig-quote">
            <div class="mini">
              <div class="mini-head"><span class="mini-title">견적 회신 3건</span><span class="mini-chip">자동 파싱</span></div>
              <div class="lq"><span class="fw">A 포워딩</span><span class="amt">USD 1,310</span></div>
              <div class="lq best"><span class="fw">B 로지스틱스</span><span class="min">최저</span><span class="amt">USD 1,180</span></div>
              <div class="lq"><span class="fw">C 해운항공</span><span class="amt">USD 1,240</span></div>
            </div>
          </div>
          <div class="vbody">
            <h3>포워더 견적 비교</h3>
            <p>포워더는 가입 없이 이메일 답장만 하면 됩니다. 회신이 자동 파싱되어 항목별 최저가가 강조됩니다.</p>
          </div>
        </div>
        <div class="vcard reveal">
          <div class="vig vig-doc">
            <div class="mini">
              <div class="mini-head"><span class="mini-title">수출 서류</span><span class="mini-chip">생성 30초</span></div>
              <div class="dline"><span class="ok">✓</span><span class="t">Commercial Invoice</span><span class="m">PDF · 발송됨</span></div>
              <div class="dline"><span class="ok">✓</span><span class="t">Packing List</span><span class="m">PDF · 발송됨</span></div>
              <div class="dline"><span class="ok">✓</span><span class="t">견적요청서</span><span class="m">자동 채움</span></div>
            </div>
          </div>
          <div class="vbody">
            <h3>수출 서류 자동 생성</h3>
            <p>수주 데이터에서 CI/PL이 자동으로 채워집니다. A4 미리보기 후 포워더에게 원클릭 발송.</p>
          </div>
        </div>
        <div class="vcard reveal">
          <div class="vig vig-track">
            <div class="mini">
              <div class="mini-head"><span class="mini-title">선적 트래킹</span><span class="mini-chip">운항 중</span></div>
              <div class="track">
                <div class="ports">
                  <span>부산<small>KRPUS · 07.14 출항</small></span>
                  <span style="text-align:right">롱비치<small>USLGB · 07.28 도착 예정</small></span>
                </div>
                <div class="rail"><i></i><span class="ship"><svg viewBox="0 0 24 24"><path d="M3 15l2-6h14l2 6M5 15h14l-1 4H6l-1-4z"/></svg></span></div>
                <div class="eta"><span>AIS 위치 수신</span><span>샘플 데이터</span></div>
              </div>
            </div>
          </div>
          <div class="vbody">
            <h3>선적 트래킹</h3>
            <p>부킹부터 도착까지, 선박 위치와 일정 변동을 한 화면에서 확인합니다.</p>
          </div>
        </div>
      </div>
      <div class="price-box reveal" style="margin-top: 20px;">
        <p><b>요금과 플랜</b> — 도입 문의를 주시면 기업 규모와 물동량에 맞춰 안내드립니다.</p>
        <a class="btn btn-dark" href="/contact">도입 문의하기</a>
      </div>
    </div>
  </section>

  <section class="careers" style="padding: 110px 0;">
    <div class="wrap reveal">
      <p class="label">Pilot Program</p>
      <h2>2026 파일럿 파트너를 모집합니다</h2>
      <p class="sub">LogiNexio를 가장 먼저 도입하고 제품의 방향을 함께 만들 수출 제조기업을 찾습니다. 온보딩과 기술 지원을 저희 팀이 직접 제공합니다.</p>
      <a class="btn btn-white btn-lg" href="/contact">파일럿 문의하기</a>
    </div>
  </section>

</main>

<footer class="foot">
  <div class="wrap foot-grid">
    <div>
      <span class="flogo"><img src="/images/logo-web.png" alt="아이티무유"></span>
      <p style="margin: 10px 0 0; font-size: 0.92rem; font-weight: 700; color: var(--ink-soft);">기술로 세상을 움직이다</p>
      <p class="corp">
        아이티무유 주식회사 · 대표이사 심영민<br>
        사업자등록번호 229-81-43410<br>
        충청북도 청주시 흥덕구 공단로126번길 51, 청주산단스타트업센터 502호<br>
        © 2026 ITmoou Co., Ltd.
      </p>
    </div>
    <div>
      <h4>서비스</h4>
      <ul>
        <li><a href="${LOGINEXIO_URL}" target="_blank" rel="noopener">LogiNexio ↗</a></li>
        <li><a href="/rnd">연구개발</a></li>
        <li><a href="/contact">도입 문의</a></li>
      </ul>
    </div>
    <div>
      <h4>회사</h4>
      <ul>
        <li><a href="/company">회사소개</a></li>
        <li><a href="/newsroom">뉴스룸</a></li>
        <li><a href="/careers" target="_blank" rel="noopener">인재영입 ↗</a></li>
        <li><a href="/newsroom">공고</a></li>
        <li><a href="/privacy-policy">개인정보처리방침</a></li>
      </ul>
    </div>
  </div>
</footer>
` + V2_TAIL
}

export function v2Rnd(): string {
  return v2Head('/rnd', '연구개발 | 아이티무유', '현장의 문제를 푸는 기술. 적재 최적화, 문서 자동화, 물류 데이터를 연구합니다.') + `
<header class="gnb" id="gnb">
  <div class="wrap gnb-inner">
    <a href="/" class="logo"><img src="/images/logo-web.png" alt="아이티무유"></a>
    <nav class="menu" aria-label="주 메뉴">
      <a class="item" href="/company">회사소개</a>
      <a class="item" href="/service">서비스</a>
      <a class="item" href="/rnd">연구개발</a>
      <a class="item" href="/newsroom">뉴스룸</a>
      <a class="item" href="/careers" target="_blank" rel="noopener">인재영입<span class="ext">↗</span></a>
    </nav>
    <div class="gnb-right">
      <a class="btn btn-dark btn-sm" href="/contact">문의하기</a>
      <button class="menu-toggle" type="button" aria-label="메뉴 열기" aria-expanded="false">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
    </div>
  </div>
  <nav class="m-nav" aria-label="모바일 메뉴">
    <a href="/company">회사소개</a>
    <a href="/service">서비스</a>
    <a href="/rnd">연구개발</a>
    <a href="/newsroom">뉴스룸</a>
    <a href="/careers" target="_blank" rel="noopener">인재영입<span class="ext">↗</span></a>
    <a href="/contact">문의하기</a>
  </nav>
</header>

<main>
  <section class="subhero">
    <div class="wrap">
      <p class="crumb">ITmoou — R&D</p>
      <h1>연구개발</h1>
      <p class="sub">현장의 문제를 푸는 기술. 아이티무유 연구개발부서를 소개합니다.</p>
    </div>
  </section>

  <section class="statement" style="padding: 120px 0 110px;">
    <div class="wrap reveal">
      <p class="label">R&amp;D</p>
      <h2>
        <span class="lead-seg">논문 속 기술이 아니라, 수출 현장의 문제를 푸는 기술을 만듭니다.</span>
        <span class="dim">아이티무유 연구개발부서는 LogiNexio의 핵심 기술을 직접 설계하고 구현합니다.</span>
      </h2>
    </div>
  </section>

  <section class="ways" style="padding: 0 0 120px;">
    <div class="wrap">
      <div class="sec-head reveal">
        <p class="label">Research Areas</p>
        <h2>세 가지 연구 분야</h2>
      </div>
      <div class="way-grid reveal">
        <div class="way">
          <span class="no">01</span>
          <h3>적재 최적화</h3>
          <p>화물 치수·수량 기반 3D 적재 시뮬레이션과 배치 알고리즘을 연구합니다. 컨테이너 공간 활용을 계산해 현장의 감에 의존하던 적재를 데이터로 바꿉니다.</p>
        </div>
        <div class="way">
          <span class="no">02</span>
          <h3>문서 자동화</h3>
          <p>수출 서류(CI/PL) 자동 생성, 견적 회신 이메일 파싱 등 문서 처리 기술을 개발합니다. 같은 데이터를 세 번 타이핑하던 업무를 한 번으로 줄입니다.</p>
        </div>
        <div class="way">
          <span class="no">03</span>
          <h3>물류 데이터</h3>
          <p>선박 운항(AIS)·일정 데이터를 수집하고 처리하는 트래킹 기술을 개발합니다. 부킹부터 도착까지의 흐름을 한 화면에 담습니다.</p>
        </div>
      </div>
      <p class="foot-note">연구개발전담부서 공식 인정 표기는 확인 후 게재합니다 (기획안 D-3).</p>
    </div>
  </section>

  <section class="careers">
    <div class="wrap reveal">
      <p class="label">We're hiring</p>
      <h2>함께 연구할 동료를 찾습니다</h2>
      <p class="sub">오래된 산업을 소프트웨어로 다시 만드는 일. 그 초기 멤버가 될 분을 기다립니다.</p>
      <a class="btn btn-white btn-lg" href="/careers" target="_blank" rel="noopener">인재영입 바로가기 ↗</a>
    </div>
  </section>

</main>

<footer class="foot">
  <div class="wrap foot-grid">
    <div>
      <span class="flogo"><img src="/images/logo-web.png" alt="아이티무유"></span>
      <p style="margin: 10px 0 0; font-size: 0.92rem; font-weight: 700; color: var(--ink-soft);">기술로 세상을 움직이다</p>
      <p class="corp">
        아이티무유 주식회사 · 대표이사 심영민<br>
        사업자등록번호 229-81-43410<br>
        충청북도 청주시 흥덕구 공단로126번길 51, 청주산단스타트업센터 502호<br>
        © 2026 ITmoou Co., Ltd.
      </p>
    </div>
    <div>
      <h4>서비스</h4>
      <ul>
        <li><a href="${LOGINEXIO_URL}" target="_blank" rel="noopener">LogiNexio ↗</a></li>
        <li><a href="/rnd">연구개발</a></li>
        <li><a href="/contact">도입 문의</a></li>
      </ul>
    </div>
    <div>
      <h4>회사</h4>
      <ul>
        <li><a href="/company">회사소개</a></li>
        <li><a href="/newsroom">뉴스룸</a></li>
        <li><a href="/careers" target="_blank" rel="noopener">인재영입 ↗</a></li>
        <li><a href="/newsroom">공고</a></li>
        <li><a href="/privacy-policy">개인정보처리방침</a></li>
      </ul>
    </div>
  </div>
</footer>
` + V2_TAIL
}

export function v2Newsroom(anns: AnnouncementRow[]): string {
  const annRows = anns.length
    ? anns.map(a => `<tr><td>${a.number}</td><td>${a.category}</td><td><a href="/announcements/${a.id}" style="color:var(--brand); font-weight:600">${a.title}</a></td><td>${a.notice_date}</td></tr>`).join('')
    : '<tr><td colspan="4" class="notice-empty">등록된 공고가 없습니다.</td></tr>'
  return v2Head('/newsroom', '뉴스룸 | 아이티무유', '아이티무유의 소식과 공식 공고를 전합니다.') + `
<header class="gnb" id="gnb">
  <div class="wrap gnb-inner">
    <a href="/" class="logo"><img src="/images/logo-web.png" alt="아이티무유"></a>
    <nav class="menu" aria-label="주 메뉴">
      <a class="item" href="/company">회사소개</a>
      <a class="item" href="/service">서비스</a>
      <a class="item" href="/rnd">연구개발</a>
      <a class="item" href="/newsroom">뉴스룸</a>
      <a class="item" href="/careers" target="_blank" rel="noopener">인재영입<span class="ext">↗</span></a>
    </nav>
    <div class="gnb-right">
      <a class="btn btn-dark btn-sm" href="/contact">문의하기</a>
      <button class="menu-toggle" type="button" aria-label="메뉴 열기" aria-expanded="false">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
    </div>
  </div>
  <nav class="m-nav" aria-label="모바일 메뉴">
    <a href="/company">회사소개</a>
    <a href="/service">서비스</a>
    <a href="/rnd">연구개발</a>
    <a href="/newsroom">뉴스룸</a>
    <a href="/careers" target="_blank" rel="noopener">인재영입<span class="ext">↗</span></a>
    <a href="/contact">문의하기</a>
  </nav>
</header>

<main>
  <section class="subhero">
    <div class="wrap">
      <p class="crumb">ITmoou — Newsroom</p>
      <h1>뉴스룸</h1>
      <p class="sub">아이티무유의 소식과 공식 공고를 전합니다.</p>
    </div>
  </section>

  <section class="ways" style="padding: 110px 0 100px;">
    <div class="wrap">
      <div class="sec-head reveal">
        <p class="label">News</p>
        <h2>아이티무유 소식</h2>
        <p class="sub">사실이 된 소식만 싣습니다. 파일럿 개시, 제품 출시, 선정 소식이 생기는 대로 이곳에 게재합니다.</p>
      </div>
      <div class="empty reveal">
        <h3>첫 번째 소식을 준비하고 있습니다</h3>
        <p>2026 파일럿 프로그램이 시작되면 가장 먼저 알려드리겠습니다.</p>
      </div>
    </div>
  </section>

  <section class="ways" id="notice" style="padding: 0 0 120px;">
    <div class="wrap">
      <div class="sec-head reveal">
        <p class="label">Notice</p>
        <h2>공고</h2>
        <p class="sub">아이티무유 주식회사는 정관에 따라 전자적 방법(홈페이지 게시)으로 공고합니다. 주주총회 등 공식 공고사항을 게시합니다.</p>
      </div>
      <div class="reveal" style="overflow-x: auto;">
        <table class="notice-table">
          <thead>
            <tr><th style="width:70px">번호</th><th style="width:110px">분류</th><th>제목</th><th style="width:120px">공고일</th></tr>
          </thead>
          <tbody>
            ${annRows}
          </tbody>
        </table>
      </div>
      <p class="cols-link reveal"><a href="/announcements">전체 공고 보기 →</a></p>
    </div>
  </section>

  <section class="now-band" style="padding: 100px 0 110px;">
    <div class="wrap">
      <div class="sec-head reveal">
        <p class="label">Press</p>
        <h2>보도 문의</h2>
      </div>
      <div class="reveal">
        <p style="margin:0; color: var(--ink-soft);">언론 보도 및 인터뷰 문의는 <b style="color:var(--ink)">sales@itmoou.com</b> 으로 연락해 주세요.</p>
      </div>
    </div>
  </section>

</main>

<footer class="foot">
  <div class="wrap foot-grid">
    <div>
      <span class="flogo"><img src="/images/logo-web.png" alt="아이티무유"></span>
      <p style="margin: 10px 0 0; font-size: 0.92rem; font-weight: 700; color: var(--ink-soft);">기술로 세상을 움직이다</p>
      <p class="corp">
        아이티무유 주식회사 · 대표이사 심영민<br>
        사업자등록번호 229-81-43410<br>
        충청북도 청주시 흥덕구 공단로126번길 51, 청주산단스타트업센터 502호<br>
        © 2026 ITmoou Co., Ltd.
      </p>
    </div>
    <div>
      <h4>서비스</h4>
      <ul>
        <li><a href="${LOGINEXIO_URL}" target="_blank" rel="noopener">LogiNexio ↗</a></li>
        <li><a href="/rnd">연구개발</a></li>
        <li><a href="/contact">도입 문의</a></li>
      </ul>
    </div>
    <div>
      <h4>회사</h4>
      <ul>
        <li><a href="/company">회사소개</a></li>
        <li><a href="/newsroom">뉴스룸</a></li>
        <li><a href="/careers" target="_blank" rel="noopener">인재영입 ↗</a></li>
        <li><a href="/newsroom">공고</a></li>
        <li><a href="/privacy-policy">개인정보처리방침</a></li>
      </ul>
    </div>
  </div>
</footer>
` + V2_TAIL
}

export function v2Contact(opts: { formToken?: string; error?: string; success?: boolean; ticketNo?: string } = {}): string {
  const formToken = opts.formToken || ''
  const notice = opts.success
    ? `<div class="fgroup full"><div class="form-note ok">문의가 접수되었습니다. 영업일 기준 1일 내 회신드리겠습니다.${opts.ticketNo ? ` (접수번호 ${opts.ticketNo})` : ''}</div></div>`
    : opts.error
      ? `<div class="fgroup full"><div class="form-note err">${opts.error}</div></div>`
      : ''
  return v2Head('/contact', '문의하기 | 아이티무유', '파일럿 참여, 제품 데모, 파트너십. 어떤 문의든 영업일 기준 1일 내 회신드립니다.') + `
<header class="gnb" id="gnb">
  <div class="wrap gnb-inner">
    <a href="/" class="logo"><img src="/images/logo-web.png" alt="아이티무유"></a>
    <nav class="menu" aria-label="주 메뉴">
      <a class="item" href="/company">회사소개</a>
      <a class="item" href="/service">서비스</a>
      <a class="item" href="/rnd">연구개발</a>
      <a class="item" href="/newsroom">뉴스룸</a>
      <a class="item" href="/careers" target="_blank" rel="noopener">인재영입<span class="ext">↗</span></a>
    </nav>
    <div class="gnb-right">
      <a class="btn btn-dark btn-sm" href="/contact">문의하기</a>
      <button class="menu-toggle" type="button" aria-label="메뉴 열기" aria-expanded="false">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
    </div>
  </div>
  <nav class="m-nav" aria-label="모바일 메뉴">
    <a href="/company">회사소개</a>
    <a href="/service">서비스</a>
    <a href="/rnd">연구개발</a>
    <a href="/newsroom">뉴스룸</a>
    <a href="/careers" target="_blank" rel="noopener">인재영입<span class="ext">↗</span></a>
    <a href="/contact">문의하기</a>
  </nav>
</header>

<main>
  <section class="subhero">
    <div class="wrap">
      <p class="crumb">ITmoou — Contact</p>
      <h1>문의하기</h1>
      <p class="sub">파일럿 참여부터 파트너십까지, 어떤 문의든 환영합니다.</p>
    </div>
  </section>

  <section class="ways" style="padding: 110px 0 130px;">
    <div class="wrap">
      <div class="contact-grid reveal">
        <div>
          <div class="sec-head" style="margin-bottom: 36px;">
            <p class="label">Contact</p>
            <h2>무엇이든 물어보세요</h2>
            <p class="sub">파일럿 참여, 제품 데모, 파트너십. 영업일 기준 1일 내 회신드립니다.</p>
          </div>
          <form class="cform" method="post" action="/contact">${notice}<input type="text" name="_hp" style="display:none" tabindex="-1" autocomplete="off" aria-hidden="true"><input type="hidden" name="_t" value="${formToken}">
            <div class="fgroup">
              <label>회사명</label>
              <input type="text" name="company" placeholder="예) 아이티무유 주식회사">
            </div>
            <div class="fgroup">
              <label>이름 <span class="req">*</span></label>
              <input type="text" name="name" placeholder="담당자 성함" required>
            </div>
            <div class="fgroup">
              <label>이메일 <span class="req">*</span></label>
              <input type="email" name="email" placeholder="name@company.com" required>
            </div>
            <div class="fgroup">
              <label>전화번호</label>
              <input type="tel" name="phone" placeholder="010-0000-0000">
            </div>
            <div class="fgroup full">
              <label>문의 유형 <span class="req">*</span></label>
              <select name="inquiry_type" required>
                <option value="">선택해 주세요</option>
                <option>파일럿 참여</option>
                <option>제품 데모</option>
                <option>파트너십</option>
                <option>기타</option>
              </select>
            </div>
            <div class="fgroup full">
              <label>문의 내용 <span class="req">*</span></label>
              <textarea name="message" placeholder="궁금하신 내용을 자유롭게 적어주세요." required></textarea>
            </div>
            <div class="full">
              <button class="btn btn-dark btn-lg" type="submit" style="width:100%">문의 보내기</button>
              
            </div>
          </form>
        </div>
        <div>
          <div class="side-card">
            <span class="c-label">직접 연락</span>
            <p><b>043-715-8553</b><br>sales@itmoou.com<br>평일 09:00–18:00 (점심 12:00–13:00)</p>
          </div>
          <div class="side-card">
            <span class="c-label">오시는 길</span>
            <p><b>충청북도 청주시 흥덕구 공단로126번길 51</b><br>청주산단스타트업센터 502호</p>
          </div>
          <div class="side-card">
            <span class="c-label">채용 문의</span>
            <p>채용 관련 문의는 채용 홈페이지에서 받고 있습니다.<br><a href="/careers" target="_blank" rel="noopener" style="font-weight:700; color:var(--brand)">recruit.itmoou.com ↗</a></p>
          </div>
        </div>
      </div>
    </div>
  </section>

</main>

<footer class="foot">
  <div class="wrap foot-grid">
    <div>
      <span class="flogo"><img src="/images/logo-web.png" alt="아이티무유"></span>
      <p style="margin: 10px 0 0; font-size: 0.92rem; font-weight: 700; color: var(--ink-soft);">기술로 세상을 움직이다</p>
      <p class="corp">
        아이티무유 주식회사 · 대표이사 심영민<br>
        사업자등록번호 229-81-43410<br>
        충청북도 청주시 흥덕구 공단로126번길 51, 청주산단스타트업센터 502호<br>
        © 2026 ITmoou Co., Ltd.
      </p>
    </div>
    <div>
      <h4>서비스</h4>
      <ul>
        <li><a href="${LOGINEXIO_URL}" target="_blank" rel="noopener">LogiNexio ↗</a></li>
        <li><a href="/rnd">연구개발</a></li>
        <li><a href="/contact">도입 문의</a></li>
      </ul>
    </div>
    <div>
      <h4>회사</h4>
      <ul>
        <li><a href="/company">회사소개</a></li>
        <li><a href="/newsroom">뉴스룸</a></li>
        <li><a href="/careers" target="_blank" rel="noopener">인재영입 ↗</a></li>
        <li><a href="/newsroom">공고</a></li>
        <li><a href="/privacy-policy">개인정보처리방침</a></li>
      </ul>
    </div>
  </div>
</footer>
` + V2_TAIL
}

// ── 공용 셸 (공고 등 서브 시스템 페이지용) ──
export const V2_HEADER = `<header class="gnb" id="gnb">
  <div class="wrap gnb-inner">
    <a href="/" data-nav="home" class="logo"><img src="/images/logo-web.png" alt="아이티무유"></a>
    <nav class="menu" aria-label="주 메뉴">
      <a class="item" href="/company" data-nav="about">회사소개</a>
      <a class="item" href="/service" data-nav="service">서비스</a>
      <a class="item" href="/rnd" data-nav="rnd">연구개발</a>
      <a class="item" href="/newsroom" data-nav="news">뉴스룸</a>
      <a class="item" href="/careers" target="_blank" rel="noopener">인재영입<span class="ext">↗</span></a>
    </nav>
    <div class="gnb-right">
      <a class="btn btn-dark btn-sm" href="/contact" data-nav="contact">문의하기</a>
      <button class="menu-toggle" type="button" aria-label="메뉴 열기" aria-expanded="false">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
    </div>
  </div>
  <nav class="m-nav" aria-label="모바일 메뉴">
    <a href="/company" data-nav="about">회사소개</a>
    <a href="/service" data-nav="service">서비스</a>
    <a href="/rnd" data-nav="rnd">연구개발</a>
    <a href="/newsroom" data-nav="news">뉴스룸</a>
    <a href="/careers" target="_blank" rel="noopener">인재영입<span class="ext">↗</span></a>
    <a href="/contact" data-nav="contact">문의하기</a>
  </nav>
</header>`

export const V2_FOOTER = `<footer class="foot">
  <div class="wrap foot-grid">
    <div>
      <span class="flogo"><img src="/images/logo-web.png" alt="아이티무유"></span>
      <p style="margin: 10px 0 0; font-size: 0.92rem; font-weight: 700; color: var(--ink-soft);">기술로 세상을 움직이다</p>
      <p class="corp">
        아이티무유 주식회사 · 대표이사 심영민<br>
        사업자등록번호 229-81-43410<br>
        충청북도 청주시 흥덕구 공단로126번길 51, 청주산단스타트업센터 502호<br>
        © 2026 ITmoou Co., Ltd.
      </p>
    </div>
    <div>
      <h4>서비스</h4>
      <ul>
        <li><a href="https://loginexio.com" target="_blank" rel="noopener">LogiNexio ↗</a></li>
        <li><a href="/rnd" data-nav="rnd">연구개발</a></li>
        <li><a href="/contact" data-nav="contact">도입 문의</a></li>
      </ul>
    </div>
    <div>
      <h4>회사</h4>
      <ul>
        <li><a href="/company" data-nav="about">회사소개</a></li>
        <li><a href="/newsroom" data-nav="news">뉴스룸</a></li>
        <li><a href="/careers" target="_blank" rel="noopener">인재영입 ↗</a></li>
        <li><a href="/newsroom" data-nav="news">공고</a></li>
        <li><a href="/privacy-policy">개인정보처리방침</a></li>
      </ul>
    </div>
  </div>
</footer>`

export function v2Shell(path: string, title: string, desc: string, mainHtml: string): string {
  return v2Head(path, title, desc) + V2_HEADER + '\n<main>' + mainHtml + '</main>\n' + V2_FOOTER + V2_TAIL
}


// 개인정보처리방침 (구 사이트 원문 그대로 게재 + 2026-07-30 웹로그 부칙. 원문 개정은 법무 검토 후에만)
export function v2Privacy(): string {
  return v2Shell('/privacy-policy', '개인정보처리방침 | 아이티무유', '아이티무유 주식회사 개인정보 보호 정책.', `
  <section class="subhero">
    <div class="wrap">
      <p class="crumb">ITmoou — Privacy</p>
      <h1>개인정보처리방침</h1>
      <p class="sub">아이티무유 주식회사 개인정보 보호 정책</p>
    </div>
  </section>
  <section style="padding: 90px 0 100px;">
    <div class="wrap" style="max-width: 860px; line-height: 1.85;">
      <div>
          <p>본 개인정보 처리방침은 아이티무유 주식회사(이하 "회사")가 이용자의 소중한 개인정보 및 권익을 보호하고 개인정보와 관련한 이용자의 고충을 원활하게 처리할 수 있도록 하기 위한 지침입니다. 회사는 이용자의 동의를 기반으로 개인정보를 수집·이용·제공하며 관련 법령을 준수합니다.</p>

          <h2>1. 개인정보의 수집</h2>
          <p>① 회사는 서비스를 제공하기 위하여 필요한 최소한의 개인정보만 수집합니다.</p>
          <p>② 회사는 서비스를 제공하기 위해 필요한 필수항목을 이용자의 동의 하에 처리합니다.</p>
          <p>③ 법령상 특별한 규정이 있는 경우 및 법령상 의무를 준수하기 위한 경우에는 이용자의 개인정보 수집 및 이용에 대하여 동의를 받지 않고 수집할 수 있습니다.</p>
          <p>④ 회사는 관련 법령에 따른 개인정보의 보유 및 이용기간 또는 정보 주체로부터 개인정보 수집 시 동의 받은 개인정보 보유 및 이용기간 내에서 개인정보를 처리합니다.</p>
          <p>⑤ 회사가 이용자로부터 수집하는 개인정보 항목 및 수집·이용 목적은 다음과 같습니다.</p>
          <ul>
            <li><strong>수집 항목(도입 문의):</strong> 회사명, 담당자명, 이메일 주소, 연락처, 문의 내용</li>
            <li><strong>수집·이용 목적:</strong> 문의 접수·상담 및 회신, 서비스 도입 안내, 고충처리 및 분쟁 조정</li>
            <li><strong>보유 및 이용기간:</strong> 수집·이용 목적이 달성되면 지체 없이 파기(단, 관련 법령에 따라 필요한 항목에 한하여 일정 기간 보관함)</li>
          </ul>

          <h2>2. 개인정보의 이용목적</h2>
          <p>회사가 수집하는 이용자의 개인정보는 아래의 목적으로만 수집 및 이용합니다. 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며 이용 목적이 변경될 시에는 사전에 별도로 이용자에게 동의를 받는 등 필요한 조치를 이행합니다.</p>
          <ul>
            <li>① 서비스 제공, 서비스 유지 및 개선, 신규 서비스 제공, 안정적인 서비스 이용 환경 제공</li>
            <li>② 부정 이용 방지, 법률 및 서비스 약관 위반 행위 제한, 서비스 이용 관련 상담과 분쟁 처리, 분쟁 조정을 위한 기록 보존, 개별 통지</li>
            <li>③ 서비스 이용 통계, 서비스 접속·이용 기록 등 분석을 통한 맞춤형 서비스 제공</li>
            <li>④ 마케팅 정보 안내 및 참여기회 제공, 광고성 정보 제공</li>
          </ul>

          <h2>3. 개인정보의 제3자 제공에 관한 사항</h2>
          <p>회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하거나 외부에 공개하지 않습니다. 단, 다음의 경우에는 예외로 합니다.</p>
          <ul>
            <li>서비스 이용을 위하여 이용자가 사전에 제공에 동의를 한 경우</li>
            <li>법률에 특별한 규정이 있거나 법령상 의무 준수를 위해 불가피한 경우</li>
            <li>이용자의 사전 동의를 받을 수 없는 상태에서 이용자 또는 제3자의 생명이나 안전에 급박한 위험이 확인되어 이를 해소하기 위한 경우</li>
          </ul>

          <h2>4. 개인정보의 위탁</h2>
          <p>① 개인정보의 처리 위탁이란 개인정보를 제공하는 자의 업무 처리를 위하여 개인정보를 외부 수탁자에게 위탁하는 것을 의미합니다. 개인정보가 위탁된 이후에도 위탁자(개인정보를 제공한 자)는 수탁자에 대한 관리, 감독 책임이 있습니다.</p>
          <p>② 회사는 이용자의 개인정보를 처리 위탁할 수 있으며, 이 경우 그 위탁에 관한 정보를 지체 없이 본 개인정보 처리방침을 통하여 공개하도록 하겠습니다.</p>

          <h2>5. 추가적인 이용·제공 판단기준</h2>
          <p>회사가 정보주체의 동의 없이 개인정보를 이용 또는 제공하는 경우에는 개인정보보호책임자가 다음의 사항을 고려하여 개인정보의 추가적인 이용 또는 제공을 하고 있는지 여부를 점검합니다.</p>
          <ul>
            <li>당초 수집 목적과 관련성이 있는지 여부</li>
            <li>개인정보를 수집한 정황 또는 처리 관행에 비추어 볼 때 개인정보의 추가적인 이용 또는 제공에 대한 예측 가능성이 있는지 여부</li>
            <li>정보주체의 이익을 부당하게 침해하는지 여부</li>
            <li>가명처리 또는 암호화 등 안전성 확보에 필요한 조치를 하였는지 여부</li>
          </ul>

          <h2>6. 이용자의 권리와 권리행사 방법</h2>
          <p>이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다.</p>
          <p>① 이용자는 회사에 대하여 서면, 전자우편 등을 통하여 언제든지 자신의 개인정보 열람, 정정, 삭제, 처리정지 요구 등의 권리를 행사할 수 있습니다.</p>
          <p>② 이용자가 개인정보의 오류에 대하여 회사에 정정을 요청하거나 처리 정지를 요구한 경우, 정정을 완료하기 전까지 또는 처리정지 요구 철회가 있기 전까지 회사는 해당 개인정보를 이용 또는 제공하지 않습니다.</p>
          <p>③ 본 조의 권리행사는 개인정보 관련 법령 및 다른 법령의 규정에 따라 제한될 수 있습니다.</p>

          <h2>7. 만 14세 미만의 아동인 이용자 및 그 법정대리인의 권리 행사</h2>
          <p>① 회사는 아동 이용자의 개인정보를 수집·이용·제공 등 처리하기 위하여 그 법정대리인의 동의를 요청하여야 합니다.</p>
          <p>② 아동 이용자 및 그 법정대리인은 개인정보 관련 법령 및 이 개인정보 처리방침에 따라 회사에 본인 및 그 법정대리인으로서 아동 이용자의 개인정보에 대한 열람·정정·삭제 등 개인정보 보호를 위하여 필요한 조치를 요청할 수 있고, 회사는 이에 지체 없이 응하여야 합니다.</p>

          <h2>8. 개인정보의 파기 및 보관</h2>
          <p>① 회사는 원칙적으로 이용자의 개인정보 처리목적이 달성된 경우에는 지체 없이 해당 개인정보를 파기합니다.</p>
          <p>② 전자적 파일 형태인 경우 복구 및 재생되지 않도록 안전하게 삭제하고, 그 밖에 기록물, 인쇄물, 서면 등 종이에 기록·저장된 개인정보의 경우 분쇄하거나 소각하여 파기합니다.</p>
          <p>③ 관련법령에서 일정 기간 정보 보관을 규정하는 경우에는 해당 기간 동안 규정에 따라 개인정보를 안전하게 보관합니다.</p>
          
          <div>
            <strong>관련 법령에 따른 보관:</strong>
            <ul>
              <li>전자상거래법: 계약/청약철회 기록 (5년), 대금결제 기록 (5년), 소비자 불만 기록 (3년)</li>
              <li>전자금융거래법: 전자금융 거래 기록 (5년)</li>
              <li>국세기본법: 거래 장부 및 증빙서류 (5년)</li>
              <li>통신비밀보호법: 서비스 접속 기록 (3개월)</li>
            </ul>
          </div>

          <h2>9. 개인정보 보호책임자</h2>
          <p>회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하여 운영하고 있습니다.</p>
          
          <div>
            <p><strong>개인정보 보호책임자:</strong> 심영민</p>
            <p><strong>직책:</strong> 대표이사</p>
            <p><strong>연락처:</strong> 043-715-8553</p>
            <p><strong>이메일:</strong> cs&#64;itmoou.com</p>
          </div>

          <h2>10. 개인정보침해에 대한 신고와 상담</h2>
          <p>정보주체는 기타 개인정보침해에 대한 신고나 상담이 필요하신 경우에는 아래 기관에 문의하실 수 있습니다.</p>
          <ul>
            <li>개인정보침해신고센터: privacy.kisa.or.kr | 국번없이 118</li>
            <li>대검찰청 사이버수사과: spo.go.kr | 국번없이 1301</li>
            <li>경찰청 사이버안전국: cyberbureau.police.go.kr | 국번없이 182</li>
          </ul>

          <h2>11. 개인정보 처리방침의 변경</h2>
          <p>회사의 개인정보 처리방침은 관련 법령과 내부 방침에 따라 변경될 수 있습니다. 회사는 개인정보 처리방침이 추가, 수정, 삭제 등 변경되는 경우에는 시행일 7일 전부터 홈페이지를 통하여 공지합니다. 단, 이용자 권리에 중요한 변경이 있는 경우에는 시행일 30일 전부터 공지합니다.</p>

          <h2>12. 개인정보의 안전성 확보 조치</h2>
          <p>회사는 관련 법령에 따라 다음과 같이 개인정보의 안전성 확보에 필요한 기술적/관리적 및 물리적 조치를 하고 있습니다.</p>
          
          <div>
            <h3>관리적 조치</h3>
            <ul>
              <li>개인정보 취급 직원의 최소화 및 교육</li>
              <li>내부관리계획의 수립 및 시행</li>
            </ul>

            <h3>기술적 조치</h3>
            <ul>
              <li>해킹 등에 대비한 기술적 대책</li>
              <li>침입차단 시스템 이용</li>
              <li>개인정보의 암호화</li>
              <li>접속기록의 보관 및 위/변조 방지</li>
            </ul>

            <h3>물리적 조치</h3>
            <ul>
              <li>개인정보에 대한 접근 제한</li>
            </ul>
          </div>

          <div>
            <h3>부칙</h3>
            <p>본 개인정보 처리방침은 2026. 1. 2 부터 시행됩니다.</p>
          </div>

          <div>
            <p>문의사항이 있으시면 아래로 연락주세요</p>
            <p>
              043-715-8553 | 
              cs&#64;itmoou.com
            </p>
          </div>
        </div>
      <h2 style="margin-top: 3rem;">부칙: 웹 로그 분석 도구 (2026-07-30 추가)</h2>
      <p style="color: var(--ink-soft); font-size: 0.95rem;">2026-07-30 개정: 수집 항목·목적을 홈페이지 실제 수집 현황(도입 문의 폼) 기준으로 정정하고, 아래 웹 로그 분석 조항을 신설했습니다.</p>
      <p>회사 웹사이트는 서비스 개선을 위해 이용 통계 분석 도구를 사용하며, 이 과정에서 쿠키·접속 기기 정보·방문 일시·페이지 이동 및 클릭 등 행태정보가 자동 수집될 수 있습니다.</p>
      <ul>
        <li>사용 도구: Google Analytics(Google LLC), Microsoft Clarity(Microsoft Corporation)</li>
        <li>Clarity는 페이지 내 클릭·스크롤 위치와 화면 조작 과정을 익명화하여 기록하며, 입력 폼 내용 등 민감 정보는 자동 마스킹됩니다.</li>
        <li>수집 정보는 방문 통계 분석·사용성 개선 목적으로만 사용되며 개인 식별 정보와 결합하지 않습니다.</li>
        <li>이용자는 브라우저 쿠키 차단 설정 또는 Google Analytics 차단 부가기능(tools.google.com/dlpage/gaoptout)으로 수집을 거부할 수 있습니다.</li>
      </ul>
    </div>
  </section>`)
}
