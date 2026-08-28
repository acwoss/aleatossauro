(function (root) {
  var Dino = root.Dino || (root.Dino = {});
  Dino.computeLayout = function (innerWidth, innerHeight) {
    var scale = Dino.clamp(innerWidth / 600, 1, innerHeight * 0.45 / 150);
    var leftover = innerHeight - Dino.DEFAULT_HEIGHT * scale;
    var offsetY = Math.round(Math.max(0, leftover) * 2 / 3);
    return {
      scale: scale,
      logicalWidth: Math.round(innerWidth / scale),
      logicalHeight: Dino.DEFAULT_HEIGHT,
      offsetY: offsetY,
      viewHeight: (innerHeight - offsetY) / scale
    };
  };
  if (typeof module !== "undefined" && module.exports) {
    module.exports = Dino;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
