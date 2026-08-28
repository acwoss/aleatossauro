(function (root) {
  var Dino = root.Dino || (root.Dino = {});

  Dino.createInput = function () {
    var jumpQueued = false;
    var duckKey = false;
    var duckTouch = false;
    var touchId = null;
    var startX = 0;
    var startY = 0;
    var el = null;
    var keyTarget = null;
    var attached = false;
    var chooseKey = null;
    var choiceNudge = 0;
    var pointer = null;
    var leftKey = false;
    var rightKey = false;
    var touchHold = null;
    var fireQueued = false;
    var attackEl = null;

    function prevent(ev) {
      if (ev && ev.preventDefault) ev.preventDefault();
    }

    function onKeyDown(ev) {
      if (ev.repeat) {
        prevent(ev);
        return;
      }
      if (ev.code === "Digit1" || ev.code === "Numpad1") {
        chooseKey = 0;
        prevent(ev);
        return;
      }
      if (ev.code === "Digit2" || ev.code === "Numpad2") {
        chooseKey = 1;
        prevent(ev);
        return;
      }
      if (ev.code === "ArrowLeft" || ev.code === "KeyA") {
        leftKey = true;
        choiceNudge = -1;
        prevent(ev);
        return;
      }
      if (ev.code === "ArrowRight" || ev.code === "KeyD") {
        rightKey = true;
        choiceNudge = 1;
        prevent(ev);
        return;
      }
      if (ev.code === "ControlLeft" || ev.code === "ControlRight") {
        fireQueued = true;
        prevent(ev);
        return;
      }
      if (ev.code === "Space" || ev.code === "ArrowUp" || ev.code === "Enter" || ev.code === "KeyW") {
        jumpQueued = true;
        prevent(ev);
      } else if (ev.code === "ArrowDown" || ev.code === "KeyS") {
        duckKey = true;
        prevent(ev);
      }
    }

    function onKeyUp(ev) {
      if (ev.code === "ArrowDown" || ev.code === "KeyS") {
        duckKey = false;
        prevent(ev);
      }
      if (ev.code === "ArrowLeft" || ev.code === "KeyA") {
        leftKey = false;
        prevent(ev);
      }
      if (ev.code === "ArrowRight" || ev.code === "KeyD") {
        rightKey = false;
        prevent(ev);
      }
    }

    function firstTouch(list) {
      if (!list || !list.length) return null;
      var i;
      for (i = 0; i < list.length; i++) {
        if (touchId === null || list[i].identifier === touchId) return list[i];
      }
      return null;
    }

    function onTouchStart(ev) {
      prevent(ev);
      if (touchId !== null) return;
      var t = ev.touches && ev.touches[0];
      if (!t) return;
      touchId = t.identifier;
      startX = t.clientX;
      startY = t.clientY;
      duckTouch = false;
      touchHold = { clientX: t.clientX, clientY: t.clientY };
    }

    function onTouchMove(ev) {
      prevent(ev);
      var t = firstTouch(ev.touches);
      if (!t || t.identifier !== touchId) return;
      if (t.clientY - startY >= Dino.Config.swipeDownMin) {
        duckTouch = true;
      }
      touchHold = { clientX: t.clientX, clientY: t.clientY };
    }

    function onMouseUp(ev) {
      prevent(ev);
      pointer = { clientX: ev.clientX, clientY: ev.clientY };
    }

    function onTouchEnd(ev) {
      prevent(ev);
      var t = firstTouch(ev.changedTouches);
      if (!t || t.identifier !== touchId) return;
      var dx = t.clientX - startX;
      var dy = t.clientY - startY;
      var dist = Math.sqrt(dx * dx + dy * dy);
      pointer = { clientX: t.clientX, clientY: t.clientY };
      if (!duckTouch && dist < Dino.Config.tapMaxDist) {
        jumpQueued = true;
      }
      if (!duckTouch && startY - t.clientY >= Dino.Config.swipeDownMin) {
        jumpQueued = true;
      }
      touchId = null;
      duckTouch = false;
      touchHold = null;
    }

    function onAttack(ev) {
      prevent(ev);
      fireQueued = true;
    }

    return {
      attach: function (target, attackButton) {
        if (attached) this.detach();
        el = target;
        attackEl = attackButton || null;
        keyTarget = typeof window !== "undefined" ? window : target;
        keyTarget.addEventListener("keydown", onKeyDown);
        keyTarget.addEventListener("keyup", onKeyUp);
        el.addEventListener("touchstart", onTouchStart, { passive: false });
        el.addEventListener("touchmove", onTouchMove, { passive: false });
        el.addEventListener("touchend", onTouchEnd, { passive: false });
        el.addEventListener("mouseup", onMouseUp);
        if (attackEl) {
          attackEl.addEventListener("click", onAttack);
          attackEl.addEventListener("touchstart", onAttack, { passive: false });
        }
        attached = true;
      },
      detach: function () {
        if (!attached) return;
        keyTarget.removeEventListener("keydown", onKeyDown);
        keyTarget.removeEventListener("keyup", onKeyUp);
        el.removeEventListener("touchstart", onTouchStart);
        el.removeEventListener("touchmove", onTouchMove);
        el.removeEventListener("touchend", onTouchEnd);
        el.removeEventListener("mouseup", onMouseUp);
        if (attackEl) {
          attackEl.removeEventListener("click", onAttack);
          attackEl.removeEventListener("touchstart", onAttack);
        }
        attached = false;
      },
      consume: function () {
        var jump = jumpQueued;
        var key = chooseKey;
        var nudge = choiceNudge;
        var ptr = pointer;
        var fire = fireQueued;
        jumpQueued = false;
        chooseKey = null;
        choiceNudge = 0;
        pointer = null;
        fireQueued = false;
        return {
          jumpPressed: jump,
          duck: duckKey || duckTouch,
          chooseKey: key,
          choiceNudge: nudge,
          pointer: ptr,
          left: leftKey,
          right: rightKey,
          firePressed: fire,
          touchClientX: touchHold ? touchHold.clientX : null,
          touchClientY: touchHold ? touchHold.clientY : null
        };
      }
    };
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = Dino;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
