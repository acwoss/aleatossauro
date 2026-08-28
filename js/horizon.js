(function (root) {
  var Dino = root.Dino || (root.Dino = {});

  function Horizon(logicalWidth, viewHeight) {
    this.logicalWidth = logicalWidth;
    this.viewHeight = viewHeight || 150;
    this.lineY = 127;
    this.ground = [
      { x: 0, bumps: this.makeBumps(600) },
      { x: 600, bumps: this.makeBumps(600) }
    ];
    this.clouds = [];
    this.cloudTimer = 0;
    this.fauna = [];
    this.pebbles = [];
    this.seedClouds();
    this.seedFauna();
    this.seedPebbles();
  }

  Horizon.prototype.makeBumps = function (width) {
    var bumps = [];
    var x;
    for (x = 0; x < width; x += 2) {
      if (Math.random() > 0.7) {
        bumps.push({ x: x, w: 2, h: Dino.getRandomNum(1, 3) });
      }
    }
    return bumps;
  };

  Horizon.prototype.seedClouds = function () {
    var n = Dino.getRandomNum(1, 3);
    var i;
    for (i = 0; i < n; i++) {
      this.clouds.push(this.makeCloud(this.logicalWidth * (i / n)));
    }
  };

  Horizon.prototype.makeCloud = function (x) {
    return {
      x: x,
      y: Dino.getRandomNum(15, 70),
      gap: Dino.getRandomNum(100, 400)
    };
  };

  Horizon.prototype.seedPebbles = function () {
    this.pebbles = [];
    var bottom = this.viewHeight;
    var i;
    var n = Math.max(12, Math.round(this.logicalWidth / 18));
    for (i = 0; i < n; i++) {
      this.pebbles.push({
        x: Math.random() * (this.logicalWidth + 40) - 20,
        y: Dino.getRandomNum(this.lineY + 6, Math.max(this.lineY + 8, Math.floor(bottom - 4))),
        w: Dino.getRandomNum(2, 8),
        h: Dino.getRandomNum(1, 3)
      });
    }
  };

  Horizon.prototype.makeFaunaDino = function (forcedDead) {
    var dead = forcedDead;
    if (dead == null) dead = Math.random() < 0.42;
    var scale = 0.32 + Math.random() * 0.75;
    var yMin = Math.max(this.lineY + 18, 148);
    var yMax = Math.floor(this.viewHeight - 8 - 47 * scale);
    if (yMax < yMin) yMax = yMin;
    return {
      x: Math.random() * (this.logicalWidth + 520) - 40,
      y: Dino.getRandomNum(yMin, yMax),
      scale: scale,
      dead: dead,
      facing: Math.random() < 0.55 ? 1 : -1,
      color: Dino.getRandomNum(0, 3),
      blinkOn: false,
      blinkTimer: Dino.getRandomNum(400, 2800),
      lying: dead && Math.random() < 0.75
    };
  };

  Horizon.prototype.seedFauna = function () {
    this.fauna = [];
    var n = Dino.getRandomNum(0, 2);
    var i;
    for (i = 0; i < n; i++) {
      this.fauna.push(this.makeFaunaDino());
    }
  };

  Horizon.prototype.updateFaunaAnim = function (dt) {
    var i;
    var d;
    for (i = 0; i < this.fauna.length; i++) {
      d = this.fauna[i];
      if (d.dead) continue;
      d.blinkTimer -= dt;
      if (d.blinkOn) {
        if (d.blinkTimer <= 0) {
          d.blinkOn = false;
          d.blinkTimer = Dino.getRandomNum(1200, 4200);
        }
      } else if (d.blinkTimer <= 0) {
        d.blinkOn = true;
        d.blinkTimer = 180;
      }
    }
  };

  Horizon.prototype.wrapScenery = function (x) {
    if (x < -80) return this.logicalWidth + Dino.getRandomNum(8, 140);
    return x;
  };

  Horizon.prototype.wrapFauna = function (x) {
    if (x < -80) return this.logicalWidth + Dino.getRandomNum(280, 980);
    return x;
  };

  Horizon.prototype.update = function (dt, speed, running) {
    this.updateFaunaAnim(dt);
    if (!running) return;
    var move = Math.floor((speed * Dino.FPS / 1000) * dt);
    var i;
    for (i = 0; i < this.ground.length; i++) {
      this.ground[i].x -= move;
    }
    if (this.ground[0].x <= -600) {
      this.ground[0].x = this.ground[1].x + 600;
      this.ground[0].bumps = this.makeBumps(600);
      this.ground.push(this.ground.shift());
    }
    var cloudSpeed = Dino.Config.bgCloudSpeed * speed;
    var cloudMove = (cloudSpeed * Dino.FPS / 1000) * dt;
    for (i = 0; i < this.clouds.length; i++) {
      this.clouds[i].x -= cloudMove;
    }
    this.clouds = this.clouds.filter(function (c) {
      return c.x > -50;
    });
    if (this.clouds.length < Dino.Config.maxClouds) {
      var last = this.clouds[this.clouds.length - 1];
      if (!last || last.x + last.gap < this.logicalWidth) {
        this.clouds.push(this.makeCloud(this.logicalWidth));
      }
    }
    for (i = 0; i < this.pebbles.length; i++) {
      this.pebbles[i].x -= move;
      this.pebbles[i].x = this.wrapScenery(this.pebbles[i].x);
    }
    for (i = 0; i < this.fauna.length; i++) {
      this.fauna[i].x -= move;
      this.fauna[i].x = this.wrapFauna(this.fauna[i].x);
    }
  };

  Horizon.prototype.drawFauna = function (ctx, palette) {
    var i;
    var d;
    var pose;
    var color;
    var colors = palette.fauna || [palette.dino];
    for (i = 0; i < this.fauna.length; i++) {
      d = this.fauna[i];
      pose = d.dead ? "crash" : d.blinkOn ? "blink" : "wait";
      color = d.dead
        ? palette.faunaDead || palette.ground
        : colors[d.color % colors.length];
      ctx.save();
      ctx.translate(Math.round(d.x), Math.round(d.y));
      ctx.scale(d.scale, d.scale);
      if (d.facing < 0) {
        ctx.translate(44, 0);
        ctx.scale(-1, 1);
      }
      if (d.lying) {
        ctx.translate(8, 28);
        ctx.rotate(Math.PI / 2);
      }
      Dino.drawRects(ctx, Dino.Sprites.trex[pose], 0, 0, color);
      ctx.restore();
    }
  };

  Horizon.prototype.draw = function (ctx, palette) {
    var ground = palette.ground;
    var sand = palette.sand;
    var bottom = this.viewHeight || 150;
    ctx.fillStyle = sand;
    ctx.fillRect(0, this.lineY, this.logicalWidth, Math.max(bottom - this.lineY, 24));
    ctx.fillStyle = ground;
    ctx.fillRect(0, this.lineY, this.logicalWidth, 2);
    var i;
    var j;
    var g;
    for (i = 0; i < this.ground.length; i++) {
      g = this.ground[i];
      for (j = 0; j < g.bumps.length; j++) {
        ctx.fillRect(g.x + g.bumps[j].x, this.lineY + 2, g.bumps[j].w, g.bumps[j].h);
      }
    }
    ctx.fillStyle = ground;
    for (i = 0; i < this.pebbles.length; i++) {
      ctx.fillRect(
        this.pebbles[i].x,
        this.pebbles[i].y,
        this.pebbles[i].w,
        this.pebbles[i].h
      );
    }
    this.drawFauna(ctx, palette);
    for (i = 0; i < this.clouds.length; i++) {
      if (palette.biome === "water") {
        ctx.fillStyle = palette.cloud;
        ctx.fillRect(Math.round(this.clouds[i].x) + 6, this.clouds[i].y + 4, 3, 3);
        ctx.fillRect(Math.round(this.clouds[i].x) + 12, this.clouds[i].y - 2, 5, 5);
        ctx.fillRect(Math.round(this.clouds[i].x) + 20, this.clouds[i].y + 6, 2, 2);
      } else {
        Dino.drawRects(
          ctx,
          Dino.Sprites.cloud,
          Math.round(this.clouds[i].x),
          this.clouds[i].y,
          palette.cloud
        );
      }
    }
  };

  Horizon.prototype.reset = function () {
    this.ground[0].x = 0;
    this.ground[1].x = 600;
    this.clouds = [];
    this.seedClouds();
    this.seedPebbles();
    this.seedFauna();
  };

  Horizon.prototype.setWidth = function (logicalWidth) {
    this.logicalWidth = logicalWidth;
  };

  Horizon.prototype.setViewHeight = function (viewHeight) {
    var prev = this.viewHeight;
    this.viewHeight = viewHeight || 150;
    if (Math.abs(prev - this.viewHeight) > 10) {
      this.seedPebbles();
      this.seedFauna();
    }
  };

  Dino.Horizon = Horizon;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = Dino;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
