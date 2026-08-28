var test = require("node:test");
var assert = require("node:assert/strict");
require("../js/config.js");
var Dino = require("../js/input.js");

function fakeEl() {
  var listeners = {};
  return {
    listeners: listeners,
    addEventListener: function (t, fn) {
      listeners[t] = listeners[t] || [];
      listeners[t].push(fn);
    },
    removeEventListener: function () {},
    fire: function (t, ev) {
      (listeners[t] || []).forEach(function (fn) { fn(ev); });
    }
  };
}

test("espaço gera um pulo e ignora repeat", function () {
  var el = fakeEl();
  var input = Dino.createInput();
  input.attach(el);
  el.fire("keydown", { code: "Space", repeat: false, preventDefault: function () {} });
  el.fire("keydown", { code: "Space", repeat: true, preventDefault: function () {} });
  var a = input.consume();
  assert.equal(a.jumpPressed, true);
  var b = input.consume();
  assert.equal(b.jumpPressed, false);
});

test("arrowdown segura duck até keyup", function () {
  var el = fakeEl();
  var input = Dino.createInput();
  input.attach(el);
  el.fire("keydown", { code: "ArrowDown", repeat: false, preventDefault: function () {} });
  assert.equal(input.consume().duck, true);
  el.fire("keyup", { code: "ArrowDown", preventDefault: function () {} });
  assert.equal(input.consume().duck, false);
});

test("tap curto é pulo; swipe down é duck", function () {
  var el = fakeEl();
  var input = Dino.createInput();
  input.attach(el);
  el.fire("touchstart", {
    touches: [{ clientX: 10, clientY: 10, identifier: 1 }],
    preventDefault: function () {}
  });
  el.fire("touchend", {
    changedTouches: [{ clientX: 12, clientY: 12, identifier: 1 }],
    preventDefault: function () {}
  });
  assert.equal(input.consume().jumpPressed, true);

  el.fire("touchstart", {
    touches: [{ clientX: 10, clientY: 10, identifier: 1 }],
    preventDefault: function () {}
  });
  el.fire("touchmove", {
    touches: [{ clientX: 10, clientY: 50, identifier: 1 }],
    preventDefault: function () {}
  });
  assert.equal(input.consume().duck, true);
});

test("tecla 1 e clique informam escolha de card", function () {
  var el = fakeEl();
  var input = Dino.createInput();
  input.attach(el);
  el.fire("keydown", { code: "Digit1", repeat: false, preventDefault: function () {} });
  var a = input.consume();
  assert.equal(a.chooseKey, 0);
  el.fire("mouseup", { clientX: 120, clientY: 80, preventDefault: function () {} });
  var b = input.consume();
  assert.equal(b.pointer.clientX, 120);
  assert.equal(b.pointer.clientY, 80);
});

test("seta esquerda fica pressionada até o keyup", function () {
  var el = fakeEl();
  var input = Dino.createInput();
  input.attach(el);
  el.fire("keydown", { code: "ArrowLeft", repeat: false, preventDefault: function () {} });
  assert.equal(input.consume().left, true);
  el.fire("keyup", { code: "ArrowLeft", preventDefault: function () {} });
  assert.equal(input.consume().left, false);
});

test("Ctrl dispara ataque, não pulo", function () {
  var el = fakeEl();
  var input = Dino.createInput();
  input.attach(el);
  el.fire("keydown", { code: "ControlLeft", repeat: false, preventDefault: function () {} });
  var a = input.consume();
  assert.equal(a.firePressed, true);
  assert.equal(a.jumpPressed, false);
});
