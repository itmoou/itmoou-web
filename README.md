# IT moou Website

## 프로젝트 개요
- **프로젝트명**: IT moou 기업 웹사이트
- **기술 스택**: Hono + TypeScript + Cloudflare Pages
- **목표**: 물류 및 경영지원 SaaS 기업 소개 웹사이트 구축

## 주요 기능

### 완료된 기능
✅ 헤더 네비게이션 (드롭다운 메뉴 포함)
✅ IT moou 로고 적용 (80px 크기)
✅ 메인 이미지 슬라이더 (3장, 5초 자동 전환)
  - 반투명 배경으로 텍스트 가독성 향상
✅ 파비콘 적용 (다양한 크기 지원)
✅ 브라우저 탭 타이틀: 'ITMOOU'
✅ 회사소개 섹션
  - 회사 소개 (혁신적인 AI&빅데이터 솔루션 기업)
    - '대한민국 최대의 비즈니스 솔루션 기업' (스페이스바 띄어쓰기)
  - CEO 메시지 (대표이사 심영민)
  - 연혁
    - 2026년: 연 매출 1억원 달성
    - 2025년: 연 매출 7천만원 달성, 독자 팔레타이징 기술 개발
    - 2024년: IT moou 설립, LogiNexio 개발 착수
  - ESG 경영
  - 오시는 길 (청주산단스타트업센터)
✅ 솔루션 섹션
  - LogiNexio (물류 SaaS 솔루션)
  - BizSupport Pro (경영지원 AI 솔루션)
✅ 연구개발 섹션
✅ 채용정보 섹션 (인재상, 채용공고 리다이렉션 - https://recruit.itmoou.com)
✅ 지원센터 섹션 (고객지원, Contact Us)
✅ 반응형 디자인 (모바일, 태블릿, 데스크톱)
✅ 푸터 (회사 정보, 연락처, SNS 링크)

## 프로젝트 구조
```
webapp/
├── src/
│   └── index.tsx          # 메인 애플리케이션 (모든 라우트 포함)
├── public/
│   ├── images/            # 이미지 파일 저장 폴더
│   │   ├── logo.png       # IT moou 로고 (완료)
│   │   └── README.md      # 이미지 파일 안내
│   └── static/
│       ├── app.js         # 프론트엔드 JavaScript
│       └── styles.css     # 스타일시트
├── ecosystem.config.cjs   # PM2 설정
├── package.json           # 의존성 및 스크립트
└── README.md             # 프로젝트 문서
```

## 회사 정보

### IT moou
- **대표이사**: 심영민
- **주소**: (우) 28576 충청북도 청주시 흥덕구 공단로126번길 51 청주산단스타트업센터 502호
- **대표번호**: 043.715.8553
- **이메일**: cs@itmoou.com
- **사업자등록번호**: 229-81-43410

### 비전 & 미션
- **Vision**: 데이터와 AI로 전 세계 중소 수출 기업의 운영을 표준화하는 디지털 운영 OS 구축
- **Mission**: 모든 기업의 업무를 한번에, 오류 없이 처리할 수 있는 원스톱 SaaS 제공
- **Core Values (핵심가치)**: 정확, 효율, 투명, 연결, 고객중심

## 고객 성공 사례
### 제조업 A사
"LogiNexio 도입 후 물류 효율이 45% 증가했으며, 수출에 걸리는 시간이 대폭 감소하여 직원들의 업무 효율성이 20% 증가했습니다."
- 물류 본부장

## 접속 정보
- **개발 서버**: https://3000-i8l84rs6rn37nmv6x2qo0-cbeee0f9.sandbox.novita.ai
- **GitHub 저장소**: https://github.com/itmoou/itmoou-web

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

## 이미지 파일 관리

### 필요한 이미지 목록
이미지는 `/home/user/webapp/public/images/` 폴더에 저장합니다.

**이미 추가된 이미지:**
- ✅ logo.png - IT moou 로고

**추가 필요한 이미지:**
- slide1.jpg, slide2.jpg, slide3.jpg - 메인 슬라이더 (1920x600px)
- tech.jpg, support.jpg, global.jpg - "왜 우리를 선택해야 할까요?" 섹션 (800x600px)
- loginexio.jpg, bizsupport.jpg - 솔루션 카드 (800x600px)
- ceo.jpg - CEO 사진 (400x400px)

자세한 내용은 `public/images/README.md` 파일을 참조하세요.

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
- **회사소개**: IT moou, CEO 메시지, 연혁, ESG, 오시는 길
- **솔루션**: LogiNexio, BizSupport Pro
- **연구개발**: 연구소, 연구개발 활동
- **채용정보**: 인재상, 채용공고
- **지원센터**: 고객지원, Contact Us

### 주요 URL
- `/` - 메인 페이지
- `/company` - 회사 소개
- `/company/ceo` - CEO 메시지
- `/company/history` - 연혁
- `/company/esg` - ESG 경영
- `/company/location` - 오시는 길
- `/solutions/loginexio` - LogiNexio 솔루션
- `/solutions/bizsupport` - BizSupport Pro
- `/rnd/lab` - 연구소
- `/rnd/activities` - 연구개발 활동
- `/careers` - 채용공고 (https://recruit.itmoou.com 리다이렉션)
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
2025 IT moou, INC. ALL RIGHTS RESERVED.

## 문의
- 이메일: cs@itmoou.com
- 전화: 043-715-8553
