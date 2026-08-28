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
    this.status = "PAINTING";
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
    this.lastPickupScore = 0;
    this.bolts = [];
    this.blasterTimer = 0;
    this.immuneMs = 0;
    this.attackCd = 0;
    this.attackBtn = null;
    this.tRex.powerKit = this.kit;
    this.hud.kit = this.kit;
    this.choice = null;
    this.hud.choice = null;
    this.fight = null;
    this.hud.boss = null;
    this.skin =
      typeof Dino.loadSkin === "function"
        ? Dino.loadSkin()
        : typeof Dino.createSkin === "function"
          ? Dino.createSkin("#2d6a3f")
          : null;
    this.paintColor = (this.skin && this.skin.fallback) || "#2d6a3f";
    this.paintLast = null;
    this.hurtFlashMs = 0;
    this.tRex.skin = this.skin;
    Dino.syncTrexFromKit(this.tRex, this.kit);
  }

  Game.prototype.resetKit = function () {
    this.kit = Dino.createPowerKit();
    this.pickups = [];
    this.lastPickupScore = 0;
    this.bolts = [];
    this.blasterTimer = 0;
    this.attackCd = 0;
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
    this.tRex.xPos = Dino.Config.startXPos;
    this.tRex.facing = 1;
    this.tRex.skin = this.skin;
    this.hud.reset();
    this.resetKit();
    this.choice = null;
    this.hud.choice = null;
    this.fight = null;
    this.hud.boss = null;
    this.immuneMs = 0;
    this.hurtFlashMs = 0;
    this.attackCd = 0;
    this.status = "RUNNING";
  };

  Game.prototype.pulseHurt = function () {
    this.hurtFlashMs = (Dino.Config && Dino.Config.hurtFlashMs) || 480;
  };

  Game.prototype.crash = function (now) {
    this.pulseHurt();
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

  Game.prototype.applyChoice = function (index, rng) {
    if (!this.choice || !this.choice.options || !this.choice.options[index]) return;
    var effect = this.choice.options[index];
    var spdBefore = typeof Dino.kitSpd === "function" ? Dino.kitSpd(this.kit) : 0;
    var applied =
      typeof Dino.applyEvolution === "function"
        ? Dino.applyEvolution(this.kit, effect.id, rng)
        : (Dino.applyEffect(this.kit, effect.id), [effect.id]);
    Dino.syncTrexFromKit(this.tRex, this.kit);
    if (typeof Dino.runSpeedBonus === "function") {
      this.currentSpeed += Dino.kitSpd(this.kit) * 0.7 - spdBefore * 0.7;
    } else {
      var i;
      var id;
      for (i = 0; i < applied.length; i++) {
        id = applied[i];
        if (id === "skate") this.currentSpeed += 0.7;
        if (id === "boots") this.currentSpeed += 0.9;
      }
    }
    this.hud.announce(effect.label);
    this.choice = null;
    this.hud.choice = null;
    this.immuneMs = Dino.evolutionImmuneMs(this.kit);
    this.status = "RUNNING";
  };

  Game.prototype.handleChoosing = function (dt, input) {
    input = input || {};
    if (!this.choice) {
      this.status = "RUNNING";
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
    this.horizon.update(dt, 0, false);
    this.tRex.update(dt);
  };

  Game.prototype.startBoss = function () {
    var actual = Dino.getActualDistance(this.distanceRan);
    this.obstacles = [];
    this.pickups = [];
    this.bolts = [];
    this.tRex.xPos = 32;
    this.tRex.facing = 1;
    this.tRex.yPos = this.tRex.groundYPos;
    this.tRex.jumping = false;
    this.tRex.jumpVelocity = 0;
    this.tRex.ducking = false;
    this.tRex.update(0, Dino.TrexStatus.RUNNING);
    this.fight = Dino.createBossFight(this.layout.logicalWidth, actual);
    this.hud.boss = this.fight.boss;
    this.status = "BOSS";
  };

  Game.prototype.endBoss = function () {
    this.fight = null;
    this.hud.boss = null;
    this.tRex.xPos = Dino.Config.startXPos;
    this.tRex.facing = 1;
    this.tRex.yPos = this.tRex.groundYPos;
    this.immuneMs = Dino.Config.choiceIframes;
    this.hud.announce("BOSS DERROTADO");
    this.status = "RUNNING";
  };

  Game.prototype.harmFromBoss = function (now) {
    if (this.immuneMs > 0) return false;
    var hit = Dino.resolveObstacleHit(this.kit, { typeConfig: { type: "cactusLarge" } });
    Dino.syncTrexFromKit(this.tRex, this.kit);
    if (hit === "crash") {
      this.crash(now);
      return true;
    }
    this.immuneMs = 700;
    this.pulseHurt();
    return false;
  };

  Game.prototype.handleBoss = function (dt, input, now) {
    input = input || {};
    if (!this.fight || !this.fight.boss) {
      this.status = "RUNNING";
      return;
    }
    if (this.immuneMs > 0) {
      this.immuneMs = Math.max(0, this.immuneMs - dt);
    }
    var left = !!input.left;
    var right = !!input.right;
    if (input.touchClientX != null && typeof Dino.clientToLogical === "function") {
      var local = Dino.clientToLogical(
        input.touchClientX,
        input.touchClientY || 0,
        this.layout
      );
      if (local.x + 6 < this.tRex.xPos) left = true;
      else if (local.x > this.tRex.xPos + 38) right = true;
    }
    Dino.moveBossPlayer(
      this.tRex,
      { left: left, right: right },
      dt,
      this.layout.logicalWidth
    );
    if (input.jumpPressed) {
      this.tRex.startJump(Dino.Config.speed);
    }
    if (input.duck && !this.tRex.jumping) {
      this.tRex.setDuck(true);
    } else if (!input.duck) {
      this.tRex.setDuck(false);
    }
    if (this.tRex.jumping) {
      this.tRex.updateJump(dt);
    }
    this.tRex.update(dt);
    this.updateBlaster(dt, input.firePressed);
    var i;
    var bolt;
    for (i = 0; i < this.bolts.length; i++) {
      bolt = this.bolts[i];
      if (Dino.boltHitsBoss(bolt, this.fight.boss)) {
        bolt.remove = true;
        Dino.hurtBoss(this.fight.boss, Dino.bossAttackDamage(this.kit));
      }
    }
    this.bolts = this.bolts.filter(function (b) {
      return !b.remove && b.xPos < 4000;
    });
    var phase = Dino.updateBoss(
      this.fight.boss,
      dt,
      this.tRex,
      this.layout.logicalWidth,
      this.fight
    );
    this.fight.shots = Dino.updateBossShots(this.fight.shots || [], dt);
    if (Dino.bossStompHit(this.tRex, this.fight.boss)) {
      Dino.hurtBoss(this.fight.boss, Dino.bossAttackDamage(this.kit));
      this.tRex.update(0, Dino.TrexStatus.JUMPING);
      this.tRex.jumpVelocity = -8;
      this.tRex.jumping = true;
      this.tRex.reachedMinHeight = false;
      this.immuneMs = Math.max(this.immuneMs, 280);
    } else if (this.immuneMs <= 0 && Dino.bossBodyHit(this.tRex, this.fight.boss)) {
      if (this.harmFromBoss(now)) return;
    }
    for (i = 0; i < this.fight.shots.length; i++) {
      if (this.immuneMs <= 0 && Dino.shotHitsPlayer(this.fight.shots[i], this.tRex)) {
        this.fight.shots[i].remove = true;
        if (this.harmFromBoss(now)) return;
      }
    }
    this.fight.shots = (this.fight.shots || []).filter(function (s) {
      return !s.remove;
    });
    this.horizon.update(dt, 0, false);
    this.hud.boss = this.fight.boss;
    if (phase === "won" || this.fight.boss.hp <= 0) {
      this.fight.winMs = (this.fight.winMs || 0) + dt;
      if (this.fight.winMs >= 480) this.endBoss();
    }
    this.syncAttackButton();
  };

  Game.prototype.tryAttack = function () {
    if (this.attackCd > 0) return;
    if (!Dino.canAttack(this.kit)) return;
    this.attackCd = Dino.Config.attackCooldown || 260;
    this.tRex.slashMs = 180;
    var boxes = Dino.attackHitboxes(this.kit, this.tRex);
    var i;
    var o;
    for (i = 0; i < this.obstacles.length; i++) {
      o = this.obstacles[i];
      if (o.remove) continue;
      if (
        Dino.slashHitsBox(boxes, {
          x: o.xPos,
          y: o.yPos,
          width: o.width,
          height: o.typeConfig.height
        })
      ) {
        Dino.applyBoltHit(o);
      }
    }
    if (
      this.fight &&
      this.fight.boss &&
      Dino.slashHitsBox(boxes, Dino.bossBox(this.fight.boss))
    ) {
      Dino.hurtBoss(this.fight.boss, Dino.bossAttackDamage(this.kit));
    }
    var bolt = Dino.fireBlaster(this.kit, this.tRex);
    if (bolt) this.bolts.push(bolt);
    Dino.syncTrexFromKit(this.tRex, this.kit);
  };

  Game.prototype.syncAttackButton = function () {
    if (!this.attackBtn) return;
    var show =
      this.isMobile &&
      Dino.canAttack(this.kit) &&
      (this.status === "RUNNING" || this.status === "BOSS");
    this.attackBtn.className = show ? "atk-btn is-visible" : "atk-btn";
    if (this.kit.blaster > 0 && !this.kit.sword && !this.kit.spear) {
      this.attackBtn.textContent = "ATIRAR";
    } else {
      this.attackBtn.textContent = "ATACAR";
    }
  };

  Game.prototype.updateBlaster = function (dt, firePressed) {
    var i;
    var j;
    if (this.attackCd > 0) this.attackCd = Math.max(0, this.attackCd - dt);
    if (this.tRex.slashMs > 0) {
      this.tRex.slashMs = Math.max(0, this.tRex.slashMs - dt);
    }
    if (firePressed) this.tryAttack();
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
      return !b.remove && b.xPos < 4000 && b.xPos > -80;
    });
  };

  Game.prototype.finishPainting = function () {
    if (typeof Dino.saveSkin === "function") Dino.saveSkin(this.skin);
    this.tRex.skin = this.skin;
    this.status = "RUNNING";
    this.runningTime = 0;
    this.tRex.startJump(this.currentSpeed);
  };

  Game.prototype.handlePainting = function (dt, input) {
    var self = this;
    var studio = typeof Dino.paintStudioLayout === "function"
      ? Dino.paintStudioLayout(this.layout)
      : null;
    var used = false;
    var hit;
    var local;
    input = input || {};
    function paintLine(x0, y0, x1, y1) {
      var dx = Math.abs(x1 - x0);
      var dy = Math.abs(y1 - y0);
      var sx = x0 < x1 ? 1 : -1;
      var sy = y0 < y1 ? 1 : -1;
      var err = dx - dy;
      var e2;
      while (true) {
        Dino.paintSkin(self.skin, x0, y0, self.paintColor);
        if (x0 === x1 && y0 === y1) break;
        e2 = 2 * err;
        if (e2 > -dy) {
          err -= dy;
          x0 += sx;
        }
        if (e2 < dx) {
          err += dx;
          y0 += sy;
        }
      }
    }
    function apply(clientX, clientY, isDrag) {
      if (!studio || typeof Dino.clientToHudLogical !== "function") return;
      local = Dino.clientToHudLogical(clientX, clientY, self.layout);
      hit = Dino.hitPaintTarget(local, studio);
      if (!hit) return;
      if (hit.type === "cell") {
        if (isDrag && self.paintLast) {
          paintLine(self.paintLast.x, self.paintLast.y, hit.x, hit.y);
        } else {
          Dino.paintSkin(self.skin, hit.x, hit.y, self.paintColor);
        }
        self.paintLast = { x: hit.x, y: hit.y };
        used = true;
      } else if (hit.type === "swatch" && !isDrag) {
        self.paintColor = hit.color;
        used = true;
      } else if (hit.type === "reset" && !isDrag) {
        self.skin = Dino.createSkin(self.skin.fallback || "#2d6a3f");
        self.tRex.skin = self.skin;
        used = true;
      } else if (hit.type === "start" && !isDrag) {
        used = true;
        self.finishPainting();
      }
    }
    if (this.status === "PAINTING") {
      if (input.holdClientX != null) {
        apply(input.holdClientX, input.holdClientY, true);
      } else if (input.touchClientX != null) {
        apply(input.touchClientX, input.touchClientY, true);
      }
    }
    if (input.pointer) apply(input.pointer.clientX, input.pointer.clientY, !!this.paintLast);
    if (this.status === "PAINTING" && input.holdClientX == null && input.touchClientX == null) {
      this.paintLast = null;
    }
    if (this.status === "PAINTING" && input.jumpPressed && !used) {
      this.finishPainting();
      return;
    }
    this.horizon.update(dt, 0, false);
    this.tRex.update(dt);
  };

  Game.prototype.update = function (dt, now, input) {
    input = input || { jumpPressed: false, duck: false };
    if (this.hurtFlashMs > 0) {
      this.hurtFlashMs = Math.max(0, this.hurtFlashMs - dt);
    }
    if (this.status === "PAINTING") {
      this.handlePainting(dt, input);
      return;
    }
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

    if (this.status === "BOSS") {
      this.handleBoss(dt, input, now);
      return;
    }

    if (this.immuneMs > 0) {
      this.immuneMs = Math.max(0, this.immuneMs - dt);
    }

    if (input.jumpPressed) {
      this.tRex.startJump(this.currentSpeed);
    }
    if (input.duck && !this.tRex.jumping) {
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
    this.updateBlaster(dt, input.firePressed);
    this.syncAttackButton();

    this.obstacles = this.obstacles.filter(function (o) {
      return !o.remove;
    });

    if (this.immuneMs <= 0) {
      for (i = 0; i < this.obstacles.length; i++) {
        if (Dino.tryPopBalloon(this.kit, this.obstacles[i], this.tRex)) {
          Dino.syncTrexFromKit(this.tRex, this.kit);
        }
      }

      for (i = 0; i < this.obstacles.length; i++) {
        if (this.obstacles[i].remove) continue;
        if (!Dino.checkForCollision(this.tRex, this.obstacles[i])) continue;
        var front = this.obstacles[i];
        if (front.typeConfig && front.typeConfig.type === "rock") {
          if (Dino.resolveRockHit(this.kit) === "skate") {
            this.currentSpeed = Math.max(Dino.Config.speed, this.currentSpeed - 0.7);
            front.remove = true;
            Dino.syncTrexFromKit(this.tRex, this.kit);
            this.pulseHurt();
            continue;
          }
        }
        var hit = Dino.resolveObstacleHit(this.kit, front);
        if (hit === "stomp") {
          front.remove = true;
          continue;
        }
        if (hit === "crash") {
          this.crash(now);
          return;
        }
        this.pulseHurt();
        front.remove = true;
        Dino.syncTrexFromKit(this.tRex, this.kit);
        break;
      }
      this.obstacles = this.obstacles.filter(function (o) {
        return !o.remove;
      });
    }

    var prevActual = Dino.getActualDistance(this.distanceRan);
    var maxSpeed =
      typeof Dino.maxRunSpeed === "function"
        ? Dino.maxRunSpeed(this.kit)
        : Dino.Config.maxSpeed + (this.kit.boots || 0) * 1.2;
    this.distanceRan +=
      this.currentSpeed *
      Dino.scoreMultiplier(this.kit) *
      dt /
      (1000 / Dino.FPS);
    if (this.currentSpeed < maxSpeed) {
      this.currentSpeed +=
        Dino.Config.acceleration *
        (1 + (typeof Dino.kitSpd === "function" ? Dino.kitSpd(this.kit) : this.kit.boots || 0) * 0.4);
    }
    if (Dino.crossedBossThreshold(prevActual, Dino.getActualDistance(this.distanceRan))) {
      this.startBoss();
      this.hud.update(dt, this.distanceRan);
      return;
    }
    if (Dino.crossedPickupThreshold(
      prevActual,
      Dino.getActualDistance(this.distanceRan),
      this.kit,
      this.lastPickupScore
    )) {
      this.pickups.push(Dino.createPickup(this.layout.logicalWidth));
      this.lastPickupScore = Dino.nextPickupScore(this.lastPickupScore, this.kit);
    }
    this.hud.update(dt, this.distanceRan);
    this.updateNight(dt);
    this.syncAttackButton();
  };

  Game.prototype.colors = function () {
    var actual = Dino.getActualDistance(this.distanceRan);
    var biome = typeof Dino.biomeAt === "function" ? Dino.biomeAt(actual) : "desert";
    return Dino.palette(this.inverted, biome);
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
    if (this.fight && this.fight.shots) {
      for (i = 0; i < this.fight.shots.length; i++) {
        Dino.drawRects(
          ctx,
          Dino.Sprites.bolt,
          Math.round(this.fight.shots[i].xPos),
          Math.round(this.fight.shots[i].yPos),
          colors.crate
        );
      }
    }
    if (this.fight && this.fight.boss) {
      Dino.drawBoss(ctx, this.fight.boss, colors);
    }
    this.tRex.immuneMs = this.immuneMs;
    this.tRex.draw(ctx, colors);
    this.hud.speed = this.currentSpeed;
    this.hud.drawOverlay(
      ctx,
      this.layout.logicalWidth,
      colors,
      this.status === "CRASHED"
    );
    ctx.setTransform(
      dpr * scale,
      0,
      0,
      dpr * scale,
      0,
      (this.layout.hudOffsetY || 8) * dpr
    );
    this.hud.drawChrome(ctx, this.layout.logicalWidth, colors);
    if (this.status === "PAINTING" && typeof Dino.drawPaintStudio === "function") {
      Dino.drawPaintStudio(
        ctx,
        Dino.paintStudioLayout(this.layout),
        this.skin,
        this.paintColor,
        colors
      );
    }
    if (this.hurtFlashMs > 0 && typeof Dino.drawHurtVignette === "function") {
      var dur = (Dino.Config && Dino.Config.hurtFlashMs) || 480;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      Dino.drawHurtVignette(
        ctx,
        cssW * dpr,
        cssH * dpr,
        this.hurtFlashMs / dur
      );
    }
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

  Dino.boot = function (canvas, unsupportedEl, attackBtn) {
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
    input.attach(canvas, attackBtn);
    var game = new Game({
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight
    });
    game.attackBtn = attackBtn || null;
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
        document.getElementById("unsupported"),
        document.getElementById("attack")
      );
    });
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = Dino;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
