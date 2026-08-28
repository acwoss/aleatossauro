var test = require("node:test");
var assert = require("node:assert/strict");
require("../js/config.js");
require("../js/collision.js");
require("../js/sprites.js");
var Dino = require("../js/obstacles.js");

test("getGap cresce com a velocidade", function () {
  var type = Dino.OBSTACLE_TYPES[0];
  var slow = new Dino.Obstacle(type, 600, 0.6, 6, false);
  var fast = new Dino.Obstacle(type, 600, 0.6, 13, false);
  slow.size = 1;
  fast.size = 1;
  slow.width = type.width;
  fast.width = type.width;
  slow.gap = slow.getGap(0.6, 6);
  fast.gap = fast.getGap(0.6, 13);
  assert.ok(fast.gap > slow.gap - 1);
});

test("pterodáctilo só entra com speed >= 8.5", function () {
  var i;
  var sawPtero = false;
  var o;
  for (i = 0; i < 80; i++) {
    o = Dino.spawnObstacle(6, {}, false, 600);
    if (o.typeConfig.type === "pterodactyl") sawPtero = true;
  }
  assert.equal(sawPtero, false);
  var seen = false;
  for (i = 0; i < 80; i++) {
    o = Dino.spawnObstacle(9, {}, false, 600);
    if (o.typeConfig.type === "pterodactyl") seen = true;
  }
  assert.equal(seen, true);
});

test("há pedras no caminho", function () {
  var types = Dino.OBSTACLE_TYPES.map(function (t) { return t.type; });
  assert.ok(types.indexOf("rock") !== -1);
  var rock = Dino.OBSTACLE_TYPES.filter(function (t) { return t.type === "rock"; })[0];
  assert.ok(rock.minSpeed === 0);
  assert.ok(Dino.Sprites.rock.length > 0);
  var feetY = Dino.DEFAULT_HEIGHT - Dino.Config.bottomPad;
  assert.equal(rock.yPos + rock.height, feetY);
});

test("debaixo da água cacto vira alga e ptero vira mosassauro", function () {
  assert.equal(
    Dino.obstacleSprite("cactusSmall", 0, "desert"),
    Dino.Sprites.cactusSmall
  );
  assert.equal(
    Dino.obstacleSprite("cactusSmall", 0, "water"),
    Dino.Sprites.algaeSmall
  );
  assert.equal(
    Dino.obstacleSprite("cactusLarge", 0, "water"),
    Dino.Sprites.algaeLarge
  );
  assert.equal(
    Dino.obstacleSprite("pterodactyl", 0, "desert"),
    Dino.Sprites.ptero1
  );
  assert.equal(
    Dino.obstacleSprite("pterodactyl", 1, "water"),
    Dino.Sprites.mosa2
  );
  assert.equal(
    Dino.obstacleSprite("pterodactyl", 0, "snow"),
    Dino.Sprites.ptero1
  );
});
