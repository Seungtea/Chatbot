# Supabase 설정 가이드

이 문서는 금쪽이 관리자 시스템을 위한 Supabase 설정 방법을 설명합니다.

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com) 에 접속하여 무료 계정으로 로그인합니다.
2. "New Project" 버튼을 클릭합니다.
3. 프로젝트 이름 (예: geumjjong-admin), 데이터베이스 비밀번호, 리전을 선택합니다.
4. 프로젝트를 생성합니다 (몇 분 정도 소요됩니다).

## 2. 인증 설정

1. 프로젝트 대시보드에서 **Authentication** → **Providers** 로 이동합니다.
2. **Email** 프로바이더가 활성화되어 있는지 확인합니다.
3. 필요에 따라 이메일 확인을 비활성화할 수 있습니다 (테스트용).

## 3. 데이터베이스 테이블 생성

SQL Editor 에서 다음 SQL 을 실행하여 테이블을 생성합니다:

```sql
-- users 테이블 생성
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('admin', 'teacher')),
  teacher_id TEXT,
  assigned_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 정책 생성: 사용자는 자신의 정보만 읽을 수 있음
CREATE POLICY "사용자는 자신의 정보만 조회 가능"
  ON users FOR SELECT
  USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- 정책 생성: 관리자만 사용자 추가/수정/삭제 가능
CREATE POLICY "관리자만 사용자 관리 가능"
  ON users FOR ALL
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- 인덱스 생성
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_teacher_id ON users(teacher_id);

-- 자동 updated_at 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## 4. 환경 변수 설정

1. 프로젝트 대시보드에서 **Settings** → **API** 로 이동합니다.
2. **Project URL**과 **anon public key**를 복사합니다.
3. 프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 입력합니다:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## 5. 첫 관리자 계정 생성

### 방법 1: Supabase 대시보드에서 직접 생성

1. **Authentication** → **Users** 로 이동합니다.
2. "Add user" 버튼을 클릭합니다.
3. 이메일과 비밀번호를 입력하여 관리자를 생성합니다.
4. 생성된 사용자의 UUID 를 복사합니다.

5. SQL Editor 에서 다음을 실행하여 관리자 권한 부여:

```sql
-- admin_user_uuid 를 실제 UUID 로 교체하세요
INSERT INTO users (id, email, role, teacher_id, assigned_ids)
VALUES ('admin_user_uuid', 'admin@example.com', 'admin', 'ADMIN001', '{}');
```

### 방법 2: 회원가입 후 관리자 권한 부여

1. 애플리케이션에 접속하여 일반 계정으로 가입합니다.
2. Supabase SQL Editor 에서 해당 사용자에게 관리자 권한을 부여합니다.

## 6. Vercel 에 배포하기

1. [Vercel](https://vercel.com) 에 접속하여 로그인합니다.
2. "Add New" → "Project" 를 클릭합니다.
3. GitHub 저장소를 선택합니다.
4. **Environment Variables** 섹션에서 다음 변수를 추가합니다:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. "Deploy" 버튼을 클릭합니다.

## 7. 보안 고려사항

- **RLS(Row Level Security)**: 모든 테이블에 RLS 를 활성화하여 무단 접근을 방지합니다.
- **Admin API Key**: `.env` 파일에 절대 commit 하지 마세요.
- **선생님 계정**: 선생님 역할의 사용자는 자신이 할당받은 학생 ID 만 볼 수 있습니다.
- **관리자 계정**: 관리자만 사용자 추가/수정/삭제가 가능합니다.

## 8. 추가 기능 (선택사항)

실제 채팅 데이터를 연동하려면:

1. 기존 채팅 시스템의 데이터베이스와 연동
2. API 엔드포인트 생성
3. TeacherDashboard 컴포넌트에서 실제 데이터 조회

