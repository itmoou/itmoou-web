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
  return c.redirect('https://careers.itmoou.com')
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
          <img src="/images/logo.png" alt="IT moou" style="height: 60px;">
        </a>
        <nav>
          <ul class="main-nav">
            <li class="nav-item">
              <a href="/company" class="nav-link">회사소개</a>
              <div class="dropdown">
                <a href="/company" class="dropdown-item">IT moou</a>
                <a href="/company/ceo" class="dropdown-item">CEO 메시지</a>
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
              <a href="/careers" class="nav-link">채용정보</a>
              <div class="dropdown">
                <a href="/careers/talent" class="dropdown-item">인재상</a>
                <a href="/careers" class="dropdown-item">채용공고</a>
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
            <h3>IT moou</h3>
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
              <a href="#" class="social-link"><i class="fab fa-facebook-f"></i></a>
              <a href="#" class="social-link"><i class="fab fa-instagram"></i></a>
              <a href="#" class="social-link"><i class="fab fa-twitter"></i></a>
              <a href="#" class="social-link"><i class="fab fa-youtube"></i></a>
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
        <title>${title} - IT moou</title>
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
          <img src="/images/tech.jpg" alt="첨단 기술" class="card-image">
          <div class="card-content">
            <h3 class="card-title">첨단 기술</h3>
            <p class="card-text">최신 빅데이터 기술과 AI를 활용한 혁신적인 기업형 업무 솔루션을 제공합니다.</p>
          </div>
        </div>
        <div class="card">
          <img src="/images/support.jpg" alt="고객 지원" class="card-image">
          <div class="card-content">
            <h3 class="card-title">전문 지원</h3>
            <p class="card-text">전문 지식을 가지고 있는 기술 서비스로 고객의 성공을 함께하겠습니다.</p>
          </div>
        </div>
        <div class="card">
          <img src="/images/global.jpg" alt="글로벌 네트워크" class="card-image">
          <div class="card-content">
            <h3 class="card-title">글로벌 네트워크</h3>
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
          <img src="/images/loginexio.jpg" alt="LogiNexio" class="card-image">
          <div class="card-content">
            <h3 class="card-title">LogiNexio</h3>
            <p class="card-text">최첨단 기술 및 솔루션으로 기업의 제조 물류부터, 고객 인도까지 한번에 한곳에서 해결할 수 있습니다. 팔레트 자동화, 물류 서류 자동화, 포워더 계약 등 다양한 기능을 지원합니다.</p>
            <a href="/solutions/loginexio" style="color: #0052A5; text-decoration: none;">자세히 보기 →</a>
          </div>
        </div>
        <div class="card">
          <img src="/images/bizsupport.jpg" alt="BizSupport Pro" class="card-image">
          <div class="card-content">
            <h3 class="card-title">BizSupport Pro</h3>
            <p class="card-text">기업의 업무 효율성을 극대화하는 종합 비즈니스 지원 플랫폼입니다. 프로젝트 관리, 실시간 협업 도구, 데이터 분석 및 리포팅 기능을 제공합니다.</p>
            <a href="/solutions/bizsupport" style="color: #0052A5; text-decoration: none;">자세히 보기 →</a>
          </div>
        </div>
      </div>
    </section>

    <section class="content-section" style="background: linear-gradient(135deg, #0052A5 0%, #003366 100%); color: white;">
      <div class="section-header">
        <h2 class="section-title" style="color: white;">고객 성공 사례</h2>
        <p class="section-subtitle" style="color: rgba(255,255,255,0.9);">다양한 산업 분야의 기업들이 우리 솔루션으로 성공을 경험하고 있습니다</p>
      </div>
      <div class="grid-3">
        <div class="card">
          <div class="card-content">
            <h3 class="card-title">제조업 A사</h3>
            <p class="card-text">"LogiNexio 도입 후 보안 사고가 90% 감소했으며, 직원들의 로그인 시간이 50% 단축되었습니다."</p>
            <p style="margin-top: 1rem; color: #666; font-size: 0.9rem;">- IT 담당 이사</p>
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
            아이티무유는 물류와 경영 자문의 역량을 바탕으로 물류 산업에 필요한 팔레타이징, 수출 서류 자동화, 포워더 컨택 및 선적 등의 올인원 솔루션을 시장에 공급합니다. 또한 경영에 도움이 될 수 있도록 기업 맞춤형 AI 솔루션으로 기업의 가치를 높이고 같이 성장하는 대한민국 최대의 비즈니스솔루션 기업으로 성장을 준비하고 있습니다.
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
              <h3 class="card-title"><i class="fas fa-heart"></i> 핵심가치</h3>
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
        <div style="max-width: 900px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 3rem;">
            <img src="/images/ceo.jpg" alt="CEO 심영민" style="width: 200px; height: 200px; border-radius: 50%; object-fit: cover; margin-bottom: 1rem;">
            <h3 style="font-size: 1.5rem; color: #0052A5;">대표이사 심영민</h3>
          </div>
          <div style="line-height: 1.8; color: #666;">
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
            <p style="margin-top: 3rem; text-align: right;">
              <strong style="color: #0052A5; font-size: 1.2rem;">대표이사 심영민</strong>
            </p>
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

function getLogiNexioHTML() {
  return getBaseHTML('LogiNexio', `
    <div style="margin-top: 80px;">
      <section style="background: linear-gradient(135deg, #0052A5 0%, #003366 100%); color: white; padding: 4rem 2rem; text-align: center;">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">LogiNexio</h1>
        <p style="font-size: 1.2rem;">최첨단 기술 및 솔루션으로 기업의 제조 물류부터, 고객 인도까지 한번에 한곳에서 해결</p>
      </section>

      <section class="content-section">
        <div style="max-width: 900px; margin: 0 auto; text-align: center; margin-bottom: 3rem;">
          <img src="/images/loginexio.jpg" alt="LogiNexio" style="max-width: 100%; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        </div>

        <div style="max-width: 900px; margin: 0 auto; line-height: 1.8; color: #666; margin-bottom: 3rem;">
          <p style="margin-bottom: 1.5rem;">
            최첨단 기술 및 솔루션으로 기업의 제조 물류부터, 고객 인도까지 한번에 한곳에서 해결할 수 있습니다. 팔레트 자동화, 물류 서류 자동화, 포워더 계약 등 다양한 기능을 지원합니다.
          </p>
        </div>

        <div class="section-header">
          <h2 class="section-title">주요 기능</h2>
        </div>
        <div class="grid-3">
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-boxes"></i> 팔레트 자동화</h3>
              <p class="card-text">물류 팔레트 관리를 자동화하여 효율적인 창고 운영을 지원합니다.</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-file-alt"></i> 물류 서류 자동화</h3>
              <p class="card-text">수출입 서류, 운송장 등 물류 관련 서류를 자동으로 생성하고 관리합니다.</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-handshake"></i> 포워더 계약 관리</h3>
              <p class="card-text">글로벌 포워더와의 계약 및 운송 관리를 통합하여 처리합니다.</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-chart-line"></i> 실시간 물류 추적</h3>
              <p class="card-text">제조부터 고객 인도까지 전체 물류 흐름을 실시간으로 추적합니다.</p>
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
          <img src="/images/bizsupport.jpg" alt="BizSupport Pro" style="max-width: 100%; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
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
