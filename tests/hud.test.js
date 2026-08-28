var test = require("node:test");
var assert = require("node:assert/strict");
require("../js/config.js");
require("../js/collision.js");
require("../js/sprites.js");
require("../js/powerups.js");
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

test("loadHighScore e saveHighScore usam storage injetado", function () {
  var store = {};
  var fake = {
    getItem: function (k) { return store[k] || null; },
    setItem: function (k, v) { store[k] = String(v); }
  };
  assert.equal(Dino.loadHighScore(fake), 0);
  Dino.saveHighScore(8000, fake);
  assert.equal(Dino.loadHighScore(fake), 8000);
});

test("hitChoiceCard acerta esquerda, direita ou nenhum", function () {
  var rects = Dino.choiceCardRects(600);
  assert.equal(rects.length, 2);
  assert.equal(Dino.hitChoiceCard(rects[0].x + 4, rects[0].y + 4, 600), 0);
  assert.equal(Dino.hitChoiceCard(rects[1].x + 4, rects[1].y + 4, 600), 1);
  assert.equal(Dino.hitChoiceCard(0, 0, 600), -1);
});

test("título da escolha fala em ovo e evolução, não efeito", function () {
  assert.ok(Dino.CHOICE_TITLE.indexOf("ovo") !== -1);
  assert.ok(Dino.CHOICE_TITLE.toLowerCase().indexOf("efeito") === -1);
  assert.ok(Dino.CHOICE_SUBTITLE.toLowerCase().indexOf("evolução") !== -1);
  assert.ok(Dino.CHOICE_SUBTITLE.toLowerCase().indexOf("efeito") === -1);
});

test("card de evolução desenha o que a opção faz", function () {
  var texts = [];
  var ctx = {
    save: function () {},
    restore: function () {},
    fillRect: function () {},
    fillText: function (t) { texts.push(String(t)); },
    strokeRect: function () {},
    font: "",
    textAlign: "",
    textBaseline: "",
    globalAlpha: 1,
    lineWidth: 1,
    strokeStyle: "",
    fillStyle: ""
  };
  var hud = new Dino.Hud();
  var coffee = Dino.effectById("coffee");
  hud.choice = { options: [coffee, Dino.effectById("sword")] };
  hud.draw(ctx, 600, Dino.palette(false), false);
  assert.ok(texts.some(function (t) { return String(t).indexOf(coffee.desc.slice(0, 12)) !== -1; }));
  assert.ok(texts.some(function (t) { return String(t).indexOf("INT") !== -1; }));
  var hidden = Dino.effectById(coffee.hidden);
  if (hidden) {
    assert.ok(texts.every(function (t) { return String(t).indexOf(hidden.label) === -1; }));
  }
});

test("rpgStatEntries usa rótulos curtos de RPG", function () {
  var rows = Dino.rpgStatEntries({ str: 4, spd: 8, hp: 3, hpMax: 5, jump: 2, int: 6 });
  assert.deepEqual(
    rows.map(function (r) { return r.label; }),
    ["FORÇA", "VEL", "VIDA", "PULO", "INT"]
  );
  assert.deepEqual(
    rows.map(function (r) { return r.value; }),
    ["4", "8", "3/5", "2", "6"]
  );
  assert.deepEqual(
    rows.map(function (r) { return r.icon; }),
    ["sword", "boots", "heart", "doubleJump", "crystal"]
  );
});

test("card de atributos fica numa linha só", function () {
  var card = Dino.rpgStatCardLayout(6, 18, {
    str: 4, spd: 8, hp: 3, hpMax: 5, jump: 2, int: 6
  });
  assert.equal(card.slots.length, 5);
  card.slots.forEach(function (slot) {
    assert.equal(slot.iconY, card.slots[0].iconY);
    assert.ok(slot.iconX >= card.x);
    assert.ok(slot.valueX > slot.iconX);
  });
  assert.ok(card.w > card.h);
  assert.ok(card.w < 280);
});

test("ícones do kit ficam à esquerda e não invadem o score", function () {
  var kit = Dino.createPowerKit();
  Dino.applyEffect(kit, "sword");
  Dino.applyEffect(kit, "gravity");
  Dino.applyEffect(kit, "spring");
  var layout = Dino.hudIconLayout(Dino.kitHudItems(kit), 8, 3, 220);
  assert.ok(layout.length >= 3);
  layout.forEach(function (slot) {
    assert.ok(slot.x + slot.size <= 220);
    assert.ok(slot.y < 40);
  });
});

test("HUD desenha atributos e ícones, não a lista de nomes", function () {
  var texts = [];
  var strokes = [];
  var ctx = {
    save: function () {},
    restore: function () {},
    fillRect: function () {},
    fillText: function (t) { texts.push(String(t)); },
    strokeRect: function (x, y, w, h) { strokes.push([x, y, w, h]); },
    font: "",
    textAlign: "",
    textBaseline: "",
    globalAlpha: 1,
    lineWidth: 1,
    strokeStyle: "",
    fillStyle: ""
  };
  var hud = new Dino.Hud();
  var kit = Dino.createPowerKit();
  Dino.applyEffect(kit, "sword");
  hud.kit = kit;
  hud.draw(ctx, 600, Dino.palette(false), false);
  var stats = Dino.rpgStats(kit, { speed: hud.speed });
  assert.ok(texts.some(function (t) { return t === String(stats.str); }));
  assert.ok(texts.some(function (t) { return t === stats.hp + "/" + stats.hpMax; }));
  assert.ok(texts.every(function (t) { return t.indexOf("FORÇA") === -1; }));
  assert.ok(texts.every(function (t) { return t.indexOf("VIDA") === -1; }));
  assert.ok(texts.every(function (t) { return t.indexOf("INT") === -1; }));
  assert.ok(strokes.length >= 1);
  assert.ok(strokes[0][2] > strokes[0][3]);
  assert.equal(
    texts.filter(function (t) { return t.indexOf("ESPADA") !== -1; }).length,
    0
  );
});

test("vignette de dano é um degradê vermelho nas bordas", function () {
  var stops = [];
  var rects = [];
  var grad = {
    addColorStop: function (t, c) { stops.push({ t: t, c: c }); }
  };
  var ctx = {
    createRadialGradient: function (x0, y0, r0, x1, y1, r1) {
      grad.r0 = r0;
      grad.r1 = r1;
      return grad;
    },
    fillRect: function (x, y, w, h) { rects.push({ x: x, y: y, w: w, h: h, c: ctx.fillStyle }); },
    fillStyle: ""
  };
  Dino.drawHurtVignette(ctx, 800, 600, 1);
  assert.ok(grad.r1 > grad.r0);
  assert.ok(stops.length >= 2);
  assert.ok(stops[stops.length - 1].c.indexOf("255") !== -1 || stops[stops.length - 1].c.indexOf("200") !== -1 || stops[stops.length - 1].c.indexOf("180") !== -1);
  assert.deepEqual(rects[0], { x: 0, y: 0, w: 800, h: 600, c: grad });
});
