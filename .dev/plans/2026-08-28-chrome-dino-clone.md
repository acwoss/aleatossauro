# Clone fiel Chrome Dino — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recriar o T-Rex do Chrome em HTML/CSS/JS puros (Canvas 2D), jogável em desktop e celular, abrindo `index.html` sem servidor.

**Architecture:** Página tela cheia com um canvas. Scripts clássicos no namespace `Dino` (UMD-lite, funciona em `file://` e no `node:test`). Loop `requestAnimationFrame` com dt clamped. Mundo lógico altura 150 e largura `round(innerWidth/scale)`. Constantes copiadas do Chromium modo normal.

**Tech Stack:** HTML5, CSS, JavaScript ES5-compatível (sem `import`), Canvas 2D, `localStorage`, `node:test` nativo (sem `package.json`/npm).

## Global Constraints

- Sem npm, bundler, TypeScript, ES modules, som, PWA, gamepad, sprite sheet do Chromium.
- Abrir `index.html` no navegador deve bastar.
- Cores: fundo `#f7f7f7`, traço `#535353`; noite troca as duas. Ignorar `prefers-color-scheme`.
- Texto de crash: `GAME OVER` (inglês).
- HI: `localStorage` chave `aleatossauro-hi`.
- `ctx.imageSmoothingEnabled = false`.
- Spec: `.dev/specs/2026-08-28-chrome-dino-clone-design.md`.
- Wrapper de todo `.js` de produção:

```js
(function (root) {
  var Dino = root.Dino || (root.Dino = {});
  // ...
  if (typeof module !== "undefined" && module.exports) {
    module.exports = Dino;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
```

---

## File map

| Arquivo | Responsabilidade |
|---------|------------------|
| `index.html` | canvas, fallback, ordem dos scripts |
| `css/style.css` | tela cheia, touch-action, overflow |
| `js/config.js` | constantes Chromium + `clamp` |
| `js/layout.js` | `computeLayout` |
| `js/input.js` | teclado + toque |
| `js/collision.js` | `CollisionBox`, `boxCompare`, `createAdjustedCollisionBox` |
| `js/sprites.js` | `drawRects` + silhuetas 1-bit |
| `js/trex.js` | física e animação do dino |
| `js/horizon.js` | chão, nuvens |
| `js/obstacles.js` | spawn, movimento, tipos |
| `js/hud.js` | score, HI, GAME OVER |
| `js/game.js` | loop, estados, noite, orquestração |
| `tests/*.test.js` | `node:test` da lógica pura |

---

### Task 1: Scaffold + constantes

**Files:**
- Create: `index.html`
- Create: `css/style.css`
- Create: `js/config.js`
- Create: `tests/config.test.js`

**Interfaces:**
- Consumes: nada
- Produces: `Dino.Config` (objeto), `Dino.clamp(n, min, max)`, `Dino.FPS`, `Dino.DEFAULT_HEIGHT`

- [ ] **Step 1: Write the failing test**

```js
// tests/config.test.js
var test = require("node:test");
var assert = require("node:assert/strict");
var Dino = require("../js/config.js");

test("clamp limita o valor", function () {
  assert.equal(Dino.clamp(3.2, 1, 3.24), 3.2);
  assert.equal(Dino.clamp(0.65, 1, 2.5), 1);
  assert.equal(Dino.clamp(9, 1, 3), 3);
});

test("constantes do modo normal Chromium", function () {
  var c = Dino.Config;
  assert.equal(c.speed, 6);
  assert.equal(c.acceleration, 0.001);
  assert.equal(c.maxSpeed, 13);
  assert.equal(c.clearTime, 3000);
  assert.equal(c.gameoverClearTime, 1200);
  assert.equal(c.invertDistance, 700);
  assert.equal(c.invertFadeDuration, 12000);
  assert.equal(c.gapCoefficient, 0.6);
  assert.equal(c.maxGapCoefficient, 1.5);
  assert.equal(c.gravity, 0.6);
  assert.equal(c.initialJumpVelocity, -10);
  assert.equal(c.minJumpHeight, 30);
  assert.equal(c.maxJumpHeight, 30);
  assert.equal(c.speedDropCoefficient, 3);
  assert.equal(c.dropVelocity, -5);
  assert.equal(c.trexWidth, 44);
  assert.equal(c.trexHeight, 47);
  assert.equal(c.trexWidthDuck, 59);
  assert.equal(c.trexHeightDuck, 25);
  assert.equal(c.bottomPad, 10);
  assert.equal(c.startXPos, 50);
  assert.equal(c.scoreCoefficient, 0.025);
  assert.equal(c.achievementDistance, 100);
  assert.equal(c.bg, "#f7f7f7");
  assert.equal(c.fg, "#535353");
  assert.equal(c.storageKey, "aleatossauro-hi");
  assert.equal(Dino.FPS, 60);
  assert.equal(Dino.DEFAULT_HEIGHT, 150);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/config.test.js`  
Expected: FAIL (`Cannot find module` ou `Dino.clamp is not a function`)

- [ ] **Step 3: Write minimal implementation**

`js/config.js`:

```js
(function (root) {
  var Dino = root.Dino || (root.Dino = {});
  Dino.FPS = 60;
  Dino.DEFAULT_HEIGHT = 150;
  Dino.clamp = function (n, min, max) {
    return Math.max(min, Math.min(max, n));
  };
  Dino.Config = {
    speed: 6,
    acceleration: 0.001,
    maxSpeed: 13,
    clearTime: 3000,
    gameoverClearTime: 1200,
    invertDistance: 700,
    invertFadeDuration: 12000,
    gapCoefficient: 0.6,
    maxGapCoefficient: 1.5,
    maxObstacleLength: 3,
    maxObstacleDuplication: 2,
    cloudFrequency: 0.5,
    maxClouds: 6,
    bgCloudSpeed: 0.2,
    gravity: 0.6,
    initialJumpVelocity: -10,
    minJumpHeight: 30,
    maxJumpHeight: 30,
    speedDropCoefficient: 3,
    dropVelocity: -5,
    trexWidth: 44,
    trexHeight: 47,
    trexWidthDuck: 59,
    trexHeightDuck: 25,
    bottomPad: 10,
    startXPos: 50,
    introDuration: 1500,
    blinkTiming: 7000,
    flashOn: 100,
    flashOff: 175,
    scoreCoefficient: 0.025,
    achievementDistance: 100,
    maxDistanceUnits: 5,
    flashDuration: 250,
    flashIterations: 3,
    dtMax: 50,
    tapMaxDist: 15,
    swipeDownMin: 30,
    pterodactylMinSpeed: 8.5,
    bg: "#f7f7f7",
    fg: "#535353",
    storageKey: "aleatossauro-hi"
  };
  if (typeof module !== "undefined" && module.exports) {
    module.exports = Dino;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
```

`css/style.css`:

```css
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #f7f7f7;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}
#game {
  display: block;
  width: 100%;
  height: 100%;
}
#unsupported {
  display: none;
  font-family: sans-serif;
  padding: 2rem;
  color: #535353;
}
#unsupported.is-visible {
  display: block;
}
```

`index.html` (scripts só `config.js` nesta task; as outras tags entram nas tasks seguintes, nesta ordem final):

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
  <title>Aleatossauro</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <p id="unsupported">Seu navegador não roda este jogo</p>
  <canvas id="game"></canvas>
  <script src="js/config.js"></script>
</body>
</html>
```

- [ ] **Step 4: Run the tests and make sure they pass**

Run: `node --test tests/config.test.js`  
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add index.html css/style.css js/config.js tests/config.test.js
git commit -m "feat: scaffold e constantes do runner Chromium"
```

---

### Task 2: Layout da viewport

**Files:**
- Create: `js/layout.js`
- Create: `tests/layout.test.js`
- Modify: `index.html` (adicionar `<script src="js/layout.js"></script>` depois de config)

**Interfaces:**
- Consumes: `Dino.clamp`, `Dino.DEFAULT_HEIGHT`
- Produces: `Dino.computeLayout(innerWidth, innerHeight)` → `{ scale, logicalWidth, logicalHeight, offsetY }`  
  `scale = clamp(innerWidth/600, 1, innerHeight*0.45/150)`  
  `logicalWidth = round(innerWidth / scale)`  
  `logicalHeight = 150`  
  `offsetY = round((innerHeight - 150 * scale) / 2)` (pixels CSS até o topo da faixa)

- [ ] **Step 1: Write the failing test**

```js
// tests/layout.test.js
var test = require("node:test");
var assert = require("node:assert/strict");
require("../js/config.js");
var Dino = require("../js/layout.js");

test("desktop 1920x1080 aproxima 600 de largura lógica", function () {
  var l = Dino.computeLayout(1920, 1080);
  assert.equal(l.logicalHeight, 150);
  assert.ok(Math.abs(l.scale - 3.2) < 0.01);
  assert.equal(l.logicalWidth, 600);
  assert.equal(l.offsetY, Math.round((1080 - 150 * l.scale) / 2));
});

test("telefone 390x844 usa scale 1 e largura da janela", function () {
  var l = Dino.computeLayout(390, 844);
  assert.equal(l.scale, 1);
  assert.equal(l.logicalWidth, 390);
  assert.equal(l.logicalHeight, 150);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/layout.test.js`  
Expected: FAIL (`computeLayout is not a function`)

- [ ] **Step 3: Write minimal implementation**

```js
(function (root) {
  var Dino = root.Dino || (root.Dino = {});
  Dino.computeLayout = function (innerWidth, innerHeight) {
    var scale = Dino.clamp(innerWidth / 600, 1, innerHeight * 0.45 / 150);
    return {
      scale: scale,
      logicalWidth: Math.round(innerWidth / scale),
      logicalHeight: Dino.DEFAULT_HEIGHT,
      offsetY: Math.round((innerHeight - Dino.DEFAULT_HEIGHT * scale) / 2)
    };
  };
  if (typeof module !== "undefined" && module.exports) {
    module.exports = Dino;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
```

- [ ] **Step 4: Run the tests and make sure they pass**

Run: `node --test tests/layout.test.js tests/config.test.js`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add js/layout.js tests/layout.test.js index.html
git commit -m "feat: escala lógica da viewport no estilo arcade do Chrome"
```

---

### Task 3: Input teclado e toque

**Files:**
- Create: `js/input.js`
- Create: `tests/input.test.js`
- Modify: `index.html` (script `input.js`)

**Interfaces:**
- Consumes: `Dino.Config.tapMaxDist`, `Dino.Config.swipeDownMin`
- Produces:
  - `Dino.createInput()` → `{ attach(el), detach(), consume() }`
  - `consume()` retorna `{ jumpPressed: boolean, duck: boolean }` e zera `jumpPressed`
  - `duck` permanece true enquanto ↓ ou swipe-down estiver ativo
  - `keydown` com `repeat` não gera segundo pulo
  - primeiro `touchstart` apenas; movimento em Y ≥ `swipeDownMin` liga duck; `touchend` com deslocamento < `tapMaxDist` gera jump

- [ ] **Step 1: Write the failing test**

```js
// tests/input.test.js
var test = require("node:test");
var assert = require("node:assert/strict");
require("../js/config.js");
var Dino = require("../js/input.js");

function fakeEl() {
  var listeners = {};
  return {
    listeners: listeners,
    addEventListener: function (t, fn) {
      listeners[t] = listeners[t] || [];
      listeners[t].push(fn);
    },
    removeEventListener: function () {},
    fire: function (t, ev) {
      (listeners[t] || []).forEach(function (fn) { fn(ev); });
    }
  };
}

test("espaço gera um pulo e ignora repeat", function () {
  var el = fakeEl();
  var input = Dino.createInput();
  input.attach(el);
  el.fire("keydown", { code: "Space", repeat: false, preventDefault: function () {} });
  el.fire("keydown", { code: "Space", repeat: true, preventDefault: function () {} });
  var a = input.consume();
  assert.equal(a.jumpPressed, true);
  var b = input.consume();
  assert.equal(b.jumpPressed, false);
});

test("arrowdown segura duck até keyup", function () {
  var el = fakeEl();
  var input = Dino.createInput();
  input.attach(el);
  el.fire("keydown", { code: "ArrowDown", repeat: false, preventDefault: function () {} });
  assert.equal(input.consume().duck, true);
  el.fire("keyup", { code: "ArrowDown", preventDefault: function () {} });
  assert.equal(input.consume().duck, false);
});

test("tap curto é pulo; swipe down é duck", function () {
  var el = fakeEl();
  var input = Dino.createInput();
  input.attach(el);
  el.fire("touchstart", {
    touches: [{ clientX: 10, clientY: 10, identifier: 1 }],
    preventDefault: function () {}
  });
  el.fire("touchend", {
    changedTouches: [{ clientX: 12, clientY: 12, identifier: 1 }],
    preventDefault: function () {}
  });
  assert.equal(input.consume().jumpPressed, true);

  el.fire("touchstart", {
    touches: [{ clientX: 10, clientY: 10, identifier: 1 }],
    preventDefault: function () {}
  });
  el.fire("touchmove", {
    touches: [{ clientX: 10, clientY: 50, identifier: 1 }],
    preventDefault: function () {}
  });
  assert.equal(input.consume().duck, true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/input.test.js`  
Expected: FAIL (`createInput is not a function`)

- [ ] **Step 3: Write minimal implementation**

Em `js/input.js`, `createInput` guarda `jumpQueued`, `duck`, `touchId`, `startX`, `startY`. Mapear `Space` e `ArrowUp` → jump; `ArrowDown` → duck. Toque: ignorar `identifier` diferente do primeiro. `preventDefault` em todos os handlers de tecla/toque do jogo.

- [ ] **Step 4: Run the tests and make sure they pass**

Run: `node --test tests/input.test.js`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add js/input.js tests/input.test.js index.html
git commit -m "feat: input de teclado e toque (pulo, agachar, swipe)"
```

---

### Task 4: Colisão AABB

**Files:**
- Create: `js/collision.js`
- Create: `tests/collision.test.js`
- Modify: `index.html`

**Interfaces:**
- Consumes: nada
- Produces:
  - `new Dino.CollisionBox(x, y, width, height)`
  - `Dino.boxCompare(a, b)` → boolean (eixos separados)
  - `Dino.createAdjustedCollisionBox(box, adjustment)` → nova caixa `x+adj.x`, `y+adj.y`, mesmo w/h
  - `Dino.checkForCollision(tRex, obstacle)` → `false` ou `[tRexBox, obstacleBox]` como no Chromium: primeiro AABB grosseiro (dino 44×47 com -1 de borda), depois pares de caixas ajustadas

Caixas do T-Rex (Chromium):

```
running: (22,0,17,16), (1,18,30,9), (10,35,14,8), (1,24,29,5), (5,30,21,4), (9,34,15,4)
ducking: (1,18,55,25)
```

- [ ] **Step 1: Write the failing test**

```js
var test = require("node:test");
var assert = require("node:assert/strict");
var Dino = require("../js/collision.js");

test("boxCompare detecta overlap e gap", function () {
  var a = new Dino.CollisionBox(0, 0, 10, 10);
  var b = new Dino.CollisionBox(5, 5, 10, 10);
  var c = new Dino.CollisionBox(20, 0, 10, 10);
  assert.equal(Dino.boxCompare(a, b), true);
  assert.equal(Dino.boxCompare(a, c), false);
});

test("createAdjustedCollisionBox soma o offset do sprite", function () {
  var box = new Dino.CollisionBox(2, 3, 4, 5);
  var adj = Dino.createAdjustedCollisionBox(box, { x: 10, y: 20 });
  assert.equal(adj.x, 12);
  assert.equal(adj.y, 23);
  assert.equal(adj.width, 4);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/collision.test.js`  
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

```js
Dino.boxCompare = function (tRexBox, obstacleBox) {
  var crashed = false;
  var tRexBoxX = tRexBox.x;
  var tRexBoxY = tRexBox.y;
  var obstacleBoxX = obstacleBox.x;
  var obstacleBoxY = obstacleBox.y;
  if (
    tRexBoxX < obstacleBoxX + obstacleBox.width &&
    tRexBoxX + tRexBox.width > obstacleBoxX &&
    tRexBoxY < obstacleBoxY + obstacleBox.height &&
    tRexBoxY + tRexBox.height > obstacleBoxY
  ) {
    crashed = true;
  }
  return crashed;
};
```

Exportar também `Dino.TREX_BOXES_RUNNING` e `Dino.TREX_BOXES_DUCKING` (arrays de `CollisionBox`) para o `trex.js` reutilizar.

- [ ] **Step 4: Run the tests and make sure they pass**

Run: `node --test tests/collision.test.js`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add js/collision.js tests/collision.test.js index.html
git commit -m "feat: colisão AABB no modelo do Chromium"
```

---

### Task 5: Sprites 1-bit

**Files:**
- Create: `js/sprites.js`
- Create: `tests/sprites.test.js`
- Modify: `index.html`

**Interfaces:**
- Consumes: nada (cor vem de quem desenha)
- Produces: `Dino.drawRects(ctx, rects, x, y, color)` e `Dino.Sprites` com arrays `{x,y,w,h}` por frame:
  - `trex.wait`, `trex.blink`, `trex.run1`, `trex.run2`, `trex.jump`, `trex.crash`, `trex.duck1`, `trex.duck2`
  - `cactusSmall`, `cactusLarge` (um “braço”; grupos repetem com offset `width`)
  - `ptero1`, `ptero2`
  - `cloud`, `restart` (círculo + seta em rects)
  - `digit0`…`digit9`, `hiH`, `hiI`
  Silhueta reconhecível do T-Rex Chrome (olho, braço, pernas em 2 frames), **sem** copiar pixels da PNG oficial. `drawRects` faz `ctx.fillRect` em cada rect, `fillStyle = color`.

- [ ] **Step 1: Write a node test for drawRects em canvas mock**

```js
var test = require("node:test");
var assert = require("node:assert/strict");
var Dino = require("../js/sprites.js");

test("drawRects pinta cada retângulo no offset", function () {
  var calls = [];
  var ctx = {
    fillRect: function (x, y, w, h) { calls.push([x, y, w, h]); },
    fillStyle: ""
  };
  Dino.drawRects(ctx, [{ x: 1, y: 2, w: 3, h: 4 }], 10, 20, "#535353");
  assert.equal(ctx.fillStyle, "#535353");
  assert.deepEqual(calls[0], [11, 22, 3, 4]);
});

test("frames do trex e obstáculos existem", function () {
  assert.ok(Dino.Sprites.trex.run1.length > 3);
  assert.ok(Dino.Sprites.cactusSmall.length > 0);
  assert.ok(Dino.Sprites.ptero1.length > 0);
  assert.ok(Dino.Sprites.digit0.length > 0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/sprites.test.js`  
Expected: FAIL

- [ ] **Step 3: Write sprites.js**

Implementar `drawRects` e todas as chaves de `Dino.Sprites`. Dígitos: 10×13 em rects, estilo 7-segmentos pixelado. GAME OVER no HUD usa `fillText` (task 8), não sprite de texto.

- [ ] **Step 4: Run the tests and make sure they pass**

Run: `node --test tests/sprites.test.js`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add js/sprites.js tests/sprites.test.js index.html
git commit -m "feat: silhuetas 1-bit desenhadas em retângulos"
```

---

### Task 6: T-Rex

**Files:**
- Create: `js/trex.js`
- Create: `tests/trex.test.js`
- Modify: `index.html`

**Interfaces:**
- Consumes: `Dino.Config`, `Dino.FPS`, `Dino.Sprites`, `Dino.drawRects`, `Dino.TREX_BOXES_*`
- Produces: `new Dino.Trex(groundY)` com:
  - `xPos` começa em `startXPos` (sem intro slide no MVP — spec não exige o slide de 1500 ms; pular intro para YAGNI)
  - `update(dt, status?)`, `startJump(speed)`, `endJump()`, `updateJump(dt)`, `setSpeedDrop()`, `setDuck(bool)`, `reset()`, `draw(ctx, color)`, `getCollisionBoxes()`
  - Física idêntica ao `trex.ts` Chromium (`framesElapsed = dt / (1000/60)`, `jumpVelocity` inicia em `initialJumpVelocity - speed/10`, gravidade `0.6`, speed drop `* 3`)
  - Estados internos: WAITING (pisca a cada delay aleatório 0–7000 ms), RUNNING (12 fps), JUMPING, DUCKING (8 fps), CRASHED
  - `reset()` coloca RUNNING no chão (usado no restart); o `Game` em WAITING chama `update(0, 'WAITING')`

- [ ] **Step 1: Write the failing test**

```js
var test = require("node:test");
var assert = require("node:assert/strict");
require("../js/config.js");
require("../js/collision.js");
require("../js/sprites.js");
var Dino = require("../js/trex.js");

test("pulo sobe e volta ao chão", function () {
  var groundY = 150 - 47 - 10;
  var t = new Dino.Trex(groundY);
  t.startJump(6);
  assert.equal(t.jumping, true);
  var i;
  for (i = 0; i < 40; i++) t.updateJump(16.67);
  assert.equal(t.jumping, false);
  assert.equal(t.yPos, groundY);
});

test("speed drop acelera a queda", function () {
  var groundY = 150 - 47 - 10;
  var a = new Dino.Trex(groundY);
  var b = new Dino.Trex(groundY);
  a.startJump(6);
  b.startJump(6);
  b.setSpeedDrop();
  a.updateJump(50);
  b.updateJump(50);
  assert.ok(b.yPos > a.yPos);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/trex.test.js`  
Expected: FAIL

- [ ] **Step 3: Write trex.js** copiando a lógica de `startJump` / `updateJump` / `endJump` / `setDuck` / `setSpeedDrop` do `trex.ts` Chromium (modo `normalJumpConfig`, sem `invertJump`, sem alt-game).

- [ ] **Step 4: Run the tests and make sure they pass**

Run: `node --test tests/trex.test.js`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add js/trex.js tests/trex.test.js index.html
git commit -m "feat: física e animação do T-Rex"
```

---

### Task 7: Horizonte e obstáculos

**Files:**
- Create: `js/horizon.js`
- Create: `js/obstacles.js`
- Create: `tests/obstacles.test.js`
- Modify: `index.html`

**Interfaces:**
- Consumes: `Dino.Config`, `Dino.FPS`, `Dino.Sprites`, `Dino.CollisionBox`, `Dino.getRandomNum(min, max)` (definir em `obstacles.js` ou `config.js`: `min + Math.round(Math.random() * (max - min))`)
- Produces:
  - `new Dino.Horizon(logicalWidth)` → `update(dt, speed, running)`, `draw(ctx, fg)`, `reset()`
    - linha y = 127, duas tiras de chão 600×12 que fazem wrap; bump procedural (rand 0/1 a cada 2 px)
    - nuvens: max 6, speed `0.2 * currentSpeed`, y aleatório 15–70, gap 100–400
  - `Dino.OBSTACLE_TYPES` array Chromium (sem `collectable`):
    - cactusSmall: w17 h35 yPos 105, multipleSpeed 4, minGap 120, minSpeed 0, 3 collision boxes
    - cactusLarge: w25 h50 yPos 90, multipleSpeed 7, minGap 120, minSpeed 0, 3 boxes
    - pterodactyl: w46 h40 yPos [100,75,50], yPosMobile [100,50], multipleSpeed 999, minSpeed 8.5, minGap 150, speedOffset 0.8, 2 frames 1000/6
  - `new Dino.Obstacle(type, logicalWidth, gapCoefficient, speed, isMobile)`
    - `getGap(gapCoefficient, speed)` = random entre `minGap = round(width*speed + type.minGap*gapCoefficient)` e `minGap * 1.5`
    - `update(dt, speed)`: `xPos -= floor((speed * FPS / 1000) * dt)` (+ speedOffset se ptero)
    - `size` 1–3 se `speed >= multipleSpeed`
  - `Dino.spawnObstacle(currentSpeed, lastTypeCount, isMobile, logicalWidth)` evita 3 iguais seguidos (`maxObstacleDuplication`) e ignora tipos com `minSpeed > currentSpeed`

- [ ] **Step 1: Write the failing test**

```js
var test = require("node:test");
var assert = require("node:assert/strict");
require("../js/config.js");
require("../js/collision.js");
require("../js/sprites.js");
var Dino = require("../js/obstacles.js");

test("getGap cresce com a velocidade", function () {
  var type = Dino.OBSTACLE_TYPES[0];
  var slow = new Dino.Obstacle(type, 600, 0.6, 6, false);
  var fast = new Dino.Obstacle(type, 600, 0.6, 13, false);
  assert.ok(fast.gap > slow.gap - 1);
});

test("pterodáctilo só entra com speed >= 8.5", function () {
  var i, sawPtero = false;
  for (i = 0; i < 80; i++) {
    var o = Dino.spawnObstacle(6, {}, false, 600);
    if (o.typeConfig.type === "pterodactyl") sawPtero = true;
  }
  assert.equal(sawPtero, false);
  var seen = false;
  for (i = 0; i < 80; i++) {
    o = Dino.spawnObstacle(9, {}, false, 600);
    if (o.typeConfig.type === "pterodactyl") seen = true;
  }
  assert.equal(seen, true);
});
```

O teste de ptero em speed 9 pode falhar por azar se `spawnObstacle` for muito raro. Implementar `spawnObstacle` com filtro de tipos elegíveis e escolha uniforme entre eles — com 80 tentativas em 3 tipos a chance de nunca sair ptero é `(2/3)^80 ≈ 0`. Sem ptero em speed 6 porque o tipo é filtrado.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/obstacles.test.js`  
Expected: FAIL

- [ ] **Step 3: Implementar `horizon.js` e `obstacles.js`.** Spawn no `Game` (task 9) quando o último obstáculo tem `xPos + width + gap <= logicalWidth`. Primeiro obstáculo só após `clearTime` 3000 ms.

- [ ] **Step 4: Run the tests and make sure they pass**

Run: `node --test tests/obstacles.test.js`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add js/horizon.js js/obstacles.js tests/obstacles.test.js index.html
git commit -m "feat: horizonte, nuvens e spawn de obstáculos"
```

---

### Task 8: HUD, score, HI, noite

**Files:**
- Create: `js/hud.js`
- Create: `tests/hud.test.js`
- Modify: `index.html`

**Interfaces:**
- Consumes: `Dino.Config`, `Dino.Sprites`, `Dino.drawRects`
- Produces:
  - `Dino.getActualDistance(distanceRan)` → `distanceRan ? Math.round(distanceRan * 0.025) : 0`
  - `Dino.loadHighScore()` / `Dino.saveHighScore(distanceRan)` com try/catch em `localStorage` (`aleatossauro-hi`)
  - `new Dino.Hud()` → `update(dt, distanceRan)`, `draw(ctx, logicalWidth, fg, crashed)`, `reset()`, `setHighScore(distanceRan)`
  - Flash do score quando `actual % 100 === 0` e `actual > 0` (3 iterações, 250 ms off / 250 ms on)
  - `Dino.shouldInvert(actualDistance, alreadyOn)` → dispara quando `actualDistance > 0 && actualDistance % 700 === 0`
  - GAME OVER: `ctx.font = "12px Courier New"` (ou `monospace`), `textAlign = "center"`, texto `"GAME OVER"` no centro da faixa; abaixo o sprite `restart`

- [ ] **Step 1: Write the failing test**

```js
var test = require("node:test");
var assert = require("node:assert/strict");
require("../js/config.js");
require("../js/sprites.js");
var Dino = require("../js/hud.js");

test("getActualDistance usa coeficiente 0.025", function () {
  assert.equal(Dino.getActualDistance(0), 0);
  assert.equal(Dino.getActualDistance(4000), 100);
  assert.equal(Dino.getActualDistance(28000), 700);
});

test("shouldInvert nos múltiplos de 700", function () {
  assert.equal(Dino.shouldInvert(0), false);
  assert.equal(Dino.shouldInvert(700), true);
  assert.equal(Dino.shouldInvert(701), false);
});
```

Para `loadHighScore` sem `window`, usar:

```js
Dino.loadHighScore = function (storage) {
  storage = storage || (typeof localStorage !== "undefined" ? localStorage : null);
  if (!storage) return 0;
  try {
    return parseInt(storage.getItem(Dino.Config.storageKey) || "0", 10) || 0;
  } catch (e) {
    return 0;
  }
};
```

Teste extra com fake storage `{ store: {}, getItem, setItem }`.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/hud.test.js`  
Expected: FAIL

- [ ] **Step 3: Implementar hud.js** incluindo dígitos à direita (`x = logicalWidth - 11 * nDigits - 11`, `y = 5`) e `HI` à esquerda do score com `globalAlpha = 0.8`.

- [ ] **Step 4: Run the tests and make sure they pass**

Run: `node --test tests/hud.test.js`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add js/hud.js tests/hud.test.js index.html
git commit -m "feat: score, recorde persistente e trigger de noite"
```

---

### Task 9: Game loop e integração

**Files:**
- Create: `js/game.js`
- Create: `tests/game.test.js`
- Modify: `index.html` (script `game.js` por último + fallback)
- Modify: nenhum CSS extra além do `#unsupported.is-visible`

**Interfaces:**
- Consumes: todos os módulos anteriores
- Produces: `Dino.boot(canvas, unsupportedEl)` inicia o jogo ou mostra fallback

`Game` estado:

```
status: 'WAITING' | 'RUNNING' | 'CRASHED'
currentSpeed, distanceRan, runningTime, invertTimer, inverted
obstacles: Obstacle[]
layout: computeLayout result
tRex, horizon, hud, input
crashedAt: timestamp
```

Por frame:

1. `dt = min(now - last, Config.dtMax)`
2. `input = consume()`
3. WAITING + jump → `status = RUNNING`, `tRex.startJump(speed)`
4. CRASHED + jump e `now - crashedAt >= 1200` → `restart()` (speed=6, distanceRan=0, obstacles=[], horizon.reset(), tRex.reset(), inverted=false, status=RUNNING, já correndo)
5. `tRex`: se jump e no chão → `startJump`; se duck e pulando → `setSpeedDrop`; se duck no chão → `setDuck(true)` senão `setDuck(false)`; se jumping → `updateJump(dt)`; sempre `tRex.update(dt)`
6. RUNNING: `runningTime += dt`; `horizon.update`; se `runningTime > clearTime` spawn quando preciso; cada obstáculo `update`; `checkForCollision` no primeiro obstáculo; `distanceRan += currentSpeed * dt / (1000/60)`; se `currentSpeed < maxSpeed` somar `acceleration`; hud.update; se `shouldInvert(actual)` e `invertTimer === 0` ligar inverted; se inverted, `invertTimer += dt` e desligar após 12000 ms
7. Cores: `bg/fg` trocados se `inverted`
8. Draw: preencher canvas inteiro com bg (reset transform), `setTransform(dpr*scale, 0, 0, dpr*scale, 0, offsetY*dpr)`, clip da faixa opcional, horizonte, obstáculos, trex, hud
9. Resize: `computeLayout` + `canvas.width = innerWidth * dpr` etc.; **não** resetar partida
10. Fallback: se `!canvas.getContext('2d')` ou `typeof requestAnimationFrame === 'undefined'` → `#unsupported.is-visible`, não loop

Ordem final dos scripts em `index.html`:

```
config.js, layout.js, input.js, collision.js, sprites.js,
trex.js, horizon.js, obstacles.js, hud.js, game.js
```

`boot` no fim de `game.js`:

```js
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", function () {
    Dino.boot(document.getElementById("game"), document.getElementById("unsupported"));
  });
}
```

- [ ] **Step 1: Write a small test for restart/invert timing helpers no game.js** (exportar `Dino.createGameState()` para node):

```js
var test = require("node:test");
var assert = require("node:assert/strict");
require("../js/config.js");
require("../js/layout.js");
require("../js/input.js");
require("../js/collision.js");
require("../js/sprites.js");
require("../js/trex.js");
require("../js/horizon.js");
require("../js/obstacles.js");
require("../js/hud.js");
var Dino = require("../js/game.js");

test("restart zera score e velocidade e mantém HI", function () {
  var g = Dino.createGameState({ innerWidth: 800, innerHeight: 600 });
  g.distanceRan = 8000;
  g.highestScore = 8000;
  g.currentSpeed = 10;
  g.status = "CRASHED";
  g.restart();
  assert.equal(g.distanceRan, 0);
  assert.equal(g.currentSpeed, 6);
  assert.equal(g.highestScore, 8000);
  assert.equal(g.status, "RUNNING");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/game.test.js`  
Expected: FAIL

- [ ] **Step 3: Implementar `game.js` completo** (loop, resize, fallback, crash chama `saveHighScore` se `distanceRan > highestScore`).

- [ ] **Step 4: Run all tests**

Run: `node --test tests`  
Expected: PASS todos

Verificação manual (definição de pronto da spec):

1. Abrir `index.html` no Chrome — WAITING, dino pisca, Espaço começa.
2. Pulo / agachar teclado; DevTools mobile: tap e swipe down.
3. Cactos; depois de acelerar, pterodáctilos; colisão → GAME OVER.
4. Score, F5 mantém HI, noite ~700.
5. Restart após ~1,2 s com Espaço e tap.
6. Redimensionar / rotacionar sem scroll/zoom; partida não reseta.
7. Trocar de aba e voltar: sem atravessar cacto por dt gigante.

- [ ] **Step 5: Commit**

```bash
git add js/game.js tests/game.test.js index.html
git commit -m "feat: loop do jogo, noite, crash e restart"
```

---

## Self-review (plan vs spec)

| Spec | Task |
|------|------|
| Canvas tela cheia, sem chrome HTML | 1, 9 |
| Scripts clássicos / file:// | 1–9 |
| Escala 1A | 2, 9 |
| Teclado + tap/swipe | 3, 9 |
| T-Rex pulo/duck/speed drop | 6, 9 |
| Cactos, grupos, ptero minSpeed 8.5 | 7 |
| Hitboxes Chromium | 4, 6, 7, 9 |
| Score 0.025, flash 100, HI localStorage | 8 |
| Noite 700 / 12000 ms, cores fixas | 8, 9 |
| GAME OVER inglês | 8 |
| Fallback canvas | 9 |
| dt clamp, resize sem reset | 9 |
| Sem sprite sheet oficial | 5 |
| Checklist 7 itens | Task 9 step 4 |

Sem TBD. Assinaturas estáveis: `Dino.Config`, `computeLayout`, `createInput`, `CollisionBox`, `boxCompare`, `Trex`, `Horizon`, `Obstacle`, `Hud`, `boot`, `createGameState`.
