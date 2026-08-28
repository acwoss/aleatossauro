(function (root) {
  var Dino = root.Dino || (root.Dino = {});

  Dino.getRandomNum = function (min, max) {
    return min + Math.round(Math.random() * (max - min));
  };

  Dino.OBSTACLE_TYPES = [
    {
      type: "cactusSmall",
      width: 17,
      height: 35,
      yPos: 105,
      multipleSpeed: 4,
      minGap: 120,
      minSpeed: 0,
      collisionBoxes: [
        { x: 0, y: 7, width: 5, height: 27 },
        { x: 4, y: 0, width: 6, height: 34 },
        { x: 10, y: 4, width: 7, height: 14 }
      ]
    },
    {
      type: "cactusLarge",
      width: 25,
      height: 50,
      yPos: 90,
      multipleSpeed: 7,
      minGap: 120,
      minSpeed: 0,
      collisionBoxes: [
        { x: 0, y: 12, width: 7, height: 38 },
        { x: 8, y: 0, width: 7, height: 49 },
        { x: 13, y: 10, width: 10, height: 38 }
      ]
    },
    {
      type: "pterodactyl",
      width: 46,
      height: 40,
      yPos: [100, 75, 50],
      yPosMobile: [100, 50],
      multipleSpeed: 999,
      minSpeed: 8.5,
      minGap: 150,
      speedOffset: 0.8,
      numFrames: 2,
      frameRate: 1000 / 6,
      collisionBoxes: [
        { x: 15, y: 15, width: 16, height: 5 },
        { x: 18, y: 21, width: 24, height: 6 },
        { x: 2, y: 14, width: 4, height: 3 },
        { x: 6, y: 10, width: 4, height: 7 },
        { x: 10, y: 8, width: 6, height: 9 }
      ]
    },
    {
      type: "rock",
      width: 18,
      height: 10,
      yPos: 130,
      multipleSpeed: 999,
      minGap: 90,
      minSpeed: 0,
      collisionBoxes: [
        { x: 1, y: 2, width: 16, height: 8 }
      ]
    }
  ];

  function Obstacle(typeConfig, logicalWidth, gapCoefficient, speed, isMobile) {
    this.typeConfig = typeConfig;
    this.size = Dino.getRandomNum(1, Dino.Config.maxObstacleLength);
    if (this.size > 1 && typeConfig.multipleSpeed > speed) {
      this.size = 1;
    }
    if (typeConfig.type === "rock" || typeConfig.type === "pterodactyl") {
      this.size = 1;
    }
    this.width = typeConfig.width * this.size;
    this.xPos = logicalWidth;
    if (Array.isArray(typeConfig.yPos)) {
      var ys = isMobile ? typeConfig.yPosMobile : typeConfig.yPos;
      this.yPos = ys[Dino.getRandomNum(0, ys.length - 1)];
    } else {
      this.yPos = typeConfig.yPos;
    }
    this.collisionBoxes = [];
    this.cloneCollisionBoxes();
    if (this.size > 1 && this.collisionBoxes.length >= 3) {
      this.collisionBoxes[1].width =
        this.width - this.collisionBoxes[0].width - this.collisionBoxes[2].width;
      this.collisionBoxes[2].x = this.width - this.collisionBoxes[2].width;
    }
    this.speedOffset = 0;
    if (typeConfig.speedOffset) {
      this.speedOffset =
        Math.random() > 0.5 ? typeConfig.speedOffset : -typeConfig.speedOffset;
    }
    this.gap = this.getGap(gapCoefficient, speed);
    this.remove = false;
    this.currentFrame = 0;
    this.timer = 0;
    this.followingObstacleCreated = false;
  }

  Obstacle.prototype.cloneCollisionBoxes = function () {
    var boxes = this.typeConfig.collisionBoxes;
    var i;
    this.collisionBoxes = [];
    for (i = 0; i < boxes.length; i++) {
      this.collisionBoxes.push(
        new Dino.CollisionBox(boxes[i].x, boxes[i].y, boxes[i].width, boxes[i].height)
      );
    }
  };

  Obstacle.prototype.getGap = function (gapCoefficient, speed) {
    var minGap = Math.round(
      this.width * speed + this.typeConfig.minGap * gapCoefficient
    );
    var maxGap = Math.round(minGap * Dino.Config.maxGapCoefficient);
    return Dino.getRandomNum(minGap, maxGap);
  };

  Obstacle.prototype.update = function (deltaTime, speed) {
    if (this.remove) return;
    if (this.typeConfig.speedOffset) {
      speed += this.speedOffset;
    }
    this.xPos -= Math.floor((speed * Dino.FPS / 1000) * deltaTime);
    if (this.typeConfig.numFrames) {
      this.timer += deltaTime;
      if (this.timer >= this.typeConfig.frameRate) {
        this.currentFrame =
          this.currentFrame === this.typeConfig.numFrames - 1 ? 0 : this.currentFrame + 1;
        this.timer = 0;
      }
    }
    if (this.xPos + this.width < 0) {
      this.remove = true;
    }
  };

  Dino.obstacleSprite = function (type, frame, biome) {
    if (type === "pterodactyl") {
      if (biome === "water") {
        return frame ? Dino.Sprites.mosa2 : Dino.Sprites.mosa1;
      }
      return frame ? Dino.Sprites.ptero2 : Dino.Sprites.ptero1;
    }
    if (type === "cactusLarge") {
      return biome === "water" ? Dino.Sprites.algaeLarge : Dino.Sprites.cactusLarge;
    }
    if (type === "rock") return Dino.Sprites.rock;
    return biome === "water" ? Dino.Sprites.algaeSmall : Dino.Sprites.cactusSmall;
  };

  Obstacle.prototype.draw = function (ctx, palette) {
    var biome = (palette && palette.biome) || "desert";
    var sprite = Dino.obstacleSprite(this.typeConfig.type, this.currentFrame, biome);
    var color = palette.cactus;
    if (this.typeConfig.type === "pterodactyl") {
      color = palette.ptero;
    } else if (this.typeConfig.type === "rock") {
      color = palette.rock || palette.ground;
    }
    var i;
    for (i = 0; i < this.size; i++) {
      Dino.drawRects(ctx, sprite, this.xPos + i * this.typeConfig.width, this.yPos, color);
    }
  };

  Dino.Obstacle = Obstacle;

  Dino.spawnObstacle = function (currentSpeed, lastTypeCount, isMobile, logicalWidth) {
    var eligible = [];
    var i;
    var t;
    for (i = 0; i < Dino.OBSTACLE_TYPES.length; i++) {
      t = Dino.OBSTACLE_TYPES[i];
      if (t.minSpeed <= currentSpeed) eligible.push(t);
    }
    var counts = lastTypeCount || {};
    var filtered = [];
    for (i = 0; i < eligible.length; i++) {
      t = eligible[i];
      if ((counts[t.type] || 0) >= Dino.Config.maxObstacleDuplication && eligible.length > 1) {
        continue;
      }
      filtered.push(t);
    }
    if (!filtered.length) filtered = eligible;
    var type = filtered[Dino.getRandomNum(0, filtered.length - 1)];
    return new Obstacle(
      type,
      logicalWidth,
      Dino.Config.gapCoefficient,
      currentSpeed,
      isMobile
    );
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = Dino;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
