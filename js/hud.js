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
    this.boss = null;
    this.speed = Dino.Config.speed || 6;
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
    this.boss = null;
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
    var w = 148;
    var h = 102;
    var gap = 12;
    var y = 32;
    var total = w * 2 + gap;
    var x0 = Math.round((logicalWidth - total) / 2);
    return [
      { x: x0, y: y, w: w, h: h },
      { x: x0 + w + gap, y: y, w: w, h: h }
    ];
  };

  Dino.rpgStatEntries = function (stats) {
    stats = stats || {};
    var hp = stats.hp || 0;
    var hpMax = stats.hpMax || hp;
    return [
      { id: "str", icon: "sword", label: "FORÇA", value: String(stats.str || 0) },
      { id: "spd", icon: "boots", label: "VEL", value: String(stats.spd || 0) },
      { id: "hp", icon: "heart", label: "VIDA", value: hp + "/" + hpMax },
      { id: "jump", icon: "doubleJump", label: "PULO", value: String(stats.jump || 0) },
      { id: "int", icon: "crystal", label: "INT", value: String(stats.int || 0) }
    ];
  };

  Dino.rpgStatCardLayout = function (x, y, stats) {
    var entries = Dino.rpgStatEntries(stats);
    var padX = 6;
    var padY = 4;
    var icon = 10;
    var gapIconVal = 2;
    var gapSlot = 8;
    var charW = 5;
    var slots = [];
    var cursor = x + padX;
    var i;
    var entry;
    var valueW;
    var innerY = y + padY;
    for (i = 0; i < entries.length; i++) {
      entry = entries[i];
      valueW = Math.max(10, entry.value.length * charW);
      slots.push({
        id: entry.id,
        icon: entry.icon,
        value: entry.value,
        iconX: cursor,
        iconY: innerY,
        valueX: cursor + icon + gapIconVal,
        valueY: innerY + 1
      });
      cursor += icon + gapIconVal + valueW + gapSlot;
    }
    return {
      x: x,
      y: y,
      w: cursor - gapSlot + padX - x,
      h: icon + padY * 2,
      slots: slots
    };
  };

  Dino.wrapWords = function (text, maxLen) {
    var words = String(text || "").split(/\s+/);
    var lines = [];
    var cur = "";
    var i;
    maxLen = maxLen || 24;
    for (i = 0; i < words.length; i++) {
      if (!words[i]) continue;
      if (cur && (cur + " " + words[i]).length > maxLen) {
        lines.push(cur);
        cur = words[i];
      } else {
        cur = cur ? cur + " " + words[i] : words[i];
      }
    }
    if (cur) lines.push(cur);
    return lines;
  };

  Dino.hudIconLayout = function (items, originX, originY, maxX) {
    var size = 10;
    var slot = 16;
    var rowH = 14;
    var x = originX;
    var y = originY;
    var i;
    var out = [];
    items = items || [];
    for (i = 0; i < items.length; i++) {
      if (i > 0 && x + slot > maxX) {
        x = originX;
        y += rowH;
      }
      out.push({
        id: items[i].id,
        count: items[i].count,
        x: x,
        y: y,
        size: size
      });
      x += slot;
    }
    return out;
  };

  Dino.drawFxIcon = function (ctx, id, x, y, palette) {
    var rects = Dino.Sprites.fx && Dino.Sprites.fx[id];
    if (!rects) return;
    var color =
      typeof Dino.effectInk === "function"
        ? Dino.effectInk(id, palette)
        : (palette && palette.hud) || "#1e3a4c";
    Dino.drawRects(ctx, rects, x, y, color);
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

  Hud.prototype.drawChrome = function (ctx, logicalWidth, palette) {
    var dest = 11;
    var y = 5;
    var i;
    var n = this.digits.length;
    var scoreX = logicalWidth - dest * (n + 1);
    var hiX = scoreX - dest * (n + 4);
    var ink = palette.hud;
    var iconMax = (this.highScore > 0 ? hiX : scoreX) - 8;
    var items;
    var slots;
    var statsY = 18;
    var stats;
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
    items = Dino.kitHudItems ? Dino.kitHudItems(this.kit) : [];
    slots = Dino.hudIconLayout(items, 6, 3, Math.max(40, iconMax));
    if (slots.length) {
      ctx.save();
      ctx.font = "7px Courier New, monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillStyle = ink;
      for (i = 0; i < slots.length; i++) {
        Dino.drawFxIcon(ctx, slots[i].id, slots[i].x, slots[i].y, palette);
        if (slots[i].count > 1) {
          ctx.fillText(String(slots[i].count), slots[i].x + 11, slots[i].y + 3);
        }
      }
      ctx.restore();
      statsY = slots[slots.length - 1].y + 14;
    }
    stats = Dino.rpgStats
      ? Dino.rpgStats(this.kit, { speed: this.speed })
      : { str: 1, spd: 6, hp: 1, hpMax: 1, jump: 1, int: 1 };
    this.drawRpgStats(ctx, 6, statsY, stats, palette);
  };

  Hud.prototype.drawOverlay = function (ctx, logicalWidth, palette, crashed) {
    var ink = palette.hud;
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
    if (this.toast && !this.choice && !this.boss) {
      ctx.save();
      ctx.fillStyle = palette.crate;
      ctx.font = "bold 11px Courier New, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.toast, logicalWidth / 2, 18);
      ctx.restore();
    }
    if (this.boss && !this.choice) {
      this.drawBoss(ctx, logicalWidth, palette, 8);
    }
    if (this.choice && this.choice.options && this.choice.options.length) {
      this.drawChoice(ctx, logicalWidth, palette);
    }
  };

  Hud.prototype.draw = function (ctx, logicalWidth, palette, crashed) {
    this.drawChrome(ctx, logicalWidth, palette);
    this.drawOverlay(ctx, logicalWidth, palette, crashed);
  };

  Hud.prototype.drawRpgStats = function (ctx, x, y, stats, palette) {
    var card = Dino.rpgStatCardLayout(x, y, stats);
    var i;
    var slot;
    palette = palette || {};
    ctx.save();
    ctx.fillStyle = palette.sand || "#f4e4c1";
    ctx.fillRect(card.x, card.y, card.w, card.h);
    ctx.fillStyle = palette.crate || "#e2b007";
    ctx.fillRect(card.x, card.y, 3, card.h);
    ctx.strokeStyle = palette.hud || "#1e3a4c";
    ctx.lineWidth = 2;
    ctx.strokeRect(card.x + 0.5, card.y + 0.5, card.w - 1, card.h - 1);
    ctx.font = "bold 8px Courier New, monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = palette.hud || "#1e3a4c";
    for (i = 0; i < card.slots.length; i++) {
      slot = card.slots[i];
      Dino.drawFxIcon(ctx, slot.icon, slot.iconX, slot.iconY, palette);
      ctx.fillStyle = palette.hud || "#1e3a4c";
      ctx.fillText(slot.value, slot.valueX, slot.valueY);
    }
    ctx.restore();
    return card;
  };

  Hud.prototype.drawBoss = function (ctx, logicalWidth, palette, topY) {
    var boss = this.boss;
    var barW = 160;
    var x = Math.round((logicalWidth - barW) / 2);
    var ratio = boss.maxHp ? boss.hp / boss.maxHp : 0;
    var y = topY == null ? 14 : topY;
    ctx.save();
    ctx.fillStyle = palette.hud;
    ctx.font = "bold 9px Courier New, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("BOSS  " + (boss.name || ""), logicalWidth / 2, y);
    ctx.fillStyle = palette.sand;
    ctx.fillRect(x, y + 8, barW, 7);
    ctx.fillStyle = palette.crate;
    ctx.fillRect(x, y + 8, Math.max(0, Math.round(barW * ratio)), 7);
    ctx.strokeStyle = palette.hud;
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 8.5, barW - 1, 6);
    ctx.fillStyle = palette.hud;
    ctx.font = "8px Courier New, monospace";
    ctx.fillText("pulo na cabeça · setas para mover", logicalWidth / 2, y + 22);
    ctx.restore();
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
      if (opt) Dino.drawFxIcon(ctx, opt.id, r.x + Math.round(r.w / 2) - 5, r.y + 8, palette);
      ctx.fillStyle = palette.hud;
      ctx.font = "bold 10px Courier New, monospace";
      ctx.fillText(opt ? opt.label : "", r.x + r.w / 2, r.y + 28);
      ctx.font = "7px Courier New, monospace";
      var lines = Dino.wrapWords(opt && opt.desc ? opt.desc : "", 22).slice(0, 2);
      var li;
      for (li = 0; li < lines.length; li++) {
        ctx.fillText(lines[li], r.x + r.w / 2, r.y + 44 + li * 10);
      }
      ctx.font = "bold 8px Courier New, monospace";
      ctx.fillText(opt && Dino.effectStatLine ? Dino.effectStatLine(opt) : "", r.x + r.w / 2, r.y + 68);
      ctx.font = "7px Courier New, monospace";
      ctx.fillText("clique", r.x + r.w / 2, r.y + 86);
    }
    ctx.restore();
  };

  Dino.Hud = Hud;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = Dino;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
