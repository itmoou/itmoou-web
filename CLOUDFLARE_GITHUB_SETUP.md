# Cloudflare Pages와 GitHub 연동 가이드

## 현재 상태
- **프로젝트명**: itmoou-web
- **GitHub 저장소**: https://github.com/itmoou/itmoou-web
- **Git Provider**: 연동 안됨 (No)

## 연동 단계

### 1. Cloudflare 대시보드 접속
1. https://dash.cloudflare.com 에 로그인
2. 좌측 메뉴에서 **Workers & Pages** 클릭
3. **itmoou-web** 프로젝트 클릭

### 2. Git 연동 설정
1. 프로젝트 페이지 상단의 **Settings** 탭 클릭
2. 좌측 사이드바에서 **Builds & deployments** 클릭
3. **Connect to Git** 버튼 클릭

### 3. GitHub 저장소 연결
1. **GitHub** 선택
2. GitHub 인증 팝업에서 **Authorize Cloudflare Pages** 클릭
3. 저장소 목록에서 **itmoou/itmoou-web** 선택
4. **Begin setup** 클릭

### 4. 빌드 설정
다음과 같이 설정하세요:

**Production branch**: `main`

**Build settings**:
- **Framework preset**: None (또는 Custom)
- **Build command**: `npm run build`
- **Build output directory**: `dist`

**Root directory**: `/` (비워두기)

**Environment variables**: (필요 없음)

### 5. 저장 및 배포
1. **Save and Deploy** 클릭
2. 첫 번째 자동 배포가 시작됩니다
3. 배포 완료 후 https://itmoou-web.pages.dev 에서 확인

## 연동 후 작동 방식

### 자동 배포
- `main` 브랜치에 push하면 자동으로 프로덕션 배포
- 다른 브랜치에 push하면 프리뷰 배포 생성
- Pull Request 생성 시 자동으로 프리뷰 URL 생성

### 예시
```bash
# 로컬에서 변경 후
git add .
git commit -m "Update homepage"
git push origin main

# Cloudflare Pages가 자동으로 감지하고 배포 시작
# 약 1-2분 후 https://itmoou-web.pages.dev 에 반영됨
```

## 연동 확인

연동이 완료되면:
```bash
npx wrangler pages project list
```

출력에서 **Git Provider**가 **Yes**로 변경됩니다.

## 문제 해결

### GitHub 저장소가 목록에 없는 경우
1. GitHub에서 Cloudflare Pages 앱 권한 확인
2. https://github.com/settings/installations
3. **Cloudflare Pages** 클릭
4. **Repository access** 섹션에서 **itmoou-web** 추가

### 빌드 실패 시
1. Cloudflare 대시보드에서 빌드 로그 확인
2. `package.json`의 `build` 스크립트 확인
3. 필요한 경우 환경 변수 추가

## 추가 정보
- Cloudflare 대시보드: https://dash.cloudflare.com
- GitHub 저장소: https://github.com/itmoou/itmoou-web
- 프로덕션 URL: https://itmoou-web.pages.dev
