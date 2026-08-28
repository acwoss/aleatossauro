var test = require("node:test");
var assert = require("node:assert/strict");
require("../js/config.js");
require("../js/collision.js");
require("../js/sprites.js");
require("../js/powerups.js");
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

test("extraJumps permite segundo pulo no ar", function () {
  var groundY = 150 - 47 - 10;
  var t = new Dino.Trex(groundY);
  t.extraJumps = 1;
  t.startJump(6);
  t.updateJump(50);
  var yMid = t.yPos;
  var vMid = t.jumpVelocity;
  t.startJump(6);
  assert.equal(t.airJumpsUsed, 1);
  assert.ok(t.jumpVelocity < vMid);
  assert.equal(t.jumping, true);
  assert.ok(t.yPos <= yMid);
});

test("no chão com skate usa pose parada, não corrida", function () {
  var groundY = 150 - 47 - 10;
  var t = new Dino.Trex(groundY);
  t.powerKit = { skate: 1, wings: 0, balloon: 0, hats: 0, blaster: 0, shields: 0, ghosts: 0 };
  t.update(0, Dino.TrexStatus.RUNNING);
  assert.equal(t.poseKey(), "skate");
});

test("descida cai mais rápido que a subida", function () {
  var groundY = 150 - 47 - 10;
  function dropY(gravityStacks) {
    var t = new Dino.Trex(groundY);
    t.powerKit = { gravity: gravityStacks, skate: 0 };
    t.jumping = true;
    t.jumpVelocity = 4;
    t.yPos = 50;
    t.update(0, Dino.TrexStatus.JUMPING);
    t.updateJump(20);
    t.updateJump(20);
    return t.yPos;
  }
  assert.ok(dropY(2) > dropY(0));
});

test("mini-rex fica com os pés no chão", function () {
  var groundY = 150 - 47 - 10;
  var t = new Dino.Trex(groundY);
  var kit = Dino.createPowerKit();
  Dino.applyEffect(kit, "mini");
  Dino.applyEffect(kit, "mini");
  Dino.syncTrexFromKit(t, kit);
  assert.equal(t.yPos, groundY);
  assert.ok(t.drawScale < 1);
  assert.equal(t.config.height, Dino.Config.trexHeight);
  assert.equal(Dino.drawFeetY(t), groundY + Dino.Config.trexHeight);
});
