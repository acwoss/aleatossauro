var test = require("node:test");
var assert = require("node:assert/strict");
require("../js/config.js");
require("../js/collision.js");
require("../js/sprites.js");
var Dino = require("../js/powerups.js");

test("evoluções são atributos, armas e tamanho", function () {
  var ids = Dino.EFFECTS.map(function (e) { return e.id; });
  var weapons;
  assert.ok(Dino.EFFECTS.length >= 10);
  assert.ok(Dino.EFFECTS.length <= 14);
  [
    "doubleJump", "boots", "heart", "coffee", "gravity",
    "spring", "shield", "sword", "spear", "blaster",
    "mini", "titan"
  ].forEach(function (id) {
    assert.ok(ids.indexOf(id) !== -1, "falta efeito " + id);
  });
  assert.equal(ids.length, new Set(ids).size);
  Dino.EFFECTS.forEach(function (e) {
    assert.ok(e.stats && Object.keys(e.stats).length, "falta stats " + e.id);
    assert.ok(!e.slot, "cosmético não pode entrar no pool " + e.id);
  });
  weapons = Dino.EFFECTS.filter(function (e) { return e.weapon; });
  assert.equal(weapons.length, 3);
  assert.equal(Dino.effectById("mini").weapon, undefined);
  assert.equal(Dino.effectById("titan").weapon, undefined);
});

test("cruzar o primeiro ovo em 400 pontos", function () {
  assert.equal(Dino.crossedPickupThreshold(399, 400), true);
  assert.equal(Dino.crossedPickupThreshold(400, 401), false);
  assert.equal(Dino.crossedPickupThreshold(0, 0), false);
});

test("intervalo minimo entre ovos é 400", function () {
  var kit = Dino.createPowerKit();
  assert.equal(Dino.Config.pickupScoreMin, 400);
  assert.ok(Dino.pickupInterval(0, kit) >= 400);
  Dino.applyEffect(kit, "coffee");
  assert.ok(Dino.pickupInterval(0, kit) >= 400);
  assert.ok(Dino.pickupInterval(2000, kit) >= 400);
});

test("intervalo do ovo cresce com o score e cai com inteligência", function () {
  var kit = Dino.createPowerKit();
  var low = Dino.createPowerKit();
  var scale = Dino.Config.pickupScoreScale || 2000;
  var late = scale * 2;
  var a = Dino.pickupInterval(0, kit);
  var b = Dino.pickupInterval(scale, kit);
  var c = Dino.pickupInterval(late, kit);
  assert.equal(a, 400);
  assert.ok(c > b);
  assert.ok(c > a);
  assert.equal(Dino.nextPickupScore(0, kit), 400);
  assert.equal(Dino.crossedPickupThreshold(399, 400, kit, 0), true);
  Dino.applyEffect(kit, "coffee");
  var intel = Dino.rpgStats(kit).int;
  assert.equal(intel, 4);
  assert.equal(Dino.pickupInterval(0, kit), 400);
  assert.ok(Dino.pickupInterval(late, kit) < Dino.pickupInterval(late, low));
  assert.ok(Dino.pickupInterval(late, kit) >= 400);
});

test("itens com PULO aumentam o impulso na mesma proporção do atributo", function () {
  var empty = { config: {}, groundYPos: 93 };
  var hop = { config: {}, groundYPos: 93 };
  var spring = { config: {}, groundYPos: 93 };
  var kitH = Dino.createPowerKit();
  var kitS = Dino.createPowerKit();
  var v0;
  Dino.syncTrexFromKit(empty, Dino.createPowerKit());
  Dino.applyEffect(kitH, "doubleJump");
  Dino.syncTrexFromKit(hop, kitH);
  Dino.applyEffect(kitS, "spring");
  Dino.syncTrexFromKit(spring, kitS);
  v0 = empty.config.initialJumpVelocity;
  assert.equal(Dino.rpgStats(kitH).jump, 3);
  assert.equal(Dino.rpgStats(kitS).jump, 4);
  assert.ok(hop.config.initialJumpVelocity < v0);
  assert.ok(spring.config.initialJumpVelocity < hop.config.initialJumpVelocity);
  assert.ok(Math.abs(hop.config.initialJumpVelocity / v0 - Math.sqrt(3)) < 0.02);
  assert.ok(Math.abs(spring.config.initialJumpVelocity / v0 - 2) < 0.02);
});

test("efeito oculto é aleatório e só com 1% de sorte", function () {
  var miss = Dino.createPowerKit();
  var hit = Dino.createPowerKit();
  var applied;
  Dino.applyEvolution(miss, "sword", function () { return 0.5; });
  assert.equal(Dino.effectCount(miss, "sword"), 1);
  assert.equal(miss.owned.length, 1);
  applied = Dino.applyEvolution(hit, "sword", function () { return 0; });
  assert.equal(applied[0], "sword");
  assert.equal(applied.length, 2);
  assert.notEqual(applied[1], "sword");
  assert.ok(Dino.effectCount(hit, applied[1]) >= 1);
  assert.equal(Dino.applyEvolution(Dino.createPowerKit(), "sword", function () { return 0.01; }).length, 1);
});

test("itens com VEL aumentam a corrida, não só o card", function () {
  var kit = Dino.createPowerKit();
  var base = Dino.maxRunSpeed(kit);
  Dino.applyEffect(kit, "boots");
  assert.equal(Dino.kitSpd(kit), 2);
  assert.ok(Dino.maxRunSpeed(kit) > base);
  assert.ok(Dino.runSpeedBonus(kit) > 0);
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
  assert.equal(kit.hp, 1);
  Dino.applyEffect(kit, "heart");
  assert.ok(kit.hp > 1);
  assert.equal(Dino.resolveObstacleHit(kit, large), "hurt");
  kit.hp = 1;
  assert.equal(Dino.resolveObstacleHit(kit, large), "crash");
  assert.equal(kit.hp, 0);
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

test("só armas aparecem na skin", function () {
  var kit = Dino.createPowerKit();
  Dino.applyEffect(kit, "heart");
  Dino.applyEffect(kit, "boots");
  Dino.applyEffect(kit, "spring");
  Dino.applyEffect(kit, "mini");
  Dino.applyEffect(kit, "titan");
  Dino.applyEffect(kit, "sword");
  Dino.applyEffect(kit, "spear");
  Dino.applyEffect(kit, "blaster");
  var stand = Dino.sideGear(kit, 50, 93, false);
  var duck = Dino.sideGear(kit, 50, 93, true);
  assert.equal((stand.cosmetics || []).length, 0);
  assert.equal((stand.hats || []).length, 0);
  assert.equal((stand.wings || []).length, 0);
  assert.equal((stand.balloons || []).length, 0);
  assert.ok(stand.sword);
  assert.ok(stand.spear);
  assert.ok(stand.gun);
  assert.ok(duck.gun.y > stand.gun.y);
  assert.ok(duck.sword.x > stand.sword.x);
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

test("atributos acumulam sem teto", function () {
  var kit = Dino.createPowerKit();
  var i;
  for (i = 0; i < 5; i++) {
    Dino.applyEffect(kit, "heart");
    Dino.applyEffect(kit, "boots");
    Dino.applyEffect(kit, "gravity");
  }
  assert.equal(kit.hearts, 5);
  assert.equal(kit.boots, 5);
  assert.equal(kit.gravity, 5);
  assert.ok(Dino.rpgStats(kit).hpMax > 10);
  assert.ok(Dino.kitSpd(kit) >= 10);
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

test("pedra não usa skate e só passa o hit", function () {
  var kit = Dino.createPowerKit();
  assert.equal(Dino.resolveRockHit(kit), "pass");
});

test("ptero por cima não estoura balão", function () {
  var kit = Dino.createPowerKit();
  var tRex = { xPos: 50, yPos: 93, config: { width: 44, height: 47 } };
  var ptero = {
    typeConfig: { type: "pterodactyl" },
    xPos: 40,
    width: 46,
    yPos: 50,
    balloonPopped: false
  };
  assert.equal(Dino.tryPopBalloon(kit, ptero, tRex), false);
});

test("armas descem com o corpo quando o dino agacha", function () {
  var kit = Dino.createPowerKit();
  Dino.applyEffect(kit, "blaster");
  Dino.applyEffect(kit, "sword");
  var stand = Dino.sideGear(kit, 50, 93, false);
  var duck = Dino.sideGear(kit, 50, 93, true);
  assert.ok(duck.gun.y > stand.gun.y);
  assert.ok(duck.sword.x > stand.sword.x);
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

test("canAttack só com arma ou blaster", function () {
  var kit = Dino.createPowerKit();
  assert.equal(Dino.canAttack(kit), false);
  Dino.applyEffect(kit, "sword");
  assert.equal(Dino.canAttack(kit), true);
});

test("imunidade após evolução é inteligência/2 em segundos", function () {
  var kit = Dino.createPowerKit();
  assert.equal(Dino.evolutionImmuneMs(kit), 500);
  Dino.applyEffect(kit, "coffee");
  assert.equal(Dino.evolutionImmuneMs(kit), 2000);
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
  Dino.applyEffect(kit, "boots");
  Dino.applyEffect(kit, "heart");
  Dino.applyEffect(kit, "doubleJump");
  Dino.applyEffect(kit, "coffee");
  var s = Dino.rpgStats(kit);
  assert.ok(s.str >= 3);
  assert.equal(s.spd, 8);
  assert.ok(s.hpMax > 3);
  assert.equal(s.hp, s.hpMax);
  assert.ok(s.jump >= 2);
  assert.ok(s.int >= 4);
});

test("café dá mais inteligência que o pulo", function () {
  var cafe = Dino.createPowerKit();
  var hop = Dino.createPowerKit();
  Dino.applyEffect(cafe, "coffee");
  Dino.applyEffect(hop, "doubleJump");
  assert.ok(Dino.rpgStats(cafe).int > Dino.rpgStats(hop).int);
});

test("lança rende mais de um atributo e velocidade rende um só", function () {
  var spear = Dino.effectById("spear").stats;
  var boots = Dino.effectById("boots").stats;
  assert.ok(spear.str >= 1 && spear.jump >= 1);
  function total(s) {
    return (s.str || 0) + (s.spd || 0) + (s.hp || 0) + (s.jump || 0) + (s.int || 0);
  }
  assert.ok(total(spear) >= total(boots));
});

test("toda evolução tem descrição do que faz", function () {
  Dino.EFFECTS.forEach(function (e) {
    assert.ok(e.desc && e.desc.length > 8, "falta desc " + e.id);
    assert.ok(e.stats, "falta stats " + e.id);
    assert.ok(Dino.effectStatLine(e).indexOf("+") !== -1, "falta linha de atributo " + e.id);
  });
});

test("mini encolhe e titã cresce, com os pés no chão", function () {
  var groundY = 150 - 47 - 10;
  var mini = { config: {}, groundYPos: groundY, yPos: groundY };
  var titan = { config: {}, groundYPos: groundY, yPos: groundY };
  var both = { config: {}, groundYPos: groundY, yPos: groundY };
  var kitM = Dino.createPowerKit();
  var kitT = Dino.createPowerKit();
  var kitB = Dino.createPowerKit();
  Dino.applyEffect(kitM, "mini");
  Dino.applyEffect(kitM, "mini");
  Dino.syncTrexFromKit(mini, kitM);
  Dino.applyEffect(kitT, "titan");
  Dino.syncTrexFromKit(titan, kitT);
  Dino.applyEffect(kitB, "mini");
  Dino.applyEffect(kitB, "titan");
  Dino.syncTrexFromKit(both, kitB);
  assert.ok(mini.drawScale < 1);
  assert.ok(Math.abs(mini.drawScale - 0.68 * 0.68) < 0.001);
  assert.ok(titan.drawScale > 1);
  assert.ok(Math.abs(titan.drawScale - 1.22) < 0.001);
  assert.ok(Math.abs(both.drawScale - 0.68 * 1.22) < 0.001);
  assert.equal(mini.yPos, groundY);
  assert.equal(titan.yPos, groundY);
  assert.equal(Dino.drawFeetY(mini), groundY + Dino.Config.trexHeight);
  assert.equal(mini.config.height, Dino.Config.trexHeight);
});

test("titã esmaga cacto pequeno e ainda toma dano do grande", function () {
  var kit = Dino.createPowerKit();
  Dino.applyEffect(kit, "titan");
  var hp = kit.hp;
  assert.equal(Dino.resolveObstacleHit(kit, { typeConfig: { type: "cactusSmall" } }), "stomp");
  assert.equal(kit.hp, hp);
  assert.equal(Dino.resolveObstacleHit(kit, { typeConfig: { type: "cactusLarge" } }), "hurt");
  assert.ok(kit.hp < hp);
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
