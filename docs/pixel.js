/* Pixel-Grafiken für „Pflege-Sprint“ – alles selbst gezeichnet, keine Bilddateien.
 * Jede Grafik ist ein Raster aus Zeichen; jedes Zeichen steht für eine Farbe,
 * „.“ ist durchsichtig. Beim Start wird jede Grafik einmal in eine kleine
 * Offscreen-Leinwand gezeichnet und danach nur noch kopiert (drawImage). */
(function () {
  'use strict';

  var FARBEN = {
    // Figuren
    F: '#E9B48A', f: '#B97D57',          // Haut (Lina), Haut (Tim)
    H: '#3B2416', h: '#5A3A22',          // Haare Lina, Haare Tim
    K: '#3F6C72', k: '#2F5459',          // Kasack petrol, Schattenseite
    B: '#25434B',                        // Hose dunkelpetrol
    W: '#FFFFFF', w: '#B8C4C7',          // Schuhe weiß, Sohle
    S: '#C9D2D4', s: '#55666A',          // Stethoskop hell / dunkel
    E: '#1A1A1A',                        // Augen
    // Hindernisse
    G: '#D9A35E', g: '#B07C3C',          // Kuchenteig
    C: '#FFF4E2', R: '#C8283C',          // Sahne, Kirsche
    L: '#8B5A2B', l: '#6A4220',          // Holz
    V: '#5E2B71', v: '#8A4FA0', N: '#4E8A3A', // Trauben, Blatt
    M: '#5C6B70', m: '#2B2B2B', r: '#9AA7AB', // Metall, Reifen, Griff
    P: '#E3EAEC', p: '#AEBBBE', T: '#3F6C72', // Pflegewagen
    Y: '#F2C200', Z: '#202020', X: '#D6EEF6', // Wespe
    Q: '#FFFFFF', q: '#C8D2D5', o: '#8E9A9D'  // Traubenzucker
  };

  /* ---------- Figuren (16 × 24) aus Kopf, Oberkörper und Beinen ---------- */
  var KOPF = {
    lina: [
      '......HHHHH.....',
      '.....HHHHHHH....',
      '....HHHHHHHHH...',
      '..HHHHHFFFFFH...',
      '.HHH.HHFFFEFF...',
      '.HH..HFFFFFFF...',
      '.H....HFFFFF....',
      '.......FFFF.....'
    ],
    tim: [
      '................',
      '.....hhhhhh.....',
      '....hhhhhhhh....',
      '....hhhffffh....',
      '....hhffffEf....',
      '....hfffffff....',
      '.....ffffff.....',
      '.......fff......'
    ]
  };

  var RUMPF = [
    '......KFFK......',
    '....KKSKKSKK....',
    '...KKKSKKSKKk...',
    '...KKKSKKSKKk...',
    '...KKKKSSKKKk...',
    '...KKKKKsKKKk...',
    '...+KKKKKKKK+...',
    '....KKKKKKKK....'
  ];

  var BEINE = {
    lauf1: [
      '....BBBBBBBB....',
      '....BBBBBBBB....',
      '...BBBB..BBBB...',
      '...BBB....BBBB..',
      '..BBB......BBB..',
      '..BBB.......BBB.',
      '.WWWW.......WWWW',
      '.www.........www'
    ],
    lauf2: [
      '....BBBBBBBB....',
      '....BBBBBBBB....',
      '.....BBBBBB.....',
      '.....BBBBBB.....',
      '.....BBB.BBB....',
      '.....BBB.BBB....',
      '....WWWW.BBB....',
      '.........WWWW...'
    ],
    lauf3: [
      '....BBBBBBBB....',
      '....BBBBBBBB....',
      '....BBBB.BBBB...',
      '....BBB...BBB...',
      '...BBB....BBB...',
      '...BBB.....BBB..',
      '..WWWW.....WWWW.',
      '..www.......www.'
    ],
    sprung: [
      '....BBBBBBBB....',
      '....BBBBBBBB....',
      '...BBBBBBBBBB...',
      '..BBBB...BBBBB..',
      '..BBB.....WWWW..',
      '.WWWW.....www...',
      '.www............',
      '................'
    ]
  };

  // Ducken: gebeugter Oberkörper, Kopf tiefer und weiter vorn
  var DUCK_RUMPF = [
    '...KKKKKKKK.....',
    '..KKKKKSKKSK+...',
    '..KKKKKSKKSK+...',
    '..kKKKKKSSKK....',
    '..BBBBBBBBBBB...',
    '..BBBB...BBBB...',
    '.WWWW....BBBB...',
    '.www.....WWWWW..'
  ];

  function figurRaster(figur, pose) {
    var kopf = KOPF[figur];
    var haut = figur === 'tim' ? 'f' : 'F';
    var zeilen = [];
    var i;
    if (pose === 'ducken') {
      for (i = 0; i < 24; i++) zeilen.push('................'.split(''));
      // erst Oberkörper, dann Kopf darüber
      for (i = 0; i < 8; i++) zeilen[16 + i] = DUCK_RUMPF[i].replace(/\+/g, haut).split('');
      for (i = 0; i < 8; i++) {
        var z = kopf[i].replace(/F/g, haut);
        for (var x = 0; x < 16; x++) {
          var zx = x - 2;
          if (zx >= 0 && z[zx] !== '.') zeilen[9 + i][x] = z[zx];
        }
      }
      return zeilen.map(function (r) { return r.join(''); });
    }
    var rumpf = RUMPF.map(function (r) { return r.replace(/\+/g, haut).replace(/F/g, haut); });
    if (pose === 'sprung') {
      // Arme nach oben
      rumpf = rumpf.slice();
      rumpf[1] = '..' + haut + 'KKSKKSKK' + haut + '...';
      rumpf[1] = rumpf[1].slice(0, 16);
      rumpf[6] = '....KKKKKKKK....';
    }
    return kopf.map(function (r) { return r.replace(/F/g, haut); })
      .concat(rumpf, BEINE[pose] || BEINE.lauf1);
  }

  /* ---------- Hindernisse und Sammelobjekt ---------- */
  var GRAFIK = {
    kuchen: [
      '..........R.',
      '.......CCCCC',
      '....CCCCCCCC',
      '.CCCCCCCCCCC',
      'GGGGGGGGGGGG',
      'CCCCCCCCCCCC',
      'GGGGGGGGGGGG',
      'GGGGGGGGGGGG',
      'gggggggggggg'
    ],
    weinkiste: [
      '...VvV.NN.VvV...',
      '..VvVvVNVVvVvV..',
      '.VVvVvVVvVVvVvV.',
      'LLLLLLLLLLLLLLLL',
      'LllllllllllllllL',
      'LLLLLLLLLLLLLLLL',
      'LL............LL',
      'LLLLLLLLLLLLLLLL',
      'LllllllllllllllL',
      'LLLLLLLLLLLLLLLL',
      'Ll............lL',
      'LLLLLLLLLLLLLLLL'
    ],
    rollator: [
      '.rr.............',
      '.rM.............',
      '..M.............',
      '..M.............',
      '..MMMMMMMMMMMM..',
      '..M.TTTTTTTT.M..',
      '..M.TTTTTTTT.M..',
      '..M..........M..',
      '...M........M...',
      '...M........M...',
      '...MMMMMMMMMM...',
      '....M......M....',
      '....M......M....',
      '....M......M....',
      '..mmm.....mmm...',
      '.mmMmm...mmMmm..',
      '..mmm.....mmm...'
    ],
    pflegewagen: [
      'MMMMMMMMMMMMMMMMMM',
      'MPPPPPPPPPPPPPPPPM',
      'MPPPPPPPPPPPPPPPPM',
      'MppppppppppppppppM',
      'MPPPPPPPPPPPPPPPPM',
      'MPPPPPPTTTTPPPPPPM',
      'MppppppppppppppppM',
      'MPPPPPPPPPPPPPPPPM',
      'MPPPPPPTTTTPPPPPPM',
      'MppppppppppppppppM',
      'MPPPPPPPPPPPPPPPPM',
      'MPPPPPPTTTTPPPPPPM',
      'MppppppppppppppppM',
      'MMMMMMMMMMMMMMMMMM',
      '..M............M..',
      '.mmm..........mmm.',
      '.mMm..........mMm.',
      '.mmm..........mmm.'
    ],
    wespe1: [
      '...XX..XX...',
      '..XXXXXXXX..',
      '...XX..XX...',
      '.ZYYZZYYZZE.',
      'ZYYZZYYZZYYE',
      '.ZYYZZYYZZ..',
      '..Z.....Z...'
    ],
    wespe2: [
      '............',
      '............',
      '..XXX..XXX..',
      '.ZYYZXXYZZE.',
      'ZYYZZYYZZYYE',
      '.ZYYZZYYZZ..',
      '...Z...Z....'
    ],
    zucker: [
      '.qqqqqq.',
      'qQQQQQQo',
      'qQQQQQQo',
      'qQQQQQQo',
      'qQQQQQQo',
      'qQQQQQQo',
      'qQQQQQQo',
      '.oooooo.'
    ]
  };

  /* ---------- Ziffern (3 × 5) für die Punkteanzeige ---------- */
  var ZIFFERN = [
    ['###', '#.#', '#.#', '#.#', '###'],
    ['.#.', '##.', '.#.', '.#.', '###'],
    ['###', '..#', '###', '#..', '###'],
    ['###', '..#', '.##', '..#', '###'],
    ['#.#', '#.#', '###', '..#', '..#'],
    ['###', '#..', '###', '..#', '###'],
    ['###', '#..', '###', '#.#', '###'],
    ['###', '..#', '.#.', '.#.', '.#.'],
    ['###', '#.#', '###', '#.#', '###'],
    ['###', '#.#', '###', '..#', '###']
  ];

  function leinwand(b, h) {
    var c = document.createElement('canvas');
    c.width = b;
    c.height = h;
    return c;
  }

  function rasterZeichnen(raster, massstab) {
    massstab = massstab || 1;
    var b = 0;
    for (var i = 0; i < raster.length; i++) b = Math.max(b, raster[i].length);
    var c = leinwand(b * massstab, raster.length * massstab);
    var ctx = c.getContext('2d');
    for (var y = 0; y < raster.length; y++) {
      for (var x = 0; x < raster[y].length; x++) {
        var z = raster[y][x];
        if (z === '.' || !FARBEN[z]) continue;
        ctx.fillStyle = FARBEN[z];
        ctx.fillRect(x * massstab, y * massstab, massstab, massstab);
      }
    }
    return c;
  }

  function figur(name, pose, massstab) {
    return rasterZeichnen(figurRaster(name === 'tim' ? 'tim' : 'lina', pose || 'lauf1'), massstab);
  }

  // Ziffernblatt: 10 Ziffern nebeneinander, je 4 px breit (inkl. Abstand)
  function ziffernblatt(farbe) {
    var c = leinwand(40, 5);
    var ctx = c.getContext('2d');
    ctx.fillStyle = farbe;
    for (var d = 0; d < 10; d++) {
      for (var y = 0; y < 5; y++) {
        for (var x = 0; x < 3; x++) {
          if (ZIFFERN[d][y][x] === '#') ctx.fillRect(d * 4 + x, y, 1, 1);
        }
      }
    }
    return c;
  }

  window.PIXEL = {
    FARBEN: FARBEN,
    GRAFIK: GRAFIK,
    figurRaster: figurRaster,
    rasterZeichnen: rasterZeichnen,
    figur: figur,
    ziffernblatt: ziffernblatt,
    leinwand: leinwand
  };
})();
