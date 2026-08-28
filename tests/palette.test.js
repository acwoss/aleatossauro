var test = require("node:test");
var assert = require("node:assert/strict");
var Dino = require("../js/config.js");

test("paleta diurna tem céu, dino e cacto em cores distintas", function () {
  var p = Dino.palette(false);
  assert.equal(typeof p.sky, "string");
  assert.notEqual(p.sky, p.dino);
  assert.notEqual(p.dino, p.cactus);
  assert.notEqual(p.cactus, p.ptero);
  assert.ok(p.crate);
  assert.ok(p.hat);
  assert.ok(p.bolt);
  assert.ok(Array.isArray(p.fauna) && p.fauna.length >= 3);
  assert.ok(p.faunaDead);
});

test("paleta noturna troca o céu e não é invert cinza", function () {
  var day = Dino.palette(false);
  var night = Dino.palette(true);
  assert.notEqual(day.sky, night.sky);
  assert.notEqual(night.sky, "#535353");
  assert.notEqual(night.dino, night.sky);
});
