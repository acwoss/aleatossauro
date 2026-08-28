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

  Dino.COSMETICS = [
    { id: "scarf", label: "CACHECOL", desc: "Esquenta o pescoço na corrida fria.", stats: { hp: 1 }, slot: "neck" },
    { id: "shades", label: "ÓCULOS ESCUROS", desc: "Cara de quem já viu o deserto inteiro.", stats: { int: 1 }, slot: "eye" },
    { id: "mohawk", label: "MOICANO", desc: "Crista punk que corta o vento.", stats: { spd: 1 }, slot: "head" },
    { id: "bowtie", label: "GRAVATA BORBOLETA", desc: "Elegância inesperada no rex.", stats: { int: 1 }, slot: "neck" },
    { id: "pack", label: "MOCHILA", desc: "Leva lanches e um pouco de coragem.", stats: { hp: 1, jump: 1 }, slot: "back" },
    { id: "bandana", label: "BANDANA", desc: "Prende o sol e o estilo.", stats: { spd: 1 }, slot: "head" },
    { id: "hoop", label: "ARGOLA", desc: "Um brinco que brilha a cada pulo.", stats: { int: 1 }, slot: "head", fit: { ux: 0.9, uy: 0.28 } },
    { id: "stache", label: "BIGODE", desc: "Respeito instantâneo na areia.", stats: { str: 1 }, slot: "snout" },
    { id: "cape", label: "CAPA", desc: "Voa para trás e anima o salto.", stats: { jump: 2 }, slot: "back" },
    { id: "bell", label: "SININHO", desc: "Tlim-tlim na cauda, ovos prestam atenção.", stats: { int: 1 }, slot: "tail" },
    { id: "blossom", label: "FLOR", desc: "Uma flor viva atrás da orelha.", stats: { hp: 1 }, slot: "head", fit: { ux: 0.12, uy: 0.12 } },
    { id: "crown", label: "COROA", desc: "Realeza do deserto, mente afiada.", stats: { int: 2 }, slot: "head" },
    { id: "visor", label: "VISEIRA", desc: "Corta o clarão e foca na pista.", stats: { spd: 1 }, slot: "eye" },
    { id: "poncho", label: "PONCHO", desc: "Tecido largo que amortece pancadas.", stats: { hp: 2 }, slot: "chest" },
    { id: "spikes", label: "ESPINHOS", desc: "Dorso farpado, ninguém encosta de graça.", stats: { str: 1 }, slot: "back" },
    { id: "goggles", label: "ÓCULOS DE MERGULHO", desc: "Pronto para poças imaginárias.", stats: { jump: 1 }, slot: "eye" },
    { id: "lei", label: "COLAR HAVAIANO", desc: "Flores no pescoço, ânimo no peito.", stats: { hp: 1 }, slot: "neck" },
    { id: "ribbon", label: "LAÇO", desc: "Laço na cauda, pulo mais solto.", stats: { jump: 1 }, slot: "tail" },
    { id: "antenna", label: "ANTENA", desc: "Captura sinais de ovos distantes.", stats: { int: 1 }, slot: "head", fit: { ux: 0.5, uy: -0.7 } },
    { id: "jetpack", label: "JETPACK", desc: "Foguetes nas costas, salto disparado.", stats: { jump: 2, spd: 1 }, slot: "back" },
    { id: "cowboy", label: "CHAPÉU COWBOY", desc: "Farwest no deserto do rex.", stats: { str: 1 }, slot: "head" },
    { id: "beanie", label: "TOUCA", desc: "Lã macia contra o vento da noite.", stats: { hp: 1 }, slot: "head" },
    { id: "phones", label: "FONE", desc: "Batida interna, raciocínio externo.", stats: { int: 1 }, slot: "head", fit: { ux: 0.45, uy: 0.18 } },
    { id: "beads", label: "CONTAS", desc: "Colar de contas coloridas no pescoço.", stats: { hp: 1 }, slot: "neck" },
    { id: "belt", label: "CINTO", desc: "Aperta o tronco e firma o golpe.", stats: { str: 1 }, slot: "chest", fit: { ux: 0.5, uy: 0.72 } },
    { id: "socks", label: "MEIAS", desc: "Listras nos pés, passada mais leve.", stats: { spd: 1 }, slot: "feet" },
    { id: "sandals", label: "SANDÁLIAS", desc: "Dedos livres para impulsionar o salto.", stats: { jump: 1 }, slot: "feet" },
    { id: "tailspike", label: "ESPINHO CAUDAL", desc: "A cauda vira uma lança curta.", stats: { str: 1 }, slot: "tail" },
    { id: "plume", label: "PENA", desc: "Pluma nas costas, queda mais doce.", stats: { jump: 1 }, slot: "back" },
    { id: "splatter", label: "TINTA", desc: "Mancha artística no flanco.", stats: { int: 1 }, slot: "chest" },
    { id: "patch", label: "TAPA-OLHO", desc: "Cara de pirata, golpe mais safado.", stats: { str: 1, int: 1 }, slot: "eye" },
    { id: "wizard", label: "CHAPÉU MAGO", desc: "Ponta torta, ideias em excesso.", stats: { int: 2 }, slot: "head" },
    { id: "halo", label: "AURÉOLA", desc: "Um círculo de luz acima da crista.", stats: { hp: 1, int: 1 }, slot: "head", fit: { ux: 0.45, uy: -0.75 } },
    { id: "ramhorns", label: "CHIFRES", desc: "Dois chifres curvos só de enfeite feroz.", stats: { str: 2 }, slot: "head", fit: { ux: 0.4, uy: -0.1 } },
    { id: "snorkel", label: "SNORKEL", desc: "Tubo amarelo para respirar drama.", stats: { hp: 1 }, slot: "snout" },
    { id: "monocle", label: "MONÓCULO", desc: "Um olho erudito, outro na pista.", stats: { int: 1 }, slot: "eye" },
    { id: "medal", label: "MEDALHA", desc: "Honra no peito, força no trombo.", stats: { str: 1 }, slot: "chest" },
    { id: "radio", label: "RÁDIO", desc: "Estatica nas costas, dicas mentais.", stats: { int: 1 }, slot: "back" },
    { id: "lantern", label: "LANTERNA", desc: "Facho no peito contra a noite.", stats: { int: 1 }, slot: "chest" },
    { id: "flag", label: "BANDEIRA", desc: "Tecido no dorso, corre para frente.", stats: { spd: 1 }, slot: "back" },
    { id: "vine", label: "CIPÓ", desc: "Cipó na cauda, balanço extra.", stats: { jump: 1 }, slot: "tail" },
    { id: "shroom", label: "COGUMELO", desc: "Chapéu vivo que absorve um pouco.", stats: { hp: 1 }, slot: "head" },
    { id: "honey", label: "MEL", desc: "Doce no peito, pernas mais ágeis.", stats: { hp: 1, spd: 1 }, slot: "chest" },
    { id: "boltcap", label: "RAIO", desc: "Faísca nas costas, pancada e corrida.", stats: { str: 1, spd: 1 }, slot: "back" },
    { id: "bubble", label: "BOLHA", desc: "Uma bolha boba que amortece.", stats: { hp: 1 }, slot: "chest" },
    { id: "leaf", label: "FOLHA", desc: "Folha na cabeça, salto de brisa.", stats: { jump: 1 }, slot: "head" },
    { id: "bone", label: "OSSO", desc: "Osso na boca, mordida mais pesada.", stats: { str: 1 }, slot: "snout" },
    { id: "muffler", label: "ECHARPE", desc: "Voltas de lã que viram vida extra.", stats: { hp: 2 }, slot: "neck" },
    { id: "prop", label: "HÉLICE", desc: "Hélice na crista, decolagem curta.", stats: { jump: 2 }, slot: "head", fit: { ux: 0.45, uy: -0.65 } },
    { id: "saddle", label: "SELA", desc: "Sela no dorso, firmeza e vigor.", stats: { hp: 1, str: 1 }, slot: "back" }
  ];

  Dino.EFFECTS = Dino.EFFECTS.concat(Dino.COSMETICS);

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
        return palette.cactus || "#3f8f4a";
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

  Dino.COSMETIC_SLOTS = {
    head: { part: "head", ux: 0.42, uy: -0.4 },
    eye: { part: "eye", ux: 0.5, uy: 0.5 },
    snout: { part: "head", ux: 0.96, uy: 0.42 },
    back: { part: "torso", ux: 0.02, uy: 0.05 },
    tail: { part: "torso", ux: -0.16, uy: 0.55 },
    chest: { part: "torso", ux: 0.52, uy: 0.28 },
    feet: { part: "feet", ux: 0.25, uy: 0.15 },
    neck: { part: "head", ux: 0.12, uy: 0.95 }
  };

  Dino.cosmeticPos = function (slot, xPos, yPos, ducking, index, effect) {
    var pose = ducking ? "duck1" : "wait";
    var map = Dino.COSMETIC_SLOTS;
    var spec = map[slot] || map.chest;
    var ux = spec.ux;
    var uy = spec.uy;
    var part = spec.part;
    var p;
    var spr;
    var b;
    if (effect && effect.fit) {
      if (effect.fit.part) part = effect.fit.part;
      if (effect.fit.ux != null) ux = effect.fit.ux;
      if (effect.fit.uy != null) uy = effect.fit.uy;
    }
    p =
      typeof Dino.trexPartPoint === "function"
        ? Dino.trexPartPoint(pose, part, ux, uy)
        : { x: ux * 20, y: uy * 20 };
    spr = effect && Dino.Sprites && Dino.Sprites.fx && Dino.Sprites.fx[effect.id];
    b =
      typeof Dino.spriteBounds === "function"
        ? Dino.spriteBounds(spr)
        : { x: 0, y: 0, w: 10, h: 10 };
    index = index || 0;
    return {
      x: xPos + p.x - (b.x + b.w / 2),
      y: yPos + p.y - (b.y + b.h / 2) + index * 2
    };
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
      wings: [],
      balloons: [],
      skate: (kit.skate || 0) > 0,
      skates: [],
      hats: [],
      gun: null,
      shield: null,
      sword: null,
      spear: null,
      cosmetics: []
    };
    var i;
    var n;
    var p;
    if (kit.wings > 0) {
      p = at("torso", 0.12, -0.1);
      gear.wings.push({
        x: p.x,
        y: p.y,
        scale: 1 + 0.28 * Math.max(0, kit.wings - 1)
      });
    }
    n = kit.balloon || 0;
    for (i = 0; i < n; i++) {
      p = at("torso", 0.18, -0.7);
      gear.balloons.push({
        x: p.x,
        y: p.y - i * 8,
        color: i
      });
    }
    for (i = 0; i < (kit.skate || 0); i++) {
      p = at("feet", 0.0, -0.4);
      gear.skates.push({
        x: p.x,
        y: p.y + i * 5
      });
    }
    for (i = 0; i < (kit.hats || 0); i++) {
      p = at("head", 0.15, -0.5);
      gear.hats.push({
        x: p.x,
        y: p.y - i * 5
      });
    }
    if (kit.blaster > 0) {
      gear.gun = at("head", 0.72, 1.15);
    }
    if (kit.shields > 0) {
      gear.shield = at("torso", 0.12, -0.45);
    }
    if (kit.sword > 0) {
      gear.sword = at("head", 0.62, 0.95);
    }
    if (kit.spear > 0) {
      gear.spear = at("head", 0.58, 1.15);
    }
    if (Dino.EFFECTS) {
      var e;
      var n;
      var s;
      var pos;
      for (i = 0; i < Dino.EFFECTS.length; i++) {
        e = Dino.EFFECTS[i];
        if (!e.slot) continue;
        n = Math.min(3, Dino.effectCount(kit, e.id));
        for (s = 0; s < n; s++) {
          pos = Dino.cosmeticPos(e.slot, xPos, yPos, ducking, s, e);
          gear.cosmetics.push({
            id: e.id,
            slot: e.slot,
            x: pos.x,
            y: pos.y,
            behind: e.slot === "back" || e.slot === "tail"
          });
        }
      }
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
    var jumpStat = typeof Dino.kitJump === "function" ? Dino.kitJump(kit) : 1;
    var jump = typeof Dino.jumpImpulse === "function" ? Dino.jumpImpulse(kit) : c.initialJumpVelocity;
    var rise = tRex.groundYPos - c.maxJumpHeight;
    var maxH = tRex.groundYPos - rise * jumpStat;
    var minH = c.minJumpHeight * jumpStat;
    if (kit.wings) gravity *= Math.pow(0.62, kit.wings);
    if (kit.balloon) gravity *= Math.pow(0.75, kit.balloon);
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
