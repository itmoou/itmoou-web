-- 뉴스 테이블
CREATE TABLE IF NOT EXISTS news (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  date        TEXT NOT NULL,
  order_num   INTEGER DEFAULT 0,
  created_at  TEXT DEFAULT (datetime('now', '+9 hours')),
  updated_at  TEXT DEFAULT (datetime('now', '+9 hours'))
);

-- 메인 슬라이더 테이블
CREATE TABLE IF NOT EXISTS slides (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  order_num      INTEGER NOT NULL DEFAULT 0,
  title          TEXT NOT NULL,
  description    TEXT NOT NULL,
  image_filename TEXT NOT NULL DEFAULT 'slide1.jpg',
  active         INTEGER NOT NULL DEFAULT 1
);

-- 연혁 테이블
CREATE TABLE IF NOT EXISTS history_items (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  year      TEXT NOT NULL,
  content   TEXT NOT NULL,
  order_num INTEGER DEFAULT 0
);

-- 솔루션 테이블
CREATE TABLE IF NOT EXISTS solutions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT NOT NULL UNIQUE,
  subtitle    TEXT NOT NULL,
  description TEXT NOT NULL,
  f1_title    TEXT NOT NULL,
  f1_desc     TEXT NOT NULL,
  f2_title    TEXT NOT NULL,
  f2_desc     TEXT NOT NULL,
  f3_title    TEXT NOT NULL,
  f3_desc     TEXT NOT NULL,
  f4_title    TEXT NOT NULL,
  f4_desc     TEXT NOT NULL,
  updated_at  TEXT DEFAULT (datetime('now', '+9 hours'))
);

-- ── 초기 데이터 ──

-- 뉴스
INSERT INTO news (title, description, date, order_num) VALUES
('글로벌 물류 시장 진출 계획 발표', '아이티무유는 2026년 상반기 아시아 물류 시장 진출을 목표로 LogiNexio 플랫폼의 다국어 지원 및 현지화 작업을 진행하고 있습니다.', '2025.01.15', 1),
('독자 팔레타이징 기술 개발 성공', '2025년 자체 개발한 팔레타이징 기술이 국내 제조업체에서 높은 평가를 받으며 물류 자동화 분야에서 기술력을 인정받고 있습니다. AI 기반 최적 배치 알고리즘으로 공간 활용도를 40% 향상시켰습니다.', '2025.01.10', 2),
('AI 기반 수출 서류 자동화 솔루션 업그레이드', '최신 AI 기술을 적용하여 수출 서류 작성 시간을 60% 단축하고 오류율을 80% 감소시킨 업그레이드 버전을 출시했습니다. 자연어 처리 기술로 다양한 형식의 문서를 자동으로 인식하고 변환합니다.', '2024.12.20', 3),
('BizSupport Pro 개발 착수', '기업 업무 효율성을 극대화하는 종합 비즈니스 지원 플랫폼 BizSupport Pro의 개발을 본격적으로 시작했습니다. 프로젝트 관리, 실시간 협업 도구, 데이터 분석 및 리포팅 기능을 중심으로 개발을 진행하고 있습니다.', '2026.01.02', 4),
('중소기업 디지털 전환 지원 프로그램 시작', '중소기업의 디지털 전환을 돕기 위해 무료 컨설팅과 교육 프로그램을 제공하는 ''아이티무유 성장 파트너십''을 시작했습니다. 매월 10개 기업을 선정하여 맞춤형 솔루션 도입을 지원합니다.', '2024.11.15', 5),
('연매출 7천만원 달성 및 성장세 지속', '2025년 연매출 7천만원을 달성하며 안정적인 성장세를 이어가고 있으며, 2026년 목표인 1억원 달성을 향해 나아가고 있습니다. 고객사 수가 전년 대비 150% 증가하며 시장 입지를 넓히고 있습니다.', '2024.11.01', 6),
('클라우드 기반 협업 플랫폼 출시', '언제 어디서나 팀원들과 실시간으로 협업할 수 있는 클라우드 기반 플랫폼을 새롭게 출시했습니다. 모바일 앱 지원으로 이동 중에도 업무가 가능합니다.', '2024.10.15', 7);

-- 슬라이더
INSERT INTO slides (order_num, title, description, image_filename) VALUES
(0, '기업 SaaS 솔루션 기업', '글로벌 물류 SaaS 솔루션, 경영지원 AI 솔루션, 아이티무유를 소개합니다', 'slide1.jpg'),
(1, '혁신적인 AI&빅데이터 기술', '첨단 기술로 기업의 미래를 만들어갑니다', 'slide2.jpg'),
(2, '글로벌 SaaS 기업', '전 세계 고객의 신뢰를 받는 기업', 'slide3.jpg');

-- 연혁
INSERT INTO history_items (year, content, order_num) VALUES
('2026', 'BizSupport Pro 개발 착수', 1),
('2026', '국내 주요 제조업체와 협력 시작', 2),
('2025', '독자 팔레타이징 기술 개발 성공', 3),
('2025', '글로벌 물류 시장 진출 계획 발표', 4),
('2025', '기업 AI 솔루션 ''BizSupport Pro'' 공식 출시', 5),
('2024', '아이티무유 주식회사 설립', 6),
('2024', '로지넥시오 개발 시작', 7),
('2024', 'AI 기반 수출 서류 자동화 솔루션 업그레이드', 8),
('2024', '중소벤처기업부 유망 스타트업 기업 선정', 9),
('2024', '글로벌 물류 기업과 전략적 파트너십 MOU 체결', 10);

-- 솔루션
INSERT INTO solutions (slug, subtitle, description, f1_title, f1_desc, f2_title, f2_desc, f3_title, f3_desc, f4_title, f4_desc) VALUES
('loginexio',
 '최첨단 기술 및 솔루션으로 기업의 제조 물류부터, 고객 인도까지 한번에 한곳에서 해결',
 '최첨단 기술 및 솔루션으로 기업의 제조 물류부터, 고객 인도까지 한번에 한곳에서 해결할 수 있습니다.',
 '팔레트 자동화',
 '물류 팔레트 관리를 자동화하여 효율적인 창고 운영을 지원합니다. AI 기반 최적화로 공간 활용도를 극대화하고, 실시간 재고 추적으로 정확한 물류 관리가 가능합니다.',
 '물류 서류 자동화',
 '수출입 서류, 운송장 등 물류 관련 서류를 자동으로 생성하고 관리합니다. 복잡한 서류 작업을 간소화하여 업무 효율성을 대폭 향상시킵니다.',
 '포워더 계약 관리',
 '글로벌 포워더와의 계약 및 운송 관리를 통합하여 처리합니다. 최적의 운송 경로와 비용을 자동으로 제안하여 물류 비용을 절감합니다.',
 '실시간 물류 추적',
 '제조부터 고객 인도까지 전체 물류 흐름을 실시간으로 추적합니다. GPS 기반 위치 추적과 예상 도착 시간 알림으로 고객 만족도를 향상시킵니다.'
),
('bizsupport',
 '기업의 업무 효율성을 극대화하는 종합 비즈니스 플랫폼',
 '기업의 업무 효율성을 극대화하는 종합 비즈니스 지원 플랫폼입니다. 프로젝트 관리, 실시간 협업 도구, 데이터 분석 및 리포팅, 워크플로우 자동화 기능을 하나의 플랫폼에서 제공하여 업무 생산성을 획기적으로 향상시킵니다.',
 '통합 프로젝트 관리',
 '프로젝트의 전체 라이프사이클을 효율적으로 관리하고 추적할 수 있습니다.',
 '실시간 협업 도구',
 '팀원 간 실시간 커뮤니케이션과 파일 공유로 협업 효율을 높입니다.',
 '데이터 분석 및 리포팅',
 '비즈니스 데이터를 시각화하고 인사이트를 제공합니다.',
 '워크플로우 자동화',
 '반복적인 업무를 자동화하여 생산성을 향상시킵니다.'
);
