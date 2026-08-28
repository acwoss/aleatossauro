(function (root) {
  var Dino = root.Dino || (root.Dino = {});

  Dino.drawRects = function (ctx, rects, x, y, color) {
    ctx.fillStyle = color;
    var i;
    var r;
    for (i = 0; i < rects.length; i++) {
      r = rects[i];
      ctx.fillRect(x + r.x, y + r.y, r.w, r.h);
    }
  };

  function R(x, y, w, h) {
    return { x: x, y: y, w: w, h: h };
  }

  var trexBody = [
    R(20, 0, 22, 16),
    R(38, 4, 6, 8),
    R(22, 4, 3, 3),
    R(14, 16, 24, 16),
    R(2, 20, 14, 6),
    R(0, 22, 4, 4),
    R(18, 22, 10, 3)
  ];

  var trexWait = trexBody.concat([
    R(16, 32, 12, 8),
    R(18, 40, 6, 7),
    R(18, 44, 10, 3)
  ]);

  var trexBlink = [
    R(20, 0, 22, 16),
    R(38, 4, 6, 8),
    R(22, 6, 8, 2),
    R(14, 16, 24, 16),
    R(2, 20, 14, 6),
    R(0, 22, 4, 4),
    R(18, 22, 10, 3),
    R(16, 32, 12, 8),
    R(18, 40, 6, 7),
    R(18, 44, 10, 3)
  ];

  var trexRun1 = trexBody.concat([
    R(16, 32, 10, 6),
    R(14, 38, 6, 9),
    R(12, 44, 10, 3),
    R(26, 32, 8, 6),
    R(28, 36, 5, 4)
  ]);

  var trexRun2 = trexBody.concat([
    R(18, 32, 10, 6),
    R(22, 38, 6, 9),
    R(20, 44, 10, 3),
    R(12, 32, 8, 5),
    R(10, 36, 6, 4)
  ]);

  var trexSkate = trexBody.concat([
    R(16, 32, 14, 6),
    R(18, 38, 10, 6),
    R(16, 42, 14, 3)
  ]);

  var trexJump = trexBody.concat([
    R(16, 32, 10, 8),
    R(12, 38, 8, 4),
    R(26, 32, 10, 6),
    R(30, 36, 8, 4)
  ]);

  var trexCrash = [
    R(20, 0, 22, 16),
    R(38, 4, 6, 8),
    R(26, 4, 6, 6),
    R(24, 6, 2, 2),
    R(30, 6, 2, 2),
    R(14, 16, 24, 16),
    R(2, 20, 14, 6),
    R(0, 22, 4, 4),
    R(18, 22, 10, 3),
    R(16, 32, 12, 8),
    R(18, 40, 6, 7),
    R(18, 44, 10, 3)
  ];

  var trexDuck1 = [
    R(32, 18, 26, 14),
    R(52, 22, 7, 6),
    R(34, 22, 3, 3),
    R(8, 24, 28, 14),
    R(0, 28, 10, 6),
    R(18, 36, 12, 6),
    R(16, 42, 8, 5),
    R(30, 36, 10, 4)
  ];

  var trexDuck2 = [
    R(32, 18, 26, 14),
    R(52, 22, 7, 6),
    R(34, 22, 3, 3),
    R(8, 24, 28, 14),
    R(0, 28, 10, 6),
    R(22, 36, 12, 6),
    R(24, 42, 8, 5),
    R(12, 36, 10, 4)
  ];

  var cactusSmall = [
    R(6, 0, 5, 35),
    R(0, 8, 6, 4),
    R(0, 8, 3, 12),
    R(11, 12, 6, 4),
    R(14, 12, 3, 10)
  ];

  var cactusLarge = [
    R(10, 0, 6, 50),
    R(0, 10, 10, 5),
    R(0, 10, 4, 16),
    R(16, 16, 9, 5),
    R(21, 16, 4, 14)
  ];

  var ptero1 = [
    R(18, 18, 20, 8),
    R(8, 14, 12, 6),
    R(2, 16, 8, 4),
    R(0, 14, 4, 3),
    R(34, 16, 10, 6),
    R(12, 4, 16, 14),
    R(16, 0, 8, 6)
  ];

  var ptero2 = [
    R(18, 18, 20, 8),
    R(8, 14, 12, 6),
    R(2, 16, 8, 4),
    R(0, 14, 4, 3),
    R(34, 16, 10, 6),
    R(12, 22, 16, 14),
    R(16, 32, 8, 6)
  ];

  var cloud = [
    R(8, 4, 16, 6),
    R(4, 6, 10, 6),
    R(18, 6, 22, 6),
    R(10, 8, 24, 6)
  ];

  var restart = [
    R(7, 0, 22, 4),
    R(25, 4, 4, 22),
    R(7, 32, 22, 4),
    R(3, 4, 4, 22),
    R(0, 10, 10, 8),
    R(14, 14, 8, 8)
  ];

  function digit(segs) {
    var rects = [];
    if (segs[0]) rects.push(R(1, 0, 8, 2));
    if (segs[1]) rects.push(R(8, 1, 2, 5));
    if (segs[2]) rects.push(R(8, 7, 2, 5));
    if (segs[3]) rects.push(R(1, 11, 8, 2));
    if (segs[4]) rects.push(R(0, 7, 2, 5));
    if (segs[5]) rects.push(R(0, 1, 2, 5));
    if (segs[6]) rects.push(R(1, 5, 8, 2));
    return rects;
  }

  Dino.Sprites = {
    trex: {
      wait: trexWait,
      blink: trexBlink,
      run1: trexRun1,
      run2: trexRun2,
      jump: trexJump,
      skate: trexSkate,
      crash: trexCrash,
      duck1: trexDuck1,
      duck2: trexDuck2
    },
    cactusSmall: cactusSmall,
    cactusLarge: cactusLarge,
    ptero1: ptero1,
    ptero2: ptero2,
    cloud: cloud,
    restart: restart,
    digit0: digit([1, 1, 1, 1, 1, 1, 0]),
    digit1: digit([0, 1, 1, 0, 0, 0, 0]),
    digit2: digit([1, 1, 0, 1, 1, 0, 1]),
    digit3: digit([1, 1, 1, 1, 0, 0, 1]),
    digit4: digit([0, 1, 1, 0, 0, 1, 1]),
    digit5: digit([1, 0, 1, 1, 0, 1, 1]),
    digit6: digit([1, 0, 1, 1, 1, 1, 1]),
    digit7: digit([1, 1, 1, 0, 0, 0, 0]),
    digit8: digit([1, 1, 1, 1, 1, 1, 1]),
    digit9: digit([1, 1, 1, 1, 0, 1, 1]),
    hiH: [R(0, 0, 2, 13), R(8, 0, 2, 13), R(2, 5, 6, 2)],
    hiI: [R(3, 0, 4, 2), R(4, 2, 2, 9), R(3, 11, 4, 2)],
    crate: [
      R(0, 2, 16, 14),
      R(2, 0, 12, 2),
      R(7, 2, 2, 14),
      R(2, 8, 12, 2)
    ],
    nest: [
      R(2, 12, 18, 4),
      R(0, 10, 6, 5),
      R(16, 10, 6, 5),
      R(4, 15, 14, 3),
      R(1, 8, 5, 4),
      R(16, 8, 5, 4),
      R(6, 11, 10, 3)
    ],
    egg: [
      R(8, 1, 6, 3),
      R(6, 3, 10, 10),
      R(7, 2, 8, 12),
      R(9, 4, 2, 2),
      R(12, 7, 2, 2)
    ],
    hat: [
      R(2, 4, 18, 3),
      R(6, 0, 10, 5),
      R(8, 0, 6, 2)
    ],
    skate: [
      R(0, 4, 28, 3),
      R(2, 2, 4, 3),
      R(20, 2, 4, 3),
      R(4, 7, 5, 3),
      R(18, 7, 5, 3)
    ],
    wings: [
      R(0, 6, 14, 4),
      R(2, 10, 12, 4),
      R(4, 14, 10, 4),
      R(6, 18, 8, 3),
      R(10, 2, 8, 6)
    ],
    balloon: [
      R(2, 0, 10, 12),
      R(6, 12, 2, 8)
    ],
    gun: [
      R(0, 2, 12, 4),
      R(10, 0, 4, 8),
      R(14, 2, 6, 3)
    ],
    bolt: [
      R(0, 1, 10, 2),
      R(8, 0, 4, 4)
    ],
    shield: [
      R(2, 0, 12, 2),
      R(0, 2, 2, 12),
      R(14, 2, 2, 12),
      R(2, 14, 12, 2)
    ],
    rock: [
      R(2, 4, 14, 6),
      R(0, 6, 6, 4),
      R(12, 5, 6, 5),
      R(5, 2, 8, 4)
    ]
  };

  Dino.Sprites.digits = [
    Dino.Sprites.digit0,
    Dino.Sprites.digit1,
    Dino.Sprites.digit2,
    Dino.Sprites.digit3,
    Dino.Sprites.digit4,
    Dino.Sprites.digit5,
    Dino.Sprites.digit6,
    Dino.Sprites.digit7,
    Dino.Sprites.digit8,
    Dino.Sprites.digit9
  ];

  if (typeof module !== "undefined" && module.exports) {
    module.exports = Dino;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
