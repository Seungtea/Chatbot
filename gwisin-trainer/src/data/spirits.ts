export type ElementType = 'Light' | 'Earth' | 'Water' | 'Fire' | 'Wind' | 'Dark' | 'Mystic';

export interface Move {
  id: string;
  name: string;
  type: ElementType;
  power: number;
  accuracy: number;
  category: 'damage' | 'heal' | 'buff' | 'debuff';
  description: string;
}

export interface SpiritTemplate {
  id: string;
  name: string;
  title: string;
  type: ElementType;
  baseStats: {
    hp: number;
    atk: number;
    def: number;
    spd: number;
  };
  moves: Move[];
  description: string;
  themeColor: string;
  iconSymbol: string;
  isLegendary?: boolean;
}

export interface SpiritInstance {
  uid: string;
  templateId: string;
  name: string;
  title: string;
  type: ElementType;
  level: number;
  exp: number;
  maxExp: number;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  spd: number;
  moves: Move[];
  themeColor: string;
  iconSymbol: string;
  description: string;
}

// Element Type Advantage Matrix
export const TYPE_ADVANTAGES: Record<ElementType, Record<ElementType, number>> = {
  Light: { Dark: 1.5, Mystic: 0.75, Light: 1.0, Earth: 1.0, Water: 1.0, Fire: 1.0, Wind: 1.0 },
  Dark: { Mystic: 1.5, Light: 0.75, Dark: 1.0, Earth: 1.0, Water: 1.0, Fire: 1.0, Wind: 1.0 },
  Mystic: { Light: 1.5, Dark: 0.75, Mystic: 1.0, Earth: 1.0, Water: 1.0, Fire: 1.0, Wind: 1.0 },
  Fire: { Wind: 1.5, Water: 0.75, Fire: 1.0, Earth: 1.0, Light: 1.0, Dark: 1.0, Mystic: 1.0 },
  Wind: { Earth: 1.5, Fire: 0.75, Wind: 1.0, Water: 1.0, Light: 1.0, Dark: 1.0, Mystic: 1.0 },
  Earth: { Water: 1.5, Wind: 0.75, Earth: 1.0, Fire: 1.0, Light: 1.0, Dark: 1.0, Mystic: 1.0 },
  Water: { Fire: 1.5, Earth: 0.75, Water: 1.0, Wind: 1.0, Light: 1.0, Dark: 1.0, Mystic: 1.0 },
};

// Skill Database
export const MOVES_DB: Record<string, Move> = {
  // Light
  rice_strike: { id: 'rice_strike', name: '벼이삭 치기', type: 'Light', power: 35, accuracy: 95, category: 'damage', description: '벼이삭으로 가볍게 후려친다.' },
  blessing_light: { id: 'blessing_light', name: '풍년의 빛', type: 'Light', power: 0, accuracy: 100, category: 'heal', description: '자신의 체력을 30% 회복한다.' },
  sun_slash: { id: 'sun_slash', name: '햇살 베기', type: 'Light', power: 55, accuracy: 90, category: 'damage', description: '따뜻하지만 강렬한 햇살로 공격한다.' },
  rice_bomb: { id: 'rice_bomb', name: '쌀알 폭탄', type: 'Light', power: 75, accuracy: 85, category: 'damage', description: '거대한 쌀알 에너지탄을 터뜨린다.' },

  // Earth
  tile_throw: { id: 'tile_throw', name: '기와 던지기', type: 'Earth', power: 40, accuracy: 90, category: 'damage', description: '단단한 단청 기와를 날린다.' },
  harden: { id: 'harden', name: '단단해지기', type: 'Earth', power: 0, accuracy: 100, category: 'buff', description: '방어력을 상승시킨다.' },
  beam_cannon: { id: 'beam_cannon', name: '대들보 대포', type: 'Earth', power: 65, accuracy: 85, category: 'damage', description: '묵직한 대들보 기둥으로 찍어내린다.' },
  house_guard: { id: 'house_guard', name: '집안 가호', type: 'Earth', power: 0, accuracy: 100, category: 'heal', description: '집안의 기운으로 HP를 회복한다.' },

  rock_throw: { id: 'rock_throw', name: '돌멩이 날리기', type: 'Earth', power: 30, accuracy: 95, category: 'damage', description: '작은 돌멩이를 빠르게 던진다.' },
  bawi_wall: { id: 'bawi_wall', name: '바위 장벽', type: 'Earth', power: 50, accuracy: 90, category: 'damage', description: '바위 장벽을 일으켜 피해를 준다.' },
  earthquake: { id: 'earthquake', name: '지진파', type: 'Earth', power: 80, accuracy: 80, category: 'damage', description: '땅을 강하게 울려 대미지를 준다.' },

  // Wind
  cloud_wind: { id: 'cloud_wind', name: '구름 바람', type: 'Wind', power: 35, accuracy: 95, category: 'damage', description: '부드러운 바람으로 적을 공격한다.' },
  mist_shroud: { id: 'mist_shroud', name: '안개 가리기', type: 'Wind', power: 0, accuracy: 100, category: 'buff', description: '회피율을 높인다.' },
  lightning_cloud: { id: 'lightning_cloud', name: '먹구름 번개', type: 'Wind', power: 70, accuracy: 85, category: 'damage', description: '먹구름에서 번개를 내리친다.' },
  blade_wind: { id: 'blade_wind', name: '칼바람', type: 'Wind', power: 45, accuracy: 95, category: 'damage', description: '날카로운 바람 칼날을 날린다.' },
  tornado: { id: 'tornado', name: '회오리바람', type: 'Wind', power: 75, accuracy: 85, category: 'damage', description: '거대한 회오리바람을 일으킨다.' },

  // Water
  water_gun: { id: 'water_gun', name: '물대포', type: 'Water', power: 40, accuracy: 95, category: 'damage', description: '시원한 줄기의 물을 발사한다.' },
  pure_water: { id: 'pure_water', name: '맑은 물 회복', type: 'Water', power: 0, accuracy: 100, category: 'heal', description: '깨끗한 옹달샘 물로 HP를 회복한다.' },
  bubble_wave: { id: 'bubble_wave', name: '거품 물결', type: 'Water', power: 60, accuracy: 90, category: 'damage', description: '신비한 거품 물결로 쓸어버린다.' },
  waterfall_strike: { id: 'waterfall_strike', name: '폭포수 강타', type: 'Water', power: 80, accuracy: 85, category: 'damage', description: '거친 폭포수 물줄기를 떨어뜨린다.' },

  // Fire
  dok_fire: { id: 'dok_fire', name: '도깨비불', type: 'Fire', power: 45, accuracy: 90, category: 'damage', description: '청록색 도깨비불을 날린다.' },
  club_smash: { id: 'club_smash', name: '방망이 후려치기', type: 'Fire', power: 60, accuracy: 85, category: 'damage', description: '도깨비 방망이로 세게 친다.' },
  mischief: { id: 'mischief', name: '장난치기', type: 'Fire', power: 35, accuracy: 100, category: 'debuff', description: '적을 혼란에 빠뜨린다.' },
  dok_hat: { id: 'dok_hat', name: '도깨비 감투', type: 'Fire', power: 85, accuracy: 80, category: 'damage', description: '투명해져서 적의 빈틈을 불꽃으로 타격한다.' },

  // Dark
  stink_bomb: { id: 'stink_bomb', name: '악취 공격', type: 'Dark', power: 35, accuracy: 95, category: 'damage', description: '고약한 냄새로 적을 괴롭힌다.' },
  hair_bind: { id: 'hair_bind', name: '머리카락 휘감기', type: 'Dark', power: 50, accuracy: 90, category: 'damage', description: '긴 머리카락으로 적을 조인다.' },
  spooky_gaze: { id: 'spooky_gaze', name: '으스스 시선', type: 'Dark', power: 65, accuracy: 85, category: 'damage', description: '어둠 속 시선으로 정신적 대미지를 준다.' },

  // Mystic
  moon_beam: { id: 'moon_beam', name: '달빛 빔', type: 'Mystic', power: 50, accuracy: 90, category: 'damage', description: '은은한 달빛의 광선을 쏜다.' },
  glowing_powder: { id: 'glowing_powder', name: '야광 가루', type: 'Mystic', power: 0, accuracy: 100, category: 'buff', description: '신비로운 빛으로 자신을 보호한다.' },
  illusion_wave: { id: 'illusion_wave', name: '환상 파동', type: 'Mystic', power: 75, accuracy: 85, category: 'damage', description: '환상의 파동을 일으켜 타격한다.' },
  samsin_blessing: { id: 'samsin_blessing', name: '생명의 축복', type: 'Mystic', power: 0, accuracy: 100, category: 'heal', description: '천상의 기운으로 아군의 HP를 대폭 회복한다.' },
  samsin_wrath: { id: 'samsin_wrath', name: '신령의 노여움', type: 'Mystic', power: 90, accuracy: 80, category: 'damage', description: '강력한 신령의 분노로 큰 피해를 준다.' },
};

// Spirit Templates Database
export const SPIRITS_DB: Record<string, SpiritTemplate> = {
  ssal_sin: {
    id: 'ssal_sin',
    name: '쌀신',
    title: '풍요의 쌀신령',
    type: 'Light',
    baseStats: { hp: 45, atk: 12, def: 10, spd: 11 },
    moves: [MOVES_DB.rice_strike, MOVES_DB.blessing_light, MOVES_DB.sun_slash, MOVES_DB.rice_bomb],
    description: '풍요와 따뜻함을 선사하는 벼의 신령. 온순하지만 소중한 이를 위해 진심을 다한다.',
    themeColor: '#f1c40f',
    iconSymbol: '🌾',
  },
  seongju_sin: {
    id: 'seongju_sin',
    name: '성주신',
    title: '가옥의 수호신',
    type: 'Earth',
    baseStats: { hp: 55, atk: 11, def: 15, spd: 8 },
    moves: [MOVES_DB.tile_throw, MOVES_DB.harden, MOVES_DB.beam_cannon, MOVES_DB.house_guard],
    description: '집안의 안녕과 평화를 지키는 대표적인 가호 신령. 방어력이 일품이다.',
    themeColor: '#e67e22',
    iconSymbol: '🏠',
  },
  gureum_sin: {
    id: 'gureum_sin',
    name: '구름신',
    title: '하늘 유랑신',
    type: 'Wind',
    baseStats: { hp: 40, atk: 13, def: 8, spd: 14 },
    moves: [MOVES_DB.cloud_wind, MOVES_DB.mist_shroud, MOVES_DB.lightning_cloud],
    description: '맑은 하늘 위를 둥둥 떠다니는 신령. 자유로운 성격에 번개를 유도한다.',
    themeColor: '#3498db',
    iconSymbol: '☁️',
  },
  bawi_sin: {
    id: 'bawi_sin',
    name: '바위신',
    title: '태산의 바위신',
    type: 'Earth',
    baseStats: { hp: 60, atk: 14, def: 18, spd: 6 },
    moves: [MOVES_DB.rock_throw, MOVES_DB.bawi_wall, MOVES_DB.earthquake],
    description: '수천 년 동안 산을 지켜온 신령. 거대하고 묵직한 힘으로 적을 물리친다.',
    themeColor: '#7f8c8d',
    iconSymbol: '🪨',
  },
  saemmul_sin: {
    id: 'saemmul_sin',
    name: '샘물신',
    title: '청량한 옹달샘신',
    type: 'Water',
    baseStats: { hp: 48, atk: 11, def: 11, spd: 12 },
    moves: [MOVES_DB.water_gun, MOVES_DB.pure_water, MOVES_DB.bubble_wave, MOVES_DB.waterfall_strike],
    description: '깊은 숲속 깨끗한 옹달샘을 수호하는 신령. 자비롭고 청량하다.',
    themeColor: '#1abc9c',
    iconSymbol: '💧',
  },
  dokkaebi: {
    id: 'dokkaebi',
    name: '도깨비',
    title: '장난꾸러기 도깨비',
    type: 'Fire',
    baseStats: { hp: 50, atk: 16, def: 9, spd: 13 },
    moves: [MOVES_DB.dok_fire, MOVES_DB.club_smash, MOVES_DB.mischief, MOVES_DB.dok_hat],
    description: '씨름을 좋아하고 금은보화를 뚝딱 만들어내는 장난기 가득한 한국 고유의 신령.',
    themeColor: '#e74c3c',
    iconSymbol: '👹',
  },
  cheokgan_sin: {
    id: 'cheokgan_sin',
    name: '측간신',
    title: '뒷간 수호신',
    type: 'Dark',
    baseStats: { hp: 42, atk: 13, def: 9, spd: 11 },
    moves: [MOVES_DB.stink_bomb, MOVES_DB.hair_bind, MOVES_DB.spooky_gaze],
    description: '뒷간에 머무는 까칠한 신령. 깜짝 놀라게 만들지만 정도 많다.',
    themeColor: '#8e44ad',
    iconSymbol: '🧹',
  },
  baram_sin: {
    id: 'baram_sin',
    name: '바람신',
    title: '질풍의 바람신령',
    type: 'Wind',
    baseStats: { hp: 44, atk: 14, def: 8, spd: 16 },
    moves: [MOVES_DB.blade_wind, MOVES_DB.tornado],
    description: '들판과 계곡을 질주하는 신령. 민첩성이 뛰어나 상대를 기만한다.',
    themeColor: '#2ecc71',
    iconSymbol: '🍃',
  },
  dalbit_sin: {
    id: 'dalbit_sin',
    name: '달빛신',
    title: '은은한 정월달신',
    type: 'Mystic',
    baseStats: { hp: 46, atk: 15, def: 10, spd: 12 },
    moves: [MOVES_DB.moon_beam, MOVES_DB.glowing_powder, MOVES_DB.illusion_wave],
    description: '보름달이 뜨는 밤 은 은은한 빛과 함께 나타나는 신비로운 신령.',
    themeColor: '#f39c12',
    iconSymbol: '🌙',
  },
  samsin_halmoni: {
    id: 'samsin_halmoni',
    name: '삼신할머니',
    title: '전설의 삼신신령',
    type: 'Mystic',
    isLegendary: true,
    baseStats: { hp: 70, atk: 18, def: 16, spd: 15 },
    moves: [MOVES_DB.samsin_blessing, MOVES_DB.samsin_wrath, MOVES_DB.illusion_wave, MOVES_DB.blessing_light],
    description: '생명과 아이들의 건강을 돌보아주는 한국 최고 신령 중 하나.',
    themeColor: '#d35400',
    iconSymbol: '👵',
  },
};

// Helper function to create a unique spirit instance
export function createSpiritInstance(templateId: string, level: number = 5): SpiritInstance {
  const template = SPIRITS_DB[templateId] || SPIRITS_DB['ssal_sin'];
  const statMultiplier = 1 + (level - 1) * 0.18;

  const maxHp = Math.floor(template.baseStats.hp * statMultiplier);
  const atk = Math.floor(template.baseStats.atk * statMultiplier);
  const def = Math.floor(template.baseStats.def * statMultiplier);
  const spd = Math.floor(template.baseStats.spd * statMultiplier);

  return {
    uid: `${templateId}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    templateId: template.id,
    name: template.name,
    title: template.title,
    type: template.type,
    level,
    exp: 0,
    maxExp: level * 50,
    hp: maxHp,
    maxHp,
    atk,
    def,
    spd,
    moves: [...template.moves],
    themeColor: template.themeColor,
    iconSymbol: template.iconSymbol,
    description: template.description,
  };
}
