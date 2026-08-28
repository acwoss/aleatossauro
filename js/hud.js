(function (root) {
  var Dino = root.Dino || (root.Dino = {});

  function defaultStorage() {
    try {
      if (typeof localStorage !== "undefined") return localStorage;
    } catch (e) {
      return null;
    }
    return null;
  }

  Dino.getActualDistance = function (distanceRan) {
    return distanceRan ? Math.round(distanceRan * Dino.Config.scoreCoefficient) : 0;
  };

  Dino.shouldInvert = function (actualDistance) {
    return actualDistance > 0 && actualDistance % Dino.Config.invertDistance === 0;
  };

  Dino.loadHighScore = function (storage) {
    storage = storage || defaultStorage();
    if (!storage) return 0;
    try {
      return parseInt(storage.getItem(Dino.Config.storageKey) || "0", 10) || 0;
    } catch (e) {
      return 0;
    }
  };

  Dino.saveHighScore = function (distanceRan, storage) {
    storage = storage || defaultStorage();
    if (!storage) return;
    try {
      storage.setItem(Dino.Config.storageKey, String(Math.ceil(distanceRan)));
    } catch (e) {
      /* ignore quota / private mode */
    }
  };

  function pad(n, units) {
    var s = String(n);
    while (s.length < units) s = "0" + s;
    return s;
  }

  function Hud() {
    this.digits = pad(0, Dino.Config.maxDistanceUnits).split("");
    this.highScore = 0;
    this.achievement = false;
    this.flashTimer = 0;
    this.flashIterations = 0;
    this.paint = true;
    this.toast = "";
    this.toastTimer = 0;
    this.kit = null;
    this.choice = null;
  }

  Hud.prototype.setHighScore = function (distanceRan) {
    this.highScore = Dino.getActualDistance(distanceRan);
  };

  Hud.prototype.reset = function () {
    this.digits = pad(0, Dino.Config.maxDistanceUnits).split("");
    this.achievement = false;
    this.flashTimer = 0;
    this.flashIterations = 0;
    this.paint = true;
    this.toast = "";
    this.toastTimer = 0;
    this.choice = null;
  };

  Hud.prototype.update = function (dt, distanceRan) {
    var actual = Dino.getActualDistance(distanceRan);
    var units = Dino.Config.maxDistanceUnits;
    if (actual > 99999) units = String(actual).length;
    if (!this.achievement) {
      this.digits = pad(actual, units).split("");
      if (actual > 0 && actual % Dino.Config.achievementDistance === 0) {
        this.achievement = true;
        this.flashTimer = 0;
        this.flashIterations = 0;
        this.paint = false;
      }
    } else {
      this.flashTimer += dt;
      if (this.flashIterations <= Dino.Config.flashIterations) {
        if (this.flashTimer < Dino.Config.flashDuration) {
          this.paint = false;
        } else if (this.flashTimer > Dino.Config.flashDuration * 2) {
          this.flashTimer = 0;
          this.flashIterations++;
          this.paint = true;
        } else {
          this.paint = true;
        }
      } else {
        this.achievement = false;
        this.paint = true;
      }
    }
    if (this.toastTimer > 0) {
      this.toastTimer -= dt;
      if (this.toastTimer <= 0) this.toast = "";
    }
  };

  Hud.prototype.announce = function (label) {
    this.toast = label;
    this.toastTimer = 1600;
  };

  Dino.CHOICE_TITLE = "Você encontrou um ovo e pode evoluir";
  Dino.CHOICE_SUBTITLE = "Escolha a sua evolução para tentar sobreviver";

  Dino.choiceCardRects = function (logicalWidth) {
    var w = 132;
    var h = 58;
    var gap = 16;
    var y = 42;
    var total = w * 2 + gap;
    var x0 = Math.round((logicalWidth - total) / 2);
    return [
      { x: x0, y: y, w: w, h: h },
      { x: x0 + w + gap, y: y, w: w, h: h }
    ];
  };

  Dino.hitChoiceCard = function (x, y, logicalWidth) {
    var rects = Dino.choiceCardRects(logicalWidth);
    var i;
    var r;
    for (i = 0; i < rects.length; i++) {
      r = rects[i];
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return i;
    }
    return -1;
  };

  Dino.clientToLogical = function (clientX, clientY, layout) {
    return {
      x: clientX / layout.scale,
      y: (clientY - layout.offsetY) / layout.scale
    };
  };

  Hud.prototype.drawDigit = function (ctx, rects, x, y, color) {
    Dino.drawRects(ctx, rects, x, y, color);
  };

  Hud.prototype.draw = function (ctx, logicalWidth, palette, crashed) {
    var dest = 11;
    var y = 5;
    var i;
    var n = this.digits.length;
    var scoreX = logicalWidth - dest * (n + 1);
    var ink = palette.hud;
    if (this.paint) {
      for (i = 0; i < n; i++) {
        this.drawDigit(
          ctx,
          Dino.Sprites.digits[parseInt(this.digits[i], 10)],
          scoreX + i * dest,
          y,
          ink
        );
      }
    }
    if (this.highScore > 0) {
      var hiStr = pad(this.highScore, n);
      var hiX = scoreX - dest * (n + 4);
      ctx.save();
      ctx.globalAlpha = 0.8;
      this.drawDigit(ctx, Dino.Sprites.hiH, hiX, y, ink);
      this.drawDigit(ctx, Dino.Sprites.hiI, hiX + dest, y, ink);
      for (i = 0; i < hiStr.length; i++) {
        this.drawDigit(
          ctx,
          Dino.Sprites.digits[parseInt(hiStr[i], 10)],
          hiX + dest * (i + 3),
          y,
          ink
        );
      }
      ctx.restore();
    }
    if (crashed) {
      ctx.save();
      ctx.fillStyle = ink;
      ctx.font = "12px Courier New, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("GAME OVER", logicalWidth / 2, 50);
      ctx.restore();
      Dino.drawRects(
        ctx,
        Dino.Sprites.restart,
        Math.round(logicalWidth / 2 - 18),
        70,
        ink
      );
    }
    if (this.toast && !this.choice) {
      ctx.save();
      ctx.fillStyle = palette.crate;
      ctx.font = "bold 11px Courier New, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.toast, logicalWidth / 2, 28);
      ctx.restore();
    }
    if (this.kit && this.kit.owned.length) {
      ctx.save();
      ctx.fillStyle = ink;
      ctx.font = "8px Courier New, monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      var labels = [];
      var e;
      var count;
      for (i = 0; i < this.kit.owned.length; i++) {
        e = Dino.effectById(this.kit.owned[i]);
        count = Dino.effectCount ? Dino.effectCount(this.kit, this.kit.owned[i]) : 1;
        if (e && count > 0) labels.push(count > 1 ? e.label + " x" + count : e.label);
      }
      ctx.fillText(labels.join("  ·  "), 8, 22);
      ctx.restore();
    }
    if (this.choice && this.choice.options && this.choice.options.length) {
      this.drawChoice(ctx, logicalWidth, palette);
    }
  };

  Hud.prototype.drawChoice = function (ctx, logicalWidth, palette) {
    var rects = Dino.choiceCardRects(logicalWidth);
    var i;
    var r;
    var opt;
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, logicalWidth, 150);
    ctx.restore();
    ctx.save();
    ctx.fillStyle = palette.hud;
    ctx.font = "bold 9px Courier New, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(Dino.CHOICE_TITLE, logicalWidth / 2, 14);
    ctx.font = "8px Courier New, monospace";
    ctx.fillText(Dino.CHOICE_SUBTITLE, logicalWidth / 2, 28);
    for (i = 0; i < rects.length; i++) {
      r = rects[i];
      opt = this.choice.options[i];
      ctx.fillStyle = palette.sand;
      ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.strokeStyle = palette.hud;
      ctx.lineWidth = 2;
      ctx.strokeRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1);
      ctx.fillStyle = palette.hud;
      ctx.font = "bold 11px Courier New, monospace";
      ctx.fillText(opt ? opt.label : "", r.x + r.w / 2, r.y + 24);
      ctx.font = "8px Courier New, monospace";
      ctx.fillText("clique", r.x + r.w / 2, r.y + 42);
    }
    ctx.restore();
  };

  Dino.Hud = Hud;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = Dino;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
