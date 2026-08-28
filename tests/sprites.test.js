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
