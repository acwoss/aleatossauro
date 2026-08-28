(function (root) {
  var Dino = root.Dino || (root.Dino = {});
  Dino.FPS = 60;
  Dino.DEFAULT_HEIGHT = 150;
  Dino.clamp = function (n, min, max) {
    return Math.max(min, Math.min(max, n));
  };
  Dino.getRandomNum = function (min, max) {
    return min + Math.round(Math.random() * (max - min));
  };
  Dino.Config = {
    speed: 6,
    acceleration: 0.001,
    maxSpeed: 13,
    clearTime: 3000,
    gameoverClearTime: 1200,
    invertDistance: 700,
    invertFadeDuration: 12000,
    gapCoefficient: 0.6,
    maxGapCoefficient: 1.5,
    maxObstacleLength: 3,
    maxObstacleDuplication: 2,
    cloudFrequency: 0.5,
    maxClouds: 6,
    bgCloudSpeed: 0.2,
    gravity: 0.6,
    initialJumpVelocity: -10,
    minJumpHeight: 30,
    maxJumpHeight: 30,
    speedDropCoefficient: 3,
    dropVelocity: -5,
    trexWidth: 44,
    trexHeight: 47,
    trexWidthDuck: 59,
    trexHeightDuck: 25,
    bottomPad: 10,
    startXPos: 50,
    introDuration: 1500,
    blinkTiming: 7000,
    flashOn: 100,
    flashOff: 175,
    scoreCoefficient: 0.025,
    achievementDistance: 100,
    maxDistanceUnits: 5,
    flashDuration: 250,
    flashIterations: 3,
    dtMax: 50,
    tapMaxDist: 15,
    swipeDownMin: 30,
    pterodactylMinSpeed: 8.5,
    pickupScoreInterval: 200,
    pickupScoreGrowth: 1.5,
    pickupScoreScale: 2000,
    pickupScoreMin: 400,
    hiddenLuck: 0.01,
    biomeInterval: 2000,
    bossScoreInterval: 5000,
    choiceIframes: 3000,
    hurtFlashMs: 480,
    attackCooldown: 260,
    blasterInterval: 700,
    blasterAmmo: 6,
    baseHp: 1,
    bg: "#9ed8f2",
    fg: "#2d6a3f",
    storageKey: "aleatossauro-hi",
    skinKey: "aleatossauro-skin"
  };

  var DAY = {
    sky: "#9ed8f2",
    sand: "#e6d2a3",
    ground: "#c4a36a",
    cloud: "#ffffff",
    dino: "#2d6a3f",
    cactus: "#3f8f4a",
    ptero: "#6b4a7a",
    crate: "#e2b007",
    crateMark: "#7a4e12",
    bolt: "#ff6a1a",
    hud: "#1e3a4c",
    hat: "#c0392b",
    skate: "#f1c40f",
    wings: "#f4f7fb",
    balloon: ["#e74c3c", "#3498db", "#f1c40f"],
    gun: "#4a5560",
    sword: "#c0c7d0",
    spear: "#8b5a2b",
    shield: "#2e86de",
    fauna: ["#4a7c59", "#8b6914", "#2c5f7c", "#6b5344"],
    faunaDead: "#9a7a58",
    nest: "#8b5a2b",
    egg: "#f3e6c4",
    rock: "#7a6a55"
  };

  var SNOW_DAY = {
    sky: "#eaf4fc",
    sand: "#f7fbff",
    ground: "#c5d0dc",
    cloud: "#ffffff",
    cactus: "#4a7c52",
    ptero: "#7a658c",
    hud: "#2a3a4c",
    fauna: ["#8aa4b8", "#b8c4ce", "#6a8aa0", "#9aa8b4"],
    faunaDead: "#c5d0dc",
    rock: "#a8b4c0"
  };

  var SNOW_NIGHT = {
    sky: "#8eb0cc",
    sand: "#d8e4f0",
    ground: "#7a8ea0",
    cloud: "#f4f8fc",
    cactus: "#6d9e78",
    ptero: "#a888c4",
    hud: "#1e3040",
    fauna: ["#6d8ea3", "#a8b8c4", "#5b84a3", "#8a9aa8"],
    faunaDead: "#7a8ea0",
    rock: "#6a7888"
  };

  var WATER_DAY = {
    sky: "#3aa0c8",
    sand: "#2a7084",
    ground: "#1a5468",
    cloud: "#d4f0fa",
    cactus: "#1e8a58",
    ptero: "#1a4a48",
    hud: "#0e2832",
    fauna: ["#1a6b5c", "#3a8a9a", "#2c5f7c", "#4a7068"],
    faunaDead: "#3a5a58",
    rock: "#d46a78",
    nest: "#5a3a22",
    egg: "#e8d9b0"
  };

  var WATER_NIGHT = {
    sky: "#0a2838",
    sand: "#123848",
    ground: "#0c2834",
    cloud: "#7ab8c8",
    cactus: "#2d8a6e",
    ptero: "#1a3a38",
    hud: "#d4eef4",
    fauna: ["#2a6b68", "#3a7a8a", "#1c4a5c", "#3a5858"],
    faunaDead: "#1a3438",
    rock: "#a05060"
  };

  var NIGHT = {
    sky: "#152238",
    sand: "#2a2438",
    ground: "#5c4a32",
    cloud: "#c5d4e8",
    dino: "#7dce89",
    cactus: "#5dba6e",
    ptero: "#c792ea",
    crate: "#ffd166",
    crateMark: "#f4a261",
    bolt: "#ff9f43",
    hud: "#e8f4ff",
    hat: "#ff6b6b",
    skate: "#ffe066",
    wings: "#dfefff",
    balloon: ["#ff7675", "#74b9ff", "#ffeaa7"],
    gun: "#b2bec3",
    sword: "#e8eef4",
    spear: "#d4a574",
    shield: "#7ed6ff",
    fauna: ["#6d9e78", "#c4a35a", "#5b84a3", "#8a7364"],
    faunaDead: "#5c4e42",
    nest: "#5a3a22",
    egg: "#e8d9b0",
    rock: "#4a4250"
  };

  function extend(base, extra, biome) {
    var out = {};
    var k;
    for (k in base) {
      if (Object.prototype.hasOwnProperty.call(base, k)) out[k] = base[k];
    }
    if (extra) {
      for (k in extra) {
        if (Object.prototype.hasOwnProperty.call(extra, k)) out[k] = extra[k];
      }
    }
    out.biome = biome || "desert";
    return out;
  }

  Dino.biomeAt = function (actualScore) {
    var interval = (Dino.Config && Dino.Config.biomeInterval) || 2000;
    var band = Math.floor(Math.max(0, actualScore || 0) / interval) % 3;
    if (band === 1) return "snow";
    if (band === 2) return "water";
    return "desert";
  };

  Dino.palette = function (night, biome) {
    biome = biome || "desert";
    var base = night ? NIGHT : DAY;
    if (biome === "snow") return extend(base, night ? SNOW_NIGHT : SNOW_DAY, "snow");
    if (biome === "water") return extend(base, night ? WATER_NIGHT : WATER_DAY, "water");
    return extend(base, null, "desert");
  };
  if (typeof module !== "undefined" && module.exports) {
    module.exports = Dino;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
