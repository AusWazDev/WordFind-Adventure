# SF-76 (CR-134): dash removal, every change

Player-facing dashes removed under the developer's ruling (13 and 14 Oct 2026) and SF-76 Amendment A. Line numbers are in the edited files. Clue choices follow Amendment A ruling 5: comma by default; full stop where what follows has its own subject or is an imperative; colon for a list, examples or a definition of the first part; parentheses for an aside or a qualifier, and for paired dashes. Only the dash, the space around it and, for a full stop, the next capital changed.

## Counts

- UI strings: 29 (index.html meta description included); Daily templates: 3
- Clues and bonus hints: 384
  - Full stop: 144
  - Colon: 13
  - Parentheses (single dash): 110
  - Parentheses (paired dashes): 4
  - Range (en dash to hyphen, ruling 4): 2
  - Comma (default): 111
- Left unchanged: 0

## UI strings and Daily templates

| file | before | after |
|---|---|---|
| src/components/game/AdModal.jsx:109 | One-time purchase — play ad-free! | One-time purchase. Play ad-free! |
| src/components/game/AnagramWordList.jsx:102 | Letters are scrambled — figure out the word, then find it in the grid! | Letters are scrambled. Figure out the word, then find it in the grid! |
| src/components/game/AudioCategorySelector.jsx:14 | A blend of all tricky word types — the ultimate challenge | A blend of all tricky word types: the ultimate challenge |
| src/components/game/AudioCategorySelector.jsx:25 | KNIGHT, YACHT, LAMB, DEBT — letters that hide in plain sight | KNIGHT, YACHT, LAMB, DEBT: letters that hide in plain sight |
| src/components/game/AudioCategorySelector.jsx:35 | FLOUR / FLOWER, KNIGHT / NIGHT — same sound, different spelling | FLOUR / FLOWER, KNIGHT / NIGHT: same sound, different spelling |
| src/components/game/AudioCategorySelector.jsx:44 | TOUGH, THROUGH, THOUGH, COUGH — seven different sounds, one spelling | TOUGH, THROUGH, THOUGH, COUGH: seven different sounds, one spelling |
| src/components/game/AudioCategorySelector.jsx:53 | OCCASION, NECESSARY, EMBARRASS — spot the hidden doubles | OCCASION, NECESSARY, EMBARRASS: spot the hidden doubles |
| src/components/game/AudioCategorySelector.jsx:62 | DEFINITELY, WEDNESDAY, RHYTHM — words that trip everyone up | DEFINITELY, WEDNESDAY, RHYTHM: words that trip everyone up |
| src/components/game/AudioCategorySelector.jsx:71 | REALISE / REALIZE, ORGANISE / ORGANIZE — UK vs US spelling | REALISE / REALIZE, ORGANISE / ORGANIZE: UK vs US spelling |
| src/components/game/AudioCategorySelector.jsx:80 | COLOUR / COLOR, HONOUR / HONOR — British vs American English | COLOUR / COLOR, HONOUR / HONOR: British vs American English |
| src/components/game/AudioCategorySelector.jsx:103 | Listen carefully — find the word by its spelling, not just its sound | Listen carefully. Find the word by its spelling, not just its sound |
| src/components/game/GameModeSelector.jsx:29 | Find words using hand-crafted clues — works fully offline | Find words using hand-crafted clues. Works fully offline |
| src/components/game/GameModeSelector.jsx:38 | Words shown scrambled — unscramble then find them | Words shown scrambled. Unscramble then find them |
| src/components/game/GameModeSelector.jsx:66 | You're offline. Audio Challenge is limited — all other modes work normally. | You're offline. Audio Challenge is limited, and all other modes work normally. |
| src/components/game/GameModeSelector.jsx:69 | You're offline. Every mode still works — ads and purchases need a connection. | You're offline. Every mode still works. Ads and purchases need a connection. |
| src/components/game/GameModeSelector.jsx:109 | Words spoken only — example sentences need internet | Words spoken only (example sentences need internet) |
| src/components/game/GameModeSelector.jsx:151 | Find every word in the grid — the remaining letters reveal a hidden mystery word | Find every word in the grid. The remaining letters reveal a hidden mystery word |
| src/components/game/HintModal.jsx:181 | Buy 10 Hints — A$3.99 (template: Buy ${n} Hints — ${price}) | Buy 10 Hints (A$3.99) (template: Buy ${n} Hints (${price})) |
| src/components/game/HintModal.jsx:283 | Get 1 free hint — ~15 seconds | Get 1 free hint (~15 seconds) |
| src/components/game/ReminderSettings.jsx:77 | Your daily challenge is waiting — keep your streak alive! 🔥 | Your daily challenge is waiting. Keep your streak alive! 🔥 |
| src/components/game/ReminderSettings.jsx:152 | Blocked — enable notifications in browser settings | Blocked. Enable notifications in browser settings |
| src/components/game/RemoveAdsModal.jsx:53 | Instant & permanent — no subscription | Instant & permanent, no subscription |
| src/components/game/RemoveAdsModal.jsx:104 | Forever — not a subscription | Forever, not a subscription |
| src/components/game/RemoveAdsModal.jsx:127 | Remove Ads — A$4.99 (template: Remove Ads — ${price}) | Remove Ads (A$4.99) (template: Remove Ads (${price})) |
| src/pages/DailyChallenge.jsx:606 | Today's hints were already claimed — come back tomorrow! | Today's hints were already claimed. Come back tomorrow! |
| src/pages/DailyChallenge.jsx:660 | You already completed today's challenge — playing for fun! | You already completed today's challenge. Playing for fun! |
| src/pages/Game.jsx:428 | Not quite — keep reading the grid! (toast) | Not quite. Keep reading the grid! (toast) |
| src/pages/Settings.jsx:327 | One-time purchase — no subscription | One-time purchase, no subscription |
| index.html:7 | SoundFind — a word puzzle game where you listen carefully and find the correct word by sound. (meta description) | SoundFind: a word puzzle game where you listen carefully and find the correct word by sound. (meta description) |
| src/components/game/DailyChallengeUtils.jsx:8 (Daily template) | Find technology words — expert level challenge! | Find technology words. Expert level challenge! |
| src/components/game/DailyChallengeUtils.jsx:14 (Daily template) | Audio challenge — listen and find! | Audio challenge: listen and find! |
| src/components/game/DailyChallengeUtils.jsx:18 (Daily template) | Maximum difficulty — no time limit, all categories! | Maximum difficulty: no time limit, all categories! |

## Clues: Full stop (144)

| gameUtils.jsx line | entry | before | after |
|---|---|---|---|
| 303 | SALMON | A large pink-fleshed fish rich in omega-3 — the L is silent | A large pink-fleshed fish rich in omega-3. The L is silent |
| 329 | ISLAND | A piece of land completely surrounded by water — the S is silent | A piece of land completely surrounded by water. The S is silent |
| 468 | HYDRA | A many-headed serpent from Greek mythology — cut one head off and two grow back | A many-headed serpent from Greek mythology. Cut one head off and two grow back |
| 523 | KNIGHT | An armoured medieval warrior — the K is silent | An armoured medieval warrior. The K is silent |
| 524 | CASTLE | A large fortified medieval residence — the T is silent | A large fortified medieval residence. The T is silent |
| 535 | TOMB | A burial chamber or monument for the dead — the B is silent | A burial chamber or monument for the dead. The B is silent |
| 538 | SWORD | A bladed weapon with a long cutting edge — the W is silent | A bladed weapon with a long cutting edge. The W is silent |
| 545 | CALM | Peaceful and free from agitation — the L is silent | Peaceful and free from agitation. The L is silent |
| 566 | KNEEL | To go down on one or both knees — the K is silent | To go down on one or both knees. The K is silent |
| 567 | KNACK | A natural skill or talent — the K is silent | A natural skill or talent. The K is silent |
| 567 | KNAVE | A dishonest or unscrupulous man — the K is silent | A dishonest or unscrupulous man. The K is silent |
| 568 | KNOB | A rounded lump or handle — the K is silent | A rounded lump or handle. The K is silent |
| 568 | KNIFE | A sharp cutting blade — the K is silent | A sharp cutting blade. The K is silent |
| 569 | KNIT | To make fabric from yarn with needles — the K is silent | To make fabric from yarn with needles. The K is silent |
| 569 | KNOCK | To strike a surface sharply — the K is silent | To strike a surface sharply. The K is silent |
| 570 | KNOT | A fastening made by tying — the K is silent | A fastening made by tying. The K is silent |
| 570 | KNEW | Past tense of "know" — the K is silent | Past tense of "know". The K is silent |
| 571 | KNUCKLE | The bony joint of a finger — the K is silent | The bony joint of a finger. The K is silent |
| 571 | KNAPSACK | A bag carried on the back — the K is silent | A bag carried on the back. The K is silent |
| 572 | WRAP | To cover something completely — the W is silent | To cover something completely. The W is silent |
| 572 | WRITE | To mark symbols on a surface — the W is silent | To mark symbols on a surface. The W is silent |
| 573 | WRIST | The joint connecting hand to arm — the W is silent | The joint connecting hand to arm. The W is silent |
| 573 | WRONG | Not correct — the W is silent | Not correct. The W is silent |
| 574 | WRECK | The destruction of something — the W is silent | The destruction of something. The W is silent |
| 574 | WREN | A tiny brown songbird — the W is silent | A tiny brown songbird. The W is silent |
| 575 | WRATH | Extreme anger — the W is silent | Extreme anger. The W is silent |
| 575 | WRENCH | A tool for gripping and turning — the W is silent | A tool for gripping and turning. The W is silent |
| 576 | WRESTLE | To grapple and struggle against — the W is silent | To grapple and struggle against. The W is silent |
| 576 | WRINKLE | A small fold in skin or fabric — the W is silent | A small fold in skin or fabric. The W is silent |
| 577 | GNOME | A small mythical creature or garden ornament — the G is silent | A small mythical creature or garden ornament. The G is silent |
| 577 | GNAT | A tiny biting insect — the G is silent | A tiny biting insect. The G is silent |
| 578 | GNAW | To bite or chew persistently — the G is silent | To bite or chew persistently. The G is silent |
| 579 | THUMB | The short thick first digit of the hand — the B is silent | The short thick first digit of the hand. The B is silent |
| 580 | CLIMB | To go up using hands and feet — the B is silent | To go up using hands and feet. The B is silent |
| 580 | COMB | A toothed instrument for hair — the B is silent | A toothed instrument for hair. The B is silent |
| 581 | CRUMB | A tiny fragment of bread — the B is silent | A tiny fragment of bread. The B is silent |
| 581 | BOMB | An explosive device — the B is silent | An explosive device. The B is silent |
| 582 | LIMB | An arm, leg, or large branch — the B is silent | An arm, leg, or large branch. The B is silent |
| 582 | NUMB | Unable to feel sensation — the B is silent | Unable to feel sensation. The B is silent |
| 583 | WOMB | The organ where babies develop — the B is silent | The organ where babies develop. The B is silent |
| 584 | PLUMB | To measure the depth of something — the B is silent | To measure the depth of something. The B is silent |
| 584 | DEBT | Money owed — the B is silent | Money owed. The B is silent |
| 585 | DOUBT | Feeling uncertain — the B is silent | Feeling uncertain. The B is silent |
| 585 | SUBTLE | So slight as to be hard to detect — the B is silent | So slight as to be hard to detect. The B is silent |
| 586 | DUMB | Unable to speak; also means stupid (informal) — the B is silent | Unable to speak; also means stupid (informal). The B is silent |
| 587 | WHISTLE | A shrill sound made by forcing air through lips — the T is silent | A shrill sound made by forcing air through lips. The T is silent |
| 588 | BUSTLE | Hurried and energetic activity — the T is silent | Hurried and energetic activity. The T is silent |
| 588 | HUSTLE | To push or jostle someone — the T is silent | To push or jostle someone. The T is silent |
| 589 | THISTLE | A prickly plant with purple flowers — the T is silent | A prickly plant with purple flowers. The T is silent |
| 589 | BRISTLE | A short stiff hair or fibre — the T is silent | A short stiff hair or fibre. The T is silent |
| 590 | FASTEN | To attach firmly — the T is silent | To attach firmly. The T is silent |
| 590 | LISTEN | To give attention to sound — the T is silent | To give attention to sound. The T is silent |
| 591 | SOFTEN | To make less hard or harsh — the T is silent | To make less hard or harsh. The T is silent |
| 591 | OFTEN | Many times — the T is usually silent | Many times. The T is usually silent |
| 592 | GLISTEN | To shine with reflected light — the T is silent | To shine with reflected light. The T is silent |
| 592 | MOISTEN | To make slightly wet — the T is silent | To make slightly wet. The T is silent |
| 593 | HASTEN | To hurry — the T is silent | To hurry. The T is silent |
| 594 | HOUR | A period of sixty minutes — the H is silent | A period of sixty minutes. The H is silent |
| 594 | GHOST | The spirit of a dead person — the H is silent | The spirit of a dead person. The H is silent |
| 595 | HONEST | Truthful and free from deceit — the H is silent | Truthful and free from deceit. The H is silent |
| 595 | HEIR | Someone who inherits — the H is silent | Someone who inherits. The H is silent |
| 596 | RHYME | Words that end with the same sound — the H is silent | Words that end with the same sound. The H is silent |
| 597 | SCENE | The place where something happens — the C is silent | The place where something happens. The C is silent |
| 597 | SCENT | A distinctive smell — the C is silent | A distinctive smell. The C is silent |
| 598 | SCIENCE | The systematic study of the world through observation — the C is silent | The systematic study of the world through observation. The C is silent |
| 598 | SCISSORS | A cutting tool with two blades — the C is silent | A cutting tool with two blades. The C is silent |
| 599 | MUSCLE | A body tissue that produces movement — the C is silent | A body tissue that produces movement. The C is silent |
| 599 | DESCEND | To go downward — the C is silent | To go downward. The C is silent |
| 600 | ASCEND | To go upward — the C is silent | To go upward. The C is silent |
| 600 | CRESCENT | The curved shape of a waxing or waning moon — the C is silent | The curved shape of a waxing or waning moon. The C is silent |
| 601 | AUTUMN | The season between summer and winter — the N is silent | The season between summer and winter. The N is silent |
| 601 | COLUMN | A vertical pillar — the N is silent | A vertical pillar. The N is silent |
| 602 | SOLEMN | Very serious and dignified — the N is silent | Very serious and dignified. The N is silent |
| 602 | HYMN | A song of praise — the N is silent | A song of praise. The N is silent |
| 603 | DAMN | To strongly criticise — the N is silent | To strongly criticise. The N is silent |
| 603 | CONDEMN | To express strong disapproval — the N is silent | To express strong disapproval. The N is silent |
| 604 | LIGHT | The opposite of dark — the GH is silent | The opposite of dark. The GH is silent |
| 604 | NIGHT | The period of darkness between sunset and sunrise — the GH is silent | The period of darkness between sunset and sunrise. The GH is silent |
| 605 | FIGHT | A physical or verbal struggle — the GH is silent | A physical or verbal struggle. The GH is silent |
| 605 | MIGHT | Great strength or power — the GH is silent | Great strength or power. The GH is silent |
| 606 | RIGHT | Correct; also the opposite of left — the GH is silent | Correct; also the opposite of left. The GH is silent |
| 606 | SIGHT | The ability to see — the GH is silent | The ability to see. The GH is silent |
| 607 | TIGHT | Firmly held or fixed — the GH is silent | Firmly held or fixed. The GH is silent |
| 607 | FLIGHT | Travelling through the air — the GH is silent | Travelling through the air. The GH is silent |
| 608 | BRIGHT | Giving out a strong light — the GH is silent | Giving out a strong light. The GH is silent |
| 608 | FRIGHT | A sudden strong fear — the GH is silent | A sudden strong fear. The GH is silent |
| 609 | DAUGHTER | A female child — the GH is silent | A female child. The GH is silent |
| 609 | SLAUGHTER | The killing of large numbers — the GH is silent | The killing of large numbers. The GH is silent |
| 610 | THOUGHT | Something considered in the mind — the GH is silent | Something considered in the mind. The GH is silent |
| 610 | BOUGHT | Past tense of "buy" — the GH is silent | Past tense of "buy". The GH is silent |
| 611 | CAUGHT | Past tense of "catch" — the GH is silent | Past tense of "catch". The GH is silent |
| 611 | TAUGHT | Past tense of "teach" — the GH is silent | Past tense of "teach". The GH is silent |
| 612 | NAUGHT | Nothing; zero — the GH is silent | Nothing; zero. The GH is silent |
| 612 | DROUGHT | A prolonged period without rain — the GH is silent | A prolonged period without rain. The GH is silent |
| 613 | PSALM | A sacred song — the P is silent | A sacred song. The P is silent |
| 613 | PSYCHE | The mind or soul — the P is silent | The mind or soul. The P is silent |
| 614 | RECEIPT | Proof of payment — the P is silent | Proof of payment. The P is silent |
| 615 | PALM | The inner surface of the hand — the L is silent | The inner surface of the hand. The L is silent |
| 616 | HALF | One of two equal parts — the L is silent | One of two equal parts. The L is silent |
| 616 | WALK | To move at a steady pace — the L is silent | To move at a steady pace. The L is silent |
| 617 | TALK | To speak — the L is silent | To speak. The L is silent |
| 617 | CHALK | A soft white limestone — the L is silent | A soft white limestone. The L is silent |
| 618 | COULD | Past tense ability — the L is silent | Past tense ability. The L is silent |
| 618 | WOULD | Expressing intention — the L is silent | Expressing intention. The L is silent |
| 619 | SHOULD | Expressing obligation — the L is silent | Expressing obligation. The L is silent |
| 619 | FOLK | People or a social group — the L is silent | People or a social group. The L is silent |
| 620 | YOLK | The yellow part of an egg — the L is silent | The yellow part of an egg. The L is silent |
| 621 | ALMOND | A nutritious tree nut — the L is silent | A nutritious tree nut. The L is silent |
| 622 | ANSWER | A reply to a question — the W is silent | A reply to a question. The W is silent |
| 623 | YACHT | An elegant sailing vessel — the CH is silent | An elegant sailing vessel. The CH is silent |
| 624 | ACHE | A dull persistent pain — the CH sounds like K | A dull persistent pain. The CH sounds like K |
| 624 | CHAOS | Complete disorder — the CH sounds like K | Complete disorder. The CH sounds like K |
| 625 | CHROME | A shiny metallic coating — the CH sounds like K | A shiny metallic coating. The CH sounds like K |
| 625 | ECHO | A reflected sound — the CH sounds like K | A reflected sound. The CH sounds like K |
| 626 | EXHAUST | To use up completely; also the fumes from an engine — the H is silent | To use up completely; also the fumes from an engine. The H is silent |
| 626 | STOMACH | The digestive organ — the CH sounds like K | The digestive organ. The CH sounds like K |
| 636 | COLOUR | The British spelling of color — the U is added | The British spelling of color. The U is added |
| 636 | FAVOUR | The British spelling of favor — the U is added | The British spelling of favor. The U is added |
| 637 | HONOUR | The British spelling of honor — the U is added | The British spelling of honor. The U is added |
| 637 | HUMOUR | The British spelling of humor — the U is added | The British spelling of humor. The U is added |
| 638 | LABOUR | The British spelling of labor — the U is added | The British spelling of labor. The U is added |
| 638 | NEIGHBOUR | The British spelling of neighbor — the U is added | The British spelling of neighbor. The U is added |
| 639 | RUMOUR | The British spelling of rumor — the U is added | The British spelling of rumor. The U is added |
| 639 | VAPOUR | The British spelling of vapor — the U is added | The British spelling of vapor. The U is added |
| 640 | BEHAVIOUR | The British spelling of behavior — the U is added | The British spelling of behavior. The U is added |
| 640 | ENDEAVOUR | The British spelling of endeavor — the U is added | The British spelling of endeavor. The U is added |
| 641 | FLAVOUR | The British spelling of flavor — the U is added | The British spelling of flavor. The U is added |
| 641 | GLAMOUR | Fascinating appeal — the British spelling retains the U | Fascinating appeal. The British spelling retains the U |
| 660 | GUARANTEE | A formal promise or assurance — the UA combination trips people up | A formal promise or assurance. The UA combination trips people up |
| 665 | SEPARATE | To divide — people often misspell it "seperate" | To divide. People often misspell it "seperate" |
| 667 | VACUUM | An empty space — the UU combination is unusual | An empty space. The UU combination is unusual |
| 667 | WEIRD | Strange or unusual — remember: "weird" is weird itself | Strange or unusual. Remember: "weird" is weird itself |
| 676 | RESTAURANT | A place where meals are served — the silent AU trips people up | A place where meals are served. The silent AU trips people up |
| 676 | SCHEDULE | A plan of times and events — the SCH sounds like SK | A plan of times and events. The SCH sounds like SK |
| 677 | STRENGTH | Physical or mental power — the NGTH cluster is tricky | Physical or mental power. The NGTH cluster is tricky |
| 677 | TWELFTH | The ordinal of twelve — the F before TH is often missed | The ordinal of twelve. The F before TH is often missed |
| 678 | WEDNESDAY | The day between Tuesday and Thursday — the D is silent | The day between Tuesday and Thursday. The D is silent |
| 681 | DISCIPLINE | Training that corrects behaviour — the SC is tricky | Training that corrects behaviour. The SC is tricky |
| 682 | FEBRUARY | The second month — the R is often skipped in speech | The second month. The R is often skipped in speech |
| 683 | FOREIGN | Coming from another country — the I before GN is tricky | Coming from another country. The I before GN is tricky |
| 684 | INDEPENDENT | Not relying on others — the middle E is often dropped | Not relying on others. The middle E is often dropped |
| 689 | PHYSICAL | Relating to the body — PH sounds like F | Relating to the body. PH sounds like F |
| 768 | PUCE | A brownish-purple — the name means "flea" in French | A brownish-purple. The name means "flea" in French |
| 814 | LAMB | A young sheep or its tender meat — the B is silent | A young sheep or its tender meat. The B is silent |

## Clues: Colon (13)

| gameUtils.jsx line | entry | before | after |
|---|---|---|---|
| 343 | AURORA | Colourful lights in the sky near the poles — aurora borealis | Colourful lights in the sky near the poles: aurora borealis |
| 353 | FENCING | A combat sport using a sword — foil, épée or sabre | A combat sport using a sword: foil, épée or sabre |
| 382 | EQUINOX | When day and night are equal length — spring or autumn | When day and night are equal length: spring or autumn |
| 440 | PLASMA | The fourth state of matter — an ionised gas | The fourth state of matter: an ionised gas |
| 475 | MERMAID | A mythical creature — half woman, half fish | A mythical creature: half woman, half fish |
| 948 | MUSICOLOGY | The academic study of music — its history, theory and cultural context | The academic study of music: its history, theory and cultural context |
| 1044 | PHASE | A distinct state of matter — solid, liquid, gas or plasma | A distinct state of matter: solid, liquid, gas or plasma |
| 1068 | PARTICLE | A tiny piece of matter — an atom, molecule, electron or photon | A tiny piece of matter: an atom, molecule, electron or photon |
| 1132 | IMMORTALS | Beings that live for ever — gods and certain blessed heroes in mythology | Beings that live for ever: gods and certain blessed heroes in mythology |
| 1170 | CLUSTER | A group of related things — servers in computing, stars or galaxies in astronomy | A group of related things: servers in computing, stars or galaxies in astronomy |
| 1294 | SOVEREIGN | A supreme ruler — a king, queen or emperor | A supreme ruler: a king, queen or emperor |
| 1394 | ATHLETICS | Track and field sports — running, jumping, throwing and race walking | Track and field sports: running, jumping, throwing and race walking |
| 1403 | POWERLIFTING | A strength sport comprising three lifts — squat, bench press and deadlift | A strength sport comprising three lifts: squat, bench press and deadlift |

## Clues: Parentheses (single dash) (110)

| gameUtils.jsx line | entry | before | after |
|---|---|---|---|
| 537 | ARMOUR | Protective clothing worn in battle — British spelling with the U | Protective clothing worn in battle (British spelling with the U) |
| 563 | DESPERATE | Feeling that the situation is hopeless — often misspelled "desparate" | Feeling that the situation is hopeless (often misspelled "desparate") |
| 627 | TOUGH | Strong and resilient — rhymes with "stuff" | Strong and resilient (rhymes with "stuff") |
| 627 | ROUGH | Not smooth — rhymes with "stuff" | Not smooth (rhymes with "stuff") |
| 628 | ENOUGH | As much as needed — rhymes with "stuff" | As much as needed (rhymes with "stuff") |
| 628 | COUGH | Forcing air from the lungs noisily — rhymes with "off" | Forcing air from the lungs noisily (rhymes with "off") |
| 629 | THROUGH | From one side to the other — rhymes with "brew" | From one side to the other (rhymes with "brew") |
| 629 | ALTHOUGH | Even though — rhymes with "low" | Even though (rhymes with "low") |
| 630 | THOROUGH | Complete and attentive to detail — rhymes with "burrow" | Complete and attentive to detail (rhymes with "burrow") |
| 630 | BOROUGH | A town or urban district — rhymes with "burrow" | A town or urban district (rhymes with "burrow") |
| 631 | DOUGH | Uncooked bread mixture — rhymes with "low" | Uncooked bread mixture (rhymes with "low") |
| 631 | THOUGH | Despite the fact that — rhymes with "low" | Despite the fact that (rhymes with "low") |
| 632 | PLOUGH | To turn over soil — rhymes with "cow" | To turn over soil (rhymes with "cow") |
| 632 | BOUGH | A large branch of a tree — rhymes with "cow" | A large branch of a tree (rhymes with "cow") |
| 633 | SOUGHT | Past tense of "seek" — rhymes with "hot" | Past tense of "seek" (rhymes with "hot") |
| 633 | FOUGHT | Past tense of "fight" — rhymes with "hot" | Past tense of "fight" (rhymes with "hot") |
| 634 | BROUGHT | Past tense of "bring" — rhymes with "hot" | Past tense of "bring" (rhymes with "hot") |
| 634 | OUGHT | Should do something — rhymes with "hot" | Should do something (rhymes with "hot") |
| 635 | NOUGHT | Nothing; zero — rhymes with "hot" | Nothing; zero (rhymes with "hot") |
| 642 | HARBOUR | A sheltered body of water — British spelling with the U | A sheltered body of water (British spelling with the U) |
| 642 | PARLOUR | A sitting room — British spelling with the U | A sitting room (British spelling with the U) |
| 643 | RIGOUR | Strictness and thoroughness — British spelling with the U | Strictness and thoroughness (British spelling with the U) |
| 643 | SAVOUR | To taste with great enjoyment — British spelling with the U | To taste with great enjoyment (British spelling with the U) |
| 644 | SPLENDOUR | Impressive beauty — British spelling with the U | Impressive beauty (British spelling with the U) |
| 644 | VALOUR | Great courage in battle — British spelling with the U | Great courage in battle (British spelling with the U) |
| 645 | VIGOUR | Physical or mental strength — British spelling with the U | Physical or mental strength (British spelling with the U) |
| 646 | REALISE | British spelling of "realize" — ends in -ise not -ize | British spelling of "realize" (ends in -ise not -ize) |
| 646 | ORGANISE | British spelling of "organize" — ends in -ise not -ize | British spelling of "organize" (ends in -ise not -ize) |
| 647 | RECOGNISE | British spelling of "recognize" — ends in -ise not -ize | British spelling of "recognize" (ends in -ise not -ize) |
| 647 | APOLOGISE | British spelling of "apologize" — ends in -ise not -ize | British spelling of "apologize" (ends in -ise not -ize) |
| 648 | EMPHASISE | British spelling of "emphasize" — ends in -ise not -ize | British spelling of "emphasize" (ends in -ise not -ize) |
| 648 | ADVERTISE | To promote a product — ends in -ise | To promote a product (ends in -ise) |
| 649 | ADVISE | To give a recommendation — ends in -ise not -ize | To give a recommendation (ends in -ise not -ize) |
| 649 | ANALYSE | British spelling of "analyze" — ends in -yse not -yze | British spelling of "analyze" (ends in -yse not -yze) |
| 650 | EXERCISE | Physical activity for health — ends in -ise | Physical activity for health (ends in -ise) |
| 650 | REVISE | To review and correct — ends in -ise | To review and correct (ends in -ise) |
| 652 | OCCASION | A special event or ceremony — double C and single S | A special event or ceremony (double C and single S) |
| 652 | NECESSARY | Cannot be done without — one C and double S | Cannot be done without (one C and double S) |
| 653 | TOMORROW | The day after today — double M and double R | The day after today (double M and double R) |
| 653 | ADDRESS | Where someone lives — double D and double S | Where someone lives (double D and double S) |
| 654 | AGGRESSIVE | Forceful and assertive — double G and double S | Forceful and assertive (double G and double S) |
| 654 | APPRECIATE | To value greatly — double P | To value greatly (double P) |
| 655 | BEGINNING | The start of something — double G | The start of something (double G) |
| 655 | BROCCOLI | A green vegetable — double C and double L | A green vegetable (double C and double L) |
| 656 | COLLEAGUE | A fellow worker — double L and GUE ending | A fellow worker (double L and GUE ending) |
| 656 | COMMITTEE | A group formed to make decisions — double M, double T, double E | A group formed to make decisions (double M, double T, double E) |
| 657 | CONSCIENCE | A moral sense of right and wrong — double C and SC | A moral sense of right and wrong (double C and SC) |
| 657 | DISAPPEAR | To become invisible — double P | To become invisible (double P) |
| 658 | DISAPPOINT | To fail to meet expectations — double P | To fail to meet expectations (double P) |
| 658 | EMBARRASS | To cause someone discomfort — double R and double S | To cause someone discomfort (double R and double S) |
| 659 | EXAGGERATE | To overstate something — double G | To overstate something (double G) |
| 659 | EXCELLENT | Extremely good — double L | Extremely good (double L) |
| 660 | IMMEDIATELY | Without any delay — double M and double E | Without any delay (double M and double E) |
| 661 | INTERRUPT | To stop something briefly — double R | To stop something briefly (double R) |
| 661 | MILLENNIUM | A thousand years — double L, double N | A thousand years (double L, double N) |
| 662 | OCCURRENCE | An event or incident — double C, double R | An event or incident (double C, double R) |
| 663 | PARALLEL | Lines equidistant and never meeting — double L twice | Lines equidistant and never meeting (double L twice) |
| 663 | POSSESSION | Ownership — double S twice | Ownership (double S twice) |
| 664 | RECOMMEND | To suggest as suitable — single C and double M | To suggest as suitable (single C and double M) |
| 664 | RESISTANCE | The act of opposing a force — single S | The act of opposing a force (single S) |
| 666 | SUCCEED | To achieve a goal — double C and double E | To achieve a goal (double C and double E) |
| 666 | UNNECESSARY | Not needed — double N and double S | Not needed (double N and double S) |
| 668 | RECEIVE | To get or accept something — I before E except after C | To get or accept something (I before E except after C) |
| 668 | ACHIEVE | To successfully reach a goal — IE after CH | To successfully reach a goal (IE after CH) |
| 669 | BELIEVE | To accept as true — I before E | To accept as true (I before E) |
| 669 | CEILING | The upper interior surface of a room — E before I after C | The upper interior surface of a room (E before I after C) |
| 670 | DECEIVE | To make someone believe something false — I before E after C exception | To make someone believe something false (I before E after C exception) |
| 670 | NIECE | A brother's or sister's daughter — I before E | A brother's or sister's daughter (I before E) |
| 671 | THIEF | A person who steals — I before E | A person who steals (I before E) |
| 671 | YIELD | To produce or give way — I before E | To produce or give way (I before E) |
| 672 | DEFINITELY | Without any doubt — often misspelled "definately" | Without any doubt (often misspelled "definately") |
| 673 | ENVIRONMENT | The natural world around us — often misspelled "enviroment" | The natural world around us (often misspelled "enviroment") |
| 673 | GOVERNMENT | The system by which a state is governed — often misspelled "goverment" | The system by which a state is governed (often misspelled "goverment") |
| 674 | HUMOROUS | Causing amusement — often misspelled "humourous" | Causing amusement (often misspelled "humourous") |
| 674 | IRRESISTIBLE | Too tempting to refuse — often misspelled with an "a" | Too tempting to refuse (often misspelled with an "a") |
| 675 | MISCHIEVOUS | Causing trouble playfully — often misspelled "mischievious" | Causing trouble playfully (often misspelled "mischievious") |
| 675 | OCCASIONALLY | From time to time — double C and double S | From time to time (double C and double S) |
| 678 | ABSENCE | Not being present — often misspelled "absense" | Not being present (often misspelled "absense") |
| 679 | CALENDAR | A system of organising time — often misspelled "calender" | A system of organising time (often misspelled "calender") |
| 679 | CONSCIENTIOUS | Very thorough and careful — triple silent letter challenge | Very thorough and careful (triple silent letter challenge) |
| 680 | CURIOSITY | A strong desire to know — from curious but drops the U | A strong desire to know (from curious but drops the U) |
| 680 | DILEMMA | A situation with two equally difficult choices — double M | A situation with two equally difficult choices (double M) |
| 681 | EXPERIENCE | Knowledge gained by doing — often misspelled "experiance" | Knowledge gained by doing (often misspelled "experiance") |
| 682 | FASCINATING | Extremely interesting — often misspelled with a double S | Extremely interesting (often misspelled with a double S) |
| 683 | HEIGHT | How tall something is — EI not IE in this case | How tall something is (EI not IE in this case) |
| 684 | INTELLIGENT | Having a high mental capacity — double L | Having a high mental capacity (double L) |
| 685 | LANGUAGE | A system of communication — the GU cluster | A system of communication (the GU cluster) |
| 685 | LITERATURE | Written works of creative value — middle A often dropped | Written works of creative value (middle A often dropped) |
| 686 | MAINTENANCE | The process of keeping something in good condition — from maintain but the I changes | The process of keeping something in good condition (from maintain but the I changes) |
| 686 | MARRIAGE | A legally recognised union — double R | A legally recognised union (double R) |
| 687 | MEDICINE | A substance used to treat illness — often misspelled "medecine" | A substance used to treat illness (often misspelled "medecine") |
| 687 | NOTICEABLE | Easy to notice — keeps the E before -able | Easy to notice (keeps the E before -able) |
| 688 | ORIGINAL | Existing from the beginning — often misspelled "origional" | Existing from the beginning (often misspelled "origional") |
| 688 | PERSEVERANCE | Continued effort despite difficulties — often misspelled "perserverence" | Continued effort despite difficulties (often misspelled "perserverence") |
| 689 | PRIVILEGE | A special right or advantage — often misspelled "priviledge" | A special right or advantage (often misspelled "priviledge") |
| 690 | QUESTIONNAIRE | A list of questions for survey — double N | A list of questions for survey (double N) |
| 690 | QUEUE | A line of waiting people — four silent letters at the end | A line of waiting people (four silent letters at the end) |
| 691 | RIDICULOUS | Absurdly unreasonable — often misspelled "rediculous" | Absurdly unreasonable (often misspelled "rediculous") |
| 691 | SENSITIVE | Easily affected by external stimuli — often misspelled "sensative" | Easily affected by external stimuli (often misspelled "sensative") |
| 692 | SERGEANT | A military or police rank — hidden EA in the middle | A military or police rank (hidden EA in the middle) |
| 692 | SIMILAR | Almost the same — often misspelled "simalar" | Almost the same (often misspelled "simalar") |
| 693 | SINCERELY | Genuinely and honestly — often misspelled "sincerly" | Genuinely and honestly (often misspelled "sincerly") |
| 693 | SPECIFIC | Particular and clearly defined — the SC | Particular and clearly defined (the SC) |
| 694 | TECHNIQUE | A way of doing something — the QUE ending | A way of doing something (the QUE ending) |
| 694 | TEMPERATURE | A measure of heat — often misspelled "tempreture" | A measure of heat (often misspelled "tempreture") |
| 695 | TONGUE | The muscle in the mouth — the GUE ending | The muscle in the mouth (the GUE ending) |
| 695 | TRAGEDY | A very sad event or story — often misspelled "tradgedy" | A very sad event or story (often misspelled "tradgedy") |
| 696 | TRULY | In a truthful way — drops the E from "true" | In a truthful way (drops the E from "true") |
| 743 | PARTRIDGE | A plump ground-dwelling game bird — as in "a partridge in a pear tree" | A plump ground-dwelling game bird (as in "a partridge in a pear tree") |
| 1245 | CONTINENTAL | Relating to a continent — as in the continental shelf underwater | Relating to a continent (as in the continental shelf underwater) |

## Clues: Parentheses (paired dashes) (4)

| gameUtils.jsx line | entry | before | after |
|---|---|---|---|
| 469 | MINOTAUR | A Greek monster — half man, half bull — trapped in the Labyrinth | A Greek monster (half man, half bull) trapped in the Labyrinth |
| 900 | SEDIMENT | Material — sand, silt or clay — deposited by water, wind or ice | Material (sand, silt or clay) deposited by water, wind or ice |
| 1095 | NYMPH | A minor female spirit of nature — forest, water or mountain — in Greek myth | A minor female spirit of nature (forest, water or mountain) in Greek myth |
| 1131 | SACRIFICE | An offering — often an animal — made to a deity in ancient religious ritual | An offering (often an animal) made to a deity in ancient religious ritual |

## Clues: Range (en dash to hyphen, ruling 4) (2)

| gameUtils.jsx line | entry | before | after |
|---|---|---|---|
| 945 | CLASSICAL | The tradition of Western art music from roughly 1750–1820 | The tradition of Western art music from roughly 1750-1820 |
| 1299 | RENAISSANCE | The European cultural revival of art and learning from the 14th–17th centuries | The European cultural revival of art and learning from the 14th-17th centuries |

## Clues: Comma (default) (111)

| gameUtils.jsx line | entry | before | after |
|---|---|---|---|
| 240 | EAGLE | Powerful bird of prey — national symbol of the USA | Powerful bird of prey, national symbol of the USA |
| 252 | PANTHER | Dark-coated big cat — often a melanistic leopard or jaguar | Dark-coated big cat, often a melanistic leopard or jaguar |
| 260 | MOLE | A burrowing mammal with velvety fur — also a chemistry unit of ~6.02 × 10²³ particles | A burrowing mammal with velvety fur, also a chemistry unit of ~6.02 × 10²³ particles |
| 267 | PURPLE | A blend of red and blue — colour of royalty | A blend of red and blue, colour of royalty |
| 268 | PINK | A pale red — colour of flamingos and cherry blossoms | A pale red, colour of flamingos and cherry blossoms |
| 274 | CORAL | A warm orange-pink colour — also the reef-building marine invertebrate | A warm orange-pink colour, also the reef-building marine invertebrate |
| 277 | LIME | A bright yellow-green colour — also a small sour green citrus fruit | A bright yellow-green colour, also a small sour green citrus fruit |
| 278 | OLIVE | A dull yellowish-green colour — also the small salty fruit pressed for its oil | A dull yellowish-green colour, also the small salty fruit pressed for its oil |
| 279 | PEACH | A soft pinkish-orange colour — also a fuzzy-skinned stone fruit with sweet flesh | A soft pinkish-orange colour, also a fuzzy-skinned stone fruit with sweet flesh |
| 282 | CREAM | A warm off-white colour — also the fatty layer skimmed from fresh milk | A warm off-white colour, also the fatty layer skimmed from fresh milk |
| 302 | COOKIE | A sweet biscuit — or the small file a website stores on your device | A sweet biscuit, or the small file a website stores on your device |
| 307 | PEPPER | A spicy fruit used as a seasoning — or a crunchy bell vegetable | A spicy fruit used as a seasoning, or a crunchy bell vegetable |
| 321 | FOREST | A dense area of trees — also a dark rich green colour | A dense area of trees, also a dark rich green colour |
| 323 | CLOUD | Water vapour floating in the sky — also a term for remote internet servers | Water vapour floating in the sky, also a term for remote internet servers |
| 341 | STREAM | A small flowing body of water — also to transmit data continuously in real time | A small flowing body of water, also to transmit data continuously in real time |
| 374 | SATURN | The ringed gas giant — sixth planet from the Sun | The ringed gas giant, sixth planet from the Sun |
| 375 | MARS | The red rocky fourth planet — nearest to Earth | The red rocky fourth planet, nearest to Earth |
| 377 | NEPTUNE | The farthest known planet — deep blue and windiest | The farthest known planet, deep blue and windiest |
| 421 | TURKEY | A country linking Europe and Asia — also a large bird eaten at Thanksgiving | A country linking Europe and Asia, also a large bird eaten at Thanksgiving |
| 462 | ODIN | The Allfather — chief god of Norse mythology | The Allfather, chief god of Norse mythology |
| 472 | TITAN | A powerful deity in Greek myth — also Saturn's largest moon with a thick atmosphere | A powerful deity in Greek myth, also Saturn's largest moon with a thick atmosphere |
| 491 | BINARY | The number system using only 0 and 1 — the language of computers | The number system using only 0 and 1, the language of computers |
| 528 | SENATE | The governing council of ancient Rome — or modern nations | The governing council of ancient Rome, or modern nations |
| 557 | FURIOUS | Extremely angry — beyond ordinary anger | Extremely angry, beyond ordinary anger |
| 662 | MISSPELL | To spell incorrectly — double S (it's mis + spell) | To spell incorrectly, double S (it's mis + spell) |
| 730 | OSTRICH | The world's largest bird — flightless but a fast runner | The world's largest bird, flightless but a fast runner |
| 751 | WOLVERINE | The largest member of the weasel family — fierce and powerful | The largest member of the weasel family, fierce and powerful |
| 754 | CHIMPANZEE | Our closest living relative — a great ape of African forests | Our closest living relative, a great ape of African forests |
| 757 | HUMMINGBIRD | The tiniest bird — can hover in mid-air while drinking nectar | The tiniest bird, can hover in mid-air while drinking nectar |
| 759 | HIPPOPOTAMUS | The third-largest land animal — a massive semi-aquatic African herbivore | The third-largest land animal, a massive semi-aquatic African herbivore |
| 790 | FALLOW | A pale yellowish-brown — also describes unplanted farmland | A pale yellowish-brown, also describes unplanted farmland |
| 812 | CORN | A yellow grain grown on cobs — a staple crop worldwide | A yellow grain grown on cobs, a staple crop worldwide |
| 854 | CHOCOLATE | A sweet food made from cacao beans — one of the world's favourites | A sweet food made from cacao beans, one of the world's favourites |
| 884 | SLOPE | Ground tilted at an angle — the side of a hill or mountain | Ground tilted at an angle, the side of a hill or mountain |
| 893 | VORTEX | A whirling mass of water or air — like a whirlpool or tornado | A whirling mass of water or air, like a whirlpool or tornado |
| 914 | FLAT | A note lowered by a semitone — marked with the ♭ symbol | A note lowered by a semitone, marked with the ♭ symbol |
| 922 | FORTE | A musical direction meaning to play loudly — marked with f | A musical direction meaning to play loudly, marked with f |
| 927 | SHARP | A note raised by a semitone — marked with the ♯ symbol | A note raised by a semitone, marked with the ♯ symbol |
| 929 | STANZA | A verse in a poem or song — a group of lines forming a unit | A verse in a poem or song, a group of lines forming a unit |
| 931 | ANTHEM | A song of loyalty or celebration — like a national anthem | A song of loyalty or celebration, like a national anthem |
| 938 | REFRAIN | A repeated lyrical phrase in a song — also called the hook | A repeated lyrical phrase in a song, also called the hook |
| 955 | KETTLEDRUM | A large bowl-shaped drum tuned to a specific pitch — also called timpani | A large bowl-shaped drum tuned to a specific pitch, also called timpani |
| 994 | GERMANY | A large Central European country — the biggest economy in Europe | A large Central European country, the biggest economy in Europe |
| 999 | UKRAINE | A large Eastern European country — the largest country entirely within Europe | A large Eastern European country, the largest country entirely within Europe |
| 1003 | ETHIOPIA | An East African country — one of the oldest independent nations on Earth | An East African country, one of the oldest independent nations on Earth |
| 1011 | INDONESIA | The world's largest archipelago nation — over 17,000 islands in Southeast Asia | The world's largest archipelago nation, over 17,000 islands in Southeast Asia |
| 1014 | AUSTRALIA | The world's sixth largest country — also an entire continent | The world's sixth largest country, also an entire continent |
| 1031 | LENS | A curved transparent object that bends light — used in optics and cameras | A curved transparent object that bends light, used in optics and cameras |
| 1038 | DECAY | The gradual breakdown of a substance — also radioactive emission over time | The gradual breakdown of a substance, also radioactive emission over time |
| 1039 | INERT | Chemically unreactive — not prone to combining with other substances | Chemically unreactive, not prone to combining with other substances |
| 1046 | CHARGE | An electrical property of matter — either positive or negative | An electrical property of matter, either positive or negative |
| 1075 | MICROWAVE | Short-wavelength electromagnetic radiation — also used for cooking | Short-wavelength electromagnetic radiation, also used for cooking |
| 1093 | GIANT | A being of immense size — a common figure in mythology and folklore | A being of immense size, a common figure in mythology and folklore |
| 1094 | MAGIC | Supernatural power used to influence events — central to myth and legend | Supernatural power used to influence events, central to myth and legend |
| 1097 | WITCH | A practitioner of magic — often associated with dark powers in folklore | A practitioner of magic, often associated with dark powers in folklore |
| 1104 | NEREID | A sea nymph — one of 50 daughters of the sea god Nereus in Greek myth | A sea nymph, one of 50 daughters of the sea god Nereus in Greek myth |
| 1107 | TYPHON | The most fearsome monster in Greek mythology — a giant serpentine being | The most fearsome monster in Greek mythology, a giant serpentine being |
| 1109 | BACCHUS | The Roman god of wine and festivity — equivalent to the Greek Dionysus | The Roman god of wine and festivity, equivalent to the Greek Dionysus |
| 1113 | SORCERY | The use of magic — especially dark or forbidden magic in myths and stories | The use of magic, especially dark or forbidden magic in myths and stories |
| 1124 | PERSEPHONE | The Greek goddess who spends half the year in the underworld — explaining winter | The Greek goddess who spends half the year in the underworld, explaining winter |
| 1127 | THUNDERBOLT | Zeus's signature weapon — a lightning bolt hurled from the heavens | Zeus's signature weapon, a lightning bolt hurled from the heavens |
| 1130 | LEGENDARY | Celebrated in ancient myths and stories — of extraordinary and enduring fame | Celebrated in ancient myths and stories, of extraordinary and enduring fame |
| 1133 | HEPHAESTUS | Greek god of fire, metalworking and the forge — the divine craftsman | Greek god of fire, metalworking and the forge, the divine craftsman |
| 1140 | PORT | A socket for connecting peripherals — or a number identifying a network service | A socket for connecting peripherals, or a number identifying a network service |
| 1150 | NODE | A device connected to a network — such as a computer, router or server | A device connected to a network, such as a computer, router or server |
| 1162 | STACK | A set of technologies used together — or a last-in-first-out data structure | A set of technologies used together, or a last-in-first-out data structure |
| 1174 | RUNTIME | The period when a program is executing — or the environment that supports it | The period when a program is executing, or the environment that supports it |
| 1214 | FLUKE | A whale's tail fin — or the flat triangular part of an anchor | A whale's tail fin, or the flat triangular part of an anchor |
| 1219 | SCUBA | Self-Contained Underwater Breathing Apparatus — used for diving | Self-Contained Underwater Breathing Apparatus, used for diving |
| 1223 | PUFFER | A fish that inflates into a spiky ball when threatened — also highly toxic | A fish that inflates into a spiky ball when threatened, also highly toxic |
| 1224 | FATHOM | A unit of water depth equal to six feet — also means to understand fully | A unit of water depth equal to six feet, also means to understand fully |
| 1241 | SHELLFISH | Aquatic animals with a protective shell — including crabs and molluscs | Aquatic animals with a protective shell, including crabs and molluscs |
| 1256 | WALL | A stone or brick defensive barrier — like the Great Wall of China | A stone or brick defensive barrier, like the Great Wall of China |
| 1262 | COURT | The monarch's household and advisors — or a place of law and justice | The monarch's household and advisors, or a place of law and justice |
| 1272 | BISHOP | A senior clergyman overseeing a diocese — a powerful figure in medieval politics | A senior clergyman overseeing a diocese, a powerful figure in medieval politics |
| 1281 | EMPEROR | The supreme ruler of an empire — of higher rank than a king | The supreme ruler of an empire, of higher rank than a king |
| 1284 | PASSAGE | A narrow route or corridor — also a portion of a historical document | A narrow route or corridor, also a portion of a historical document |
| 1301 | MESOPOTAMIA | The ancient civilisation between the Tigris and Euphrates rivers — the cradle of civilisation | The ancient civilisation between the Tigris and Euphrates rivers, the cradle of civilisation |
| 1311 | COOL | Calm and composed — or fashionably relaxed | Calm and composed, or fashionably relaxed |
| 1313 | GRIM | Stern and serious — or without hope | Stern and serious, or without hope |
| 1317 | SAFE | Free from danger — feeling protected and secure | Free from danger, feeling protected and secure |
| 1324 | EAGER | Strongly desiring to do something — enthusiastic and ready | Strongly desiring to do something, enthusiastic and ready |
| 1326 | MOODY | Subject to frequent changes of mood — often sulky or irritable | Subject to frequent changes of mood, often sulky or irritable |
| 1334 | FEISTY | Spirited and determined — ready to stand up for yourself | Spirited and determined, ready to stand up for yourself |
| 1335 | GENTLE | Mild and calm in manner — kind and tender | Mild and calm in manner, kind and tender |
| 1338 | MELLOW | Relaxed and good-humoured — pleasantly calm | Relaxed and good-humoured, pleasantly calm |
| 1340 | TENDER | Gentle and loving — sensitive and affectionate | Gentle and loving, sensitive and affectionate |
| 1341 | BASHFUL | Reluctant to draw attention to yourself — shyly modest | Reluctant to draw attention to yourself, shyly modest |
| 1342 | DEVOTED | Deeply loyal and loving — wholeheartedly dedicated to another | Deeply loyal and loving, wholeheartedly dedicated to another |
| 1344 | FORLORN | Pitifully sad and abandoned — utterly without hope | Pitifully sad and abandoned, utterly without hope |
| 1349 | CAREFREE | Free from worry or anxiety — enjoying life without a care | Free from worry or anxiety, enjoying life without a care |
| 1353 | HOPELESS | Feeling or inspiring complete despair — without any hope | Feeling or inspiring complete despair, without any hope |
| 1357 | FULFILLED | Feeling satisfied and complete — having achieved what you set out to do | Feeling satisfied and complete, having achieved what you set out to do |
| 1359 | MELANCHOLY | A deep and persistent sadness — pensive and sorrowful | A deep and persistent sadness, pensive and sorrowful |
| 1364 | HEARTBROKEN | Suffering intense grief — usually from loss or rejection | Suffering intense grief, usually from loss or rejection |
| 1371 | CHESS | A strategy board game on an 8×8 grid — widely recognised as a mind sport | A strategy board game on an 8×8 grid, widely recognised as a mind sport |
| 1378 | RACING | Competitive speed events — includes motorsport, horse racing and more | Competitive speed events, includes motorsport, horse racing and more |
| 1392 | VAULTING | Pole vault in athletics — or acrobatic equestrian gymnastics on a moving horse | Pole vault in athletics, or acrobatic equestrian gymnastics on a moving horse |
| 1401 | PARAGLIDING | Flying a fabric wing glider using rising air currents — no engine required | Flying a fabric wing glider using rising air currents, no engine required |
| 1413 | DARK | Relating to dark matter or dark energy — the unseen components of the universe | Relating to dark matter or dark energy, the unseen components of the universe |
| 1416 | RING | A band of dust, rock and ice orbiting a planet — as seen around Saturn | A band of dust, rock and ice orbiting a planet, as seen around Saturn |
| 1420 | DWARF | A small star or planet — like a white dwarf star or dwarf planet | A small star or planet, like a white dwarf star or dwarf planet |
| 1423 | PLUTO | A dwarf planet in the outer solar system — once considered the ninth planet | A dwarf planet in the outer solar system, once considered the ninth planet |
| 1424 | RADIO | The longest wavelength of electromagnetic radiation — used in radio astronomy | The longest wavelength of electromagnetic radiation, used in radio astronomy |
| 1428 | CORONA | The outermost layer of the Sun's atmosphere — visible during a solar eclipse | The outermost layer of the Sun's atmosphere, visible during a solar eclipse |
| 1430 | HELIUM | The second most abundant element in the universe — used to power stars | The second most abundant element in the universe, used to power stars |
| 1440 | UNIVERSE | All of space, time, matter and energy — the totality of existence | All of space, time, matter and energy, the totality of existence |
| 1449 | MOONWALKING | Walking on the surface of the Moon — first achieved by Neil Armstrong in 1969 | Walking on the surface of the Moon, first achieved by Neil Armstrong in 1969 |
| 1466 | BONUS:animals:ELEPHANT | Largest land animal — never forgets 🐘 | Largest land animal, never forgets 🐘 |
| 1501 | BONUS:colors:TANGERINE | Bright orange — named after the fruit 🍊 | Bright orange, named after the fruit 🍊 |
| 1503 | BONUS:colors:AUBERGINE | Deep purple — named after a vegetable 🍆 | Deep purple, named after a vegetable 🍆 |
