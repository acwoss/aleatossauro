var test = require("node:test");
var assert = require("node:assert/strict");
require("../js/config.js");
require("../js/sprites.js");
var Dino = require("../js/horizon.js");

function mockCtx() {
  var fills = [];
  return {
    fills: fills,
    fillStyle: "",
    save: function () {},
    restore: function () {},
    translate: function () {},
    scale: function () {},
    rotate: function () {},
    fillRect: function (x, y, w, h) {
      fills.push({ x: x, y: y, w: w, h: h, style: this.fillStyle });
    }
  };
}

var palette = Dino.palette(false);

test("areia do deserto cobre do horizonte até o rodapé da tela", function () {
  var h = new Dino.Horizon(600, 320);
  var ctx = mockCtx();
  h.draw(ctx, palette);
  var sand = ctx.fills.filter(function (f) {
    return f.style === palette.sand && f.y <= 127 && f.y + f.h >= 320;
  });
  assert.ok(sand.length >= 1);
});

test("fauna de enfeite é rara e fica abaixo da linha de jogo", function () {
  var h = new Dino.Horizon(600, 320);
  assert.ok(h.fauna.length <= 2);
  h.fauna.forEach(function (d) {
    assert.ok(d.y > h.lineY);
  });
});

test("fauna desliza com o chão e reaparece à direita", function () {
  var h = new Dino.Horizon(600, 320);
  h.fauna = [{ x: -80, y: 200, scale: 0.6, dead: true, facing: 1, color: 0, blinkOn: false, blinkTimer: 0, lying: true }];
  h.update(1000, 6, true);
  assert.ok(h.fauna[0].x > 500);
});
