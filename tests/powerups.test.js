var test = require("node:test");
var assert = require("node:assert/strict");
require("../js/config.js");
require("../js/collision.js");
var Dino = require("../js/powerups.js");

test("há pelo menos 25 efeitos sorteáveis", function () {
  assert.ok(Dino.EFFECTS.length >= 25);
  var ids = Dino.EFFECTS.map(function (e) { return e.id; });
  [
    "doubleJump", "skate", "hat", "blaster", "shield",
    "magnet", "mini", "titan", "wings", "coffee",
    "spring", "clock", "ghost", "balloon", "gravity",
    "sword", "spear", "heart", "boots", "ice",
    "chili", "crystal", "cloak", "quake", "horn", "star", "potion"
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

test("resolveObstacleHit tira vida e só derruba em 0", function () {
  var kit = Dino.createPowerKit();
  var large = { typeConfig: { type: "cactusLarge" } };
  var small = { typeConfig: { type: "cactusSmall" } };
  assert.equal(kit.hp, 1);
  Dino.applyEffect(kit, "heart");
  assert.ok(kit.hp > 1);
  assert.equal(Dino.resolveObstacleHit(kit, large), "hurt");
  Dino.applyEffect(kit, "titan");
  assert.equal(Dino.resolveObstacleHit(kit, small), "stomp");
  kit.hp = 1;
  assert.equal(Dino.resolveObstacleHit(kit, large), "crash");
  assert.equal(kit.hp, 0);
});

test("ímã puxa o pickup em direção ao dino", function () {
  var kit = Dino.createPowerKit();
  Dino.applyEffect(kit, "magnet");
  var pickup = { xPos: 110, yPos: 80, width: 16, height: 16, remove: false };
  var tRex = { xPos: 50, yPos: 93, config: { width: 44, height: 47 } };
  Dino.updatePickup(pickup, 16.67, 6, kit, tRex);
  assert.ok(pickup.xPos < 110);
});

test("ímã puxa o ovo para cima quando o dino está no ar", function () {
  var kit = Dino.createPowerKit();
  Dino.applyEffect(kit, "magnet");
  var pickup = Dino.createPickup(50);
  var groundY = pickup.yPos;
  var tRex = { xPos: 50, yPos: 40, config: { width: 44, height: 47 } };
  Dino.updatePickup(pickup, 16.67, 6, kit, tRex);
  assert.ok(pickup.yPos < groundY);
});

test("ovo imantado no pulo encosta no dino em vez de sumir", function () {
  var kit = Dino.createPowerKit();
  Dino.applyEffect(kit, "magnet");
  var pickup = Dino.createPickup(50);
  var tRex = { xPos: 50, yPos: 40, config: { width: 44, height: 47 } };
  var n;
  for (n = 0; n < 40; n++) {
    Dino.updatePickup(pickup, 16.67, 6, kit, tRex);
    if (pickup.remove || Dino.pickupHitsTrex(pickup, tRex)) break;
  }
  assert.equal(pickup.remove, false);
  assert.ok(Dino.pickupHitsTrex(pickup, tRex));
});

test("ímã forte não atravessa o dino no pulo", function () {
  var kit = Dino.createPowerKit();
  var i;
  for (i = 0; i < 12; i++) Dino.applyEffect(kit, "magnet");
  var pickup = Dino.createPickup(400);
  var tRex = { xPos: 50, yPos: 40, config: { width: 44, height: 47 } };
  Dino.updatePickup(pickup, 16.67, 6, kit, tRex);
  assert.equal(pickup.remove, false);
  assert.ok(Dino.pickupHitsTrex(pickup, tRex));
});

test("alcance do ímã cresce a cada pilha", function () {
  assert.equal(Dino.magnetRange({ magnet: 0 }), 0);
  assert.ok(Dino.magnetRange({ magnet: 1 }) > 0);
  assert.ok(Dino.magnetRange({ magnet: 2 }) > Dino.magnetRange({ magnet: 1 }));
  assert.ok(Dino.magnetRange({ magnet: 3 }) > Dino.magnetRange({ magnet: 2 }));
});

test("1 ímã só puxa de perto; mais ímãs alcançam mais longe", function () {
  var tRex = { xPos: 50, yPos: 93, config: { width: 44, height: 47 } };
  var far = { xPos: 200, yPos: 80, width: 16, height: 16, remove: false };
  var kit1 = Dino.createPowerKit();
  Dino.applyEffect(kit1, "magnet");
  var x0 = far.xPos;
  Dino.updatePickup(far, 16.67, 0, kit1, tRex);
  assert.equal(far.xPos, x0);
  var kit3 = Dino.createPowerKit();
  Dino.applyEffect(kit3, "magnet");
  Dino.applyEffect(kit3, "magnet");
  Dino.applyEffect(kit3, "magnet");
  Dino.updatePickup(far, 16.67, 0, kit3, tRex);
  assert.ok(far.xPos < x0);
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

test("itens descem com o corpo quando o dino agacha", function () {
  var kit = Dino.createPowerKit();
  Dino.applyEffect(kit, "balloon");
  Dino.applyEffect(kit, "wings");
  Dino.applyEffect(kit, "hat");
  Dino.applyEffect(kit, "blaster");
  Dino.applyEffect(kit, "shield");
  var stand = Dino.sideGear(kit, 50, 93, false);
  var duck = Dino.sideGear(kit, 50, 93, true);
  assert.ok(duck.wings[0].y > stand.wings[0].y);
  assert.ok(duck.balloons[0].y > stand.balloons[0].y);
  assert.ok(duck.hats[0].y > stand.hats[0].y);
  assert.ok(duck.gun.y > stand.gun.y);
  assert.ok(duck.shield.y > stand.shield.y);
});

test("espada e lança geram hitbox à frente do dino", function () {
  var kit = Dino.createPowerKit();
  Dino.applyEffect(kit, "sword");
  Dino.applyEffect(kit, "spear");
  assert.equal(kit.sword, 1);
  assert.equal(kit.spear, 1);
  var tRex = { xPos: 50, yPos: 93, facing: 1, config: { width: 44, height: 47 } };
  var boxes = Dino.attackHitboxes(kit, tRex);
  assert.ok(boxes.length >= 2);
  assert.ok(boxes[0].x >= tRex.xPos + 40);
  tRex.facing = -1;
  var left = Dino.attackHitboxes(kit, tRex);
  assert.ok(left[0].x < tRex.xPos);
});

test("coração aumenta a vida máxima e o hit só reduz HP", function () {
  var kit = Dino.createPowerKit();
  Dino.applyEffect(kit, "heart");
  var large = { typeConfig: { type: "cactusLarge" } };
  assert.ok(kit.hp > 1);
  assert.equal(Dino.resolveObstacleHit(kit, large), "hurt");
  assert.ok(kit.hp > 1);
  assert.equal(kit.hearts, 1);
});

test("poção cura 5 de vida", function () {
  var kit = Dino.createPowerKit();
  assert.equal(kit.hp, 1);
  Dino.applyEffect(kit, "potion");
  assert.equal(kit.potions, 1);
  assert.equal(kit.hp, 6);
  assert.equal(kit.hpMax, 6);
  var e = Dino.effectById("potion");
  assert.equal(e.stats.hp, 5);
  assert.ok(Dino.effectStatLine(e).indexOf("+5 VIDA") !== -1);
});

test("canAttack só com arma ou blaster", function () {
  var kit = Dino.createPowerKit();
  assert.equal(Dino.canAttack(kit), false);
  Dino.applyEffect(kit, "sword");
  assert.equal(Dino.canAttack(kit), true);
});

test("rpgStats parte de força 1, vel 6, vida 1, pulo 1 e int 1", function () {
  var s = Dino.rpgStats(Dino.createPowerKit());
  assert.equal(s.str, 1);
  assert.equal(s.spd, 6);
  assert.equal(s.hp, 1);
  assert.equal(s.hpMax, 1);
  assert.equal(s.jump, 1);
  assert.equal(s.int, 1);
});

test("rpgStats escala força, velocidade, vida, pulo e inteligência", function () {
  var kit = Dino.createPowerKit();
  Dino.applyEffect(kit, "gravity");
  Dino.applyEffect(kit, "sword");
  Dino.applyEffect(kit, "skate");
  Dino.applyEffect(kit, "heart");
  Dino.applyEffect(kit, "doubleJump");
  Dino.applyEffect(kit, "coffee");
  var s = Dino.rpgStats(kit);
  assert.ok(s.str >= 3);
  assert.equal(s.spd, 7);
  assert.ok(s.hpMax > 3);
  assert.equal(s.hp, s.hpMax);
  assert.ok(s.jump >= 2);
  assert.ok(s.int >= 4);
});

test("café dá mais inteligência que o ímã", function () {
  var cafe = Dino.createPowerKit();
  var ima = Dino.createPowerKit();
  Dino.applyEffect(cafe, "coffee");
  Dino.applyEffect(ima, "magnet");
  assert.ok(Dino.rpgStats(cafe).int > Dino.rpgStats(ima).int);
});

test("titã rende mais de um atributo e chapéu rende menos no total", function () {
  var titan = Dino.effectById("titan").stats;
  var hat = Dino.effectById("hat").stats;
  assert.ok(titan.str >= 1 && titan.hp >= 1);
  function total(s) {
    return (s.str || 0) + (s.spd || 0) + (s.hp || 0) + (s.jump || 0) + (s.int || 0);
  }
  assert.ok(total(titan) > total(hat));
});

test("toda evolução tem descrição do que faz", function () {
  Dino.EFFECTS.forEach(function (e) {
    assert.ok(e.desc && e.desc.length > 8, "falta desc " + e.id);
    assert.ok(e.stats, "falta stats " + e.id);
    assert.ok(Dino.effectStatLine(e).indexOf("+") !== -1, "falta linha de atributo " + e.id);
  });
});

test("kitHudItems lista ícones com contagem e ignora esgotados", function () {
  var kit = Dino.createPowerKit();
  Dino.applyEffect(kit, "shield");
  Dino.applyEffect(kit, "shield");
  Dino.applyEffect(kit, "sword");
  kit.shields = 0;
  var items = Dino.kitHudItems(kit);
  assert.equal(items.length, 1);
  assert.equal(items[0].id, "sword");
  assert.equal(items[0].count, 1);
});
