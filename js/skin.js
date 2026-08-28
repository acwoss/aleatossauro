(function (root) {
  var Dino = root.Dino || (root.Dino = {});

  Dino.SKIN_SWATCHES = [
    "#2d6a3f",
    "#7dce89",
    "#1e3a4c",
    "#e74c3c",
    "#e2b007",
    "#3498db",
    "#9b59b6",
    "#8b5a2b",
    "#e6d2a3",
    "#ffffff",
    "#111111",
    "#ff6a1a"
  ];

  function defaultStorage() {
    try {
      if (typeof localStorage !== "undefined") return localStorage;
    } catch (e) {
      return null;
    }
    return null;
  }

  Dino.occupiedPixels = function (rects) {
    var cells = {};
    var i;
    var r;
    var x;
    var y;
    var count = 0;
    var w = 0;
    var h = 0;
    rects = rects || [];
    for (i = 0; i < rects.length; i++) {
      r = rects[i];
      for (y = r.y; y < r.y + r.h; y++) {
        for (x = r.x; x < r.x + r.w; x++) {
          if (!cells[x + "," + y]) {
            cells[x + "," + y] = true;
            count++;
          }
          if (x + 1 > w) w = x + 1;
          if (y + 1 > h) h = y + 1;
        }
      }
    }
    return { cells: cells, count: count, w: w, h: h };
  };

  Dino.trexPaintMask = function () {
    var poses = Dino.Sprites && Dino.Sprites.trex;
    return Dino.occupiedPixels(poses && poses.wait ? poses.wait : []);
  };

  Dino.createSkin = function (defaultColor) {
    var mask = Dino.trexPaintMask();
    var cells = {};
    var key;
    var color = defaultColor || "#2d6a3f";
    for (key in mask.cells) {
      if (mask.cells.hasOwnProperty(key)) cells[key] = color;
    }
    return { cells: cells, w: mask.w, h: mask.h, fallback: color };
  };

  Dino.paintSkin = function (skin, x, y, color) {
    var key = x + "," + y;
    if (!skin || !skin.cells || skin.cells[key] == null) return skin;
    skin.cells[key] = color;
    return skin;
  };

  Dino.skinSample = function (skin, pose, x, y) {
    var fallback = (skin && skin.fallback) || "#2d6a3f";
    var cells = skin && skin.cells;
    var part;
    var dest;
    var src;
    var u;
    var v;
    var sx;
    var sy;
    var key;
    if (!cells) return fallback;
    key = x + "," + y;
    if (!pose || pose === "wait" || typeof Dino.trexPartAt !== "function") {
      return cells[key] || fallback;
    }
    part = Dino.trexPartAt(pose, x, y);
    if (!part) return cells[key] || fallback;
    dest = Dino.trexParts(pose)[part];
    src = Dino.trexParts("wait")[part];
    if (!dest || !src || !dest.w || !dest.h) return cells[key] || fallback;
    u = (x - dest.x + 0.5) / dest.w;
    v = (y - dest.y + 0.5) / dest.h;
    if (u < 0) u = 0;
    if (v < 0) v = 0;
    if (u > 0.999) u = 0.999;
    if (v > 0.999) v = 0.999;
    sx = Math.floor(src.x + u * src.w);
    sy = Math.floor(src.y + v * src.h);
    return cells[sx + "," + sy] || cells[key] || fallback;
  };

  Dino.drawSkinnedRects = function (ctx, rects, ox, oy, skin, fallback, pose) {
    var i;
    var r;
    var x;
    var y;
    var color;
    fallback = fallback || (skin && skin.fallback) || "#2d6a3f";
    rects = rects || [];
    for (i = 0; i < rects.length; i++) {
      r = rects[i];
      for (y = 0; y < r.h; y++) {
        for (x = 0; x < r.w; x++) {
          color = Dino.skinSample
            ? Dino.skinSample(skin, pose, r.x + x, r.y + y)
            : fallback;
          if (!color) color = fallback;
          ctx.fillStyle = color;
          ctx.fillRect(ox + r.x + x, oy + r.y + y, 1, 1);
        }
      }
    }
  };

  Dino.paintStudioLayout = function (layout) {
    layout = layout || {};
    var scale = layout.scale || 1;
    var hudH = Math.max(
      90,
      ((layout.offsetY || 0) - (layout.hudOffsetY || 8)) / scale +
        (layout.viewHeight || Dino.DEFAULT_HEIGHT || 150)
    );
    var width = layout.logicalWidth || 600;
    var mask = Dino.trexPaintMask();
    var gw = mask.w || 44;
    var gh = mask.h || 47;
    var overhead = 36;
    var footer = 48;
    var cell = Dino.clamp(
      Math.min(
        Math.floor((hudH - overhead - footer) / gh),
        Math.floor((width - 16) / gw)
      ),
      4,
      12
    );
    var gridW = gw * cell;
    var gridH = gh * cell;
    var x0 = Math.round((width - gridW) / 2);
    var y0 = overhead;
    var swY = y0 + gridH + 8;
    var swatches = [];
    var i;
    var swW = 14;
    var gap = 4;
    var rowW = Dino.SKIN_SWATCHES.length * (swW + gap) - gap;
    var swX0 = Math.round((width - rowW) / 2);
    for (i = 0; i < Dino.SKIN_SWATCHES.length; i++) {
      swatches.push({
        color: Dino.SKIN_SWATCHES[i],
        x: swX0 + i * (swW + gap),
        y: swY,
        w: swW,
        h: swW
      });
    }
    var btnY = swY + swW + 8;
    var startW = 72;
    var resetW = 72;
    var btnGap = 10;
    var btnX0 = Math.round((width - (startW + btnGap + resetW)) / 2);
    return {
      cell: cell,
      x0: x0,
      y0: y0,
      w: gw,
      h: gh,
      gridW: gridW,
      gridH: gridH,
      width: width,
      coverH: Math.max(hudH, btnY + 24),
      swatches: swatches,
      start: { x: btnX0, y: btnY, w: startW, h: 16, label: "Correr" },
      reset: {
        x: btnX0 + startW + btnGap,
        y: btnY,
        w: resetW,
        h: 16,
        label: "Limpar"
      }
    };
  };

  function inRect(x, y, r) {
    return x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h;
  }

  Dino.hitPaintTarget = function (local, studio) {
    var x;
    var y;
    var i;
    var sx;
    var sy;
    if (!local || !studio) return null;
    x = local.x;
    y = local.y;
    if (
      x >= studio.x0 &&
      y >= studio.y0 &&
      x < studio.x0 + studio.gridW &&
      y < studio.y0 + studio.gridH
    ) {
      sx = Math.floor((x - studio.x0) / studio.cell);
      sy = Math.floor((y - studio.y0) / studio.cell);
      if (sx >= 0 && sy >= 0 && sx < studio.w && sy < studio.h) {
        return { type: "cell", x: sx, y: sy };
      }
    }
    for (i = 0; i < studio.swatches.length; i++) {
      if (inRect(x, y, studio.swatches[i])) {
        return { type: "swatch", color: studio.swatches[i].color, index: i };
      }
    }
    if (inRect(x, y, studio.start)) return { type: "start" };
    if (studio.reset && inRect(x, y, studio.reset)) return { type: "reset" };
    return null;
  };

  Dino.drawPaintStudio = function (ctx, studio, skin, selected, palette) {
    var key;
    var parts;
    var px;
    var py;
    var gap;
    var i;
    var s;
    palette = palette || {};
    skin = skin || Dino.createSkin(palette.dino);
    gap = 0;
    ctx.save();
    ctx.fillStyle = "#071018";
    ctx.fillRect(0, 0, studio.width || 600, studio.coverH || studio.y0 + studio.gridH + 48);
    ctx.fillStyle = "#d6e4ee";
    ctx.font = "bold 9px Courier New, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Pinte o seu dino", (studio.x0 + studio.gridW / 2), studio.y0 - 10);
    ctx.font = "7px Courier New, monospace";
    ctx.fillText("cada quadradinho é uma cor", studio.x0 + studio.gridW / 2, studio.y0 - 1);
    for (key in skin.cells) {
      if (!skin.cells.hasOwnProperty(key)) continue;
      parts = key.split(",");
      px = parseInt(parts[0], 10);
      py = parseInt(parts[1], 10);
      ctx.fillStyle = skin.cells[key];
      ctx.fillRect(
        studio.x0 + px * studio.cell,
        studio.y0 + py * studio.cell,
        studio.cell - gap,
        studio.cell - gap
      );
    }
    if (typeof Dino.trexParts === "function") {
      var body = Dino.trexParts("wait");
      var name;
      var box;
      var labels = Dino.TREX_PART_LABELS || {};
      ctx.strokeStyle = "#3d5a6c";
      ctx.lineWidth = 1;
      ctx.font = "6px Courier New, monospace";
      ctx.fillStyle = "#8fb0c4";
      for (name in body) {
        if (!body.hasOwnProperty(name)) continue;
        box = body[name];
        ctx.strokeRect(
          studio.x0 + box.x * studio.cell + 0.5,
          studio.y0 + box.y * studio.cell + 0.5,
          box.w * studio.cell - 1,
          box.h * studio.cell - 1
        );
        ctx.fillText(
          labels[name] || name,
          studio.x0 + (box.x + box.w / 2) * studio.cell,
          studio.y0 + (box.y + box.h / 2) * studio.cell
        );
      }
    }
    for (i = 0; i < studio.swatches.length; i++) {
      s = studio.swatches[i];
      ctx.fillStyle = s.color;
      ctx.fillRect(s.x, s.y, s.w, s.h);
      ctx.strokeStyle = palette.hud || "#1e3a4c";
      ctx.lineWidth = s.color === selected ? 2 : 1;
      ctx.strokeRect(s.x + 0.5, s.y + 0.5, s.w - 1, s.h - 1);
    }
    function drawBtn(b, fill) {
      ctx.fillStyle = fill;
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeStyle = palette.hud || "#1e3a4c";
      ctx.lineWidth = 2;
      ctx.strokeRect(b.x + 0.5, b.y + 0.5, b.w - 1, b.h - 1);
      ctx.fillStyle = palette.hud || "#1e3a4c";
      ctx.font = "bold 8px Courier New, monospace";
      ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2);
    }
    drawBtn(studio.start, palette.crate || "#e2b007");
    if (studio.reset) drawBtn(studio.reset, palette.sand || "#e6d2a3");
    ctx.restore();
  };

  Dino.saveSkin = function (skin, storage) {
    storage = storage || defaultStorage();
    if (!storage || !skin) return;
    try {
      storage.setItem(
        (Dino.Config && Dino.Config.skinKey) || "aleatossauro-skin",
        JSON.stringify({ cells: skin.cells, fallback: skin.fallback })
      );
    } catch (e) {
      /* ignore quota / private mode */
    }
  };

  Dino.loadSkin = function (storage) {
    var raw;
    var parsed;
    var skin;
    var key;
    var hex;
    storage = storage || defaultStorage();
    skin = Dino.createSkin("#2d6a3f");
    if (!storage) return skin;
    try {
      raw = storage.getItem((Dino.Config && Dino.Config.skinKey) || "aleatossauro-skin");
      parsed = raw ? JSON.parse(raw) : null;
    } catch (e) {
      return skin;
    }
    if (!parsed || !parsed.cells) return skin;
    hex = /^#[0-9a-fA-F]{6}$/;
    for (key in parsed.cells) {
      if (
        parsed.cells.hasOwnProperty(key) &&
        skin.cells[key] != null &&
        hex.test(parsed.cells[key])
      ) {
        skin.cells[key] = parsed.cells[key];
      }
    }
    return skin;
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = Dino;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
