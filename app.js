/**
 * 🌟 말랑 한글 탐험대 (Mallang Hangul Quest)
 * - 브라우저 Web Speech API (TTS) 기반 소리 학습
 * - Web Audio API 자체 신디사이저 효과음
 * - 다문화 가정 모국어 원터치 힌트 & 나만의 취향 맞춤 도감 수집 엔진
 */

// ==========================================
// 1. 오디오 신디사이저 (Web Audio API)
// ==========================================
class SoundFX {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
  }

  playTone(freq, type = 'sine', duration = 0.2, delay = 0) {
    if (!this.ctx) this.init();
    if (!this.ctx) return;

    setTimeout(() => {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        console.warn('Audio play error:', e);
      }
    }, delay * 1000);
  }

  // 정답 딩동댕!
  playSuccess() {
    this.playTone(523.25, 'triangle', 0.2, 0);      // 도 (C5)
    this.playTone(659.25, 'triangle', 0.2, 0.15);   // 미 (E5)
    this.playTone(783.99, 'triangle', 0.35, 0.3);   // 솔 (G5)
    this.playTone(1046.50, 'triangle', 0.45, 0.45); // 높은 도 (C6)
  }

  // 오답 친절한 또잉~
  playTryAgain() {
    this.playTone(400, 'sine', 0.2, 0);
    this.playTone(330, 'sine', 0.3, 0.15);
  }

  // 별 획득 챠링!
  playStar() {
    this.playTone(880, 'sine', 0.15, 0);
    this.playTone(1320, 'sine', 0.3, 0.1);
  }

  // 도감 카드 해제 팡파레!
  playFanfare() {
    this.playTone(523.25, 'triangle', 0.18, 0);
    this.playTone(659.25, 'triangle', 0.18, 0.15);
    this.playTone(783.99, 'triangle', 0.18, 0.3);
    this.playTone(1046.50, 'triangle', 0.5, 0.45);
  }
}

const sfx = new SoundFX();

// ==========================================
// 2. 음성 낭독 (Web Speech TTS)
// ==========================================
function speakText(text, lang = 'ko-KR', rate = 0.88) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel(); // 이전 발화 취소

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate; // 초등 저학년 아동을 위해 살짝 여유 있는 속도
  utterance.pitch = 1.1; // 친근하고 다정한 톤

  // 브라우저 지원 음성 목록 중 최적 보이스 선택 시도
  const voices = window.speechSynthesis.getVoices();
  const selectedVoice = voices.find(v => v.lang.startsWith(lang));
  if (selectedVoice) utterance.voice = selectedVoice;

  window.speechSynthesis.speak(utterance);
}

// ==========================================
// 3. 학습 및 도감 데이터베이스
// ==========================================
const ENCYCLOPEDIA_CATALOG = {
  dino: [
    { id: 'dino_1', name: '티라노사우루스', emoji: '🦖', desc: '가장 강력하고 거대한 턱을 가진 육식 공룡이에요!', starsNeeded: 1 },
    { id: 'dino_2', name: '트리케라톱스', emoji: '🦏', desc: '머리에 멋진 뿔이 3개나 달린 순한 초식 공룡이에요.', starsNeeded: 2 },
    { id: 'dino_3', name: '브라키오사우루스', emoji: '🦕', desc: '목이 아주아주 길어서 높은 나무의 잎도 잘 먹어요.', starsNeeded: 3 },
    { id: 'dino_4', name: '프테라노돈', emoji: '🦅', desc: '커다란 날개로 하늘을 시원하게 날아다녔어요.', starsNeeded: 4 },
    { id: 'dino_5', name: '스테고사우루스', emoji: '🦎', desc: '등에 멋진 뼈 판이 줄지어 있고 꼬리에 가시가 있어요.', starsNeeded: 5 },
    { id: 'dino_6', name: '안킬로사우루스', emoji: '🐢', desc: '단단한 갑옷과 꼬리 곤봉으로 몸을 지키는 공룡이에요.', starsNeeded: 6 }
  ],
  animal: [
    { id: 'anim_1', name: '용감한 사자', emoji: '🦁', desc: '멋진 갈기를 뽐내는 동물의 왕이에요!', starsNeeded: 1 },
    { id: 'anim_2', name: '친절한 코끼리', emoji: '🐘', desc: '긴 코로 물을 뿜고 무엇이든 잘 집어 올려요.', starsNeeded: 2 },
    { id: 'anim_3', name: '줄무늬 얼룩말', emoji: '🦓', desc: '검은색과 흰색 줄무늬가 아주 멋진 친구예요.', starsNeeded: 3 },
    { id: 'anim_4', name: '키다리 기린', emoji: '🦒', desc: '목이 길어서 높은 나뭇잎을 맛있게 먹어요.', starsNeeded: 4 },
    { id: 'anim_5', name: '귀여운 판다', emoji: '🐼', desc: '대나무 잎을 좋아하는 둥글둥글 착한 친구예요.', starsNeeded: 5 },
    { id: 'anim_6', name: '푸른 바다 고래', emoji: '🐳', desc: '바다에서 물을 시원하게 뿜어 올리는 거대한 친구예요.', starsNeeded: 6 }
  ],
  insect: [
    { id: 'ins_1', name: '장수풍뎅이', emoji: '🪲', desc: '멋진 큰 뿔을 가진 숲속의 힘센 장사예요!', starsNeeded: 1 },
    { id: 'ins_2', name: '무당벌레', emoji: '🐞', desc: '빨간 날개에 예쁜 까만 점들이 콕콕 박혀 있어요.', starsNeeded: 2 },
    { id: 'ins_3', name: '알록달록 나비', emoji: '🦋', desc: '꽃들 사이를 나풀나풀 춤추며 날아다녀요.', starsNeeded: 3 },
    { id: 'ins_4', name: '부지런한 꿀벌', emoji: '🐝', desc: '꽃에서 달콤한 꿀을 모아 집으로 가져가요.', starsNeeded: 4 },
    { id: 'ins_5', name: '반딧불이', emoji: '✨', desc: '깜깜한 밤하늘을 작은 전등처럼 밝혀줘요.', starsNeeded: 5 },
    { id: 'ins_6', name: '사슴벌레', emoji: '🦀', desc: '사슴 뿔처럼 멋진 집게 턱을 자랑해요.', starsNeeded: 6 }
  ],
  flower: [
    { id: 'flw_1', name: '해바라기', emoji: '🌻', desc: '따뜻한 햇님을 바라보며 활짝 웃는 노란 꽃이에요.', starsNeeded: 1 },
    { id: 'flw_2', name: '민들레', emoji: '🌼', desc: '바람이 불면 솜털 씨앗을 타고 둥둥 여행을 떠나요.', starsNeeded: 2 },
    { id: 'flw_3', name: '무궁화', emoji: '🌺', desc: '오래오래 피고 또 피는 우리나라 꽃이에요.', starsNeeded: 3 },
    { id: 'flw_4', name: '장미', emoji: '🌹', desc: '향기가 아주 좋고 꽃잎이 고운 붉은 꽃이에요.', starsNeeded: 4 },
    { id: 'flw_5', name: '단풍나무', emoji: '🍁', desc: '가을이 오면 잎사귀가 붉고 곱게 물들어요.', starsNeeded: 5 },
    { id: 'flw_6', name: '클로버', emoji: '🍀', desc: '초록 잎사귀 세 개가 모인 행운의 식물이에요.', starsNeeded: 6 }
  ]
};

// 다문화 힌트 사전 (베트남어, 중국어, 영어, 러시아어)
const MULTI_LANG_DICT = {
  '호랑이': { vi: 'Hổ / Cọp', zh: '老虎 (lǎohǔ)', en: 'Tiger', ru: 'Тигр' },
  '코끼리': { vi: 'Con voi', zh: '大象 (dàxiàng)', en: 'Elephant', ru: 'Слон' },
  '사자': { vi: 'Sư tử', zh: '狮子 (shīzi)', en: 'Lion', ru: 'Лев' },
  '토끼': { vi: 'Con thỏ', zh: '兔子 (tùzi)', en: 'Rabbit', ru: 'Кролик' },
  '나비': { vi: 'Bướm', zh: '蝴蝶 (húdié)', en: 'Butterfly', ru: 'Бабочка' },
  '해바라기': { vi: 'Hoa hướng dương', zh: '向日葵 (xiàngrìkuí)', en: 'Sunflower', ru: 'Подсолнух' },
  '학교': { vi: 'Trường học', zh: '学校 (xuéxiào)', en: 'School', ru: 'Школа' },
  '친구': { vi: 'Bạn bè', zh: '朋友 (péngyǒu)', en: 'Friend', ru: 'Друг' },
  '괜찮니': { vi: 'Bạn có sao không?', zh: '你还好吗? (nǐ hái hǎo ma)', en: 'Are you okay?', ru: 'Ты в порядке?' },
  '고맙습니다': { vi: 'Cảm ơn bạn', zh: '谢谢 (xièxie)', en: 'Thank you', ru: 'Спасибо' },
  '선생님 안녕하세요': { vi: 'Em chào cô/thầy', zh: '老师好 (lǎoshī hǎo)', en: 'Hello teacher', ru: 'Здравствуйте, учитель' },
  '티라노사우루스': { vi: 'Khủng long bạo chúa', zh: '霸王龙 (bàwánglóng)', en: 'Tyrannosaurus', ru: 'Тираннозавр' },
  '트리케라톱스': { vi: 'Khủng long ba sừng', zh: '三角龙 (sānjiǎolóng)', en: 'Triceratops', ru: 'Трицератопс' },
  '브라키오사우루스': { vi: 'Khủng long cổ dài', zh: '腕龙 (wànlóng)', en: 'Brachiosaurus', ru: 'Брахиозавр' },
  '프테라노돈': { vi: 'Thằn lằn bay', zh: '无齿翼龙 (wúchǐyìlóng)', en: 'Pteranodon', ru: 'Птеранодон' },
  '스테고사우루스': { vi: 'Khủng long phiến sừng', zh: '剑龙 (jiànlóng)', en: 'Stegosaurus', ru: 'Стегозавр' },
  '얼룩말': { vi: 'Ngựa vằn', zh: '斑马 (bānmǎ)', en: 'Zebra', ru: 'Зебра' },
  '기린': { vi: 'Hươu cao cổ', zh: '长颈鹿 (chángjǐnglù)', en: 'Giraffe', ru: 'Жираф' },
  '판다': { vi: 'Gấu trúc', zh: '熊猫 (xióngmāo)', en: 'Panda', ru: 'Панда' },
  '장수풍뎅이': { vi: 'Bọ hung sừng chữ Y', zh: '独角仙 (dújiǎoxiān)', en: 'Rhinoceros beetle', ru: 'Жук-носорог' },
  '무당벌레': { vi: 'Bọ rùa', zh: '瓢虫 (piáochóng)', en: 'Ladybug', ru: 'Божья коровка' },
  '꿀벌': { vi: 'Ong mật', zh: '蜜蜂 (mìfēng)', en: 'Honeybee', ru: 'Пчела' },
  '반딧불이': { vi: 'Đom đóm', zh: '萤火虫 (yínghuǒchóng)', en: 'Firefly', ru: 'Светлячок' },
  '민들레': { vi: 'Bồ công anh', zh: '蒲公英 (púgōngyīng)', en: 'Dandelion', ru: 'Одуванчик' },
  '무궁화': { vi: 'Hoa dâm bụt', zh: '木槿花 (mùjǐnhuā)', en: 'Rose of Sharon', ru: 'Гибискус' },
  '장미': { vi: 'Hoa hồng', zh: '玫瑰 (méiguī)', en: 'Rose', ru: 'Роза' },
  '단풍나무': { vi: 'Cây phong', zh: '枫树 (fēngshù)', en: 'Maple', ru: 'Клен' },
  '밥': { vi: 'Cơm', zh: '饭 (fàn)', en: 'Rice / Meal', ru: 'Рис / Еда' },
  '손': { vi: 'Tay', zh: '手 (shǒu)', en: 'Hand', ru: 'Рука' },
  '책': { vi: 'Sách', zh: '书 (shū)', en: 'Book', ru: 'Книга' },
  '연필 좀 빌려줄래': { vi: 'Cho mình mượn bút chì nhé', zh: '能借我铅笔吗? (néng jiè wǒ qiānbǐ ma)', en: 'Can I borrow a pencil?', ru: 'Можно одолжить карандаш?' },
  '미안해': { vi: 'Xin lỗi', zh: '对不起 (duìbùqǐ)', en: 'I am sorry', ru: 'Извини' }
};

// 3단계 학습 퀘스트 문제 세트
const QUIZ_STAGES = [
  // 1단계: 소리-그림 낱말 매칭
  {
    stage: 1,
    title: '1단계: 소리와 그림 찾기',
    instruction: '소리를 잘 듣고, 알맞은 그림을 골라보세요!',
    type: 'word_match',
    questions: {
      dino: [
        { targetWord: '티라노사우루스', audioText: '티라노사우루스. 커다란 이빨을 가진 티라노사우루스는?', options: [{word: '티라노사우루스', emoji: '🦖'}, {word: '코끼리', emoji: '🐘'}, {word: '토끼', emoji: '🐰'}], answer: '티라노사우루스' },
        { targetWord: '트리케라톱스', audioText: '트리케라톱스. 뿔이 세 개 달린 트리케라톱스는?', options: [{word: '사자', emoji: '🦁'}, {word: '트리케라톱스', emoji: '🦏'}, {word: '호랑이', emoji: '🐯'}], answer: '트리케라톱스' },
        { targetWord: '브라키오사우루스', audioText: '브라키오사우루스. 목이 아주 긴 브라키오사우루스는?', options: [{word: '기린', emoji: '🦒'}, {word: '사과', emoji: '🍎'}, {word: '브라키오사우루스', emoji: '🦕'}], answer: '브라키오사우루스' },
        { targetWord: '프테라노돈', audioText: '프테라노돈. 하늘을 나는 공룡 프테라노돈은?', options: [{word: '프테라노돈', emoji: '🦅'}, {word: '나비', emoji: '🦋'}, {word: '나무', emoji: '🌲'}], answer: '프테라노돈' },
        { targetWord: '스테고사우루스', audioText: '스테고사우루스. 등에 뾰족뾰족 뼈 판이 있는 스테고사우루스는?', options: [{word: '해바라기', emoji: '🌻'}, {word: '스테고사우루스', emoji: '🦎'}, {word: '원숭이', emoji: '🐵'}], answer: '스테고사우루스' }
      ],
      animal: [
        { targetWord: '호랑이', audioText: '호랑이. 용감한 호랑이를 찾아보세요.', options: [{ word: '호랑이', emoji: '🐯' }, { word: '토끼', emoji: '🐰' }, { word: '곰돌이', emoji: '🐻' }], answer: '호랑이' },
        { targetWord: '코끼리', audioText: '코끼리. 코가 길쭉한 코끼리는 어디 있을까요?', options: [{ word: '원숭이', emoji: '🐵' }, { word: '코끼리', emoji: '🐘' }, { word: '여우', emoji: '🦊' }], answer: '코끼리' },
        { targetWord: '사자', audioText: '사자. 갈기가 멋진 사자를 찾아보세요.', options: [{word: '사자', emoji: '🦁'}, {word: '나비', emoji: '🦋'}, {word: '강아지', emoji: '🐶'}], answer: '사자' },
        { targetWord: '얼룩말', audioText: '얼룩말. 줄무늬가 있는 얼룩말은 어디 있을까요?', options: [{word: '얼룩말', emoji: '🦓'}, {word: '사과', emoji: '🍎'}, {word: '해바라기', emoji: '🌻'}], answer: '얼룩말' },
        { targetWord: '판다', audioText: '판다. 대나무를 좋아하는 판다는?', options: [{word: '기린', emoji: '🦒'}, {word: '판다', emoji: '🐼'}, {word: '고양이', emoji: '🐱'}], answer: '판다' }
      ],
      insect: [
        { targetWord: '나비', audioText: '나비. 나풀나풀 나비를 찾아보세요.', options: [{word: '토끼', emoji: '🐰'}, {word: '나비', emoji: '🦋'}, {word: '나무', emoji: '🌲'}], answer: '나비' },
        { targetWord: '장수풍뎅이', audioText: '장수풍뎅이. 뿔이 멋진 장수풍뎅이는?', options: [{word: '장수풍뎅이', emoji: '🪲'}, {word: '사자', emoji: '🦁'}, {word: '꽃', emoji: '🌸'}], answer: '장수풍뎅이' },
        { targetWord: '무당벌레', audioText: '무당벌레. 빨간 등에 점이 있는 무당벌레는?', options: [{word: '해바라기', emoji: '🌻'}, {word: '무당벌레', emoji: '🐞'}, {word: '코끼리', emoji: '🐘'}], answer: '무당벌레' },
        { targetWord: '꿀벌', audioText: '꿀벌. 윙윙 꿀벌은 어디 있을까요?', options: [{word: '호랑이', emoji: '🐯'}, {word: '꿀벌', emoji: '🐝'}, {word: '원숭이', emoji: '🐵'}], answer: '꿀벌' },
        { targetWord: '반딧불이', audioText: '반딧불이. 반짝반짝 반딧불이를 찾아보세요.', options: [{word: '반딧불이', emoji: '✨'}, {word: '사과', emoji: '🍎'}, {word: '얼룩말', emoji: '🦓'}], answer: '반딧불이' }
      ],
      flower: [
        { targetWord: '해바라기', audioText: '해바라기. 노란 꽃잎의 해바라기를 찾아보세요.', options: [{ word: '나무', emoji: '🌲' }, { word: '해바라기', emoji: '🌻' }, { word: '사과', emoji: '🍎' }], answer: '해바라기' },
        { targetWord: '민들레', audioText: '민들레. 솜털이 날아가는 민들레는?', options: [{word: '민들레', emoji: '🌼'}, {word: '사자', emoji: '🦁'}, {word: '나비', emoji: '🦋'}], answer: '민들레' },
        { targetWord: '무궁화', audioText: '무궁화. 예쁜 분홍색 무궁화를 찾아보세요.', options: [{word: '코끼리', emoji: '🐘'}, {word: '토끼', emoji: '🐰'}, {word: '무궁화', emoji: '🌺'}], answer: '무궁화' },
        { targetWord: '장미', audioText: '장미. 향기가 좋은 빨간 장미는?', options: [{word: '장미', emoji: '🌹'}, {word: '호랑이', emoji: '🐯'}, {word: '나무', emoji: '🌲'}], answer: '장미' },
        { targetWord: '단풍나무', audioText: '단풍나무. 별 모양 잎의 단풍나무는?', options: [{word: '기린', emoji: '🦒'}, {word: '단풍나무', emoji: '🍁'}, {word: '꿀벌', emoji: '🐝'}], answer: '단풍나무' }
      ]
    }
  },

  // 2단계: 어절 블록 문장 조합
  {
    stage: 2,
    title: '2단계: 말풍선 문장 만들기',
    instruction: '소리를 듣고, 글자 블록을 순서대로 눌러 문장을 완성해봐요!',
    type: 'sentence_assembly',
    questions: [
      {
        targetSentence: '나는 학교에 갑니다',
        audioText: '나는 학교에 갑니다. 순서대로 블록을 톡톡 눌러보세요.',
        blocks: ['갑니다', '나는', '학교에'],
        answer: ['나는', '학교에', '갑니다']
      },
      {
        targetSentence: '친구가 활짝 웃어요',
        audioText: '친구가 활짝 웃어요. 글자 블록을 맞춰볼까요?',
        blocks: ['웃어요', '활짝', '친구가'],
        answer: ['친구가', '활짝', '웃어요']
      },
      {
        targetSentence: '밥을 맛있게 먹어요',
        audioText: '밥을 맛있게 먹어요. 글자 블록을 순서대로 톡톡 눌러보세요.',
        blocks: ['맛있게', '먹어요', '밥을'],
        answer: ['밥을', '맛있게', '먹어요']
      },
      {
        targetSentence: '손을 깨끗하게 씻어요',
        audioText: '손을 깨끗하게 씻어요. 글자 블록을 맞춰볼까요?',
        blocks: ['깨끗하게', '손을', '씻어요'],
        answer: ['손을', '깨끗하게', '씻어요']
      },
      {
        targetSentence: '재미있는 책을 읽어요',
        audioText: '재미있는 책을 읽어요. 순서대로 블록을 톡톡 눌러보세요.',
        blocks: ['책을', '읽어요', '재미있는'],
        answer: ['재미있는', '책을', '읽어요']
      }
    ]
  },

  // 3단계: 상황·문맥 이해 퀴즈
  {
    stage: 3,
    title: '3단계: 다정한 마음과 상황 말하기',
    instruction: '이런 상황에서는 어떤 말을 건네면 좋을까요?',
    type: 'context_situation',
    questions: [
      {
        situation: '친구가 운동장에서 넘어져 무릎이 까졌어요. 😢',
        audioText: '친구가 운동장에서 넘어져 아파하고 있어요. 어떤 다정한 말을 건네면 좋을까요?',
        targetWord: '괜찮니',
        choices: [
          { text: '❤️ "괜찮니? 내가 부축해 줄게."', correct: true },
          { text: '😜 "메롱, 넘어졌대요!"', correct: false },
          { text: '🏃 "나 먼저 갈 거니까 비켜."', correct: false }
        ],
        feedback: '맞아요! 친구가 아플 때는 "괜찮니?"라고 다정하게 물어봐 주는 게 최고의 마음이에요!'
      },
      {
        situation: '복도에서 담임 선생님을 마주쳤어요! 🏫',
        audioText: '복도에서 담임 선생님을 마주쳤어요. 어떻게 인사하면 좋을까요?',
        targetWord: '선생님 안녕하세요',
        choices: [
          { text: '🙇 "선생님, 안녕하세요!"', correct: true },
          { text: '👋 "어이, 반가워!"', correct: false },
          { text: '🙈 "모르는 척 휙 지나간다."', correct: false }
        ],
        feedback: '정답이에요! 두 손을 모으고 예의 바르게 "선생님, 안녕하세요!" 인사해요.'
      },
      {
        situation: '그림을 그리는데 연필이 부러졌어요. ✏️',
        audioText: '그림을 그리는데 연필이 부러졌어요. 짝꿍에게 어떻게 말하면 좋을까요?',
        targetWord: '연필 좀 빌려줄래',
        choices: [
          { text: '🙏 "연필 좀 빌려줄래?"', correct: true },
          { text: '😡 "내 연필 내놔!"', correct: false },
          { text: '😭 "그냥 울어버린다."', correct: false }
        ],
        feedback: '맞아요! 물건이 필요할 때는 "빌려줄래?" 하고 예쁘게 물어보는 거예요.'
      },
      {
        situation: '실수로 친구의 발을 밟았어요! 👟',
        audioText: '실수로 친구의 발을 밟았어요. 어떻게 해야 할까요?',
        targetWord: '미안해',
        choices: [
          { text: '🥺 "정말 미안해, 많이 아프지?"', correct: true },
          { text: '🙄 "네가 거기 서 있어서 그래!"', correct: false },
          { text: '🏃 "모른 척하고 도망간다."', correct: false }
        ],
        feedback: '훌륭해요! 실수했을 때는 진심으로 "미안해"라고 사과하는 멋진 친구가 되어요.'
      },
      {
        situation: '친구가 나에게 무거운 짐을 들어주었어요! 📦',
        audioText: '친구가 무거운 짐을 들어주었어요. 어떤 말을 하면 좋을까요?',
        targetWord: '고맙습니다',
        choices: [
          { text: '😊 "도와줘서 정말 고마워!"', correct: true },
          { text: '😎 "당연히 네가 해야지."', correct: false },
          { text: '😶 "아무 말도 안 한다."', correct: false }
        ],
        feedback: '참 잘했어요! 도움을 받았을 때는 활짝 웃으며 "고마워!" 하고 마음을 표현해요.'
      }
    ]
  }
];

// ==========================================
// 4. 앱 상태 관리 (State & Persistence)
// ==========================================
const AppState = {
  avatar: '🐰',
  nickname: '씩씩한 탐험가',
  theme: 'dino',
  stars: 0,
  currentStageIdx: 0,
  currentQuestionIdx: 0,
  unlockedCards: [],

  load() {
    const saved = localStorage.getItem('mallang_hangul_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        Object.assign(this, parsed);
      } catch (e) {
        console.error('State load error:', e);
      }
    }
  },

  save() {
    localStorage.setItem('mallang_hangul_state', JSON.stringify({
      avatar: this.avatar,
      nickname: this.nickname,
      theme: this.theme,
      stars: this.stars,
      currentStageIdx: this.currentStageIdx,
      currentQuestionIdx: this.currentQuestionIdx,
      unlockedCards: this.unlockedCards
    }));
  },

  addStar() {
    this.stars += 1;
    sfx.playStar();
    this.checkUnlockCards();
    this.save();
    UI.updateHeader();
  },

  checkUnlockCards() {
    const catalog = ENCYCLOPEDIA_CATALOG[this.theme] || [];
    catalog.forEach(card => {
      if (this.stars >= card.starsNeeded && !this.unlockedCards.includes(card.id)) {
        this.unlockedCards.push(card.id);
        UI.showUnlockModal(card);
      }
    });
  }
};

// ==========================================
// 5. UI 컨트롤러 (Views & Interaction)
// ==========================================
const UI = {
  views: {
    welcome: document.getElementById('view-welcome'),
    theme: document.getElementById('view-theme'),
    quest: document.getElementById('view-quest'),
    encyclopedia: document.getElementById('view-encyclopedia')
  },

  switchView(viewName) {
    Object.values(this.views).forEach(v => v.classList.add('hidden'));
    if (this.views[viewName]) {
      this.views[viewName].classList.remove('hidden');
    }
  },

  updateHeader() {
    document.getElementById('user-avatar-display').textContent = AppState.avatar;
    document.getElementById('user-name-display').textContent = AppState.nickname;
    document.getElementById('star-count-text').textContent = AppState.stars;
  },

  // 퀴즈 렌더링
  renderCurrentQuestion() {
    const stageObj = QUIZ_STAGES[AppState.currentStageIdx];
    if (!stageObj) {
      // 모든 단계 수료!
      speakText('축하합니다! 모든 탐험 퀘스트를 훌륭하게 완수했어요!');
      this.switchView('encyclopedia');
      this.renderEncyclopedia();
      return;
    }

    let q;
    if (stageObj.type === 'word_match') {
      const themeQuestions = stageObj.questions[AppState.theme] || stageObj.questions['dino'];
      q = themeQuestions[AppState.currentQuestionIdx];
    } else {
      q = stageObj.questions[AppState.currentQuestionIdx];
    }

    if (!q) {
      // 다음 단계로 전환
      AppState.currentStageIdx += 1;
      AppState.currentQuestionIdx = 0;
      this.renderCurrentQuestion();
      return;
    }

    // 뱃지 및 지시문
    document.getElementById('quest-stage-badge').textContent = stageObj.title;
    document.getElementById('quest-instruction-text').textContent = stageObj.instruction;

    // 소리 재생 버튼 핸들러 설정
    const btnSpeak = document.getElementById('btn-speak-question');
    btnSpeak.onclick = () => {
      speakText(q.audioText);
    };

    // 문제 시작 시 자동 1회 읽어주기 (소리 우선)
    speakText(q.audioText);

    const container = document.getElementById('quiz-interaction-container');
    container.innerHTML = '';

    if (stageObj.type === 'word_match') {
      this.renderStage1(q, container);
    } else if (stageObj.type === 'sentence_assembly') {
      this.renderStage2(q, container);
    } else if (stageObj.type === 'context_situation') {
      this.renderStage3(q, container);
    }
  },

  // 1단계: 낱말 카드 짝맞추기 렌더링
  renderStage1(q, container) {
    const grid = document.createElement('div');
    grid.className = 'quiz-options-grid';

    q.options.forEach(opt => {
      const card = document.createElement('div');
      card.className = 'quiz-card';
      card.innerHTML = `
        <div class="card-emoji">${opt.emoji}</div>
        <div class="card-word">${opt.word}</div>
      `;

      card.onclick = () => {
        if (opt.word === q.answer) {
          sfx.playSuccess();
          speakText(`정답이에요! ${opt.word}! 참 잘했어요!`);
          card.style.borderColor = '#2ECC71';
          card.style.background = '#E8F8F0';
          setTimeout(() => {
            AppState.addStar();
            AppState.currentQuestionIdx += 1;
            this.renderCurrentQuestion();
          }, 1200);
        } else {
          sfx.playTryAgain();
          speakText(`이것은 ${opt.word} 예요. 소리를 다시 한번 듣고 찾아볼까요?`);
          card.style.borderColor = '#E74C3C';
          setTimeout(() => {
            card.style.borderColor = '#CBD5E1';
          }, 1000);
        }
      };

      grid.appendChild(card);
    });

    container.appendChild(grid);
  },

  // 2단계: 문장 어절 블록 조립 렌더링
  renderStage2(q, container) {
    const wrapper = document.createElement('div');
    wrapper.style.width = '100%';
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.alignItems = 'center';

    const dropArea = document.createElement('div');
    dropArea.className = 'sentence-drop-area';
    dropArea.innerHTML = '<span style="color: #A0AEC0; font-size: 1.2rem;">여기에 순서대로 블록을 채워봐요!</span>';

    const poolArea = document.createElement('div');
    poolArea.className = 'sentence-pool-area';

    let assembledWords = [];

    q.blocks.forEach(word => {
      const block = document.createElement('button');
      block.className = 'word-block';
      block.textContent = word;

      block.onclick = () => {
        sfx.playTone(600, 'sine', 0.1);
        speakText(word);
        assembledWords.push(word);
        block.style.display = 'none';

        if (assembledWords.length === 1) dropArea.innerHTML = '';
        const placed = document.createElement('span');
        placed.className = 'word-block';
        placed.style.background = '#EBF8FF';
        placed.textContent = word;
        dropArea.appendChild(placed);

        // 정답 검사
        if (assembledWords.length === q.answer.length) {
          if (assembledWords.join(' ') === q.answer.join(' ')) {
            sfx.playSuccess();
            speakText(`우와! 멋진 문장이 완성되었어요! ${q.targetSentence}!`);
            setTimeout(() => {
              AppState.addStar();
              AppState.currentQuestionIdx += 1;
              UI.renderCurrentQuestion();
            }, 1500);
          } else {
            sfx.playTryAgain();
            speakText('순서가 조금 다른 것 같아요! 다시 한번 맞춰볼까요?');
            setTimeout(() => {
              UI.renderCurrentQuestion();
            }, 1200);
          }
        }
      };

      poolArea.appendChild(block);
    });

    wrapper.appendChild(dropArea);
    wrapper.appendChild(poolArea);
    container.appendChild(wrapper);
  },

  // 3단계: 상황·문맥 이해 렌더링
  renderStage3(q, container) {
    const wrapper = document.createElement('div');
    wrapper.style.width = '100%';
    wrapper.style.maxWidth = '760px';

    const situationCard = document.createElement('div');
    situationCard.style.padding = '18px 24px';
    situationCard.style.background = '#FEFCBF';
    situationCard.style.borderRadius = '16px';
    situationCard.style.fontSize = '1.3rem';
    situationCard.style.fontWeight = '800';
    situationCard.style.marginBottom = '20px';
    situationCard.style.textAlign = 'center';
    situationCard.textContent = q.situation;
    wrapper.appendChild(situationCard);

    const choicesWrapper = document.createElement('div');
    choicesWrapper.className = 'context-choices';

    q.choices.forEach(ch => {
      const btn = document.createElement('button');
      btn.className = 'context-choice-btn';
      btn.textContent = ch.text;

      btn.onclick = () => {
        if (ch.correct) {
          sfx.playSuccess();
          speakText(q.feedback);
          btn.style.borderColor = '#2ECC71';
          btn.style.background = '#E8F8F0';
          setTimeout(() => {
            AppState.addStar();
            AppState.currentQuestionIdx += 1;
            UI.renderCurrentQuestion();
          }, 2000);
        } else {
          sfx.playTryAgain();
          speakText('친구의 기분이 슬플 수 있어요. 다른 말을 골라볼까요?');
          btn.style.borderColor = '#E74C3C';
        }
      };

      choicesWrapper.appendChild(btn);
    });

    wrapper.appendChild(choicesWrapper);
    container.appendChild(wrapper);
  },

  // 도감(Encyclopedia) 렌더링
  renderEncyclopedia() {
    const catalog = ENCYCLOPEDIA_CATALOG[AppState.theme] || [];
    const grid = document.getElementById('enc-cards-grid');
    grid.innerHTML = '';

    const themeTitles = {
      dino: '🦖 쥐라기 공룡 도감',
      animal: '🦁 신비한 동물원 도감',
      insect: '🐞 숲속 곤충 탐험 도감',
      flower: '🌸 알록달록 꽃과 식물 도감'
    };
    document.getElementById('enc-theme-title').textContent = themeTitles[AppState.theme] || '📖 내 도감';

    catalog.forEach(card => {
      const isUnlocked = AppState.unlockedCards.includes(card.id);
      const div = document.createElement('div');
      div.className = `enc-card ${isUnlocked ? 'unlocked' : 'locked'}`;
      div.innerHTML = `
        <div class="enc-emoji">${isUnlocked ? card.emoji : '❓'}</div>
        <div class="enc-title">${isUnlocked ? card.name : `별 ${card.starsNeeded}개 필요`}</div>
      `;

      if (isUnlocked) {
        div.onclick = () => {
          sfx.playTone(700, 'sine', 0.2);
          speakText(`${card.name}! ${card.desc}`);
        };
      }

      grid.appendChild(div);
    });
  },

  // 도감 잠금해제 축하 모달
  showUnlockModal(card) {
    sfx.playFanfare();
    speakText(`축하합니다! 새로운 친구 ${card.name}을 발견했어요! 도감에 등록되었어요!`);

    document.getElementById('unlock-card-emoji').textContent = card.emoji;
    document.getElementById('unlock-card-name').textContent = card.name;
    document.getElementById('unlock-card-desc').textContent = card.desc;
    document.getElementById('modal-unlock').classList.remove('hidden');
  },

  // 모국어 힌트 모달 열기
  showHintModal() {
    const stageObj = QUIZ_STAGES[AppState.currentStageIdx];
    if (!stageObj) return;

    let q;
    if (stageObj.type === 'word_match') {
      const themeQuestions = stageObj.questions[AppState.theme] || stageObj.questions['dino'];
      q = themeQuestions[AppState.currentQuestionIdx];
    } else {
      q = stageObj.questions[AppState.currentQuestionIdx];
    }

    if (!q) return;

    const targetWord = q.targetWord || q.answer;
    const translations = MULTI_LANG_DICT[targetWord] || {
      vi: targetWord,
      zh: targetWord,
      en: targetWord,
      ru: targetWord
    };

    document.getElementById('hint-target-word').textContent = `단어: ${targetWord}`;
    const list = document.getElementById('hint-translations-container');
    list.innerHTML = `
      <div class="hint-lang-item">
        <span>🇻🇳 베트남어: <strong>${translations.vi || '-'}</strong></span>
        <button class="btn-sound-play" onclick="speakText('${translations.vi}', 'vi-VN')">🔊</button>
      </div>
      <div class="hint-lang-item">
        <span>🇨🇳 중국어: <strong>${translations.zh || '-'}</strong></span>
        <button class="btn-sound-play" onclick="speakText('${translations.zh}', 'zh-CN')">🔊</button>
      </div>
      <div class="hint-lang-item">
        <span>🇵🇭 필리핀/영어: <strong>${translations.en || '-'}</strong></span>
        <button class="btn-sound-play" onclick="speakText('${translations.en}', 'en-US')">🔊</button>
      </div>
      <div class="hint-lang-item">
        <span>🇷🇺 러시아어: <strong>${translations.ru || '-'}</strong></span>
        <button class="btn-sound-play" onclick="speakText('${translations.ru}', 'ru-RU')">🔊</button>
      </div>
    `;

    document.getElementById('modal-hint').classList.remove('hidden');
  }
};

// ==========================================
// 6. 이벤트 리스너 및 초기 부팅
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  AppState.load();
  UI.updateHeader();

  // 1) 시작 화면 아바타 선택
  document.querySelectorAll('.avatar-opt').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.avatar-opt').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      AppState.avatar = btn.getAttribute('data-avatar');
      sfx.playTone(550, 'sine', 0.1);
    };
  });

  // 2) 탐험 시작 버튼
  document.getElementById('btn-start-adventure').onclick = () => {
    sfx.playSuccess();
    const nickname = document.getElementById('nickname-input').value.trim();
    if (nickname) AppState.nickname = nickname;
    AppState.save();
    UI.updateHeader();

    speakText(`반가워요, ${AppState.nickname}! 모으고 싶은 도감을 골라보세요.`);
    UI.switchView('theme');
  };

  // 3) 테마 선택
  document.querySelectorAll('.theme-card').forEach(card => {
    card.onclick = () => {
      sfx.playSuccess();
      AppState.theme = card.getAttribute('data-theme');
      AppState.save();

      const themeNames = {
        dino: '쥐라기 공룡 세계',
        animal: '신비한 동물원',
        insect: '숲속 곤충 탐험',
        flower: '알록달록 꽃과 식물'
      };
      speakText(`${themeNames[AppState.theme]}로 출발합니다!`);

      UI.switchView('quest');
      UI.renderCurrentQuestion();
    };
  });

  // 4) 헤더 버튼 (도감 보기 / 힌트)
  document.getElementById('btn-open-encyclopedia').onclick = () => {
    sfx.playTone(500, 'sine', 0.15);
    UI.switchView('encyclopedia');
    UI.renderEncyclopedia();
  };

  document.getElementById('btn-close-encyclopedia').onclick = () => {
    sfx.playTone(400, 'sine', 0.15);
    UI.switchView('quest');
    UI.renderCurrentQuestion();
  };

  document.getElementById('btn-open-hint').onclick = () => {
    sfx.playTone(600, 'sine', 0.15);
    UI.showHintModal();
  };

  document.getElementById('btn-close-hint').onclick = () => {
    document.getElementById('modal-hint').classList.add('hidden');
  };

  document.getElementById('btn-close-unlock').onclick = () => {
    document.getElementById('modal-unlock').classList.add('hidden');
  };
});
