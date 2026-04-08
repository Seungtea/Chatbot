# 금쪽이 관리자 - 채팅 내역 관리 시스템

AI 금쪽이 챗봇 서비스의 채팅 내역을 안전하게 관리하기 위한 웹 애플리케이션입니다.

## 🎯 주요 기능

### 관리자 기능
- **사용자 관리**: 선생님 계정 생성/수정/삭제
- **금쪽이 ID 할당**: n001~n1000, k0001~k2000 범위의 학생 ID 를 선생님에게 할당
- **그룹化管理**: 한 명의 선생님에게 최대 20 개 이상의 학생 ID 를 일괄 할당 가능
- **통계 대시보드**: 전체 사용자, 선생님, 할당된 ID 수 확인

### 선생님 기능
- **내 학생 목록**: 자신에게 할당된 학생 ID 들만 조회 가능
- **채팅 내역 열람**: 각 학생 ID 별로 채팅 페이지로 이동하여 내역 확인
- **보안 접근**: 본인에게 할당된 ID 만 접근 가능 (타인 정보 불가)

## 🔐 보안 특징

1. **인증 기반 접근**: Supabase Authentication 을 통한 안전한 로그인
2. **역할 기반 권한 관리**: 관리자와 선생님 역할 분리
3. **RLS(Row Level Security)**: 데이터베이스 수준에서 접근 제어
4. **URL 노출 방지**: 직접 URL 입력으로 타인 정보 접근 불가

## 🚀 빠른 시작

### 1. Supabase 설정

```bash
# .env 파일 생성
cp .env.example .env
```

`.env` 파일에 Supabase 프로젝트 정보 입력:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

자세한 설정 방법은 [supabase-setup.md](./supabase-setup.md) 를 참조하세요.

### 2. 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm run dev
```

브라우저에서 `http://localhost:5173` 으로 접속합니다.

### 3. 빌드

```bash
npm run build
```

### 4. Vercel 에 배포

1. Vercel 에서 새 프로젝트 생성
2. GitHub 저장소 연결
3. 환경 변수 설정:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. 배포!

## 📁 프로젝트 구조

```
geumjjong-admin/
├── src/
│   ├── components/
│   │   ├── Login.jsx           # 로그인 페이지
│   │   ├── Dashboard.jsx       # 관리자 대시보드
│   │   ├── TeacherDashboard.jsx # 선생님 대시보드
│   │   └── UserModal.jsx       # 사용자 추가/수정 모달
│   ├── App.jsx                 # 메인 앱 컴포넌트
│   ├── main.jsx                # 앱 진입점
│   ├── index.css               # 전역 스타일
│   └── supabaseClient.js       # Supabase 클라이언트 설정
├── public/
├── .env.example                # 환경 변수 예시
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
├── supabase-setup.md           # Supabase 설정 가이드
└── README.md
```

## 💡 사용 시나리오

### 시나리오 1: 금쪽이 ID 를 20 개 구매한 선생님 배정

1. 관리자가 로그인
2. "새 사용자 추가" 클릭
3. 이메일: `teacher019@school.com`, 비밀번호: `0000` 입력
4. 역할: "선생님" 선택
5. 선생님 ID: `Tea019` 입력
6. 금쪽이 ID 할당:
   - 접두사: `k`
   - 시작: `1001`
   - 끝: `1020`
   - "범위 추가" 클릭
7. "추가" 버튼 클릭

8. 선생님께 다음 정보 전달:
   - 로그인 URL: `https://your-app.vercel.app`
   - ID: `teacher019@school.com`
   - PW: `0000`

9. 선생님은 로그인 후 k1001~k1020 학생들의 채팅 내역을 볼 수 있음

### 시나리오 2: 기존 선생님에게 추가 ID 할당

1. 관리자 대시보드에서 해당 선생님 검색
2. "수정" 버튼 클릭
3. 추가할 ID 를 입력하거나 범위로 추가
4. "수정" 버튼 클릭

## 🔧 기술 스택

- **Frontend**: React 19, Vite
- **Backend/BaaS**: Supabase (Authentication, Database)
- **Styling**: CSS
- **Deployment**: Vercel

## 📝 라이선스

MIT

## 🤝 기여

이슈 및 PR 환영합니다!
