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
