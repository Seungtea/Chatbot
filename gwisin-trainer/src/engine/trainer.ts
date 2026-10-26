import { SPIRITS_DB, SpiritInstance, createSpiritInstance } from '../data/spirits';
import { Item, createDefaultInventory } from '../data/inventory';

export class TrainerEngine {
  public name: string;
  public money: number;
  public team: SpiritInstance[];
  public box: SpiritInstance[];
  public dex: Record<string, { seen: boolean; caught: boolean }>;
  public inventory: Record<string, Item>;
  public badges: string[];

  constructor(name: string = '민우 (한국 학생)') {
    this.name = name;
    this.money = 500;
    this.team = [];
    this.box = [];
    this.dex = {};
    this.inventory = createDefaultInventory();
    this.badges = [];

    // Starter spirit: 쌀신 (Rice Deity - Level 5)
    const starter = createSpiritInstance('ssal_sin', 5);
    this.addSpirit(starter);

    // Initialize Gwisin-dex entries
    Object.keys(SPIRITS_DB).forEach((id) => {
      this.dex[id] = { seen: id === 'ssal_sin', caught: id === 'ssal_sin' };
    });
  }

  public getActiveSpirit(): SpiritInstance {
    return this.team.find((s) => s.hp > 0) || this.team[0];
  }

  public addSpirit(spirit: SpiritInstance): boolean {
    if (this.dex[spirit.templateId]) {
      this.dex[spirit.templateId].seen = true;
      this.dex[spirit.templateId].caught = true;
    }

    if (this.team.length < 6) {
      this.team.push(spirit);
      return true; // Added to team
    } else {
      this.box.push(spirit);
      return false; // Stored in Spirit Box
    }
  }

  public markSeen(templateId: string) {
    if (this.dex[templateId]) {
      this.dex[templateId].seen = true;
    }
  }

  public healAllSpirits() {
    this.team.forEach((spirit) => {
      spirit.hp = spirit.maxHp;
    });
  }

  public addExp(spirit: SpiritInstance, amount: number): { levelUp: boolean; newLevel: number } {
    spirit.exp += amount;
    let levelUp = false;

    while (spirit.exp >= spirit.maxExp) {
      spirit.exp -= spirit.maxExp;
      spirit.level++;
      spirit.maxExp = spirit.level * 50;

      // Stat scaling on level up
      const template = SPIRITS_DB[spirit.templateId];
      if (template) {
        const statMultiplier = 1 + (spirit.level - 1) * 0.18;
        const oldMaxHp = spirit.maxHp;
        spirit.maxHp = Math.floor(template.baseStats.hp * statMultiplier);
        spirit.hp += (spirit.maxHp - oldMaxHp); // gain increased HP
        spirit.atk = Math.floor(template.baseStats.atk * statMultiplier);
        spirit.def = Math.floor(template.baseStats.def * statMultiplier);
        spirit.spd = Math.floor(template.baseStats.spd * statMultiplier);
      }
      levelUp = true;
    }

    return { levelUp, newLevel: spirit.level };
  }

  public swapLeader(index: number) {
    if (index > 0 && index < this.team.length) {
      const temp = this.team[0];
      this.team[0] = this.team[index];
      this.team[index] = temp;
    }
  }

  public useHerb(spiritIndex: number): boolean {
    const herb = this.inventory['spirit_herb'];
    const spirit = this.team[spiritIndex];
    if (herb && herb.count > 0 && spirit && spirit.hp < spirit.maxHp) {
      herb.count--;
      spirit.hp = Math.min(spirit.maxHp, spirit.hp + 50);
      return true;
    }
    return false;
  }
}
