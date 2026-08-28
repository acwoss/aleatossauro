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
  assert.equal(c.bg, "#9ed8f2");
  assert.equal(c.fg, "#2d6a3f");
  assert.equal(c.storageKey, "aleatossauro-hi");
  assert.equal(Dino.FPS, 60);
  assert.equal(Dino.DEFAULT_HEIGHT, 150);
});
