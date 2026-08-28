(function (root) {
  var Dino = root.Dino || (root.Dino = {});

  Dino.BOSS_NAMES = ["TIRANO", "CARNO", "ESPINO", "RAPTOR", "ANQUILO", "GIGANO"];

  Dino.crossedBossThreshold = function (prevActual, actual) {
    var interval = Dino.Config.bossScoreInterval || 5000;
    if (actual < interval) return false;
    return Math.floor(prevActual / interval) < Math.floor(actual / interval);
  };

  Dino.bossDifficulty = function (actualScore) {
    return Math.max(1, Math.floor((actualScore || 0) / 1000));
  };

  Dino.bossMaxHp = function (difficulty) {
    return 2 + (difficulty || 1);
  };

  Dino.bossScale = function (difficulty, jitter) {
    return Dino.clamp(1.42 + (difficulty || 1) * 0.08 + (jitter || 0), 1.42, 2.5);
  };

  Dino.bossChargeSpeed = function (difficulty) {
    return Math.min(0.42, 0.1 + (difficulty || 1) * 0.024);
  };

  Dino.bossIdleMs = function (difficulty) {
    return Math.max(160, 880 - (difficulty || 1) * 65);
  };

  Dino.bossPlayerBox = function (tRex) {
    var s = tRex.drawScale > 0 ? tRex.drawScale : 1;
    var standH = Dino.Config.trexHeight;
    var standW = tRex.ducking ? Dino.Config.trexWidthDuck : Dino.Config.trexWidth;
    var top = tRex.yPos + standH - standH * s;
    if (tRex.ducking) {
      return {
        x: tRex.xPos,
        y: top + 18 * s,
        width: standW * s,
        height: Dino.Config.trexHeightDuck * s
      };
    }
    return {
      x: tRex.xPos,
      y: top,
      width: standW * s,
      height: standH * s
    };
  };

  Dino.bossBox = function (boss) {
    return {
      x: boss.xPos,
      y: boss.yPos,
      width: boss.width,
      height: boss.height
    };
  };

  Dino.createBossFight = function (logicalWidth, actualScore, rng) {
    rng = rng || Math.random;
    var difficulty = Dino.bossDifficulty(actualScore);
    var scale = Dino.bossScale(difficulty, rng() * 0.18);
    var maxHp = Dino.bossMaxHp(difficulty);
    var w = Dino.Config.trexWidth * scale;
    var h = Dino.Config.trexHeight * scale;
    var feetY = Dino.DEFAULT_HEIGHT - Dino.Config.bottomPad;
    var names = Dino.BOSS_NAMES;
    return {
      boss: {
        name: names[Math.floor(rng() * names.length) % names.length],
        difficulty: difficulty,
        hp: maxHp,
        maxHp: maxHp,
        scale: scale,
        color: Math.floor(rng() * 4),
        xPos: logicalWidth - w - 28,
        yPos: feetY - h,
        width: w,
        height: h,
        facing: -1,
        vx: 0,
        state: "idle",
        timer: Dino.bossIdleMs(difficulty),
        pose: "wait",
        hurtMs: 0,
        anim: 0,
        chargeMs: 0,
        jumping: false,
        jumpVelocity: 0
      },
      shots: []
    };
  };

  Dino.bossAttackDamage = function (kit) {
    if (typeof Dino.rpgStats === "function") return Dino.rpgStats(kit).str;
    return 1 + ((kit && kit.gravity) || 0);
  };

  Dino.hurtBoss = function (boss, amount) {
    if (!boss || boss.hp <= 0) return;
    boss.hp = Math.max(0, boss.hp - (amount || 1));
    boss.hurtMs = 420;
    if (boss.hp <= 0) {
      boss.state = "dead";
      boss.pose = "crash";
      boss.vx = 0;
      return;
    }
    boss.state = "hurt";
    boss.timer = 300;
    boss.vx = 0;
  };

  Dino.bossStompHit = function (tRex, boss) {
    if (!tRex || !boss || boss.hp <= 0) return false;
    if (!tRex.jumping || tRex.jumpVelocity <= 0) return false;
    var pb = Dino.bossPlayerBox(tRex);
    var bb = Dino.bossBox(boss);
    if (!Dino.boxCompare(pb, bb)) return false;
    return pb.y + pb.height < bb.y + bb.height * 0.48;
  };

  Dino.bossBodyHit = function (tRex, boss) {
    if (!tRex || !boss || boss.hp <= 0) return false;
    if (Dino.bossStompHit(tRex, boss)) return false;
    return Dino.boxCompare(Dino.bossPlayerBox(tRex), Dino.bossBox(boss));
  };

  Dino.moveBossPlayer = function (tRex, input, dt, logicalWidth) {
    input = input || {};
    var sp = 0.24 * dt;
    var dx = 0;
    if (input.left) dx -= 1;
    if (input.right) dx += 1;
    if (dx < 0) tRex.facing = -1;
    if (dx > 0) tRex.facing = 1;
    tRex.xPos += dx * sp;
    var maxX = Math.max(8, logicalWidth - (tRex.config.width || 44) - 8);
    tRex.xPos = Dino.clamp(tRex.xPos, 8, maxX);
  };

  Dino.createBossShot = function (boss) {
    return {
      xPos: boss.xPos - 8,
      yPos: boss.yPos + boss.height * 0.38,
      width: 12,
      height: 5,
      vx: -(0.22 + boss.difficulty * 0.018)
    };
  };

  Dino.updateBossShots = function (shots, dt) {
    var i;
    for (i = 0; i < shots.length; i++) {
      shots[i].xPos += shots[i].vx * dt;
      if (shots[i].xPos + shots[i].width < 0) shots[i].remove = true;
    }
    return shots.filter(function (s) {
      return !s.remove;
    });
  };

  Dino.shotHitsPlayer = function (shot, tRex) {
    if (!shot || !tRex) return false;
    return Dino.boxCompare(
      { x: shot.xPos, y: shot.yPos, width: shot.width, height: shot.height },
      Dino.bossPlayerBox(tRex)
    );
  };

  Dino.boltHitsBoss = function (bolt, boss) {
    if (!bolt || !boss || boss.hp <= 0) return false;
    return Dino.boxCompare(
      { x: bolt.xPos, y: bolt.yPos, width: bolt.width, height: bolt.height },
      Dino.bossBox(boss)
    );
  };

  function keepBossOnGround(boss) {
    var feetY = Dino.DEFAULT_HEIGHT - Dino.Config.bottomPad;
    boss.width = Dino.Config.trexWidth * boss.scale;
    boss.height = Dino.Config.trexHeight * boss.scale;
    if (!boss.jumping) {
      boss.yPos = feetY - boss.height;
    } else if (boss.yPos + boss.height > feetY) {
      boss.yPos = feetY - boss.height;
      boss.jumping = false;
      boss.jumpVelocity = 0;
    }
  }

  Dino.updateBoss = function (boss, dt, tRex, logicalWidth, fight) {
    keepBossOnGround(boss);
    boss.anim += dt;
    if (boss.hurtMs > 0) boss.hurtMs = Math.max(0, boss.hurtMs - dt);
    if (boss.hp <= 0) {
      boss.state = "dead";
      boss.pose = "crash";
      return "won";
    }
    var maxX = Math.max(40, logicalWidth - boss.width - 8);
    if (boss.state === "idle") {
      boss.timer -= dt;
      boss.vx = 0;
      boss.pose = Math.floor(boss.anim / 280) % 2 === 0 ? "wait" : "blink";
      if (boss.timer <= 0) {
        boss.state = "charge";
        boss.chargeMs = 0;
        boss.facing = tRex.xPos + 22 < boss.xPos + boss.width / 2 ? -1 : 1;
      }
    } else if (boss.state === "charge") {
      boss.chargeMs += dt;
      boss.vx = boss.facing * Dino.bossChargeSpeed(boss.difficulty);
      boss.xPos += boss.vx * dt;
      boss.pose = Math.floor(boss.anim / 90) % 2 === 0 ? "run1" : "run2";
      if (boss.difficulty >= 7 && !boss.jumping && boss.chargeMs > 180 && boss.chargeMs < 220) {
        boss.jumping = true;
        boss.jumpVelocity = -8 - Math.min(4, boss.difficulty * 0.15);
      }
      if (boss.jumping) {
        boss.yPos += boss.jumpVelocity * (dt / (1000 / 60));
        boss.jumpVelocity += 0.6 * (dt / (1000 / 60));
        boss.pose = "jump";
      }
      var hitEdge = boss.xPos <= 12 || boss.xPos >= maxX;
      if (hitEdge || boss.chargeMs > 900 + boss.difficulty * 20) {
        boss.xPos = Dino.clamp(boss.xPos, 12, maxX);
        boss.state = "recover";
        boss.timer = Math.max(220, 480 - boss.difficulty * 18);
        if (fight && boss.difficulty >= 4) {
          fight.shots.push(Dino.createBossShot(boss));
        }
      }
    } else if (boss.state === "recover") {
      boss.timer -= dt;
      boss.vx = 0;
      boss.pose = "wait";
      if (boss.timer <= 0) {
        boss.state = "idle";
        boss.timer = Dino.bossIdleMs(boss.difficulty);
      }
    } else if (boss.state === "hurt") {
      boss.timer -= dt;
      boss.pose = "crash";
      boss.xPos += -boss.facing * 0.06 * dt;
      if (boss.timer <= 0) {
        boss.state = "idle";
        boss.timer = Dino.bossIdleMs(boss.difficulty) * 0.55;
      }
    }
    boss.xPos = Dino.clamp(boss.xPos, 12, maxX);
    keepBossOnGround(boss);
    return "fight";
  };

  Dino.drawBoss = function (ctx, boss, palette) {
    if (!boss) return;
    var pose = Dino.Sprites.trex[boss.pose] || Dino.Sprites.trex.wait;
    var colors = palette.fauna || [palette.dino];
    var color = colors[boss.color % colors.length];
    ctx.save();
    if (boss.hurtMs > 0 && Math.floor(boss.hurtMs / 70) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }
    ctx.translate(Math.round(boss.xPos), Math.round(boss.yPos));
    ctx.scale(boss.scale, boss.scale);
    if (boss.facing < 0) {
      ctx.translate(Dino.Config.trexWidth, 0);
      ctx.scale(-1, 1);
    }
    Dino.drawRects(ctx, pose, 0, 0, color);
    ctx.restore();
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = Dino;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
