// ─── Standard category word lists ────────────────────────────────────────────

const wordLists = {
  // DEF-20: words added at previously missing lengths (4–12) so the Mystery Word
  // filler loop always lands on a valid category length and findMysteryWord always
  // returns a themed word. Also increases variety for regular players.
  // DEF-24: each category expanded to ~100 words so the category-restricted filler
  // pool is large enough for Expert / Master levels (was 40–65, needed ~80+).
  animals: ['LION','TIGER','BEAR','WOLF','EAGLE','SHARK','WHALE','SNAKE','HORSE','ZEBRA','PANDA','KOALA','RABBIT','DEER','FOX','OWL','PARROT','DOLPHIN','CHEETAH','GORILLA','PENGUIN','LEOPARD','HAMSTER','GIRAFFE','BUFFALO','MOOSE','CAMEL','JAGUAR','PANTHER','LYNX','OTTER','BEAVER','BADGER','FALCON','CONDOR','TOUCAN','IGUANA','PYTHON','MEERKAT','WOMBAT','LEMUR','BISON','COYOTE','HYENA','MOLE','SPARROW','PELICAN','STORK','PEACOCK','FLAMINGO',
    'ALLIGATOR','PORCUPINE','CROCODILE','ORANGUTAN','CHAMELEON','WOLVERINE','ALBATROSS',
    'RHINOCEROS','CHIMPANZEE','WOODPECKER',
    'MOCKINGBIRD','HUMMINGBIRD','CATERPILLAR',
    'HIPPOPOTAMUS',
    'CROW','FROG','TOAD','SWAN','DUCK','NEWT','VOLE','MINK',
    'CRANE','HERON','RAVEN','DINGO','TAPIR','OKAPI','GECKO','QUAIL','BONGO',
    'DONKEY','TURKEY','LIZARD','MAGPIE','FERRET','GOPHER','WEASEL','THRUSH','GIBBON','BABOON','IMPALA','JACKAL',
    'GAZELLE','CARIBOU','AXOLOTL','OSTRICH','WALLABY','VULTURE',
    'CAPYBARA','ANTELOPE','MONGOOSE','AARDVARK','REINDEER','MANDRILL','PARAKEET','PHEASANT','SQUIRREL','CHIPMUNK',
    'PARTRIDGE','GREYHOUND','KINGFISHER'],
  colors: ['BLUE','GREEN','YELLOW','ORANGE','PURPLE','PINK','BLACK','WHITE','BROWN','GRAY','GOLD','SILVER','VIOLET','CYAN','MAROON','INDIGO','TEAL','CORAL','BEIGE','IVORY','CRIMSON','SCARLET','TURQUOISE','MAGENTA','LIME','NAVY','OLIVE','AMBER','PEACH','ROSE','LILAC','MAUVE','CREAM','AQUA','RUST','FUCHSIA','LAVENDER','COBALT','JADE','RUBY','EBONY','PEARL','OCHRE','UMBER','SIENNA','TAUPE','SALMON','PLUM',
    'AQUAMARINE','CHARTREUSE','PERIWINKLE',
    'ULTRAMARINE',
    'MULTICOLORED',
    'BUFF','ECRU','FAWN','WINE','BONE','SAGE','PUCE','DOVE','SAND',
    'ADOBE','BLOND','BRASS','BRICK','CAMEL','DENIM','KHAKI','LEMON','MAIZE','MOCHA','SEPIA','SLATE','SMOKE','STRAW','WHEAT',
    'BISQUE','AUBURN','CANARY','CELERY','COPPER','FALLOW','FOREST','JASPER','ORCHID','SORREL','SUNSET',
    'SAFFRON','EMERALD','VANILLA','MUSTARD','PEACOCK',
    'BURGUNDY','CHESTNUT','EGGSHELL','MIDNIGHT'],
  food: ['PIZZA','PASTA','BREAD','CHEESE','APPLE','BANANA','GRAPE','MANGO','RICE','SOUP','SALAD','CAKE','PIE','FISH','STEAK','SUSHI','TACO','WAFFLE','DONUT','BAGEL','MUFFIN','COOKIE','SALMON','SHRIMP','NOODLE','LEMON','MELON','PEACH','PLUM','OLIVE','ONION','CARROT','PEPPER','GINGER','GARLIC','BUTTER','CREAM','YOGURT','PRETZEL','BROWNIE','PANCAKE','OMELET','BURRITO','FALAFEL','KEBAB','LOBSTER','OYSTER','TRUFFLE','CUSTARD','SORBET',
    'COLESLAW','TORTILLA','FOCACCIA','PORRIDGE','SMOOTHIE','CINNAMON',
    'CROISSANT','MARMALADE','ARTICHOKE','BLUEBERRY','CHOCOLATE',
    'STRAWBERRY','CHEESECAKE','MINESTRONE','BRUSCHETTA',
    'GINGERBREAD','POMEGRANATE','MARSHMALLOW',
    'BUTTERSCOTCH',
    'BEET','CORN','KALE','LAMB','LEEK','LIME','MINT','PEAR','TOFU',
    'BASIL','CHILI','CREPE','CURRY','PESTO','THYME','TOAST',
    'CASHEW','COFFEE','FENNEL','LENTIL','NUTMEG','RADISH','TURNIP','WALNUT','BARLEY',
    'ANCHOVY','CHEDDAR','CHORIZO','GRANOLA','LETTUCE','MUSTARD','PARSLEY',
    'BROCCOLI','EGGPLANT','MEATBALL','SANDWICH'],
  nature: ['TREE','FLOWER','RIVER','OCEAN','MOUNTAIN','FOREST','DESERT','LAKE','CLOUD','RAIN','SNOW','WIND','STAR','MOON','SUN','VALLEY','CANYON','GLACIER','MEADOW','VOLCANO','WATERFALL','ISLAND','CLIFF','SWAMP','PRAIRIE','STORM','THUNDER','LIGHTNING','TORNADO','TSUNAMI','REEF','FJORD','TUNDRA','SAVANNA','DELTA','DUNE','GEYSER','LAGOON','MARSH','PEBBLE','BOULDER','CRYSTAL','FOSSIL','CAVE','SPRING','STREAM','BROOK','BASIN','BLIZZARD','AURORA',
    'EARTHQUAKE','WILDERNESS','ATMOSPHERE',
    'COUNTRYSIDE','THUNDERCLAP','UNDERGROWTH',
    'THUNDERSTORM','MOUNTAINSIDE',
    'CRAG','GLEN','MOOR','PEAK','SOIL','MIST','GUST','HAIL','LAVA','MESA',
    'BAYOU','BIRCH','CHASM','GORGE','GROVE','HEATH','RIDGE','SHORE','SLOPE',
    'CANOPY','CAVERN','GROTTO','JUNGLE','RAPIDS','RAVINE','STEPPE','SUMMIT','VORTEX',
    'HABITAT','ICEBERG','PLATEAU','SEASIDE','WETLAND',
    'HIGHLAND','SEDIMENT','SEASHORE',
    'SANDSTORM','SHORELINE'],
  sports: ['SOCCER','TENNIS','GOLF','SWIMMING','RUNNING','HOCKEY','BOXING','YOGA','SURFING','SKIING','CYCLING','HIKING','DANCING','ARCHERY','FENCING','ROWING','DIVING','CRICKET','RUGBY','KARATE','BOWLING','SAILING','WRESTLING','BASEBALL','FOOTBALL','VOLLEYBALL','BADMINTON','SQUASH','LACROSSE','POLO','SKATING','CLIMBING','TRIATHLON','JUDO','TAEKWONDO','CURLING','BIATHLON','SOFTBALL','HANDBALL','NETBALL','CROQUET','DARTS','SNOOKER','KAYAKING','SKATEBOARD',
    'PARASAILING','KITESURFING','WINDSURFING',
    'CHAMPIONSHIP','BODYBUILDING','TRAMPOLINING',
    'LUGE','SUMO',
    'CHESS','SKEET','KENDO','RELAY','RODEO',
    'SPRINT','DISCUS','RACING','AIKIDO','SLALOM','JOCKEY',
    'HURLING','PARKOUR','REGATTA','HURDLES','HUNTING','FISHING',
    'CANOEING','DRESSAGE','SHOOTING','JOUSTING','VAULTING','THROWING',
    'ATHLETICS','WATERPOLO','SKYDIVING',
    'BASKETBALL','GYMNASTICS','TRAMPOLINE','FREESKIING',
    'PARAGLIDING',
    'SNOWBOARDING','POWERLIFTING'],
  space: ['PLANET','STAR','GALAXY','COMET','METEOR','NEBULA','ORBIT','ROCKET','SATURN','JUPITER','MARS','VENUS','MERCURY','URANUS','NEPTUNE','MOON','SUN','COSMOS','NOVA','PULSAR','QUASAR','ASTEROID','GRAVITY','ECLIPSE','SOLSTICE','EQUINOX','AURORA','ZENITH','NADIR','VOID','WORMHOLE','TELESCOPE','SHUTTLE','STATION','ASTRONAUT','HORIZON','CRATER','LANDER','PROBE','SATELLITE',
    'SPACECRAFT','COSMONAUTS','STARGAZING',
    'OBSERVATORY','MOONWALKING',
    'ASTROPHYSICS','INTERSTELLAR',
    'BEAM','DARK','FLUX','HALO','LENS','RING','SPIN','DUST','MASS',
    'DWARF','LUNAR','OZONE','PLUTO','RADIO','SOLAR','TITAN','FLARE',
    'APOGEE','CORONA','DEBRIS','HELIUM','IMPACT',
    'CAPSULE','CLUSTER','DENSITY','IMAGING','ORBITAL','PERIGEE','SUNSPOT','TRANSIT',
    'INFINITY','LATITUDE','UNIVERSE','PARTICLE','SUNLIGHT',
    'MAGNITUDE','METEOROID','SUPERMOON','EXOPLANET',
    'ATMOSPHERE','PLANETARIUM','COSMOLOGICAL'],
  music: ['GUITAR','PIANO','VIOLIN','DRUMS','FLUTE','TRUMPET','CELLO','HARP','BASS','BANJO','UKULELE','OBOE','CLARINET','TUBA','TROMBONE','ORGAN','LUTE','SITAR','TEMPO','RHYTHM','MELODY','HARMONY','CHORD','SCALE','OCTAVE','TREBLE','CLEF','SONATA','OPERA','JAZZ','BLUES','ROCK','SOUL','FUNK','REGGAE','WALTZ','BALLAD','CHORUS','VERSE','BRIDGE',
    'XYLOPHONE','ACCORDION','SAXOPHONE','CONDUCTOR',
    'MICROPHONE','TAMBOURINE','KETTLEDRUM',
    'SYNTHESIZER','COMPOSITION','PERFORMANCE',
    'PHILHARMONIC',
    'BEAT','FLAT','NOTE','TUNE','DUET','REST',
    'ALBUM','DISCO','DRONE','FORTE','LYRIC','MINOR','MAJOR','PITCH','SHARP','VIOLA',
    'STANZA','TIMBRE','ANTHEM','CHORAL','STEREO','MEDLEY',
    'SOPRANO','QUARTET','RECITAL','REFRAIN','CADENCE','CONCERT',
    'OVERTURE','MANDOLIN','OPERETTA','KEYBOARD','ACOUSTIC',
    'CLASSICAL','MODULATION','PERCUSSION','MUSICOLOGY'],
  countries: ['FRANCE','BRAZIL','JAPAN','CHINA','INDIA','EGYPT','KENYA','PERU','CHILE','MEXICO','CANADA','RUSSIA','ITALY','SPAIN','GREECE','TURKEY','POLAND','SWEDEN','NORWAY','DENMARK','FINLAND','PORTUGAL','AUSTRIA','BELGIUM','NIGERIA','GHANA','SENEGAL','MOROCCO','IRAN','IRAQ','CUBA','HAITI','BOLIVIA','ECUADOR','COLOMBIA','VIETNAM','THAILAND','NEPAL','BHUTAN','ANGOLA',
    'ARGENTINA','INDONESIA','SINGAPORE','VENEZUELA','AUSTRALIA',
    'MADAGASCAR','MOZAMBIQUE','BANGLADESH','LUXEMBOURG',
    'AFGHANISTAN','SWITZERLAND','PHILIPPINES',
    'TURKMENISTAN',
    'CHAD','FIJI','LAOS','MALI','OMAN','TOGO',
    'BENIN','LIBYA','NAURU','NIGER','PALAU','QATAR','SAMOA','TIMOR','TONGA','YEMEN',
    'ISRAEL','JORDAN','KUWAIT','LATVIA','MALAWI','PANAMA','RWANDA','SERBIA','TAIWAN','ZAMBIA',
    'ALBANIA','ALGERIA','ARMENIA','BURUNDI','CROATIA','ESTONIA','GERMANY','HUNGARY','ICELAND','IRELAND','ROMANIA','UKRAINE',
    'BOTSWANA','CAMBODIA','CAMEROON','ETHIOPIA','HONDURAS','MALAYSIA','MONGOLIA','SLOVAKIA','TANZANIA','ZIMBABWE',
    'GUATEMALA','NICARAGUA','MAURITIUS'],
  science: ['ATOM','CELL','GENE','VIRUS','PHOTON','PROTON','NEUTRON','ELECTRON','PLASMA','LASER','MAGNET','PRISM','ENZYME','PROTEIN','CARBON','OXYGEN','HYDROGEN','NITROGEN','CALCIUM','SODIUM','FOSSIL','EROSION','SEISMIC','THERMAL','KINETIC','FRICTION','GRAVITY','MOMENTUM','VELOCITY','CATALYST','POLYMER','CRYSTAL','COMPOUND','ELEMENT','ISOTOPE','REACTION','FUSION','FISSION','OSMOSIS','DIFFUSION',
    'METABOLISM','CHROMOSOME','HYPOTHESIS',
    'TEMPERATURE','EVAPORATION','CIRCULATION',
    'CONDENSATION','CONSERVATION',
    'ACID','BOND','DATA','HEAT','LENS','MASS','SALT','WAVE','WATT','MOLE',
    'ALLOY','CLONE','DECAY','INERT','LIPID','METAL','NERVE','OXIDE','PHASE','QUARK',
    'CHARGE','COSMIC','IMMUNE','MATTER','METRIC','NEURON','OPTICS','RADIUS','THEORY','VECTOR',
    'BATTERY','BIOLOGY','CIRCUIT','CLIMATE','DENSITY','ENTROPY','FORMULA','INERTIA','NUCLEAR','QUANTUM','SILICON','SPECIES',
    'MOLECULE','MUTATION','PARTICLE','PATHOGEN','PRESSURE','SPECTRUM','TAXONOMY',
    'APPARATUS','ELECTRODE','MICROWAVE'],
  mythology: ['ZEUS','HERA','APOLLO','ATHENA','ARES','HERMES','POSEIDON','HADES','THOR','ODIN','LOKI','FREYA','OSIRIS','ISIS','ANUBIS','HORUS','BRAHMA','VISHNU','SHIVA','MEDUSA','HYDRA','SPHINX','MINOTAUR','CENTAUR','PHOENIX','DRAGON','UNICORN','GRIFFIN','KRAKEN','TITAN','ATLAS','HERCULES','ACHILLES','CYCLOPS','SIREN','MERMAID','VAMPIRE','WEREWOLF',
    'ANDROMEDA','EXCALIBUR','LABYRINTH','APHRODITE',
    'PERSEPHONE','PROMETHEUS','UNDERWORLD',
    'THUNDERBOLT','BELLEROPHON',
    'SHAPESHIFTER',
    'EPIC','FATE','MYTH','RUNE','SAGA',
    'CIRCE','CURSE','DEITY','GIANT','MAGIC','NYMPH','TROLL','WITCH','ELFIN','JANUS',
    'AETHER','CHIRON','CLOTHO','KRONOS','NEREID','SELENE','TRITON','TYPHON',
    'ARTEMIS','BACCHUS','CALYPSO','DEMETER','FORTUNE','MERCURY','SORCERY','CHIMERA',
    'CERBERUS','DAEDALUS','DIONYSUS','GANYMEDE','ODYSSEUS',
    'LEGENDARY','SACRIFICE','IMMORTALS',
    'HEPHAESTUS',
    'ENCHANTMENT'],
  technology: ['LAPTOP','TABLET','ROUTER','SERVER','CLOUD','PIXEL','CURSOR','BROWSER','NETWORK','PROGRAM','CIRCUIT','SENSOR','BATTERY','DISPLAY','KEYBOARD','MONITOR','CAMERA','PRINTER','SCANNER','MODEM','SWITCH','CABLE','WIRELESS','DIGITAL','BINARY','CODING','SCRIPT','COMPILE','DEBUG','CACHE','KERNEL','FIREWALL','ENCRYPT','DECRYPT','STREAM','UPLOAD','DOWNLOAD','BACKUP','RESTORE','REBOOT',
    'BYTE','CHIP','CODE','DATA','PORT','DISK',
    'ALGORITHM','BLUETOOTH','INTERFACE','PROCESSOR','BANDWIDTH',
    'JAVASCRIPT','SMARTPHONE','TRANSISTOR',
    'PROGRAMMING','COMPRESSION','TOUCHSCREEN',
    'CRYPTOGRAPHY',
    'BAUD','BOOT','FILE','HACK','HOST','ICON','LINK','NODE','PING','SYNC',
    'ARRAY','AUDIT','CODEC','CRASH','FETCH','LAYER','LOGIN','MACRO','PROXY','STACK',
    'BUFFER','COMMIT','COOKIE','DEPLOY','ENCODE','FILTER','MEMORY','MODULE',
    'BACKEND','CLUSTER','CONSOLE','DATASET','EXECUTE','RUNTIME',
    'DATABASE','ENCODING','HARDWARE','SOFTWARE','TEMPLATE',
    'FRAMEWORK','MICROCHIP','FILESYSTEM'],
  ocean: ['WAVE','CORAL','REEF','TIDE','CURRENT','ABYSS','TRENCH','KELP','PLANKTON','JELLYFISH','OCTOPUS','SEAHORSE','STARFISH','CRAB','LOBSTER','SQUID','CLAM','OYSTER','MUSSEL','URCHIN','NARWHAL','MANATEE','WALRUS','SEAL','PENGUIN','PELICAN','ANCHOR','SHIP','SUBMARINE','LIGHTHOUSE','BUOY','HARBOR','MARINA','ESTUARY','LAGOON','ATOLL','SHOAL','CREST','SPRAY','SURF',
    'CRUSTACEANS','ARCHIPELAGO',
    'OCEANOGRAPHY',
    'BAIT','COVE','FOAM','GILL','HOOK','HULL','KEEL','PIER','PORT','RAFT','SAIL','TERN','WAKE',
    'ALGAE','BEACH','CONCH','COAST','DEPTH','FLUKE','HAVEN','KAYAK','MANTA','PRAWN','SCUBA','SWELL','BRINE',
    'MARLIN','PUFFER','FATHOM','GROTTO','BREEZE','DINGHY',
    'ABYSSAL','COASTAL','DOLPHIN','FLOTSAM','GALLEON','MARINER','PELAGIC','SEAWEED',
    'BARNACLE','NAUTILUS','SEAGRASS','STINGRAY',
    'ANCHORAGE','DRIFTWOOD','FISHERMAN','SHELLFISH','SWORDFISH',
    'HAMMERHEAD','UNDERWATER','CONTINENTAL'],
  history: ['EMPIRE','DYNASTY','PHARAOH','KNIGHT','CASTLE','SIEGE','BATTLE','TREATY','REVOLT','COLONY','CRUSADE','PYRAMID','FORUM','SENATE','LEGION','FEUDAL','PLAGUE','FAMINE','MONARCH','REPUBLIC','SCROLL','RELIC','ARTIFACT','RUIN','TEMPLE','SHRINE','TOMB','BURIAL','GLADIATOR','COLOSSEUM','CATAPULT','ARMOUR','SHIELD','SWORD','SPEAR','THRONE','CROWN','SCEPTRE','CHARTER','DECREE',
    'REVOLUTION','PARLIAMENT','EXCAVATION',
    'RENAISSANCE','ARCHAEOLOGY','MESOPOTAMIA',
    'CIVILIZATION','COLONIZATION',
    'ARCH','CLAN','COIN','HEIR','LORD','OATH','SERF','WALL','WRIT','TORC',
    'ABBEY','AGORA','COURT','EDICT','ENVOY','EPOCH','EXILE','MANOR','REALM','TRIBE',
    'BANNER','BEACON','BISHOP','CENSUS','HERALD','LANCER','PALACE','PILLAR','PORTAL','TYRANT',
    'DUNGEON','EMPEROR','EMPRESS','KINGDOM','PASSAGE','TRIBUTE','WARRIOR',
    'CONQUEST','FORTRESS','HERITAGE','MONUMENT','PROVINCE',
    'ANCESTRAL','CHRONICLE','SOVEREIGN','DEMOCRACY',
    'HISTORICAL','LIBERATION','OCCUPATION',
    'IMPERIALISM'],
  emotions: ['HAPPY','SAD','ANGRY','CALM','SCARED','BRAVE','PROUD','ASHAMED','LONELY','JOYFUL','GRIEF','LOVE','HATE','ENVY','HOPE','FEAR','TRUST','DISGUST','SURPRISE','BORED','CURIOUS','EXCITED','NERVOUS','RELAXED','CONTENT','MISERABLE','ELATED','FURIOUS','ANXIOUS','SERENE','CONFUSED','SHOCKED','AMUSED','GRATEFUL','GUILTY','REGRET','NOSTALGIC','HOPEFUL','DESPERATE','PEACEFUL',
    'MELANCHOLY','VULNERABLE','PASSIONATE',
    'OVERWHELMED','EMBARRASSED','HEARTBROKEN',
    'APPREHENSIVE','DISHEARTENED',
    'BOLD','COOL','GLAD','GRIM','KIND','MEEK','NUMB','RAGE','SAFE','SMUG','WARM','WILD',
    'AGONY','ALOOF','BLISS','EAGER','GIDDY','MOODY','SORRY','STOIC','TIMID','WEARY',
    'BITTER','CHEERY','DOCILE','FEISTY','GENTLE','GRUMPY','HUMBLE','MELLOW','PLACID','TENDER',
    'BASHFUL','DEVOTED','ELATION','FORLORN','PATIENT','SMITTEN','WISTFUL','ZEALOUS',
    'CAREFREE','CHEERFUL','DEJECTED','ECSTATIC','HOPELESS','JUBILANT','THRILLED',
    'DEPRESSED','FULFILLED','IRRITATED'],
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
// Covers every word across all 13 standard categories plus tricky audio words.
// Used by Word Association mode — shown instead of the word itself.

const wordClues = {
  // ── Animals ──────────────────────────────────────────────────────────────
  LION:'King of the jungle with a mighty roar',TIGER:'Largest striped wild cat, native to Asia',
  BEAR:'Large omnivore that hibernates through winter',WOLF:'Pack-hunting wild canine of forests',
  EAGLE:'Powerful bird of prey — national symbol of the USA',SHARK:'Apex ocean predator with multiple rows of teeth',
  WHALE:'Largest mammal on Earth, lives in the ocean',SNAKE:'Legless reptile that sheds its skin',
  HORSE:'Domesticated hoofed animal used for riding',ZEBRA:'African grazing animal with black-and-white stripes',
  PANDA:'Black-and-white bear that lives on bamboo shoots',KOALA:'Australian marsupial that sleeps up to 22 hours a day',
  RABBIT:'Fluffy-eared burrowing mammal with a cottontail',DEER:'Graceful woodland mammal with antlers',
  FOX:'Clever red-furred wild canine',OWL:'Night-hunting bird famous for its rotating head',
  PARROT:'Colourful tropical bird that can mimic speech',DOLPHIN:'Highly intelligent social ocean mammal',
  CHEETAH:'Fastest land animal, can sprint over 100 km/h',GORILLA:'Largest primate, native to African rainforests',
  PENGUIN:'Flightless bird of the Antarctic that swims expertly',LEOPARD:'Spotted big cat that drags prey up into trees',
  HAMSTER:'Small furry rodent popular as a pet, loves to hoard food',GIRAFFE:'World\'s tallest living animal with an extra-long neck',
  BUFFALO:'Massive horned grazing animal of African savannas',MOOSE:'Largest member of the deer family',
  CAMEL:'Desert mammal with one or two humps for fat storage',JAGUAR:'Spotted big cat of Central and South America',
  PANTHER:'Dark-coated big cat — often a melanistic leopard or jaguar',LYNX:'Medium wild cat with distinctive tufted ears',
  OTTER:'Playful semi-aquatic mammal that floats on its back',BEAVER:'Dam-building rodent with a flat paddle tail',
  BADGER:'Burrowing nocturnal mammal with a striped face',FALCON:'Swift bird of prey used in falconry',
  CONDOR:'Massive Andean vulture with the largest wingspan of any land bird',TOUCAN:'Tropical bird with an enormous colourful beak',
  IGUANA:'Large scaly tropical lizard that can climb trees',PYTHON:'Giant constricting snake that squeezes its prey',
  MEERKAT:'Small burrowing mongoose of the Kalahari, stands on its hind legs',WOMBAT:'Stocky Australian marsupial that digs extensive burrows',
  LEMUR:'Wide-eyed primates native only to Madagascar',BISON:'Shaggy bovine of North American grasslands',
  COYOTE:'Adaptable wild dog of North and Central America',HYENA:'African scavenger with a distinctive laughing call',
  MOLE:'A burrowing mammal with velvety fur — also a chemistry unit of ~6.02 × 10²³ particles',SPARROW:'Small common songbird found almost worldwide',
  PELICAN:'Large seabird with an enormous throat pouch for catching fish',STORK:'Tall wading bird famous in folklore for delivering babies',
  PEACOCK:'Male peafowl famous for its spectacular iridescent tail display',FLAMINGO:'Pink wading bird that stands on one leg',

  // ── Colors ────────────────────────────────────────────────────────────────
  RED:'The colour of ripe strawberries and fire engines',BLUE:'The colour of a clear daytime sky',
  GREEN:'The colour of grass and fresh leaves',YELLOW:'The colour of ripe bananas and sunflowers',
  ORANGE:'The colour of pumpkins and autumn leaves',PURPLE:'A blend of red and blue — colour of royalty',
  PINK:'A pale red — colour of flamingos and cherry blossoms',BLACK:'The darkest possible colour, absorbs all light',
  WHITE:'The lightest colour, reflects all visible light',BROWN:'The earthy colour of soil and tree bark',
  GRAY:'A neutral tone between black and white',GOLD:'Rich yellow metallic colour, associated with wealth',
  SILVER:'Shiny grey metallic colour',VIOLET:'A blue-purple hue at the end of the visible spectrum',
  CYAN:'A vivid blue-green, used in printing ink',MAROON:'A dark brownish-red colour',
  INDIGO:'Deep blue-purple found in the rainbow between blue and violet',TEAL:'A calming blue-green like a tropical lagoon',
  CORAL:'A warm orange-pink colour — also the reef-building marine invertebrate',BEIGE:'A pale sandy neutral tone',
  IVORY:'An off-white named after elephant tusks',CRIMSON:'A deep vivid red with a slight blue tint',
  SCARLET:'A brilliant bright red',TURQUOISE:'Blue-green like tropical Caribbean water',
  MAGENTA:'A vivid purplish-pink used in colour printing',LIME:'A bright yellow-green colour — also a small sour green citrus fruit',
  NAVY:'A very dark blue, colour of naval uniforms',OLIVE:'A dull yellowish-green colour — also the small salty fruit pressed for its oil',
  AMBER:'A warm golden-orange like tree resin',PEACH:'A soft pinkish-orange colour — also a fuzzy-skinned stone fruit with sweet flesh',
  ROSE:'A soft pink named after the flower',LILAC:'A pale violet named after the spring flower',
  MAUVE:'A soft pale purple',TAN:'A light yellowish-brown like sun-dried sand',
  CREAM:'A warm off-white colour — also the fatty layer skimmed from fresh milk',AQUA:'A bright blue-green like clear tropical water',
  RUST:'A reddish-brown colour like corroded iron',FUCHSIA:'A vivid magenta-pink named after the Fuchsia flower',
  LAVENDER:'A pale soft purple named after the fragrant herb',COBALT:'A deep vivid blue used in glass and pottery',
  JADE:'A rich green like the precious stone',RUBY:'A deep red like the precious gemstone',
  EBONY:'A very deep black like the dense tropical hardwood',PEARL:'A lustrous off-white like the gem found in oysters',
  OCHRE:'A yellow-orange earth pigment used since prehistoric times',UMBER:'A dark earthy brown pigment',
  SIENNA:'A warm reddish-brown earth tone',TAUPE:'A dark brownish-grey',
  PLUM:'A dark reddish-purple named after the fruit',

  // ── Food ──────────────────────────────────────────────────────────────────
  PIZZA:'Italian flatbread topped with cheese, sauce and toppings',PASTA:'Italian wheat-flour dough shaped into strands or tubes',
  BREAD:'Baked dough made from flour, water and yeast',CHEESE:'Dairy product made by curdling and ageing milk',
  APPLE:'A crisp round fruit that grows on trees',BANANA:'A long curved yellow tropical fruit',
  GRAPE:'A small sweet fruit that grows in clusters on a vine',MANGO:'A juicy tropical fruit with a large stone inside',
  RICE:'A staple grain eaten by half the world\'s population',SOUP:'A hot liquid dish made by simmering vegetables or meat',
  SALAD:'A cold dish of mixed raw vegetables or leaves',CAKE:'A sweet baked dessert often served at celebrations',
  PIE:'A dish with a pastry crust baked in a dish or tin',FISH:'A cold-blooded aquatic animal widely eaten as food',
  STEAK:'A thick slice of grilled beef',SUSHI:'Japanese vinegared rice with raw fish or vegetables',
  TACO:'A Mexican folded corn tortilla with fillings',WAFFLE:'A crispy batter cake with a distinctive grid pattern',
  DONUT:'A ring-shaped fried dough coated in sugar or glaze',BAGEL:'A chewy circular bread roll that\'s boiled then baked',
  MUFFIN:'A small domed individual cake or bread roll',COOKIE:'A sweet biscuit — or the small file a website stores on your device',
  SALMON:'A large pink-fleshed fish rich in omega-3 — the L is silent',SHRIMP:'A small shellfish cooked and eaten whole or peeled',
  NOODLE:'A long thin strip of pasta or dough used in Asian cooking',LEMON:'A sour yellow citrus fruit',
  MELON:'A large round fruit with sweet watery flesh',
  ONION:'A pungent layered bulb used as a cooking base',
  CARROT:'An orange root vegetable loved by rabbits',PEPPER:'A spicy fruit used as a seasoning — or a crunchy bell vegetable',
  GINGER:'A pungent knobbly root used in cooking and tea',GARLIC:'A pungent bulb used to flavour dishes worldwide',
  BUTTER:'A rich dairy spread made from churned cream',
  YOGURT:'Fermented milk with a tangy creamy texture',PRETZEL:'A twisted baked snack dusted with salt',
  BROWNIE:'A dense fudgy chocolate square cake',PANCAKE:'A flat fried batter cake served with syrup or toppings',
  OMELET:'A folded egg dish cooked in a pan with fillings',BURRITO:'A large flour tortilla wrapped around rice, beans and fillings',
  FALAFEL:'A deep-fried ball made from chickpeas or fava beans',KEBAB:'Skewered meat or vegetables grilled over fire',
  LOBSTER:'A large ocean crustacean considered a luxury food',OYSTER:'A saltwater shellfish eaten raw or cooked',
  TRUFFLE:'A rare underground fungus prized as a luxury ingredient',CUSTARD:'A creamy sauce or pudding made from eggs and milk',
  SORBET:'A frozen dessert made from fruit juice with no dairy',

  // ── Nature ────────────────────────────────────────────────────────────────
  TREE:'A tall woody perennial plant with a trunk and branches',FLOWER:'A plant\'s colourful bloom, often fragrant',
  RIVER:'A large flowing body of fresh water',OCEAN:'The vast body of salt water covering 71% of Earth',
  MOUNTAIN:'A large natural elevation of the Earth\'s surface',FOREST:'A dense area of trees — also a dark rich green colour',
  DESERT:'An arid region with very little rainfall',LAKE:'A large body of still water surrounded by land',
  CLOUD:'Water vapour floating in the sky — also a term for remote internet servers',RAIN:'Water falling from clouds to the ground',
  SNOW:'Frozen water crystals that fall as white flakes',WIND:'Moving air caused by pressure differences in the atmosphere',
  STAR:'A massive ball of burning gas in the universe',MOON:'A natural satellite that orbits a planet',
  SUN:'The star at the centre of our solar system',VALLEY:'A low area of land between hills or mountains',
  CANYON:'A deep gorge carved by a river over millions of years',GLACIER:'A slow-moving mass of compacted ice',
  MEADOW:'An open grassy field full of wildflowers',VOLCANO:'A mountain that can erupt molten lava',
  WATERFALL:'Water cascading over a cliff edge',ISLAND:'A piece of land completely surrounded by water — the S is silent',
  CLIFF:'A steep vertical face of rock',SWAMP:'A wetland area with shallow water and dense vegetation',
  PRAIRIE:'A vast flat grassy plain, especially in North America',STORM:'A violent weather event with strong winds and rain',
  THUNDER:'The loud sound that follows a lightning bolt',LIGHTNING:'A discharge of electricity during a thunderstorm',
  TORNADO:'A violently rotating column of air touching the ground',TSUNAMI:'A massive ocean wave triggered by an earthquake',
  REEF:'An underwater ridge of coral or rock',FJORD:'A long narrow inlet carved by ancient glaciers',
  TUNDRA:'A treeless frozen plain of the far north',SAVANNA:'A tropical grassland dotted with trees',
  DELTA:'A flat area of land where a river fans out into the sea',DUNE:'A mound of sand shaped by the wind',
  GEYSER:'A hot spring that erupts jets of boiling water',LAGOON:'A shallow body of water separated from the sea',
  MARSH:'A low-lying wetland with grasses and reeds',PEBBLE:'A small smooth stone shaped by running water',
  BOULDER:'A very large rock',CRYSTAL:'A solid with a regular geometric structure, like quartz or ice',
  FOSSIL:'The remains of an ancient organism preserved in rock',CAVE:'A hollow underground space in rock',
  SPRING:'A place where water naturally bubbles up from the ground',STREAM:'A small flowing body of water — also to transmit data continuously in real time',
  BROOK:'A small gentle stream',BASIN:'A bowl-shaped depression in the landscape',
  BLIZZARD:'A severe snowstorm with high winds and low visibility',AURORA:'Colourful lights in the sky near the poles — aurora borealis',

  // ── Sports ────────────────────────────────────────────────────────────────
  SOCCER:'The world\'s most popular sport, played with a round ball and feet',TENNIS:'A racquet sport played on a court divided by a net',
  GOLF:'A precision sport where players hit a ball into holes',SWIMMING:'Competitive racing through water using various strokes',
  RUNNING:'Racing on foot over various distances on track or road',HOCKEY:'A stick-and-puck sport played on ice or grass',
  BOXING:'A combat sport fought with padded gloves in a ring',YOGA:'An ancient practice combining movement, breathing and meditation',
  SURFING:'Riding ocean waves on a board',SKIING:'Descending snowy slopes on two long planks',
  CYCLING:'Racing on bicycles over road or off-road courses',HIKING:'Walking long distances over natural terrain',
  DANCING:'Performing rhythmic movements to music as a sport or art',ARCHERY:'Shooting arrows at a target with a bow',
  FENCING:'A combat sport using a sword — foil, épée or sabre',ROWING:'Propelling a boat with oars in a race',
  DIVING:'Jumping from a high platform and entering water with skill',CRICKET:'A bat-and-ball sport played with 11 players per side',
  RUGBY:'A full-contact ball sport played with an oval ball',KARATE:'A Japanese martial art using punches and kicks',
  BOWLING:'Rolling a heavy ball down a lane to knock over pins',SAILING:'Racing boats powered by wind through sails',
  WRESTLING:'A grappling combat sport where players try to pin each other',BASEBALL:'An American bat-and-ball sport with four bases',
  FOOTBALL:'An oval-ball contact sport popular in the USA and Australia',VOLLEYBALL:'A team sport hitting a ball over a high net',
  BADMINTON:'A racquet sport played with a shuttlecock over a net',SQUASH:'A fast racquet sport played in an enclosed court',
  LACROSSE:'A stick-and-ball sport using a netted stick',POLO:'A team sport played on horseback with a mallet',
  SKATING:'Gliding on ice or pavement with bladed or wheeled boots',CLIMBING:'Scaling rock faces or climbing walls using strength and technique',
  TRIATHLON:'A three-part race combining swimming, cycling and running',JUDO:'A Japanese martial art using throws and holds',
  TAEKWONDO:'A Korean martial art famous for its powerful kicks',CURLING:'A target sport played on ice with heavy stones',
  BIATHLON:'A winter sport combining cross-country skiing and rifle shooting',SOFTBALL:'A form of baseball played with a larger softer ball',
  HANDBALL:'A team sport where players throw a ball into the opponent\'s goal',NETBALL:'A team sport similar to basketball, popular in schools',
  CROQUET:'A lawn game hitting balls through hoops with a mallet',DARTS:'A pub sport throwing pointed missiles at a circular board',
  SNOOKER:'A cue sport played on a large baize-covered table',KAYAKING:'Paddling a small boat with a double-bladed paddle',
  SKATEBOARD:'A sport riding a flat board with four wheels',

  // ── Space ─────────────────────────────────────────────────────────────────
  PLANET:'A large body that orbits a star, like Earth or Saturn',GALAXY:'A massive system of billions of stars, gas and dust',
  COMET:'An icy body that grows a glowing tail when near the Sun',METEOR:'A rock from space that burns up entering the atmosphere',
  NEBULA:'A vast cloud of gas and dust where stars are born',ORBIT:'The curved path an object takes around another in space',
  ROCKET:'A vehicle propelled by burning fuel to reach space',SATURN:'The ringed gas giant — sixth planet from the Sun',
  JUPITER:'The largest planet in our solar system',MARS:'The red rocky fourth planet — nearest to Earth',
  VENUS:'The hottest planet and our nearest neighbour',MERCURY:'The smallest and fastest planet, closest to the Sun',
  URANUS:'An ice giant that rotates on its side',NEPTUNE:'The farthest known planet — deep blue and windiest',
  COSMOS:'Another word for the entire universe',NOVA:'A sudden brightening of a star due to a nuclear explosion on its surface',
  PULSAR:'A rapidly rotating neutron star emitting regular radio pulses',QUASAR:'An extremely luminous and distant active galactic nucleus',
  ASTEROID:'A rocky body orbiting the Sun, mostly found in the asteroid belt',GRAVITY:'The invisible force of attraction between all masses',
  ECLIPSE:'When one celestial body passes in front of another',SOLSTICE:'The longest or shortest day of the year',
  EQUINOX:'When day and night are equal length — spring or autumn',
  ZENITH:'The point directly overhead in the sky',NADIR:'The lowest point directly below an observer',
  VOID:'A vast empty region of space with few galaxies',WORMHOLE:'A hypothetical tunnel connecting two points in spacetime',
  TELESCOPE:'An instrument for observing distant objects in space',SHUTTLE:'The reusable spacecraft used by NASA\'s Space Shuttle program',
  STATION:'An orbiting facility where astronauts live and work',ASTRONAUT:'A person trained to travel and work in space',
  HORIZON:'Where the sky appears to meet the Earth\'s surface',CRATER:'A bowl-shaped depression caused by a meteor impact',
  LANDER:'A spacecraft designed to touch down on a planetary surface',PROBE:'An unmanned spacecraft sent to explore space',
  SATELLITE:'An object that orbits a planet, natural or artificial',

  // ── Music ─────────────────────────────────────────────────────────────────
  GUITAR:'A stringed instrument played by plucking or strumming',PIANO:'A keyboard instrument with 88 keys and hammered strings',
  VIOLIN:'A bowed four-string instrument played under the chin',DRUMS:'Percussion instruments struck to keep the rhythm',
  FLUTE:'A woodwind instrument played by blowing across a hole',TRUMPET:'A brass wind instrument with valves',
  CELLO:'A large bowed string instrument held between the knees',HARP:'A large plucked string instrument with a triangular frame',
  BASS:'The lowest-pitched stringed instrument or voice part',BANJO:'A round-bodied plucked string instrument from folk music',
  UKULELE:'A small four-string instrument from Hawaii',OBOE:'A double-reed woodwind instrument with a distinctive nasal tone',
  CLARINET:'A single-reed woodwind instrument',TUBA:'The largest and lowest-pitched brass instrument',
  TROMBONE:'A brass instrument with a sliding tube to change pitch',ORGAN:'A keyboard instrument that produces sound through pipes',
  LUTE:'An ancient plucked string instrument with a pear-shaped body',SITAR:'A long-necked plucked string instrument from India',
  TEMPO:'The speed at which a piece of music is played',RHYTHM:'The regular beat and timing pattern in music',
  MELODY:'The main tune or sequence of single notes in a song',HARMONY:'Notes played together to create a pleasing sound',
  CHORD:'Three or more notes played simultaneously',SCALE:'A sequence of notes in ascending or descending order',
  OCTAVE:'A musical interval spanning eight notes of a scale',TREBLE:'The higher range of musical pitch',
  CLEF:'A symbol at the start of a staff showing the pitch range',SONATA:'A classical composition for one or two instruments',
  OPERA:'A dramatic performance combining singing and orchestral music',JAZZ:'An improvisation-heavy genre born in the American South',
  BLUES:'A soulful genre expressing hardship, born in the African American tradition',ROCK:'An electric guitar-driven genre that emerged in the 1950s',
  SOUL:'A genre blending gospel and rhythm and blues',FUNK:'A groove-heavy rhythmic genre pioneered by James Brown',
  REGGAE:'A Jamaican genre with an offbeat rhythm',WALTZ:'A flowing three-beat ballroom dance',
  BALLAD:'A slow, emotional song that tells a story',CHORUS:'The repeated section of a song that contains the main hook',
  VERSE:'The varying lyrical section of a song between choruses',BRIDGE:'A contrasting section linking parts of a song',

  // ── Countries ─────────────────────────────────────────────────────────────
  FRANCE:'The country with the Eiffel Tower and the world\'s most visited museum',BRAZIL:'Largest country in South America, home of the Amazon rainforest',
  JAPAN:'An island nation in East Asia known for sushi and samurai',CHINA:'The world\'s most populous country and home of the Great Wall',
  INDIA:'A vast South Asian country with incredible cultural diversity',EGYPT:'North African country of pyramids and the River Nile',
  KENYA:'East African country famous for its wildlife safaris',PERU:'South American home of Machu Picchu and the Inca Empire',
  CHILE:'A long narrow country stretching down South America\'s Pacific coast',MEXICO:'North American country with ancient Mayan and Aztec heritage',
  CANADA:'The world\'s second largest country, known for maple syrup and hockey',RUSSIA:'The world\'s largest country by land area',
  ITALY:'A boot-shaped European country famous for pasta and Renaissance art',SPAIN:'An Iberian European country famous for flamenco and tapas',
  GREECE:'Southern European country, birthplace of democracy and the Olympics',TURKEY:'A country linking Europe and Asia — also a large bird eaten at Thanksgiving',
  POLAND:'A Central European country with a resilient history',SWEDEN:'A Scandinavian country famous for IKEA and ABBA',
  NORWAY:'A Scandinavian country of fjords and the Northern Lights',DENMARK:'A Scandinavian country and home of Lego and fairy tales',
  FINLAND:'A Nordic country with more saunas than cars',PORTUGAL:'A small Western European country that once had a vast empire',
  AUSTRIA:'A Central European country famous for Mozart and the Alps',BELGIUM:'A small country famous for waffles, chocolate and EU institutions',
  NIGERIA:'The most populous country in Africa',GHANA:'A West African nation, first sub-Saharan African country to gain independence',
  SENEGAL:'A West African country on the Atlantic coast',MOROCCO:'A North African country with colourful souks and the Sahara',
  IRAN:'A Middle Eastern country with one of the world\'s oldest civilisations',IRAQ:'A Middle Eastern country containing ancient Mesopotamia',
  CUBA:'A Caribbean island nation known for cigars, salsa and vintage cars',HAITI:'A Caribbean island nation sharing Hispaniola with the Dominican Republic',
  BOLIVIA:'A landlocked South American country with the world\'s highest capital',ECUADOR:'A South American country crossed by the Equator',
  COLOMBIA:'A South American country famous for coffee and biodiversity',VIETNAM:'A long S-shaped country in Southeast Asia',
  THAILAND:'Southeast Asian country famous for its temples and street food',NEPAL:'A Himalayan country home to eight of the world\'s ten tallest mountains',
  BHUTAN:'A tiny Himalayan kingdom that measures Gross National Happiness',ANGOLA:'A large oil-rich country on the southwest coast of Africa',

  // ── Science ───────────────────────────────────────────────────────────────
  ATOM:'The smallest unit of a chemical element',CELL:'The basic structural unit of all living organisms',
  GENE:'A segment of DNA that codes for a specific trait',VIRUS:'A microscopic pathogen that replicates inside living cells',
  PHOTON:'A particle of light with no mass',PROTON:'A positively charged particle in an atom\'s nucleus',
  NEUTRON:'An electrically neutral particle in an atom\'s nucleus',ELECTRON:'A negatively charged particle orbiting an atom\'s nucleus',
  PLASMA:'The fourth state of matter — an ionised gas',LASER:'A device that emits concentrated coherent light',
  MAGNET:'An object that produces a magnetic field',PRISM:'A transparent shape that splits white light into a spectrum',
  ENZYME:'A biological catalyst that speeds up chemical reactions',PROTEIN:'A complex molecule essential for the structure of all living cells',
  CARBON:'The element fundamental to all known life on Earth',OXYGEN:'The gas essential for breathing and combustion',
  HYDROGEN:'The lightest and most abundant element in the universe',NITROGEN:'The gas making up 78% of Earth\'s atmosphere',
  CALCIUM:'The mineral that makes up bones and teeth',SODIUM:'The metallic element in common table salt',
  EROSION:'The gradual wearing away of rock or soil by natural forces',
  SEISMIC:'Relating to earthquake vibrations through the Earth',THERMAL:'Relating to heat and temperature',
  KINETIC:'The energy an object has due to its motion',FRICTION:'The force resisting motion between two surfaces in contact',
  MOMENTUM:'The product of an object\'s mass and velocity',
  VELOCITY:'Speed in a specified direction',CATALYST:'A substance that speeds up a chemical reaction without being consumed',
  POLYMER:'A long chain molecule made from repeating smaller units',
  COMPOUND:'A substance made of two or more elements chemically combined',ELEMENT:'A pure substance made of only one type of atom',
  ISOTOPE:'Atoms of the same element with different numbers of neutrons',REACTION:'A chemical process that transforms substances into new ones',
  FUSION:'Joining atomic nuclei together, releasing enormous energy',FISSION:'Splitting an atomic nucleus apart, releasing enormous energy',
  OSMOSIS:'The movement of water through a membrane from low to high concentration',DIFFUSION:'The spreading of particles from high to low concentration',

  // ── Mythology ─────────────────────────────────────────────────────────────
  ZEUS:'King of the Greek gods, ruler of Mount Olympus, god of thunder',HERA:'Greek goddess of marriage and queen of the gods',
  APOLLO:'Greek god of the sun, music and prophecy',ATHENA:'Greek goddess of wisdom, war strategy and crafts',
  ARES:'Greek god of war and violence',HERMES:'Greek messenger god, patron of travellers and thieves',
  POSEIDON:'Greek god of the sea, earthquakes and horses',HADES:'Greek god of the underworld and the dead',
  THOR:'Norse god of thunder who wields the hammer Mjolnir',ODIN:'The Allfather — chief god of Norse mythology',
  LOKI:'The Norse trickster god and shape-shifter',FREYA:'Norse goddess of love, beauty and war',
  OSIRIS:'Egyptian god of the afterlife, death and resurrection',ISIS:'Egyptian goddess of magic, motherhood and healing',
  ANUBIS:'Egyptian god of embalming with the head of a jackal',HORUS:'Egyptian sky god depicted with the head of a falcon',
  BRAHMA:'The Hindu god of creation',VISHNU:'The Hindu preserver and protector of the universe',
  SHIVA:'The Hindu god of destruction and transformation',MEDUSA:'A Greek monster whose gaze turned onlookers to stone',
  HYDRA:'A many-headed serpent from Greek mythology — cut one head off and two grow back',SPHINX:'A creature with a human head and lion\'s body that posed riddles',
  MINOTAUR:'A Greek monster — half man, half bull — trapped in the Labyrinth',CENTAUR:'A creature from Greek myth with a human upper body and horse lower body',
  PHOENIX:'A mythical bird that burns and is reborn from its own ashes',DRAGON:'A fire-breathing mythical creature with wings and scales',
  UNICORN:'A mythical horse with a single spiralling horn on its forehead',GRIFFIN:'A mythical creature with an eagle\'s head and a lion\'s body',
  KRAKEN:'A legendary colossal sea monster of Scandinavian myth',TITAN:'A powerful deity in Greek myth — also Saturn\'s largest moon with a thick atmosphere',
  ATLAS:'The Titan condemned to hold up the heavens on his shoulders',HERCULES:'The greatest hero of Greek mythology, famous for twelve labours',
  ACHILLES:'The near-invulnerable Greek hero of the Trojan War, vulnerable only at his heel',CYCLOPS:'A one-eyed giant from Greek mythology',
  SIREN:'Mythical sea creatures whose singing lured sailors to their doom',MERMAID:'A mythical creature — half woman, half fish',
  VAMPIRE:'A legendary undead creature that drinks blood and avoids sunlight',WEREWOLF:'A person said to transform into a wolf at the full moon',

  // ── Technology ────────────────────────────────────────────────────────────
  LAPTOP:'A portable personal computer with a built-in screen',TABLET:'A flat touchscreen computer between phone and laptop',
  ROUTER:'A device that directs internet traffic between networks',SERVER:'A powerful computer that stores and serves data to other machines',
  PIXEL:'The smallest individual element in a digital image',
  CURSOR:'The movable pointer on a computer screen',BROWSER:'A program used to navigate the internet',
  NETWORK:'A system of interconnected computers sharing data',PROGRAM:'A set of instructions that tells a computer what to do',
  CIRCUIT:'A complete path through which electricity flows',SENSOR:'A device that detects and responds to physical stimuli',
  BATTERY:'A device that stores chemical energy and releases it as electricity',DISPLAY:'The screen showing visual output from a device',
  KEYBOARD:'The input device with keys for typing',MONITOR:'An external display screen for a computer',
  CAMERA:'A device that captures images or video',PRINTER:'A device that transfers digital content onto paper',
  SCANNER:'A device that converts physical documents into digital files',MODEM:'A device that connects a computer to the internet',
  SWITCH:'A networking device that connects devices within a network',CABLE:'A wire that transmits data or electricity',
  WIRELESS:'Transmitting data through the air without physical cables',DIGITAL:'Information represented as a series of numbers (binary)',
  BINARY:'The number system using only 0 and 1 — the language of computers',CODING:'Writing instructions for computers in programming languages',
  SCRIPT:'A program or set of instructions written in a scripting language',COMPILE:'Converting human-readable code into machine-executable form',
  DEBUG:'Finding and fixing errors in a computer program',CACHE:'Temporary high-speed storage to speed up repeated operations',
  KERNEL:'The core of an operating system managing hardware and software',FIREWALL:'A security system that monitors and controls network traffic',
  ENCRYPT:'Converting data into a coded form only authorised users can read',DECRYPT:'Converting encrypted data back into its original readable form',
  UPLOAD:'Sending data from your device to a remote server',
  DOWNLOAD:'Receiving data from a remote server to your device',BACKUP:'A copy of data made to prevent loss in case of failure',
  RESTORE:'Returning a system or file to a previous state from a backup',REBOOT:'Restarting a computer system to apply changes or fix issues',

  // ── Ocean ─────────────────────────────────────────────────────────────────
  WAVE:'A moving ridge of water on the surface of the ocean',
  TIDE:'The rise and fall of the sea caused by the Moon\'s gravity',
  CURRENT:'A directed flow of water in the ocean',ABYSS:'The deepest part of the ocean floor',
  TRENCH:'A long narrow deep valley on the ocean floor',KELP:'Tall fast-growing seaweed that forms underwater forests',
  PLANKTON:'Microscopic organisms that drift in water and form the base of the food chain',JELLYFISH:'A gelatinous ocean creature with stinging tentacles',
  OCTOPUS:'An intelligent eight-armed cephalopod that can change colour',SEAHORSE:'A small upright fish where the male carries the young',
  STARFISH:'A five-armed echinoderm that can regrow lost arms',CRAB:'A sideways-walking crustacean with claws',
  SQUID:'A fast-moving cephalopod with ten tentacles',
  CLAM:'A bivalve mollusc that filters water through its shell',
  MUSSEL:'A dark-shelled bivalve mollusc attached to rocks',URCHIN:'A spiny echinoderm that grazes on algae',
  NARWHAL:'An Arctic whale with a long spiral tusk',MANATEE:'A slow gentle sea mammal sometimes called a sea cow',
  WALRUS:'A large Arctic pinniped with huge tusks',SEAL:'A streamlined marine mammal that rests on land',
  ANCHOR:'A heavy device that holds a ship in place on the seabed',SHIP:'A large ocean-going vessel',
  SUBMARINE:'A watercraft that can operate underwater',LIGHTHOUSE:'A tower with a bright light guiding ships safely to shore',
  BUOY:'A floating marker on the water showing safe navigation routes',HARBOR:'A sheltered body of water where ships dock',
  MARINA:'A dock or basin for small recreational boats',ESTUARY:'Where a river meets the sea, mixing fresh and salt water',
  ATOLL:'A ring-shaped coral island surrounding a lagoon',
  SHOAL:'A shallow area of water, or a large group of fish',CREST:'The top of a wave',
  SPRAY:'Fine droplets of water thrown into the air by waves',SURF:'Breaking waves close to the shore',

  // ── History ───────────────────────────────────────────────────────────────
  EMPIRE:'A group of nations ruled by a single supreme authority',DYNASTY:'A sequence of rulers from the same family',
  PHARAOH:'An ancient Egyptian king who was considered a god',KNIGHT:'An armoured medieval warrior — the K is silent',
  CASTLE:'A large fortified medieval residence — the T is silent',SIEGE:'A military blockade to force surrender of a town or fort',
  BATTLE:'An armed conflict between two opposing forces',TREATY:'A formal agreement between two nations',
  REVOLT:'An uprising of people against their rulers',COLONY:'A territory settled by people from another country',
  CRUSADE:'A medieval Christian military expedition to the Holy Land',PYRAMID:'A monumental ancient Egyptian stone tomb',
  FORUM:'The central public meeting place of an ancient Roman city',SENATE:'The governing council of ancient Rome — or modern nations',
  LEGION:'A division of the Roman army comprising thousands of soldiers',FEUDAL:'Relating to the medieval system of lords, vassals and serfs',
  PLAGUE:'A deadly infectious disease epidemic, like the Black Death',FAMINE:'A severe shortage of food causing widespread starvation',
  MONARCH:'A hereditary ruler such as a king, queen or emperor',REPUBLIC:'A state governed by elected representatives, not a monarch',
  SCROLL:'An ancient roll of papyrus or parchment used as a document',RELIC:'An object surviving from the distant past',
  ARTIFACT:'A human-made object of historical or cultural significance',RUIN:'The remains of a destroyed or collapsed ancient structure',
  TEMPLE:'An ancient building dedicated to religious worship',SHRINE:'A sacred site or structure dedicated to a holy figure',
  TOMB:'A burial chamber or monument for the dead — the B is silent',BURIAL:'The ritual placing of a deceased person in a grave',
  GLADIATOR:'A professional fighter who battled in ancient Roman arenas',COLOSSEUM:'The ancient Roman amphitheatre where gladiatorial contests were held',
  CATAPULT:'An ancient siege weapon that launches heavy projectiles',ARMOUR:'Protective clothing worn in battle — British spelling with the U',
  SHIELD:'A hand-held defence used to block attacks in combat',SWORD:'A bladed weapon with a long cutting edge — the W is silent',
  SPEAR:'A long-shafted weapon with a pointed tip',THRONE:'The royal seat of a monarch',
  CROWN:'A ceremonial headpiece worn by monarchs',SCEPTRE:'A ceremonial staff held by a ruler as a symbol of power',
  CHARTER:'A formal written document granting rights or defining rules',DECREE:'An official order issued by a ruler or government',

  // ── Emotions ──────────────────────────────────────────────────────────────
  HAPPY:'Feeling pleasure and contentment',SAD:'Feeling unhappy or sorrowful',
  ANGRY:'Feeling strong displeasure or hostility',CALM:'Peaceful and free from agitation — the L is silent',
  SCARED:'Feeling frightened or alarmed by danger',BRAVE:'Facing danger without fear',
  PROUD:'Feeling satisfaction from your own or others\' achievements',ASHAMED:'Feeling guilt or embarrassment over something done',
  LONELY:'Feeling sad because of being alone or isolated',JOYFUL:'Feeling great happiness and delight',
  GRIEF:'Deep sorrow, especially after losing someone you love',LOVE:'A deep and strong feeling of affection',
  HATE:'Feeling intense dislike or hostility towards something',ENVY:'Wanting what someone else has',
  HOPE:'Feeling that something good will happen in the future',FEAR:'An unpleasant emotion caused by the threat of danger',
  TRUST:'A firm belief in someone\'s reliability or honesty',DISGUST:'A strong feeling of revulsion or disapproval',
  SURPRISE:'A sudden feeling of wonder or shock at the unexpected',BORED:'Feeling uninterested and restless',
  CURIOUS:'Eager to learn and find out more about something',EXCITED:'Feeling great enthusiasm and eagerness',
  NERVOUS:'Feeling anxious and worried about something upcoming',RELAXED:'Free from tension and anxiety',
  CONTENT:'Feeling satisfied with what you have',MISERABLE:'Feeling extremely unhappy and distressed',
  ELATED:'Feeling ecstatically happy and triumphant',FURIOUS:'Extremely angry — beyond ordinary anger',
  ANXIOUS:'Feeling worry and unease about what might happen',SERENE:'Calm, peaceful and untroubled',
  CONFUSED:'Unable to think clearly or understand something',SHOCKED:'Feeling sudden great distress or surprise',
  AMUSED:'Finding something funny or entertaining',GRATEFUL:'Feeling thankful for something received',
  GUILTY:'Feeling responsible for a wrong or offence committed',REGRET:'Feeling sad or sorry about something done or not done',
  NOSTALGIC:'A sentimental longing for the past',HOPEFUL:'Feeling optimistic that things will turn out well',
  DESPERATE:'Feeling that the situation is hopeless — often misspelled "desparate"',PEACEFUL:'Free from disturbance or conflict',

  // ── Tricky audio words ────────────────────────────────────────────────────
  KNEEL:'To go down on one or both knees — the K is silent',
  KNACK:'A natural skill or talent — the K is silent',KNAVE:'A dishonest or unscrupulous man — the K is silent',
  KNOB:'A rounded lump or handle — the K is silent',KNIFE:'A sharp cutting blade — the K is silent',
  KNIT:'To make fabric from yarn with needles — the K is silent',KNOCK:'To strike a surface sharply — the K is silent',
  KNOT:'A fastening made by tying — the K is silent',KNEW:'Past tense of "know" — the K is silent',
  KNUCKLE:'The bony joint of a finger — the K is silent',KNAPSACK:'A bag carried on the back — the K is silent',
  WRAP:'To cover something completely — the W is silent',WRITE:'To mark symbols on a surface — the W is silent',
  WRIST:'The joint connecting hand to arm — the W is silent',WRONG:'Not correct — the W is silent',
  WRECK:'The destruction of something — the W is silent',WREN:'A tiny brown songbird — the W is silent',
  WRATH:'Extreme anger — the W is silent',WRENCH:'A tool for gripping and turning — the W is silent',
  WRESTLE:'To grapple and struggle against — the W is silent',WRINKLE:'A small fold in skin or fabric — the W is silent',
  GNOME:'A small mythical creature or garden ornament — the G is silent',GNAT:'A tiny biting insect — the G is silent',
  GNAW:'To bite or chew persistently — the G is silent',
  THUMB:'The short thick first digit of the hand — the B is silent',
  CLIMB:'To go up using hands and feet — the B is silent',COMB:'A toothed instrument for hair — the B is silent',
  CRUMB:'A tiny fragment of bread — the B is silent',BOMB:'An explosive device — the B is silent',
  LIMB:'An arm, leg, or large branch — the B is silent',NUMB:'Unable to feel sensation — the B is silent',
  WOMB:'The organ where babies develop — the B is silent',
  PLUMB:'To measure the depth of something — the B is silent',DEBT:'Money owed — the B is silent',
  DOUBT:'Feeling uncertain — the B is silent',SUBTLE:'So slight as to be hard to detect — the B is silent',
  DUMB:'Unable to speak; also means stupid (informal) — the B is silent',
  WHISTLE:'A shrill sound made by forcing air through lips — the T is silent',
  BUSTLE:'Hurried and energetic activity — the T is silent',HUSTLE:'To push or jostle someone — the T is silent',
  THISTLE:'A prickly plant with purple flowers — the T is silent',BRISTLE:'A short stiff hair or fibre — the T is silent',
  FASTEN:'To attach firmly — the T is silent',LISTEN:'To give attention to sound — the T is silent',
  SOFTEN:'To make less hard or harsh — the T is silent',OFTEN:'Many times — the T is usually silent',
  GLISTEN:'To shine with reflected light — the T is silent',MOISTEN:'To make slightly wet — the T is silent',
  HASTEN:'To hurry — the T is silent',
  HOUR:'A period of sixty minutes — the H is silent',GHOST:'The spirit of a dead person — the H is silent',
  HONEST:'Truthful and free from deceit — the H is silent',HEIR:'Someone who inherits — the H is silent',
  RHYME:'Words that end with the same sound — the H is silent',
  SCENE:'The place where something happens — the C is silent',SCENT:'A distinctive smell — the C is silent',
  SCIENCE:'The systematic study of the world through observation — the C is silent',SCISSORS:'A cutting tool with two blades — the C is silent',
  MUSCLE:'A body tissue that produces movement — the C is silent',DESCEND:'To go downward — the C is silent',
  ASCEND:'To go upward — the C is silent',CRESCENT:'The curved shape of a waxing or waning moon — the C is silent',
  AUTUMN:'The season between summer and winter — the N is silent',COLUMN:'A vertical pillar — the N is silent',
  SOLEMN:'Very serious and dignified — the N is silent',HYMN:'A song of praise — the N is silent',
  DAMN:'To strongly criticise — the N is silent',CONDEMN:'To express strong disapproval — the N is silent',
  LIGHT:'The opposite of dark — the GH is silent',NIGHT:'The period of darkness between sunset and sunrise — the GH is silent',
  FIGHT:'A physical or verbal struggle — the GH is silent',MIGHT:'Great strength or power — the GH is silent',
  RIGHT:'Correct; also the opposite of left — the GH is silent',SIGHT:'The ability to see — the GH is silent',
  TIGHT:'Firmly held or fixed — the GH is silent',FLIGHT:'Travelling through the air — the GH is silent',
  BRIGHT:'Giving out a strong light — the GH is silent',FRIGHT:'A sudden strong fear — the GH is silent',
  DAUGHTER:'A female child — the GH is silent',SLAUGHTER:'The killing of large numbers — the GH is silent',
  THOUGHT:'Something considered in the mind — the GH is silent',BOUGHT:'Past tense of "buy" — the GH is silent',
  CAUGHT:'Past tense of "catch" — the GH is silent',TAUGHT:'Past tense of "teach" — the GH is silent',
  NAUGHT:'Nothing; zero — the GH is silent',DROUGHT:'A prolonged period without rain — the GH is silent',
  PSALM:'A sacred song — the P is silent',PSYCHE:'The mind or soul — the P is silent',
  RECEIPT:'Proof of payment — the P is silent',
  PALM:'The inner surface of the hand — the L is silent',
  HALF:'One of two equal parts — the L is silent',WALK:'To move at a steady pace — the L is silent',
  TALK:'To speak — the L is silent',CHALK:'A soft white limestone — the L is silent',
  COULD:'Past tense ability — the L is silent',WOULD:'Expressing intention — the L is silent',
  SHOULD:'Expressing obligation — the L is silent',FOLK:'People or a social group — the L is silent',
  YOLK:'The yellow part of an egg — the L is silent',
  ALMOND:'A nutritious tree nut — the L is silent',
  ANSWER:'A reply to a question — the W is silent',
  YACHT:'An elegant sailing vessel — the CH is silent',
  ACHE:'A dull persistent pain — the CH sounds like K',CHAOS:'Complete disorder — the CH sounds like K',
  CHROME:'A shiny metallic coating — the CH sounds like K',ECHO:'A reflected sound — the CH sounds like K',
  EXHAUST:'To use up completely; also the fumes from an engine — the H is silent',STOMACH:'The digestive organ — the CH sounds like K',
  TOUGH:'Strong and resilient — rhymes with "stuff"',ROUGH:'Not smooth — rhymes with "stuff"',
  ENOUGH:'As much as needed — rhymes with "stuff"',COUGH:'Forcing air from the lungs noisily — rhymes with "off"',
  THROUGH:'From one side to the other — rhymes with "brew"',ALTHOUGH:'Even though — rhymes with "low"',
  THOROUGH:'Complete and attentive to detail — rhymes with "burrow"',BOROUGH:'A town or urban district — rhymes with "burrow"',
  DOUGH:'Uncooked bread mixture — rhymes with "low"',THOUGH:'Despite the fact that — rhymes with "low"',
  PLOUGH:'To turn over soil — rhymes with "cow"',BOUGH:'A large branch of a tree — rhymes with "cow"',
  SOUGHT:'Past tense of "seek" — rhymes with "hot"',FOUGHT:'Past tense of "fight" — rhymes with "hot"',
  BROUGHT:'Past tense of "bring" — rhymes with "hot"',OUGHT:'Should do something — rhymes with "hot"',
  NOUGHT:'Nothing; zero — rhymes with "hot"',
  COLOUR:'The British spelling of color — the U is added',FAVOUR:'The British spelling of favor — the U is added',
  HONOUR:'The British spelling of honor — the U is added',HUMOUR:'The British spelling of humor — the U is added',
  LABOUR:'The British spelling of labor — the U is added',NEIGHBOUR:'The British spelling of neighbor — the U is added',
  RUMOUR:'The British spelling of rumor — the U is added',VAPOUR:'The British spelling of vapor — the U is added',
  BEHAVIOUR:'The British spelling of behavior — the U is added',ENDEAVOUR:'The British spelling of endeavor — the U is added',
  FLAVOUR:'The British spelling of flavor — the U is added',GLAMOUR:'Fascinating appeal — the British spelling retains the U',
  HARBOUR:'A sheltered body of water — British spelling with the U',PARLOUR:'A sitting room — British spelling with the U',
  RIGOUR:'Strictness and thoroughness — British spelling with the U',SAVOUR:'To taste with great enjoyment — British spelling with the U',
  SPLENDOUR:'Impressive beauty — British spelling with the U',VALOUR:'Great courage in battle — British spelling with the U',
  VIGOUR:'Physical or mental strength — British spelling with the U',
  REALISE:'British spelling of "realize" — ends in -ise not -ize',ORGANISE:'British spelling of "organize" — ends in -ise not -ize',
  RECOGNISE:'British spelling of "recognize" — ends in -ise not -ize',APOLOGISE:'British spelling of "apologize" — ends in -ise not -ize',
  EMPHASISE:'British spelling of "emphasize" — ends in -ise not -ize',ADVERTISE:'To promote a product — ends in -ise',
  ADVISE:'To give a recommendation — ends in -ise not -ize',ANALYSE:'British spelling of "analyze" — ends in -yse not -yze',
  EXERCISE:'Physical activity for health — ends in -ise',REVISE:'To review and correct — ends in -ise',

  OCCASION:'A special event or ceremony — double C and single S',NECESSARY:'Cannot be done without — one C and double S',
  TOMORROW:'The day after today — double M and double R',ADDRESS:'Where someone lives — double D and double S',
  AGGRESSIVE:'Forceful and assertive — double G and double S',APPRECIATE:'To value greatly — double P',
  BEGINNING:'The start of something — double G',BROCCOLI:'A green vegetable — double C and double L',
  COLLEAGUE:'A fellow worker — double L and GUE ending',COMMITTEE:'A group formed to make decisions — double M, double T, double E',
  CONSCIENCE:'A moral sense of right and wrong — double C and SC',DISAPPEAR:'To become invisible — double P',
  DISAPPOINT:'To fail to meet expectations — double P',EMBARRASS:'To cause someone discomfort — double R and double S',
  EXAGGERATE:'To overstate something — double G',EXCELLENT:'Extremely good — double L',
  GUARANTEE:'A formal promise or assurance — the UA combination trips people up',IMMEDIATELY:'Without any delay — double M and double E',
  INTERRUPT:'To stop something briefly — double R',MILLENNIUM:'A thousand years — double L, double N',
  MISSPELL:'To spell incorrectly — double S (it\'s mis + spell)',OCCURRENCE:'An event or incident — double C, double R',
  PARALLEL:'Lines equidistant and never meeting — double L twice',POSSESSION:'Ownership — double S twice',
  RECOMMEND:'To suggest as suitable — single C and double M',RESISTANCE:'The act of opposing a force — single S',
  SEPARATE:'To divide — people often misspell it "seperate"',
  SUCCEED:'To achieve a goal — double C and double E',UNNECESSARY:'Not needed — double N and double S',
  VACUUM:'An empty space — the UU combination is unusual',WEIRD:'Strange or unusual — remember: "weird" is weird itself',
  RECEIVE:'To get or accept something — I before E except after C',ACHIEVE:'To successfully reach a goal — IE after CH',
  BELIEVE:'To accept as true — I before E',CEILING:'The upper interior surface of a room — E before I after C',
  DECEIVE:'To make someone believe something false — I before E after C exception',NIECE:'A brother\'s or sister\'s daughter — I before E',
  THIEF:'A person who steals — I before E',YIELD:'To produce or give way — I before E',
  DEFINITELY:'Without any doubt — often misspelled "definately"',
  ENVIRONMENT:'The natural world around us — often misspelled "enviroment"',GOVERNMENT:'The system by which a state is governed — often misspelled "goverment"',
  HUMOROUS:'Causing amusement — often misspelled "humourous"',IRRESISTIBLE:'Too tempting to refuse — often misspelled with an "a"',
  MISCHIEVOUS:'Causing trouble playfully — often misspelled "mischievious"',OCCASIONALLY:'From time to time — double C and double S',
  RESTAURANT:'A place where meals are served — the silent AU trips people up',SCHEDULE:'A plan of times and events — the SCH sounds like SK',
  STRENGTH:'Physical or mental power — the NGTH cluster is tricky',TWELFTH:'The ordinal of twelve — the F before TH is often missed',
  WEDNESDAY:'The day between Tuesday and Thursday — the D is silent',ABSENCE:'Not being present — often misspelled "absense"',
  CALENDAR:'A system of organising time — often misspelled "calender"',CONSCIENTIOUS:'Very thorough and careful — triple silent letter challenge',
  CURIOSITY:'A strong desire to know — from curious but drops the U',DILEMMA:'A situation with two equally difficult choices — double M',
  DISCIPLINE:'Training that corrects behaviour — the SC is tricky',EXPERIENCE:'Knowledge gained by doing — often misspelled "experiance"',
  FASCINATING:'Extremely interesting — often misspelled with a double S',FEBRUARY:'The second month — the R is often skipped in speech',
  FOREIGN:'Coming from another country — the I before GN is tricky',HEIGHT:'How tall something is — EI not IE in this case',
  INDEPENDENT:'Not relying on others — the middle E is often dropped',INTELLIGENT:'Having a high mental capacity — double L',
  LANGUAGE:'A system of communication — the GU cluster',LITERATURE:'Written works of creative value — middle A often dropped',
  MAINTENANCE:'The process of keeping something in good condition — from maintain but the I changes',MARRIAGE:'A legally recognised union — double R',
  MEDICINE:'A substance used to treat illness — often misspelled "medecine"',NOTICEABLE:'Easy to notice — keeps the E before -able',
  ORIGINAL:'Existing from the beginning — often misspelled "origional"',PERSEVERANCE:'Continued effort despite difficulties — often misspelled "perserverence"',
  PHYSICAL:'Relating to the body — PH sounds like F',PRIVILEGE:'A special right or advantage — often misspelled "priviledge"',
  QUESTIONNAIRE:'A list of questions for survey — double N',QUEUE:'A line of waiting people — four silent letters at the end',
  RIDICULOUS:'Absurdly unreasonable — often misspelled "rediculous"',SENSITIVE:'Easily affected by external stimuli — often misspelled "sensative"',
  SERGEANT:'A military or police rank — hidden EA in the middle',SIMILAR:'Almost the same — often misspelled "simalar"',
  SINCERELY:'Genuinely and honestly — often misspelled "sincerly"',SPECIFIC:'Particular and clearly defined — the SC',
  TECHNIQUE:'A way of doing something — the QUE ending',TEMPERATURE:'A measure of heat — often misspelled "tempreture"',
  TONGUE:'The muscle in the mouth — the GUE ending',TRAGEDY:'A very sad event or story — often misspelled "tradgedy"',
  TRULY:'In a truthful way — drops the E from "true"',

  // ── Animals (DEF-20 / DEF-24 additions) ──────────────────────────────────
  CROW:'A highly intelligent all-black bird known for problem-solving',
  FROG:'A small amphibian that leaps and lives near water',
  TOAD:'A warty amphibian related to the frog, mostly lives on land',
  SWAN:'A large graceful white waterbird with a long elegant neck',
  DUCK:'A common waterbird with a flat bill and webbed feet',
  NEWT:'A small semi-aquatic salamander with a long tail',
  VOLE:'A small rodent resembling a mouse, often found in meadows',
  MINK:'A semi-aquatic carnivore prized for its dense fur',
  CRANE:'A tall long-legged wading bird that migrates vast distances',
  HERON:'A tall wading bird that stands motionless to catch fish',
  RAVEN:'A large all-black bird associated with intelligence and mystery',
  DINGO:'A wild dog native to Australia',
  TAPIR:'A pig-like mammal with a short flexible snout, native to tropical regions',
  OKAPI:'A forest animal related to the giraffe, with zebra-striped legs',
  GECKO:'A small lizard that can walk on ceilings with sticky adhesive feet',
  QUAIL:'A small plump ground-dwelling game bird',
  BONGO:'A large striped antelope of African rainforests',
  DONKEY:'A domesticated equid widely used as a working animal',
  LIZARD:'A scaly reptile with four legs and a long tail',
  MAGPIE:'A black-and-white bird famous for collecting shiny objects',
  FERRET:'A domesticated carnivore historically used for rabbit hunting',
  GOPHER:'A burrowing rodent of North American grasslands',
  WEASEL:'A small sleek carnivore with a long slender body',
  THRUSH:'A songbird known for its melodious song and spotted breast',
  GIBBON:'A small long-armed ape that swings rapidly through rainforest trees',
  BABOON:'A large ground-dwelling primate with a prominent muzzle',
  IMPALA:'A graceful African antelope capable of remarkable leaps',
  JACKAL:'A small omnivorous canine of Africa and Asia',
  GAZELLE:'A slender swift antelope found across Africa and Asia',
  CARIBOU:'The North American name for the reindeer',
  AXOLOTL:'A neotenic salamander from Mexico that keeps its larval features into adulthood',
  OSTRICH:'The world\'s largest bird — flightless but a fast runner',
  WALLABY:'A smaller relative of the kangaroo, native to Australia',
  VULTURE:'A large bird of prey that feeds on dead animals',
  CAPYBARA:'The world\'s largest rodent, native to South American wetlands',
  ANTELOPE:'A swift grazing mammal of Africa and Asia',
  MONGOOSE:'A small quick predator famous for killing venomous snakes',
  AARDVARK:'A nocturnal African mammal that eats ants and termites with a long tongue',
  REINDEER:'A cold-climate deer used by Sámi people and associated with Santa Claus',
  MANDRILL:'The world\'s largest monkey, famous for its vivid red and blue face',
  PARAKEET:'A small colourful parrot popular as a pet',
  PHEASANT:'A long-tailed game bird with brilliant plumage',
  SQUIRREL:'A bushy-tailed rodent that stores nuts for winter',
  CHIPMUNK:'A small striped ground squirrel with chubby food-storing cheeks',
  PARTRIDGE:'A plump ground-dwelling game bird — as in "a partridge in a pear tree"',
  GREYHOUND:'The fastest dog breed, built for racing',
  KINGFISHER:'A vivid blue-and-orange bird that dives to catch fish',
  ALLIGATOR:'A large armoured reptile with a rounded snout, found in the Americas',
  PORCUPINE:'A rodent covered in sharp protective quills',
  CROCODILE:'A large armoured reptile with a pointed snout, found in Africa and Asia',
  ORANGUTAN:'A red-haired great ape of Southeast Asian rainforests',
  CHAMELEON:'A lizard famous for changing colour and moving each eye independently',
  WOLVERINE:'The largest member of the weasel family — fierce and powerful',
  ALBATROSS:'A huge seabird with the longest wingspan of any bird',
  RHINOCEROS:'A large thick-skinned mammal with one or two horns on its nose',
  CHIMPANZEE:'Our closest living relative — a great ape of African forests',
  WOODPECKER:'A bird that hammers into tree bark with its strong beak to find insects',
  MOCKINGBIRD:'A bird famous for mimicking the calls of many other species',
  HUMMINGBIRD:'The tiniest bird — can hover in mid-air while drinking nectar',
  CATERPILLAR:'The larva of a butterfly or moth, famous for its transformation',
  HIPPOPOTAMUS:'The third-largest land animal — a massive semi-aquatic African herbivore',

  // ── Colours (DEF-20 / DEF-24 additions) ──────────────────────────────────
  BUFF:'A dull yellowish-beige like undyed leather',
  ECRU:'A pale creamy-white like unbleached linen',
  FAWN:'A light yellowish-brown like a young deer\'s coat',
  WINE:'A deep red-purple like red wine',
  BONE:'An off-white like dried bone',
  SAGE:'A soft grey-green like the herb\'s leaves',
  PUCE:'A brownish-purple — the name means "flea" in French',
  DOVE:'A soft pale grey like a dove\'s feathers',
  SAND:'A pale yellowish-beige like dry beach sand',
  ADOBE:'A warm earthy reddish-brown like sun-dried mud bricks',
  BLOND:'A pale golden-yellow like fair hair',
  BRASS:'A warm golden-yellow like the metal alloy',
  BRICK:'A deep reddish-orange like a fired clay brick',

  DENIM:'A medium blue-grey like cotton jeans fabric',
  KHAKI:'A dusty yellow-brown like military field uniform',
  MAIZE:'A golden yellow like dried corn',
  MOCHA:'A warm brownish tone like coffee with milk',
  SEPIA:'A warm brown used in old photography',
  SLATE:'A dark blue-grey like roof slates',
  SMOKE:'A pale grey with a subtle blue tint',
  STRAW:'A pale yellow like dried straw',
  WHEAT:'A warm golden-yellow like ripe wheat fields',
  BISQUE:'A warm pinkish-beige like unglazed pottery',
  AUBURN:'A reddish-brown colour, especially of hair',
  CANARY:'A bright vivid yellow like the small songbird',
  CELERY:'A pale yellowish-green like celery stalks',
  COPPER:'A warm reddish-orange like the metal',
  FALLOW:'A pale yellowish-brown — also describes unplanted farmland',
  JASPER:'A deep brownish-red like the opaque gemstone',
  ORCHID:'A soft pinkish-purple like the exotic flower',
  SORREL:'A reddish-brown like the horse coat or herb',
  SUNSET:'A warm blend of orange, red and pink like a setting sun',
  SAFFRON:'A vivid golden-yellow like the prized spice',
  EMERALD:'A deep vivid green like the precious gemstone',
  VANILLA:'A very pale creamy-yellow like vanilla ice cream',
  MUSTARD:'A dark dull yellow like the condiment',

  BURGUNDY:'A dark purplish-red like Burgundy wine from France',
  CHESTNUT:'A deep reddish-brown like the nut',
  EGGSHELL:'A slightly off-white with a subtle sheen like a hen\'s egg',
  MIDNIGHT:'A very deep dark blue like the night sky at its darkest',
  AQUAMARINE:'A blue-green like shallow tropical seawater',
  CHARTREUSE:'A vivid yellow-green like the French liqueur',
  PERIWINKLE:'A delicate blue-violet like the small coastal flower',
  ULTRAMARINE:'A rich deep blue historically made from lapis lazuli',
  MULTICOLORED:'Displaying many different colours at once',

  // ── Food (DEF-20 / DEF-24 additions) ─────────────────────────────────────
  BEET:'A deep-red root vegetable also known as beetroot',
  CORN:'A yellow grain grown on cobs — a staple crop worldwide',
  KALE:'A dark leafy green vegetable packed with nutrients',
  LAMB:'A young sheep or its tender meat — the B is silent',
  LEEK:'A mild onion-family vegetable with a long white stalk',
  MINT:'A fragrant herb used in teas, sauces and sweets',
  PEAR:'A sweet teardrop-shaped fruit that grows on trees',
  TOFU:'A protein-rich food made from pressed curdled soya milk',
  BASIL:'A fragrant herb essential to Italian cooking and pesto',
  CHILI:'A hot spicy pepper used in cooking worldwide',
  CREPE:'A thin light French pancake served sweet or savoury',
  CURRY:'A richly spiced dish popular across South Asian cooking',
  PESTO:'An Italian sauce of basil, pine nuts, garlic and olive oil',
  THYME:'A small aromatic herb used in Mediterranean cooking',
  TOAST:'Bread that has been browned by dry heat',
  CASHEW:'A curved kidney-shaped nut with a creamy mild flavour',
  COFFEE:'A hot beverage brewed from roasted ground coffee beans',
  FENNEL:'An anise-flavoured vegetable and aromatic herb',
  LENTIL:'A small flat legume widely used in soups and stews',
  NUTMEG:'A warm spice made from the seed of a tropical tree',
  RADISH:'A small peppery root vegetable often eaten raw in salads',
  TURNIP:'A round white root vegetable with a peppery flavour',
  WALNUT:'A rich wrinkled nut with a distinctive brain-like shape',
  BARLEY:'A cereal grain used in bread, beer and hearty soups',
  ANCHOVY:'A small oily saltwater fish often used as a pizza topping',
  CHEDDAR:'A firm yellow English cheese with a sharp tangy flavour',
  CHORIZO:'A spicy cured pork sausage from Spain or Portugal',
  GRANOLA:'A crunchy breakfast cereal of oats, nuts and honey',
  LETTUCE:'A leafy green vegetable used as the base for salads',
  PARSLEY:'A bright green herb used to garnish and flavour dishes',
  EGGPLANT:'A large purple vegetable also known as aubergine',
  MEATBALL:'A ball of minced meat cooked in sauce or baked',
  SANDWICH:'A filling placed between two slices of bread',
  COLESLAW:'A creamy salad of shredded cabbage and carrots',
  TORTILLA:'A thin flat Mexican bread made from corn or wheat flour',
  FOCACCIA:'A flat Italian olive oil bread often topped with herbs',
  PORRIDGE:'A warm breakfast dish of oats cooked in milk or water',
  SMOOTHIE:'A blended drink made from fruit, yogurt or milk',
  CINNAMON:'A warm sweet spice from the inner bark of a tropical tree',
  CROISSANT:'A buttery flaky French pastry shaped like a crescent',
  MARMALADE:'A bittersweet preserve made from citrus fruit and peel',
  ARTICHOKE:'A thistle-like vegetable with edible fleshy leaves and a prized heart',
  BLUEBERRY:'A small dark blue berry with a sweet tangy flavour',
  CHOCOLATE:'A sweet food made from cacao beans — one of the world\'s favourites',
  STRAWBERRY:'A bright red heart-shaped summer berry',
  CHEESECAKE:'A creamy dessert with a biscuit base and rich cheese filling',
  MINESTRONE:'A hearty Italian vegetable and pasta soup',
  BRUSCHETTA:'Grilled Italian bread rubbed with garlic and topped with tomatoes',
  GINGERBREAD:'A spiced cake or biscuit flavoured with ginger and molasses',
  POMEGRANATE:'A red fruit filled with hundreds of juicy jewel-like edible seeds',
  MARSHMALLOW:'A soft pillowy sweet made from sugar and gelatine',
  BUTTERSCOTCH:'A rich golden toffee flavour made from butter and brown sugar',

  // ── Nature (DEF-20 / DEF-24 additions) ───────────────────────────────────
  CRAG:'A steep rugged mass of rock projecting from a cliff or hillside',
  GLEN:'A narrow mountain valley, especially in Scotland or Ireland',
  MOOR:'An open treeless upland covered in heather and peat bog',
  PEAK:'The pointed summit of a mountain',
  SOIL:'The top layer of earth where plants grow',
  MIST:'A thin layer of water droplets suspended in the air',
  GUST:'A sudden brief burst of strong wind',
  HAIL:'Frozen rain falling as pellets of ice',
  LAVA:'Molten rock that erupts from a volcano and flows across the surface',
  MESA:'A flat-topped hill with steep sides, found in arid regions',
  BAYOU:'A slow-moving marshy waterway found in the southern USA',
  BIRCH:'A slender deciduous tree with distinctive white papery bark',
  CHASM:'A deep steep-sided fissure or opening in the earth',
  GORGE:'A narrow valley with steep rocky walls carved by a river',
  GROVE:'A small cluster of trees growing together',
  HEATH:'Open flat land covered in heather and low scrubby plants',
  RIDGE:'A long narrow raised crest of land or mountain spine',
  SHORE:'The land at the edge of the sea, lake or river',
  SLOPE:'Ground tilted at an angle — the side of a hill or mountain',
  CANOPY:'The uppermost layer of a forest, formed by the treetops',
  CAVERN:'A large natural underground cave',
  GROTTO:'A small picturesque cave, often found near water',
  JUNGLE:'Dense tropical forest tangled with vegetation',
  RAPIDS:'A fast-flowing turbulent section of a river',
  RAVINE:'A deep narrow gorge carved by running water',
  STEPPE:'A vast flat treeless grassy plain of Central Asia',
  SUMMIT:'The highest point of a mountain',
  VORTEX:'A whirling mass of water or air — like a whirlpool or tornado',
  HABITAT:'The natural environment where a particular species lives and thrives',
  ICEBERG:'A massive floating mass of ice broken from a glacier',
  PLATEAU:'A large area of elevated flat land',
  SEASIDE:'The area beside the sea',
  WETLAND:'Low-lying land where the soil is permanently saturated with water',
  HIGHLAND:'An area of elevated mountainous terrain',
  SEDIMENT:'Material — sand, silt or clay — deposited by water, wind or ice',
  SEASHORE:'The land along the edge of the sea',
  SANDSTORM:'A violent desert wind carrying dense clouds of sand',
  SHORELINE:'The line where land meets a body of water',
  EARTHQUAKE:'A sudden violent shaking of the ground caused by tectonic movement',
  WILDERNESS:'A wild and uncultivated region largely untouched by humans',
  COUNTRYSIDE:'Rural land and landscape outside towns and cities',
  THUNDERCLAP:'A single loud crack of thunder',
  UNDERGROWTH:'Dense plants and shrubs growing beneath a forest canopy',
  THUNDERSTORM:'A storm accompanied by lightning and thunder',
  MOUNTAINSIDE:'The sloping face of a mountain',

  // ── Music (DEF-20 / DEF-24 additions) ────────────────────────────────────
  BEAT:'The basic rhythmic pulse underlying a piece of music',
  FLAT:'A note lowered by a semitone — marked with the ♭ symbol',
  NOTE:'A single sound at a specific musical pitch',
  TUNE:'A recognisable sequence of musical notes; a melody',
  DUET:'A musical piece performed by two players or singers',
  REST:'A notated period of silence between musical notes',
  ALBUM:'A collection of songs released together as a single recording',
  DISCO:'A dance music genre that dominated the 1970s with a driving four-four beat',
  DRONE:'A sustained single note held beneath a changing melody',
  FORTE:'A musical direction meaning to play loudly — marked with f',
  LYRIC:'The words written for a song',
  MINOR:'A musical scale with a darker, sadder quality',
  MAJOR:'A musical scale with a bright, uplifting quality',
  PITCH:'How high or low a musical note sounds',
  SHARP:'A note raised by a semitone — marked with the ♯ symbol',
  VIOLA:'A bowed string instrument slightly larger than a violin',
  STANZA:'A verse in a poem or song — a group of lines forming a unit',
  TIMBRE:'The distinctive tone quality that identifies a voice or instrument',
  ANTHEM:'A song of loyalty or celebration — like a national anthem',
  CHORAL:'Relating to or written for a choir',
  STEREO:'Sound reproduced through two channels for a fuller spatial effect',
  MEDLEY:'A piece combining several different songs played one after another',
  SOPRANO:'The highest vocal range in classical music',
  QUARTET:'A group of four musicians or a piece written for four performers',
  RECITAL:'A solo or small-group musical performance, often in a formal setting',
  REFRAIN:'A repeated lyrical phrase in a song — also called the hook',
  CADENCE:'A harmonic progression that gives a sense of arrival or resolution',
  CONCERT:'A live musical performance given before an audience',
  OVERTURE:'An orchestral introduction to an opera, musical or ballet',
  MANDOLIN:'A small plucked string instrument with a rounded back',
  OPERETTA:'A light entertaining opera with spoken dialogue and dancing',
  ACOUSTIC:'Referring to natural sound or instruments that are not electronically amplified',
  CLASSICAL:'The tradition of Western art music from roughly 1750–1820',
  MODULATION:'Changing from one musical key to another within a composition',
  PERCUSSION:'The family of instruments played by striking, shaking or scraping',
  MUSICOLOGY:'The academic study of music — its history, theory and cultural context',
  XYLOPHONE:'A percussion instrument with wooden bars struck by mallets',
  ACCORDION:'A squeezebox instrument played by pressing keys and pumping bellows',
  SAXOPHONE:'A single-reed woodwind instrument invented by Adolphe Sax',
  CONDUCTOR:'The person who leads an orchestra or choir, often using a baton',
  MICROPHONE:'A device that converts sound into electrical signals for recording or amplification',
  TAMBOURINE:'A hand drum with pairs of small metal cymbals around its frame',
  KETTLEDRUM:'A large bowl-shaped drum tuned to a specific pitch — also called timpani',
  SYNTHESIZER:'An electronic instrument that generates and shapes sound digitally',
  COMPOSITION:'A musical work created and written by a composer',
  PERFORMANCE:'A live presentation of music in front of an audience',
  PHILHARMONIC:'Relating to a symphony orchestra devoted to performing classical music',

  // ── Countries (DEF-20 / DEF-24 additions) ────────────────────────────────
  CHAD:'A landlocked country in north-central Africa',
  FIJI:'A Pacific island nation of over 300 volcanic and coral islands',
  LAOS:'A landlocked Southeast Asian country on the Mekong River',
  MALI:'A vast landlocked country in West Africa, home of ancient Timbuktu',
  OMAN:'An Arab country on the southeastern tip of the Arabian Peninsula',
  TOGO:'A small West African country with a coast on the Gulf of Guinea',
  BENIN:'A West African country once the centre of the powerful Kingdom of Dahomey',
  LIBYA:'A vast North African country, mostly covered by the Sahara Desert',
  NAURU:'The world\'s smallest island nation, in the Pacific Ocean',
  NIGER:'A large landlocked Saharan country in West Africa',
  PALAU:'A Pacific island nation famous for its extraordinary marine biodiversity',
  QATAR:'A small but very wealthy Gulf state on the Arabian Peninsula',
  SAMOA:'A Polynesian island nation known for its traditional culture and tattooing',
  TIMOR:'A small island nation in Southeast Asia, also known as Timor-Leste',
  TONGA:'A Polynesian kingdom of around 170 islands in the Pacific',
  YEMEN:'An Arab country at the southern tip of the Arabian Peninsula',
  ISRAEL:'A Middle Eastern country at the crossroads of three world religions\' holy sites',
  JORDAN:'A Middle Eastern country home to the ancient rose-red city of Petra',
  KUWAIT:'A small oil-rich Gulf state on the Persian Gulf',
  LATVIA:'A Baltic state in Northern Europe bordering the Baltic Sea',
  MALAWI:'A small landlocked country in southeastern Africa known as the Warm Heart of Africa',
  PANAMA:'A Central American country famous for its canal linking two oceans',
  RWANDA:'A small densely populated East African country called the Land of a Thousand Hills',
  SERBIA:'A landlocked country in the Western Balkans of southeastern Europe',
  TAIWAN:'A self-governing island in East Asia with a distinct identity from mainland China',
  ZAMBIA:'A landlocked southern African country home to part of Victoria Falls',
  ALBANIA:'A small Balkan country on the Adriatic coast of southeastern Europe',
  ALGERIA:'The largest country in Africa by area, mostly covered by the Sahara',
  ARMENIA:'A small ancient landlocked country in the South Caucasus',
  BURUNDI:'One of the world\'s most densely populated small countries, in central Africa',
  CROATIA:'A country on the stunning Adriatic coast of southeastern Europe',
  ESTONIA:'A Baltic country known as one of the world\'s most digitally advanced nations',
  GERMANY:'A large Central European country — the biggest economy in Europe',
  HUNGARY:'A landlocked Central European country on the Danube River',
  ICELAND:'A volcanic Nordic island nation of geysers and the Northern Lights',
  IRELAND:'An Atlantic island country known as the Emerald Isle',
  ROMANIA:'A southeastern European country home to Transylvania and Dracula\'s castle',
  UKRAINE:'A large Eastern European country — the largest country entirely within Europe',
  BOTSWANA:'A landlocked southern African country famous for the Okavango Delta',
  CAMBODIA:'A Southeast Asian country home to the spectacular temples of Angkor Wat',
  CAMEROON:'A Central African country sometimes called "Africa in miniature"',
  ETHIOPIA:'An East African country — one of the oldest independent nations on Earth',
  HONDURAS:'A Central American country in the heart of the ancient Mayan world',
  MALAYSIA:'A Southeast Asian country spanning the Malay Peninsula and northern Borneo',
  MONGOLIA:'A vast landlocked country between China and Russia with a rich nomadic heritage',
  SLOVAKIA:'A small Central European country in the heart of the Carpathian Mountains',
  TANZANIA:'An East African country home to Mount Kilimanjaro and the Serengeti',
  ZIMBABWE:'A southern African country famous for its share of Victoria Falls',
  ARGENTINA:'South America\'s second largest country, famous for tango, steak and Patagonia',
  INDONESIA:'The world\'s largest archipelago nation — over 17,000 islands in Southeast Asia',
  SINGAPORE:'A tiny prosperous city-state island at the southern tip of the Malay Peninsula',
  VENEZUELA:'A South American country with the world\'s highest waterfall, Angel Falls',
  AUSTRALIA:'The world\'s sixth largest country — also an entire continent',
  MADAGASCAR:'A huge Indian Ocean island with extraordinary wildlife found nowhere else on Earth',
  MOZAMBIQUE:'A southeastern African country with a long Indian Ocean coastline',
  BANGLADESH:'A densely populated South Asian country in the Ganges-Brahmaputra delta',
  LUXEMBOURG:'One of Europe\'s smallest and wealthiest countries, landlocked in Western Europe',
  AFGHANISTAN:'A landlocked Central Asian country between Iran and Pakistan',
  SWITZERLAND:'A small landlocked Alpine country famous for mountains, chocolate and banking',
  PHILIPPINES:'A Southeast Asian archipelago of over 7,000 tropical islands',
  TURKMENISTAN:'A Central Asian desert country on the ancient Silk Road',
  GUATEMALA:'A Central American country with spectacular ancient Mayan ruins',
  NICARAGUA:'The largest country in Central America',
  MAURITIUS:'A small volcanic island nation in the Indian Ocean east of Madagascar',

  // ── Science (DEF-20 / DEF-24 additions) ──────────────────────────────────
  ACID:'A corrosive substance that has a pH below 7',
  BOND:'A chemical connection between atoms that holds a molecule together',
  HEAT:'A form of energy transferred between objects of different temperatures',
  LENS:'A curved transparent object that bends light — used in optics and cameras',
  MASS:'The total amount of matter contained in an object',
  SALT:'An ionic compound typically formed from an acid and a base',
  WATT:'The SI unit of power, named after Scottish inventor James Watt',
  ALLOY:'A material made by combining two or more metals',
  CLONE:'A genetically identical copy of an organism',
  DECAY:'The gradual breakdown of a substance — also radioactive emission over time',
  INERT:'Chemically unreactive — not prone to combining with other substances',
  LIPID:'A class of fat molecules essential for cell membranes and energy storage',
  METAL:'An element that conducts electricity and heat and has a lustrous surface',
  NERVE:'A fibre bundle that transmits electrical signals in the nervous system',
  OXIDE:'A compound formed when an element bonds with oxygen',
  PHASE:'A distinct state of matter — solid, liquid, gas or plasma',
  QUARK:'A fundamental particle that combines to form protons and neutrons',
  CHARGE:'An electrical property of matter — either positive or negative',
  COSMIC:'Relating to the universe and phenomena beyond Earth\'s atmosphere',
  IMMUNE:'Resistant to a particular disease due to the body\'s defence mechanisms',
  MATTER:'Everything that has mass and occupies space',
  METRIC:'Relating to the decimal system of measurement based on metres',
  NEURON:'A specialised cell that transmits electrical impulses through the nervous system',
  OPTICS:'The branch of physics dealing with the behaviour of light',
  RADIUS:'The distance from the centre to the circumference of a circle',
  THEORY:'A well-tested explanation of a natural phenomenon supported by evidence',
  VECTOR:'A quantity that has both magnitude and direction, like velocity or force',
  BIOLOGY:'The science of living organisms and their vital processes',
  CLIMATE:'The long-term average pattern of weather in a region',
  DENSITY:'The mass of a substance per unit of volume',
  ENTROPY:'A measure of disorder or randomness within a thermodynamic system',
  FORMULA:'A symbolic representation of a chemical compound or mathematical relationship',
  INERTIA:'An object\'s tendency to resist changes to its state of motion',
  NUCLEAR:'Relating to the nucleus of an atom and the energy it releases',
  QUANTUM:'The smallest discrete unit of a physical quantity, such as energy',
  SILICON:'A semiconductor element fundamental to electronics and computing chips',
  SPECIES:'A group of organisms that share characteristics and can interbreed',
  MOLECULE:'The smallest unit of a substance that retains its chemical properties',
  MUTATION:'A permanent change in the DNA sequence of an organism',
  PARTICLE:'A tiny piece of matter — an atom, molecule, electron or photon',
  PATHOGEN:'A microorganism such as a virus or bacterium that causes disease',
  PRESSURE:'The force applied per unit area on a surface',
  SPECTRUM:'The range of electromagnetic radiation, including the rainbow of visible light',
  TAXONOMY:'The scientific discipline of classifying and naming living organisms',
  APPARATUS:'The equipment and instruments used in a scientific experiment',
  ELECTRODE:'A conductor through which electricity enters or exits a substance',
  MICROWAVE:'Short-wavelength electromagnetic radiation — also used for cooking',
  METABOLISM:'All the chemical reactions that sustain life within an organism',
  CHROMOSOME:'A thread-like structure of DNA and protein carrying genetic information',
  HYPOTHESIS:'A testable prediction made before conducting an experiment',
  EVAPORATION:'The process by which a liquid turns into vapour',
  CIRCULATION:'The continuous movement of blood around the body or fluid in a system',
  CONDENSATION:'The process by which vapour cools and turns into liquid',
  CONSERVATION:'The principle that energy and matter cannot be created or destroyed',

  // ── Mythology (DEF-20 / DEF-24 additions) ────────────────────────────────
  EPIC:'A long heroic poem or narrative of legendary deeds',
  FATE:'The force believed to predetermine the course of events in a person\'s life',
  MYTH:'A traditional story explaining the origins of the world or natural phenomena',
  RUNE:'A character in ancient Germanic alphabets, used for writing and divination',
  SAGA:'A long Norse account of the legendary deeds of heroes and gods',
  CIRCE:'The sorceress in Homer\'s Odyssey who transformed men into animals',
  CURSE:'A supernatural affliction calling down misfortune on a person or place',
  DEITY:'A god or goddess worshipped in a religion or mythology',
  GIANT:'A being of immense size — a common figure in mythology and folklore',
  MAGIC:'Supernatural power used to influence events — central to myth and legend',
  NYMPH:'A minor female spirit of nature — forest, water or mountain — in Greek myth',
  TROLL:'A supernatural creature from Scandinavian folklore, often monstrous and slow',
  WITCH:'A practitioner of magic — often associated with dark powers in folklore',
  ELFIN:'Resembling a delicate magical elf',
  JANUS:'The Roman god of beginnings, doorways and transitions, depicted with two faces',
  AETHER:'The pure divine essence filling the heavens in Greek cosmology',
  CHIRON:'The wise and learned centaur who tutored Achilles and Hercules in Greek myth',
  CLOTHO:'One of the three Fates who spun the thread of life in Greek mythology',
  KRONOS:'The supreme Titan ruler of time in Greek mythology and father of Zeus',
  NEREID:'A sea nymph — one of 50 daughters of the sea god Nereus in Greek myth',
  SELENE:'The Greek goddess of the Moon who drove her chariot across the night sky',
  TRITON:'A Greek sea god and son of Poseidon, depicted blowing a conch shell horn',
  TYPHON:'The most fearsome monster in Greek mythology — a giant serpentine being',
  ARTEMIS:'Greek goddess of the hunt, the Moon and the wilderness',
  BACCHUS:'The Roman god of wine and festivity — equivalent to the Greek Dionysus',
  CALYPSO:'The nymph who kept Odysseus on her island for seven years in the Odyssey',
  DEMETER:'Greek goddess of the harvest, grain and the seasons',
  FORTUNE:'The Roman goddess Fortuna who governed luck, fate and prosperity',
  SORCERY:'The use of magic — especially dark or forbidden magic in myths and stories',
  CHIMERA:'A fire-breathing monster with a lion\'s head, goat\'s body and serpent\'s tail',
  CERBERUS:'The three-headed dog that guarded the entrance to the Greek underworld',
  DAEDALUS:'The craftsman who built the Labyrinth and made wings of wax and feathers',
  DIONYSUS:'Greek god of wine, festivity, ecstasy and theatre',
  GANYMEDE:'The most beautiful mortal in Greek myth, abducted by Zeus to serve as cup-bearer',
  ODYSSEUS:'The cunning hero of Homer\'s Odyssey who wandered for ten years trying to reach home',
  ANDROMEDA:'The princess chained to a rock and rescued by the hero Perseus in Greek myth',
  EXCALIBUR:'The legendary magical sword of King Arthur',
  LABYRINTH:'The intricate maze built by Daedalus to contain the Minotaur',
  APHRODITE:'Greek goddess of love, beauty and desire',
  PERSEPHONE:'The Greek goddess who spends half the year in the underworld — explaining winter',
  PROMETHEUS:'The Titan who stole fire from the gods and gave it to humanity',
  UNDERWORLD:'The realm of the dead in Greek, Roman and other ancient mythologies',
  THUNDERBOLT:'Zeus\'s signature weapon — a lightning bolt hurled from the heavens',
  BELLEROPHON:'The Greek hero who rode Pegasus and slew the monstrous Chimera',
  SHAPESHIFTER:'A mythological being that can change its physical form at will, like Loki',
  LEGENDARY:'Celebrated in ancient myths and stories — of extraordinary and enduring fame',
  SACRIFICE:'An offering — often an animal — made to a deity in ancient religious ritual',
  IMMORTALS:'Beings that live for ever — gods and certain blessed heroes in mythology',
  HEPHAESTUS:'Greek god of fire, metalworking and the forge — the divine craftsman',
  ENCHANTMENT:'A magical spell or charm that transforms or captivates its subject',

  // ── Technology (DEF-20 / DEF-24 additions) ────────────────────────────────
  BYTE:'A unit of digital information consisting of eight bits',
  CHIP:'A tiny integrated circuit etched onto a slice of semiconductor',
  CODE:'Instructions written in a programming language to tell a computer what to do',
  PORT:'A socket for connecting peripherals — or a number identifying a network service',
  DISK:'A storage device for reading and writing digital data',
  BAUD:'A unit measuring signal changes per second in data transmission',
  BOOT:'To start up a computer and load its operating system',
  FILE:'A named collection of data stored on a computer',
  HACK:'To gain unauthorised access to a computer system',
  HOST:'A computer or server that provides resources to other devices on a network',
  ICON:'A small image on a screen representing a file, app or function',
  LINK:'A clickable reference connecting one web page or document to another',
  NODE:'A device connected to a network — such as a computer, router or server',
  PING:'A network test that checks whether a remote host is reachable',
  SYNC:'To synchronise data between two devices or systems',
  ARRAY:'A data structure holding multiple values in an ordered sequence',
  AUDIT:'A systematic review of a computer system, code or security setup',
  CODEC:'Software that encodes and decodes digital audio or video data',
  CRASH:'When a program or operating system stops working unexpectedly',
  FETCH:'To retrieve data from a server or memory location',
  LAYER:'A distinct level in a network protocol stack or software architecture',
  LOGIN:'The process of authenticating yourself to access a computer system',
  MACRO:'A recorded set of instructions that automates repetitive tasks',
  PROXY:'An intermediary server that handles requests on behalf of a client',
  STACK:'A set of technologies used together — or a last-in-first-out data structure',
  BUFFER:'Temporary memory used to hold data while it is being transferred',
  COMMIT:'In version control, saving a permanent snapshot of code changes to a repository',
  DEPLOY:'To release and install software onto a server or production environment',
  ENCODE:'To convert data into a specific format for transmission or storage',
  FILTER:'A process that selects or transforms data according to defined rules',
  MODULE:'A self-contained unit of code that performs a specific function',
  BACKEND:'The server-side part of an application that users do not directly see',
  CLUSTER:'A group of related things — servers in computing, stars or galaxies in astronomy',
  CONSOLE:'A text-based interface for entering commands directly to a computer',
  DATASET:'A structured collection of data used for analysis or machine learning',
  EXECUTE:'To run a program or command on a computer',
  RUNTIME:'The period when a program is executing — or the environment that supports it',
  DATABASE:'An organised collection of structured data stored and accessed electronically',
  ENCODING:'The process of converting information into a particular format',
  HARDWARE:'The physical components that make up a computer system',
  SOFTWARE:'The programs and operating systems that run on computer hardware',
  TEMPLATE:'A pre-designed file used as a starting point for creating new content',
  ALGORITHM:'A step-by-step procedure for solving a problem or performing a task',
  BLUETOOTH:'A short-range wireless standard for connecting devices without cables',
  INTERFACE:'The point of interaction between a user and a device or software system',
  PROCESSOR:'The central chip of a computer that fetches and executes instructions',
  BANDWIDTH:'The maximum rate at which data can be transmitted over a network connection',
  JAVASCRIPT:'A programming language used to make websites interactive and dynamic',
  SMARTPHONE:'A mobile phone with a full operating system and internet capabilities',
  TRANSISTOR:'A semiconductor device that amplifies or switches electrical signals',
  PROGRAMMING:'The art and process of writing instructions in code to create software',
  COMPRESSION:'Reducing the size of a file by encoding its data more efficiently',
  TOUCHSCREEN:'A display that responds directly to finger touch instead of a keyboard',
  CRYPTOGRAPHY:'The science of securing communication using codes and ciphers',
  FRAMEWORK:'A reusable software platform that provides structure for building applications',
  MICROCHIP:'A miniaturised electronic circuit on a thin slice of silicon',
  FILESYSTEM:'The method an operating system uses to organise and store files',

  // ── Ocean (DEF-20 / DEF-24 additions) ────────────────────────────────────
  BAIT:'Food placed on a hook to attract fish',
  COVE:'A small sheltered bay set into a coastline',
  FOAM:'The frothy mass of bubbles formed by breaking waves',
  GILL:'The breathing organ of a fish that extracts oxygen from water',
  HOOK:'A curved metal device used to catch fish',
  HULL:'The main body and shell of a ship or boat',
  KEEL:'The central structural beam running along the bottom of a vessel',
  PIER:'A raised platform extending over water used for landing or strolling',
  RAFT:'A flat floating structure made from logs or inflatable material',
  SAIL:'A sheet of fabric that catches the wind to propel a vessel',
  TERN:'A sleek seabird related to gulls, renowned for long migrations',
  WAKE:'The trail of disturbed water left behind a moving vessel',
  ALGAE:'Simple aquatic plant-like organisms that form the base of many food chains',
  BEACH:'A strip of sand or pebbles at the edge of the sea',
  CONCH:'A large spiral-shelled sea snail whose shell can be used as a horn',
  COAST:'The land along the edge of the sea',
  DEPTH:'The distance measured downward from the surface of water',
  FLUKE:'A whale\'s tail fin — or the flat triangular part of an anchor',
  HAVEN:'A safe sheltered anchorage or harbour',
  KAYAK:'A narrow lightweight boat paddled with a double-bladed paddle',
  MANTA:'A huge graceful ray that glides through the open ocean',
  PRAWN:'A small edible marine crustacean similar to a shrimp',
  SCUBA:'Self-Contained Underwater Breathing Apparatus — used for diving',
  SWELL:'A long smooth rolling wave moving across open ocean',
  BRINE:'Water heavily saturated with salt, like the sea',
  MARLIN:'A large fast-swimming ocean fish prized in big-game fishing',
  PUFFER:'A fish that inflates into a spiky ball when threatened — also highly toxic',
  FATHOM:'A unit of water depth equal to six feet — also means to understand fully',
  BREEZE:'A gentle refreshing wind blowing off the sea',
  DINGHY:'A small open sailing or rowing boat',
  ABYSSAL:'Relating to the deepest zones of the ocean below 4,000 metres',
  COASTAL:'Situated near or relating to a coastline',
  FLOTSAM:'Wreckage or floating debris washed from a ship',
  GALLEON:'A large multi-decked sailing warship used from the 15th to 18th centuries',
  MARINER:'A sailor or seafarer who navigates the open ocean',
  PELAGIC:'Relating to the open ocean far from the seabed or shore',
  SEAWEED:'Marine algae that grows in the sea or is washed onto the shore',
  BARNACLE:'A crustacean that cements itself permanently to rocks and ship hulls',
  NAUTILUS:'A deep-sea cephalopod with a beautiful chambered spiral shell',
  SEAGRASS:'Flowering underwater plants growing in shallow coastal waters',
  STINGRAY:'A flat cartilaginous fish with a long whip-like venomous tail',
  ANCHORAGE:'A sheltered place where ships can safely drop anchor',
  DRIFTWOOD:'Wood carried by ocean currents and washed ashore',
  FISHERMAN:'A person who catches fish as an occupation or sport',
  SHELLFISH:'Aquatic animals with a protective shell — including crabs and molluscs',
  SWORDFISH:'A large fast predatory fish with a long flat bill used to slash prey',
  HAMMERHEAD:'A shark with a distinctive wide flat head shaped like a hammer',
  UNDERWATER:'Beneath the surface of the water',
  CONTINENTAL:'Relating to a continent — as in the continental shelf underwater',
  CRUSTACEANS:'The group of hard-shelled animals including crabs, lobsters and shrimps',
  ARCHIPELAGO:'A group or chain of islands scattered across an area of sea',
  OCEANOGRAPHY:'The scientific study of the physical and biological aspects of the oceans',

  // ── History (DEF-20 / DEF-24 additions) ──────────────────────────────────
  ARCH:'A curved structure of stone or brick spanning an opening',
  CLAN:'A close-knit group of families sharing a common ancestor',
  COIN:'A stamped disc of metal used as currency',
  OATH:'A solemn promise, often sworn before a ruler or deity',
  SERF:'A feudal peasant bound by law to work on a lord\'s land',
  WALL:'A stone or brick defensive barrier — like the Great Wall of China',
  WRIT:'A formal written order issued by a court or sovereign',
  TORC:'A twisted metal neck ring worn by ancient Celtic and Norse peoples',
  ABBEY:'A monastery or convent governed by an abbot or abbess',
  AGORA:'The central public marketplace and meeting place of an ancient Greek city',
  COURT:'The monarch\'s household and advisors — or a place of law and justice',
  EDICT:'An official proclamation carrying the force of law',
  ENVOY:'A diplomat or official representative sent between rulers or nations',
  EPOCH:'A distinct period of time defined by its characteristics or events',
  EXILE:'Being expelled from one\'s homeland as a form of punishment',
  MANOR:'The principal house and estate of a feudal lord',
  REALM:'A kingdom or domain ruled by a sovereign monarch',
  TRIBE:'A social group united by ancestry, language and shared customs',
  BANNER:'A flag or cloth bearing the emblem of a lord or medieval kingdom',
  BEACON:'A signal fire lit on a hilltop to warn of danger or mark celebrations',
  BISHOP:'A senior clergyman overseeing a diocese — a powerful figure in medieval politics',
  CENSUS:'An official systematic count of a population',
  HERALD:'An official messenger and announcer for a medieval lord or king',
  LANCER:'A cavalry soldier armed with a long lance',
  PALACE:'The grand official residence of a monarch or head of state',
  PILLAR:'An upright column supporting a structure',
  PORTAL:'A grand ceremonial entrance doorway',
  TYRANT:'A ruler who exercises power in a cruel and unjust manner',
  DUNGEON:'A dark underground prison cell beneath a medieval castle',
  EMPEROR:'The supreme ruler of an empire — of higher rank than a king',
  EMPRESS:'A female ruler of an empire or the wife of an emperor',
  KINGDOM:'A state or country governed by a king or queen',
  PASSAGE:'A narrow route or corridor — also a portion of a historical document',
  TRIBUTE:'Payment or submission offered by one state to a more powerful ruler',
  WARRIOR:'An experienced and skilled fighter in battle or warfare',
  CONQUEST:'The act of taking control of a place or people by military force',
  FORTRESS:'A large and heavily fortified military stronghold',
  HERITAGE:'The history, traditions and values passed down through generations',
  MONUMENT:'A structure built to commemorate a person, event or era',
  PROVINCE:'An administrative division of a country or empire',
  ANCESTRAL:'Relating to or inherited from one\'s distant ancestors',
  CHRONICLE:'A factual historical account of events written in chronological order',
  SOVEREIGN:'A supreme ruler — a king, queen or emperor',
  DEMOCRACY:'A system of government in which people elect their representatives',
  REVOLUTION:'A sudden dramatic overthrow of an existing government or social order',
  PARLIAMENT:'The supreme legislative body of government in many countries',
  EXCAVATION:'The careful archaeological digging up of buried historical remains',
  RENAISSANCE:'The European cultural revival of art and learning from the 14th–17th centuries',
  ARCHAEOLOGY:'The study of human history through the excavation and analysis of artefacts',
  MESOPOTAMIA:'The ancient civilisation between the Tigris and Euphrates rivers — the cradle of civilisation',
  CIVILIZATION:'An advanced human society with developed culture, writing, law and technology',
  COLONIZATION:'The establishment of political control by one nation over another territory',
  HISTORICAL:'Relating to past events or the study of history',
  LIBERATION:'The act of freeing a people from foreign occupation or oppression',
  OCCUPATION:'The military control and governance of a territory by a foreign power',
  IMPERIALISM:'A policy of extending national power by conquering or controlling other territories',

  // ── Emotions (DEF-20 / DEF-24 additions) ─────────────────────────────────
  BOLD:'Willing to take risks and act with confidence',
  COOL:'Calm and composed — or fashionably relaxed',
  GLAD:'Feeling pleased and happy',
  GRIM:'Stern and serious — or without hope',
  KIND:'Having a warm generous nature and genuine concern for others',
  MEEK:'Quiet, gentle and reluctant to assert yourself',
  RAGE:'Violent and uncontrollable anger',
  SAFE:'Free from danger — feeling protected and secure',
  SMUG:'Excessively self-satisfied and pleased with yourself',
  WARM:'Showing friendly affection and care for the people around you',
  WILD:'Feeling uncontrolled, unrestrained and intensely alive',
  AGONY:'Extreme physical or mental suffering',
  ALOOF:'Emotionally distant and not very warm or interested',
  BLISS:'Perfect happiness and profound joy',
  EAGER:'Strongly desiring to do something — enthusiastic and ready',
  GIDDY:'Lightheadedly excited and happy',
  MOODY:'Subject to frequent changes of mood — often sulky or irritable',
  SORRY:'Feeling regret, sympathy or remorse',
  STOIC:'Enduring pain or hardship without showing emotion',
  TIMID:'Shy, hesitant and easily frightened',
  WEARY:'Feeling deep tiredness from prolonged effort or stress',
  BITTER:'Resentful and hurt by a sense of unfair treatment',
  CHEERY:'Strikingly happy and optimistic in manner',
  DOCILE:'Easily managed and accepting of instruction without resistance',
  FEISTY:'Spirited and determined — ready to stand up for yourself',
  GENTLE:'Mild and calm in manner — kind and tender',
  GRUMPY:'Bad-tempered and easily annoyed',
  HUMBLE:'Having a modest and unpretentious view of yourself',
  MELLOW:'Relaxed and good-humoured — pleasantly calm',
  PLACID:'Calmly peaceful and not easily upset',
  TENDER:'Gentle and loving — sensitive and affectionate',
  BASHFUL:'Reluctant to draw attention to yourself — shyly modest',
  DEVOTED:'Deeply loyal and loving — wholeheartedly dedicated to another',
  ELATION:'Great happiness and a feeling of triumphant excitement',
  FORLORN:'Pitifully sad and abandoned — utterly without hope',
  PATIENT:'Able to accept delays and difficulties without becoming upset',
  SMITTEN:'Suddenly and deeply in love with someone',
  WISTFUL:'Feeling a quiet and gentle longing for something past or out of reach',
  ZEALOUS:'Having great energy and fervent enthusiasm in pursuing a cause',
  CAREFREE:'Free from worry or anxiety — enjoying life without a care',
  CHEERFUL:'Visibly happy and optimistic',
  DEJECTED:'Feeling sad, dispirited and low in morale',
  ECSTATIC:'Feeling overwhelming happiness and exhilaration',
  HOPELESS:'Feeling or inspiring complete despair — without any hope',
  JUBILANT:'Feeling great joy and triumph',
  THRILLED:'Feeling intense excitement and delight',
  DEPRESSED:'Experiencing prolonged deep unhappiness and loss of hope',
  FULFILLED:'Feeling satisfied and complete — having achieved what you set out to do',
  IRRITATED:'Slightly annoyed and impatient with something',
  MELANCHOLY:'A deep and persistent sadness — pensive and sorrowful',
  VULNERABLE:'Exposed to the risk of emotional or physical harm',
  PASSIONATE:'Feeling intense enthusiasm or deep emotion',
  OVERWHELMED:'Completely overcome by an emotion or situation',
  EMBARRASSED:'Feeling awkward and self-conscious in a social situation',
  HEARTBROKEN:'Suffering intense grief — usually from loss or rejection',
  APPREHENSIVE:'Anxious and uneasy about something that might happen',
  DISHEARTENED:'Having lost confidence, hope or enthusiasm',

  // ── Sports (DEF-20 / DEF-24 additions) ───────────────────────────────────
  LUGE:'A winter sliding sport where competitors race feet-first on a small sled',
  SUMO:'Japanese wrestling where the aim is to push your opponent out of the ring',
  CHESS:'A strategy board game on an 8×8 grid — widely recognised as a mind sport',
  SKEET:'A clay-target shooting discipline where discs are flung into the air',
  KENDO:'A Japanese martial art of fencing practised with bamboo swords',
  RELAY:'A team race where members take turns to run or swim a section each',
  RODEO:'An American competition featuring cowboy skills like bull riding and lassoing',
  SPRINT:'A short-distance running race at maximum speed',
  DISCUS:'An athletics field event throwing a heavy circular disc for distance',
  RACING:'Competitive speed events — includes motorsport, horse racing and more',
  AIKIDO:'A Japanese martial art using throws and joint locks to redirect force',
  SLALOM:'A skiing or whitewater race weaving through a series of marked gates',
  JOCKEY:'A professional rider who races horses in competitions',
  HURLING:'An ancient Irish field sport played with a wooden stick and small ball',
  PARKOUR:'The urban discipline of moving rapidly through an environment by jumping and vaulting',
  REGATTA:'A boat race or series of races on water',
  HURDLES:'An athletics race where competitors sprint and jump over a series of barriers',
  HUNTING:'Tracking and pursuing wild animals as a field sport',
  FISHING:'Catching fish with a line and hook as a recreational or commercial activity',
  CANOEING:'Paddling an open-top canoe as a competitive or recreational water sport',
  DRESSAGE:'A precise equestrian sport in which horse and rider perform choreographed movements',
  SHOOTING:'A competitive accuracy sport using rifles, pistols or shotguns',
  JOUSTING:'A medieval tournament event where mounted knights charged with long lances',
  VAULTING:'Pole vault in athletics — or acrobatic equestrian gymnastics on a moving horse',
  THROWING:'Field athletics disciplines including shot put, javelin, hammer and discus',
  ATHLETICS:'Track and field sports — running, jumping, throwing and race walking',
  WATERPOLO:'A team water sport where players throw a ball into the opposing goal',
  SKYDIVING:'Jumping from an aircraft and freefalling before opening a parachute',
  BASKETBALL:'A team sport where players shoot a ball through an elevated hoop',
  GYMNASTICS:'An athletic sport combining strength, flexibility, balance and grace',
  TRAMPOLINE:'A competitive sport performing acrobatic twists and somersaults on a sprung mat',
  FREESKIING:'A freestyle skiing discipline featuring aerial tricks and big-mountain lines',
  PARAGLIDING:'Flying a fabric wing glider using rising air currents — no engine required',
  SNOWBOARDING:'Descending a snow slope on a single board strapped to both feet',
  POWERLIFTING:'A strength sport comprising three lifts — squat, bench press and deadlift',
  PARASAILING:'Being towed by a boat while harnessed to a parachute high above the water',
  KITESURFING:'Riding a board across water while being pulled by a large steerable kite',
  WINDSURFING:'Riding a board fitted with a sail, using wind for propulsion across water',
  CHAMPIONSHIP:'A competition to determine the overall best in a sport or activity',
  BODYBUILDING:'A sport focused on developing muscle size and definition through training',
  TRAMPOLINING:'Performing acrobatic flips and twists on a large trampoline competitively',

  // ── Space (DEF-20 / DEF-24 additions) ────────────────────────────────────
  BEAM:'A directed stream of electromagnetic radiation or particles',
  DARK:'Relating to dark matter or dark energy — the unseen components of the universe',
  FLUX:'The rate of flow of energy, particles or a field across an area',
  HALO:'A spherical distribution of stars or dust surrounding a galaxy',
  RING:'A band of dust, rock and ice orbiting a planet — as seen around Saturn',
  SPIN:'The rotation of a planet, star or particle on its own axis',
  DUST:'Fine particles of rock, ice or carbon floating through interstellar space',
  DWARF:'A small star or planet — like a white dwarf star or dwarf planet',
  LUNAR:'Relating to the Moon',
  OZONE:'A molecule of three oxygen atoms forming a protective layer in Earth\'s atmosphere',
  PLUTO:'A dwarf planet in the outer solar system — once considered the ninth planet',
  RADIO:'The longest wavelength of electromagnetic radiation — used in radio astronomy',
  SOLAR:'Relating to the Sun',
  FLARE:'A sudden intense burst of radiation from the Sun\'s surface',
  APOGEE:'The farthest point in the orbit of a satellite or Moon around Earth',
  CORONA:'The outermost layer of the Sun\'s atmosphere — visible during a solar eclipse',
  DEBRIS:'Fragments of asteroids, comets or spacecraft orbiting in space',
  HELIUM:'The second most abundant element in the universe — used to power stars',
  IMPACT:'The collision of a meteorite or asteroid with a planetary surface',
  CAPSULE:'A small spacecraft or re-entry vehicle carrying astronauts',
  IMAGING:'Capturing detailed images of celestial objects using telescopes or probes',
  ORBITAL:'Relating to the path one body takes as it travels around another',
  PERIGEE:'The closest point in the orbit of a satellite or Moon around Earth',
  SUNSPOT:'A dark cooler patch on the Sun\'s surface caused by intense magnetic activity',
  TRANSIT:'A celestial event where one body passes in front of the disc of another',
  INFINITY:'The concept of boundless space with no limit or end',
  LATITUDE:'The angular distance north or south of the equator on Earth',
  UNIVERSE:'All of space, time, matter and energy — the totality of existence',
  MAGNITUDE:'The brightness of a star or object as measured from Earth',
  METEOROID:'A small rocky or metallic body travelling through space, smaller than an asteroid',
  SUPERMOON:'A full moon occurring when the Moon is at its closest point to Earth',
  EXOPLANET:'A planet orbiting a star other than our own Sun',
  SPACECRAFT:'A vehicle designed and built to travel in outer space',
  COSMONAUTS:'Astronauts from Russia or the former Soviet Union',
  STARGAZING:'The pastime of observing and enjoying the stars and night sky',
  OBSERVATORY:'A facility equipped with telescopes for astronomical observation and research',
  MOONWALKING:'Walking on the surface of the Moon — first achieved by Neil Armstrong in 1969',
  ASTROPHYSICS:'The branch of astronomy studying the physical properties of stars and galaxies',
  INTERSTELLAR:'Relating to the vast space between individual stars',
  PLANETARIUM:'A domed theatre that projects a realistic image of the night sky overhead',
  COSMOLOGICAL:'Relating to the origin, structure and ultimate fate of the universe',
};

export function getClue(word) {
  return wordClues[word] || wordClues[word?.toUpperCase()] || `A ${word?.length || '?'}-letter word`;
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

function pickWords({ count, minLen, maxLen, pool, trickyPool, trickyRatio, preferUniqueLetters = false }) {
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
  const shuffled = fisherYates([...new Set(pool.filter(fits))]);

  if (!preferUniqueLetters) {
    return shuffled.slice(0, count);
  }

  // Mystery Word mode: prefer words that each contribute at least one letter
  // not already covered by the other selected words. This avoids situations
  // where a short word like IRAN has all its letters present in other words,
  // making it trivially guessable before the player even starts on the mystery.
  const selected = [];
  const usedLetters = new Set();
  const fallbacks = [];

  for (const word of shuffled) {
    if (selected.length >= count) break;
    const upper = word.toUpperCase();
    if (upper.split('').some(l => !usedLetters.has(l))) {
      selected.push(word);
      upper.split('').forEach(l => usedLetters.add(l));
    } else {
      fallbacks.push(word);
    }
  }

  // Fill any remaining slots from fallbacks (all 26 letters already covered)
  for (const word of fallbacks) {
    if (selected.length >= count) break;
    selected.push(word);
  }

  return fisherYates(selected.slice(0, count));
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

// CR-05: Filler pool for Mystery Word mode is RESTRICTED to the active category.
// This ensures a Food game never shows emotion words etc. in the word list.
// For random category, all standard word lists are fair game.
function buildFillerWordPool(category, usedSet) {
  const catKey = (category && category !== 'random' && !category.startsWith('tricky_') && wordLists[category])
    ? category
    : null;
  const raw = catKey
    ? wordLists[catKey].filter(w => !usedSet.has(w.toUpperCase()))
    : [...new Set(Object.values(wordLists).flat().filter(w => !usedSet.has(w.toUpperCase())))];

  // Sort long words FIRST so they fill empty cells quickly while the grid is sparse.
  // Short words are tried last, when the grid is dense — they are more likely to find
  // a valid non-conflicting placement and can precisely tune K into the target range.
  // Shuffle within each length group to keep word variety.
  const byLength = {};
  for (const w of raw) {
    const l = w.length;
    if (!byLength[l]) byLength[l] = [];
    byLength[l].push(w);
  }
  return Object.keys(byLength)
    .map(Number)
    .sort((a, b) => b - a)          // descending length
    .flatMap(l => fisherYates(byLength[l]));
}

// CR-06: After filling, find a mystery word whose length exactly matches the
// remaining empty cells. Searches the active category word list first (for
// thematic consistency), then the bonus pairs, then all categories for random.
// placedLetters: Set of all letters already used by placed words — mystery word
// is preferred when it contains at least one letter NOT in this set, ensuring it
// contributes something the player cannot deduce purely from the regular word list.
function findMysteryWord(category, usedSet, targetLength, placedLetters) {
  if (targetLength < 2) return null;

  const catKey = (category && category !== 'random' && !category.startsWith('tricky_') && wordLists[category])
    ? category
    : null;

  // True if the word adds at least one letter not already present in placed words.
  // Falls back to allowing any word if placedLetters not provided.
  const hasUniqueLetter = (word) =>
    !placedLetters || word.toUpperCase().split('').some(l => !placedLetters.has(l));

  // Helper: scan a word array for exact length matches not already used.
  // Returns the first candidate with a unique letter; falls back to any valid match.
  const findIn = (arr) => {
    const candidates = arr.filter(w => {
      const up = w.toUpperCase();
      return up.length === targetLength && !usedSet.has(up);
    });
    return candidates.find(w => hasUniqueLetter(w)) || candidates[0] || null;
  };

  // 1. Category bonus pairs (come with a nice hint)
  const bonusPairs = catKey ? (categoryBonusWordPairs[catKey] || []) : [];
  const bonusCandidates = bonusPairs.filter(e => e.word.length === targetLength && !usedSet.has(e.word));
  const matchedPair = bonusCandidates.find(e => hasUniqueLetter(e.word)) || bonusCandidates[0] || null;
  if (matchedPair) return matchedPair;

  // 2. Regular category word list (generate a generic hint)
  const catPool = catKey ? (wordLists[catKey] || []) : Object.values(wordLists).flat();
  const matchedWord = findIn(catPool);
  if (matchedWord) {
    const label = catKey ? catKey : 'mystery';
    return { word: matchedWord.toUpperCase(), hint: `A ${targetLength}-letter ${label} word 🔎` };
  }

  // 3. Any bonus pair across all categories — last resort only
  // (filler loop should have stopped at a valid category length, making this rare)
  for (const pairs of Object.values(categoryBonusWordPairs)) {
    const candidates = pairs.filter(e => e.word.length === targetLength && !usedSet.has(e.word));
    const p = candidates.find(e => hasUniqueLetter(e.word)) || candidates[0] || null;
    if (p) return p;
  }

  // 4. Any word from any category
  const anyWord = findIn(Object.values(wordLists).flat());
  if (anyWord) return { word: anyWord.toUpperCase(), hint: `A hidden ${targetLength}-letter word 🔎` };

  // 5. Universal fallback — covers lengths 13–17 that no category word list reaches.
  //    These only appear when the filler pool exhausted with K above the normal range.
  //    Using a real word here (vs random padding) means ALL remaining cells become amber
  //    mystery-word cells — zero orphaned letters in the grid.
  const universalWords = [
    'UNDERSTANDING','COMMUNICATION','ENTERTAINMENT','DETERMINATION','EXTRAORDINARY', // 13
    'ACCOMPLISHMENT','DISAPPOINTMENT','TRANSFORMATION','CONGRATULATING',             // 14
    'CONGRATULATIONS','ACCOMPLISHMENTS','DISORGANIZATION',                           // 15
    'MISUNDERSTANDING','COUNTERINTUITIVE',                                           // 16
    'MISUNDERSTANDINGS','COUNTERPRODUCTIVE',                                         // 17
  ];
  const universal = findIn(universalWords);
  if (universal) return { word: universal.toUpperCase(), hint: `A hidden ${targetLength}-letter word 🔎` };

  return null;
}

// Count empty cells across the whole grid
function countEmptyCells(grid, gridSize) {
  let n = 0;
  for (let r = 0; r < gridSize; r++)
    for (let c = 0; c < gridSize; c++)
      if (grid[r][c] === '') n++;
  return n;
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

export function generateGame(level, category = null, isAudioMode = false, bonusWordMode = false) {
  const config = levelConfig[level];
  const { gridSize, wordCount, minWordLen, maxWordLen, trickyRatio, dense } = config;

  const isTrickyCategory = category && category.startsWith('tricky_');
  const trickyPool = isTrickyCategory
    ? TRICKY_CATEGORY_MAP[category] || coreAudioWords
    : coreAudioWords;
  const effectiveTrickyRatio = isTrickyCategory ? 1.0 : trickyRatio;

  // Word pool: both Standard and Mystery Word modes draw from the same themed category
  // pool (or all categories if random). In Mystery Word mode the mystery word itself
  // also comes from this same pool via findMysteryWord.
  const standardPool = (category && category !== 'random' && !isTrickyCategory && wordLists[category])
    ? wordLists[category]
    : Object.values(wordLists).flat();

  const selectedWords = isAudioMode
    ? pickWords({ count: wordCount, minLen: minWordLen, maxLen: maxWordLen, pool: standardPool, trickyPool, trickyRatio: effectiveTrickyRatio })
    : pickWords({ count: wordCount, minLen: minWordLen, maxLen: maxWordLen, pool: standardPool, preferUniqueLetters: bonusWordMode });

  const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(''));
  const wordPositions = {};
  const placedWords = [];

  // Sort longest-first so large words anchor the grid before shorter ones fill gaps
  // In Mystery Word mode all levels use dense crossword placement to maximise coverage
  const sorted = [...selectedWords].sort((a, b) => b.length - a.length);
  for (const word of sorted) {
    const placer = (dense || bonusWordMode) ? tryPlaceWordDense : tryPlaceWord;
    if (placer(grid, word.toUpperCase(), gridSize, wordPositions)) {
      placedWords.push(word);
    }
  }

  // ── Mystery Word (bonusWordMode only) ────────────────────────────────────────
  // Algorithm (CR-05 + CR-06):
  //   1. Fill ALL remaining empty cells with category-restricted filler words.
  //      Each filler word must contribute at least one new cell (no pure overlaps).
  //   2. After filling, every remaining empty cell becomes an amber mystery cell.
  //   3. Find a mystery word whose length EXACTLY matches the number of remaining
  //      empty cells — guaranteeing 100% grid coverage with no random filler letters.
  //   4. Write the mystery word letters into those cells (reading order).
  let bonusWord = null;
  let bonusHint = null;
  let bonusLetterPositions = null;

  if (bonusWordMode) {
    const currentUsed = new Set(placedWords.map(w => w.toUpperCase()));

    // Pre-compute the word lengths available in the current category so the
    // filler loop can stop as soon as the empty cell count matches one of them.
    // This prevents the filler from overshooting, which would force findMysteryWord
    // to fall through to a cross-category word (DEF-17 fix).
    const _catKey = (category && category !== 'random' && !category.startsWith('tricky_') && wordLists[category])
      ? category : null;
    const _mysteryPool = _catKey
      ? [...(categoryBonusWordPairs[_catKey] || []).map(e => e.word), ...(wordLists[_catKey] || [])]
      : Object.values(wordLists).flat();
    const validMysteryLengths = new Set(_mysteryPool.map(w => w.length).filter(l => l >= 2));

    // ── Step 1: Fill empty cells with category filler, stopping when empty
    //            cell count hits a length available in the category word pool ──
    const fillerPool = buildFillerWordPool(category, currentUsed);
    // Never let K drop below the smallest valid mystery word length — we undo any
    // filler placement that would overshoot below this floor, then try the next word.
    const minValidLength = validMysteryLengths.size > 0 ? Math.min(...validMysteryLengths) : 2;

    for (const wordRaw of fillerPool) {
      const currentEmpty = countEmptyCells(grid, gridSize);
      if (currentEmpty === 0) break;
      // Stop if we've landed on a count that matches a category mystery word length
      if (validMysteryLengths.has(currentEmpty)) break;

      const word = wordRaw.toUpperCase();
      if (currentUsed.has(word)) continue;

      // Snapshot the grid before placement so we can undo if this word overshoots.
      // Use tryPlaceWord (random placement) — NOT tryPlaceWordDense. Dense placement
      // maximises overlap, which minimises new cells per word and causes the pool to
      // exhaust before K drops into the valid mystery-word range on larger grids.
      // Random placement fills cells evenly and reaches the target far more quickly.
      const emptyBefore = countEmptyCells(grid, gridSize);
      const gridSnap = grid.map(row => [...row]);

      if (tryPlaceWord(grid, word, gridSize, wordPositions)) {
        const emptyAfter = countEmptyCells(grid, gridSize);
        if (emptyAfter < emptyBefore) {
          // Word filled new cells — check it didn't overshoot below minValidLength.
          // Also undo if emptyAfter === 0 (grid fully filled — no cells left for mystery word).
          if (emptyAfter < minValidLength) {
            // Undo: restore cells that were empty before and got filled by this word
            for (let r = 0; r < gridSize; r++)
              for (let c = 0; c < gridSize; c++)
                if (gridSnap[r][c] === '' && grid[r][c] !== '') grid[r][c] = '';
            delete wordPositions[word];
            continue;
          }
          // Placement is safe — commit it
          placedWords.push(word);
          currentUsed.add(word);
          // Stop if the placement landed us on a valid mystery word length
          if (validMysteryLengths.has(emptyAfter)) break;
        } else {
          // Pure overlap — word already existed in grid, grid unchanged
          delete wordPositions[word];
        }
      }
    }

    // No padding fallback — findMysteryWord (step 5) now covers lengths up to 17
    // via its universal word list, so whatever K remains after filler, ALL remaining
    // empty cells become amber mystery-word cells with zero orphaned letters.

    // ── Step 2: Collect ALL remaining empty cells (reading order) ──────────
    const mysteryPositions = [];
    for (let r = 0; r < gridSize; r++)
      for (let c = 0; c < gridSize; c++)
        if (grid[r][c] === '') mysteryPositions.push({ row: r, col: c });

    const K = mysteryPositions.length;

    // ── Step 3: Find mystery word of exactly length K ───────────────────────
    if (K >= 2) {
      // Build the complete set of letters already present in placed words.
      // Used by findMysteryWord to prefer mystery words that contribute at
      // least one letter the player hasn't seen in the regular word list.
      const placedLetters = new Set(
        placedWords.map(w => w.toUpperCase()).join('').split('')
      );
      const mysteryEntry = findMysteryWord(category, currentUsed, K, placedLetters);

      if (mysteryEntry) {
        bonusWord = mysteryEntry.word.toUpperCase();
        bonusHint = mysteryEntry.hint;
        bonusLetterPositions = [];

        // Write mystery word letters into the remaining empty cells
        for (let i = 0; i < bonusWord.length; i++) {
          const { row, col } = mysteryPositions[i];
          grid[row][col] = bonusWord[i];
          bonusLetterPositions.push({ row, col });
        }
      }
      // If no exact-length word found, fall through to random filler below
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

  // Safety net: drop any word that didn't end up with a grid position.
  // Prevents a word appearing in the word list with no grid representation,
  // which would cause hints to "find" it without highlighting any cells (DEF-35).
  const verifiedWords = placedWords.filter(w => wordPositions[w.toUpperCase()]);

  return { grid, words: verifiedWords, wordPositions, gridSize, bonusWord, bonusHint, bonusLetterPositions };
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
