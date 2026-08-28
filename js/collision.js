(function (root) {
  var Dino = root.Dino || (root.Dino = {});

  function CollisionBox(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  Dino.CollisionBox = CollisionBox;

  Dino.boxCompare = function (tRexBox, obstacleBox) {
    return (
      tRexBox.x < obstacleBox.x + obstacleBox.width &&
      tRexBox.x + tRexBox.width > obstacleBox.x &&
      tRexBox.y < obstacleBox.y + obstacleBox.height &&
      tRexBox.y + tRexBox.height > obstacleBox.y
    );
  };

  Dino.createAdjustedCollisionBox = function (box, adjustment) {
    return new CollisionBox(
      box.x + adjustment.x,
      box.y + adjustment.y,
      box.width,
      box.height
    );
  };

  Dino.TREX_BOXES_RUNNING = [
    new CollisionBox(22, 0, 17, 16),
    new CollisionBox(1, 18, 30, 9),
    new CollisionBox(10, 35, 14, 8),
    new CollisionBox(1, 24, 29, 5),
    new CollisionBox(5, 30, 21, 4),
    new CollisionBox(9, 34, 15, 4)
  ];

  Dino.TREX_BOXES_DUCKING = [
    new CollisionBox(1, 18, 55, 25)
  ];

  Dino.checkForCollision = function (tRex, obstacle) {
    var s = tRex.drawScale > 0 ? tRex.drawScale : 1;
    var standH = Dino.Config ? Dino.Config.trexHeight : tRex.config.height;
    var standW = tRex.ducking && Dino.Config
      ? Dino.Config.trexWidthDuck
      : tRex.config.width;
    var top = tRex.yPos + standH - standH * s;
    var tRexBox = new CollisionBox(
      tRex.xPos + s,
      top + s,
      standW * s - 2 * s,
      standH * s - 2 * s
    );
    var obstacleBox = new CollisionBox(
      obstacle.xPos + 1,
      obstacle.yPos + 1,
      obstacle.typeConfig.width * obstacle.size - 2,
      obstacle.typeConfig.height - 2
    );
    if (!Dino.boxCompare(tRexBox, obstacleBox)) return false;
    var tRexBoxes = tRex.getCollisionBoxes();
    var i;
    var j;
    for (i = 0; i < tRexBoxes.length; i++) {
      for (j = 0; j < obstacle.collisionBoxes.length; j++) {
        var adjTrex = new CollisionBox(
          tRex.xPos + tRexBoxes[i].x * s,
          top + tRexBoxes[i].y * s,
          tRexBoxes[i].width * s,
          tRexBoxes[i].height * s
        );
        var adjObs = Dino.createAdjustedCollisionBox(
          obstacle.collisionBoxes[j],
          obstacleBox
        );
        if (Dino.boxCompare(adjTrex, adjObs)) {
          return [adjTrex, adjObs];
        }
      }
    }
    return false;
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = Dino;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
