var test = require("node:test");
var assert = require("node:assert/strict");
require("../js/config.js");
require("../js/sprites.js");
require("../js/obstacles.js");
require("../js/trex.js");
var Dino = require("../js/collision.js");

test("boxCompare detecta overlap e gap", function () {
  var a = new Dino.CollisionBox(0, 0, 10, 10);
  var b = new Dino.CollisionBox(5, 5, 10, 10);
  var c = new Dino.CollisionBox(20, 0, 10, 10);
  assert.equal(Dino.boxCompare(a, b), true);
  assert.equal(Dino.boxCompare(a, c), false);
});

test("mini-rex passa sob o ptero do meio; tamanho normal não", function () {
  var groundY = 150 - 47 - 10;
  var full = new Dino.Trex(groundY);
  full.xPos = 50;
  full.drawScale = 1;
  var mini = new Dino.Trex(groundY);
  mini.xPos = 50;
  mini.drawScale = 0.68;
  var pteroType = Dino.OBSTACLE_TYPES.filter(function (t) { return t.type === "pterodactyl"; })[0];
  var ptero = new Dino.Obstacle(pteroType, 50, 0.6, 9, false);
  ptero.xPos = 50;
  ptero.yPos = 75;
  ptero.size = 1;
  ptero.width = pteroType.width;
  assert.ok(Dino.checkForCollision(full, ptero));
  assert.equal(Dino.checkForCollision(mini, ptero), false);
});

test("createAdjustedCollisionBox soma o offset do sprite", function () {
  var box = new Dino.CollisionBox(2, 3, 4, 5);
  var adj = Dino.createAdjustedCollisionBox(box, { x: 10, y: 20 });
  assert.equal(adj.x, 12);
  assert.equal(adj.y, 23);
  assert.equal(adj.width, 4);
});
