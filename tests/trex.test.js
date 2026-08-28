var test = require("node:test");
var assert = require("node:assert/strict");
require("../js/config.js");
require("../js/collision.js");
require("../js/sprites.js");
require("../js/skin.js");
require("../js/powerups.js");
var Dino = require("../js/trex.js");

function jumpPeakHeight(kit) {
  var groundY = 150 - 47 - 10;
  var t = new Dino.Trex(groundY);
  var peak;
  var i;
  Dino.syncTrexFromKit(t, kit);
  t.startJump(0);
  peak = t.yPos;
  for (i = 0; i < 120; i++) {
    t.updateJump(16.67);
    if (t.yPos < peak) peak = t.yPos;
    if (!t.jumping) break;
  }
  return groundY - peak;
}

test("altura do pulo é proporcional ao atributo de pulo", function () {
  var empty = Dino.createPowerKit();
  var hat = Dino.createPowerKit();
  var h0;
  var hHat;
  Dino.applyEffect(hat, "hat");
  h0 = jumpPeakHeight(empty);
  hHat = jumpPeakHeight(hat);
  assert.ok(hHat > h0);
  assert.ok(Math.abs(hHat / h0 - Dino.rpgStats(hat).jump) < 0.4);
});

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

test("agachar desenha a pintura da cabeça e dos pés", function () {
  var groundY = 150 - 47 - 10;
  var t = new Dino.Trex(groundY);
  t.skin = Dino.createSkin("#2d6a3f");
  Dino.paintSkin(t.skin, 20, 2, "#e74c3c");
  Dino.paintSkin(t.skin, 18, 44, "#111111");
  t.setDuck(true);
  var fills = [];
  var ctx = {
    save: function () {},
    restore: function () {},
    translate: function () {},
    scale: function () {},
    fillRect: function (x, y, w, h) {
      fills.push({ x: x, y: y, c: ctx.fillStyle });
    },
    fillStyle: "",
    globalAlpha: 1
  };
  t.draw(ctx, { dino: "#2d6a3f", balloon: ["#e74c3c"] });
  assert.ok(fills.some(function (f) { return f.c === "#e74c3c"; }));
  assert.ok(fills.some(function (f) { return f.c === "#111111"; }));
});
