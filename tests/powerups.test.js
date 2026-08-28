var test = require("node:test");
var assert = require("node:assert/strict");
require("../js/config.js");
require("../js/collision.js");
var Dino = require("../js/powerups.js");

test("há pelo menos 12 efeitos sorteáveis", function () {
  assert.ok(Dino.EFFECTS.length >= 12);
  var ids = Dino.EFFECTS.map(function (e) { return e.id; });
  [
    "doubleJump", "skate", "hat", "blaster", "shield",
    "magnet", "mini", "titan", "wings", "coffee",
    "spring", "clock", "ghost", "balloon", "gravity"
  ].forEach(function (id) {
    assert.ok(ids.indexOf(id) !== -1, "falta efeito " + id);
  });
});

test("cruzar múltiplos de 200 dispara pickup", function () {
  assert.equal(Dino.crossedPickupThreshold(199, 200), true);
  assert.equal(Dino.crossedPickupThreshold(200, 201), false);
  assert.equal(Dino.crossedPickupThreshold(399, 400), true);
  assert.equal(Dino.crossedPickupThreshold(0, 0), false);
});

test("applyEffect acumula pulo extra, café e escudo", function () {
  var kit = Dino.createPowerKit();
  Dino.applyEffect(kit, "doubleJump");
  Dino.applyEffect(kit, "doubleJump");
  Dino.applyEffect(kit, "coffee");
  Dino.applyEffect(kit, "coffee");
  Dino.applyEffect(kit, "shield");
  assert.equal(kit.extraJumps, 2);
  assert.equal(kit.coffee, 2);
  assert.equal(kit.shields, 1);
  assert.equal(kit.owned.length, 3);
});

test("rollEffect usa o rng e aplica o id", function () {
  var kit = Dino.createPowerKit();
  var calls = 0;
  function rng() {
    calls++;
    return 0;
  }
  var rolled = Dino.rollEffect(kit, rng);
  assert.equal(rolled.id, Dino.EFFECTS[0].id);
  assert.equal(kit.owned[0], rolled.id);
  assert.equal(calls, 1);
});

test("resolveObstacleHit consome escudo, depois fantasma, depois titã em cacto pequeno", function () {
  var kit = Dino.createPowerKit();
  Dino.applyEffect(kit, "shield");
  Dino.applyEffect(kit, "ghost");
  Dino.applyEffect(kit, "titan");
  var small = { typeConfig: { type: "cactusSmall" } };
  var large = { typeConfig: { type: "cactusLarge" } };
  assert.equal(Dino.resolveObstacleHit(kit, large), "shield");
  assert.equal(kit.shields, 0);
  assert.equal(Dino.resolveObstacleHit(kit, large), "ghost");
  assert.equal(kit.ghosts, 0);
  assert.equal(Dino.resolveObstacleHit(kit, small), "stomp");
  assert.equal(Dino.resolveObstacleHit(kit, large), "crash");
});

test("ímã puxa o pickup em direção ao dino", function () {
  var kit = Dino.createPowerKit();
  Dino.applyEffect(kit, "magnet");
  var pickup = { xPos: 200, yPos: 80, width: 16, height: 16, remove: false };
  var tRex = { xPos: 50, yPos: 93, config: { width: 44, height: 47 } };
  Dino.updatePickup(pickup, 16.67, 6, kit, tRex);
  assert.ok(pickup.xPos < 200);
});

test("ovo fica no chão e não flutua", function () {
  var p = Dino.createPickup(600);
  var feetY = Dino.DEFAULT_HEIGHT - Dino.Config.bottomPad;
  assert.equal(p.yPos + p.height, feetY);
  var y = p.yPos;
  Dino.updatePickup(p, 100, 6, Dino.createPowerKit(), null);
  assert.equal(p.yPos, y);
});

test("efeito gravidade acumula queda mais rápida", function () {
  var kit = Dino.createPowerKit();
  assert.equal(Dino.fallMultiplier(kit, -4), 1);
  Dino.applyEffect(kit, "gravity");
  Dino.applyEffect(kit, "gravity");
  assert.ok(Dino.fallMultiplier(kit, 2) > Dino.fallMultiplier(kit, -4));
  assert.ok(kit.gravity >= 2);
});

test("vista lateral: uma asa atrás, não duas", function () {
  var kit = Dino.createPowerKit();
  Dino.applyEffect(kit, "wings");
  Dino.applyEffect(kit, "wings");
  var gear = Dino.sideGear(kit, 50, 93);
  assert.equal(gear.wings.length, 1);
  assert.ok(gear.wings[0].x >= 50);
  assert.ok(gear.wings[0].x < 94);
});

test("rollChoicePair sorteia dois efeitos distintos sem aplicar", function () {
  var kit = Dino.createPowerKit();
  var pair = Dino.rollChoicePair(function () { return 0; });
  assert.equal(pair.length, 2);
  assert.notEqual(pair[0].id, pair[1].id);
  assert.equal(pair[0].id, Dino.EFFECTS[0].id);
  assert.equal(pair[1].id, Dino.EFFECTS[1].id);
  assert.equal(kit.owned.length, 0);
  assert.equal(kit.extraJumps, 0);
});

test("mini, titã, balões e chapéus acumulam sem teto", function () {
  var kit = Dino.createPowerKit();
  var i;
  for (i = 0; i < 5; i++) {
    Dino.applyEffect(kit, "mini");
    Dino.applyEffect(kit, "titan");
    Dino.applyEffect(kit, "balloon");
    Dino.applyEffect(kit, "hat");
    Dino.applyEffect(kit, "wings");
  }
  assert.equal(kit.mini, 5);
  assert.equal(kit.titan, 5);
  assert.equal(kit.balloon, 5);
  assert.equal(kit.hats, 5);
  var gear = Dino.sideGear(kit, 50, 93);
  assert.equal(gear.balloons.length, 5);
  assert.ok(gear.wings[0].scale > 1 + 0.28 * 3);
});

test("blaster ganha munição finita e o tiro consome", function () {
  var kit = Dino.createPowerKit();
  Dino.applyEffect(kit, "blaster");
  assert.ok(kit.blaster >= 2);
  var ammo = kit.blaster;
  var tRex = { xPos: 50, yPos: 93, drawScale: 1 };
  var bolt = Dino.fireBlaster(kit, tRex);
  assert.ok(bolt);
  assert.equal(kit.blaster, ammo - 1);
  kit.blaster = 0;
  assert.equal(Dino.fireBlaster(kit, tRex), null);
});

test("tiro sai da arma à frente do dino", function () {
  var tRex = { xPos: 50, yPos: 93, drawScale: 1 };
  var m = Dino.blasterMuzzle(tRex);
  assert.ok(m.x >= tRex.xPos + 48);
  assert.ok(m.y > tRex.yPos);
  assert.ok(m.y < tRex.yPos + 40);
});

test("tiro só derruba um cacto do grupo", function () {
  require("../js/obstacles.js");
  var type = Dino.OBSTACLE_TYPES[0];
  var o = new Dino.Obstacle(type, 400, 0.6, 13, false);
  o.size = 3;
  o.width = type.width * 3;
  var firstX = o.xPos;
  Dino.applyBoltHit(o);
  assert.equal(o.remove, false);
  assert.equal(o.size, 2);
  assert.equal(o.xPos, firstX + type.width);
  Dino.applyBoltHit(o);
  Dino.applyBoltHit(o);
  assert.equal(o.remove, true);
});

test("pedra tira um skate e não mata sem skate", function () {
  var kit = Dino.createPowerKit();
  Dino.applyEffect(kit, "skate");
  Dino.applyEffect(kit, "skate");
  assert.equal(Dino.resolveRockHit(kit), "skate");
  assert.equal(kit.skate, 1);
  kit.skate = 0;
  assert.equal(Dino.resolveRockHit(kit), "pass");
  assert.equal(kit.skate, 0);
});

test("ptero por cima estoura um balão uma vez", function () {
  var kit = Dino.createPowerKit();
  Dino.applyEffect(kit, "balloon");
  Dino.applyEffect(kit, "balloon");
  var tRex = { xPos: 50, yPos: 93, config: { width: 44, height: 47 } };
  var ptero = {
    typeConfig: { type: "pterodactyl" },
    xPos: 40,
    width: 46,
    yPos: 50,
    balloonPopped: false
  };
  assert.equal(Dino.tryPopBalloon(kit, ptero, tRex), true);
  assert.equal(kit.balloon, 1);
  assert.equal(Dino.tryPopBalloon(kit, ptero, tRex), false);
  assert.equal(kit.balloon, 1);
});

test("balão, asa e skate ficam no corpo e skates empilham", function () {
  var kit = Dino.createPowerKit();
  Dino.applyEffect(kit, "balloon");
  Dino.applyEffect(kit, "wings");
  Dino.applyEffect(kit, "skate");
  Dino.applyEffect(kit, "skate");
  Dino.applyEffect(kit, "skate");
  var gear = Dino.sideGear(kit, 50, 93);
  assert.ok(gear.balloons[0].y >= 93 - 6);
  assert.ok(gear.wings[0].x >= 50);
  assert.equal(gear.skates.length, 3);
});
