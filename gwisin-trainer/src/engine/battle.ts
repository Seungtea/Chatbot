import { Move, SpiritInstance, TYPE_ADVANTAGES } from '../data/spirits';

export type BattlePhase =
  | 'start'
  | 'player_turn'
  | 'player_attack'
  | 'enemy_turn'
  | 'capturing'
  | 'captured'
  | 'fled'
  | 'victory'
  | 'defeat';

export interface BattleLog {
  text: string;
  color?: string;
}

export class BattleEngine {
  public playerSpirit: SpiritInstance;
  public enemySpirit: SpiritInstance;
  public isTrainerBattle: boolean;
  public opponentName: string;
  public phase: BattlePhase;
  public logs: BattleLog[];
  public spiritBeadCount: number;

  constructor(
    playerSpirit: SpiritInstance,
    enemySpirit: SpiritInstance,
    isTrainerBattle: boolean = false,
    opponentName: string = '야생 신령',
    spiritBeadCount: number = 5
  ) {
    this.playerSpirit = playerSpirit;
    this.enemySpirit = enemySpirit;
    this.isTrainerBattle = isTrainerBattle;
    this.opponentName = opponentName;
    this.phase = 'start';
    this.logs = [];
    this.spiritBeadCount = spiritBeadCount;

    if (isTrainerBattle) {
      this.addLog(`${opponentName}(이)가 승부를 걸어왔다!`, '#f1c40f');
    } else {
      this.addLog(`야생의 ${enemySpirit.name}(이)가 나타났다!`, '#e67e22');
    }
  }

  public addLog(text: string, color?: string) {
    this.logs.push({ text, color });
    if (this.logs.length > 8) {
      this.logs.shift();
    }
  }

  // Damage calculation formula
  public calculateDamage(attacker: SpiritInstance, defender: SpiritInstance, move: Move): {
    damage: number;
    multiplier: number;
    isCritical: boolean;
  } {
    if (move.power === 0) {
      return { damage: 0, multiplier: 1, isCritical: false };
    }

    const levelFactor = (2 * attacker.level) / 5 + 2;
    const atkDefRatio = attacker.atk / Math.max(1, defender.def);
    const baseDamage = ((levelFactor * move.power * atkDefRatio) / 50) + 2;

    // Type advantage multiplier
    const multiplier = TYPE_ADVANTAGES[move.type]?.[defender.type] || 1.0;

    // Critical hit chance (10%)
    const isCritical = Math.random() < 0.10;
    const critMult = isCritical ? 1.5 : 1.0;

    // Random variance (0.85 ~ 1.0)
    const random = 0.85 + Math.random() * 0.15;

    const damage = Math.max(1, Math.floor(baseDamage * multiplier * critMult * random));

    return { damage, multiplier, isCritical };
  }

  // Player Attack Skill Action
  public executePlayerMove(moveIndex: number) {
    if (this.phase !== 'player_turn' && this.phase !== 'start') return;

    const move = this.playerSpirit.moves[moveIndex];
    if (!move) return;

    this.addLog(`${this.playerSpirit.name}의 '${move.name}'!`, '#3498db');

    // Accuracy Roll
    if (Math.random() * 100 > move.accuracy) {
      this.addLog(`공격이 빗나갔다!`, '#95a5a6');
      this.startEnemyTurn();
      return;
    }

    if (move.category === 'heal') {
      const healAmount = Math.floor(this.playerSpirit.maxHp * 0.35);
      this.playerSpirit.hp = Math.min(this.playerSpirit.maxHp, this.playerSpirit.hp + healAmount);
      this.addLog(`${this.playerSpirit.name}의 HP가 ${healAmount} 회복되었다!`, '#2ecc71');
      this.startEnemyTurn();
      return;
    }

    if (move.category === 'buff') {
      this.playerSpirit.def = Math.floor(this.playerSpirit.def * 1.25);
      this.addLog(`${this.playerSpirit.name}의 방어력이 상승했다!`, '#f1c40f');
      this.startEnemyTurn();
      return;
    }

    // Damage Attack
    const { damage, multiplier, isCritical } = this.calculateDamage(this.playerSpirit, this.enemySpirit, move);
    this.enemySpirit.hp = Math.max(0, this.enemySpirit.hp - damage);

    if (isCritical) {
      this.addLog(`급소에 맞았다!`, '#e74c3c');
    }
    if (multiplier > 1.0) {
      this.addLog(`효과가 뛰어났다! (${multiplier}배)`, '#e67e22');
    } else if (multiplier < 1.0) {
      this.addLog(`효과가 별로인 듯하다... (${multiplier}배)`, '#95a5a6');
    }

    this.addLog(`${this.enemySpirit.name}에게 ${damage} 대미지!`);

    if (this.enemySpirit.hp <= 0) {
      this.addLog(`${this.enemySpirit.name}(이)가 쓰러졌다!`, '#2ecc71');
      this.phase = 'victory';
      return;
    }

    this.startEnemyTurn();
  }

  // Enemy AI Turn Action
  public startEnemyTurn() {
    this.phase = 'enemy_turn';

    setTimeout(() => {
      if (this.enemySpirit.hp <= 0) return;

      // Enemy selects random move
      const availableMoves = this.enemySpirit.moves;
      const move = availableMoves[Math.floor(Math.random() * availableMoves.length)];

      this.addLog(`상대 ${this.enemySpirit.name}의 '${move.name}'!`, '#e74c3c');

      if (Math.random() * 100 > move.accuracy) {
        this.addLog(`상대의 공격이 빗나갔다!`, '#95a5a6');
        this.phase = 'player_turn';
        return;
      }

      if (move.category === 'heal') {
        const healAmount = Math.floor(this.enemySpirit.maxHp * 0.3);
        this.enemySpirit.hp = Math.min(this.enemySpirit.maxHp, this.enemySpirit.hp + healAmount);
        this.addLog(`상대의 HP가 ${healAmount} 회복되었다!`, '#2ecc71');
        this.phase = 'player_turn';
        return;
      }

      const { damage, multiplier, isCritical } = this.calculateDamage(this.enemySpirit, this.playerSpirit, move);
      this.playerSpirit.hp = Math.max(0, this.playerSpirit.hp - damage);

      if (isCritical) {
        this.addLog(`급소에 맞았다!`, '#e74c3c');
      }
      if (multiplier > 1.0) {
        this.addLog(`효과가 뛰어났다!`, '#e67e22');
      }

      this.addLog(`${this.playerSpirit.name}에게 ${damage} 대미지!`);

      if (this.playerSpirit.hp <= 0) {
        this.addLog(`${this.playerSpirit.name}(이)가 기절했다...`, '#e74c3c');
        this.phase = 'defeat';
        return;
      }

      this.phase = 'player_turn';
    }, 600);
  }

  // Spirit Bead Capture Action (영혼구슬 봉인)
  public attemptCapture(): boolean {
    if (this.isTrainerBattle) {
      this.addLog(`트레이너의 신령은 봉인할 수 없다!`, '#e74c3c');
      return false;
    }

    if (this.spiritBeadCount <= 0) {
      this.addLog(`영혼구슬이 부족하다!`, '#e74c3c');
      return false;
    }

    this.spiritBeadCount--;
    this.phase = 'capturing';
    this.addLog(`영혼구슬을 던졌다!`, '#3498db');

    const hpRatio = this.enemySpirit.hp / this.enemySpirit.maxHp;
    // Lower remaining HP gives higher catch probability
    const catchRate = Math.max(0.35, (1.0 - hpRatio) * 0.85 + 0.15);

    if (Math.random() < catchRate) {
      setTimeout(() => {
        this.addLog(`성공! ${this.enemySpirit.name}(을)를 봉인해 동료로 삼았다!`, '#2ecc71');
        this.phase = 'captured';
      }, 700);
      return true;
    } else {
      setTimeout(() => {
        this.addLog(`${this.enemySpirit.name}(이)가 구슬을 튀겨냈다!`, '#e74c3c');
        this.startEnemyTurn();
      }, 700);
      return false;
    }
  }

  // Flee Action
  public attemptRun(): boolean {
    if (this.isTrainerBattle) {
      this.addLog(`승부 중에는 도망칠 수 없다!`, '#e74c3c');
      return false;
    }

    this.addLog(`성공적으로 도망쳤다!`, '#3498db');
    this.phase = 'fled';
    return true;
  }
}
