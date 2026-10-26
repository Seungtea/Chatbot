export interface NPC {
  id: string;
  name: string;
  x: number;
  y: number;
  spriteColor: string;
  dialogue: string[];
  isTrainer?: boolean;
  trainerName?: string;
  spiritTemplateId?: string;
  spiritLevel?: number;
  defeated?: boolean;
  isHealer?: boolean;
}

export interface MapData {
  id: string;
  name: string;
  width: number;
  height: number;
  tiles: number[][]; // 0: grass, 1: path, 2: tall grass (wild encounter), 3: wall, 4: water, 5: tree, 6: shrine
  npcs: NPC[];
  wildSpirits: { spiritId: string; levelMin: number; levelMax: number }[];
  connections: {
    direction: 'up' | 'down' | 'left' | 'right';
    targetMapId: string;
    targetX: number;
    targetY: number;
  }[];
}

export const MAPS: Record<string, MapData> = {
  town: {
    id: 'town',
    name: '한빛 마을 & 학교 앞',
    width: 14,
    height: 12,
    tiles: [
      [3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3],
      [3, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 3],
      [3, 0, 6, 6, 0, 0, 1, 1, 0, 3, 3, 3, 0, 3],
      [3, 0, 6, 6, 0, 0, 1, 1, 0, 3, 3, 3, 0, 3],
      [3, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 3],
      [3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3],
      [3, 0, 2, 2, 0, 0, 1, 1, 0, 2, 2, 2, 0, 3],
      [3, 0, 2, 2, 0, 0, 1, 1, 0, 2, 2, 2, 0, 3],
      [3, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 3],
      [3, 4, 4, 4, 0, 0, 1, 1, 0, 0, 5, 5, 0, 3],
      [3, 4, 4, 4, 0, 0, 1, 1, 0, 0, 5, 5, 0, 3],
      [3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3],
    ],
    npcs: [
      {
        id: 'healer_halmoni',
        name: '할머니',
        x: 2,
        y: 4,
        spriteColor: '#e74c3c',
        dialogue: [
          '안녕, 어린 신령 트레이너야!',
          '신령들은 마음에 따라 온순해지기도 간단다.',
          '너와 신령들의 기운을 깨끗이 다스려주마!',
        ],
        isHealer: true,
      },
      {
        id: 'rival_cheolsu',
        name: '라이벌 철수',
        x: 10,
        y: 4,
        spriteColor: '#f1c40f',
        dialogue: [
          '나도 최고 신령 트레이너가 될 거라구!',
          '승부를 겨뤄볼까?',
        ],
        isTrainer: true,
        trainerName: '학생 철수',
        spiritTemplateId: 'seongju_sin',
        spiritLevel: 4,
      },
      {
        id: 'guide_student',
        name: '영희',
        x: 4,
        y: 8,
        spriteColor: '#9b59b6',
        dialogue: [
          '키가 큰 풀숲(초록색 짙은 풀)을 걸으면',
          '야생 신령들이 나타나!',
          '영혼구슬(Spirit Bead)로 신령을 봉인해서 동료로 삼아봐!',
        ],
      },
    ],
    wildSpirits: [
      { spiritId: 'ssal_sin', levelMin: 2, levelMax: 4 },
      { spiritId: 'seongju_sin', levelMin: 2, levelMax: 4 },
      { spiritId: 'gureum_sin', levelMin: 3, levelMax: 5 },
    ],
    connections: [
      { direction: 'up', targetMapId: 'forest', targetX: 6, targetY: 10 },
      { direction: 'down', targetMapId: 'shrine', targetX: 6, targetY: 1 },
    ],
  },

  forest: {
    id: 'forest',
    name: '신비의 신령 숲',
    width: 14,
    height: 12,
    tiles: [
      [3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3],
      [3, 2, 2, 5, 2, 2, 1, 1, 2, 2, 5, 2, 2, 3],
      [3, 2, 2, 5, 2, 2, 1, 1, 2, 2, 5, 2, 2, 3],
      [3, 5, 5, 5, 0, 0, 1, 1, 0, 0, 5, 5, 5, 3],
      [3, 2, 2, 2, 0, 0, 1, 1, 0, 0, 2, 2, 2, 3],
      [3, 2, 2, 2, 1, 1, 1, 1, 1, 1, 2, 2, 2, 3],
      [3, 5, 5, 0, 1, 0, 0, 0, 0, 1, 0, 5, 5, 3],
      [3, 2, 2, 0, 1, 2, 2, 2, 2, 1, 0, 2, 2, 3],
      [3, 2, 2, 0, 1, 2, 2, 2, 2, 1, 0, 2, 2, 3],
      [3, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 3],
      [3, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 3],
      [3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3],
    ],
    npcs: [
      {
        id: 'forest_trainer',
        name: '마을 산길지기',
        x: 8,
        y: 6,
        spriteColor: '#2ecc71',
        dialogue: [
          '이 깊은 숲속엔 도깨비와 샘물신이 살고 있다네!',
          '실력을 보여주게나!',
        ],
        isTrainer: true,
        trainerName: '산길지기',
        spiritTemplateId: 'dokkaebi',
        spiritLevel: 7,
      },
    ],
    wildSpirits: [
      { spiritId: 'bawi_sin', levelMin: 5, levelMax: 8 },
      { spiritId: 'saemmul_sin', levelMin: 5, levelMax: 8 },
      { spiritId: 'dokkaebi', levelMin: 6, levelMax: 9 },
      { spiritId: 'baram_sin', levelMin: 6, levelMax: 9 },
      { spiritId: 'cheokgan_sin', levelMin: 5, levelMax: 8 },
    ],
    connections: [
      { direction: 'up', targetMapId: 'shrine', targetX: 6, targetY: 10 },
      { direction: 'down', targetMapId: 'town', targetX: 6, targetY: 1 },
    ],
  },

  shrine: {
    id: 'shrine',
    name: '천상 신령 사당',
    width: 14,
    height: 12,
    tiles: [
      [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      [3, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 3],
      [3, 6, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 6, 3],
      [3, 6, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 6, 3],
      [3, 6, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 6, 3],
      [3, 6, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 6, 3],
      [3, 6, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 6, 3],
      [3, 6, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 6, 3],
      [3, 6, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 6, 3],
      [3, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 3],
      [3, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 3],
      [3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3],
    ],
    npcs: [
      {
        id: 'grand_master',
        name: '강림도령 (최고 신령 마스터)',
        x: 6,
        y: 2,
        spriteColor: '#e74c3c',
        dialogue: [
          '어서오게! 최고 신령 트레이너를 꿈꾸는 한국의 학생이여!',
          '나는 천상 사당을 지키는 강림도령이다.',
          '나의 전설 신령과 겨루어 최고의 자격을 증명하여라!',
        ],
        isTrainer: true,
        trainerName: '마스터 강림도령',
        spiritTemplateId: 'samsin_halmoni',
        spiritLevel: 12,
      },
      {
        id: 'dalbit_keeper',
        name: '달빛 수호자',
        x: 3,
        y: 5,
        spriteColor: '#f39c12',
        dialogue: [
          '이 사당 주변엔 정월 달빛신이 함께 살아가고 있단다.',
        ],
        isTrainer: true,
        trainerName: '달빛 수호자',
        spiritTemplateId: 'dalbit_sin',
        spiritLevel: 10,
      },
    ],
    wildSpirits: [
      { spiritId: 'dalbit_sin', levelMin: 8, levelMax: 12 },
      { spiritId: 'samsin_halmoni', levelMin: 10, levelMax: 12 },
    ],
    connections: [
      { direction: 'down', targetMapId: 'forest', targetX: 6, targetY: 1 },
      { direction: 'up', targetMapId: 'town', targetX: 6, targetY: 10 },
    ],
  },
};
