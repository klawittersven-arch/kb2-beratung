/* Pixel-Grafiken für „Diabetes Run!“ – alles selbst gezeichnet, keine Bilddateien.
 * Jede Grafik ist ein Raster aus Zeichen; jedes Zeichen steht für eine Farbe,
 * „.“ ist durchsichtig. Beim Start wird jede Grafik einmal in eine kleine
 * Offscreen-Leinwand gezeichnet und danach nur noch kopiert (drawImage). */
(function () {
  'use strict';

  var FARBEN = {
    // Figur: Krankenschwester
    O: '#2B2A33',                        // Umrisslinie
    W: '#FFFFFF', w: '#DCE4E8',          // Haube und Kleid weiß, Schatten
    K: '#EE6F93',                        // Kreuz und Akzente rosa
    H: '#8A4B3C',                        // Haare
    F: '#F7D5B8', c: '#F3A3AC',          // Haut, Wangen
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

  /* ---------- Figur (16 × 24): Krankenschwester mit Haube ---------- */
  // Kopf mit Haube (14 Zeilen), leicht nach rechts gedreht: Augen rechts, links Haare und Ohr
  var KOPF = [
    '.....OOOOOO.....',
    '....OWWWWWWO....',
    '...OWWWKKWWWO...',
    '...OWWKKKKWWO...',
    '...OWWWKKWWWO...',
    '..OHHWWWWWWHHO..',
    '.OHHHHHHHHHHHHO.',
    '.OHHHHFFFFFFHHO.',
    'OOHHHFFFFFFFFFO.',
    'OFFHHFFFEFFFEFO.',
    'OFFHHFFFEFFFEFO.',
    'OOHHHFFcFFFcFFO.',
    '..OHHFFFFFFFFO..',
    '...OOFFFFFFOO...'
  ];

  // Oberkörper im weißen Kleid mit rosa Knöpfen (6 Zeilen)
  var KLEID = [
    '...OWWWKKWWWO...',
    '..OFOWWWWWWOFO..',
    '..OFOWWKWWWOFO..',
    '...OOWWWWWWOO...',
    '....OWWWWWWO....',
    '....OwwwwwwO....'
  ];

  // Arme nach oben (Sprung)
  var KLEID_SPRUNG = [
    '.OFOWWWKKWWWOFO.',
    '..OOWWWWWWWWOO..',
    '...OWWWKWWWWO...',
    '...OOWWWWWWOO...',
    '....OWWWWWWO....',
    '....OwwwwwwO....'
  ];

  // Beine (4 Zeilen) – weiße Strümpfe, rosa Schuhe
  var BEINE = {
    lauf1: [
      '....OWO...OWO...',
      '...OWO.....OWO..',
      '..OKKO.....OKKO.',
      '..OOOO.....OOOO.'
    ],
    lauf2: [
      '.....OWO.OWO....',
      '.....OWO.OWO....',
      '....OKKO.OKKO...',
      '....OOOO.OOOO...'
    ],
    lauf3: [
      '......OWOWO.....',
      '.....OWO.OKKO...',
      '....OKKO.OOOO...',
      '....OOOO........'
    ],
    sprung: [
      '.....OWO.OWO....',
      '....OKKO.OKKO...',
      '....OOOO.OOOO...',
      '................'
    ]
  };

  // Ducken: Kopf tiefer, Körper zusammengekauert (Oberkante 16 px über dem Boden)
  var DUCKEN_UNTEN = [
    '..OFOWWKKWWOFO..',
    '...OOwwwwwwOO...',
    '...OKKOOOOKKO...'
  ];

  // name wird nicht mehr unterschieden (es gibt nur noch eine Figur)
  function figurRaster(name, pose) {
    if (pose === 'ducken') {
      var leer = [];
      for (var i = 0; i < 8; i++) leer.push('................');
      return leer.concat(KOPF.slice(1), DUCKEN_UNTEN);
    }
    var kleid = pose === 'sprung' ? KLEID_SPRUNG : KLEID;
    return KOPF.concat(kleid, BEINE[pose] || BEINE.lauf2);
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
    return rasterZeichnen(figurRaster(name, pose || 'lauf2'), massstab);
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
