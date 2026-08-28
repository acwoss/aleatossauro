(function (root) {
  var Dino = root.Dino || (root.Dino = {});

  Dino.EFFECTS = [
    { id: "doubleJump", label: "PULO DUPLO", desc: "Pulo extra no ar e salto mais alto.", stats: { jump: 2 } },
    { id: "boots", label: "VELOCIDADE", desc: "Corre mais rápido.", stats: { spd: 2 } },
    { id: "heart", label: "CORAÇÃO", desc: "Aumenta a vida máxima.", stats: { hp: 3 } },
    { id: "coffee", label: "INTELIGÊNCIA", desc: "Ovos voltam mais cedo.", stats: { int: 3 } },
    { id: "gravity", label: "FORÇA", desc: "Golpes mais fortes.", stats: { str: 2 } },
    { id: "spring", label: "MOLA", desc: "Pulos muito mais altos.", stats: { jump: 3 } },
    { id: "shield", label: "ESCUDO", desc: "Mais vida para aguentar pancada.", stats: { hp: 2 } },
    { id: "mini", label: "MINI-REX", desc: "Fica menor e passa sob pteros.", stats: { jump: 1, spd: 1 } },
    { id: "titan", label: "TITÃ", desc: "Cresce e esmaga cactos pequenos.", stats: { str: 2, hp: 2 } },
    { id: "sword", label: "ESPADA", desc: "Golpe curto na frente.", stats: { str: 2 }, weapon: true },
    { id: "spear", label: "LANÇA", desc: "Alcance maior no ataque.", stats: { str: 1, jump: 1 }, weapon: true },
    { id: "blaster", label: "BLASTER", desc: "Atira à distância com Ctrl.", stats: { str: 1 }, weapon: true }
  ];

  Dino.COSMETICS = [];

  Dino.createPowerKit = function () {
    return {
      extraJumps: 0,
      blaster: 0,
      shields: 0,
      coffee: 0,
      spring: 0,
      gravity: 0,
      sword: 0,
      spear: 0,
      hearts: 0,
      boots: 0,
      mini: 0,
      titan: 0,
      stacks: {},
      hp: (Dino.Config && Dino.Config.baseHp) || 1,
      hpMax: (Dino.Config && Dino.Config.baseHp) || 1,
      owned: []
    };
  };

  Dino.pickupInterval = function (score, kit) {
    var base = (Dino.Config && Dino.Config.pickupScoreInterval) || 200;
    var growth = (Dino.Config && Dino.Config.pickupScoreGrowth) || 1.5;
    var scale = (Dino.Config && Dino.Config.pickupScoreScale) || 2000;
    var min = (Dino.Config && Dino.Config.pickupScoreMin) || 400;
    var intel = 1;
    var t;
    if (typeof Dino.rpgStats === "function") {
      intel = Math.max(1, Dino.rpgStats(kit).int);
    }
    t = Math.max(0, score || 0) / scale;
    return Math.max(min, Math.round((base * Math.pow(growth, t)) / intel));
  };

  Dino.nextPickupScore = function (lastAt, kit) {
    lastAt = lastAt || 0;
    return lastAt + Dino.pickupInterval(lastAt, kit);
  };

  Dino.crossedPickupThreshold = function (prevActual, actual, kit, lastAt) {
    var next;
    if (actual <= 0) return false;
    next = Dino.nextPickupScore(lastAt || 0, kit);
    return prevActual < next && actual >= next;
  };

  Dino.rollHiddenEffect = function (excludeId, rng) {
    rng = rng || Math.random;
    var pool = [];
    var i;
    var idx;
    if (!Dino.EFFECTS) return null;
    for (i = 0; i < Dino.EFFECTS.length; i++) {
      if (Dino.EFFECTS[i].id !== excludeId) pool.push(Dino.EFFECTS[i]);
    }
    if (!pool.length) return null;
    idx = Math.floor(rng() * pool.length);
    if (idx < 0) idx = 0;
    if (idx >= pool.length) idx = pool.length - 1;
    return pool[idx];
  };

  Dino.applyEvolution = function (kit, id, rng) {
    var applied = [id];
    var luck;
    var hidden;
    rng = rng || Math.random;
    Dino.applyEffect(kit, id);
    luck = rng();
    if (luck < ((Dino.Config && Dino.Config.hiddenLuck) || 0.01)) {
      hidden = Dino.rollHiddenEffect(id, rng);
      if (hidden && hidden.id) {
        Dino.applyEffect(kit, hidden.id);
        applied.push(hidden.id);
      }
    }
    return applied;
  };

  function own(kit, id) {
    if (kit.owned.indexOf(id) === -1) kit.owned.push(id);
  }

  Dino.applyEffect = function (kit, id) {
    own(kit, id);
    switch (id) {
      case "doubleJump":
        kit.extraJumps += 1;
        break;
      case "blaster":
        kit.blaster += Dino.Config.blasterAmmo || 6;
        break;
      case "shield":
        kit.shields += 1;
        break;
      case "coffee":
        kit.coffee += 1;
        break;
      case "spring":
        kit.spring += 1;
        break;
      case "gravity":
        kit.gravity += 1;
        break;
      case "sword":
        kit.sword += 1;
        break;
      case "spear":
        kit.spear += 1;
        break;
      case "heart":
        kit.hearts += 1;
        break;
      case "boots":
        kit.boots += 1;
        break;
      case "mini":
        kit.mini += 1;
        break;
      case "titan":
        kit.titan += 1;
        break;
      default:
        if (!kit.stacks) kit.stacks = {};
        kit.stacks[id] = (kit.stacks[id] || 0) + 1;
        break;
    }
    Dino.refreshKitHp(kit);
    return kit;
  };

  Dino.effectById = function (id) {
    var i;
    for (i = 0; i < Dino.EFFECTS.length; i++) {
      if (Dino.EFFECTS[i].id === id) return Dino.EFFECTS[i];
    }
    return null;
  };

  function rollIndex(rng) {
    var n = Dino.EFFECTS.length;
    var idx = Math.floor(rng() * n);
    if (idx >= n) idx = n - 1;
    if (idx < 0) idx = 0;
    return idx;
  }

  Dino.rollChoicePair = function (rng) {
    rng = rng || Math.random;
    var a = rollIndex(rng);
    var b = rollIndex(rng);
    if (b === a) b = (a + 1) % Dino.EFFECTS.length;
    return [Dino.EFFECTS[a], Dino.EFFECTS[b]];
  };

  Dino.rollEffect = function (kit, rng) {
    rng = rng || Math.random;
    var effect = Dino.EFFECTS[rollIndex(rng)];
    Dino.applyEffect(kit, effect.id);
    return effect;
  };

  Dino.effectCount = function (kit, id) {
    if (!kit) return 0;
    switch (id) {
      case "doubleJump":
        return kit.extraJumps || 0;
      case "blaster":
        return kit.blaster || 0;
      case "shield":
        return kit.shields || 0;
      case "coffee":
        return kit.coffee || 0;
      case "spring":
        return kit.spring || 0;
      case "gravity":
        return kit.gravity || 0;
      case "sword":
        return kit.sword || 0;
      case "spear":
        return kit.spear || 0;
      case "heart":
        return kit.hearts || 0;
      case "boots":
        return kit.boots || 0;
      case "mini":
        return kit.mini || 0;
      case "titan":
        return kit.titan || 0;
      default:
        return (kit.stacks && kit.stacks[id]) || 0;
    }
  };

  Dino.rpgStats = function (kit, opts) {
    kit = kit || {};
    opts = opts || {};
    var baseHp = (Dino.Config && Dino.Config.baseHp) || 1;
    var spd =
      opts.speed != null
        ? Math.round(opts.speed)
        : Math.round(6 + Dino.kitSpd(kit));
    var hpMax = kit.hpMax != null ? kit.hpMax : baseHp + Dino.sumEffectStat(kit, "hp");
    var hp = kit.hp != null ? kit.hp : hpMax;
    return {
      str: 1 + Dino.sumEffectStat(kit, "str"),
      spd: spd,
      hp: hp,
      hpMax: hpMax,
      jump: 1 + Dino.sumEffectStat(kit, "jump"),
      int: 1 + Dino.sumEffectStat(kit, "int")
    };
  };

  Dino.evolutionImmuneMs = function (kit) {
    var intel = Dino.rpgStats(kit).int;
    return (intel / 2) * 1000;
  };

  Dino.statStacks = function (kit, id) {
    if (!kit) return 0;
    if (id === "blaster") return (kit.blaster || 0) > 0 ? 1 : 0;
    return Dino.effectCount(kit, id);
  };

  Dino.sumEffectStat = function (kit, key) {
    var total = 0;
    var i;
    var effect;
    var count;
    if (!kit || !Dino.EFFECTS) return 0;
    for (i = 0; i < Dino.EFFECTS.length; i++) {
      effect = Dino.EFFECTS[i];
      count = Dino.statStacks(kit, effect.id);
      if (count > 0 && effect.stats && effect.stats[key]) {
        total += effect.stats[key] * count;
      }
    }
    return total;
  };

  Dino.kitSpd = function (kit) {
    return Dino.sumEffectStat(kit, "spd");
  };

  Dino.kitJump = function (kit) {
    return Math.max(1, 1 + Dino.sumEffectStat(kit, "jump"));
  };

  Dino.jumpImpulse = function (kit) {
    var base = (Dino.Config && Dino.Config.initialJumpVelocity) || -10;
    return base * Math.sqrt(Dino.kitJump(kit));
  };

  Dino.runSpeedBonus = function (kit) {
    return Dino.kitSpd(kit) * 0.7;
  };

  Dino.maxRunSpeed = function (kit) {
    var cap = (Dino.Config && Dino.Config.maxSpeed) || 13;
    return cap + Dino.kitSpd(kit) * 1.2;
  };

  Dino.refreshKitHp = function (kit) {
    var baseHp = (Dino.Config && Dino.Config.baseHp) || 1;
    var max = baseHp + Dino.sumEffectStat(kit, "hp");
    var prev = kit.hpMax != null ? kit.hpMax : baseHp;
    kit.hpMax = max;
    kit.hp = (kit.hp == null ? baseHp : kit.hp) + (max - prev);
    if (kit.hp > kit.hpMax) kit.hp = kit.hpMax;
    if (kit.hp < 0) kit.hp = 0;
    return kit;
  };

  Dino.hurtPlayer = function (kit, amount) {
    if (!kit) return "crash";
    kit.hp = Math.max(0, (kit.hp == null ? 1 : kit.hp) - (amount || 1));
    return kit.hp <= 0 ? "crash" : "hurt";
  };

  Dino.STAT_LABELS = {
    str: "FORÇA",
    spd: "VEL",
    hp: "VIDA",
    jump: "PULO",
    int: "INT"
  };

  Dino.effectStatLine = function (effect) {
    var stats = effect && effect.stats;
    var keys = ["str", "spd", "hp", "jump", "int"];
    var parts = [];
    var i;
    var n;
    if (!stats) return "";
    for (i = 0; i < keys.length; i++) {
      n = stats[keys[i]];
      if (n) parts.push((n > 0 ? "+" : "") + n + " " + Dino.STAT_LABELS[keys[i]]);
    }
    return parts.join("  ");
  };

  Dino.kitHudItems = function (kit) {
    var items = [];
    var i;
    var id;
    var count;
    var effect;
    if (!kit || !kit.owned) return items;
    for (i = 0; i < kit.owned.length; i++) {
      id = kit.owned[i];
      count = Dino.effectCount(kit, id);
      if (count <= 0) continue;
      effect = Dino.effectById(id);
      items.push({
        id: id,
        count: count,
        label: effect ? effect.label : id
      });
    }
    return items;
  };

  Dino.effectInk = function (id, palette) {
    palette = palette || {};
    switch (id) {
      case "skate":
      case "boots":
        return palette.skate || "#f1c40f";
      case "hat":
      case "heart":
      case "chili":
        return palette.hat || "#c0392b";
      case "blaster":
        return palette.gun || "#4a5560";
      case "shield":
      case "crystal":
        return palette.shield || "#2e86de";
      case "magnet":
      case "star":
      case "coffee":
        return palette.crate || "#e2b007";
      case "wings":
        return palette.dino || "#2d6a3f";
      case "ghost":
        return palette.hud || "#1e3a4c";
      case "ice":
        return palette.shield || "#2e86de";
      case "balloon":
        return (palette.balloon && palette.balloon[0]) || "#e74c3c";
      case "sword":
        return palette.sword || "#c0c7d0";
      case "spear":
        return palette.spear || "#8b5a2b";
      case "gravity":
      case "quake":
        return palette.rock || "#7a6a55";
      case "horn":
      case "spring":
      case "potion":
      case "mini":
        return palette.cactus || "#3f8f4a";
      case "titan":
        return palette.rock || "#7a6a55";
      case "cloak":
        return palette.ptero || "#6b4a7a";
      default: {
        var inks = [
          palette.hat,
          palette.skate,
          palette.shield,
          palette.crate,
          palette.dino,
          palette.ptero,
          palette.cactus,
          palette.sword,
          palette.spear,
          palette.hud
        ];
        var h = 0;
        var k;
        for (k = 0; k < String(id || "").length; k++) h += id.charCodeAt(k);
        return inks[h % inks.length] || palette.dino || "#2d6a3f";
      }
    }
  };

  Dino.resolveObstacleHit = function (kit, obstacle) {
    if (
      kit &&
      (kit.titan || 0) > 0 &&
      obstacle &&
      obstacle.typeConfig &&
      obstacle.typeConfig.type === "cactusSmall"
    ) {
      return "stomp";
    }
    return Dino.hurtPlayer(kit, 1);
  };

  Dino.fallMultiplier = function (kit, jumpVelocity) {
    if (jumpVelocity <= 0) return 1;
    return 1.7;
  };

  Dino.sideGear = function (kit, xPos, yPos, ducking) {
    kit = kit || {};
    var pose = ducking ? "duck1" : "wait";
    function at(part, ux, uy) {
      var p =
        typeof Dino.trexPartPoint === "function"
          ? Dino.trexPartPoint(pose, part, ux, uy)
          : { x: 0, y: ducking ? 16 : 0 };
      return { x: xPos + p.x, y: yPos + p.y };
    }
    var gear = {
      gun: null,
      sword: null,
      spear: null
    };
    if ((kit.blaster || 0) > 0) {
      gear.gun = at("head", 0.72, 1.15);
    }
    if ((kit.sword || 0) > 0) {
      gear.sword = at("head", 0.62, 0.95);
    }
    if ((kit.spear || 0) > 0) {
      gear.spear = at("head", 0.58, 1.15);
    }
    return gear;
  };

  Dino.scoreMultiplier = function () {
    return 1;
  };

  Dino.worldSpeedFactor = function () {
    return 1;
  };

  Dino.syncTrexFromKit = function (tRex, kit) {
    var c = Dino.Config;
    var jumpStat = typeof Dino.kitJump === "function" ? Dino.kitJump(kit) : 1;
    var jump = typeof Dino.jumpImpulse === "function" ? Dino.jumpImpulse(kit) : c.initialJumpVelocity;
    var rise = tRex.groundYPos - c.maxJumpHeight;
    var maxH = tRex.groundYPos - rise * jumpStat;
    var minH = c.minJumpHeight * jumpStat;
    tRex.config.gravity = c.gravity;
    tRex.config.initialJumpVelocity = jump;
    tRex.config.maxJumpHeight = maxH;
    tRex.config.minJumpHeight = minH;
    tRex.minJumpHeight = tRex.groundYPos - minH;
    tRex.extraJumps = kit.extraJumps;
    var scale = 1;
    var i;
    for (i = 0; i < (kit.mini || 0); i++) scale *= 0.68;
    for (i = 0; i < (kit.titan || 0); i++) scale *= 1.22;
    tRex.drawScale = scale;
    tRex.config.width = c.trexWidth;
    tRex.config.height = c.trexHeight;
  };

  Dino.drawFeetY = function (tRex) {
    return tRex.yPos + Dino.Config.trexHeight;
  };

  Dino.blasterMuzzle = function (tRex) {
    var s = tRex.drawScale || 1;
    var ducking = tRex.ducking;
    var pose = ducking ? "duck1" : "wait";
    var face = tRex.facing || 1;
    var fx = tRex.xPos;
    var fy = Dino.drawFeetY(tRex);
    var p =
      typeof Dino.trexPartPoint === "function"
        ? Dino.trexPartPoint(pose, "head", 1.18, 1.2)
        : { x: ducking ? 68 : 54, y: ducking ? 31 : 23 };
    var gx = face < 0 ? tRex.xPos - 10 : tRex.xPos + p.x;
    var gy = tRex.yPos + p.y;
    return {
      x: fx + (gx - fx) * s,
      y: fy + (gy - fy) * s,
      vx: face < 0 ? -1 : 1
    };
  };

  Dino.fireBlaster = function (kit, tRex) {
    if (!kit || kit.blaster <= 0) return null;
    kit.blaster -= 1;
    var m = Dino.blasterMuzzle(tRex);
    return Dino.createBolt(m.x, m.y, m.vx);
  };

  Dino.canAttack = function (kit) {
    return !!(
      kit &&
      ((kit.blaster || 0) > 0 ||
        (kit.sword || 0) > 0 ||
        (kit.spear || 0) > 0)
    );
  };

  Dino.meleeBox = function (tRex, reach) {
    var face = tRex.facing || 1;
    var w = (tRex.config && tRex.config.width) || 44;
    var x = face < 0 ? tRex.xPos - reach : tRex.xPos + w;
    return {
      x: x,
      y: tRex.yPos + 8,
      width: reach,
      height: 30
    };
  };

  Dino.attackHitboxes = function (kit, tRex) {
    var boxes = [];
    if (!kit || !tRex) return boxes;
    if (kit.sword > 0) boxes.push(Dino.meleeBox(tRex, 24 + 8 * kit.sword));
    if (kit.spear > 0) boxes.push(Dino.meleeBox(tRex, 40 + 10 * kit.spear));
    return boxes;
  };

  Dino.slashHitsBox = function (boxes, target) {
    var i;
    if (!boxes || !target) return false;
    for (i = 0; i < boxes.length; i++) {
      if (Dino.boxCompare(boxes[i], target)) return true;
    }
    return false;
  };

  Dino.applyBoltHit = function (obstacle) {
    if (!obstacle || obstacle.remove) return "none";
    var type = obstacle.typeConfig && obstacle.typeConfig.type;
    if (type === "rock") return "ignore";
    if ((type === "cactusSmall" || type === "cactusLarge") && obstacle.size > 1) {
      obstacle.size -= 1;
      obstacle.xPos += obstacle.typeConfig.width;
      obstacle.width = obstacle.typeConfig.width * obstacle.size;
      if (typeof obstacle.cloneCollisionBoxes === "function") {
        obstacle.cloneCollisionBoxes();
        if (obstacle.size > 1 && obstacle.collisionBoxes.length >= 3) {
          obstacle.collisionBoxes[1].width =
            obstacle.width -
            obstacle.collisionBoxes[0].width -
            obstacle.collisionBoxes[2].width;
          obstacle.collisionBoxes[2].x =
            obstacle.width - obstacle.collisionBoxes[2].width;
        }
      }
      return "chip";
    }
    obstacle.remove = true;
    return "kill";
  };

  Dino.resolveRockHit = function () {
    return "pass";
  };

  Dino.tryPopBalloon = function () {
    return false;
  };

  Dino.createPickup = function (logicalWidth) {
    var height = 18;
    var feetY = Dino.DEFAULT_HEIGHT - Dino.Config.bottomPad;
    return {
      xPos: logicalWidth,
      yPos: feetY - height,
      width: 22,
      height: height,
      remove: false
    };
  };

  Dino.pickupHitsTrex = function (pickup, tRex) {
    if (!pickup || pickup.remove) return false;
    var box = {
      x: tRex.xPos,
      y: tRex.yPos,
      width: tRex.config.width,
      height: tRex.config.height
    };
    var item = {
      x: pickup.xPos,
      y: pickup.yPos,
      width: pickup.width,
      height: pickup.height
    };
    return Dino.boxCompare(box, item);
  };

  Dino.magnetRange = function () {
    return 0;
  };

  Dino.updatePickup = function (pickup, dt, speed, kit) {
    var factor = Dino.worldSpeedFactor(kit);
    pickup.xPos -= Math.floor((speed * factor * Dino.FPS / 1000) * dt);
    if (pickup.xPos + pickup.width < 0) pickup.remove = true;
  };

  Dino.createBolt = function (x, y, vx) {
    return {
      xPos: x,
      yPos: y,
      width: 10,
      height: 4,
      vx: vx == null || vx === 0 ? 1 : vx,
      remove: false
    };
  };

  Dino.updateBolt = function (bolt, dt) {
    var dir = bolt.vx == null ? 1 : bolt.vx;
    bolt.xPos += (18 * Dino.FPS / 1000) * dt * dir;
    if (bolt.xPos > 2000 || bolt.xPos + bolt.width < -40) bolt.remove = true;
  };

  Dino.boltHitsObstacle = function (bolt, obstacle) {
    if (!obstacle || obstacle.remove) return false;
    if (obstacle.typeConfig && obstacle.typeConfig.type === "rock") return false;
    return Dino.boxCompare(
      { x: bolt.xPos, y: bolt.yPos, width: bolt.width, height: bolt.height },
      {
        x: obstacle.xPos,
        y: obstacle.yPos,
        width: obstacle.typeConfig.width * obstacle.size,
        height: obstacle.typeConfig.height
      }
    );
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = Dino;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
