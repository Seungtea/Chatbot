import { drawPlayerSprite, drawSpiritSprite, drawTile } from './graphics/sprites';
import { PlayerEngine, Direction } from './engine/player';
import { BattleEngine } from './engine/battle';
import { TrainerEngine } from './engine/trainer';
import { createSpiritInstance, SPIRITS_DB, SpiritInstance } from './data/spirits';
import { sound } from './audio/sound';
import { createEmulatorShell } from './ui/emulator';

const SAVE_KEY = 'GWISIN_TRAINER_SAVE_V1';

export type GameMode = 'overworld' | 'dialogue' | 'battle' | 'menu' | 'dex' | 'team';

class GameApp {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private player: PlayerEngine;
  private trainer: TrainerEngine;
  private battle: BattleEngine | null = null;

  private mode: GameMode = 'overworld';
  private dialogueQueue: string[] = [];
  private dialogueSpeaker: string = '';
  private dialogueCallback?: () => void;

  private menuCursor: number = 0;
  private battleMoveCursor: number = 0;
  private battleActionCursor: number = 0; // 0: Attack, 1: Bead, 2: Run

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 448; // 14 tiles * 32px
    this.canvas.height = 384; // 12 tiles * 32px
    this.ctx = this.canvas.getContext('2d')!;

    this.player = new PlayerEngine('town', 6, 8);
    this.trainer = new TrainerEngine('민우');

    const appDiv = document.getElementById('app');
    if (appDiv) {
      const controls = createEmulatorShell(appDiv, this.canvas);
      this.bindControls(controls);
    }

    this.loadGame();
    this.startLoop();
  }

  private startLoop() {
    const loop = () => {
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  // Handle Input Events
  public handleInput(key: 'up' | 'down' | 'left' | 'right' | 'a' | 'b' | 'menu') {
    sound.playClick();

    if (this.mode === 'overworld') {
      if (key === 'up' || key === 'down' || key === 'left' || key === 'right') {
        const result = this.player.move(key as Direction);
        if (result.talkedNpc) {
          this.startDialogue(result.talkedNpc.name, result.talkedNpc.dialogue, () => {
            if (result.talkedNpc?.isHealer) {
              this.trainer.healAllSpirits();
              sound.playHeal();
              this.showNotification('할머니께서 모든 신령들의 기운을 회복시켜 주셨습니다!');
            } else if (result.talkedNpc?.isTrainer && !result.talkedNpc.defeated) {
              const enemy = createSpiritInstance(
                result.talkedNpc.spiritTemplateId || 'seongju_sin',
                result.talkedNpc.spiritLevel || 5
              );
              const npcRef = result.talkedNpc;
              this.startBattle(enemy, true, result.talkedNpc.trainerName, () => {
                npcRef.defeated = true;
              });
            }
          });
        } else if (result.wildEncounter) {
          const map = this.player.getCurrentMap();
          const wildConfig = map.wildSpirits[Math.floor(Math.random() * map.wildSpirits.length)];
          const lvl = Math.floor(
            wildConfig.levelMin + Math.random() * (wildConfig.levelMax - wildConfig.levelMin + 1)
          );
          const wildSpirit = createSpiritInstance(wildConfig.spiritId, lvl);
          this.startBattle(wildSpirit, false);
        }
      } else if (key === 'a') {
        const npc = this.player.getFacingNPC();
        if (npc) {
          this.startDialogue(npc.name, npc.dialogue, () => {
            if (npc.isHealer) {
              this.trainer.healAllSpirits();
              sound.playHeal();
              this.showNotification('할머니께서 모든 신령들의 기운을 회복시켜 주셨습니다!');
            } else if (npc.isTrainer && !npc.defeated) {
              const enemy = createSpiritInstance(
                npc.spiritTemplateId || 'seongju_sin',
                npc.spiritLevel || 5
              );
              this.startBattle(enemy, true, npc.trainerName, () => {
                npc.defeated = true;
              });
            }
          });
        }
      } else if (key === 'menu') {
        this.mode = 'menu';
        this.menuCursor = 0;
      }
    } else if (this.mode === 'dialogue') {
      if (key === 'a' || key === 'b') {
        this.advanceDialogue();
      }
    } else if (this.mode === 'menu') {
      if (key === 'up') this.menuCursor = (this.menuCursor - 1 + 5) % 5;
      if (key === 'down') this.menuCursor = (this.menuCursor + 1) % 5;
      if (key === 'b') this.mode = 'overworld';
      if (key === 'a') {
        if (this.menuCursor === 0) this.mode = 'team';
        else if (this.menuCursor === 1) this.mode = 'dex';
        else if (this.menuCursor === 2) {
          this.saveGame();
          this.showNotification('게임이 저장되었습니다!');
          this.mode = 'overworld';
        } else if (this.menuCursor === 3) {
          this.loadGame();
          this.showNotification('저장된 데이터를 불러왔습니다!');
          this.mode = 'overworld';
        } else if (this.menuCursor === 4) {
          this.mode = 'overworld';
        }
      }
    } else if (this.mode === 'team' || this.mode === 'dex') {
      if (key === 'b' || key === 'a' || key === 'menu') {
        this.mode = 'overworld';
      }
    } else if (this.mode === 'battle' && this.battle) {
      this.handleBattleInput(key);
    }
  }

  private handleBattleInput(key: string) {
    if (!this.battle) return;

    if (this.battle.phase === 'player_turn' || this.battle.phase === 'start') {
      if (key === 'left' || key === 'right') {
        this.battleActionCursor = (this.battleActionCursor + 1) % 3;
      } else if (key === 'up' || key === 'down') {
        this.battleMoveCursor = (this.battleMoveCursor + 1) % this.battle.playerSpirit.moves.length;
      } else if (key === 'a') {
        if (this.battleActionCursor === 0) {
          // Attack Action
          sound.playAttackHit();
          this.battle.executePlayerMove(this.battleMoveCursor);
        } else if (this.battleActionCursor === 1) {
          // Capture Spirit Bead Action
          const success = this.battle.attemptCapture();
          if (success) {
            sound.playCatchSuccess();
            setTimeout(() => {
              if (this.battle) {
                this.trainer.addSpirit(this.battle.enemySpirit);
                this.endBattle();
              }
            }, 1200);
          }
        } else if (this.battleActionCursor === 2) {
          // Run Action
          const runOk = this.battle.attemptRun();
          if (runOk) {
            setTimeout(() => this.endBattle(), 600);
          }
        }
      }
    } else if (this.battle.phase === 'victory') {
      if (key === 'a' || key === 'b') {
        sound.playVictory();
        const active = this.trainer.getActiveSpirit();
        const expGained = this.battle.enemySpirit.level * 25;
        const res = this.trainer.addExp(active, expGained);
        if (res.levelUp) {
          this.showNotification(`${active.name}의 레벨이 ${res.newLevel}(으)로 상승했습니다!`);
        }
        this.endBattle();
      }
    } else if (this.battle.phase === 'defeat' || this.battle.phase === 'fled') {
      if (key === 'a' || key === 'b') {
        this.endBattle();
      }
    }
  }

  private startBattle(enemy: SpiritInstance, isTrainer: boolean = false, trainerName: string = '', onWin?: () => void) {
    sound.playBattleStart();
    this.battle = new BattleEngine(
      this.trainer.getActiveSpirit(),
      enemy,
      isTrainer,
      trainerName,
      this.trainer.inventory['spirit_bead']?.count || 5
    );
    this.trainer.markSeen(enemy.templateId);
    this.mode = 'battle';
    if (onWin) {
      this.dialogueCallback = onWin;
    }
  }

  private endBattle() {
    if (this.dialogueCallback) {
      this.dialogueCallback();
      this.dialogueCallback = undefined;
    }
    this.battle = null;
    this.mode = 'overworld';
  }

  private startDialogue(speaker: string, lines: string[], onFinish?: () => void) {
    this.dialogueSpeaker = speaker;
    this.dialogueQueue = [...lines];
    this.dialogueCallback = onFinish;
    this.mode = 'dialogue';
  }

  private advanceDialogue() {
    if (this.dialogueQueue.length > 1) {
      this.dialogueQueue.shift();
    } else {
      this.dialogueQueue = [];
      this.mode = 'overworld';
      if (this.dialogueCallback) {
        this.dialogueCallback();
        this.dialogueCallback = undefined;
      }
    }
  }

  private showNotification(msg: string) {
    this.startDialogue('시스템', [msg]);
  }

  // LocalStorage Save & Load
  private saveGame() {
    try {
      const data = {
        player: this.player.state,
        trainer: {
          name: this.trainer.name,
          money: this.trainer.money,
          team: this.trainer.team,
          box: this.trainer.box,
          dex: this.trainer.dex,
          inventory: this.trainer.inventory,
        },
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch {
      console.warn('Failed to save to localStorage');
    }
  }

  private loadGame() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.player) this.player.state = data.player;
        if (data.trainer) {
          this.trainer.name = data.trainer.name;
          this.trainer.money = data.trainer.money;
          this.trainer.team = data.trainer.team;
          this.trainer.box = data.trainer.box;
          this.trainer.dex = data.trainer.dex;
          this.trainer.inventory = data.trainer.inventory;
        }
      }
    } catch {
      console.warn('Failed to load from localStorage');
    }
  }

  // Bind Keyboard & Emulator Buttons
  private bindControls(controls: ReturnType<typeof createEmulatorShell>) {
    // Emulator On-Screen UI Controls
    controls.dpad.up.onclick = () => this.handleInput('up');
    controls.dpad.down.onclick = () => this.handleInput('down');
    controls.dpad.left.onclick = () => this.handleInput('left');
    controls.dpad.right.onclick = () => this.handleInput('right');
    controls.btnA.onclick = () => this.handleInput('a');
    controls.btnB.onclick = () => this.handleInput('b');
    controls.btnMenu.onclick = () => this.handleInput('menu');

    // Physical Keyboard Bindings
    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      if (key === 'arrowup' || key === 'w') this.handleInput('up');
      else if (key === 'arrowdown' || key === 's') this.handleInput('down');
      else if (key === 'arrowleft' || key === 'a') this.handleInput('left');
      else if (key === 'arrowright' || key === 'd') this.handleInput('right');
      else if (key === 'z' || key === 'enter' || key === ' ') this.handleInput('a');
      else if (key === 'x' || key === 'escape') this.handleInput('b');
      else if (key === 'm' || key === 'tab') this.handleInput('menu');
    });
  }

  // Main Canvas Renderer
  private render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.mode === 'overworld' || this.mode === 'dialogue' || this.mode === 'menu' || this.mode === 'team' || this.mode === 'dex') {
      this.renderOverworld();
    }

    if (this.mode === 'dialogue') {
      this.renderDialogueOverlay();
    } else if (this.mode === 'menu') {
      this.renderMenuOverlay();
    } else if (this.mode === 'team') {
      this.renderTeamOverlay();
    } else if (this.mode === 'dex') {
      this.renderDexOverlay();
    } else if (this.mode === 'battle') {
      this.renderBattleScreen();
    }
  }

  private renderOverworld() {
    const map = this.player.getCurrentMap();
    const tileSize = 32;

    // Draw Map Tiles
    for (let r = 0; r < map.height; r++) {
      for (let c = 0; c < map.width; c++) {
        const tileType = map.tiles[r][c];
        drawTile(this.ctx, tileType, c * tileSize, r * tileSize, tileSize);
      }
    }

    // Draw NPCs
    map.npcs.forEach((npc) => {
      this.ctx.fillStyle = npc.spriteColor;
      this.ctx.beginPath();
      this.ctx.arc(npc.x * tileSize + 16, npc.y * tileSize + 16, 12, 0, Math.PI * 2);
      this.ctx.fill();

      // NPC name tag
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 10px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(npc.name.split(' ')[0], npc.x * tileSize + 16, npc.y * tileSize - 2);
    });

    // Draw Player
    drawPlayerSprite(
      this.ctx,
      this.player.state.x * tileSize,
      this.player.state.y * tileSize,
      this.player.state.direction,
      this.player.state.animFrame
    );

    // Draw Map Title Header Banner
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, 24);
    this.ctx.fillStyle = '#f1c40f';
    this.ctx.font = 'bold 12px sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`📍 ${map.name}`, 10, 16);
  }

  private renderDialogueOverlay() {
    const boxY = this.canvas.height - 90;
    this.ctx.fillStyle = 'rgba(20, 24, 30, 0.92)';
    this.ctx.strokeStyle = '#f1c40f';
    this.ctx.lineWidth = 3;
    this.ctx.fillRect(10, boxY, this.canvas.width - 20, 80);
    this.ctx.strokeRect(10, boxY, this.canvas.width - 20, 80);

    // Speaker Name
    this.ctx.fillStyle = '#f39c12';
    this.ctx.font = 'bold 13px sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`[ ${this.dialogueSpeaker} ]`, 22, boxY + 22);

    // Text Content
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '12px sans-serif';
    this.ctx.fillText(this.dialogueQueue[0] || '', 22, boxY + 48);

    this.ctx.fillStyle = '#7ed6df';
    this.ctx.font = 'bold 10px sans-serif';
    this.ctx.textAlign = 'right';
    this.ctx.fillText('▼ [A] 눌러 계속', this.canvas.width - 22, boxY + 68);
  }

  private renderMenuOverlay() {
    this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const menuX = this.canvas.width - 160;
    const menuY = 30;
    this.ctx.fillStyle = '#1e272e';
    this.ctx.strokeStyle = '#3498db';
    this.ctx.lineWidth = 2;
    this.ctx.fillRect(menuX, menuY, 140, 200);
    this.ctx.strokeRect(menuX, menuY, 140, 200);

    const items = ['👥 신령 팀', '📖 신령도감', '💾 저장하기', '📂 불러오기', '❌ 닫기'];
    items.forEach((item, idx) => {
      this.ctx.fillStyle = idx === this.menuCursor ? '#f1c40f' : '#ffffff';
      this.ctx.font = idx === this.menuCursor ? 'bold 13px sans-serif' : '12px sans-serif';
      this.ctx.textAlign = 'left';
      const prefix = idx === this.menuCursor ? '▶ ' : '   ';
      this.ctx.fillText(prefix + item, menuX + 15, menuY + 35 + idx * 32);
    });
  }

  private renderTeamOverlay() {
    this.ctx.fillStyle = '#1e272e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#f1c40f';
    this.ctx.font = 'bold 16px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`👥 ${this.trainer.name}의 신령 팀`, this.canvas.width / 2, 30);

    this.trainer.team.forEach((spirit, idx) => {
      const cardY = 50 + idx * 52;
      this.ctx.fillStyle = '#2d3436';
      this.ctx.strokeStyle = spirit.themeColor;
      this.ctx.lineWidth = 2;
      this.ctx.fillRect(20, cardY, this.canvas.width - 40, 46);
      this.ctx.strokeRect(20, cardY, this.canvas.width - 40, 46);

      this.ctx.fillStyle = spirit.themeColor;
      this.ctx.font = 'bold 14px sans-serif';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(`${spirit.iconSymbol} ${spirit.name} (Lv.${spirit.level})`, 32, cardY + 22);

      this.ctx.fillStyle = '#aaa';
      this.ctx.font = '11px sans-serif';
      this.ctx.fillText(`속성: ${spirit.type} | HP: ${spirit.hp}/${spirit.maxHp} | ATK:${spirit.atk} DEF:${spirit.def}`, 32, cardY + 38);
    });

    this.ctx.fillStyle = '#7ed6df';
    this.ctx.font = '11px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('[B] 눌러 뒤로 가기', this.canvas.width / 2, this.canvas.height - 15);
  }

  private renderDexOverlay() {
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#f1c40f';
    this.ctx.font = 'bold 16px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('📖 한국 신령도감 (Gwisin-dex)', this.canvas.width / 2, 28);

    const keys = Object.keys(SPIRITS_DB);
    keys.forEach((key, idx) => {
      const template = SPIRITS_DB[key];
      const entry = this.trainer.dex[key];

      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = 20 + col * 205;
      const y = 45 + row * 62;

      this.ctx.fillStyle = '#1e293b';
      this.ctx.fillRect(x, y, 195, 56);

      if (entry && entry.caught) {
        this.ctx.fillStyle = template.themeColor;
        this.ctx.font = 'bold 12px sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`${template.iconSymbol} ${template.name}`, x + 8, y + 20);

        this.ctx.fillStyle = '#cbd5e1';
        this.ctx.font = '10px sans-serif';
        this.ctx.fillText(`속성:${template.type} | ${template.title}`, x + 8, y + 36);
        this.ctx.fillText(`"봉인 완료"`, x + 8, y + 49);
      } else if (entry && entry.seen) {
        this.ctx.fillStyle = '#94a3b8';
        this.ctx.font = '11px sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`❓ ${template.name} (발견됨)`, x + 8, y + 30);
      } else {
        this.ctx.fillStyle = '#475569';
        this.ctx.font = '11px sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`??? (미발견)`, x + 8, y + 30);
      }
    });

    this.ctx.fillStyle = '#7ed6df';
    this.ctx.font = '11px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('[B] 눌러 뒤로 가기', this.canvas.width / 2, this.canvas.height - 12);
  }

  private renderBattleScreen() {
    if (!this.battle) return;

    // Battle Arena Background
    const grad = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    grad.addColorStop(0, '#1e272e');
    grad.addColorStop(0.6, '#3c40c6');
    grad.addColorStop(1, '#05c46b');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Enemy Spirit Stat Panel
    this.renderHealthBar(
      this.battle.enemySpirit.name,
      this.battle.enemySpirit.level,
      this.battle.enemySpirit.hp,
      this.battle.enemySpirit.maxHp,
      20,
      20
    );

    // Enemy Spirit Sprite
    drawSpiritSprite(this.ctx, this.battle.enemySpirit, 280, 50, 96, false);

    // Player Spirit Sprite
    drawSpiritSprite(this.ctx, this.battle.playerSpirit, 60, 170, 96, true);

    // Player Spirit Stat Panel
    this.renderHealthBar(
      this.battle.playerSpirit.name,
      this.battle.playerSpirit.level,
      this.battle.playerSpirit.hp,
      this.battle.playerSpirit.maxHp,
      230,
      190
    );

    // Battle Control / Action Menu Box
    this.renderBattleMenu();
  }

  private renderHealthBar(name: string, level: number, hp: number, maxHp: number, x: number, y: number) {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    this.ctx.strokeStyle = '#d2dae2';
    this.ctx.lineWidth = 2;
    this.ctx.fillRect(x, y, 190, 50);
    this.ctx.strokeRect(x, y, 190, 50);

    this.ctx.fillStyle = '#f1c40f';
    this.ctx.font = 'bold 12px sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`${name}  Lv.${level}`, x + 10, y + 18);

    // HP Bar Outer
    this.ctx.fillStyle = '#485460';
    this.ctx.fillRect(x + 10, y + 26, 170, 12);

    // HP Bar Fill
    const hpRatio = Math.max(0, hp / maxHp);
    this.ctx.fillStyle = hpRatio > 0.5 ? '#2ecc71' : hpRatio > 0.2 ? '#f1c40f' : '#e74c3c';
    this.ctx.fillRect(x + 10, y + 26, Math.floor(170 * hpRatio), 12);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '10px sans-serif';
    this.ctx.fillText(`${hp} / ${maxHp}`, x + 120, y + 36);
  }

  private renderBattleMenu() {
    if (!this.battle) return;

    const boxY = 270;
    this.ctx.fillStyle = '#0f172a';
    this.ctx.strokeStyle = '#38bdf8';
    this.ctx.lineWidth = 3;
    this.ctx.fillRect(10, boxY, this.canvas.width - 20, 104);
    this.ctx.strokeRect(10, boxY, this.canvas.width - 20, 104);

    // Left Panel: Battle Log Text
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.font = '11px sans-serif';
    const lastLogs = this.battle.logs.slice(-3);
    lastLogs.forEach((log, idx) => {
      this.ctx.fillStyle = log.color || '#f8fafc';
      this.ctx.fillText(log.text, 20, boxY + 22 + idx * 18);
    });

    if (this.battle.phase === 'player_turn' || this.battle.phase === 'start') {
      // Right Panel: Action Commands [공격] [봉인] [도망]
      const actions = ['⚔️ 공격', `🔮 봉인(${this.battle.spiritBeadCount})`, '🏃 도망'];
      actions.forEach((act, idx) => {
        const isSel = idx === this.battleActionCursor;
        this.ctx.fillStyle = isSel ? '#f1c40f' : '#64748b';
        this.ctx.fillRect(260 + idx * 56, boxY + 12, 52, 22);

        this.ctx.fillStyle = isSel ? '#000' : '#fff';
        this.ctx.font = 'bold 10px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(act, 260 + idx * 56 + 26, boxY + 26);
      });

      // Moves Submenu list when Attack is active
      if (this.battleActionCursor === 0) {
        const moves = this.battle.playerSpirit.moves;
        moves.forEach((mv, idx) => {
          const isSel = idx === this.battleMoveCursor;
          const col = idx % 2;
          const row = Math.floor(idx / 2);

          const mx = 260 + col * 85;
          const my = boxY + 42 + row * 26;

          this.ctx.fillStyle = isSel ? '#fbbf24' : '#1e293b';
          this.ctx.fillRect(mx, my, 80, 22);

          this.ctx.fillStyle = isSel ? '#000000' : '#ffffff';
          this.ctx.font = '10px sans-serif';
          this.ctx.textAlign = 'center';
          this.ctx.fillText(`${mv.name}`, mx + 40, my + 15);
        });
      }
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new GameApp();
});
