# SD Biosensor Website

## 이미지 파일 준비 가이드

웹사이트에서 사용할 이미지 파일들을 준비해주세요.
아래 파일들을 `/home/user/webapp/public/images/` 폴더에 넣어주시면 됩니다.

### 필요한 이미지 목록:

#### 메인 슬라이더 (3장)
- `slide1.jpg` - 첫 번째 슬라이드 이미지 (1920x600px 권장)
- `slide2.jpg` - 두 번째 슬라이드 이미지 (1920x600px 권장)
- `slide3.jpg` - 세 번째 슬라이드 이미지 (1920x600px 권장)

#### 메인 페이지 카드 이미지
- `tech.jpg` - 첨단 기술 이미지 (800x600px 권장)
- `support.jpg` - 고객 지원 이미지 (800x600px 권장)
- `global.jpg` - 글로벌 네트워크 이미지 (800x600px 권장)
- `loginnexio.jpg` - LoginNexio 솔루션 이미지 (800x600px 권장)
- `busisupport.jpg` - BusiSupport Pro 솔루션 이미지 (800x600px 권장)
- `custom.jpg` - 맞춤형 솔루션 이미지 (800x600px 권장)

#### 기타 이미지
- `ceo.jpg` - CEO 사진 (400x400px 권장)

### 이미지 준비 방법:

1. **로컬에서 이미지 준비 후 업로드:**
   ```bash
   # 샌드박스의 이미지 폴더 경로
   /home/user/webapp/public/images/
   ```

2. **임시 플레이스홀더 이미지 사용:**
   - 현재는 파일 경로만 설정되어 있습니다
   - 이미지가 없으면 브라우저에서 이미지가 표시되지 않습니다
   - 원하시는 이미지로 교체하시면 됩니다

3. **이미지 규격 권장사항:**
   - 슬라이더 이미지: 1920x600px (가로형)
   - 카드 이미지: 800x600px (4:3 비율)
   - CEO 사진: 400x400px (정사각형)
   - 파일 형식: JPG, PNG (JPG 권장)
   - 파일 크기: 각 이미지당 500KB 이하 권장

### 이미지 교체 방법:

이미지 파일명을 위의 목록과 동일하게 맞춰서 `/home/user/webapp/public/images/` 폴더에 넣으시면 자동으로 웹사이트에 표시됩니다.

---

## 프로젝트 개요
- **프로젝트명**: SD Biosensor Website
- **기술 스택**: Hono + TypeScript + Cloudflare Pages
- **목표**: 기업 소개 웹사이트 구축

## 주요 기능

### 완료된 기능
✅ 헤더 네비게이션 (드롭다운 메뉴 포함)
✅ 메인 이미지 슬라이더 (3장, 5초 자동 전환)
✅ 회사소개 섹션 (회사명, CEO 메시지, 연혁, ESG, 오시는 길)
✅ 솔루션 섹션 (LoginNexio, BusiSupport Pro)
✅ 연구개발 섹션 (연구소, 연구개발 활동)
✅ 채용정보 섹션 (인재상, 채용공고 리다이렉션)
✅ 지원센터 섹션 (고객지원, Contact Us)
✅ 반응형 디자인 (모바일, 태블릿, 데스크톱)
✅ 푸터 (회사 정보, 연락처, SNS 링크)

## 프로젝트 구조
```
webapp/
├── src/
│   └── index.tsx          # 메인 애플리케이션 (모든 라우트 포함)
├── public/
│   ├── images/            # 이미지 파일 저장 폴더 (위의 가이드 참조)
│   └── static/
│       ├── app.js         # 프론트엔드 JavaScript
│       └── styles.css     # 스타일시트
├── ecosystem.config.cjs   # PM2 설정
├── package.json           # 의존성 및 스크립트
└── README.md             # 프로젝트 문서
```

## 로컬 개발

### 빌드 및 실행
```bash
# 프로젝트 빌드
npm run build

# 포트 정리
npm run clean-port

# PM2로 개발 서버 시작
pm2 start ecosystem.config.cjs

# 서비스 확인
curl http://localhost:3000

# 로그 확인
pm2 logs webapp --nostream
```

### PM2 관리
```bash
# 서비스 목록
pm2 list

# 서비스 재시작
pm2 restart webapp

# 서비스 중지
pm2 stop webapp

# 서비스 삭제
pm2 delete webapp
```

## 배포

### Cloudflare Pages 배포
```bash
# 빌드
npm run build

# 배포
npm run deploy
```

## 페이지 구조

### 메인 메뉴
- **회사소개**: 회사명, CEO 메시지, 연혁, ESG, 오시는 길
- **솔루션**: LoginNexio, BusiSupport Pro
- **연구개발**: 연구소, 연구개발 활동
- **채용정보**: 인재상, 채용공고 (외부 사이트 리다이렉션)
- **지원센터**: 고객지원, Contact Us

### 주요 URL
- `/` - 메인 페이지
- `/company` - 회사 소개
- `/company/ceo` - CEO 메시지
- `/company/history` - 연혁
- `/company/esg` - ESG 경영
- `/company/location` - 오시는 길
- `/solutions/loginnexio` - LoginNexio 솔루션
- `/solutions/busisupport` - BusiSupport Pro
- `/rnd/lab` - 연구소
- `/rnd/activities` - 연구개발 활동
- `/careers` - 채용공고 (리다이렉션)
- `/careers/talent` - 인재상
- `/support/customer` - 고객지원
- `/support/contact` - Contact Us

## 기술 스택
- **백엔드**: Hono (Cloudflare Workers)
- **프론트엔드**: HTML + CSS + Vanilla JavaScript
- **스타일링**: Custom CSS + Font Awesome Icons
- **배포**: Cloudflare Pages
- **프로세스 관리**: PM2

## 주요 특징
- 드롭다운 메뉴가 있는 반응형 네비게이션
- 자동 전환되는 이미지 슬라이더
- 모바일 친화적인 반응형 디자인
- 빠른 로딩 속도
- SEO 최적화된 구조

## 브라우저 지원
- Chrome (최신 버전)
- Firefox (최신 버전)
- Safari (최신 버전)
- Edge (최신 버전)

## 라이센스
2025 SD Biosensor, INC. ALL RIGHTS RESERVED.

## 문의
- 이메일: sales@sdbiosensor.com
- 전화: 031-300-0400
