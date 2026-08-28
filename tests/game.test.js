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
require("../js/boss.js");
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
  g.immuneMs = 2000;
  g.restart();
  assert.equal(g.kit.extraJumps, 0);
  assert.equal(g.kit.owned.length, 0);
  assert.equal(g.immuneMs, 0);
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
  g.update(16, 1020, { jumpPressed: true, duck: false, chooseKey: 1 });
  assert.equal(g.status, "CHOOSING");
  assert.equal(g.kit.owned.length, 0);
  g.update(16, 1030, { jumpPressed: false, duck: false, pointer: { clientX: 2, clientY: 2 } });
  assert.equal(g.status, "CHOOSING");
  assert.equal(g.kit.owned.length, 0);
  var rects = Dino.choiceCardRects(g.layout.logicalWidth);
  var click = {
    clientX: (rects[1].x + 8) * g.layout.scale,
    clientY: g.layout.offsetY + (rects[1].y + 8) * g.layout.scale
  };
  g.update(16, 1040, { jumpPressed: false, duck: false, pointer: click });
  assert.equal(g.status, "RUNNING");
  assert.equal(g.kit.owned[0], kept);
  assert.equal(g.choice, null);
});

test("escolher evolução deixa o dino imune por 3s", function () {
  var g = Dino.createGameState({ innerWidth: 800, innerHeight: 600, isMobile: false });
  g.status = "CHOOSING";
  g.choice = { options: [Dino.EFFECTS[0], Dino.EFFECTS[1]], selected: 0 };
  g.hud.choice = g.choice;
  g.applyChoice(0);
  assert.equal(g.status, "RUNNING");
  assert.equal(g.immuneMs, 3000);
});

test("imune atravessa cacto sem crash e sem gastar escudo", function () {
  var g = Dino.createGameState({ innerWidth: 800, innerHeight: 600, isMobile: false });
  g.status = "RUNNING";
  g.runningTime = 4000;
  Dino.applyEffect(g.kit, "shield");
  Dino.syncTrexFromKit(g.tRex, g.kit);
  g.immuneMs = 3000;
  g.tRex.update(0, Dino.TrexStatus.RUNNING);
  var cactusType = Dino.OBSTACLE_TYPES.filter(function (t) { return t.type === "cactusSmall"; })[0];
  var cactus = new Dino.Obstacle(cactusType, g.tRex.xPos, 0.6, 6, false);
  cactus.xPos = g.tRex.xPos + 8;
  cactus.size = 1;
  cactus.width = cactusType.width;
  cactus.cloneCollisionBoxes();
  g.obstacles = [cactus];
  g.update(16, 1000, { jumpPressed: false, duck: false });
  assert.equal(g.status, "RUNNING");
  assert.equal(g.kit.shields, 1);
  assert.equal(cactus.remove, false);
  assert.ok(g.immuneMs < 3000);
  assert.ok(g.immuneMs > 2900);
});

test("depois da imunidade o cacto mata de novo", function () {
  var g = Dino.createGameState({ innerWidth: 800, innerHeight: 600, isMobile: false });
  g.status = "RUNNING";
  g.runningTime = 4000;
  g.immuneMs = 0;
  g.tRex.update(0, Dino.TrexStatus.RUNNING);
  var cactusType = Dino.OBSTACLE_TYPES.filter(function (t) { return t.type === "cactusSmall"; })[0];
  var cactus = new Dino.Obstacle(cactusType, g.tRex.xPos, 0.6, 6, false);
  cactus.xPos = g.tRex.xPos + 8;
  cactus.size = 1;
  cactus.width = cactusType.width;
  cactus.cloneCollisionBoxes();
  g.obstacles = [cactus];
  g.update(16, 1000, { jumpPressed: false, duck: false });
  assert.equal(g.status, "CRASHED");
});

test("imunidade acaba após 3s", function () {
  var g = Dino.createGameState({ innerWidth: 800, innerHeight: 600, isMobile: false });
  g.status = "RUNNING";
  g.runningTime = 4000;
  g.immuneMs = 16;
  g.update(16, 1000, { jumpPressed: false, duck: false });
  assert.equal(g.immuneMs, 0);
});

test("ímã no pulo abre a escolha em vez de sumir com o ovo", function () {
  var g = Dino.createGameState({ innerWidth: 800, innerHeight: 600, isMobile: false });
  g.status = "RUNNING";
  g.runningTime = 4000;
  var i;
  for (i = 0; i < 12; i++) Dino.applyEffect(g.kit, "magnet");
  Dino.syncTrexFromKit(g.tRex, g.kit);
  g.tRex.startJump(g.currentSpeed);
  g.tRex.updateJump(100);
  assert.ok(g.tRex.jumping);
  g.pickups.push(Dino.createPickup(g.tRex.xPos + 220));
  g.update(16.67, 1000, { jumpPressed: false, duck: false });
  assert.equal(g.status, "CHOOSING");
  assert.ok(g.choice && g.choice.options.length === 2);
});

test("pedra só some quando tira um skate", function () {
  var g = Dino.createGameState({ innerWidth: 800, innerHeight: 600, isMobile: false });
  g.status = "RUNNING";
  g.runningTime = 0;
  g.tRex.update(0, Dino.TrexStatus.RUNNING);
  var rockType = Dino.OBSTACLE_TYPES.filter(function (t) { return t.type === "rock"; })[0];
  var rock = new Dino.Obstacle(rockType, g.tRex.xPos, 0.6, 6, false);
  rock.xPos = g.tRex.xPos + 12;
  g.obstacles = [rock];
  g.kit.skate = 0;
  g.update(16, 1000, { jumpPressed: false, duck: false });
  assert.equal(g.status, "RUNNING");
  assert.equal(g.obstacles.length, 1);
  rock.xPos = g.tRex.xPos + 12;
  g.kit.skate = 2;
  g.update(16, 1020, { jumpPressed: false, duck: false });
  assert.equal(g.kit.skate, 1);
  assert.equal(g.obstacles.filter(function (o) { return !o.remove; }).length, 0);
});

test("cruzar 5000 pontos congela numa luta de boss", function () {
  var g = Dino.createGameState({ innerWidth: 800, innerHeight: 600, isMobile: false });
  g.status = "RUNNING";
  g.runningTime = 4000;
  g.currentSpeed = 13;
  g.distanceRan = 199960;
  g.update(50, 2000, { jumpPressed: false, duck: false });
  assert.equal(g.status, "BOSS");
  assert.ok(g.fight && g.fight.boss);
  assert.ok(g.fight.boss.scale > 1.3);
  assert.ok(g.tRex.xPos < 80);
  assert.ok(g.fight.boss.xPos > g.tRex.xPos);
});

test("no boss o dino anda com a seta e vencer devolve a corrida", function () {
  var g = Dino.createGameState({ innerWidth: 800, innerHeight: 600, isMobile: false });
  g.status = "RUNNING";
  g.startBoss();
  var x = g.tRex.xPos;
  g.update(16, 1000, { left: true, right: false, jumpPressed: false, duck: false });
  assert.equal(g.status, "BOSS");
  assert.ok(g.tRex.xPos < x);
  g.fight.boss.hp = 0;
  g.update(500, 1600, { jumpPressed: false, duck: false });
  assert.equal(g.status, "RUNNING");
  assert.equal(g.tRex.xPos, Dino.Config.startXPos);
  assert.ok(g.immuneMs > 0);
});

test("blaster só atira com firePressed", function () {
  var g = Dino.createGameState({ innerWidth: 800, innerHeight: 600, isMobile: false });
  g.status = "RUNNING";
  g.runningTime = 4000;
  Dino.applyEffect(g.kit, "blaster");
  var ammo = g.kit.blaster;
  g.update(800, 1000, { jumpPressed: false, duck: false });
  assert.equal(g.kit.blaster, ammo);
  assert.equal(g.bolts.length, 0);
  g.update(16, 1020, { jumpPressed: false, duck: false, firePressed: true });
  assert.equal(g.kit.blaster, ammo - 1);
  assert.ok(g.bolts.length >= 1);
});

test("ataque no boss causa 1 mais gravidades", function () {
  var g = Dino.createGameState({ innerWidth: 800, innerHeight: 600, isMobile: false });
  g.startBoss();
  Dino.applyEffect(g.kit, "sword");
  Dino.applyEffect(g.kit, "gravity");
  Dino.applyEffect(g.kit, "gravity");
  g.tRex.xPos = g.fight.boss.xPos - 40;
  g.tRex.facing = 1;
  var hp = g.fight.boss.hp;
  g.tryAttack();
  assert.equal(g.fight.boss.hp, hp - 3);
});
