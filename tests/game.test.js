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
require("../js/powerups.js");
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

test("restart zera o kit de power-ups", function () {
  var g = Dino.createGameState({ innerWidth: 800, innerHeight: 600 });
  Dino.applyEffect(g.kit, "doubleJump");
  g.restart();
  assert.equal(g.kit.extraJumps, 0);
  assert.equal(g.kit.owned.length, 0);
});

test("cruzar 200 pontos spawna um crate", function () {
  var g = Dino.createGameState({ innerWidth: 800, innerHeight: 600, isMobile: false });
  g.status = "RUNNING";
  g.runningTime = 4000;
  g.currentSpeed = 13;
  g.distanceRan = 7960;
  g.update(50, 1000, { jumpPressed: false, duck: false });
  assert.ok(g.pickups.length >= 1);
});

test("pegar ovo abre dois cards e só aplica a escolha", function () {
  var g = Dino.createGameState({ innerWidth: 800, innerHeight: 600, isMobile: false });
  g.status = "RUNNING";
  g.runningTime = 4000;
  var orig = Dino.rollChoicePair;
  Dino.rollChoicePair = function () {
    return [Dino.EFFECTS[0], Dino.EFFECTS[1]];
  };
  g.pickups.push({
    xPos: g.tRex.xPos,
    yPos: g.tRex.yPos,
    width: 22,
    height: 18,
    remove: false,
    bob: 0
  });
  g.update(16, 1000, { jumpPressed: false, duck: false });
  Dino.rollChoicePair = orig;
  assert.equal(g.status, "CHOOSING");
  assert.equal(g.choice.options.length, 2);
  assert.equal(g.kit.owned.length, 0);
  var kept = g.choice.options[1].id;
  g.update(16, 1020, { jumpPressed: false, duck: false, chooseKey: 1 });
  assert.equal(g.status, "RUNNING");
  assert.equal(g.kit.owned[0], kept);
  assert.equal(g.choice, null);
});
