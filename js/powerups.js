(function (root) {
  var Dino = root.Dino || (root.Dino = {});

  Dino.EFFECTS = [
    { id: "doubleJump", label: "PULO DUPLO", desc: "Ganha um pulo extra no ar.", stats: { jump: 2 } },
    { id: "skate", label: "SKATE", desc: "Desliza mais rápido pela areia.", stats: { spd: 1, jump: 1 } },
    { id: "hat", label: "CHAPÉU ESPACIAL", desc: "Um salto um pouco mais alto.", stats: { jump: 1 } },
    { id: "blaster", label: "BLASTER", desc: "Atira à distância com Ctrl.", stats: { str: 1 } },
    { id: "shield", label: "ESCUDO", desc: "Endurece o corpo e aguenta mais.", stats: { hp: 2 } },
    { id: "magnet", label: "ÍMÃ CÓSMICO", desc: "Puxa ovos de perto. Cada ímã extra alcança mais longe.", stats: { int: 1 } },
    { id: "mini", label: "MINI-REX", desc: "Fica menor e passa sob pteros.", stats: { jump: 1, spd: 1 } },
    { id: "titan", label: "TITÃ", desc: "Cresce e esmaga cactos pequenos.", stats: { str: 2, hp: 2 } },
    { id: "wings", label: "ASAS", desc: "A queda fica mais lenta.", stats: { jump: 2 } },
    { id: "coffee", label: "SUPER CAFÉ", desc: "A mente dispara e os pontos rendem.", stats: { int: 3 } },
    { id: "spring", label: "MOLA", desc: "Pulos muito mais altos.", stats: { jump: 3 } },
    { id: "clock", label: "RELÓGIO", desc: "O mundo corre mais devagar.", stats: { int: 1, jump: 1 } },
    { id: "ghost", label: "FANTASMA", desc: "Fica etéreo e ganha fôlego.", stats: { hp: 2, jump: 1 } },
    { id: "balloon", label: "BALÃO", desc: "Salva de um ptero por cima.", stats: { jump: 1, hp: 1 } },
    { id: "gravity", label: "GRAVIDADE", desc: "Queda pesada, golpes mais fortes.", stats: { str: 2 } },
    { id: "sword", label: "ESPADA", desc: "Golpe curto na frente.", stats: { str: 2 } },
    { id: "spear", label: "LANÇA", desc: "Alcance maior no ataque.", stats: { str: 1, jump: 1 } },
    { id: "heart", label: "CORAÇÃO", desc: "Recupera e amplia a vida.", stats: { hp: 3 } },
    { id: "boots", label: "BOTAS FOGUETE", desc: "Dispara a corrida para frente.", stats: { spd: 2 } },
    { id: "ice", label: "GELO", desc: "Congela o ritmo dos obstáculos.", stats: { int: 1, hp: 1 } },
    { id: "chili", label: "PIMENTA", desc: "Pulo nervoso e mais força.", stats: { str: 1, jump: 1 } },
    { id: "crystal", label: "CRISTAL", desc: "Mais pontos e clareza mental.", stats: { int: 2 } },
    { id: "cloak", label: "MANTO", desc: "Piscar de imunidade ao pular.", stats: { hp: 1, int: 1 } },
    { id: "quake", label: "TERREMOTO", desc: "O chão treme à sua volta.", stats: { str: 2, hp: 1 } },
    { id: "horn", label: "CHIFRE", desc: "Parte um cacto no impacto.", stats: { str: 1 } },
    { id: "star", label: "ESTRELA", desc: "Imunidade extra após evoluir.", stats: { hp: 1, int: 1 } },
    { id: "potion", label: "POÇÃO", desc: "Cura 5 de vida e amplia o máximo.", stats: { hp: 5 } }
  ];

  Dino.createPowerKit = function () {
    return {
      extraJumps: 0,
      skate: 0,
      hats: 0,
      blaster: 0,
      shields: 0,
      magnet: 0,
      mini: 0,
      titan: 0,
      wings: 0,
      coffee: 0,
      spring: 0,
      clock: 0,
      ghosts: 0,
      balloon: 0,
      gravity: 0,
      sword: 0,
      spear: 0,
      hearts: 0,
      boots: 0,
      ice: 0,
      chili: 0,
      crystal: 0,
      cloak: 0,
      quake: 0,
      horn: 0,
      stars: 0,
      potions: 0,
      hp: (Dino.Config && Dino.Config.baseHp) || 1,
      hpMax: (Dino.Config && Dino.Config.baseHp) || 1,
      owned: []
    };
  };

  Dino.crossedPickupThreshold = function (prevActual, actual) {
    var interval = Dino.Config.pickupScoreInterval || 200;
    if (actual <= 0) return false;
    return Math.floor(prevActual / interval) < Math.floor(actual / interval);
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
      case "skate":
        kit.skate += 1;
        break;
      case "hat":
        kit.hats += 1;
        break;
      case "blaster":
        kit.blaster += Dino.Config.blasterAmmo || 6;
        break;
      case "shield":
        kit.shields += 1;
        break;
      case "magnet":
        kit.magnet += 1;
        break;
      case "mini":
        kit.mini += 1;
        break;
      case "titan":
        kit.titan += 1;
        break;
      case "wings":
        kit.wings += 1;
        break;
      case "coffee":
        kit.coffee += 1;
        break;
      case "spring":
        kit.spring += 1;
        break;
      case "clock":
        kit.clock += 1;
        break;
      case "ghost":
        kit.ghosts += 1;
        break;
      case "balloon":
        kit.balloon += 1;
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
      case "ice":
        kit.ice += 1;
        break;
      case "chili":
        kit.chili += 1;
        break;
      case "crystal":
        kit.crystal += 1;
        break;
      case "cloak":
        kit.cloak += 1;
        break;
      case "quake":
        kit.quake += 1;
        break;
      case "horn":
        kit.horn += 1;
        break;
      case "star":
        kit.stars += 1;
        break;
      case "potion":
        kit.potions += 1;
        break;
      default:
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
      case "skate":
        return kit.skate || 0;
      case "hat":
        return kit.hats || 0;
      case "blaster":
        return kit.blaster || 0;
      case "shield":
        return kit.shields || 0;
      case "magnet":
        return kit.magnet || 0;
      case "mini":
        return kit.mini || 0;
      case "titan":
        return kit.titan || 0;
      case "wings":
        return kit.wings || 0;
      case "coffee":
        return kit.coffee || 0;
      case "spring":
        return kit.spring || 0;
      case "clock":
        return kit.clock || 0;
      case "ghost":
        return kit.ghosts || 0;
      case "balloon":
        return kit.balloon || 0;
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
      case "ice":
        return kit.ice || 0;
      case "chili":
        return kit.chili || 0;
      case "crystal":
        return kit.crystal || 0;
      case "cloak":
        return kit.cloak || 0;
      case "quake":
        return kit.quake || 0;
      case "horn":
        return kit.horn || 0;
      case "star":
        return kit.stars || 0;
      case "potion":
        return kit.potions || 0;
      default:
        return 0;
    }
  };

  Dino.rpgStats = function (kit, opts) {
    kit = kit || {};
    opts = opts || {};
    var baseHp = (Dino.Config && Dino.Config.baseHp) || 1;
    var spd =
      opts.speed != null
        ? Math.round(opts.speed)
        : Math.round(6 + (kit.skate || 0) * 1.4 + (kit.boots || 0) * 1.2);
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
        return palette.cactus || "#3f8f4a";
      case "cloak":
        return palette.ptero || "#6b4a7a";
      default:
        return palette.dino || "#2d6a3f";
    }
  };

  Dino.resolveObstacleHit = function (kit, obstacle) {
    if (
      kit.horn > 0 &&
      obstacle &&
      obstacle.typeConfig &&
      (obstacle.typeConfig.type === "cactusSmall" ||
        obstacle.typeConfig.type === "cactusLarge")
    ) {
      kit.horn -= 1;
      return "horn";
    }
    if (kit.titan && obstacle && obstacle.typeConfig && obstacle.typeConfig.type === "cactusSmall") {
      return "stomp";
    }
    return Dino.hurtPlayer(kit, 1);
  };

  Dino.fallMultiplier = function (kit, jumpVelocity) {
    kit = kit || {};
    if (jumpVelocity <= 0) return 1;
    return 1.7 + (kit.gravity || 0) * 0.55;
  };

  Dino.sideGear = function (kit, xPos, yPos, ducking) {
    kit = kit || {};
    var bodyY = ducking ? 16 : 0;
    var gear = {
      wings: [],
      balloons: [],
      skate: (kit.skate || 0) > 0,
      skates: [],
      hats: [],
      gun: null,
      shield: null,
      sword: null,
      spear: null
    };
    if (kit.wings > 0) {
      gear.wings.push({
        x: xPos + (ducking ? 10 : 4),
        y: yPos + 14 + bodyY,
        scale: 1 + 0.28 * Math.max(0, kit.wings - 1)
      });
    }
    var i;
    var n = kit.balloon || 0;
    for (i = 0; i < n; i++) {
      gear.balloons.push({
        x: xPos + (ducking ? 14 : 8),
        y: yPos + 4 + bodyY - i * 8,
        color: i
      });
    }
    for (i = 0; i < (kit.skate || 0); i++) {
      gear.skates.push({
        x: xPos + (ducking ? 12 : 8),
        y: yPos + 42 + i * 5
      });
    }
    for (i = 0; i < (kit.hats || 0); i++) {
      gear.hats.push({
        x: xPos + (ducking ? 38 : 18),
        y: yPos + (ducking ? 10 : -8) - i * 5
      });
    }
    if (kit.blaster > 0) {
      gear.gun = {
        x: xPos + (ducking ? 50 : 36),
        y: yPos + (ducking ? 28 : 20)
      };
    }
    if (kit.shields > 0) {
      gear.shield = {
        x: xPos + (ducking ? 12 : 6),
        y: yPos + (ducking ? 20 : 8)
      };
    }
    if (kit.sword > 0) {
      gear.sword = {
        x: xPos + (ducking ? 48 : 34),
        y: yPos + (ducking ? 18 : 16)
      };
    }
    if (kit.spear > 0) {
      gear.spear = {
        x: xPos + (ducking ? 46 : 32),
        y: yPos + (ducking ? 22 : 18)
      };
    }
    return gear;
  };

  Dino.scoreMultiplier = function (kit) {
    return 1 + (kit.coffee || 0) + (kit.crystal || 0);
  };

  Dino.worldSpeedFactor = function (kit) {
    var f = 1;
    var i;
    for (i = 0; i < (kit.clock || 0); i++) f *= 0.72;
    for (i = 0; i < (kit.ice || 0); i++) f *= 0.8;
    return f;
  };

  Dino.syncTrexFromKit = function (tRex, kit) {
    var c = Dino.Config;
    var gravity = c.gravity;
    var jump = c.initialJumpVelocity;
    var maxH = c.maxJumpHeight;
    var minH = c.minJumpHeight;
    if (kit.wings) gravity *= Math.pow(0.62, kit.wings);
    if (kit.balloon) gravity *= Math.pow(0.75, kit.balloon);
    if (kit.spring) {
      jump -= 3 * kit.spring;
      maxH = Math.max(8, maxH - 12 * kit.spring);
      minH += 8 * kit.spring;
    }
    if (kit.hats) jump -= 0.8 * kit.hats;
    if (kit.skate) jump -= 0.4 * kit.skate;
    if (kit.chili) {
      jump -= 2.4 * kit.chili;
      minH += 6 * kit.chili;
    }
    tRex.config.gravity = gravity;
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
    var face = tRex.facing || 1;
    var fx = tRex.xPos;
    var fy = Dino.drawFeetY(tRex);
    var gx = face < 0 ? tRex.xPos - 10 : tRex.xPos + (ducking ? 68 : 54);
    var gy = tRex.yPos + (ducking ? 31 : 23);
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
        (kit.spear || 0) > 0 ||
        (kit.quake || 0) > 0)
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
    if (kit.quake > 0) {
      boxes.push({
        x: tRex.xPos - 18,
        y: tRex.yPos + 22,
        width: 80,
        height: 28
      });
    }
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

  Dino.resolveRockHit = function (kit) {
    if (kit && kit.skate > 0) {
      kit.skate -= 1;
      return "skate";
    }
    return "pass";
  };

  Dino.tryPopBalloon = function (kit, obstacle, tRex) {
    if (!kit || !obstacle || !tRex) return false;
    if (!obstacle.typeConfig || obstacle.typeConfig.type !== "pterodactyl") return false;
    if (obstacle.balloonPopped) return false;
    if ((kit.balloon || 0) <= 0) return false;
    var overlapsX =
      tRex.xPos < obstacle.xPos + obstacle.width &&
      tRex.xPos + tRex.config.width > obstacle.xPos;
    if (!overlapsX) return false;
    kit.balloon -= 1;
    obstacle.balloonPopped = true;
    return true;
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

  Dino.magnetRange = function (kit) {
    var n = (kit && kit.magnet) || 0;
    if (n <= 0) return 0;
    return 72 + 48 * (n - 1);
  };

  Dino.updatePickup = function (pickup, dt, speed, kit, tRex) {
    var factor = Dino.worldSpeedFactor(kit);
    pickup.xPos -= Math.floor((speed * factor * Dino.FPS / 1000) * dt);
    if (kit && kit.magnet > 0 && tRex) {
      var tx = tRex.xPos + tRex.config.width / 2;
      var ty = tRex.yPos + tRex.config.height / 2;
      var px = pickup.xPos + pickup.width / 2;
      var py = pickup.yPos + pickup.height / 2;
      var dx = tx - px;
      var dy = ty - py;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= Dino.magnetRange(kit) && dist > 0) {
        var pull = Math.min(1, (0.12 * kit.magnet * dt) / 16);
        pickup.xPos += dx * pull;
        pickup.yPos += dy * pull;
      }
    }
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
