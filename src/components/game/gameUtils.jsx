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

// ─── Master level bonus word themes ──────────────────────────────────────────
// Each entry pairs a word (placed hidden in the grid) with a cryptic clue.
// The player hunts for this word after finding all listed words.

const masterBonusThemes = [
  { word: 'SILENCE',    hint: 'What librarians demand 🤫' },
  { word: 'VICTORY',    hint: 'What champions celebrate 🏆' },
  { word: 'PHANTOM',    hint: 'Something unseen, yet present 👻' },
  { word: 'ECLIPSE',    hint: 'When one thing hides another 🌑' },
  { word: 'WHISPER',    hint: 'A barely audible sound 🌬️' },
  { word: 'SHADOW',     hint: 'It follows you everywhere 🌗' },
  { word: 'ENIGMA',     hint: 'A puzzle within a puzzle 🧩' },
  { word: 'SECRET',     hint: 'Something not meant to be known 🤐' },
  { word: 'CIPHER',     hint: 'A coded message 🔐' },
  { word: 'STEALTH',    hint: 'Moving without being detected 🥷' },
  { word: 'VANISH',     hint: 'To disappear without a trace ✨' },
  { word: 'CONCEAL',    hint: 'To keep something out of sight 🎭' },
  { word: 'LABYRINTH',  hint: 'A maze you might get lost in 🌀' },
  { word: 'ARCANE',     hint: 'Known only to a select few 🪄' },
  { word: 'MIRAGE',     hint: 'Something that appears but is not there 🏜️' },
  { word: 'LURKING',    hint: 'Waiting, unseen in the shadows 👀' },
  { word: 'CAMOUFLAGE', hint: 'Nature\'s disguise 🦎' },
  { word: 'CRYPTIC',    hint: 'Mysterious and hard to decode 🗝️' },
  { word: 'ELUSIVE',    hint: 'Difficult to find or catch 🦋' },
  { word: 'CLOAK',      hint: 'Worn to disguise or hide identity 🧥' },
  { word: 'VEIL',       hint: 'A covering that conceals 💫' },
  { word: 'MASK',       hint: 'Worn to hide a true identity 🎭' },
  { word: 'PROWL',      hint: 'Moving stealthily through the night 🐈' },
  { word: 'RECLUSE',    hint: 'One who hides away from the world 🏚️' },
  { word: 'OCCULT',     hint: 'Hidden from ordinary knowledge 🔮' },
];

// ─── Category-themed bonus words for Master level ─────────────────────────────
// Each category has several word + hint pairs. The bonus word is chosen from the
// category in play so the hidden word always relates to the current theme.

const categoryBonusWordPairs = {
  animals: [
    { word: 'ELEPHANT',   hint: 'Largest land animal — never forgets 🐘' },
    { word: 'CROCODILE',  hint: 'Ancient armoured river hunter 🐊' },
    { word: 'BUTTERFLY',  hint: 'Beautiful wings emerged from a chrysalis 🦋' },
    { word: 'HEDGEHOG',   hint: 'It rolls into a spiny ball when threatened 🦔' },
    { word: 'PLATYPUS',   hint: 'Egg-laying mammal with a duck bill 🦆' },
    { word: 'RHINOCEROS', hint: 'Armoured giant of the African savanna 🦏' },
    { word: 'WOLVERINE',  hint: 'Fierce mustelid of the northern forests 🐾' },
    { word: 'CHIMPANZEE', hint: 'Our closest living primate relative 🐒' },
  ],
  food: [
    { word: 'CHOCOLATE',  hint: 'Sweet treat made from cacao beans 🍫' },
    { word: 'PINEAPPLE',  hint: 'Tropical fruit wearing a spiky crown 🍍' },
    { word: 'CINNAMON',   hint: 'Warming spice harvested from tree bark 🌿' },
    { word: 'RASPBERRY',  hint: 'Tangy red cluster berry 🍓' },
    { word: 'AVOCADO',    hint: 'Creamy green toast topper 🥑' },
    { word: 'BLUEBERRY',  hint: 'Tiny antioxidant powerhouse 🫐' },
    { word: 'WATERMELON', hint: 'Green outside, juicy red inside 🍉' },
    { word: 'SOURDOUGH',  hint: 'Bread risen with a wild yeast starter 🍞' },
  ],
  nature: [
    { word: 'EARTHQUAKE', hint: 'Ground shaking from shifting tectonic plates 🌍' },
    { word: 'HURRICANE',  hint: 'Spiralling tropical ocean storm 🌀' },
    { word: 'SNOWFLAKE',  hint: 'No two are perfectly identical ❄️' },
    { word: 'RAINFOREST', hint: 'Dense canopy teeming with biodiversity 🌳' },
    { word: 'WILDERNESS', hint: 'Untouched land far beyond civilisation 🏔️' },
    { word: 'ECOSYSTEM',  hint: 'Community of living things in balance 🌿' },
    { word: 'AVALANCHE',  hint: 'A wall of snow rushing downhill 🏔️' },
    { word: 'PERMAFROST', hint: 'Ground that remains frozen year-round 🧊' },
  ],
  colors: [
    { word: 'TURQUOISE',  hint: 'Blue-green like tropical seas 🏖️' },
    { word: 'MAHOGANY',   hint: 'Deep rich reddish-brown wood 🌳' },
    { word: 'SAPPHIRE',   hint: 'Precious deep-blue gemstone 💎' },
    { word: 'VERMILLION', hint: 'Vivid orange-red pigment 🎨' },
    { word: 'CHARTREUSE', hint: 'Sitting between yellow and green 💛' },
    { word: 'TANGERINE',  hint: 'Bright orange — named after the fruit 🍊' },
    { word: 'CERULEAN',   hint: 'The clear blue of a cloudless sky 🌤️' },
    { word: 'AUBERGINE',  hint: 'Deep purple — named after a vegetable 🍆' },
  ],
  sports: [
    { word: 'MARATHON',   hint: '42.2 kilometres of pure endurance 🏃' },
    { word: 'CHAMPION',   hint: 'The ultimate winner 🏆' },
    { word: 'JAVELIN',    hint: 'Spear-throwing athletic field event 🏹' },
    { word: 'DECATHLON',  hint: 'Ten events, one champion 🥇' },
    { word: 'FREESTYLE',  hint: 'Any stroke allowed in swimming 🏊' },
    { word: 'VELODROME',  hint: 'A banked oval cycling track 🚴' },
    { word: 'TRIATHLON',  hint: 'Swim, bike, run in sequence 🏅' },
    { word: 'MOTOCROSS',  hint: 'Off-road motorcycle racing 🏍️' },
  ],
  space: [
    { word: 'SUPERNOVA',   hint: 'A stellar explosion of epic scale 💥' },
    { word: 'STARDUST',    hint: 'Remnants scattered by ancient stars ✨' },
    { word: 'BLACKHOLE',   hint: 'Where even light cannot escape 🕳️' },
    { word: 'CELESTIAL',   hint: 'Belonging to the heavens above 🌠' },
    { word: 'HELIOPAUSE',  hint: 'The very edge of our solar system 🌞' },
    { word: 'ACCRETION',   hint: 'Matter slowly gathering around a body 🌀' },
    { word: 'SINGULARITY', hint: 'The infinitely dense heart of a black hole 🕳️' },
    { word: 'INTERSTELLAR',hint: 'Travelling between the stars 🌌' },
  ],
  music: [
    { word: 'SYMPHONY',   hint: 'A grand multi-movement orchestral work 🎼' },
    { word: 'CRESCENDO',  hint: 'Gradually growing louder and louder 🔊' },
    { word: 'ORCHESTRA',  hint: 'A large ensemble of many instruments 🎻' },
    { word: 'STACCATO',   hint: 'Short, sharp, detached notes ♩' },
    { word: 'CONDUCTOR',  hint: 'Guides the orchestra with a baton 🎵' },
    { word: 'PIZZICATO',  hint: 'Plucking the strings of an instrument 🪕' },
    { word: 'FORTISSIMO', hint: 'Play as loudly as possible 📯' },
    { word: 'DIMINUENDO', hint: 'A passage gradually growing softer 🎶' },
  ],
  countries: [
    { word: 'AUSTRALIA',   hint: 'The vast land down under 🦘' },
    { word: 'ARGENTINA',   hint: 'South American home of the tango 💃' },
    { word: 'MADAGASCAR',  hint: 'Giant island nation off eastern Africa 🦁' },
    { word: 'INDONESIA',   hint: 'Archipelago of over 17,000 islands 🏝️' },
    { word: 'SWITZERLAND', hint: 'Home of the Alps, cheese and chocolate 🏔️' },
    { word: 'PHILIPPINES', hint: 'South-east Asian island chain nation 🌴' },
    { word: 'MOZAMBIQUE',  hint: 'East African coastal nation 🌊' },
    { word: 'LUXEMBOURG',  hint: 'A tiny but wealthy European nation 💶' },
  ],
  science: [
    { word: 'MAGNETISM',   hint: 'The invisible force of attraction 🧲' },
    { word: 'SYMBIOSIS',   hint: 'Two species living in mutual benefit 🌿' },
    { word: 'EVOLUTION',   hint: 'Life changing slowly over generations 🦕' },
    { word: 'CHROMOSOME',  hint: 'Coiled thread carrying your genetic code 🧬' },
    { word: 'CATALYSIS',   hint: 'The process of speeding up a reaction 🧪' },
    { word: 'HYPOTHESIS',  hint: 'An educated scientific prediction 🔬' },
    { word: 'METABOLISM',  hint: 'Chemical reactions that keep you alive ⚡' },
    { word: 'DIFFRACTION', hint: 'Waves bending around an obstacle 🌊' },
  ],
  mythology: [
    { word: 'OLYMPUS',    hint: 'The mountain home of the Greek gods ⛰️' },
    { word: 'EXCALIBUR',  hint: 'The legendary sword pulled from the stone ⚔️' },
    { word: 'VALKYRIE',   hint: 'Norse maiden who chose the slain in battle 🛡️' },
    { word: 'LEVIATHAN',  hint: 'The mighty sea monster of biblical legend 🐉' },
    { word: 'AMBROSIA',   hint: 'The food and drink of the Greek gods 🍇' },
    { word: 'PROMETHEUS', hint: 'The Titan who gave fire to humanity 🔥' },
    { word: 'RAGNAROK',   hint: 'The Norse twilight of the gods 💀' },
    { word: 'LABYRINTH',  hint: 'The winding maze built to contain the Minotaur 🌀' },
  ],
  technology: [
    { word: 'ALGORITHM',  hint: 'A step-by-step set of problem-solving instructions 🤖' },
    { word: 'BLUETOOTH',  hint: 'Short-range wireless data connection 📡' },
    { word: 'ENCRYPTION', hint: 'Scrambling data to keep it secure 🔐' },
    { word: 'PROCESSOR',  hint: 'The thinking brain of a computer 💻' },
    { word: 'BANDWIDTH',  hint: 'The maximum rate of data transfer 📶' },
    { word: 'HYPERTEXT',  hint: 'Links that connect one web page to another 🔗' },
    { word: 'INTERFACE',  hint: 'The point where human meets machine 🖥️' },
    { word: 'REPOSITORY', hint: 'A central store for code and its history 📦' },
  ],
  ocean: [
    { word: 'MAELSTROM',  hint: 'A powerful swirling ocean whirlpool 🌀' },
    { word: 'TYPHOON',    hint: 'A tropical cyclone in the Pacific 🌊' },
    { word: 'LEVIATHAN',  hint: 'The great sea monster of ancient legend 🐋' },
    { word: 'SALTWATER',  hint: 'The life-giving liquid of the ocean 🧂' },
    { word: 'SEAFLOOR',   hint: 'The bottom of the world\'s oceans 🌊' },
    { word: 'WHIRLPOOL',  hint: 'Swirling, rotating water 🌀' },
    { word: 'BATHYSCAPHE',hint: 'A deep-sea submersible exploration vessel 🤿' },
    { word: 'TIDAL',      hint: 'Relating to the rise and fall of the sea 🌊' },
  ],
  history: [
    { word: 'COLOSSEUM',  hint: 'The great Roman arena for gladiators 🏟️' },
    { word: 'RENAISSANCE',hint: 'European rebirth of arts and learning 🎨' },
    { word: 'REVOLUTION', hint: 'When a society turns itself upside down ⚡' },
    { word: 'CATHEDRAL',  hint: 'Grand seat of a bishop 🕌' },
    { word: 'ARCHAEOLOGY',hint: 'Uncovering the human past through objects 🏺' },
    { word: 'BARBARIAN',  hint: 'An outsider viewed as uncivilised 🗡️' },
    { word: 'FEUDALISM',  hint: 'Medieval society\'s hierarchical land system 👑' },
    { word: 'INQUISITION',hint: 'A historical investigation into heresy 🕯️' },
  ],
  emotions: [
    { word: 'MELANCHOLY', hint: 'A deep, reflective sadness 💙' },
    { word: 'EUPHORIA',   hint: 'An intense feeling of happiness 🌟' },
    { word: 'NOSTALGIA',  hint: 'Wistful longing for moments past 🕰️' },
    { word: 'COMPASSION', hint: 'Feeling and responding to another\'s pain 💛' },
    { word: 'SERENITY',   hint: 'A peaceful and calm state of mind 🕊️' },
    { word: 'GRATITUDE',  hint: 'Thankful appreciation for what you have 🙏' },
    { word: 'TREPIDATION',hint: 'A nervous feeling before something unknown 😰' },
    { word: 'EXHILARATION',hint:'A thrilling rush of excitement 🎢' },
  ],
  random: [
    { word: 'ADVENTURE',  hint: 'An exciting journey into the unknown 🗺️' },
    { word: 'DISCOVERY',  hint: 'Finding something new and wonderful 🔍' },
    { word: 'TREASURE',   hint: 'Hidden riches waiting to be found 💎' },
    { word: 'MYSTERIOUS', hint: 'Hard to explain, full of wonder 🔮' },
    { word: 'CHALLENGE',  hint: 'A test of skill and determination 🎯' },
    { word: 'WANDERLUST', hint: 'A strong desire to explore the world 🌍' },
    { word: 'RESILIENCE', hint: 'The ability to bounce back from hardship 💪' },
    { word: 'SERENDIPITY',hint: 'A happy accident or wonderful coincidence ✨' },
  ],
};

function pickCategoryBonusWord(category, usedSet) {
  const key = (!category || category === 'random' || category.startsWith('tricky_'))
    ? 'random'
    : category;
  const pool = (categoryBonusWordPairs[key] || categoryBonusWordPairs.random)
    .filter(({ word }) => !usedSet.has(word.toUpperCase()) && word.length >= 5 && word.length <= 12);
  if (pool.length > 0) return pool[Math.floor(Math.random() * pool.length)];
  // Fallback to generic themes
  const fallback = masterBonusThemes.filter(
    ({ word }) => !usedSet.has(word.toUpperCase()) && word.length <= 10
  );
  return fallback.length > 0 ? fallback[Math.floor(Math.random() * fallback.length)] : null;
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

// ─── Placement helpers that respect bonus-word reserved cells ─────────────────
// Used when placing filler words to fill every non-bonus cell in Master level.

function canPlaceWordAvoidingCells(grid, word, startRow, startCol, dir, gridSize, protectedKeys) {
  for (let i = 0; i < word.length; i++) {
    const row = startRow + i * dir.row;
    const col = startCol + i * dir.col;
    if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) return false;
    if (protectedKeys.has(`${row},${col}`)) return false;      // never touch bonus cells
    const cell = grid[row][col];
    if (cell !== '' && cell !== word[i]) return false;
  }
  return true;
}

function tryPlaceWordDenseProtected(grid, word, gridSize, wordPositions, protectedKeys) {
  const candidates = [];
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c] === '') continue;
      for (let charIdx = 0; charIdx < word.length; charIdx++) {
        if (word[charIdx] !== grid[r][c]) continue;
        for (const dir of directions) {
          const startRow = r - charIdx * dir.row;
          const startCol = c - charIdx * dir.col;
          if (!canPlaceWordAvoidingCells(grid, word, startRow, startCol, dir, gridSize, protectedKeys)) continue;
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
    candidates.sort((a, b) => b.overlaps - a.overlaps);
    const topTier = candidates.filter(c => c.overlaps === candidates[0].overlaps);
    const chosen  = topTier[Math.floor(Math.random() * topTier.length)];
    placeWord(grid, word, chosen.startRow, chosen.startCol, chosen.dir, wordPositions);
    return true;
  }
  // Fallback: random placement avoiding protected cells
  const shuffledDirs = fisherYates([...directions]);
  for (const dir of shuffledDirs) {
    for (let attempt = 0; attempt < 30; attempt++) {
      const startRow = Math.floor(Math.random() * gridSize);
      const startCol = Math.floor(Math.random() * gridSize);
      if (canPlaceWordAvoidingCells(grid, word, startRow, startCol, dir, gridSize, protectedKeys)) {
        placeWord(grid, word, startRow, startCol, dir, wordPositions);
        return true;
      }
    }
  }
  return false;
}

function hasEmptyNonProtectedCell(grid, gridSize, protectedKeys) {
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c] === '' && !protectedKeys.has(`${r},${c}`)) return true;
    }
  }
  return false;
}

function buildFillerWordPool(category, usedSet, isAudioMode) {
  // Category-specific words first (most thematic), then all other standard words
  const catKey = (category && !category.startsWith('tricky_') && wordLists[category]) ? category : null;
  const catWords = catKey ? wordLists[catKey].filter(w => !usedSet.has(w.toUpperCase())) : [];
  const catWordsUp = new Set(catWords.map(w => w.toUpperCase()));
  const otherWords = Object.entries(wordLists)
    .filter(([key]) => key !== catKey)
    .flatMap(([, words]) => words)
    .filter(w => !usedSet.has(w.toUpperCase()) && !catWordsUp.has(w.toUpperCase()));
  const trickyWords = isAudioMode
    ? coreAudioWords.filter(w => !usedSet.has(w.toUpperCase()))
    : [];
  return [
    ...fisherYates(catWords),
    ...fisherYates([...new Set(otherWords)]),
    ...fisherYates(trickyWords),
  ];
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

  // ── Bonus word for Master level ──────────────────────────────────────────────
  // Goal: every grid cell belongs to a word in the word list EXCEPT the bonus
  // word letters. Those letters sit in reading-order empty cells; once the
  // player finds all listed words, only the amber bonus cells remain — they
  // read them left→right, top→bottom to discover the hidden word.
  let bonusWord = null;
  let bonusHint = null;
  let bonusLetterPositions = null;   // [{row,col}, …] — one per letter

  if (config.dense) {
    const usedSet = new Set(placedWords.map(w => w.toUpperCase()));

    // 1. Pick a category-themed bonus word
    const bonusEntry = pickCategoryBonusWord(category, usedSet);

    if (bonusEntry) {
      // 2. Find all empty cells in reading order (before filler words are placed)
      const emptyCells = [];
      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          if (grid[r][c] === '') emptyCells.push({ row: r, col: c });
        }
      }

      if (emptyCells.length >= bonusEntry.word.length) {
        // 3. Reserve the first N empty cells for the bonus word
        const reservedPositions = emptyCells.slice(0, bonusEntry.word.length);
        const protectedKeys = new Set(
          reservedPositions.map(({ row, col }) => `${row},${col}`)
        );

        // 4. Fill non-protected empty cells with extra words from the pool
        //    so that (ideally) every non-bonus cell is part of a found word.
        const fillerPool  = buildFillerWordPool(category, usedSet, isAudioMode);
        const currentUsed = new Set(usedSet);
        for (const wordRaw of fillerPool) {
          if (!hasEmptyNonProtectedCell(grid, gridSize, protectedKeys)) break;
          const word = wordRaw.toUpperCase();
          if (currentUsed.has(word)) continue;
          if (tryPlaceWordDenseProtected(grid, word, gridSize, wordPositions, protectedKeys)) {
            placedWords.push(wordRaw.toLowerCase());
            currentUsed.add(word);
          }
        }

        // 5. Write bonus word letters into the reserved positions
        bonusWord = bonusEntry.word;
        bonusHint = bonusEntry.hint;
        bonusLetterPositions = [];
        for (let i = 0; i < bonusWord.length; i++) {
          const { row, col } = reservedPositions[i];
          grid[row][col] = bonusWord[i];
          bonusLetterPositions.push({ row, col });
        }
      }
    }
  }

  // Fill all remaining empty cells with random letters
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      if (grid[row][col] === '') {
        grid[row][col] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }

  return { grid, words: placedWords, wordPositions, gridSize, bonusWord, bonusHint, bonusLetterPositions };
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
