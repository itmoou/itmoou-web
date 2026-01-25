import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files from public directory
app.use('/static/*', serveStatic({ root: './public' }))
app.use('/images/*', serveStatic({ root: './public' }))

// Main page
app.get('/', (c) => {
  return c.html(getMainHTML())
})

// Company pages
app.get('/company', (c) => {
  return c.html(getCompanyHTML())
})

app.get('/company/ceo', (c) => {
  return c.html(getCEOHTML())
})

app.get('/company/history', (c) => {
  return c.html(getHistoryHTML())
})

app.get('/company/esg', (c) => {
  return c.html(getESGHTML())
})

app.get('/company/location', (c) => {
  return c.html(getLocationHTML())
})

app.get('/company/news', (c) => {
  return c.html(getCompanyNewsHTML())
})

// Solutions pages
app.get('/solutions/loginexio', (c) => {
  return c.html(getLogiNexioHTML())
})

app.get('/solutions/bizsupport', (c) => {
  return c.html(getBizSupportHTML())
})

// R&D pages
app.get('/rnd/lab', (c) => {
  return c.html(getLabHTML())
})

app.get('/rnd/activities', (c) => {
  return c.html(getActivitiesHTML())
})

// Careers pages - redirect to external site
app.get('/careers', (c) => {
  return c.redirect('https://recruit.itmoou.com')
})

app.get('/careers/talent', (c) => {
  return c.html(getTalentHTML())
})

// Support pages
app.get('/support/customer', (c) => {
  return c.html(getCustomerSupportHTML())
})

app.get('/support/contact', (c) => {
  return c.html(getContactHTML())
})

// API routes
app.get('/api/hello', (c) => {
  return c.json({ message: 'Hello from IT moou API!' })
})

// Helper functions for HTML templates
function getHeader() {
  return `
    <header class="header">
      <div class="header-container">
        <a href="/" class="logo">
          <img src="/images/logo.png" alt="IT moou" style="height: 80px;">
        </a>
        <nav>
          <ul class="main-nav">
            <li class="nav-item">
              <a href="/company" class="nav-link">회사소개</a>
              <div class="dropdown">
                <a href="/company" class="dropdown-item">IT moou</a>
                <a href="/company/ceo" class="dropdown-item">CEO 메시지</a>
                <a href="/company/news" class="dropdown-item">회사소식</a>
                <a href="/company/history" class="dropdown-item">연혁</a>
                <a href="/company/esg" class="dropdown-item">ESG</a>
                <a href="/company/location" class="dropdown-item">오시는 길</a>
              </div>
            </li>
            <li class="nav-item">
              <a href="/solutions/loginnexio" class="nav-link">솔루션</a>
              <div class="dropdown">
                <a href="/solutions/loginexio" class="dropdown-item">LogiNexio</a>
                <a href="/solutions/bizsupport" class="dropdown-item">BizSupport Pro</a>
              </div>
            </li>
            <li class="nav-item">
              <a href="/rnd/lab" class="nav-link">연구개발</a>
              <div class="dropdown">
                <a href="/rnd/lab" class="dropdown-item">연구소</a>
                <a href="/rnd/activities" class="dropdown-item">연구개발 활동</a>
              </div>
            </li>
            <li class="nav-item">
              <a href="/careers/talent" class="nav-link">채용정보</a>
              <div class="dropdown">
                <a href="/careers/talent" class="dropdown-item">인재상</a>
                <a href="https://recruit.itmoou.com" class="dropdown-item" target="_blank" rel="noopener noreferrer">채용공고</a>
              </div>
            </li>
            <li class="nav-item">
              <a href="/support/customer" class="nav-link">지원센터</a>
              <div class="dropdown">
                <a href="/support/customer" class="dropdown-item">고객지원</a>
                <a href="/support/contact" class="dropdown-item">Contact Us</a>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  `
}

function getFooter() {
  return `
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-content">
          <div class="footer-section">
            <img src="/images/footericon.png" alt="IT moou" style="height: 40px; margin-bottom: 1rem;">
            <p>대표이사 : 심영민<br>
            충청북도 청주시 흥덕구 공단로126번길 51 청주산단스타트업센터 502호</p>
          </div>
          <div class="footer-section">
            <h3>연락처</h3>
            <p>대표번호: 043.715.8553<br>
            이메일: cs@itmoou.com</p>
          </div>
          <div class="footer-section">
            <h3>사업자 정보</h3>
            <p>(우) 28576 충청북도 청주시 흥덕구 공단로126번길 51 청주산단스타트업센터 502호<br>
            사업자등록번호: 229-81-43410</p>
          </div>
          <div class="footer-section">
            <h3>SNS</h3>
            <div class="social-links">
              <a href="https://www.instagram.com/itmoou/" target="_blank" rel="noopener noreferrer" class="social-link"><i class="fab fa-instagram"></i></a>
              <a href="https://www.linkedin.com/in/moou-it-6414573a8/" target="_blank" rel="noopener noreferrer" class="social-link"><i class="fab fa-linkedin-in"></i></a>
              <a href="https://www.youtube.com/@%EC%95%84%EC%9D%B4%ED%8B%B0%EB%AC%B4%EC%9C%A0" target="_blank" rel="noopener noreferrer" class="social-link"><i class="fab fa-youtube"></i></a>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p>2025 IT moou Co., Ltd. ALL RIGHTS RESERVED.</p>
        </div>
      </div>
    </footer>
  `
}

function getBaseHTML(title: string, content: string) {
  return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ITMOOU</title>
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
    <body>
        ${getHeader()}
        ${content}
        ${getFooter()}
        <script src="/static/app.js"></script>
    </body>
    </html>
  `
}

function getMainHTML() {
  return getBaseHTML('홈', `
    <div class="main-slider">
      <div class="slider-container">
        <div class="slide active">
          <img src="/images/slide1.jpg" alt="IT moou Slide 1">
          <div class="slide-content">
            <h2>기업 SaaS 솔루션 기업</h2>
            <p>글로벌 물류 SaaS 솔루션, 경영지원 AI 솔루션, 아이티무유를 소개합니다</p>
          </div>
        </div>
        <div class="slide">
          <img src="/images/slide2.jpg" alt="IT moou Slide 2">
          <div class="slide-content">
            <h2>혁신적인 AI&빅데이터 기술</h2>
            <p>첨단 기술로 기업의 미래를 만들어갑니다</p>
          </div>
        </div>
        <div class="slide">
          <img src="/images/slide3.jpg" alt="IT moou Slide 3">
          <div class="slide-content">
            <h2>글로벌 SaaS 기업</h2>
            <p>전 세계 고객의 신뢰를 받는 기업</p>
          </div>
        </div>
      </div>
      <div class="slider-controls">
        <span class="slider-dot active"></span>
        <span class="slider-dot"></span>
        <span class="slider-dot"></span>
      </div>
    </div>

    <section class="content-section" style="background: #f9f9f9;">
      <div class="section-header">
        <h2 class="section-title">왜 우리를 선택해야 할까요?</h2>
        <p class="section-subtitle">고객의 성공이 우리의 목표입니다</p>
      </div>
      <div class="grid-3">
        <div class="card">
          <div class="card-content">
            <h3 class="card-title"><i class="fas fa-microchip" style="color: #0052A5; margin-right: 0.5rem;"></i>첨단 기술</h3>
            <p class="card-text">최신 빅데이터 기술과 AI를 활용한 혁신적인 기업형 업무 솔루션을 제공합니다.</p>
          </div>
        </div>
        <div class="card">
          <div class="card-content">
            <h3 class="card-title"><i class="fas fa-headset" style="color: #0052A5; margin-right: 0.5rem;"></i>전문 지원</h3>
            <p class="card-text">전문 지식을 가지고 있는 기술 서비스로 고객의 성공을 함께하겠습니다.</p>
          </div>
        </div>
        <div class="card">
          <div class="card-content">
            <h3 class="card-title"><i class="fas fa-globe" style="color: #0052A5; margin-right: 0.5rem;"></i>글로벌 네트워크</h3>
            <p class="card-text">전 세계 파트너와의 협력을 통해 최상의 서비스를 제공합니다.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="content-section">
      <div class="section-header">
        <h2 class="section-title">우리의 솔루션</h2>
        <p class="section-subtitle">기업의 성장을 위한 혁신적인 B2B 솔루션을 제공합니다</p>
      </div>
      <div class="grid-3">
        <div class="card">
          <div class="card-content">
            <h3 class="card-title">LogiNexio</h3>
            <p class="card-text">최첨단 기술 및 솔루션으로 기업의 제조 물류부터, 고객 인도까지 한번에 한곳에서 해결할 수 있습니다. 팔레트 자동화, 물류 서류 자동화, 포워더 계약 등 다양한 기능을 지원합니다.</p>
            <a href="/solutions/loginexio" style="color: #0052A5; text-decoration: none;">자세히 보기 →</a>
          </div>
        </div>
        <div class="card">
          <img src="/images/bizsupport.jpg" alt="BizSupport Pro" class="card-image" style="display: none;">
          <div class="card-content">
            <h3 class="card-title">BizSupport Pro</h3>
            <p class="card-text">기업의 업무 효율성을 극대화하는 종합 비즈니스 지원 플랫폼입니다. 프로젝트 관리, 실시간 협업 도구, 데이터 분석 및 리포팅 기능을 제공합니다.</p>
            <a href="/solutions/bizsupport" style="color: #0052A5; text-decoration: none;">자세히 보기 →</a>
          </div>
        </div>
      </div>
    </section>

    <section style="background: linear-gradient(135deg, #0052A5 0%, #003366 100%); color: white; max-width: 1400px; margin: 0 auto; padding: 4rem 2rem 10rem 2rem;">
      <div class="section-header">
        <h2 class="section-title" style="color: white;">고객 성공 사례</h2>
        <p class="section-subtitle" style="color: rgba(255,255,255,0.9);">다양한 산업 분야의 기업들이 우리 솔루션으로 성공을 경험하고 있습니다</p>
      </div>
      <div class="grid-3">
        <div class="card">
          <div class="card-content">
            <h3 class="card-title">제조업 A사</h3>
            <p class="card-text">"LogiNexio 도입 후 물류 효율이 45% 증가했으며, 수출에 걸리는 시간이 대폭 감소하여 직원들의 업무 효율성이 20% 증가했습니다."</p>
            <p style="margin-top: 1rem; color: #666; font-size: 0.9rem;">- 물류 본부장</p>
          </div>
        </div>
        <div class="card">
          <div class="card-content">
            <h3 class="card-title">금융업 B사</h3>
            <p class="card-text">"BizSupport Pro로 통합 프로젝트 관리 후 업무 생산성이 70% 향상되고, 팀 간 협업이 원활해졌습니다."</p>
            <p style="margin-top: 1rem; color: #666; font-size: 0.9rem;">- 프로젝트 매니저</p>
          </div>
        </div>
        <div class="card">
          <div class="card-content">
            <h3 class="card-title">유통업 C사</h3>
            <p class="card-text">"통합 솔루션 도입으로 운영 비용이 40% 절감되고, 실무 생산성이 크게 향상되었습니다."</p>
            <p style="margin-top: 1rem; color: #666; font-size: 0.9rem;">- 운영 본부장</p>
          </div>
        </div>
      </div>
      <div class="text-center mt-4">
        <a href="/support/contact" style="display: inline-block; padding: 1rem 2rem; background: white; color: #0052A5; text-decoration: none; border-radius: 4px; font-weight: bold; transition: all 0.3s;">지원센터 방문</a>
      </div>
    </section>

    <section class="content-section" style="background: white; padding: 4rem 2rem;">
      <div class="section-header">
        <h2 class="section-title">회사소식</h2>
        <p class="section-subtitle">B2B 고객이 경험하는 아이티무유만의 이야기를 들려드립니다.</p>
      </div>
      <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
        <div style="padding: 1.5rem; border: 1px solid #e0e0e0; border-radius: 8px; transition: all 0.3s; cursor: pointer;">
          <h3 style="color: #0052A5; margin-bottom: 0.5rem; font-size: 1.1rem;">글로벌 물류 시장 진출 계획 발표</h3>
          <p style="color: #666; line-height: 1.6; font-size: 0.95rem;">아이티무유는 2026년 상반기 아시아 물류 시장 진출을 목표로 LogiNexio 플랫폼의 다국어 지원 및 현지화 작업을 진행하고 있습니다.</p>
          <p style="color: #999; font-size: 0.85rem; margin-top: 1rem;">2025.01.15</p>
        </div>
        <div style="padding: 1.5rem; border: 1px solid #e0e0e0; border-radius: 8px; transition: all 0.3s; cursor: pointer;">
          <h3 style="color: #0052A5; margin-bottom: 0.5rem; font-size: 1.1rem;">독자 팔레타이징 기술 개발 성공</h3>
          <p style="color: #666; line-height: 1.6; font-size: 0.95rem;">2025년 자체 개발한 팔레타이징 기술이 국내 제조업체에서 높은 평가를 받으며 물류 자동화 분야에서 기술력을 인정받고 있습니다.</p>
          <p style="color: #999; font-size: 0.85rem; margin-top: 1rem;">2025.01.10</p>
        </div>
        <div style="padding: 1.5rem; border: 1px solid #e0e0e0; border-radius: 8px; transition: all 0.3s; cursor: pointer;">
          <h3 style="color: #0052A5; margin-bottom: 0.5rem; font-size: 1.1rem;">AI 기반 수출 서류 자동화 솔루션 업그레이드</h3>
          <p style="color: #666; line-height: 1.6; font-size: 0.95rem;">최신 AI 기술을 적용하여 수출 서류 작성 시간을 60% 단축하고 오류율을 80% 감소시킨 업그레이드 버전을 출시했습니다.</p>
          <p style="color: #999; font-size: 0.85rem; margin-top: 1rem;">2024.12.20</p>
        </div>
        <div style="padding: 1.5rem; border: 1px solid #e0e0e0; border-radius: 8px; transition: all 0.3s; cursor: pointer;">
          <h3 style="color: #0052A5; margin-bottom: 0.5rem; font-size: 1.1rem;">BizSupport Pro 개발 착수</h3>
          <p style="color: #666; line-height: 1.6; font-size: 0.95rem;">기업 업무 효율성을 극대화하는 종합 비즈니스 지원 플랫폼 BizSupport Pro의 개발을 본격적으로 시작했습니다. 프로젝트 관리와 실시간 협업 도구를 중심으로 개발 중입니다.</p>
          <p style="color: #999; font-size: 0.85rem; margin-top: 1rem;">2026.01.02</p>
        </div>
        <div style="padding: 1.5rem; border: 1px solid #e0e0e0; border-radius: 8px; transition: all 0.3s; cursor: pointer;">
          <h3 style="color: #0052A5; margin-bottom: 0.5rem; font-size: 1.1rem;">중소기업 디지털 전환 지원 프로그램 시작</h3>
          <p style="color: #666; line-height: 1.6; font-size: 0.95rem;">중소기업의 디지털 전환을 돕기 위해 무료 컨설팅과 교육 프로그램을 제공하는 '아이티무유 성장 파트너십'을 시작했습니다.</p>
          <p style="color: #999; font-size: 0.85rem; margin-top: 1rem;">2024.11.15</p>
        </div>
        <div style="padding: 1.5rem; border: 1px solid #e0e0e0; border-radius: 8px; transition: all 0.3s; cursor: pointer;">
          <h3 style="color: #0052A5; margin-bottom: 0.5rem; font-size: 1.1rem;">연매출 7천만원 달성 및 성장세 지속</h3>
          <p style="color: #666; line-height: 1.6; font-size: 0.95rem;">2025년 연매출 7천만원을 달성하며 안정적인 성장세를 이어가고 있으며, 2026년 목표인 1억원 달성을 향해 나아가고 있습니다.</p>
          <p style="color: #999; font-size: 0.85rem; margin-top: 1rem;">2024.11.01</p>
        </div>
      </div>
      <div class="text-center mt-4" style="margin-top: 2rem;">
        <a href="/company/news" style="display: inline-block; padding: 1rem 2rem; background: #0052A5; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; transition: all 0.3s;">더 많은 소식 보기</a>
      </div>
    </section>
  `)
}

function getCompanyHTML() {
  return getBaseHTML('회사소개', `
    <div style="margin-top: 80px;">
      <section style="background: linear-gradient(135deg, #0052A5 0%, #003366 100%); color: white; padding: 4rem 2rem; text-align: center;">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">회사소개</h1>
        <p style="font-size: 1.2rem;">글로벌 물류 SaaS 솔루션, 경영지원 AI 솔루션, 아이티무유를 소개합니다</p>
      </section>

      <section class="content-section">
        <div class="section-header">
          <h2 class="section-title">혁신적인 AI&빅데이터 솔루션 기업</h2>
        </div>
        <div style="max-width: 900px; margin: 0 auto; line-height: 1.8; color: #666;">
          <p style="margin-bottom: 1.5rem;">
            아이티무유는 <strong style="color: #0052A5;">'기술로 세상을 움직이다'</strong>이라는 슬로건과 함께 혁신을 통한 기업의 미래가치 실현을 위해 물류 솔루션 개발로 시작한 기업의 물류 및 경영 솔루션을 확보한 기업입니다.
          </p>
          <p style="margin-bottom: 1.5rem;">
            아이티무유는 물류와 경영 자문의 역량을 바탕으로 물류 산업에 필요한 팔레타이징, 수출 서류 자동화, 포워더 컨택 및 선적 등의 올인원 솔루션을 시장에 공급합니다. 또한 경영에 도움이 될 수 있도록 기업 맞춤형 AI 솔루션으로 기업의 가치를 높이고 같이 성장하는 <strong style="color: #0052A5;">대한민국 최대의 비즈니스 솔루션 기업</strong>으로 성장을 준비하고 있습니다.
          </p>
        </div>
      </section>

      <section class="content-section" style="background: #f9f9f9;">
        <div class="grid-3">
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-eye"></i> Vision</h3>
              <p class="card-text">데이터와 AI로 전 세계 중소 수출 기업의 운영을 표준화하는 디지털 운영 OS 구축</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-bullseye"></i> Mission</h3>
              <p class="card-text">모든 기업의 업무를 한번에, 오류 없이 처리할 수 있는 원스톱 SaaS 제공</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-heart"></i> Core Values</h3>
              <p class="card-text">정확, 효율, 투명, 연결, 고객중심</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `)
}

function getCEOHTML() {
  return getBaseHTML('CEO 메시지', `
    <div style="margin-top: 80px;">
      <section style="background: linear-gradient(135deg, #0052A5 0%, #003366 100%); color: white; padding: 4rem 2rem; text-align: center;">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">CEO 메시지</h1>
        <p style="font-size: 1.2rem;">대표이사 심영민</p>
      </section>

      <section class="content-section">
        <div style="max-width: 1000px; margin: 0 auto;">
          <div style="display: flex; gap: 3rem; align-items: flex-start;">
            <div style="flex: 1; line-height: 1.8; color: #666;">
              <p style="margin-bottom: 1.5rem; font-size: 1.1rem;">
                안녕하십니까. IT moou 대표이사 심영민입니다.
              </p>
              <p style="margin-bottom: 1.5rem;">
                저희 아이티무유를 찾아주신 모든 분들께 진심으로 감사의 말씀을 드립니다. 저희는 '기술로 세상을 움직이다'라는 슬로건 아래 기업의 안정적인 성장과 미래가치를 위해 끊임없이 노력하고 있습니다.
              </p>
              <p style="margin-bottom: 1.5rem;">
                아이티무유는 물류 솔루션과 경영지원 솔루션을 아우르는 기업 운영 SaaS를 통해 복잡한 업무를 더 정확하고 효율적으로 개선하는 데 집중해왔습니다.
              </p>
              <p style="margin-bottom: 1.5rem;">
                앞으로도 지속적인 연구개발과 품질 혁신을 통해 고객에게 더 나은 경험과 확신 있는 성장 파트너가 되겠습니다.
              </p>
              <p style="margin-bottom: 1.5rem;">
                변화하는 환경 속에서 혁신과 도전 정신으로 새로운 미래를 열어가는 아이티무유가 되겠습니다. 여러분의 지속적인 관심과 성원을 부탁드립니다.
              </p>
              <p style="margin-top: 3rem;">
                <strong style="color: #0052A5; font-size: 1.2rem;">대표이사 심영민</strong>
              </p>
            </div>
            <div style="flex: 0 0 250px; text-align: center;">
              <img src="/images/ceo.jpg" alt="CEO 심영민" style="width: 100%; border-radius: 10px; object-fit: cover; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h3 style="font-size: 1.2rem; color: #0052A5; margin-top: 1rem;">심영민</h3>
              <p style="color: #666; font-size: 0.9rem;">대표이사</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `)
}

function getHistoryHTML() {
  return getBaseHTML('연혁', `
    <div style="margin-top: 80px;">
      <section style="background: linear-gradient(135deg, #0052A5 0%, #003366 100%); color: white; padding: 4rem 2rem; text-align: center;">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">연혁</h1>
        <p style="font-size: 1.2rem;">IT moou의 성장 역사</p>
      </section>

      <section class="content-section">
        <div style="max-width: 900px; margin: 0 auto;">
          <div style="border-left: 3px solid #0052A5; padding-left: 2rem;">
            <div style="margin-bottom: 3rem;">
              <h3 style="color: #0052A5; font-size: 1.8rem; margin-bottom: 0.5rem;">2026</h3>
              <ul style="list-style: none; padding: 0; color: #666; line-height: 2;">
                <li>• 연 매출 1억원 달성</li>
              </ul>
            </div>
            <div style="margin-bottom: 3rem;">
              <h3 style="color: #0052A5; font-size: 1.8rem; margin-bottom: 0.5rem;">2025</h3>
              <ul style="list-style: none; padding: 0; color: #666; line-height: 2;">
                <li>• 연 매출 7천만원 달성</li>
                <li>• 독자 팔레타이징 기술 개발</li>
              </ul>
            </div>
            <div style="margin-bottom: 3rem;">
              <h3 style="color: #0052A5; font-size: 1.8rem; margin-bottom: 0.5rem;">2024</h3>
              <ul style="list-style: none; padding: 0; color: #666; line-height: 2;">
                <li>• IT moou 설립</li>
                <li>• LogiNexio 개발 착수</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  `)
}

function getESGHTML() {
  return getBaseHTML('ESG 경영', `
    <div style="margin-top: 80px;">
      <section style="background: linear-gradient(135deg, #0052A5 0%, #003366 100%); color: white; padding: 4rem 2rem; text-align: center;">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">ESG 경영</h1>
        <p style="font-size: 1.2rem;">지속가능한 미래를 위한 SD 바이오센서의 약속</p>
      </section>

      <section class="content-section">
        <div class="grid-3">
          <div class="card">
            <div class="card-content">
              <h3 class="card-title" style="color: #00A651;"><i class="fas fa-leaf"></i> Environment</h3>
              <p class="card-text">친환경 제조 공정과 탄소 중립 목표 달성을 위해 노력하고 있습니다. 지속 가능한 환경 보호를 위한 다양한 활동을 전개합니다.</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title" style="color: #0052A5;"><i class="fas fa-users"></i> Social</h3>
              <p class="card-text">임직원의 복지 향상과 지역사회 기여를 통해 사회적 책임을 다하고 있습니다. 상생과 협력의 가치를 실천합니다.</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title" style="color: #FF6B00;"><i class="fas fa-balance-scale"></i> Governance</h3>
              <p class="card-text">투명한 경영과 윤리적 기업 문화를 구축하여 이해관계자의 신뢰를 얻고 있습니다. 공정하고 책임있는 지배구조를 운영합니다.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `)
}

function getLocationHTML() {
  return getBaseHTML('오시는 길', `
    <div style="margin-top: 80px;">
      <section style="background: linear-gradient(135deg, #0052A5 0%, #003366 100%); color: white; padding: 4rem 2rem; text-align: center;">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">오시는 길</h1>
        <p style="font-size: 1.2rem;">IT moou를 찾아오시는 길을 안내합니다</p>
      </section>

      <section class="content-section">
        <div style="max-width: 900px; margin: 0 auto;">
          <div style="margin-bottom: 3rem;">
            <h3 style="color: #0052A5; font-size: 1.5rem; margin-bottom: 1rem;"><i class="fas fa-map-marker-alt"></i> 주소</h3>
            <p style="color: #666; line-height: 1.8;">
              (우) 28576 충청북도 청주시 흥덕구 공단로126번길 51 청주산단스타트업센터 502호
            </p>
          </div>
          
          <div style="margin-bottom: 3rem;">
            <h3 style="color: #0052A5; font-size: 1.5rem; margin-bottom: 1rem;"><i class="fas fa-phone"></i> 연락처</h3>
            <p style="color: #666; line-height: 1.8;">
              대표번호: 043.715.8553<br>
              이메일: cs@itmoou.com
            </p>
          </div>

          <div>
            <h3 style="color: #0052A5; font-size: 1.5rem; margin-bottom: 1rem;"><i class="fas fa-car"></i> 자가용</h3>
            <p style="color: #666; line-height: 1.8;">
              중부고속도로 → 서청주IC → 청주산단스타트업센터<br>
              주차: 건물 뒷편 주차장 이용 가능
            </p>
          </div>
        </div>
      </section>
    </div>
  `)
}

function getCompanyNewsHTML() {
  return getBaseHTML('회사소식', `
    <div style="margin-top: 80px;">
      <section style="background: linear-gradient(135deg, #0052A5 0%, #003366 100%); color: white; padding: 4rem 2rem; text-align: center;">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">회사소식</h1>
        <p style="font-size: 1.2rem;">아이티무유 소식을 들려드립니다.</p>
      </section>

      <section class="content-section">
        <div style="max-width: 900px; margin: 0 auto;">
          <div style="margin-bottom: 2rem;">
            <input type="text" id="searchInput" placeholder="제목으로 검색하세요..." style="width: 100%; padding: 1rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;" onkeyup="filterNews()">
          </div>

          <div id="newsList" style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div class="news-item" data-title="글로벌 물류 시장 진출 계획 발표" style="display: flex; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; transition: all 0.3s;">
              <div style="background: linear-gradient(135deg, #0052A5 0%, #003366 100%); min-width: 150px; display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-globe" style="font-size: 3rem; color: white;"></i>
              </div>
              <div style="padding: 1.5rem; flex: 1;">
                <h3 style="color: #0052A5; margin-bottom: 0.5rem; font-size: 1.2rem;">글로벌 물류 시장 진출 계획 발표</h3>
                <p style="color: #999; font-size: 0.85rem; margin-bottom: 0.8rem;">2025.01.15</p>
                <p style="color: #666; line-height: 1.6; font-size: 0.95rem;">아이티무유는 2026년 상반기 아시아 물류 시장 진출을 목표로 LogiNexio 플랫폼의 다국어 지원 및 현지화 작업을 진행하고 있습니다. 베트남, 태국 등 동남아시아 주요 국가를 중심으로 시장 조사를 완료하고 현지 파트너십을 구축 중입니다.</p>
              </div>
            </div>

            <div class="news-item" data-title="독자 팔레타이징 기술 개발 성공" style="display: flex; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; transition: all 0.3s;">
              <div style="background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%); min-width: 150px; display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-boxes" style="font-size: 3rem; color: white;"></i>
              </div>
              <div style="padding: 1.5rem; flex: 1;">
                <h3 style="color: #0052A5; margin-bottom: 0.5rem; font-size: 1.2rem;">독자 팔레타이징 기술 개발 성공</h3>
                <p style="color: #999; font-size: 0.85rem; margin-bottom: 0.8rem;">2025.01.10</p>
                <p style="color: #666; line-height: 1.6; font-size: 0.95rem;">2025년 자체 개발한 팔레타이징 기술이 국내 제조업체에서 높은 평가를 받으며 물류 자동화 분야에서 기술력을 인정받고 있습니다. AI 기반 최적 배치 알고리즘으로 공간 활용도를 40% 향상시켰습니다.</p>
              </div>
            </div>

            <div class="news-item" data-title="AI 기반 수출 서류 자동화 솔루션 업그레이드" style="display: flex; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; transition: all 0.3s;">
              <div style="background: linear-gradient(135deg, #6f42c1 0%, #4e2a84 100%); min-width: 150px; display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-file-alt" style="font-size: 3rem; color: white;"></i>
              </div>
              <div style="padding: 1.5rem; flex: 1;">
                <h3 style="color: #0052A5; margin-bottom: 0.5rem; font-size: 1.2rem;">AI 기반 수출 서류 자동화 솔루션 업그레이드</h3>
                <p style="color: #999; font-size: 0.85rem; margin-bottom: 0.8rem;">2024.12.20</p>
                <p style="color: #666; line-height: 1.6; font-size: 0.95rem;">최신 AI 기술을 적용하여 수출 서류 작성 시간을 60% 단축하고 오류율을 80% 감소시킨 업그레이드 버전을 출시했습니다. 자연어 처리 기술로 다양한 형식의 문서를 자동으로 인식하고 변환합니다.</p>
              </div>
            </div>

            <div class="news-item" data-title="BizSupport Pro 개발 착수" style="display: flex; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; transition: all 0.3s;">
              <div style="background: linear-gradient(135deg, #fd7e14 0%, #c35a00 100%); min-width: 150px; display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-chart-line" style="font-size: 3rem; color: white;"></i>
              </div>
              <div style="padding: 1.5rem; flex: 1;">
                <h3 style="color: #0052A5; margin-bottom: 0.5rem; font-size: 1.2rem;">BizSupport Pro 개발 착수</h3>
                <p style="color: #999; font-size: 0.85rem; margin-bottom: 0.8rem;">2026.01.02</p>
                <p style="color: #666; line-height: 1.6; font-size: 0.95rem;">기업 업무 효율성을 극대화하는 종합 비즈니스 지원 플랫폼 BizSupport Pro의 개발을 본격적으로 시작했습니다. 프로젝트 관리, 실시간 협업 도구, 데이터 분석 및 리포팅 기능을 중심으로 개발을 진행하고 있습니다.</p>
              </div>
            </div>

            <div class="news-item" data-title="중소기업 디지털 전환 지원 프로그램 시작" style="display: flex; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; transition: all 0.3s;">
              <div style="background: linear-gradient(135deg, #17a2b8 0%, #117a8b 100%); min-width: 150px; display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-handshake" style="font-size: 3rem; color: white;"></i>
              </div>
              <div style="padding: 1.5rem; flex: 1;">
                <h3 style="color: #0052A5; margin-bottom: 0.5rem; font-size: 1.2rem;">중소기업 디지털 전환 지원 프로그램 시작</h3>
                <p style="color: #999; font-size: 0.85rem; margin-bottom: 0.8rem;">2024.11.15</p>
                <p style="color: #666; line-height: 1.6; font-size: 0.95rem;">중소기업의 디지털 전환을 돕기 위해 무료 컨설팅과 교육 프로그램을 제공하는 '아이티무유 성장 파트너십'을 시작했습니다. 매월 10개 기업을 선정하여 맞춤형 솔루션 도입을 지원합니다.</p>
              </div>
            </div>

            <div class="news-item" data-title="연매출 7천만원 달성 및 성장세 지속" style="display: flex; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; transition: all 0.3s;">
              <div style="background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%); min-width: 150px; display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-trophy" style="font-size: 3rem; color: white;"></i>
              </div>
              <div style="padding: 1.5rem; flex: 1;">
                <h3 style="color: #0052A5; margin-bottom: 0.5rem; font-size: 1.2rem;">연매출 7천만원 달성 및 성장세 지속</h3>
                <p style="color: #999; font-size: 0.85rem; margin-bottom: 0.8rem;">2024.11.01</p>
                <p style="color: #666; line-height: 1.6; font-size: 0.95rem;">2025년 연매출 7천만원을 달성하며 안정적인 성장세를 이어가고 있으며, 2026년 목표인 1억원 달성을 향해 나아가고 있습니다. 고객사 수가 전년 대비 150% 증가하며 시장 입지를 넓히고 있습니다.</p>
              </div>
            </div>

            <div class="news-item" data-title="클라우드 기반 협업 플랫폼 출시" style="display: flex; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; transition: all 0.3s;">
              <div style="background: linear-gradient(135deg, #20c997 0%, #17a2b8 100%); min-width: 150px; display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-cloud" style="font-size: 3rem; color: white;"></i>
              </div>
              <div style="padding: 1.5rem; flex: 1;">
                <h3 style="color: #0052A5; margin-bottom: 0.5rem; font-size: 1.2rem;">클라우드 기반 협업 플랫폼 출시</h3>
                <p style="color: #999; font-size: 0.85rem; margin-bottom: 0.8rem;">2024.10.15</p>
                <p style="color: #666; line-height: 1.6; font-size: 0.95rem;">언제 어디서나 팀원들과 실시간으로 협업할 수 있는 클라우드 기반 플랫폼을 새롭게 출시했습니다. 모바일 앱 지원으로 이동 중에도 업무가 가능합니다.</p>
              </div>
            </div>
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
  `)
}

function getLogiNexioHTML() {
  return getBaseHTML('LogiNexio', `
    <div style="margin-top: 80px;">
      <section style="background: linear-gradient(135deg, #0052A5 0%, #003366 100%); color: white; padding: 4rem 2rem; text-align: center;">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">LogiNexio</h1>
        <p style="font-size: 1.2rem;">최첨단 기술 및 솔루션으로 기업의 제조 물류부터, 고객 인도까지 한번에 한곳에서 해결</p>
      </section>

      <section class="content-section">
        <div style="max-width: 900px; margin: 0 auto; line-height: 1.8; color: #666; margin-bottom: 3rem;">
          <p style="margin-bottom: 1.5rem; text-align: center; font-size: 1.1rem;">
            최첨단 기술 및 솔루션으로 기업의 제조 물류부터, 고객 인도까지 한번에 한곳에서 해결할 수 있습니다.
          </p>
        </div>

        <div class="section-header">
          <h2 class="section-title">주요 기능</h2>
        </div>
        <div style="max-width: 1000px; margin: 0 auto;">
          <!-- 팔레트 자동화 -->
          <div style="display: flex; gap: 2rem; align-items: center; margin-bottom: 3rem; padding: 2rem; background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="flex: 1;">
              <h3 style="color: #0052A5; font-size: 1.5rem; margin-bottom: 1rem;"><i class="fas fa-boxes" style="margin-right: 0.5rem;"></i> 팔레트 자동화</h3>
              <p style="color: #666; line-height: 1.8;">물류 팔레트 관리를 자동화하여 효율적인 창고 운영을 지원합니다. AI 기반 최적화로 공간 활용도를 극대화하고, 실시간 재고 추적으로 정확한 물류 관리가 가능합니다.</p>
            </div>
            <div style="flex: 0 0 250px;">
              <img src="/images/pallet.png" alt="팔레트 자동화" style="width: 100%; border-radius: 8px; object-fit: cover;">
            </div>
          </div>

          <!-- 물류 서류 자동화 -->
          <div style="display: flex; gap: 2rem; align-items: center; margin-bottom: 3rem; padding: 2rem; background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); flex-direction: row-reverse;">
            <div style="flex: 1;">
              <h3 style="color: #0052A5; font-size: 1.5rem; margin-bottom: 1rem;"><i class="fas fa-file-alt" style="margin-right: 0.5rem;"></i> 물류 서류 자동화</h3>
              <p style="color: #666; line-height: 1.8;">수출입 서류, 운송장 등 물류 관련 서류를 자동으로 생성하고 관리합니다. 복잡한 서류 작업을 간소화하여 업무 효율성을 대폭 향상시킵니다.</p>
            </div>
            <div style="flex: 0 0 250px;">
              <img src="/images/docu.png" alt="물류 서류 자동화" style="width: 100%; border-radius: 8px; object-fit: cover;">
            </div>
          </div>

          <!-- 포워더 계약 관리 -->
          <div style="display: flex; gap: 2rem; align-items: center; margin-bottom: 3rem; padding: 2rem; background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="flex: 1;">
              <h3 style="color: #0052A5; font-size: 1.5rem; margin-bottom: 1rem;"><i class="fas fa-handshake" style="margin-right: 0.5rem;"></i> 포워더 계약 관리</h3>
              <p style="color: #666; line-height: 1.8;">글로벌 포워더와의 계약 및 운송 관리를 통합하여 처리합니다. 최적의 운송 경로와 비용을 자동으로 제안하여 물류 비용을 절감합니다.</p>
            </div>
            <div style="flex: 0 0 250px;">
              <img src="/images/foward.png" alt="포워더 계약 관리" style="width: 100%; border-radius: 8px; object-fit: cover;">
            </div>
          </div>

          <!-- 실시간 물류 추적 -->
          <div style="display: flex; gap: 2rem; align-items: center; margin-bottom: 3rem; padding: 2rem; background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); flex-direction: row-reverse;">
            <div style="flex: 1;">
              <h3 style="color: #0052A5; font-size: 1.5rem; margin-bottom: 1rem;"><i class="fas fa-map-marker-alt" style="margin-right: 0.5rem;"></i> 실시간 물류 추적</h3>
              <p style="color: #666; line-height: 1.8;">제조부터 고객 인도까지 전체 물류 흐름을 실시간으로 추적합니다. GPS 기반 위치 추적과 예상 도착 시간 알림으로 고객 만족도를 향상시킵니다.</p>
            </div>
            <div style="flex: 0 0 250px;">
              <img src="/images/locate.png" alt="실시간 물류 추적" style="width: 100%; border-radius: 8px; object-fit: cover;">
            </div>
          </div>
        </div>
      </section>
    </div>
  `)
}

function getBizSupportHTML() {
  return getBaseHTML('BizSupport Pro', `
    <div style="margin-top: 80px;">
      <section style="background: linear-gradient(135deg, #0052A5 0%, #003366 100%); color: white; padding: 4rem 2rem; text-align: center;">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">BizSupport Pro</h1>
        <p style="font-size: 1.2rem;">기업의 업무 효율성을 극대화하는 종합 비즈니스 플랫폼</p>
      </section>

      <section class="content-section">
        <div style="max-width: 900px; margin: 0 auto; text-align: center; margin-bottom: 3rem;">
          <img src="/images/bizsupport.jpg" alt="BizSupport Pro" style="max-width: 100%; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: none;">
        </div>

        <div style="max-width: 900px; margin: 0 auto; line-height: 1.8; color: #666; margin-bottom: 3rem;">
          <p style="margin-bottom: 1.5rem;">
            기업의 업무 효율성을 극대화하는 종합 비즈니스 지원 플랫폼입니다. 프로젝트 관리, 실시간 협업 도구, 데이터 분석 및 리포팅, 워크플로우 자동화 기능을 하나의 플랫폼에서 제공하여 업무 생산성을 획기적으로 향상시킵니다.
          </p>
        </div>

        <div class="section-header">
          <h2 class="section-title">주요 기능</h2>
        </div>
        <div class="grid-3">
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-tasks"></i> 통합 프로젝트 관리</h3>
              <p class="card-text">프로젝트의 전체 라이프사이클을 효율적으로 관리하고 추적할 수 있습니다.</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-users"></i> 실시간 협업 도구</h3>
              <p class="card-text">팀원 간 실시간 커뮤니케이션과 파일 공유로 협업 효율을 높입니다.</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-chart-line"></i> 데이터 분석 및 리포팅</h3>
              <p class="card-text">비즈니스 데이터를 시각화하고 인사이트를 제공합니다.</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-cogs"></i> 워크플로우 자동화</h3>
              <p class="card-text">반복적인 업무를 자동화하여 생산성을 향상시킵니다.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `)
}

function getLabHTML() {
  return getBaseHTML('연구소', `
    <div style="margin-top: 80px;">
      <section style="background: linear-gradient(135deg, #0052A5 0%, #003366 100%); color: white; padding: 4rem 2rem; text-align: center;">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">연구소</h1>
        <p style="font-size: 1.2rem;">혁신적인 기술 개발의 중심</p>
      </section>

      <section class="content-section">
        <div style="max-width: 900px; margin: 0 auto; line-height: 1.8; color: #666;">
          <p style="margin-bottom: 1.5rem;">
            아이티무유 연구소는 기업의 물류 흐름 및 경영 분야의 혁신적인 기술을 개발하는 핵심 조직입니다. 우수한 연구 개발 인력을 바탕으로 차세대 기업형 기술을 개발하고 있습니다.
          </p>
        </div>

        <div class="grid-3">
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-microscope"></i> 첨단 연구 시설</h3>
              <p class="card-text">최신 연구 장비와 시설을 갖춘 세계적 수준의 연구 환경을 제공합니다.</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-user-graduate"></i> 전문 연구 인력</h3>
              <p class="card-text">해당 분야 최고의 전문가들이 연구개발을 주도하고 있습니다.</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-handshake"></i> 산학협력</h3>
              <p class="card-text">국내외 대학 및 연구기관과의 긴밀한 협력 네트워크를 구축하고 있습니다.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `)
}

function getActivitiesHTML() {
  return getBaseHTML('연구개발 활동', `
    <div style="margin-top: 80px;">
      <section style="background: linear-gradient(135deg, #0052A5 0%, #003366 100%); color: white; padding: 4rem 2rem; text-align: center;">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">연구개발 활동</h1>
        <p style="font-size: 1.2rem;">지속적인 혁신으로 미래를 준비합니다</p>
      </section>

      <section class="content-section">
        <div class="section-header">
          <h2 class="section-title">주요 연구 분야</h2>
        </div>
        <div class="grid-3">
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-truck"></i> 물류 최적화 기술</h3>
              <p class="card-text">차세대 AI 개발을 통한 정확도 향상</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-database"></i> 빅데이터 처리 시스템</h3>
              <p class="card-text">빅데이터를 활용한 기업 맞춤 데이터 처리 솔루션 개발</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-chart-line"></i> 경영지원 솔루션</h3>
              <p class="card-text">기업 내부의 빅데이터를 활용하여 AI가 기업의 최적화 해법을 제시</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `)
}

function getTalentHTML() {
  return getBaseHTML('인재상', `
    <div style="margin-top: 80px;">
      <section style="background: linear-gradient(135deg, #0052A5 0%, #003366 100%); color: white; padding: 4rem 2rem; text-align: center;">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">인재상</h1>
        <p style="font-size: 1.2rem;">IT moou가 찾는 인재</p>
      </section>

      <section class="content-section">
        <div class="section-header">
          <h2 class="section-title">우리가 찾는 인재</h2>
        </div>
        <div class="grid-3">
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-lightbulb"></i> 혁신적 사고</h3>
              <p class="card-text">새로운 아이디어로 끊임없이 도전하는 창의적인 인재</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-handshake"></i> 협업 능력</h3>
              <p class="card-text">팀워크를 중시하고 함께 성장하는 인재</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-star"></i> 전문성</h3>
              <p class="card-text">자신의 분야에서 전문성을 갖추고 발전하는 인재</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-heart"></i> 책임감</h3>
              <p class="card-text">맡은 일에 최선을 다하는 책임감 있는 인재</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-globe"></i> 글로벌 마인드</h3>
              <p class="card-text">세계를 무대로 활동하는 글로벌 인재</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-graduation-cap"></i> 학습 열정</h3>
              <p class="card-text">지속적으로 배우고 성장하려는 열정을 가진 인재</p>
            </div>
          </div>
        </div>

        <div style="margin-top: 4rem; text-align: center;">
          <a href="/careers" style="display: inline-block; padding: 1rem 3rem; background: #0052A5; color: white; text-decoration: none; border-radius: 4px; font-size: 1.1rem; font-weight: bold; transition: all 0.3s;">채용공고 보기</a>
        </div>
      </section>
    </div>
  `)
}

function getCustomerSupportHTML() {
  return getBaseHTML('고객지원', `
    <div style="margin-top: 80px;">
      <section style="background: linear-gradient(135deg, #0052A5 0%, #003366 100%); color: white; padding: 4rem 2rem; text-align: center;">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">고객지원</h1>
        <p style="font-size: 1.2rem;">언제나 고객님을 위해 준비되어 있습니다</p>
      </section>

      <section class="content-section">
        <div class="grid-3">
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-headset"></i> 기술 지원</h3>
              <p class="card-text">제품 사용 중 발생하는 기술적 문제를 신속하게 해결해드립니다.</p>
              <p style="margin-top: 1rem; color: #0052A5; font-weight: bold;">전화: 043-715-8553</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-book"></i> 제품 교육</h3>
              <p class="card-text">제품의 효과적인 사용을 위한 교육 프로그램을 제공합니다.</p>
              <p style="margin-top: 1rem; color: #0052A5; font-weight: bold;">이메일: cs@itmoou.com</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-tools"></i> 유지보수</h3>
              <p class="card-text">정기적인 유지보수로 제품의 최적 성능을 유지합니다.</p>
              <p style="margin-top: 1rem; color: #0052A5; font-weight: bold;">이메일: service@itmoou.com</p>
            </div>
          </div>
        </div>

        <div style="max-width: 900px; margin: 4rem auto; padding: 2rem; background: #f9f9f9; border-radius: 8px;">
          <h3 style="color: #0052A5; font-size: 1.5rem; margin-bottom: 1rem; text-align: center;"><i class="fas fa-clock"></i> 운영 시간</h3>
          <p style="text-align: center; color: #666; line-height: 1.8;">
            평일: 09:00 - 18:00<br>
            점심시간: 12:00 - 13:00<br>
            주말 및 공휴일: 휴무
          </p>
        </div>
      </section>
    </div>
  `)
}

function getContactHTML() {
  return getBaseHTML('Contact Us', `
    <div style="margin-top: 80px;">
      <section style="background: linear-gradient(135deg, #0052A5 0%, #003366 100%); color: white; padding: 4rem 2rem; text-align: center;">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">Contact Us</h1>
        <p style="font-size: 1.2rem;">문의사항을 남겨주시면 빠르게 답변드리겠습니다</p>
      </section>

      <section class="content-section">
        <div style="max-width: 600px; margin: 0 auto;">
          <form style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="margin-bottom: 1.5rem;">
              <label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">이름 *</label>
              <input type="text" required style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
            </div>
            <div style="margin-bottom: 1.5rem;">
              <label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">이메일 *</label>
              <input type="email" required style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
            </div>
            <div style="margin-bottom: 1.5rem;">
              <label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">전화번호</label>
              <input type="tel" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
            </div>
            <div style="margin-bottom: 1.5rem;">
              <label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">문의 유형 *</label>
              <select required style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
                <option value="">선택해주세요</option>
                <option value="product">제품 문의</option>
                <option value="solution">솔루션 문의</option>
                <option value="support">기술 지원</option>
                <option value="partnership">파트너십</option>
                <option value="etc">기타</option>
              </select>
            </div>
            <div style="margin-bottom: 1.5rem;">
              <label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">문의 내용 *</label>
              <textarea required rows="6" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem; resize: vertical;"></textarea>
            </div>
            <div style="text-align: center;">
              <button type="submit" style="padding: 1rem 3rem; background: #0052A5; color: white; border: none; border-radius: 4px; font-size: 1.1rem; font-weight: bold; cursor: pointer; transition: all 0.3s;">문의하기</button>
            </div>
          </form>

          <div style="margin-top: 3rem; text-align: center; color: #666;">
            <p style="margin-bottom: 1rem;">또는 직접 연락주세요</p>
            <p style="font-size: 1.1rem;">
              <i class="fas fa-phone"></i> 043-715-8553<br>
              <i class="fas fa-envelope"></i> cs@itmoou.com
            </p>
          </div>
        </div>
      </section>
    </div>
  `)
}

export default app
