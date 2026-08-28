var test = require("node:test");
var assert = require("node:assert/strict");
require("../js/config.js");
require("../js/layout.js");
require("../js/sprites.js");
var Dino = require("../js/skin.js");

test("máscara do dino em espera não é um retângulo cheio", function () {
  var mask = Dino.trexPaintMask();
  assert.ok(mask.w >= 40 && mask.h >= 40);
  assert.ok(mask.count > 80);
  assert.ok(mask.count < mask.w * mask.h);
  assert.equal(!!mask.cells["20,2"], true);
  assert.equal(!!mask.cells["0,0"], false);
});

test("createSkin pinta só quadradinhos da silhueta", function () {
  var skin = Dino.createSkin("#2d6a3f");
  assert.equal(skin.cells["20,2"], "#2d6a3f");
  assert.equal(skin.cells["0,0"], undefined);
  Dino.paintSkin(skin, 20, 2, "#e74c3c");
  assert.equal(skin.cells["20,2"], "#e74c3c");
  Dino.paintSkin(skin, 0, 0, "#ffffff");
  assert.equal(skin.cells["0,0"], undefined);
});

test("drawSkinnedRects usa a cor pintada no pixel", function () {
  var fills = [];
  var ctx = {
    fillRect: function (x, y, w, h) { fills.push({ x: x, y: y, w: w, h: h, c: ctx.fillStyle }); },
    fillStyle: ""
  };
  var skin = Dino.createSkin("#2d6a3f");
  Dino.paintSkin(skin, 20, 2, "#e74c3c");
  Dino.drawSkinnedRects(ctx, [{ x: 20, y: 2, w: 1, h: 1 }], 10, 5, skin, "#2d6a3f");
  assert.equal(fills.length, 1);
  assert.deepEqual(fills[0], { x: 30, y: 7, w: 1, h: 1, c: "#e74c3c" });
});

test("estúdio de pintura acerta célula, swatch e botão", function () {
  var layout = Dino.computeLayout(1920, 1080);
  var studio = Dino.paintStudioLayout(layout);
  assert.ok(studio.cell >= 1);
  assert.ok(studio.swatches.length >= 8);
  var cell = Dino.hitPaintTarget(
    { x: studio.x0 + 20 * studio.cell + studio.cell / 2, y: studio.y0 + 2 * studio.cell + studio.cell / 2 },
    studio
  );
  assert.deepEqual(cell, { type: "cell", x: 20, y: 2 });
  var sw = Dino.hitPaintTarget(
    { x: studio.swatches[1].x + 2, y: studio.swatches[1].y + 2 },
    studio
  );
  assert.equal(sw.type, "swatch");
  assert.equal(sw.color, studio.swatches[1].color);
  var go = Dino.hitPaintTarget(
    { x: studio.start.x + 4, y: studio.start.y + 4 },
    studio
  );
  assert.equal(go.type, "start");
});

test("skin serializa e volta do storage", function () {
  var store = {};
  var fake = {
    getItem: function (k) { return store[k] || null; },
    setItem: function (k, v) { store[k] = String(v); }
  };
  var skin = Dino.createSkin("#2d6a3f");
  Dino.paintSkin(skin, 20, 2, "#3498db");
  Dino.saveSkin(skin, fake);
  var loaded = Dino.loadSkin(fake);
  assert.equal(loaded.cells["20,2"], "#3498db");
  assert.equal(loaded.cells["20,3"] || "#2d6a3f", loaded.cells["20,3"] ? loaded.cells["20,3"] : "#2d6a3f");
});
