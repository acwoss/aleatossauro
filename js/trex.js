(function (root) {
  var Dino = root.Dino || (root.Dino = {});
  var C = null;

  var Status = {
    WAITING: "WAITING",
    RUNNING: "RUNNING",
    JUMPING: "JUMPING",
    DUCKING: "DUCKING",
    CRASHED: "CRASHED"
  };

  var anim = {};
  anim[Status.WAITING] = { frames: ["wait", "blink"], msPerFrame: 1000 / 3 };
  anim[Status.RUNNING] = { frames: ["run1", "run2"], msPerFrame: 1000 / 12 };
  anim[Status.JUMPING] = { frames: ["jump"], msPerFrame: 1000 / 60 };
  anim[Status.DUCKING] = { frames: ["duck1", "duck2"], msPerFrame: 1000 / 8 };
  anim[Status.CRASHED] = { frames: ["crash"], msPerFrame: 1000 / 60 };

  function cfg() {
    if (!C) C = Dino.Config;
    return C;
  }

  function Trex(groundY) {
    var c = cfg();
    this.config = {
      width: c.trexWidth,
      height: c.trexHeight,
      widthDuck: c.trexWidthDuck,
      heightDuck: c.trexHeightDuck,
      gravity: c.gravity,
      initialJumpVelocity: c.initialJumpVelocity,
      minJumpHeight: c.minJumpHeight,
      maxJumpHeight: c.maxJumpHeight,
      speedDropCoefficient: c.speedDropCoefficient,
      dropVelocity: c.dropVelocity
    };
    this.groundYPos = groundY;
    this.minJumpHeight = groundY - c.minJumpHeight;
    this.xPos = c.startXPos;
    this.yPos = groundY;
    this.facing = 1;
    this.slashMs = 0;
    this.jumping = false;
    this.ducking = false;
    this.speedDrop = false;
    this.jumpVelocity = 0;
    this.reachedMinHeight = false;
    this.status = Status.WAITING;
    this.timer = 0;
    this.currentFrame = 0;
    this.msPerFrame = anim[Status.WAITING].msPerFrame;
    this.currentAnimFrames = anim[Status.WAITING].frames;
    this.blinkDelay = Math.ceil(Math.random() * c.blinkTiming);
    this.animStartTime = 0;
    this.blinkOn = false;
    this.extraJumps = 0;
    this.airJumpsUsed = 0;
    this.drawScale = 1;
    this.powerKit = null;
  }

  Trex.prototype.update = function (deltaTime, status) {
    this.timer += deltaTime;
    if (status !== undefined) {
      this.status = status;
      this.currentFrame = 0;
      this.msPerFrame = anim[status].msPerFrame;
      this.currentAnimFrames = anim[status].frames;
      if (status === Status.WAITING) {
        this.animStartTime = Date.now();
        this.blinkDelay = Math.ceil(Math.random() * cfg().blinkTiming);
        this.blinkOn = false;
      }
    }
    if (this.status === Status.WAITING) {
      var elapsed = Date.now() - this.animStartTime;
      if (elapsed >= this.blinkDelay) {
        this.blinkOn = !this.blinkOn;
        this.animStartTime = Date.now();
        this.blinkDelay = this.blinkOn ? 200 : Math.ceil(Math.random() * cfg().blinkTiming);
      }
    }
    if (this.timer >= this.msPerFrame) {
      this.currentFrame =
        this.currentFrame === this.currentAnimFrames.length - 1
          ? 0
          : this.currentFrame + 1;
      this.timer = 0;
    }
    if (this.speedDrop && this.yPos === this.groundYPos) {
      this.speedDrop = false;
      this.setDuck(true);
    }
  };

  Trex.prototype.startJump = function (speed) {
    if (!this.jumping) {
      this.update(0, Status.JUMPING);
      this.jumpVelocity = this.config.initialJumpVelocity - speed / 10;
      this.jumping = true;
      this.reachedMinHeight = false;
      this.speedDrop = false;
      this.ducking = false;
      this.airJumpsUsed = 0;
    } else if ((this.extraJumps || 0) > (this.airJumpsUsed || 0)) {
      this.airJumpsUsed += 1;
      this.update(0, Status.JUMPING);
      this.jumpVelocity = this.config.initialJumpVelocity - speed / 10;
      this.reachedMinHeight = false;
      this.speedDrop = false;
      this.ducking = false;
    }
  };

  Trex.prototype.endJump = function () {
    if (this.reachedMinHeight && this.jumpVelocity < this.config.dropVelocity) {
      this.jumpVelocity = this.config.dropVelocity;
    }
  };

  Trex.prototype.updateJump = function (deltaTime) {
    var msPerFrame = anim[this.status].msPerFrame;
    var framesElapsed = deltaTime / msPerFrame;
    if (this.speedDrop) {
      this.yPos += Math.round(
        this.jumpVelocity * this.config.speedDropCoefficient * framesElapsed
      );
    } else {
      this.yPos += Math.round(this.jumpVelocity * framesElapsed);
    }
    this.jumpVelocity +=
      this.config.gravity *
      (typeof Dino.fallMultiplier === "function"
        ? Dino.fallMultiplier(this.powerKit, this.jumpVelocity)
        : this.jumpVelocity > 0
          ? 1.7
          : 1) *
      framesElapsed;
    if (this.yPos < this.minJumpHeight || this.speedDrop) {
      this.reachedMinHeight = true;
    }
    if (this.yPos < this.config.maxJumpHeight || this.speedDrop) {
      this.endJump();
    }
    if (this.yPos > this.groundYPos) {
      this.reset();
    }
  };

  Trex.prototype.setSpeedDrop = function () {
    this.speedDrop = true;
    this.jumpVelocity = 1;
  };

  Trex.prototype.setDuck = function (isDucking) {
    if (isDucking && this.status !== Status.DUCKING) {
      this.update(0, Status.DUCKING);
      this.ducking = true;
    } else if (!isDucking && this.status === Status.DUCKING) {
      this.update(0, Status.RUNNING);
      this.ducking = false;
    }
  };

  Trex.prototype.reset = function () {
    this.yPos = this.groundYPos;
    this.jumpVelocity = 0;
    this.jumping = false;
    this.ducking = false;
    this.speedDrop = false;
    this.airJumpsUsed = 0;
    this.update(0, Status.RUNNING);
  };

  Trex.prototype.crash = function () {
    this.update(0, Status.CRASHED);
    this.jumping = false;
    this.speedDrop = false;
  };

  Trex.prototype.poseKey = function () {
    if (this.status === Status.WAITING) {
      return this.blinkOn ? "blink" : "wait";
    }
    var skating =
      this.powerKit &&
      this.powerKit.skate > 0 &&
      !this.jumping &&
      this.status !== Status.CRASHED;
    if (skating && this.status === Status.DUCKING) return "duck1";
    if (skating) return "skate";
    return this.currentAnimFrames[this.currentFrame];
  };

  Trex.prototype.getCollisionBoxes = function () {
    return this.ducking ? Dino.TREX_BOXES_DUCKING : Dino.TREX_BOXES_RUNNING;
  };

  Trex.prototype.draw = function (ctx, palette) {
    var name = this.poseKey();
    var rects = Dino.Sprites.trex[name] || Dino.Sprites.trex.wait;
    var kit = this.powerKit;
    var scale = this.drawScale || 1;
    var body = palette.dino;
    var gear = typeof Dino.sideGear === "function" ? Dino.sideGear(kit, this.xPos, this.yPos, this.ducking) : { wings: [], balloons: [], skate: false, skates: [], hats: [] };
    ctx.save();
    var alpha = 1;
    if (kit && kit.ghosts > 0) alpha = 0.55;
    if ((this.immuneMs || 0) > 0 && Math.floor(this.immuneMs / 100) % 2 === 0) {
      alpha *= 0.35;
    }
    ctx.globalAlpha = alpha;
    if ((this.facing || 1) < 0) {
      ctx.translate(this.xPos + 22, 0);
      ctx.scale(-1, 1);
      ctx.translate(-(this.xPos + 22), 0);
    }
    if (scale !== 1) {
      var feetY = typeof Dino.drawFeetY === "function" ? Dino.drawFeetY(this) : this.yPos + cfg().trexHeight;
      ctx.translate(this.xPos, feetY);
      ctx.scale(scale, scale);
      ctx.translate(-this.xPos, -feetY);
    }
    var i;
    for (i = 0; i < gear.wings.length; i++) {
      ctx.save();
      ctx.translate(gear.wings[i].x, gear.wings[i].y);
      ctx.scale(gear.wings[i].scale, gear.wings[i].scale);
      Dino.drawRects(ctx, Dino.Sprites.wings, 0, 0, palette.wings);
      ctx.restore();
    }
    for (i = 0; i < gear.balloons.length; i++) {
      Dino.drawRects(
        ctx,
        Dino.Sprites.balloon,
        gear.balloons[i].x,
        gear.balloons[i].y,
        palette.balloon[gear.balloons[i].color % palette.balloon.length]
      );
    }
    if (this.skin && typeof Dino.drawSkinnedRects === "function") {
      Dino.drawSkinnedRects(ctx, rects, this.xPos, this.yPos, this.skin, body);
    } else {
      Dino.drawRects(ctx, rects, this.xPos, this.yPos, body);
    }
    if (gear.hats) {
      for (i = 0; i < gear.hats.length; i++) {
        Dino.drawRects(ctx, Dino.Sprites.hat, gear.hats[i].x, gear.hats[i].y, palette.hat);
      }
    }
    if (gear.gun) {
      Dino.drawRects(ctx, Dino.Sprites.gun, gear.gun.x, gear.gun.y, palette.gun);
    }
    if (gear.sword && Dino.Sprites.sword) {
      var sx = gear.sword.x + ((this.slashMs || 0) > 0 ? 8 : 0);
      Dino.drawRects(ctx, Dino.Sprites.sword, sx, gear.sword.y, palette.sword || palette.gun);
    }
    if (gear.spear && Dino.Sprites.spear) {
      Dino.drawRects(ctx, Dino.Sprites.spear, gear.spear.x, gear.spear.y, palette.spear || palette.cactus);
    }
    if (gear.shield) {
      ctx.globalAlpha = 0.5 * alpha;
      Dino.drawRects(ctx, Dino.Sprites.shield, gear.shield.x, gear.shield.y, palette.shield);
      ctx.globalAlpha = alpha;
    }
    var boards = gear.skates && gear.skates.length ? gear.skates : gear.skate ? [{ x: this.xPos + 8, y: this.yPos + 42 }] : [];
    for (i = 0; i < boards.length; i++) {
      Dino.drawRects(ctx, Dino.Sprites.skate, boards[i].x, boards[i].y, palette.skate);
    }
    ctx.restore();
  };

  Dino.Trex = Trex;
  Dino.TrexStatus = Status;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = Dino;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
