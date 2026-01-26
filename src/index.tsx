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
                ${t.ceo.message5}
              </p>
              <p style="margin-bottom: 1.5rem;">
                ${t.ceo.message6}
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
                <li>• ${t.history.item2024_1}</li>
                <li>• ${t.history.item2024_2}</li>
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
          <h2 class="section-title">${t.solutions.bizSupportFeatures}</h2>
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
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-lightbulb"></i> ${t.careers.innovationTitle}</h3>
              <p class="card-text">${t.careers.innovationDesc}</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-handshake"></i> ${t.careers.teamworkTitle}</h3>
              <p class="card-text">${t.careers.teamworkDesc}</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-star"></i> ${t.careers.expertiseTitle}</h3>
              <p class="card-text">${t.careers.expertiseDesc}</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-heart"></i> ${t.careers.responsibilityTitle}</h3>
              <p class="card-text">${t.careers.responsibilityDesc}</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-globe"></i> ${t.careers.globalTitle}</h3>
              <p class="card-text">${t.careers.globalDesc}</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-graduation-cap"></i> ${t.careers.learningTitle}</h3>
              <p class="card-text">${t.careers.learningDesc}</p>
            </div>
          </div>
        </div>

        <div style="margin-top: 4rem; text-align: center;">
          <a href="/careers" style="display: inline-block; padding: 1rem 3rem; background: #0052A5; color: white; text-decoration: none; border-radius: 4px; font-size: 1.1rem; font-weight: bold; transition: all 0.3s;">${t.careers.viewJobs}</a>
        </div>
      </section>
    </div>
  `, '', lang)
}

function getCustomerSupportHTML(lang: Language = 'ko') {
  const t = getTranslation(lang)
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
              <h3 class="card-title"><i class="fas fa-headset"></i> ${t.support.techSupportTitle}</h3>
              <p class="card-text">${t.support.techSupportDesc}</p>
              <p style="margin-top: 1rem; color: #0052A5; font-weight: bold;">${t.support.techSupportContact}</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-book"></i> ${t.support.trainingTitle}</h3>
              <p class="card-text">${t.support.trainingDesc}</p>
              <p style="margin-top: 1rem; color: #0052A5; font-weight: bold;">${t.support.trainingContact}</p>
            </div>
          </div>
          <div class="card">
            <div class="card-content">
              <h3 class="card-title"><i class="fas fa-tools"></i> ${t.support.maintenanceTitle}</h3>
              <p class="card-text">${t.support.maintenanceDesc}</p>
              <p style="margin-top: 1rem; color: #0052A5; font-weight: bold;">${t.support.maintenanceContact}</p>
            </div>
          </div>
        </div>

        <div style="max-width: 900px; margin: 4rem auto; padding: 2rem; background: #f9f9f9; border-radius: 8px;">
          <h3 style="color: #0052A5; font-size: 1.5rem; margin-bottom: 1rem; text-align: center;"><i class="fas fa-clock"></i> ${t.support.operatingHours}</h3>
          <p style="text-align: center; color: #666; line-height: 1.8;">
            ${t.support.weekdays}<br>
            ${t.support.lunchTime}<br>
            ${t.support.weekends}
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
        <p style="font-size: 1.2rem;">${t.support.contactSubtitle}</p>
      </section>

      <section class="content-section">
        <div style="max-width: 600px; margin: 0 auto;">
          <form style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="margin-bottom: 1.5rem;">
              <label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">${t.support.nameLabel}</label>
              <input type="text" required style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
            </div>
            <div style="margin-bottom: 1.5rem;">
              <label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">${t.support.emailLabel}</label>
              <input type="email" required style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
            </div>
            <div style="margin-bottom: 1.5rem;">
              <label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">${t.support.phoneLabel}</label>
              <input type="tel" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
            </div>
            <div style="margin-bottom: 1.5rem;">
              <label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">${t.support.inquiryTypeLabel}</label>
              <select required style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
                <option value="">${t.support.inquiryTypePlaceholder}</option>
                <option value="product">${t.support.inquiryTypeProduct}</option>
                <option value="solution">${t.support.inquiryTypeSolution}</option>
                <option value="support">${t.support.inquiryTypeSupport}</option>
                <option value="partnership">${t.support.inquiryTypePartnership}</option>
                <option value="etc">${t.support.inquiryTypeEtc}</option>
              </select>
            </div>
            <div style="margin-bottom: 1.5rem;">
              <label style="display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500;">${t.support.messageLabel}</label>
              <textarea required rows="6" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem; resize: vertical;"></textarea>
            </div>
            <div style="text-align: center;">
              <button type="submit" style="padding: 1rem 3rem; background: #0052A5; color: white; border: none; border-radius: 4px; font-size: 1.1rem; font-weight: bold; cursor: pointer; transition: all 0.3s;">${t.support.submitButton}</button>
            </div>
          </form>

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
