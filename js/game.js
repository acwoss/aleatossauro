(function (root) {
  var Dino = root.Dino || (root.Dino = {});

  function isMobileViewport(innerWidth) {
    return (
      innerWidth < 600 ||
      (typeof navigator !== "undefined" &&
        (navigator.maxTouchPoints > 0 || "ontouchstart" in (root || {})))
    );
  }

  function Game(opts) {
    opts = opts || {};
    var innerWidth = opts.innerWidth;
    var innerHeight = opts.innerHeight;
    this.layout = Dino.computeLayout(innerWidth, innerHeight);
    var groundY =
      this.layout.logicalHeight -
      Dino.Config.trexHeight -
      Dino.Config.bottomPad;
    this.status = "WAITING";
    this.currentSpeed = Dino.Config.speed;
    this.distanceRan = 0;
    this.runningTime = 0;
    this.invertTimer = 0;
    this.inverted = false;
    this.lastInvertAt = -1;
    this.obstacles = [];
    this.lastTypeCount = {};
    this.lastSpawnType = "";
    this.tRex = new Dino.Trex(groundY);
    this.horizon = new Dino.Horizon(this.layout.logicalWidth, this.layout.viewHeight);
    this.hud = new Dino.Hud();
    this.highestScore = Dino.loadHighScore();
    this.hud.setHighScore(this.highestScore);
    this.crashedAt = 0;
    this.isMobile = opts.isMobile != null ? opts.isMobile : isMobileViewport(innerWidth);
    this.kit = Dino.createPowerKit();
    this.pickups = [];
    this.bolts = [];
    this.blasterTimer = 0;
    this.tRex.powerKit = this.kit;
    this.hud.kit = this.kit;
    this.choice = null;
    this.hud.choice = null;
    Dino.syncTrexFromKit(this.tRex, this.kit);
  }

  Game.prototype.resetKit = function () {
    this.kit = Dino.createPowerKit();
    this.pickups = [];
    this.bolts = [];
    this.blasterTimer = 0;
    this.tRex.powerKit = this.kit;
    this.hud.kit = this.kit;
    Dino.syncTrexFromKit(this.tRex, this.kit);
  };

  Game.prototype.restart = function () {
    this.distanceRan = 0;
    this.currentSpeed = Dino.Config.speed;
    this.runningTime = 0;
    this.inverted = false;
    this.invertTimer = 0;
    this.lastInvertAt = -1;
    this.obstacles = [];
    this.lastTypeCount = {};
    this.lastSpawnType = "";
    this.horizon.reset();
    this.horizon.setWidth(this.layout.logicalWidth);
    this.horizon.setViewHeight(this.layout.viewHeight);
    this.tRex.reset();
    this.hud.reset();
    this.resetKit();
    this.choice = null;
    this.hud.choice = null;
    this.status = "RUNNING";
  };

  Game.prototype.crash = function (now) {
    this.status = "CRASHED";
    this.crashedAt = now;
    this.tRex.crash();
    if (this.distanceRan > this.highestScore) {
      this.highestScore = this.distanceRan;
      Dino.saveHighScore(this.distanceRan);
      this.hud.setHighScore(this.highestScore);
    }
  };

  Game.prototype.maybeSpawn = function () {
    if (this.runningTime < Dino.Config.clearTime) return;
    var last = this.obstacles[this.obstacles.length - 1];
    var need =
      !last ||
      (!last.followingObstacleCreated &&
        last.xPos + last.width + last.gap < this.layout.logicalWidth);
    if (!need) return;
    if (last) last.followingObstacleCreated = true;
    var obs = Dino.spawnObstacle(
      this.currentSpeed,
      this.lastTypeCount,
      this.isMobile,
      this.layout.logicalWidth
    );
    var t = obs.typeConfig.type;
    if (this.lastSpawnType === t) {
      this.lastTypeCount[t] = (this.lastTypeCount[t] || 0) + 1;
    } else {
      this.lastTypeCount = {};
      this.lastTypeCount[t] = 1;
      this.lastSpawnType = t;
    }
    this.obstacles.push(obs);
  };

  Game.prototype.updateNight = function (dt) {
    var actual = Dino.getActualDistance(this.distanceRan);
    if (
      Dino.shouldInvert(actual) &&
      actual !== this.lastInvertAt &&
      this.invertTimer === 0
    ) {
      this.inverted = true;
      this.invertTimer = 1;
      this.lastInvertAt = actual;
    }
    if (this.inverted && this.invertTimer > 0) {
      this.invertTimer += dt;
      if (this.invertTimer > Dino.Config.invertFadeDuration) {
        this.inverted = false;
        this.invertTimer = 0;
      }
    }
  };

  Game.prototype.collectPickups = function () {
    var i;
    var p;
    for (i = 0; i < this.pickups.length; i++) {
      p = this.pickups[i];
      if (Dino.pickupHitsTrex(p, this.tRex)) {
        p.remove = true;
        this.openChoice(Dino.rollChoicePair());
        return;
      }
    }
  };

  Game.prototype.openChoice = function (pair) {
    this.choice = { options: pair, selected: 0 };
    this.hud.choice = this.choice;
    this.status = "CHOOSING";
  };

  Game.prototype.applyChoice = function (index) {
    if (!this.choice || !this.choice.options || !this.choice.options[index]) return;
    var effect = this.choice.options[index];
    Dino.applyEffect(this.kit, effect.id);
    Dino.syncTrexFromKit(this.tRex, this.kit);
    if (effect.id === "skate") {
      this.currentSpeed += 0.7;
    }
    this.hud.announce(effect.label);
    this.choice = null;
    this.hud.choice = null;
    this.status = "RUNNING";
  };

  Game.prototype.handleChoosing = function (dt, input) {
    input = input || {};
    if (!this.choice) {
      this.status = "RUNNING";
      return;
    }
    if (input.choiceNudge) {
      this.choice.selected = (this.choice.selected + input.choiceNudge + 2) % 2;
    }
    if (input.chooseKey === 0 || input.chooseKey === 1) {
      this.applyChoice(input.chooseKey);
      return;
    }
    if (input.pointer) {
      var local = Dino.clientToLogical(
        input.pointer.clientX,
        input.pointer.clientY,
        this.layout
      );
      var hit = Dino.hitChoiceCard(local.x, local.y, this.layout.logicalWidth);
      if (hit >= 0) {
        this.applyChoice(hit);
        return;
      }
    }
    if (input.jumpPressed) {
      this.applyChoice(this.choice.selected);
      return;
    }
    this.horizon.update(dt, 0, false);
    this.tRex.update(dt);
  };

  Game.prototype.updateBlaster = function (dt) {
    var i;
    var j;
    var bolt;
    if (this.kit.blaster > 0) {
      this.blasterTimer += dt;
      if (this.blasterTimer >= Dino.Config.blasterInterval) {
        this.blasterTimer = 0;
        bolt = Dino.fireBlaster(this.kit, this.tRex);
        if (bolt) this.bolts.push(bolt);
        Dino.syncTrexFromKit(this.tRex, this.kit);
      }
    }
    for (i = 0; i < this.bolts.length; i++) {
      Dino.updateBolt(this.bolts[i], dt);
      for (j = 0; j < this.obstacles.length; j++) {
        if (
          !this.bolts[i].remove &&
          !this.obstacles[j].remove &&
          Dino.boltHitsObstacle(this.bolts[i], this.obstacles[j])
        ) {
          this.bolts[i].remove = true;
          Dino.applyBoltHit(this.obstacles[j]);
        }
      }
    }
    this.bolts = this.bolts.filter(function (b) {
      return !b.remove && b.xPos < 4000;
    });
  };

  Game.prototype.update = function (dt, now, input) {
    input = input || { jumpPressed: false, duck: false };
    if (this.status === "WAITING") {
      if (input.jumpPressed) {
        this.status = "RUNNING";
        this.runningTime = 0;
        this.tRex.startJump(this.currentSpeed);
      }
      this.horizon.update(dt, 0, false);
      this.tRex.update(dt);
      return;
    }

    if (this.status === "CRASHED") {
      if (input.jumpPressed && now - this.crashedAt >= Dino.Config.gameoverClearTime) {
        this.restart();
      } else {
        this.horizon.update(dt, 0, false);
        this.tRex.update(dt);
        return;
      }
    }

    if (this.status === "CHOOSING") {
      this.handleChoosing(dt, input);
      return;
    }

    if (input.jumpPressed) {
      this.tRex.startJump(this.currentSpeed);
    }
    if (input.duck && this.tRex.jumping) {
      this.tRex.setSpeedDrop();
    } else if (input.duck && !this.tRex.jumping) {
      this.tRex.setDuck(true);
    } else if (!input.duck) {
      this.tRex.setDuck(false);
    }

    if (this.tRex.jumping) {
      this.tRex.updateJump(dt);
    }
    this.tRex.update(dt);

    this.runningTime += dt;
    var world = Dino.worldSpeedFactor(this.kit);
    this.horizon.update(dt, this.currentSpeed * world, true);
    this.maybeSpawn();

    var i;
    for (i = 0; i < this.obstacles.length; i++) {
      this.obstacles[i].update(dt, this.currentSpeed * world);
    }

    for (i = 0; i < this.pickups.length; i++) {
      Dino.updatePickup(
        this.pickups[i],
        dt,
        this.currentSpeed,
        this.kit,
        this.tRex
      );
    }
    this.collectPickups();
    this.pickups = this.pickups.filter(function (p) {
      return !p.remove;
    });
    if (this.status === "CHOOSING") {
      return;
    }
    this.updateBlaster(dt);

    this.obstacles = this.obstacles.filter(function (o) {
      return !o.remove;
    });

    for (i = 0; i < this.obstacles.length; i++) {
      if (Dino.tryPopBalloon(this.kit, this.obstacles[i], this.tRex)) {
        Dino.syncTrexFromKit(this.tRex, this.kit);
      }
    }

    if (this.obstacles.length && Dino.checkForCollision(this.tRex, this.obstacles[0])) {
      var front = this.obstacles[0];
      if (front.typeConfig && front.typeConfig.type === "rock") {
        if (Dino.resolveRockHit(this.kit) === "skate") {
          this.currentSpeed = Math.max(Dino.Config.speed, this.currentSpeed - 0.7);
        }
        front.remove = true;
        this.obstacles.shift();
        Dino.syncTrexFromKit(this.tRex, this.kit);
      } else {
        var hit = Dino.resolveObstacleHit(this.kit, front);
        if (hit === "crash") {
          this.crash(now);
          return;
        }
        front.remove = true;
        this.obstacles.shift();
        Dino.syncTrexFromKit(this.tRex, this.kit);
      }
    }

    var prevActual = Dino.getActualDistance(this.distanceRan);
    var maxSpeed = Dino.Config.maxSpeed + this.kit.skate * 1.4;
    this.distanceRan +=
      this.currentSpeed *
      Dino.scoreMultiplier(this.kit) *
      dt /
      (1000 / Dino.FPS);
    if (this.currentSpeed < maxSpeed) {
      this.currentSpeed += Dino.Config.acceleration * (1 + this.kit.skate * 0.4);
    }
    if (Dino.crossedPickupThreshold(prevActual, Dino.getActualDistance(this.distanceRan))) {
      this.pickups.push(Dino.createPickup(this.layout.logicalWidth));
    }
    this.hud.update(dt, this.distanceRan);
    this.updateNight(dt);
  };

  Game.prototype.colors = function () {
    return Dino.palette(this.inverted);
  };

  Game.prototype.draw = function (ctx, cssW, cssH, dpr) {
    var colors = this.colors();
    var scale = this.layout.scale;
    var offsetY = this.layout.offsetY;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = colors.sky;
    ctx.fillRect(0, 0, cssW * dpr, cssH * dpr);
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, offsetY * dpr);
    this.horizon.draw(ctx, colors);
    var i;
    for (i = 0; i < this.obstacles.length; i++) {
      this.obstacles[i].draw(ctx, colors);
    }
    for (i = 0; i < this.pickups.length; i++) {
      Dino.drawRects(
        ctx,
        Dino.Sprites.nest,
        Math.round(this.pickups[i].xPos),
        Math.round(this.pickups[i].yPos),
        colors.nest || colors.ground
      );
      Dino.drawRects(
        ctx,
        Dino.Sprites.egg,
        Math.round(this.pickups[i].xPos),
        Math.round(this.pickups[i].yPos),
        colors.egg || colors.crate
      );
    }
    for (i = 0; i < this.bolts.length; i++) {
      Dino.drawRects(
        ctx,
        Dino.Sprites.bolt,
        Math.round(this.bolts[i].xPos),
        Math.round(this.bolts[i].yPos),
        colors.bolt
      );
    }
    this.tRex.draw(ctx, colors);
    this.hud.draw(
      ctx,
      this.layout.logicalWidth,
      colors,
      this.status === "CRASHED"
    );
  };

  Game.prototype.resize = function (innerWidth, innerHeight) {
    this.layout = Dino.computeLayout(innerWidth, innerHeight);
    this.horizon.setWidth(this.layout.logicalWidth);
    this.horizon.setViewHeight(this.layout.viewHeight);
    this.isMobile = isMobileViewport(innerWidth);
  };

  Dino.createGameState = function (opts) {
    return new Game(opts);
  };

  Dino.boot = function (canvas, unsupportedEl) {
    if (
      !canvas ||
      !canvas.getContext ||
      typeof requestAnimationFrame === "undefined"
    ) {
      if (unsupportedEl) unsupportedEl.className += " is-visible";
      if (canvas) canvas.style.display = "none";
      return null;
    }
    var ctx = canvas.getContext("2d");
    if (!ctx) {
      if (unsupportedEl) unsupportedEl.className += " is-visible";
      canvas.style.display = "none";
      return null;
    }

    var input = Dino.createInput();
    input.attach(canvas);
    var game = new Game({
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight
    });
    var last = performance.now();

    function fit() {
      var dpr = window.devicePixelRatio || 1;
      var w = window.innerWidth;
      var h = window.innerHeight;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      game.resize(w, h);
      return dpr;
    }

    var dpr = fit();
    window.addEventListener("resize", function () {
      dpr = fit();
    });
    canvas.addEventListener("contextmenu", function (e) {
      e.preventDefault();
    });

    function frame(now) {
      var dt = Math.min(now - last, Dino.Config.dtMax);
      last = now;
      game.update(dt, now, input.consume());
      game.draw(ctx, window.innerWidth, window.innerHeight, dpr);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    return game;
  };

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", function () {
      Dino.boot(
        document.getElementById("game"),
        document.getElementById("unsupported")
      );
    });
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = Dino;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
