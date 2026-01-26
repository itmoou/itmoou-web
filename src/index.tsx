import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { getTranslation, getLocalizedPath, type Language } from './i18n'

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

// Privacy Policy page
app.get('/privacy-policy', (c) => {
  return c.html(getPrivacyPolicyHTML())
})

// Support pages
app.get('/support/customer', (c) => {
  return c.html(getCustomerSupportHTML())
})

app.get('/support/contact', (c) => {
  return c.html(getContactHTML())
})

// Privacy Policy
app.get('/privacy-policy', (c) => {
  return c.html(getPrivacyPolicyHTML())
})

// English routes
app.get('/en', (c) => {
  return c.html(getMainHTML('en'))
})

app.get('/en/company', (c) => {
  return c.html(getCompanyHTML('en'))
})

app.get('/en/company/ceo', (c) => {
  return c.html(getCEOHTML('en'))
})

app.get('/en/company/history', (c) => {
  return c.html(getHistoryHTML('en'))
})

app.get('/en/company/esg', (c) => {
  return c.html(getESGHTML('en'))
})

app.get('/en/company/location', (c) => {
  return c.html(getLocationHTML('en'))
})

app.get('/en/company/news', (c) => {
  return c.html(getCompanyNewsHTML('en'))
})

app.get('/en/solutions/loginexio', (c) => {
  return c.html(getLogiNexioHTML('en'))
})

app.get('/en/solutions/bizsupport', (c) => {
  return c.html(getBizSupportHTML('en'))
})

app.get('/en/rnd/lab', (c) => {
  return c.html(getLabHTML('en'))
})

app.get('/en/rnd/activities', (c) => {
  return c.html(getActivitiesHTML('en'))
})

app.get('/en/careers/talent', (c) => {
  return c.html(getTalentHTML('en'))
})

app.get('/en/careers', (c) => {
  return c.redirect('https://recruit.itmoou.com')
})

app.get('/en/support/customer', (c) => {
  return c.html(getCustomerSupportHTML('en'))
})

app.get('/en/support/contact', (c) => {
  return c.html(getContactHTML('en'))
})

app.get('/en/privacy-policy', (c) => {
  return c.html(getPrivacyPolicyHTML('en'))
})

// API routes
app.get('/api/hello', (c) => {
  return c.json({ message: 'Hello from IT moou API!' })
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
          <img src="/images/logo.png" alt="IT moou" style="height: 80px;">
        </a>
        <nav>
          <ul class="main-nav">
            <li class="nav-item">
              <a href="${currentPath}/company" class="nav-link">${t.nav.company}</a>
              <div class="dropdown">
                <a href="${currentPath}/company" class="dropdown-item">${t.nav.companyInfo}</a>
                <a href="${currentPath}/company/ceo" class="dropdown-item">${t.nav.ceoMessage}</a>
                <a href="${currentPath}/company/news" class="dropdown-item">${t.nav.companyNews}</a>
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
                <a href="https://recruit.itmoou.com" class="dropdown-item" target="_blank" rel="noopener noreferrer">${t.nav.jobs}</a>
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
            <img src="/images/footericon.png" alt="IT moou" style="height: 90px; margin-bottom: 1.5rem;">
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

function getBaseHTML(title: string, content: string, bodyClass: string = '', lang: Language = 'ko') {
  return `
    <!DOCTYPE html>
    <html lang="${lang}">
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
    <body${bodyClass ? ` class="${bodyClass}"` : ''}>
        ${getHeader(lang)}
        ${content}
        ${getFooter(lang)}
        <script src="/static/app.js"></script>
    </body>
    </html>
  `
}

function getMainHTML(lang: Language = 'ko') {
  const t = getTranslation(lang)
  return getBaseHTML(t.home.title, `
    <div class="main-slider">
      <div class="slider-container">
        <div class="slide active">
          <img src="/images/slide1.jpg" alt="IT moou Slide 1">
          <div class="slide-content">
            <h2>${t.home.slide1Title}</h2>
            <p>${t.home.slide1Desc}</p>
          </div>
        </div>
        <div class="slide">
          <img src="/images/slide2.jpg" alt="IT moou Slide 2">
          <div class="slide-content">
            <h2>${t.home.slide2Title}</h2>
            <p>${t.home.slide2Desc}</p>
          </div>
        </div>
        <div class="slide">
          <img src="/images/slide3.jpg" alt="IT moou Slide 3">
          <div class="slide-content">
            <h2>${t.home.slide3Title}</h2>
            <p>${t.home.slide3Desc}</p>
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
        <div style="padding: 1.5rem; border: 1px solid #e0e0e0; border-radius: 8px; transition: all 0.3s; cursor: pointer;">
          <h3 style="color: #0052A5; margin-bottom: 0.5rem; font-size: 1.1rem;">${t.home.news1Title}</h3>
          <p style="color: #666; line-height: 1.6; font-size: 0.95rem;">${t.home.news1Desc}</p>
          <p style="color: #999; font-size: 0.85rem; margin-top: 1rem;">${t.home.news1Date}</p>
        </div>
        <div style="padding: 1.5rem; border: 1px solid #e0e0e0; border-radius: 8px; transition: all 0.3s; cursor: pointer;">
          <h3 style="color: #0052A5; margin-bottom: 0.5rem; font-size: 1.1rem;">${t.home.news2Title}</h3>
          <p style="color: #666; line-height: 1.6; font-size: 0.95rem;">${t.home.news2Desc}</p>
          <p style="color: #999; font-size: 0.85rem; margin-top: 1rem;">${t.home.news2Date}</p>
        </div>
        <div style="padding: 1.5rem; border: 1px solid #e0e0e0; border-radius: 8px; transition: all 0.3s; cursor: pointer;">
          <h3 style="color: #0052A5; margin-bottom: 0.5rem; font-size: 1.1rem;">${t.home.news3Title}</h3>
          <p style="color: #666; line-height: 1.6; font-size: 0.95rem;">${t.home.news3Desc}</p>
          <p style="color: #999; font-size: 0.85rem; margin-top: 1rem;">${t.home.news3Date}</p>
        </div>
        <div style="padding: 1.5rem; border: 1px solid #e0e0e0; border-radius: 8px; transition: all 0.3s; cursor: pointer;">
          <h3 style="color: #0052A5; margin-bottom: 0.5rem; font-size: 1.1rem;">${t.home.news4Title}</h3>
          <p style="color: #666; line-height: 1.6; font-size: 0.95rem;">${t.home.news4Desc}</p>
          <p style="color: #999; font-size: 0.85rem; margin-top: 1rem;">${t.home.news4Date}</p>
        </div>
        <div style="padding: 1.5rem; border: 1px solid #e0e0e0; border-radius: 8px; transition: all 0.3s; cursor: pointer;">
          <h3 style="color: #0052A5; margin-bottom: 0.5rem; font-size: 1.1rem;">${t.home.news5Title}</h3>
          <p style="color: #666; line-height: 1.6; font-size: 0.95rem;">${t.home.news5Desc}</p>
          <p style="color: #999; font-size: 0.85rem; margin-top: 1rem;">${t.home.news5Date}</p>
        </div>
        <div style="padding: 1.5rem; border: 1px solid #e0e0e0; border-radius: 8px; transition: all 0.3s; cursor: pointer;">
          <h3 style="color: #0052A5; margin-bottom: 0.5rem; font-size: 1.1rem;">${t.home.news6Title}</h3>
          <p style="color: #666; line-height: 1.6; font-size: 0.95rem;">${t.home.news6Desc}</p>
          <p style="color: #999; font-size: 0.85rem; margin-top: 1rem;">${t.home.news6Date}</p>
        </div>
      </div>
      <div class="text-center mt-4" style="margin-top: 2rem;">
        <a href="/company/news" style="display: inline-block; padding: 1rem 2rem; background: #0052A5; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; transition: all 0.3s;">${t.home.viewMore}</a>
      </div>
    </section>
  `, 'home-page', lang)
}

function getCompanyHTML(lang: Language = 'ko') {
  const t = getTranslation(lang)
  return getBaseHTML(t.company.title, `
    <div style="margin-top: 80px;">
      <section style="background: linear-gradient(135deg, #0052A5 0%, #003366 100%); color: white; padding: 4rem 2rem; text-align: center;">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">${t.company.title}</h1>
        <p style="font-size: 1.2rem;">${t.company.subtitle}</p>
      </section>

      <section class="content-section">
        <div class="section-header">
          <h2 class="section-title">${t.company.aboutTitle}</h2>
        </div>
        <div style="max-width: 900px; margin: 0 auto; line-height: 1.8; color: #666;">
          <p style="margin-bottom: 1.5rem;">
            ${t.company.aboutIntro}
          </p>
          <p style="margin-bottom: 1.5rem;">
            ${t.company.aboutDesc}
          </p>
        </div>
      </section>

      <section class="content-section" style="background: #f9f9f9;">
        <div class="grid-3">
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-eye"></i> ${t.company.visionTitle}</h3>
              <p class="card-text">${t.company.visionDesc}</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-bullseye"></i> ${t.company.missionTitle}</h3>
              <p class="card-text">${t.company.missionDesc}</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-heart"></i> ${t.company.coreValuesTitle}</h3>
              <p class="card-text">${t.company.coreValuesDesc}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `, '', lang)
}

function getCEOHTML(lang: Language = 'ko') {
  const t = getTranslation(lang)
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
                ${t.ceo.message1}
              </p>
              <p style="margin-bottom: 1.5rem;">
                ${t.ceo.message2}
              </p>
              <p style="margin-bottom: 1.5rem;">
                ${t.ceo.message3}
              </p>
              <p style="margin-bottom: 1.5rem;">
                ${t.ceo.message4}
              </p>
              <p style="margin-bottom: 1.5rem;">
                변화하는 환경 속에서 혁신과 도전 정신으로 새로운 미래를 열어가는 아이티무유가 되겠습니다. 여러분의 지속적인 관심과 성원을 부탁드립니다.
              </p>
              <p style="margin-top: 3rem;">
                <strong style="color: #0052A5; font-size: 1.2rem;">${t.ceo.signature}</strong>
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
  `, '', lang)
}

function getHistoryHTML(lang: Language = 'ko') {
  const t = getTranslation(lang)
  return getBaseHTML(t.history.title, `
    <div style="margin-top: 80px;">
      <section style="background: linear-gradient(135deg, #0052A5 0%, #003366 100%); color: white; padding: 4rem 2rem; text-align: center;">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">${t.history.title}</h1>
        <p style="font-size: 1.2rem;">${t.history.subtitle}</p>
      </section>

      <section class="content-section">
        <div style="max-width: 900px; margin: 0 auto;">
          <div style="border-left: 3px solid #0052A5; padding-left: 2rem;">
            <div style="margin-bottom: 3rem;">
              <h3 style="color: #0052A5; font-size: 1.8rem; margin-bottom: 0.5rem;">2026</h3>
              <ul style="list-style: none; padding: 0; color: #666; line-height: 2;">
                <li>• ${t.history.item2026_1}</li>
              </ul>
            </div>
            <div style="margin-bottom: 3rem;">
              <h3 style="color: #0052A5; font-size: 1.8rem; margin-bottom: 0.5rem;">2025</h3>
              <ul style="list-style: none; padding: 0; color: #666; line-height: 2;">
                <li>• ${t.history.item2025_1}</li>
                <li>• ${t.history.item2025_2}</li>
              </ul>
            </div>
            <div style="margin-bottom: 3rem;">
              <h3 style="color: #0052A5; font-size: 1.8rem; margin-bottom: 0.5rem;">2024</h3>
              <ul style="list-style: none; padding: 0; color: #666; line-height: 2;">
                <li>• IT moou Founded</li>
                <li>• LogiNexio Development Started</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  `, '', lang)
}

function getESGHTML(lang: Language = 'ko') {
  const t = getTranslation(lang)
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
              <h3 class="card-title" style="color: #00A651;"><i class="fas fa-leaf"></i> ${t.esg.environmentTitle}</h3>
              <p class="card-text">${t.esg.environmentDesc}</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title" style="color: #0052A5;"><i class="fas fa-users"></i> ${t.esg.socialTitle}</h3>
              <p class="card-text">${t.esg.socialDesc}</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title" style="color: #FF6B00;"><i class="fas fa-balance-scale"></i> ${t.esg.governanceTitle}</h3>
              <p class="card-text">${t.esg.governanceDesc}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `, '', lang)
}

function getLocationHTML(lang: Language = 'ko') {
  const t = getTranslation(lang)
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
                  ${t.location.addressDetail}
                </p>
              </div>
              
              <div style="margin-bottom: 3rem;">
                <h3 style="color: #0052A5; font-size: 1.5rem; margin-bottom: 1rem;"><i class="fas fa-phone"></i> ${t.location.contact}</h3>
                <p style="color: #666; line-height: 1.8;">
                  ${t.location.phone}: 043.715.8553<br>
                  ${t.location.email}: cs@itmoou.com
                </p>
              </div>

              <div>
                <h3 style="color: #0052A5; font-size: 1.5rem; margin-bottom: 1rem;"><i class="fas fa-car"></i> ${t.location.byCar}</h3>
                <p style="color: #666; line-height: 1.8;">
                  ${t.location.carDirection}<br>
                  ${t.location.parking}
                </p>
              </div>
            </div>

            <!-- 오른쪽: 카카오맵 -->
            <div style="border: 3px solid #0052A5; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
              <div id="daumRoughmapContainer1769348918868" class="root_daum_roughmap root_daum_roughmap_landing" style="width: 100%;"></div>
              <script charset="UTF-8" class="daum_roughmap_loader_script" src="https://ssl.daumcdn.net/dmaps/map_js_init/roughmapLoader.js"></script>
              <script charset="UTF-8">
                new daum.roughmap.Lander({
                  "timestamp" : "1769348918868",
                  "key" : "gmuvtvo88pm",
                  "mapWidth" : "100%",
                  "mapHeight" : "400"
                }).render();
              </script>
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
  `, '', lang)
}

function getCompanyNewsHTML(lang: Language = 'ko') {
  const t = getTranslation(lang)
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
            <div class="news-item" data-title="${t.home.news1Title}" style="display: flex; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; transition: all 0.3s;">
              <div style="background: linear-gradient(135deg, #0052A5 0%, #003366 100%); min-width: 150px; display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-globe" style="font-size: 3rem; color: white;"></i>
              </div>
              <div style="padding: 1.5rem; flex: 1;">
                <h3 style="color: #0052A5; margin-bottom: 0.5rem; font-size: 1.2rem;">${t.home.news1Title}</h3>
                <p style="color: #999; font-size: 0.85rem; margin-bottom: 0.8rem;">${t.home.news1Date}</p>
                <p style="color: #666; line-height: 1.6; font-size: 0.95rem;">${t.home.news1Desc}</p>
              </div>
            </div>

            <div class="news-item" data-title="${t.home.news2Title}" style="display: flex; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; transition: all 0.3s;">
              <div style="background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%); min-width: 150px; display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-boxes" style="font-size: 3rem; color: white;"></i>
              </div>
              <div style="padding: 1.5rem; flex: 1;">
                <h3 style="color: #0052A5; margin-bottom: 0.5rem; font-size: 1.2rem;">${t.home.news2Title}</h3>
                <p style="color: #999; font-size: 0.85rem; margin-bottom: 0.8rem;">${t.home.news2Date}</p>
                <p style="color: #666; line-height: 1.6; font-size: 0.95rem;">${t.home.news2Desc}</p>
              </div>
            </div>

            <div class="news-item" data-title="${t.home.news3Title}" style="display: flex; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; transition: all 0.3s;">
              <div style="background: linear-gradient(135deg, #6f42c1 0%, #4e2a84 100%); min-width: 150px; display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-file-alt" style="font-size: 3rem; color: white;"></i>
              </div>
              <div style="padding: 1.5rem; flex: 1;">
                <h3 style="color: #0052A5; margin-bottom: 0.5rem; font-size: 1.2rem;">${t.home.news3Title}</h3>
                <p style="color: #999; font-size: 0.85rem; margin-bottom: 0.8rem;">${t.home.news3Date}</p>
                <p style="color: #666; line-height: 1.6; font-size: 0.95rem;">${t.home.news3Desc}</p>
              </div>
            </div>

            <div class="news-item" data-title="${t.home.news4Title}" style="display: flex; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; transition: all 0.3s;">
              <div style="background: linear-gradient(135deg, #fd7e14 0%, #c35a00 100%); min-width: 150px; display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-chart-line" style="font-size: 3rem; color: white;"></i>
              </div>
              <div style="padding: 1.5rem; flex: 1;">
                <h3 style="color: #0052A5; margin-bottom: 0.5rem; font-size: 1.2rem;">${t.home.news4Title}</h3>
                <p style="color: #999; font-size: 0.85rem; margin-bottom: 0.8rem;">${t.home.news4Date}</p>
                <p style="color: #666; line-height: 1.6; font-size: 0.95rem;">${t.home.news4Desc}</p>
              </div>
            </div>

            <div class="news-item" data-title="${t.home.news5Title}" style="display: flex; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; transition: all 0.3s;">
              <div style="background: linear-gradient(135deg, #17a2b8 0%, #117a8b 100%); min-width: 150px; display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-handshake" style="font-size: 3rem; color: white;"></i>
              </div>
              <div style="padding: 1.5rem; flex: 1;">
                <h3 style="color: #0052A5; margin-bottom: 0.5rem; font-size: 1.2rem;">${t.home.news5Title}</h3>
                <p style="color: #999; font-size: 0.85rem; margin-bottom: 0.8rem;">${t.home.news5Date}</p>
                <p style="color: #666; line-height: 1.6; font-size: 0.95rem;">${t.home.news5Desc}</p>
              </div>
            </div>

            <div class="news-item" data-title="${t.home.news6Title}" style="display: flex; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; transition: all 0.3s;">
              <div style="background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%); min-width: 150px; display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-trophy" style="font-size: 3rem; color: white;"></i>
              </div>
              <div style="padding: 1.5rem; flex: 1;">
                <h3 style="color: #0052A5; margin-bottom: 0.5rem; font-size: 1.2rem;">${t.home.news6Title}</h3>
                <p style="color: #999; font-size: 0.85rem; margin-bottom: 0.8rem;">${t.home.news6Date}</p>
                <p style="color: #666; line-height: 1.6; font-size: 0.95rem;">${t.home.news6Desc}</p>
              </div>
            </div>

            <div class="news-item" data-title="${t.home.news7Title}" style="display: flex; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; transition: all 0.3s;">
              <div style="background: linear-gradient(135deg, #20c997 0%, #17a2b8 100%); min-width: 150px; display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-cloud" style="font-size: 3rem; color: white;"></i>
              </div>
              <div style="padding: 1.5rem; flex: 1;">
                <h3 style="color: #0052A5; margin-bottom: 0.5rem; font-size: 1.2rem;">${t.home.news7Title}</h3>
                <p style="color: #999; font-size: 0.85rem; margin-bottom: 0.8rem;">${t.home.news7Date}</p>
                <p style="color: #666; line-height: 1.6; font-size: 0.95rem;">${t.home.news7Desc}</p>
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
  `, '', lang)
}

function getLogiNexioHTML(lang: Language = 'ko') {
  const t = getTranslation(lang)
  return getBaseHTML(t.solutions.logiNexioTitle, `
    <div style="margin-top: 80px;">
      <section style="background: linear-gradient(135deg, #0052A5 0%, #003366 100%); color: white; padding: 4rem 2rem; text-align: center;">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">LogiNexio</h1>
        <p style="font-size: 1.2rem;">${t.solutions.logiNexioSubtitle}</p>
      </section>

      <section class="content-section">
        <div style="max-width: 900px; margin: 0 auto; line-height: 1.8; color: #666; margin-bottom: 3rem;">
          <p style="margin-bottom: 1.5rem; text-align: center; font-size: 1.1rem;">
            ${t.solutions.logiNexioDesc}
          </p>
        </div>

        <div class="section-header">
          <h2 class="section-title">${t.solutions.logiNexioFeatures}</h2>
        </div>
        <div style="max-width: 1000px; margin: 0 auto;">
          <!-- 팔레트 자동화 -->
          <div style="display: flex; gap: 2rem; align-items: center; margin-bottom: 3rem; padding: 2rem; background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="flex: 1;">
              <h3 style="color: #0052A5; font-size: 1.5rem; margin-bottom: 1rem;"><i class="fas fa-boxes" style="margin-right: 0.5rem;"></i> ${t.solutions.palletTitle}</h3>
              <p style="color: #666; line-height: 1.8;">${t.solutions.palletDesc}</p>
            </div>
            <div style="flex: 0 0 250px;">
              <img src="/images/pallet.png" alt="${t.solutions.palletTitle}" style="width: 100%; border-radius: 8px; object-fit: cover;">
            </div>
          </div>

          <!-- 물류 서류 자동화 -->
          <div style="display: flex; gap: 2rem; align-items: center; margin-bottom: 3rem; padding: 2rem; background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); flex-direction: row-reverse;">
            <div style="flex: 1;">
              <h3 style="color: #0052A5; font-size: 1.5rem; margin-bottom: 1rem;"><i class="fas fa-file-alt" style="margin-right: 0.5rem;"></i> ${t.solutions.documentTitle}</h3>
              <p style="color: #666; line-height: 1.8;">${t.solutions.documentDesc}</p>
            </div>
            <div style="flex: 0 0 250px;">
              <img src="/images/docu.png" alt="${t.solutions.documentTitle}" style="width: 100%; border-radius: 8px; object-fit: cover;">
            </div>
          </div>

          <!-- 포워더 계약 관리 -->
          <div style="display: flex; gap: 2rem; align-items: center; margin-bottom: 3rem; padding: 2rem; background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="flex: 1;">
              <h3 style="color: #0052A5; font-size: 1.5rem; margin-bottom: 1rem;"><i class="fas fa-handshake" style="margin-right: 0.5rem;"></i> ${t.solutions.forwarderTitle}</h3>
              <p style="color: #666; line-height: 1.8;">${t.solutions.forwarderDesc}</p>
            </div>
            <div style="flex: 0 0 250px;">
              <img src="/images/foward.png" alt="${t.solutions.forwarderTitle}" style="width: 100%; border-radius: 8px; object-fit: cover;">
            </div>
          </div>

          <!-- 실시간 물류 추적 -->
          <div style="display: flex; gap: 2rem; align-items: center; margin-bottom: 3rem; padding: 2rem; background: white; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); flex-direction: row-reverse;">
            <div style="flex: 1;">
              <h3 style="color: #0052A5; font-size: 1.5rem; margin-bottom: 1rem;"><i class="fas fa-map-marker-alt" style="margin-right: 0.5rem;"></i> ${t.solutions.trackingTitle}</h3>
              <p style="color: #666; line-height: 1.8;">${t.solutions.trackingDesc}</p>
            </div>
            <div style="flex: 0 0 250px;">
              <img src="/images/locate.png" alt="${t.solutions.trackingTitle}" style="width: 100%; border-radius: 8px; object-fit: cover;">
            </div>
          </div>
        </div>
      </section>
    </div>
  `, '', lang)
}

function getBizSupportHTML(lang: Language = 'ko') {
  const t = getTranslation(lang)
  return getBaseHTML(t.solutions.bizSupportTitle, `
    <div style="margin-top: 80px;">
      <section style="background: linear-gradient(135deg, #0052A5 0%, #003366 100%); color: white; padding: 4rem 2rem; text-align: center;">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">BizSupport Pro</h1>
        <p style="font-size: 1.2rem;">${t.solutions.bizSupportSubtitle}</p>
      </section>

      <section class="content-section">
        <div style="max-width: 900px; margin: 0 auto; text-align: center; margin-bottom: 3rem;">
          <img src="/images/bizsupport.jpg" alt="BizSupport Pro" style="max-width: 100%; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: none;">
        </div>

        <div style="max-width: 900px; margin: 0 auto; line-height: 1.8; color: #666; margin-bottom: 3rem;">
          <p style="margin-bottom: 1.5rem;">
            ${t.solutions.bizSupportDesc}
          </p>
        </div>

        <div class="section-header">
          <h2 class="section-title">주요 기능</h2>
        </div>
        <div class="grid-3">
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-tasks"></i> ${t.solutions.projectTitle}</h3>
              <p class="card-text">${t.solutions.projectDesc}</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-users"></i> ${t.solutions.collaborationTitle}</h3>
              <p class="card-text">${t.solutions.collaborationDesc}</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-chart-line"></i> ${t.solutions.analyticsTitle}</h3>
              <p class="card-text">${t.solutions.analyticsDesc}</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-cogs"></i> ${t.solutions.workflowTitle}</h3>
              <p class="card-text">${t.solutions.workflowDesc}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `, '', lang)
}

function getLabHTML(lang: Language = 'ko') {
  const t = getTranslation(lang)
  return getBaseHTML(t.rd.labTitle, `
    <div style="margin-top: 80px;">
      <section style="background: linear-gradient(135deg, #0052A5 0%, #003366 100%); color: white; padding: 4rem 2rem; text-align: center;">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">${t.rd.labTitle}</h1>
        <p style="font-size: 1.2rem;">${t.rd.labSubtitle}</p>
      </section>

      <section class="content-section">
        <div style="max-width: 900px; margin: 0 auto; line-height: 1.8; color: #666;">
          <p style="margin-bottom: 1.5rem;">
            ${t.rd.labDesc}
          </p>
        </div>

        <div class="grid-3">
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-microscope"></i> ${t.rd.facilityTitle}</h3>
              <p class="card-text">${t.rd.facilityDesc}</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-user-graduate"></i> ${t.rd.expertTitle}</h3>
              <p class="card-text">${t.rd.expertDesc}</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-handshake"></i> ${t.rd.cooperationTitle}</h3>
              <p class="card-text">${t.rd.cooperationDesc}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `, '', lang)
}

function getActivitiesHTML(lang: Language = 'ko') {
  const t = getTranslation(lang)
  return getBaseHTML(t.rd.activityTitle, `
    <div style="margin-top: 80px;">
      <section style="background: linear-gradient(135deg, #0052A5 0%, #003366 100%); color: white; padding: 4rem 2rem; text-align: center;">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">${t.rd.activityTitle}</h1>
        <p style="font-size: 1.2rem;">${t.rd.activitySubtitle}</p>
      </section>

      <section class="content-section">
        <div class="section-header">
          <h2 class="section-title">${t.rd.activityFeatures}</h2>
        </div>
        <div class="grid-3">
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-truck"></i> ${t.rd.logisticsOptTitle}</h3>
              <p class="card-text">${t.rd.logisticsOptDesc}</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-database"></i> ${t.rd.bigdataTitle}</h3>
              <p class="card-text">${t.rd.bigdataDesc}</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-chart-line"></i> ${t.rd.bizSolutionTitle}</h3>
              <p class="card-text">${t.rd.bizSolutionDesc}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `, '', lang)
}

function getTalentHTML(lang: Language = 'ko') {
  const t = getTranslation(lang)
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
  `, '', lang)
}

function getCustomerSupportHTML(lang: Language = 'ko') {
  const t = getTranslation(lang)
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
  `, '', lang)
}

function getContactHTML(lang: Language = 'ko') {
  const t = getTranslation(lang)
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
  `, '', lang)
}

function getPrivacyPolicyHTML(lang: Language = 'ko') {
  const t = getTranslation(lang)
  return getBaseHTML('개인정보 처리방침', `
    <div class="main-content">
      <section class="hero-section" style="background: linear-gradient(135deg, #0052A5 0%, #003366 100%); padding: 4rem 2rem; text-align: center;">
        <h1 class="hero-title" style="color: white; font-size: 3rem; margin-bottom: 1rem;">개인정보 처리방침</h1>
        <p class="hero-subtitle" style="color: rgba(255,255,255,0.9); font-size: 1.2rem;">아이티무유 주식회사 개인정보 보호 정책</p>
      </section>

      <section style="max-width: 900px; margin: 4rem auto; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="line-height: 1.8; color: #333;">
          <p style="margin-bottom: 2rem; font-size: 1.1rem;">본 개인정보 처리방침은 아이티무유 주식회사(이하 "회사")가 이용자의 소중한 개인정보 및 권익을 보호하고 개인정보와 관련한 이용자의 고충을 원활하게 처리할 수 있도록 하기 위한 지침입니다. 회사는 이용자의 동의를 기반으로 개인정보를 수집·이용·제공하며 관련 법령을 준수합니다.</p>

          <h2 style="color: #0052A5; margin-top: 2.5rem; margin-bottom: 1rem; font-size: 1.5rem; border-bottom: 2px solid #0052A5; padding-bottom: 0.5rem;">1. 개인정보의 수집</h2>
          <p style="margin-bottom: 1rem;">① 회사는 서비스를 제공하기 위하여 필요한 최소한의 개인정보만 수집합니다.</p>
          <p style="margin-bottom: 1rem;">② 회사는 서비스를 제공하기 위해 필요한 필수항목을 이용자의 동의 하에 처리합니다.</p>
          <p style="margin-bottom: 1rem;">③ 법령상 특별한 규정이 있는 경우 및 법령상 의무를 준수하기 위한 경우에는 이용자의 개인정보 수집 및 이용에 대하여 동의를 받지 않고 수집할 수 있습니다.</p>
          <p style="margin-bottom: 1rem;">④ 회사는 관련 법령에 따른 개인정보의 보유 및 이용기간 또는 정보 주체로부터 개인정보 수집 시 동의 받은 개인정보 보유 및 이용기간 내에서 개인정보를 처리합니다.</p>
          <p style="margin-bottom: 1rem;">⑤ 회사가 이용자로부터 수집하는 개인정보 항목 및 수집·이용 목적은 다음과 같습니다.</p>
          <ul style="margin-left: 2rem; margin-bottom: 1rem;">
            <li><strong>필수수집 항목:</strong> 이름, 주소, 성별, 생년월일, 이메일 주소, 휴대폰번호, 암호화된 본인확인 정보</li>
            <li><strong>수집·이용 목적:</strong> 서비스 부정이용 방지, 고충처리 및 분쟁 조정</li>
            <li><strong>보유 및 이용기간:</strong> 수집·이용 목적이 달성되면 지체 없이 파기(단, 관련 법령에 따라 필요한 항목에 한하여 일정 기간 보관함)</li>
          </ul>

          <h2 style="color: #0052A5; margin-top: 2.5rem; margin-bottom: 1rem; font-size: 1.5rem; border-bottom: 2px solid #0052A5; padding-bottom: 0.5rem;">2. 개인정보의 이용목적</h2>
          <p style="margin-bottom: 1rem;">회사가 수집하는 이용자의 개인정보는 아래의 목적으로만 수집 및 이용합니다. 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며 이용 목적이 변경될 시에는 사전에 별도로 이용자에게 동의를 받는 등 필요한 조치를 이행합니다.</p>
          <ul style="margin-left: 2rem; margin-bottom: 1rem;">
            <li>① 서비스 제공, 서비스 유지 및 개선, 신규 서비스 제공, 안정적인 서비스 이용 환경 제공</li>
            <li>② 부정 이용 방지, 법률 및 서비스 약관 위반 행위 제한, 서비스 이용 관련 상담과 분쟁 처리, 분쟁 조정을 위한 기록 보존, 개별 통지</li>
            <li>③ 서비스 이용 통계, 서비스 접속·이용 기록 등 분석을 통한 맞춤형 서비스 제공</li>
            <li>④ 마케팅 정보 안내 및 참여기회 제공, 광고성 정보 제공</li>
          </ul>

          <h2 style="color: #0052A5; margin-top: 2.5rem; margin-bottom: 1rem; font-size: 1.5rem; border-bottom: 2px solid #0052A5; padding-bottom: 0.5rem;">3. 개인정보의 제3자 제공에 관한 사항</h2>
          <p style="margin-bottom: 1rem;">회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하거나 외부에 공개하지 않습니다. 단, 다음의 경우에는 예외로 합니다.</p>
          <ul style="margin-left: 2rem; margin-bottom: 1rem;">
            <li>서비스 이용을 위하여 이용자가 사전에 제공에 동의를 한 경우</li>
            <li>법률에 특별한 규정이 있거나 법령상 의무 준수를 위해 불가피한 경우</li>
            <li>이용자의 사전 동의를 받을 수 없는 상태에서 이용자 또는 제3자의 생명이나 안전에 급박한 위험이 확인되어 이를 해소하기 위한 경우</li>
          </ul>

          <h2 style="color: #0052A5; margin-top: 2.5rem; margin-bottom: 1rem; font-size: 1.5rem; border-bottom: 2px solid #0052A5; padding-bottom: 0.5rem;">4. 개인정보의 위탁</h2>
          <p style="margin-bottom: 1rem;">① 개인정보의 처리 위탁이란 개인정보를 제공하는 자의 업무 처리를 위하여 개인정보를 외부 수탁자에게 위탁하는 것을 의미합니다. 개인정보가 위탁된 이후에도 위탁자(개인정보를 제공한 자)는 수탁자에 대한 관리, 감독 책임이 있습니다.</p>
          <p style="margin-bottom: 1rem;">② 회사는 이용자의 개인정보를 처리 위탁할 수 있으며, 이 경우 그 위탁에 관한 정보를 지체 없이 본 개인정보 처리방침을 통하여 공개하도록 하겠습니다.</p>

          <h2 style="color: #0052A5; margin-top: 2.5rem; margin-bottom: 1rem; font-size: 1.5rem; border-bottom: 2px solid #0052A5; padding-bottom: 0.5rem;">5. 추가적인 이용·제공 판단기준</h2>
          <p style="margin-bottom: 1rem;">회사가 정보주체의 동의 없이 개인정보를 이용 또는 제공하는 경우에는 개인정보보호책임자가 다음의 사항을 고려하여 개인정보의 추가적인 이용 또는 제공을 하고 있는지 여부를 점검합니다.</p>
          <ul style="margin-left: 2rem; margin-bottom: 1rem;">
            <li>당초 수집 목적과 관련성이 있는지 여부</li>
            <li>개인정보를 수집한 정황 또는 처리 관행에 비추어 볼 때 개인정보의 추가적인 이용 또는 제공에 대한 예측 가능성이 있는지 여부</li>
            <li>정보주체의 이익을 부당하게 침해하는지 여부</li>
            <li>가명처리 또는 암호화 등 안전성 확보에 필요한 조치를 하였는지 여부</li>
          </ul>

          <h2 style="color: #0052A5; margin-top: 2.5rem; margin-bottom: 1rem; font-size: 1.5rem; border-bottom: 2px solid #0052A5; padding-bottom: 0.5rem;">6. 이용자의 권리와 권리행사 방법</h2>
          <p style="margin-bottom: 1rem;">이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다.</p>
          <p style="margin-bottom: 1rem;">① 이용자는 회사에 대하여 서면, 전자우편 등을 통하여 언제든지 자신의 개인정보 열람, 정정, 삭제, 처리정지 요구 등의 권리를 행사할 수 있습니다.</p>
          <p style="margin-bottom: 1rem;">② 이용자가 개인정보의 오류에 대하여 회사에 정정을 요청하거나 처리 정지를 요구한 경우, 정정을 완료하기 전까지 또는 처리정지 요구 철회가 있기 전까지 회사는 해당 개인정보를 이용 또는 제공하지 않습니다.</p>
          <p style="margin-bottom: 1rem;">③ 본 조의 권리행사는 개인정보 관련 법령 및 다른 법령의 규정에 따라 제한될 수 있습니다.</p>

          <h2 style="color: #0052A5; margin-top: 2.5rem; margin-bottom: 1rem; font-size: 1.5rem; border-bottom: 2px solid #0052A5; padding-bottom: 0.5rem;">7. 만 14세 미만의 아동인 이용자 및 그 법정대리인의 권리 행사</h2>
          <p style="margin-bottom: 1rem;">① 회사는 아동 이용자의 개인정보를 수집·이용·제공 등 처리하기 위하여 그 법정대리인의 동의를 요청하여야 합니다.</p>
          <p style="margin-bottom: 1rem;">② 아동 이용자 및 그 법정대리인은 개인정보 관련 법령 및 이 개인정보 처리방침에 따라 회사에 본인 및 그 법정대리인으로서 아동 이용자의 개인정보에 대한 열람·정정·삭제 등 개인정보 보호를 위하여 필요한 조치를 요청할 수 있고, 회사는 이에 지체 없이 응하여야 합니다.</p>

          <h2 style="color: #0052A5; margin-top: 2.5rem; margin-bottom: 1rem; font-size: 1.5rem; border-bottom: 2px solid #0052A5; padding-bottom: 0.5rem;">8. 개인정보의 파기 및 보관</h2>
          <p style="margin-bottom: 1rem;">① 회사는 원칙적으로 이용자의 개인정보 처리목적이 달성된 경우에는 지체 없이 해당 개인정보를 파기합니다.</p>
          <p style="margin-bottom: 1rem;">② 전자적 파일 형태인 경우 복구 및 재생되지 않도록 안전하게 삭제하고, 그 밖에 기록물, 인쇄물, 서면 등 종이에 기록·저장된 개인정보의 경우 분쇄하거나 소각하여 파기합니다.</p>
          <p style="margin-bottom: 1rem;">③ 관련법령에서 일정 기간 정보 보관을 규정하는 경우에는 해당 기간 동안 규정에 따라 개인정보를 안전하게 보관합니다.</p>
          
          <div style="background: #f5f5f5; padding: 1.5rem; border-radius: 6px; margin-top: 1.5rem; margin-bottom: 1.5rem;">
            <strong style="color: #0052A5;">관련 법령에 따른 보관:</strong>
            <ul style="margin-left: 2rem; margin-top: 0.5rem; line-height: 2;">
              <li><strong>전자상거래법:</strong> 계약/청약철회 기록 (5년), 대금결제 기록 (5년), 소비자 불만 기록 (3년)</li>
              <li><strong>전자금융거래법:</strong> 전자금융 거래 기록 (5년)</li>
              <li><strong>국세기본법:</strong> 거래 장부 및 증빙서류 (5년)</li>
              <li><strong>통신비밀보호법:</strong> 서비스 접속 기록 (3개월)</li>
            </ul>
          </div>

          <h2 style="color: #0052A5; margin-top: 2.5rem; margin-bottom: 1rem; font-size: 1.5rem; border-bottom: 2px solid #0052A5; padding-bottom: 0.5rem;">9. 개인정보 보호책임자</h2>
          <p style="margin-bottom: 1rem;">회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하여 운영하고 있습니다.</p>
          
          <div style="background: #f0f8ff; padding: 1.5rem; border-radius: 6px; border-left: 4px solid #0052A5; margin-top: 1.5rem; margin-bottom: 1.5rem;">
            <p style="margin-bottom: 0.5rem;"><strong>개인정보 보호책임자:</strong> 심영민</p>
            <p style="margin-bottom: 0.5rem;"><strong>직책:</strong> 대표이사</p>
            <p style="margin-bottom: 0.5rem;"><strong>연락처:</strong> 043-715-8553</p>
            <p><strong>${t.location.email}:</strong> cs@itmoou.com</p>
          </div>

          <h2 style="color: #0052A5; margin-top: 2.5rem; margin-bottom: 1rem; font-size: 1.5rem; border-bottom: 2px solid #0052A5; padding-bottom: 0.5rem;">10. 개인정보침해에 대한 신고와 상담</h2>
          <p style="margin-bottom: 1rem;">정보주체는 기타 개인정보침해에 대한 신고나 상담이 필요하신 경우에는 아래 기관에 문의하실 수 있습니다.</p>
          <ul style="margin-left: 2rem; margin-bottom: 1rem;">
            <li><strong>개인정보침해신고센터:</strong> privacy.kisa.or.kr | 국번없이 118</li>
            <li><strong>대검찰청 사이버수사과:</strong> spo.go.kr | 국번없이 1301</li>
            <li><strong>경찰청 사이버안전국:</strong> cyberbureau.police.go.kr | 국번없이 182</li>
          </ul>

          <h2 style="color: #0052A5; margin-top: 2.5rem; margin-bottom: 1rem; font-size: 1.5rem; border-bottom: 2px solid #0052A5; padding-bottom: 0.5rem;">11. 개인정보 처리방침의 변경</h2>
          <p style="margin-bottom: 1rem;">회사의 개인정보 처리방침은 관련 법령과 내부 방침에 따라 변경될 수 있습니다. 회사는 개인정보 처리방침이 추가, 수정, 삭제 등 변경되는 경우에는 시행일 7일 전부터 홈페이지를 통하여 공지합니다. 단, 이용자 권리에 중요한 변경이 있는 경우에는 시행일 30일 전부터 공지합니다.</p>

          <h2 style="color: #0052A5; margin-top: 2.5rem; margin-bottom: 1rem; font-size: 1.5rem; border-bottom: 2px solid #0052A5; padding-bottom: 0.5rem;">12. 개인정보의 안전성 확보 조치</h2>
          <p style="margin-bottom: 1rem;">회사는 관련 법령에 따라 다음과 같이 개인정보의 안전성 확보에 필요한 기술적/관리적 및 물리적 조치를 하고 있습니다.</p>
          
          <div style="margin-left: 2rem;">
            <h3 style="color: #003366; font-size: 1.2rem; margin-top: 1.5rem; margin-bottom: 0.75rem;">관리적 조치</h3>
            <ul style="margin-left: 2rem; margin-bottom: 1rem;">
              <li>개인정보 취급 직원의 최소화 및 교육</li>
              <li>내부관리계획의 수립 및 시행</li>
            </ul>

            <h3 style="color: #003366; font-size: 1.2rem; margin-top: 1.5rem; margin-bottom: 0.75rem;">기술적 조치</h3>
            <ul style="margin-left: 2rem; margin-bottom: 1rem;">
              <li>해킹 등에 대비한 기술적 대책</li>
              <li>침입차단 시스템 이용</li>
              <li>개인정보의 암호화</li>
              <li>접속기록의 보관 및 위/변조 방지</li>
            </ul>

            <h3 style="color: #003366; font-size: 1.2rem; margin-top: 1.5rem; margin-bottom: 0.75rem;">물리적 조치</h3>
            <ul style="margin-left: 2rem; margin-bottom: 1rem;">
              <li>개인정보에 대한 접근 제한</li>
            </ul>
          </div>

          <div style="background: #e8f4f8; padding: 1.5rem; border-radius: 6px; margin-top: 3rem; text-align: center;">
            <h3 style="color: #0052A5; margin-bottom: 1rem;">부칙</h3>
            <p style="font-weight: bold; font-size: 1.1rem;">본 개인정보 처리방침은 2026. 1. 2 부터 시행됩니다.</p>
          </div>

          <div style="text-align: center; margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #ddd;">
            <p style="color: #666; margin-bottom: 1rem;">문의사항이 있으시면 아래로 연락주세요</p>
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
