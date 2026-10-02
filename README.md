# 🌟 말랑 한글 탐험대 (Mallang Hangul Quest)
> 도서산간·농어촌 및 다문화 가정 초등 저학년(1~3학년)을 위한 소리 기반 문해력 탐험 & 맞춤 도감 수집 웹앱

---

## 📌 1. 프로젝트 개요 (Overview)
- **목적**: 어른이나 보호자의 도움 없이도 아이 혼자 집에서 태블릿을 켜고 재미있게 놀며 한국어 문해력을 기를 수 있는 게이미피케이션 교육용 웹앱
- **타깃 사용자**: 도서산간, 농어촌 지역의 다문화 가정 초등학교 1~3학년 아동
- **구동 환경**: 시도교육청 보급형 태블릿(갤럭시탭, 웨일북, 아이패드 등), 스마트폰, PC 웹 브라우저 (Chrome, Safari, Whale)
- **개발 스택**: 순수 HTML5, CSS3, Modern JavaScript (ES6+), Web Speech API (브라우저 내장 TTS), Web Audio API (효과음), LocalStorage (무로그인 진도 저장)

---

## 🚀 2. 실행 방법 (Quick Start)
1. `index.html` 파일을 더블 클릭하여 크롬(Chrome)이나 웨일(Whale) 브라우저에서 바로 열 수 있습니다.
2. 태블릿 브라우저에서 '홈 화면에 추가'를 누르면 전용 앱처럼 전체 화면으로 사용할 수 있습니다.
3. GitHub에 리포지토리를 만들고 소스를 올린 뒤 **GitHub Pages** 설정을 켜면 어디서든 접속 가능한 무료 웹 링크가 생성됩니다.

---

## 🗂️ 3. 파일 구성
```text
말랑한글탐험대_MallangHangulQuest/
├── index.html          # 메인 화면 및 뷰 템플릿
├── styles.css          # 보급형 태블릿 최적화 2D UI 스타일링
├── app.js              # 3단계 학습 엔진, TTS 음성, 도감 보상, LocalStorage 관리
├── PRD.md              # 상세 제품 요구사항 정의서 (기획서)
├── JULES_PROMPT.md     # AI 코딩 에이전트 '쥴스(Jules)' 전용 마스터 프롬프트
└── README.md           # [본 문서] 프로젝트 안내서
```
