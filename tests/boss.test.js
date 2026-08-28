var test = require("node:test");
var assert = require("node:assert/strict");
require("../js/config.js");
require("../js/collision.js");
require("../js/sprites.js");
require("../js/powerups.js");
var Dino = require("../js/boss.js");

test("cruzar 5000 pontos dispara o boss", function () {
  assert.equal(Dino.crossedBossThreshold(4999, 5000), true);
  assert.equal(Dino.crossedBossThreshold(5000, 5001), false);
  assert.equal(Dino.crossedBossThreshold(9999, 10000), true);
  assert.equal(Dino.crossedBossThreshold(0, 200), false);
});

test("dificuldade do boss sobe com pontos/1000", function () {
  assert.equal(Dino.bossDifficulty(5000), 5);
  assert.equal(Dino.bossDifficulty(12000), 12);
  assert.ok(Dino.bossChargeSpeed(12) > Dino.bossChargeSpeed(5));
});

test("vida do boss é a pontuação atual dividida por 10", function () {
  assert.equal(Dino.bossMaxHp(5000), 500);
  assert.equal(Dino.bossMaxHp(12000), 1200);
  assert.equal(Dino.bossMaxHp(9), 1);
  var fight = Dino.createBossFight(600, 5000, function () { return 0; });
  assert.equal(fight.boss.hp, 500);
  assert.equal(fight.boss.maxHp, 500);
});

test("boss sorteado é maior e nasce à direita", function () {
  var fight = Dino.createBossFight(600, 5000, function () { return 0; });
  var boss = fight.boss;
  assert.ok(boss.scale > 1.4);
  assert.ok(boss.xPos > 300);
  assert.equal(boss.hp, boss.maxHp);
  assert.ok(boss.name);
  assert.equal(boss.yPos + boss.height, Dino.DEFAULT_HEIGHT - Dino.Config.bottomPad);
});

test("pulo na cabeça do boss causa dano", function () {
  var fight = Dino.createBossFight(600, 5000, function () { return 0; });
  var hp = fight.boss.hp;
  var tRex = {
    xPos: fight.boss.xPos + 8,
    yPos: fight.boss.yPos - 10,
    jumping: true,
    jumpVelocity: 4,
    ducking: false,
    drawScale: 1,
    config: { width: 44, height: 47 }
  };
  assert.equal(Dino.bossStompHit(tRex, fight.boss), true);
  Dino.hurtBoss(fight.boss, 1);
  assert.equal(fight.boss.hp, hp - 1);
  assert.equal(fight.boss.state, "hurt");
});

test("dano no boss segue a força das evoluções", function () {
  assert.equal(Dino.bossAttackDamage({}), 1);
  assert.equal(Dino.bossAttackDamage({ gravity: 0 }), 1);
  assert.equal(Dino.bossAttackDamage({ gravity: 1 }), 3);
  assert.equal(Dino.bossAttackDamage({ gravity: 4 }), 9);
});

test("força de espada também aumenta o dano no boss", function () {
  assert.equal(Dino.bossAttackDamage({ gravity: 1, sword: 2 }), 7);
});

test("contato de lado com o boss não é stomp", function () {
  var fight = Dino.createBossFight(600, 5000, function () { return 0; });
  var tRex = {
    xPos: fight.boss.xPos - 20,
    yPos: fight.boss.yPos + 20,
    jumping: false,
    jumpVelocity: 0,
    ducking: false,
    drawScale: 1,
    config: { width: 44, height: 47 }
  };
  assert.equal(Dino.bossStompHit(tRex, fight.boss), false);
  assert.equal(Dino.bossBodyHit(tRex, fight.boss), true);
});

test("mover o dino na arena respeita as bordas", function () {
  var tRex = { xPos: 32, config: { width: 44, height: 47 } };
  Dino.moveBossPlayer(tRex, { left: true, right: false }, 16.67, 600);
  assert.ok(tRex.xPos < 32);
  tRex.xPos = 8;
  Dino.moveBossPlayer(tRex, { left: true, right: false }, 16.67, 600);
  assert.equal(tRex.xPos, 8);
  assert.equal(tRex.facing, -1);
});
