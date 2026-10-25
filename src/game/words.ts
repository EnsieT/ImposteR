export interface WordEntry {
  id: string;
  word: string;
  category: CategoryId;
  categoryLabel: string;
  vibeHint: string;
  citizenClues: string[];
  imposterClues: string[];
  decoyOptions: string[];
}

export type CategoryId =
  | 'all'
  | 'everyday'
  | 'food'
  | 'places'
  | 'animals'
  | 'popculture'
  | 'workplace'
  | 'custom';

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  description: string;
  countLabel: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'all',
    label: 'Shuffle All Packs',
    description: 'Mixed deck across every sticky-note category',
    countLabel: '48 words',
  },
  {
    id: 'everyday',
    label: 'Everyday Objects',
    description: 'Household items, gadgets, and things in your bag',
    countLabel: '8 words',
  },
  {
    id: 'food',
    label: 'Food & Cravings',
    description: 'Dishes, snacks, drinks, and late-night treats',
    countLabel: '8 words',
  },
  {
    id: 'places',
    label: 'Places & Hideouts',
    description: 'Locations, buildings, and travel destinations',
    countLabel: '8 words',
  },
  {
    id: 'animals',
    label: 'Creatures & Wildlife',
    description: 'Distinctive animals from land, sea, and sky',
    countLabel: '8 words',
  },
  {
    id: 'popculture',
    label: 'Pop Culture & Sci-Fi',
    description: 'Iconic props, vehicles, and movie tropes',
    countLabel: '8 words',
  },
  {
    id: 'workplace',
    label: 'Office & Daily Life',
    description: 'Desk supplies, habits, and daily routines',
    countLabel: '8 words',
  },
  {
    id: 'custom',
    label: 'Custom Group Pack',
    description: 'Inside jokes and custom words added by your group',
    countLabel: 'Custom',
  },
];

export const WORD_BANK: WordEntry[] = [
  // Everyday Objects
  {
    id: 'ev-toaster',
    word: 'Toaster',
    category: 'everyday',
    categoryLabel: 'Everyday Objects',
    vibeHint: 'Kitchen Counter',
    citizenClues: ['Crunchy', 'Pop', 'Coils', 'Slots', 'Crumb', 'Morning'],
    imposterClues: ['Counter', 'Plugged', 'Daily', 'Warm', 'Handy', 'Metal'],
    decoyOptions: ['Toaster', 'Microwave', 'Waffle Iron', 'Kettle', 'Blender', 'Oven'],
  },
  {
    id: 'ev-umbrella',
    word: 'Umbrella',
    category: 'everyday',
    categoryLabel: 'Everyday Objects',
    vibeHint: 'Weather Gear',
    citizenClues: ['Canopy', 'Spokes', 'Drizzle', 'Windy', 'Folded', 'Handle'],
    imposterClues: ['Outside', 'Carry', 'Forecast', 'Plastic', 'Fabric', 'Shield'],
    decoyOptions: ['Umbrella', 'Raincoat', 'Poncho', 'Parasol', 'Windbreaker', 'Awning'],
  },
  {
    id: 'ev-sunglasses',
    word: 'Sunglasses',
    category: 'everyday',
    categoryLabel: 'Everyday Objects',
    vibeHint: 'Wearable Accessory',
    citizenClues: ['Glare', 'Tinted', 'Frames', 'UV', 'Beach', 'Bridge'],
    imposterClues: ['Summer', 'Style', 'Case', 'Pocket', 'Outdoor', 'Face'],
    decoyOptions: ['Sunglasses', 'Goggles', 'Binoculars', 'Visor', 'Monocle', 'Contact Lenses'],
  },
  {
    id: 'ev-flashlight',
    word: 'Flashlight',
    category: 'everyday',
    categoryLabel: 'Everyday Objects',
    vibeHint: 'Emergency Tool',
    citizenClues: ['Beam', 'Batteries', 'Blackout', 'Camping', 'Switch', 'Shadow'],
    imposterClues: ['Night', 'Drawer', 'Bright', 'Garage', 'Plastic', 'Click'],
    decoyOptions: ['Flashlight', 'Lantern', 'Candle', 'Headlamp', 'Matchstick', 'Spotlight'],
  },
  {
    id: 'ev-toothbrush',
    word: 'Toothbrush',
    category: 'everyday',
    categoryLabel: 'Everyday Objects',
    vibeHint: 'Bathroom Sink',
    citizenClues: ['Bristles', 'Minty', 'Twice', 'Enamel', 'Scrub', 'Rinse'],
    imposterClues: ['Routine', 'Mirror', 'Morning', 'Plastic', 'Sink', 'Fresh'],
    decoyOptions: ['Toothbrush', 'Mouthwash', 'Dental Floss', 'Razor', 'Hairbrush', 'Washcloth'],
  },
  {
    id: 'ev-scissors',
    word: 'Scissors',
    category: 'everyday',
    categoryLabel: 'Everyday Objects',
    vibeHint: 'Craft Drawer',
    citizenClues: ['Blades', 'Snip', 'Pivot', 'Ribbon', 'Left-handed', 'Sharp'],
    imposterClues: ['Drawer', 'Steel', 'Tool', 'Paper', 'Handle', 'Desk'],
    decoyOptions: ['Scissors', 'Stapler', 'Paperclip', 'Tape Dispenser', 'Pocket Knife', 'Ruler'],
  },
  {
    id: 'ev-alarm-clock',
    word: 'Alarm Clock',
    category: 'everyday',
    categoryLabel: 'Everyday Objects',
    vibeHint: 'Bedside Table',
    citizenClues: ['Snooze', 'Buzzer', 'Sunrise', 'Nightstand', '7AM', 'Ringing'],
    imposterClues: ['Bedroom', 'Loud', 'Numbers', 'Morning', 'Awake', 'Button'],
    decoyOptions: ['Alarm Clock', 'Wristwatch', 'Hourglass', 'Metronome', 'Stopwatch', 'Calendar'],
  },
  {
    id: 'ev-backpack',
    word: 'Backpack',
    category: 'everyday',
    categoryLabel: 'Everyday Objects',
    vibeHint: 'Carry Gear',
    citizenClues: ['Straps', 'Zipper', 'Shoulders', 'Campus', 'Pockets', 'Heavy'],
    imposterClues: ['Travel', 'Canvas', 'Carry', 'Daily', 'Packed', 'Buckle'],
    decoyOptions: ['Backpack', 'Suitcase', 'Briefcase', 'Tote Bag', 'Duffle Bag', 'Messenger Bag'],
  },

  // Food & Cravings
  {
    id: 'fd-croissant',
    word: 'Croissant',
    category: 'food',
    categoryLabel: 'Food & Cravings',
    vibeHint: 'Bakery Case',
    citizenClues: ['Flaky', 'Crescent', 'Paris', 'Buttery', 'Layers', 'Crumbs'],
    imposterClues: ['Warm', 'Bakery', 'Morning', 'Golden', 'Pastry', 'Cafe'],
    decoyOptions: ['Croissant', 'Bagel', 'Baguette', 'Muffin', 'Scone', 'Brioche'],
  },
  {
    id: 'fd-sushi',
    word: 'Sushi',
    category: 'food',
    categoryLabel: 'Food & Cravings',
    vibeHint: 'Asian Cuisine',
    citizenClues: ['Seaweed', 'Wasabi', 'Vinegar', 'Chopsticks', 'Roll', 'Ginger'],
    imposterClues: ['Fresh', 'Platter', 'Bite', 'Sauce', 'Dinner', 'Seafood'],
    decoyOptions: ['Sushi', 'Ramen', 'Dumplings', 'Poke Bowl', 'Tempura', 'Spring Rolls'],
  },
  {
    id: 'fd-guacamole',
    word: 'Guacamole',
    category: 'food',
    categoryLabel: 'Food & Cravings',
    vibeHint: 'Party Appetizer',
    citizenClues: ['Mashed', 'Lime', 'Cilantro', 'Pit', 'Ripeness', 'Extra'],
    imposterClues: ['Bowl', 'Dip', 'Salty', 'Party', 'Snack', 'Fresh'],
    decoyOptions: ['Guacamole', 'Salsa', 'Queso', 'Hummus', 'Sour Cream', 'Tzatziki'],
  },
  {
    id: 'fd-bubble-tea',
    word: 'Bubble Tea',
    category: 'food',
    categoryLabel: 'Food & Cravings',
    vibeHint: 'Sweet Beverage',
    citizenClues: ['Tapioca', 'Chewy', 'Wide-Straw', 'Sealed', 'Pearls', 'Taro'],
    imposterClues: ['Cold', 'Sweet', 'Cup', 'Ice', 'Drink', 'Refreshing'],
    decoyOptions: ['Bubble Tea', 'Iced Matcha', 'Smoothie', 'Milkshake', 'Frappuccino', 'Lemonade'],
  },
  {
    id: 'fd-pancakes',
    word: 'Pancakes',
    category: 'food',
    categoryLabel: 'Food & Cravings',
    vibeHint: 'Weekend Brunch',
    citizenClues: ['Stack', 'Griddle', 'Maple', 'Flip', 'Batter', 'Fluffy'],
    imposterClues: ['Syrup', 'Breakfast', 'Warm', 'Plate', 'Butter', 'Sweet'],
    decoyOptions: ['Pancakes', 'Waffles', 'French Toast', 'Crepes', 'Cinnamon Roll', 'Omelette'],
  },
  {
    id: 'fd-ramen',
    word: 'Ramen',
    category: 'food',
    categoryLabel: 'Food & Cravings',
    vibeHint: 'Hot Bowl',
    citizenClues: ['Broth', 'Slurp', 'Soft-Boiled', 'Nori', 'Tonkotsu', 'Steaming'],
    imposterClues: ['Soup', 'Noodles', 'Spoon', 'Warm', 'Savory', 'Bowl'],
    decoyOptions: ['Ramen', 'Pho', 'Udon', 'Minestrone', 'Laksa', 'Dumpling Soup'],
  },
  {
    id: 'fd-tiramisu',
    word: 'Tiramisu',
    category: 'food',
    categoryLabel: 'Food & Cravings',
    vibeHint: 'Italian Dessert',
    citizenClues: ['Espresso', 'Ladyfingers', 'Mascarpone', 'Cocoa', 'Dusted', 'Layered'],
    imposterClues: ['Creamy', 'Sweet', 'Rich', 'Fork', 'Dessert', 'Chilled'],
    decoyOptions: ['Tiramisu', 'Cannoli', 'Gelato', 'Cheesecake', 'Panna Cotta', 'Eclair'],
  },
  {
    id: 'fd-tacos',
    word: 'Tacos',
    category: 'food',
    categoryLabel: 'Food & Cravings',
    vibeHint: 'Street Food',
    citizenClues: ['Tortilla', 'Tuesday', 'Folded', 'Salsa', 'Truck', 'Lime'],
    imposterClues: ['Spicy', 'Handheld', 'Handheld', 'Filling', 'Savory', 'Crunchy'],
    decoyOptions: ['Tacos', 'Burrito', 'Quesadilla', 'Nachos', 'Enchiladas', 'Fajitas'],
  },

  // Places & Hideouts
  {
    id: 'pl-airport',
    word: 'Airport Terminal',
    category: 'places',
    categoryLabel: 'Places & Hideouts',
    vibeHint: 'Transit Hub',
    citizenClues: ['Boarding', 'Luggage', 'Runway', 'Passport', 'Duty-Free', 'Gate'],
    imposterClues: ['Crowded', 'Waiting', 'Announcements', 'Seats', 'Schedule', 'Ticket'],
    decoyOptions: ['Airport Terminal', 'Train Station', 'Subway Platform', 'Cruise Ship', 'Bus Depot', 'Hotel Lobby'],
  },
  {
    id: 'pl-library',
    word: 'Library',
    category: 'places',
    categoryLabel: 'Places & Hideouts',
    vibeHint: 'Public Building',
    citizenClues: ['Whisper', 'Overdue', 'Aisles', 'Hardcover', 'Dewey', 'Bookmark'],
    imposterClues: ['Quiet', 'Tables', 'Study', 'Shelves', 'Reading', 'Indoor'],
    decoyOptions: ['Library', 'Bookstore', 'Museum', 'Archive', 'Study Hall', 'Coffee Shop'],
  },
  {
    id: 'pl-bowling',
    word: 'Bowling Alley',
    category: 'places',
    categoryLabel: 'Places & Hideouts',
    vibeHint: 'Night Out Venue',
    citizenClues: ['Gutter', 'Rented-Shoes', 'Spare', 'Polished', 'Pins', 'Three-Holes'],
    imposterClues: ['Noisy', 'Scoreboard', 'Neon', 'Friends', 'Turn', 'Arcade'],
    decoyOptions: ['Bowling Alley', 'Roller Rink', 'Pool Hall', 'Mini Golf', 'Arcade', 'Ice Rink'],
  },
  {
    id: 'pl-submarine',
    word: 'Submarine',
    category: 'places',
    categoryLabel: 'Places & Hideouts',
    vibeHint: 'Enclosed Vessel',
    citizenClues: ['Periscope', 'Sonar', 'Pressure', 'Hatch', 'Torpedo', 'Trench'],
    imposterClues: ['Deep', 'Cramped', 'Steel', 'Crew', 'Radar', 'Ocean'],
    decoyOptions: ['Submarine', 'Spaceship', 'Bunker', 'Battleship', 'Diving Bell', 'Yacht'],
  },
  {
    id: 'pl-cinema',
    word: 'Movie Theater',
    category: 'places',
    categoryLabel: 'Places & Hideouts',
    vibeHint: 'Entertainment Venue',
    citizenClues: ['Trailers', 'Projector', 'Buttered', 'Velvet', 'Surround', 'Matinee'],
    imposterClues: ['Dark', 'Row', 'Screen', 'Ticket', 'Seats', 'Curtain'],
    decoyOptions: ['Movie Theater', 'Opera House', 'Planetarium', 'Drive-In', 'Concert Hall', 'Comedy Club'],
  },
  {
    id: 'pl-laundromat',
    word: 'Laundromat',
    category: 'places',
    categoryLabel: 'Places & Hideouts',
    vibeHint: 'Neighborhood Spot',
    citizenClues: ['Quarters', 'Spin-Cycle', 'Lint', 'Detergent', 'Tumble', 'Folding'],
    imposterClues: ['Hum', 'Waiting', 'Baskets', 'Soap', 'Warm', 'Machines'],
    decoyOptions: ['Laundromat', 'Dry Cleaners', 'Car Wash', 'Barbershop', 'Tailor Shop', 'Convenience Store'],
  },
  {
    id: 'pl-treehouse',
    word: 'Treehouse',
    category: 'places',
    categoryLabel: 'Places & Hideouts',
    vibeHint: 'Backyard Hideout',
    citizenClues: ['Branches', 'Rope-Ladder', 'Canopy', 'Planks', 'Clubhouse', 'Bark'],
    imposterClues: ['Wooden', 'Climb', 'Hidden', 'Childhood', 'High', 'View'],
    decoyOptions: ['Treehouse', 'Log Cabin', 'Tent', 'Attic', 'Fort', 'Lighthouse'],
  },
  {
    id: 'pl-ferris',
    word: 'Ferris Wheel',
    category: 'places',
    categoryLabel: 'Places & Hideouts',
    vibeHint: 'Fairground Attraction',
    citizenClues: ['Gondola', 'Carnival', 'Skyline', 'Spokes', 'Slow-Rotation', 'Top'],
    imposterClues: ['Fair', 'Lights', 'Height', 'Ticket', 'Ride', 'Sunset'],
    decoyOptions: ['Ferris Wheel', 'Roller Coaster', 'Carousel', 'Ski Lift', 'Hot Air Balloon', 'Drop Tower'],
  },

  // Creatures & Wildlife
  {
    id: 'an-chameleon',
    word: 'Chameleon',
    category: 'animals',
    categoryLabel: 'Creatures & Wildlife',
    vibeHint: 'Exotic Reptile',
    citizenClues: ['Camouflage', 'Swivel-Eyes', 'Sticky-Tongue', 'Branch', 'Pigment', 'Slow'],
    imposterClues: ['Lizard', 'Tropical', 'Scales', 'Leaves', 'Blend', 'Reptile'],
    decoyOptions: ['Chameleon', 'Gecko', 'Iguana', 'Tree Frog', 'Praying Mantis', 'Salamander'],
  },
  {
    id: 'an-octopus',
    word: 'Octopus',
    category: 'animals',
    categoryLabel: 'Creatures & Wildlife',
    vibeHint: 'Deep Sea Creature',
    citizenClues: ['Suction', 'Ink-Cloud', 'Eight', 'Beak', 'Boneless', 'Three-Hearts'],
    imposterClues: ['Ocean', 'Clever', 'Reef', 'Underwater', 'Tentacles', 'camouflage'],
    decoyOptions: ['Octopus', 'Squid', 'Jellyfish', 'Stingray', 'Starfish', 'Seahorse'],
  },
  {
    id: 'an-flamingo',
    word: 'Flamingo',
    category: 'animals',
    categoryLabel: 'Creatures & Wildlife',
    vibeHint: 'Wading Bird',
    citizenClues: ['One-Leg', 'Shrimp', 'Lagoon', 'Coral-Pink', 'Curved-Beak', 'Lawn-Ornament'],
    imposterClues: ['Feathers', 'Tall', 'Water', 'Flock', 'Tropical', 'Graceful'],
    decoyOptions: ['Flamingo', 'Pelican', 'Peacock', 'Swan', 'Toucan', 'Ostrich'],
  },
  {
    id: 'an-sloth',
    word: 'Sloth',
    category: 'animals',
    categoryLabel: 'Creatures & Wildlife',
    vibeHint: 'Rainforest Mammal',
    citizenClues: ['Unhurried', 'Upside-Down', 'Claws', 'Mossy', 'Hammock', 'Canopy'],
    imposterClues: ['Sleepy', 'Jungle', 'Furry', 'Trees', 'Nap', 'Calm'],
    decoyOptions: ['Sloth', 'Koala', 'Panda', 'Lemur', 'Orangutan', 'Armadillo'],
  },
  {
    id: 'an-penguin',
    word: 'Penguin',
    category: 'animals',
    categoryLabel: 'Creatures & Wildlife',
    vibeHint: 'Polar Wildlife',
    citizenClues: ['Tuxedo', 'Waddle', 'Huddle', 'Flightless', 'Iceberg', 'Toboggan'],
    imposterClues: ['Cold', 'Snow', 'Swimmer', 'Colony', 'Fish', 'Antarctic'],
    decoyOptions: ['Penguin', 'Puffin', 'Walrus', 'Polar Bear', 'Seal', 'Albatross'],
  },
  {
    id: 'an-peacock',
    word: 'Peacock',
    category: 'animals',
    categoryLabel: 'Creatures & Wildlife',
    vibeHint: 'Ornamental Bird',
    citizenClues: ['Iridescent', 'Plumage', 'Eyespots', 'Fan', 'Strut', 'Sapphire'],
    imposterClues: ['Colorful', 'Showy', 'Garden', 'Feathers', 'Proud', 'Tail'],
    decoyOptions: ['Peacock', 'Parrot', 'Pheasant', 'Flamingo', 'Hummingbird', 'Cockatoo'],
  },
  {
    id: 'an-kangaroo',
    word: 'Kangaroo',
    category: 'animals',
    categoryLabel: 'Creatures & Wildlife',
    vibeHint: 'Outback Wildlife',
    citizenClues: ['Pouch', 'Joey', 'Outback', 'Boomerang', 'Bounding', 'Boxing'],
    imposterClues: ['Jump', 'Australia', 'Tail', 'Strong', 'Grassland', 'Wild'],
    decoyOptions: ['Kangaroo', 'Wallaby', 'Ostrich', 'Gazelle', 'Koala', 'Jackrabbit'],
  },
  {
    id: 'an-owl',
    word: 'Owl',
    category: 'animals',
    categoryLabel: 'Creatures & Wildlife',
    vibeHint: 'Nocturnal Hunter',
    citizenClues: ['Nocturnal', 'Swivel-Head', 'Talons', 'Silent-Flight', 'Wisdom', 'Barn'],
    imposterClues: ['Night', 'Forest', 'Perch', 'Eyes', 'Feathers', 'Moon'],
    decoyOptions: ['Owl', 'Hawk', 'Falcon', 'Bat', 'Raven', 'Eagle'],
  },

  // Pop Culture & Sci-Fi
  {
    id: 'pc-lightsaber',
    word: 'Lightsaber',
    category: 'popculture',
    categoryLabel: 'Pop Culture & Sci-Fi',
    vibeHint: 'Sci-Fi Relic',
    citizenClues: ['Kyber', 'Hum', 'Jedi', 'Hilt', 'Plasma', 'Duel'],
    imposterClues: ['Glow', 'Galaxy', 'Weapon', 'Laser', 'Movie', 'Blade'],
    decoyOptions: ['Lightsaber', 'Ray Gun', 'Phaser', 'Excalibur', 'Mjolnir', 'Trident'],
  },
  {
    id: 'pc-timemachine',
    word: 'Time Machine',
    category: 'popculture',
    categoryLabel: 'Pop Culture & Sci-Fi',
    vibeHint: 'Sci-Fi Invention',
    citizenClues: ['Paradox', 'DeLorean', 'Centuries', 'Flux', 'Butterfly-Effect', 'Chrono'],
    imposterClues: ['Future', 'History', 'Portal', 'Inventor', 'Clock', 'Travel'],
    decoyOptions: ['Time Machine', 'Teleporter', 'Spaceship', 'Cryopod', 'Hoverboard', 'Wormhole'],
  },
  {
    id: 'pc-treasuremap',
    word: 'Treasure Map',
    category: 'popculture',
    categoryLabel: 'Pop Culture & Sci-Fi',
    vibeHint: 'Adventure Prop',
    citizenClues: ['Parchment', 'Dotted-Line', 'Skull-Island', 'Red-X', 'Compass', 'Paces'],
    imposterClues: ['Pirate', 'Rolled', 'Quest', 'Secret', 'Gold', 'Clue'],
    decoyOptions: ['Treasure Map', 'Spyglass', 'Pirate Chest', 'Message in a Bottle', 'Ancient Scroll', 'Compass'],
  },
  {
    id: 'pc-magicwand',
    word: 'Magic Wand',
    category: 'popculture',
    categoryLabel: 'Pop Culture & Sci-Fi',
    vibeHint: 'Fantasy Artifact',
    citizenClues: ['Incantation', 'Swish', 'Phoenix-Feather', 'Sparks', 'Illusion', 'Top-Hat'],
    imposterClues: ['Spell', 'Wizard', 'Wooden', 'Charm', 'Fantasy', 'Flick'],
    decoyOptions: ['Magic Wand', 'Crystal Ball', 'Broomstick', 'Spellbook', 'Cauldron', 'Amulet'],
  },
  {
    id: 'pc-flyingcarpet',
    word: 'Flying Carpet',
    category: 'popculture',
    categoryLabel: 'Pop Culture & Sci-Fi',
    vibeHint: 'Folklore Transport',
    citizenClues: ['Tassels', 'Woven', 'Genie', 'Soaring', 'Persian', 'Agrabah'],
    imposterClues: ['Clouds', 'Magic', 'Ride', 'Pattern', 'Palace', 'Float'],
    decoyOptions: ['Flying Carpet', 'Broomstick', 'Pegasus', 'Hoverboard', 'Magic Lamp', 'Chariot'],
  },
  {
    id: 'pc-crystalball',
    word: 'Crystal Ball',
    category: 'popculture',
    categoryLabel: 'Pop Culture & Sci-Fi',
    vibeHint: 'Mystic Object',
    citizenClues: ['Fortune', 'Swirling-Mist', 'Clairvoyant', 'Velvet-Table', 'Gaze', 'Prophecy'],
    imposterClues: ['Glass', 'Sphere', 'Future', 'Mystic', 'Glow', 'Oracle'],
    decoyOptions: ['Crystal Ball', 'Tarot Cards', 'Snow Globe', 'Hourglass', 'Magic Mirror', 'Pendulum'],
  },
  {
    id: 'pc-jetpack',
    word: 'Jetpack',
    category: 'popculture',
    categoryLabel: 'Pop Culture & Sci-Fi',
    vibeHint: 'Futuristic Gear',
    citizenClues: ['Thrusters', 'Strapped', 'Ignition', 'Hover', 'Exhaust', 'Liftoff'],
    imposterClues: ['Rocket', 'Flight', 'Future', 'Sky', 'Gadget', 'Boost'],
    decoyOptions: ['Jetpack', 'Parachute', 'Wingsuit', 'Hang Glider', 'Rocket Boots', 'Hoverboard'],
  },
  {
    id: 'pc-jukebox',
    word: 'Jukebox',
    category: 'popculture',
    categoryLabel: 'Pop Culture & Sci-Fi',
    vibeHint: 'Retro Diner',
    citizenClues: ['Vinyl-45', 'Diner', 'Coin-Slot', 'Neon-Arch', 'B-Side', 'Wurlitzer'],
    imposterClues: ['Music', 'Retro', 'Buttons', 'Song', '1950s', 'Dance'],
    decoyOptions: ['Jukebox', 'Gramophone', 'Boombox', 'Pinball Machine', 'Cassette Player', 'Arcade Cabinet'],
  },

  // Office & Daily Life
  {
    id: 'wk-stickynote',
    word: 'Sticky Note',
    category: 'workplace',
    categoryLabel: 'Office & Daily Life',
    vibeHint: 'Desk Stationery',
    citizenClues: ['Adhesive', 'Canary-Yellow', 'Peel', 'Reminder', 'Monitor-Edge', 'Square'],
    imposterClues: ['Paper', 'Desk', 'Memo', 'Handwritten', 'Office', 'Marker'],
    decoyOptions: ['Sticky Note', 'Index Card', 'Notepad', 'Clipboard', 'Bookmark', 'Envelope'],
  },
  {
    id: 'wk-videocall',
    word: 'Video Call',
    category: 'workplace',
    categoryLabel: 'Office & Daily Life',
    vibeHint: 'Remote Work',
    citizenClues: ['Muted', 'Blurred-Background', 'Grid-View', 'Webcam', 'Lag', 'Screen-Share'],
    imposterClues: ['Meeting', 'Laptop', 'Headset', 'Remote', 'Calendar', 'Talking'],
    decoyOptions: ['Video Call', 'Voicemail', 'Group Chat', 'Webinar', 'Podcast', 'Conference Room'],
  },
  {
    id: 'wk-watercooler',
    word: 'Water Cooler',
    category: 'workplace',
    categoryLabel: 'Office & Daily Life',
    vibeHint: 'Breakroom Spot',
    citizenClues: ['Gossip', 'Jug', 'Air-Bubble', 'Paper-Cone', 'Spigot', 'Refill'],
    imposterClues: ['Breakroom', 'Thirsty', 'Chatter', 'Hallway', 'Cold', 'Office'],
    decoyOptions: ['Water Cooler', 'Vending Machine', 'Coffee Maker', 'Drinking Fountain', 'Ice Maker', 'Breakroom Fridge'],
  },
  {
    id: 'wk-whiteboard',
    word: 'Whiteboard',
    category: 'workplace',
    categoryLabel: 'Office & Daily Life',
    vibeHint: 'Brainstorming Tool',
    citizenClues: ['Dry-Erase', 'Squeaky', 'Smudged', 'Flowchart', 'Magnetic', 'Uncapped'],
    imposterClues: ['Wall', 'Diagram', 'Meeting', 'Marker', 'Wipe', 'Ideas'],
    decoyOptions: ['Whiteboard', 'Chalkboard', 'Corkboard', 'Flipchart', 'Projector Screen', 'Sketchpad'],
  },
  {
    id: 'wk-elevator',
    word: 'Elevator',
    category: 'workplace',
    categoryLabel: 'Office & Daily Life',
    vibeHint: 'Building Transit',
    citizenClues: ['Lobby', 'Penthouse', 'Cables', 'Hold-Door', 'Ding', 'Awkward-Silence'],
    imposterClues: ['Floors', 'Buttons', 'Doors', 'Upstairs', 'Shaft', 'Waiting'],
    decoyOptions: ['Elevator', 'Escalator', 'Revolving Door', 'Stairwell', 'Dumbwaiter', 'Cable Car'],
  },
  {
    id: 'wk-printer',
    word: 'Office Printer',
    category: 'workplace',
    categoryLabel: 'Office & Daily Life',
    vibeHint: 'Office Machine',
    citizenClues: ['Paper-Jam', 'Toner', 'Cyan-Low', 'Double-Sided', 'Tray', 'Collate'],
    imposterClues: ['Machine', 'Copies', 'Noisy', 'Queue', 'Sheets', 'Button'],
    decoyOptions: ['Office Printer', 'Paper Shredder', 'Fax Machine', 'Scanner', 'Laminator', 'Typewriter'],
  },
  {
    id: 'wk-coffeemug',
    word: 'Coffee Mug',
    category: 'workplace',
    categoryLabel: 'Office & Daily Life',
    vibeHint: 'Desk Essential',
    citizenClues: ['Ceramic', 'Ring-Stain', 'Handle', 'Caffeine', 'World-Best', 'Coaster'],
    imposterClues: ['Morning', 'Warm', 'Desk', 'Sip', 'Roast', 'Cup'],
    decoyOptions: ['Coffee Mug', 'Thermos', 'Teacup', 'Tumbler', 'French Press', 'Water Bottle'],
  },
  {
    id: 'wk-headphones',
    word: 'Headphones',
    category: 'workplace',
    categoryLabel: 'Office & Daily Life',
    vibeHint: 'Focus Gear',
    citizenClues: ['Noise-Canceling', 'Cushions', 'Podcast', 'Over-Ear', 'Playlist', 'Unplugged'],
    imposterClues: ['Audio', 'Focus', 'Bluetooth', 'Volume', 'Music', 'Desk'],
    decoyOptions: ['Headphones', 'Earbuds', 'Microphone', 'Speaker', 'Hearing Aid', 'Walkman'],
  },
];

export function getWordsForCategory(category: CategoryId, customWords: string[] = []): WordEntry[] {
  if (category === 'custom' && customWords.length > 0) {
    return customWords.map((raw, idx) => {
      const cleaned = raw.trim();
      const others = customWords
        .map((w) => w.trim())
        .filter((w) => w.toLowerCase() !== cleaned.toLowerCase());
      const fallbacks = ['Notebook', 'Secret Base', 'Pizza', 'Sunglasses', 'Time Machine'];
      const decoys = Array.from(new Set([cleaned, ...others, ...fallbacks])).slice(0, 6);
      return {
        id: `custom-${idx}-${cleaned.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        word: cleaned,
        category: 'custom',
        categoryLabel: 'Custom Group Pack',
        vibeHint: 'Group Custom Topic',
        citizenClues: ['Classic', 'Specific', 'Memorable', 'Familiar', 'Obvious', 'Inside-Joke'],
        imposterClues: ['Interesting', 'Classic', 'Usual', 'Fun', 'Common', 'Tricky'],
        decoyOptions: decoys,
      };
    });
  }

  if (category === 'all' || category === 'custom') {
    return WORD_BANK;
  }

  const filtered = WORD_BANK.filter((entry) => entry.category === category);
  return filtered.length > 0 ? filtered : WORD_BANK;
}
