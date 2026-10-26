import { describe, it, expect } from 'vitest';
import { createSpiritInstance, TYPE_ADVANTAGES } from '../data/spirits';
import { BattleEngine } from '../engine/battle';
import { TrainerEngine } from '../engine/trainer';
import { PlayerEngine } from '../engine/player';

describe('Korean Spirit Database & Instance Factory', () => {
  it('creates spirit instances with scaled stats based on level', () => {
    const ssalLevel5 = createSpiritInstance('ssal_sin', 5);
    const ssalLevel10 = createSpiritInstance('ssal_sin', 10);

    expect(ssalLevel5.name).toBe('쌀신');
    expect(ssalLevel5.level).toBe(5);
    expect(ssalLevel10.level).toBe(10);
    expect(ssalLevel10.maxHp).toBeGreaterThan(ssalLevel5.maxHp);
    expect(ssalLevel10.atk).toBeGreaterThan(ssalLevel5.atk);
  });

  it('verifies elemental type advantages correctly', () => {
    expect(TYPE_ADVANTAGES['Light']['Dark']).toBe(1.5);
    expect(TYPE_ADVANTAGES['Fire']['Wind']).toBe(1.5);
    expect(TYPE_ADVANTAGES['Water']['Fire']).toBe(1.5);
    expect(TYPE_ADVANTAGES['Earth']['Water']).toBe(1.5);
    expect(TYPE_ADVANTAGES['Dark']['Light']).toBe(0.75);
  });
});

describe('Turn-Based Battle Engine Logic', () => {
  it('executes player moves and inflicts damage on enemy spirit', () => {
    const playerSpirit = createSpiritInstance('ssal_sin', 5);
    const enemySpirit = createSpiritInstance('dokkaebi', 5);

    // Ensure a move with 100% accuracy for deterministic testing
    playerSpirit.moves[0] = {
      id: 'test_strike',
      name: '확정 타격',
      type: 'Light',
      power: 40,
      accuracy: 100,
      category: 'damage',
      description: '반드시 맞는다.',
    };

    const battle = new BattleEngine(playerSpirit, enemySpirit, false);
    const initialHp = enemySpirit.hp;
    battle.executePlayerMove(0);

    expect(enemySpirit.hp).toBeLessThan(initialHp);
    expect(battle.logs.length).toBeGreaterThan(0);
  });

  it('prevents capturing trainer spirits', () => {
    const playerSpirit = createSpiritInstance('ssal_sin', 5);
    const enemySpirit = createSpiritInstance('seongju_sin', 5);
    const battle = new BattleEngine(playerSpirit, enemySpirit, true, '학생 철수');

    const success = battle.attemptCapture();
    expect(success).toBe(false);
  });
});

describe('Trainer Progression & Inventory Engine', () => {
  it('adds spirit to trainer team and tracks in Gwisin-dex', () => {
    const trainer = new TrainerEngine('민우');
    expect(trainer.team.length).toBe(1); // Starter 쌀신
    expect(trainer.dex['ssal_sin'].caught).toBe(true);

    const newSpirit = createSpiritInstance('bawi_sin', 6);
    const addedToTeam = trainer.addSpirit(newSpirit);

    expect(addedToTeam).toBe(true);
    expect(trainer.team.length).toBe(2);
    expect(trainer.dex['bawi_sin'].caught).toBe(true);
  });

  it('handles EXP gain and level progression', () => {
    const trainer = new TrainerEngine('민우');
    const spirit = trainer.getActiveSpirit();
    const initialLevel = spirit.level;

    const result = trainer.addExp(spirit, 300);
    expect(result.levelUp).toBe(true);
    expect(spirit.level).toBeGreaterThan(initialLevel);
  });

  it('heals all spirits upon visiting healer NPC', () => {
    const trainer = new TrainerEngine('민우');
    const spirit = trainer.getActiveSpirit();
    spirit.hp = 5; // damaged

    trainer.healAllSpirits();
    expect(spirit.hp).toBe(spirit.maxHp);
  });
});

describe('Player Movement & Overworld Engine', () => {
  it('handles movement and map boundaries', () => {
    const player = new PlayerEngine('town', 6, 8);
    expect(player.state.x).toBe(6);
    expect(player.state.y).toBe(8);

    const result = player.move('right');
    expect(result.moved).toBe(true);
    expect(player.state.x).toBe(7);
  });

  it('blocks movement into wall tile', () => {
    const player = new PlayerEngine('town', 0, 1);
    const result = player.move('left'); // moving towards wall boundary (tile 3)
    expect(result.moved).toBe(false);
  });
});
