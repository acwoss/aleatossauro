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

  Dino.palette = function (night) {
    return night ? NIGHT : DAY;
  };
  if (typeof module !== "undefined" && module.exports) {
    module.exports = Dino;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
