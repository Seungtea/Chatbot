export interface Item {
  id: string;
  name: string;
  count: number;
  description: string;
  price: number;
  icon: string;
}

export function createDefaultInventory(): Record<string, Item> {
  return {
    spirit_bead: {
      id: 'spirit_bead',
      name: '영혼구슬',
      count: 10,
      description: '야생 신령의 기운을 다스려 봉인하는 구슬.',
      price: 100,
      icon: '🔮',
    },
    spirit_herb: {
      id: 'spirit_herb',
      name: '영혼약초',
      count: 5,
      description: '신령의 상처를 달래며 HP 50을 회복시킨다.',
      price: 150,
      icon: '🌿',
    },
    deity_dew: {
      id: 'deity_dew',
      name: '신령이슬',
      count: 2,
      description: '아침 이슬로 신령의 모든 HP를 완벽히 회복시킨다.',
      price: 400,
      icon: '💧',
    },
  };
}
