export function createEmulatorShell(
  container: HTMLElement,
  screenCanvas: HTMLCanvasElement
): {
  screenContainer: HTMLDivElement;
  dpad: { up: HTMLElement; down: HTMLElement; left: HTMLElement; right: HTMLElement };
  btnA: HTMLElement;
  btnB: HTMLElement;
  btnStart: HTMLElement;
  btnSelect: HTMLElement;
  btnMenu: HTMLElement;
} {
  container.innerHTML = `
    <div class="emulator-casing">
      <div class="emulator-top">
        <div class="brand-logo">GAME SPIRIT <span>ADVANCE</span></div>
        <div class="power-led" id="powerLed"></div>
      </div>

      <div class="emulator-screen-bezel">
        <div class="screen-header">
          <span class="screen-title">한국 신령 트레이너 (Korean Spirit Trainer)</span>
          <span class="battery-status">● POWER</span>
        </div>
        <div class="screen-frame" id="screenFrame"></div>
      </div>

      <div class="emulator-controls">
        <div class="dpad-container">
          <div class="dpad-btn dpad-up" id="btnUp">▲</div>
          <div class="dpad-btn dpad-left" id="btnLeft">◀</div>
          <div class="dpad-btn dpad-center"></div>
          <div class="dpad-btn dpad-right" id="btnRight">▶</div>
          <div class="dpad-btn dpad-down" id="btnDown">▼</div>
        </div>

        <div class="center-buttons">
          <div class="small-btn-group">
            <button class="pill-btn" id="btnSelect">SELECT</button>
            <button class="pill-btn" id="btnStart">START</button>
          </div>
          <button class="menu-btn" id="btnMenu">메뉴 / Save</button>
        </div>

        <div class="action-buttons">
          <div class="action-btn-wrapper">
            <button class="round-btn btn-b" id="btnB">B</button>
            <span class="btn-label">취소(X)</span>
          </div>
          <div class="action-btn-wrapper">
            <button class="round-btn btn-a" id="btnA">A</button>
            <span class="btn-label">확인(Z)</span>
          </div>
        </div>
      </div>
    </div>

    <style>
      .emulator-casing {
        width: 100%;
        max-width: 540px;
        background: linear-gradient(145deg, #2d3436, #1e272e);
        border: 4px solid #485460;
        border-radius: 28px;
        padding: 20px;
        box-shadow: 0 12px 30px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.2);
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
      }

      .emulator-top {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        padding: 0 10px;
      }

      .brand-logo {
        font-weight: 900;
        font-size: 16px;
        color: #d2dae2;
        letter-spacing: 1px;
      }

      .brand-logo span {
        color: #ef5777;
        font-style: italic;
      }

      .power-led {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: #00e676;
        box-shadow: 0 0 8px #00e676;
      }

      .emulator-screen-bezel {
        width: 100%;
        background: #000;
        border-radius: 12px;
        padding: 12px;
        border: 3px solid #0f172a;
        box-shadow: inset 0 0 10px rgba(0,0,0,0.9);
      }

      .screen-header {
        display: flex;
        justify-content: space-between;
        font-size: 11px;
        color: #808e9b;
        margin-bottom: 6px;
        font-family: monospace;
      }

      .screen-title {
        color: #f5cd79;
        font-weight: bold;
      }

      .screen-frame {
        width: 100%;
        aspect-ratio: 4 / 3;
        background: #111;
        border-radius: 6px;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        box-shadow: inset 0 0 15px rgba(0,0,0,0.8);
      }

      .screen-frame canvas {
        width: 100%;
        height: 100%;
        image-rendering: pixelated;
        display: block;
      }

      .emulator-controls {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 20px;
        padding: 0 10px;
      }

      .dpad-container {
        width: 110px;
        height: 110px;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(3, 1fr);
      }

      .dpad-btn {
        background: #485460;
        color: #d2dae2;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 12px;
        user-select: none;
        cursor: pointer;
        box-shadow: inset 0 1px 2px rgba(255,255,255,0.2), 0 2px 4px rgba(0,0,0,0.4);
      }

      .dpad-btn:active {
        background: #0be881;
        color: #000;
      }

      .dpad-up { grid-column: 2; grid-row: 1; border-radius: 6px 6px 0 0; }
      .dpad-left { grid-column: 1; grid-row: 2; border-radius: 6px 0 0 6px; }
      .dpad-center { grid-column: 2; grid-row: 2; background: #3c4043; cursor: default; }
      .dpad-right { grid-column: 3; grid-row: 2; border-radius: 0 6px 6px 0; }
      .dpad-down { grid-column: 2; grid-row: 3; border-radius: 0 0 6px 6px; }

      .center-buttons {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
      }

      .small-btn-group {
        display: flex;
        gap: 12px;
      }

      .pill-btn {
        background: #57606f;
        color: #a4b0be;
        border: none;
        border-radius: 12px;
        padding: 4px 10px;
        font-size: 10px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0,0,0,0.4);
      }

      .pill-btn:active {
        background: #70a1ff;
        color: #fff;
      }

      .menu-btn {
        background: #e15f41;
        color: #fff;
        border: none;
        border-radius: 8px;
        padding: 6px 14px;
        font-size: 11px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 3px 6px rgba(0,0,0,0.5);
      }

      .menu-btn:active {
        transform: translateY(1px);
        background: #f5cd79;
        color: #000;
      }

      .action-buttons {
        display: flex;
        gap: 16px;
      }

      .action-btn-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }

      .round-btn {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: none;
        color: #fff;
        font-weight: 900;
        font-size: 18px;
        cursor: pointer;
        box-shadow: inset 0 2px 4px rgba(255,255,255,0.3), 0 4px 8px rgba(0,0,0,0.6);
      }

      .btn-a {
        background: linear-gradient(145deg, #ef5777, #f53b57);
      }

      .btn-b {
        background: linear-gradient(145deg, #575fcf, #3c40c6);
      }

      .round-btn:active {
        transform: scale(0.94);
        filter: brightness(1.2);
      }

      .btn-label {
        font-size: 10px;
        color: #808e9b;
        font-weight: bold;
      }
    </style>
  `;

  const screenFrame = container.querySelector('#screenFrame') as HTMLDivElement;
  screenFrame.appendChild(screenCanvas);

  return {
    screenContainer: screenFrame,
    dpad: {
      up: container.querySelector('#btnUp') as HTMLElement,
      down: container.querySelector('#btnDown') as HTMLElement,
      left: container.querySelector('#btnLeft') as HTMLElement,
      right: container.querySelector('#btnRight') as HTMLElement,
    },
    btnA: container.querySelector('#btnA') as HTMLElement,
    btnB: container.querySelector('#btnB') as HTMLElement,
    btnStart: container.querySelector('#btnStart') as HTMLElement,
    btnSelect: container.querySelector('#btnSelect') as HTMLElement,
    btnMenu: container.querySelector('#btnMenu') as HTMLElement,
  };
}
