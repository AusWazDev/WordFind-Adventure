// ─── Standard category word lists ────────────────────────────────────────────

const wordLists = {
  animals: ['LION','TIGER','BEAR','WOLF','EAGLE','SHARK','WHALE','SNAKE','HORSE','ZEBRA','PANDA','KOALA','RABBIT','DEER','FOX','OWL','PARROT','DOLPHIN','CHEETAH','GORILLA','PENGUIN','LEOPARD','HAMSTER','GIRAFFE','BUFFALO','MOOSE','CAMEL','JAGUAR','PANTHER','LYNX','OTTER','BEAVER','BADGER','FALCON','CONDOR','TOUCAN','IGUANA','PYTHON','MEERKAT','WOMBAT','LEMUR','BISON','COYOTE','HYENA','MOLE','SPARROW','PELICAN','STORK','PEACOCK','FLAMINGO'],
  colors: ['RED','BLUE','GREEN','YELLOW','ORANGE','PURPLE','PINK','BLACK','WHITE','BROWN','GRAY','GOLD','SILVER','VIOLET','CYAN','MAROON','INDIGO','TEAL','CORAL','BEIGE','IVORY','CRIMSON','SCARLET','TURQUOISE','MAGENTA','LIME','NAVY','OLIVE','AMBER','PEACH','ROSE','LILAC','MAUVE','TAN','CREAM','AQUA','RUST','FUCHSIA','LAVENDER','COBALT','JADE','RUBY','EBONY','PEARL','OCHRE','UMBER','SIENNA','TAUPE','SALMON','PLUM'],
  food: ['PIZZA','PASTA','BREAD','CHEESE','APPLE','BANANA','GRAPE','MANGO','RICE','SOUP','SALAD','CAKE','PIE','FISH','STEAK','SUSHI','TACO','WAFFLE','DONUT','BAGEL','MUFFIN','COOKIE','SALMON','SHRIMP','NOODLE','LEMON','MELON','PEACH','PLUM','OLIVE','ONION','CARROT','PEPPER','GINGER','GARLIC','BUTTER','CREAM','YOGURT','PRETZEL','BROWNIE','PANCAKE','OMELET','BURRITO','FALAFEL','KEBAB','LOBSTER','OYSTER','TRUFFLE','CUSTARD','SORBET'],
  nature: ['TREE','FLOWER','RIVER','OCEAN','MOUNTAIN','FOREST','DESERT','LAKE','CLOUD','RAIN','SNOW','WIND','STAR','MOON','SUN','VALLEY','CANYON','GLACIER','MEADOW','VOLCANO','WATERFALL','ISLAND','CLIFF','SWAMP','PRAIRIE','STORM','THUNDER','LIGHTNING','TORNADO','TSUNAMI','REEF','FJORD','TUNDRA','SAVANNA','DELTA','DUNE','GEYSER','LAGOON','MARSH','PEBBLE','BOULDER','CRYSTAL','FOSSIL','CAVE','SPRING','STREAM','BROOK','BASIN','BLIZZARD','AURORA'],
  sports: ['SOCCER','TENNIS','GOLF','SWIMMING','RUNNING','HOCKEY','BOXING','YOGA','SURFING','SKIING','CYCLING','HIKING','DANCING','ARCHERY','FENCING','ROWING','DIVING','CRICKET','RUGBY','KARATE','BOWLING','SAILING','WRESTLING','BASEBALL','FOOTBALL','VOLLEYBALL','BADMINTON','SQUASH','LACROSSE','POLO','SKATING','CLIMBING','TRIATHLON','JUDO','TAEKWONDO','CURLING','BIATHLON','SOFTBALL','HANDBALL','NETBALL','CROQUET','DARTS','SNOOKER','KAYAKING','SKATEBOARD'],
  space: ['PLANET','STAR','GALAXY','COMET','METEOR','NEBULA','ORBIT','ROCKET','SATURN','JUPITER','MARS','VENUS','MERCURY','URANUS','NEPTUNE','MOON','SUN','COSMOS','NOVA','PULSAR','QUASAR','ASTEROID','GRAVITY','ECLIPSE','SOLSTICE','EQUINOX','AURORA','ZENITH','NADIR','VOID','WORMHOLE','TELESCOPE','SHUTTLE','STATION','ASTRONAUT','HORIZON','CRATER','LANDER','PROBE','SATELLITE'],
  music: ['GUITAR','PIANO','VIOLIN','DRUMS','FLUTE','TRUMPET','CELLO','HARP','BASS','BANJO','UKULELE','OBOE','CLARINET','TUBA','TROMBONE','ORGAN','LUTE','SITAR','TEMPO','RHYTHM','MELODY','HARMONY','CHORD','SCALE','OCTAVE','TREBLE','CLEF','SONATA','OPERA','JAZZ','BLUES','ROCK','SOUL','FUNK','REGGAE','WALTZ','BALLAD','CHORUS','VERSE','BRIDGE'],
  countries: ['FRANCE','BRAZIL','JAPAN','CHINA','INDIA','EGYPT','KENYA','PERU','CHILE','MEXICO','CANADA','RUSSIA','ITALY','SPAIN','GREECE','TURKEY','POLAND','SWEDEN','NORWAY','DENMARK','FINLAND','PORTUGAL','AUSTRIA','BELGIUM','NIGERIA','GHANA','SENEGAL','MOROCCO','IRAN','IRAQ','CUBA','HAITI','BOLIVIA','ECUADOR','COLOMBIA','VIETNAM','THAILAND','NEPAL','BHUTAN','ANGOLA'],
  science: ['ATOM','CELL','GENE','VIRUS','PHOTON','PROTON','NEUTRON','ELECTRON','PLASMA','LASER','MAGNET','PRISM','ENZYME','PROTEIN','CARBON','OXYGEN','HYDROGEN','NITROGEN','CALCIUM','SODIUM','FOSSIL','EROSION','SEISMIC','THERMAL','KINETIC','FRICTION','GRAVITY','MOMENTUM','VELOCITY','CATALYST','POLYMER','CRYSTAL','COMPOUND','ELEMENT','ISOTOPE','REACTION','FUSION','FISSION','OSMOSIS','DIFFUSION'],
  mythology: ['ZEUS','HERA','APOLLO','ATHENA','ARES','HERMES','POSEIDON','HADES','THOR','ODIN','LOKI','FREYA','OSIRIS','ISIS','ANUBIS','HORUS','BRAHMA','VISHNU','SHIVA','MEDUSA','HYDRA','SPHINX','MINOTAUR','CENTAUR','PHOENIX','DRAGON','UNICORN','GRIFFIN','KRAKEN','TITAN','ATLAS','HERCULES','ACHILLES','CYCLOPS','SIREN','MERMAID','VAMPIRE','WEREWOLF'],
  technology: ['LAPTOP','TABLET','ROUTER','SERVER','CLOUD','PIXEL','CURSOR','BROWSER','NETWORK','PROGRAM','CIRCUIT','SENSOR','BATTERY','DISPLAY','KEYBOARD','MONITOR','CAMERA','PRINTER','SCANNER','MODEM','SWITCH','CABLE','WIRELESS','DIGITAL','BINARY','CODING','SCRIPT','COMPILE','DEBUG','CACHE','KERNEL','FIREWALL','ENCRYPT','DECRYPT','STREAM','UPLOAD','DOWNLOAD','BACKUP','RESTORE','REBOOT'],
  ocean: ['WAVE','CORAL','REEF','TIDE','CURRENT','ABYSS','TRENCH','KELP','PLANKTON','JELLYFISH','OCTOPUS','SEAHORSE','STARFISH','CRAB','LOBSTER','SQUID','CLAM','OYSTER','MUSSEL','URCHIN','NARWHAL','MANATEE','WALRUS','SEAL','PENGUIN','PELICAN','ANCHOR','SHIP','SUBMARINE','LIGHTHOUSE','BUOY','HARBOR','MARINA','ESTUARY','LAGOON','ATOLL','SHOAL','CREST','SPRAY','SURF'],
  history: ['EMPIRE','DYNASTY','PHARAOH','KNIGHT','CASTLE','SIEGE','BATTLE','TREATY','REVOLT','COLONY','CRUSADE','PYRAMID','FORUM','SENATE','LEGION','FEUDAL','PLAGUE','FAMINE','MONARCH','REPUBLIC','SCROLL','RELIC','ARTIFACT','RUIN','TEMPLE','SHRINE','TOMB','BURIAL','GLADIATOR','COLOSSEUM','CATAPULT','ARMOUR','SHIELD','SWORD','SPEAR','THRONE','CROWN','SCEPTRE','CHARTER','DECREE'],
  emotions: ['HAPPY','SAD','ANGRY','CALM','SCARED','BRAVE','PROUD','ASHAMED','LONELY','JOYFUL','GRIEF','LOVE','HATE','ENVY','HOPE','FEAR','TRUST','DISGUST','SURPRISE','BORED','CURIOUS','EXCITED','NERVOUS','RELAXED','CONTENT','MISERABLE','ELATED','FURIOUS','ANXIOUS','SERENE','CONFUSED','SHOCKED','AMUSED','GRATEFUL','GUILTY','REGRET','NOSTALGIC','HOPEFUL','DESPERATE','PEACEFUL'],
};

// ─── Tricky word groups for Audio Challenge ───────────────────────────────────

export const trickyWordGroups = {
  silent_k:      ['KNIGHT','KNEEL','KNACK','KNAVE','KNOB','KNIFE','KNIT','KNOCK','KNOT','KNEW','KNUCKLE','KNAPSACK'],
  silent_w:      ['WRAP','WRITE','WRIST','WRONG','WRECK','WREN','WRATH','WRENCH','WRESTLE','WRINKLE','WROTE','WRITTEN'],
  silent_g:      ['GNOME','GNAT','GNAW','GNU'],
  silent_b:      ['LAMB','THUMB','CLIMB','COMB','CRUMB','BOMB','LIMB','NUMB','TOMB','WOMB','PLUMB','DEBT','DOUBT','SUBTLE','DUMB'],
  silent_t:      ['CASTLE','WHISTLE','WRESTLE','BUSTLE','HUSTLE','THISTLE','BRISTLE','FASTEN','LISTEN','SOFTEN','OFTEN','GLISTEN','MOISTEN','HASTEN'],
  silent_h:      ['HOUR','GHOST','HONEST','HEIR','HONOUR','RHYME'],
  silent_c:      ['SCENE','SCENT','SCIENCE','SCISSORS','MUSCLE','DESCEND','ASCEND','CRESCENT'],
  silent_n:      ['AUTUMN','COLUMN','SOLEMN','HYMN','DAMN','CONDEMN'],
  silent_gh:     ['LIGHT','NIGHT','FIGHT','MIGHT','RIGHT','SIGHT','TIGHT','FLIGHT','BRIGHT','FRIGHT','KNIGHT','DAUGHTER','SLAUGHTER','THOUGHT','BOUGHT','CAUGHT','TAUGHT','NAUGHT','DROUGHT'],
  silent_p:      ['PSALM','PSYCHE','RECEIPT'],
  silent_l:      ['CALM','PALM','HALF','WALK','TALK','CHALK','COULD','WOULD','SHOULD','FOLK','YOLK','SALMON','ALMOND'],
  silent_misc:   ['SWORD','ANSWER','ISLAND','YACHT','ACHE','CHAOS','CHROME','ECHO','EXHAUST','STOMACH'],
  ough_words:    ['TOUGH','ROUGH','ENOUGH','COUGH','THROUGH','ALTHOUGH','THOROUGH','BOROUGH','DOUGH','THOUGH','PLOUGH','BOUGH','DROUGHT','SOUGHT','BOUGHT','FOUGHT','THOUGHT','BROUGHT','OUGHT','NOUGHT'],
  homophones:    ['KNIGHT','KNOT','KNEW','WRAP','WRITE','WHOLE','FLOUR','STATIONARY','STATIONERY','PRINCIPAL','PRINCIPLE','COMPLEMENT','COMPLIMENT','SIGHT','PEACE','PIECE','STEEL','STEAL','HEAL','HEEL','HEAR','HERE','WASTE','WAIST','BARE','BEAR','MALE','MAIL','TALE','TAIL','VAIN','VEIN','PLAIN','PLANE','RAIN','REIGN'],
  double_letters:['OCCASION','NECESSARY','TOMORROW','ADDRESS','AGGRESSIVE','APPRECIATE','BEGINNING','BROCCOLI','COLLEAGUE','COMMITTEE','CONSCIENCE','DISAPPEAR','DISAPPOINT','EMBARRASS','EXAGGERATE','EXCELLENT','GUARANTEE','IMMEDIATELY','INTERRUPT','MILLENNIUM','MISSPELL','OCCURRENCE','PARALLEL','POSSESSION','RECOMMEND','RESISTANCE','RHYTHM','SCISSORS','SEPARATE','SUCCEED','UNNECESSARY','VACUUM','WEIRD'],
  misspelled:    ['RECEIVE','ACHIEVE','BELIEVE','CEILING','DECEIVE','NIECE','THIEF','YIELD','DEFINITELY','DESPERATE','ENVIRONMENT','GOVERNMENT','HUMOROUS','IRRESISTIBLE','MISCHIEVOUS','OCCASIONALLY','RESTAURANT','SCHEDULE','STRENGTH','TWELFTH','WEDNESDAY','ABSENCE','CALENDAR','CONSCIENTIOUS','CURIOSITY','DILEMMA','DISCIPLINE','EXPERIENCE','FASCINATING','FEBRUARY','FOREIGN','HEIGHT','INDEPENDENT','INTELLIGENT','LANGUAGE','LITERATURE','MAINTENANCE','MARRIAGE','MEDICINE','NOTICEABLE','ORIGINAL','PERSEVERANCE','PHYSICAL','PRIVILEGE','QUESTIONNAIRE','QUEUE','RECOGNISE','RIDICULOUS','SENSITIVE','SERGEANT','SIMILAR','SINCERELY','SPECIFIC','TECHNIQUE','TEMPERATURE','TONGUE','TRAGEDY','TRULY'],
  ise_ize:       ['REALISE','ORGANISE','RECOGNISE','APOLOGISE','EMPHASISE','ADVERTISE','ADVISE','ANALYSE','CAPITALISE','CIVILISE','CRITICISE','CUSTOMISE','EXERCISE','FINALISE','GENERALISE','IMPROVISE','LEGALISE','MAXIMISE','MINIMISE','MODERNISE','OPTIMISE','PENALISE','PERSONALISE','PRIORITISE','PUBLICISE','REVISE','SPECIALISE','STANDARDISE','SUMMARISE','SUPERVISE','SURPRISE','SYMBOLISE','UTILISE','VISUALISE'],
  our_or:        ['COLOUR','FAVOUR','HONOUR','HUMOUR','LABOUR','NEIGHBOUR','RUMOUR','VAPOUR','BEHAVIOUR','ENDEAVOUR','FLAVOUR','GLAMOUR','HARBOUR','PARLOUR','RIGOUR','SAVOUR','SPLENDOUR','VALOUR','VIGOUR','ARMOUR','CLAMOUR','FERVOUR','CANDOUR','TUMOUR','ODOUR','DEMEANOUR'],
};

export const allTrickyWords = Object.values(trickyWordGroups).flat();

// Curated core list for random audio mode
const coreAudioWords = [
  'KNIGHT','KNEEL','KNIFE','KNOT','KNEW','KNUCKLE',
  'WRAP','WRITE','WRIST','WRONG','WRECK','WREN',
  'GNOME','GNAT','GNAW',
  'LAMB','THUMB','CLIMB','COMB','BOMB','NUMB','TOMB','DEBT','DOUBT',
  'CASTLE','WHISTLE','FASTEN','LISTEN','SOFTEN','OFTEN','GLISTEN',
  'HOUR','GHOST','HONEST','RHYME',
  'SCENE','SCENT','SCIENCE','SCISSORS',
  'AUTUMN','COLUMN','SOLEMN','HYMN',
  'LIGHT','NIGHT','FIGHT','MIGHT','RIGHT','BRIGHT','DAUGHTER','THOUGHT','CAUGHT','TAUGHT','DROUGHT',
  'CALM','PALM','HALF','WALK','TALK','CHALK','COULD','WOULD','SHOULD','SALMON','ALMOND',
  'SWORD','ANSWER','ISLAND','YACHT','ACHE','STOMACH',
  'TOUGH','ROUGH','ENOUGH','COUGH','THROUGH','ALTHOUGH','THOROUGH','DOUGH','THOUGH','PLOUGH','BOUGHT','FOUGHT','BROUGHT','OUGHT',
  'OCCASION','NECESSARY','TOMORROW','EMBARRASS','EXAGGERATE','RECOMMEND','DISAPPEAR','DISAPPOINT','MILLENNIUM','OCCURRENCE','POSSESSION','SEPARATE','SUCCEED','BEGINNING','COLLEAGUE',
  'RECEIVE','ACHIEVE','BELIEVE','CEILING','DECEIVE','NIECE','THIEF','YIELD','DEFINITELY','DESPERATE','ENVIRONMENT','GOVERNMENT','HUMOROUS','IRRESISTIBLE','MISCHIEVOUS','OCCASIONALLY','RESTAURANT','SCHEDULE','STRENGTH','TWELFTH','WEDNESDAY',
  'REALISE','ORGANISE','RECOGNISE','APOLOGISE','EMPHASISE','ADVERTISE','ADVISE','ANALYSE','EXERCISE','IMPROVISE','SUPERVISE','SURPRISE',
  'COLOUR','FAVOUR','HONOUR','HUMOUR','LABOUR','NEIGHBOUR','RUMOUR','BEHAVIOUR','FLAVOUR','HARBOUR','SPLENDOUR','ARMOUR',
];

// ─── Level configuration ──────────────────────────────────────────────────────

export const levelConfig = {
  1: { gridSize: 8,  wordCount: 6,  minWordLen: 3, maxWordLen: 6,  trickyRatio: 0.5, label: 'Easy',   description: '8×8 grid · 6 words',              dense: false },
  2: { gridSize: 10, wordCount: 10, minWordLen: 3, maxWordLen: 8,  trickyRatio: 0.6, label: 'Medium', description: '10×10 grid · 10 words',            dense: false },
  3: { gridSize: 12, wordCount: 15, minWordLen: 3, maxWordLen: 10, trickyRatio: 0.7, label: 'Hard',   description: '12×12 grid · 15 words',            dense: false },
  4: { gridSize: 15, wordCount: 20, minWordLen: 3, maxWordLen: 15, trickyRatio: 0.9, label: 'Expert', description: '15×15 grid · 20 words',            dense: false },
  5: { gridSize: 15, wordCount: 25, minWordLen: 4, maxWordLen: 15, trickyRatio: 0.95, label: 'Master', description: '15×15 grid · 25 words · crossword', dense: true  },
};

// ─── Directions ───────────────────────────────────────────────────────────────

const directions = [
  { row: 0,  col: 1  },
  { row: 1,  col: 0  },
  { row: 1,  col: 1  },
  { row: -1, col: 1  },
  { row: 0,  col: -1 },
  { row: -1, col: 0  },
  { row: -1, col: -1 },
  { row: 1,  col: -1 },
];

// ─── Word clues ───────────────────────────────────────────────────────────────

const wordClues = {
  LION:'King of the jungle',TIGER:'Striped big cat',BEAR:'Hibernates in winter',EAGLE:'National bird of the USA',
  PIANO:'Has 88 keys',GUITAR:'Strummed string instrument',SATURN:'Planet with rings',MARS:'The red planet',
  OXYGEN:'We breathe this',CARBON:'Building block of life',ZEUS:'King of the Greek gods',THOR:'Norse god of thunder',
  PIZZA:'Italian flatbread with toppings',SUSHI:'Japanese rice rolls',OCEAN:'Largest body of water',MOUNTAIN:'Highest landform',
  SOCCER:'Most popular sport globally',SWIMMING:'Olympic aquatic sport',FRANCE:'Country with the Eiffel Tower',
  JAPAN:'Land of the rising sun',HAPPY:'Opposite of sad',FEAR:'Fight or flight trigger',
  LAPTOP:'Portable personal computer',CLOUD:'Remote data storage',CORAL:'Reef-building marine organism',
  LIGHTHOUSE:'Guides ships at night',CASTLE:'Medieval fortified home',PHARAOH:'Ancient Egyptian ruler',
  KNIGHT:'Armoured medieval warrior',GNOME:'Garden ornament or mythical creature',YACHT:'Elegant sailing vessel',
  DEBT:'Money owed to another',THUMB:'Shortest finger on your hand',LAMB:'Young sheep',
  AUTUMN:'Season before winter',PSALM:'Sacred song or hymn',
  RECEIPT:'Proof of purchase',RHYTHM:'Regular beat in music',QUEUE:'Orderly line of people',
  COLOUR:'British spelling - pigment or hue',HONOUR:'British spelling - great respect',
  REALISE:'British spelling - to become aware',ORGANISE:'British spelling - to arrange',
  OCCASION:'A special event or ceremony',NECESSARY:'Cannot be done without',
  EMBARRASS:'To cause discomfort or shame',RECOMMEND:'To suggest as suitable',
  DEFINITELY:'Without any doubt',WEDNESDAY:'Day after Tuesday',TWELFTH:'Position after eleventh',
};

export function getClue(word) {
  return wordClues[word] || `A ${word.length}-letter word`;
}

// ─── Anagram helper ───────────────────────────────────────────────────────────

export function scrambleWord(word) {
  const arr = word.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const result = arr.join('');
  return result === word && word.length > 1 ? scrambleWord(word) : result;
}

// ─── Fisher-Yates shuffle — uniform distribution, no bias ────────────────────

function fisherYates(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Word selection ───────────────────────────────────────────────────────────

function pickWords({ count, minLen, maxLen, pool, trickyPool, trickyRatio }) {
  const fits = (w) => w.length >= minLen && w.length <= maxLen;

  if (trickyPool && trickyRatio > 0) {
    const trickyCount = Math.round(count * trickyRatio);
    const regularCount = count - trickyCount;

    // Deduplicate before shuffling — some words appear in multiple tricky groups
    // (e.g. KNIGHT is in silent_k, silent_gh AND homophones) which caused the
    // same word to be selected multiple times and appear 3-4x in the word list.
    const uniqueTricky = fisherYates([...new Set(trickyPool.filter(fits))]);
    const selectedTricky = uniqueTricky.slice(0, trickyCount);

    // Exclude already-chosen tricky words from the regular pool so there's no overlap
    const pickedSet = new Set(selectedTricky.map(w => w.toUpperCase()));
    const uniqueRegular = fisherYates(
      [...new Set(pool.filter(fits))].filter(w => !pickedSet.has(w.toUpperCase()))
    );
    const selectedRegular = uniqueRegular.slice(0, regularCount);

    return fisherYates([...selectedTricky, ...selectedRegular]);
  }

  // Deduplicate standard pool (some words appear in multiple category lists)
  return fisherYates([...new Set(pool.filter(fits))]).slice(0, count);
}

// ─── Grid placement ───────────────────────────────────────────────────────────

function canPlaceWord(grid, word, startRow, startCol, direction, gridSize) {
  for (let i = 0; i < word.length; i++) {
    const row = startRow + i * direction.row;
    const col = startCol + i * direction.col;
    if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) return false;
    const cell = grid[row][col];
    if (cell !== '' && cell !== word[i]) return false;
  }
  return true;
}

function placeWord(grid, word, startRow, startCol, direction, wordPositions) {
  const positions = [];
  for (let i = 0; i < word.length; i++) {
    const row = startRow + i * direction.row;
    const col = startCol + i * direction.col;
    grid[row][col] = word[i];
    positions.push({ row, col });
  }
  wordPositions[word] = positions;
}

function tryPlaceWord(grid, word, gridSize, wordPositions) {
  const shuffledDirs = fisherYates([...directions]);
  for (const dir of shuffledDirs) {
    for (let attempt = 0; attempt < 50; attempt++) {
      const startRow = Math.floor(Math.random() * gridSize);
      const startCol = Math.floor(Math.random() * gridSize);
      if (canPlaceWord(grid, word, startRow, startCol, dir, gridSize)) {
        placeWord(grid, word, startRow, startCol, dir, wordPositions);
        return true;
      }
    }
  }
  return false;
}

// Dense placement — actively seeks positions that cross existing letters,
// creating a crossword-style grid. Used for the Master difficulty level.
function tryPlaceWordDense(grid, word, gridSize, wordPositions) {
  const candidates = [];

  // Scan every filled cell in the grid for letters that match any character in the word
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c] === '') continue;
      for (let charIdx = 0; charIdx < word.length; charIdx++) {
        if (word[charIdx] !== grid[r][c]) continue;
        // Try placing the word through this cell at each direction
        for (const dir of directions) {
          const startRow = r - charIdx * dir.row;
          const startCol = c - charIdx * dir.col;
          if (!canPlaceWord(grid, word, startRow, startCol, dir, gridSize)) continue;
          // Count how many letters this placement shares with existing words
          let overlaps = 0;
          for (let i = 0; i < word.length; i++) {
            if (grid[startRow + i * dir.row][startCol + i * dir.col] !== '') overlaps++;
          }
          candidates.push({ startRow, startCol, dir, overlaps });
        }
      }
    }
  }

  if (candidates.length > 0) {
    // Sort by most overlaps, then pick randomly among the top tier for variety
    candidates.sort((a, b) => b.overlaps - a.overlaps);
    const maxOverlaps = candidates[0].overlaps;
    const topTier = candidates.filter(c => c.overlaps === maxOverlaps);
    const chosen = topTier[Math.floor(Math.random() * topTier.length)];
    placeWord(grid, word, chosen.startRow, chosen.startCol, chosen.dir, wordPositions);
    return true;
  }

  // No intersecting position found — fall back to standard random placement
  return tryPlaceWord(grid, word, gridSize, wordPositions);
}

// ─── Tricky category map ──────────────────────────────────────────────────────

const _s = trickyWordGroups;
const TRICKY_CATEGORY_MAP = {
  tricky_mix:        Object.values(trickyWordGroups).flat(),
  tricky_silent:     [].concat(_s.silent_k, _s.silent_w, _s.silent_g, _s.silent_b, _s.silent_t, _s.silent_h, _s.silent_c, _s.silent_n, _s.silent_gh, _s.silent_p, _s.silent_l, _s.silent_misc),
  tricky_homophones: _s.homophones,
  tricky_ough:       _s.ough_words,
  tricky_double:     _s.double_letters,
  tricky_misspelled: _s.misspelled,
  tricky_ise_ize:    _s.ise_ize,
  tricky_our_or:     _s.our_or,
};

// ─── Main generator ───────────────────────────────────────────────────────────

export function generateGame(level, category = null, isAudioMode = false) {
  const config = levelConfig[level];
  const { gridSize, wordCount, minWordLen, maxWordLen, trickyRatio, dense } = config;

  const isTrickyCategory = category && category.startsWith('tricky_');
  const trickyPool = isTrickyCategory
    ? TRICKY_CATEGORY_MAP[category] || coreAudioWords
    : coreAudioWords;
  const effectiveTrickyRatio = isTrickyCategory ? 1.0 : trickyRatio;

  const standardPool = (category && category !== 'random' && !isTrickyCategory && wordLists[category])
    ? wordLists[category]
    : Object.values(wordLists).flat();

  const selectedWords = isAudioMode
    ? pickWords({ count: wordCount, minLen: minWordLen, maxLen: maxWordLen, pool: standardPool, trickyPool, trickyRatio: effectiveTrickyRatio })
    : pickWords({ count: wordCount, minLen: minWordLen, maxLen: maxWordLen, pool: standardPool });

  const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(''));
  const wordPositions = {};
  const placedWords = [];

  // Sort longest-first so large words anchor the grid before shorter ones fill gaps
  const sorted = [...selectedWords].sort((a, b) => b.length - a.length);
  for (const word of sorted) {
    const placer = dense ? tryPlaceWordDense : tryPlaceWord;
    if (placer(grid, word.toUpperCase(), gridSize, wordPositions)) {
      placedWords.push(word);
    }
  }

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (grid[row][col] === '') {
        grid[row][col] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }

  return { grid, words: placedWords, wordPositions, gridSize };
}

// ─── Word checking ────────────────────────────────────────────────────────────

export function checkWord(selectedWord, words, foundWords) {
  const upper = selectedWord.toUpperCase();
  const reversed = upper.split('').reverse().join('');
  for (const word of words) {
    const target = word.toUpperCase();
    if ((upper === target || reversed === target) && !foundWords.includes(target.toLowerCase())) {
      return target.toLowerCase();
    }
  }
  return null;
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

const TRICKY_WORDS_SET = new Set(allTrickyWords.map(w => w.toUpperCase()));

export function calculateScore(word, level, isAudioMode) {
  const wordLen = typeof word === 'string' ? word.length : word;
  const wordUpper = typeof word === 'string' ? word.toUpperCase() : null;
  const baseScore = wordLen * 10;
  const levelMultiplier = level;
  const audioBonus = isAudioMode ? 1.5 : 1;
  const trickyBonus = (wordUpper && TRICKY_WORDS_SET.has(wordUpper)) ? 1.5 : 1;
  return Math.round(baseScore * levelMultiplier * audioBonus * trickyBonus);
}

// ─── Tricky word hint ─────────────────────────────────────────────────────────

export function getTrickyWordHint(word) {
  const upper = word.toUpperCase();
  for (const [type, words] of Object.entries(trickyWordGroups)) {
    if (words.includes(upper)) {
      const labels = {
        silent_k: 'Silent K', silent_w: 'Silent W', silent_g: 'Silent G',
        silent_b: 'Silent B', silent_t: 'Silent T', silent_h: 'Silent H',
        silent_c: 'Silent C', silent_n: 'Silent N', silent_gh: 'Silent GH',
        silent_p: 'Silent P', silent_l: 'Silent L', silent_misc: 'Silent letter',
        ough_words: '-OUGH word', homophones: 'Homophone',
        double_letters: 'Double letters', misspelled: 'Commonly misspelled',
        ise_ize: '-ISE / -IZE spelling', our_or: '-OUR / -OR spelling',
      };
      return labels[type] || 'Tricky spelling';
    }
  }
  return null;
}

export { wordLists };
