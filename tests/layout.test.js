var test = require("node:test");
var assert = require("node:assert/strict");
require("../js/config.js");
var Dino = require("../js/layout.js");

test("desktop 1920x1080 aproxima 600 de largura lógica", function () {
  var l = Dino.computeLayout(1920, 1080);
  assert.equal(l.logicalHeight, 150);
  assert.ok(Math.abs(l.scale - 3.2) < 0.01);
  assert.equal(l.logicalWidth, 600);
  var leftover = 1080 - 150 * l.scale;
  assert.ok(l.offsetY < leftover / 2);
  assert.ok(l.viewHeight > 150);
});

test("telefone 390x844 usa scale 1 e largura da janela", function () {
  var l = Dino.computeLayout(390, 844);
  assert.equal(l.scale, 1);
  assert.equal(l.logicalWidth, 390);
  assert.equal(l.logicalHeight, 150);
  assert.ok(l.viewHeight > 150);
});

test("viewHeight chega no rodapé da janela em coords lógicas", function () {
  var l = Dino.computeLayout(1920, 1080);
  var bottom = l.offsetY + l.viewHeight * l.scale;
  assert.ok(Math.abs(bottom - 1080) < l.scale);
});
