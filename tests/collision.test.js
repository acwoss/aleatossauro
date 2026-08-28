var test = require("node:test");
var assert = require("node:assert/strict");
var Dino = require("../js/collision.js");

test("boxCompare detecta overlap e gap", function () {
  var a = new Dino.CollisionBox(0, 0, 10, 10);
  var b = new Dino.CollisionBox(5, 5, 10, 10);
  var c = new Dino.CollisionBox(20, 0, 10, 10);
  assert.equal(Dino.boxCompare(a, b), true);
  assert.equal(Dino.boxCompare(a, c), false);
});

test("createAdjustedCollisionBox soma o offset do sprite", function () {
  var box = new Dino.CollisionBox(2, 3, 4, 5);
  var adj = Dino.createAdjustedCollisionBox(box, { x: 10, y: 20 });
  assert.equal(adj.x, 12);
  assert.equal(adj.y, 23);
  assert.equal(adj.width, 4);
});
