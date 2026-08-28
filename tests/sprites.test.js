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
  assert.ok(Dino.Sprites.nest.length > 2);
  assert.ok(Dino.Sprites.egg.length > 1);
});

test("olho fica na frente da cabeça", function () {
  ["wait", "run1", "jump", "duck1", "duck2"].forEach(function (pose) {
    var parts = Dino.trexParts(pose);
    var eye = parts.eye;
    var head = parts.head;
    assert.ok(eye.x >= head.x + head.w * 0.5, pose + " olho ainda atrás");
    assert.ok(eye.x + eye.w <= head.x + head.w, pose + " olho fora da cabeça");
    assert.ok(eye.y >= head.y && eye.y + eye.h <= head.y + head.h, pose + " olho fora na vertical");
  });
  var body = Dino.Sprites.trex.wait;
  var eyeRect = body.filter(function (r) { return r.w === 3 && r.h === 3; })[0];
  assert.ok(eyeRect);
  assert.ok(eyeRect.x >= 32);
});

test("cada efeito tem ícone de HUD 10x10", function () {
  require("../js/config.js");
  require("../js/collision.js");
  var P = require("../js/powerups.js");
  assert.ok(Dino.Sprites.fx);
  P.EFFECTS.forEach(function (e) {
    var icon = Dino.Sprites.fx[e.id];
    assert.ok(icon && icon.length, "falta ícone " + e.id);
    icon.forEach(function (r) {
      assert.ok(r.x + r.w <= 10, e.id + " passa de 10px");
      assert.ok(r.y + r.h <= 10, e.id + " passa de 10px");
    });
  });
});

test("ícones vestíveis lembram o objeto", function () {
  function has(id, pred, msg) {
    var icon = Dino.Sprites.fx[id];
    assert.ok(icon && icon.some(pred), msg || id);
  }
  has("patch", function (r) { return r.w >= 8 && r.h <= 2; }, "tapa-olho precisa de faixa");
  has("patch", function (r) { return r.w >= 4 && r.h >= 4 && r.w <= 7; }, "tapa-olho precisa de cobertura");
  has("shades", function (r) { return r.w >= 3 && r.w <= 5 && r.h >= 2 && r.h <= 4; }, "óculos precisa de lentes");
  has("goggles", function (r) { return r.w >= 3 && r.h >= 4; }, "óculos de mergulho precisa de copos");
  has("monocle", function (r) { return r.w === 2 && r.h >= 4; }, "monóculo precisa de aro");
  has("crown", function (r) { return r.y <= 1 && r.h >= 3 && r.w <= 3; }, "coroa precisa de pontas");
  has("cowboy", function (r) { return r.w >= 9 && r.h <= 3; }, "chapéu cowboy precisa de aba");
  has("bone", function (r) { return r.w >= 5 && r.h <= 3; }, "osso precisa de haste");
  has("scarf", function (r) { return r.h >= 4 && r.w <= 4; }, "cachecol precisa de pontas");
  has("jetpack", function (r) { return r.y >= 6 && r.h >= 2 && r.w <= 4; }, "jetpack precisa de jatos");
});
