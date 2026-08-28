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

function brightness(hex) {
  var n = parseInt(String(hex).replace("#", ""), 16);
  return ((n >> 16) & 255) + ((n >> 8) & 255) + (n & 255);
}

test("bioma cicla deserto, neve e água a cada 2000 pontos", function () {
  assert.equal(Dino.biomeAt(0), "desert");
  assert.equal(Dino.biomeAt(1999), "desert");
  assert.equal(Dino.biomeAt(2000), "snow");
  assert.equal(Dino.biomeAt(3999), "snow");
  assert.equal(Dino.biomeAt(4000), "water");
  assert.equal(Dino.biomeAt(5999), "water");
  assert.equal(Dino.biomeAt(6000), "desert");
});

test("fase de neve deixa o mapa mais branco", function () {
  var desert = Dino.palette(false, "desert");
  var snow = Dino.palette(false, "snow");
  assert.equal(snow.biome, "snow");
  assert.ok(
    brightness(snow.sky) + brightness(snow.sand) >
      brightness(desert.sky) + brightness(desert.sand)
  );
  assert.ok(brightness(snow.sand) > brightness(desert.sand));
});

test("fase debaixo da água troca o céu e usa tons de oceano", function () {
  var desert = Dino.palette(false, "desert");
  var water = Dino.palette(false, "water");
  assert.equal(water.biome, "water");
  assert.notEqual(water.sky, desert.sky);
  assert.notEqual(water.sand, desert.sand);
  assert.ok(water.sky.indexOf("#") === 0);
});
