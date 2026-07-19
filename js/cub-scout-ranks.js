/**
 * @typedef {Object} RankAdventure
 * @property {string} slug
 * @property {string} name
 * @property {string} description
 * @property {string} icon
 * @property {string} iconAlt
 * @property {string} category
 * @property {string} officialUrl
 */

/**
 * @typedef {Object} CubScoutRank
 * @property {string} slug
 * @property {string} name
 * @property {string} title
 * @property {string} emblem
 * @property {number} emblemWidth
 * @property {number} emblemHeight
 * @property {string} grade
 * @property {string} ageRange
 * @property {string} introduction
 * @property {string} officialRankUrl
 * @property {string} officialRequirementsUrl
 * @property {string} accentColor
 * @property {RankAdventure[]} requiredAdventures
 * @property {RankAdventure[]} electiveAdventures
 */

(function (root, factory) {
  const data = factory();
  if (typeof module === 'object' && module.exports) module.exports = data;
  root.cubScoutRanks = data.cubScoutRanks;
  root.cubScoutRankOrder = data.cubScoutRankOrder;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const officialBase = 'https://www.scouting.org';
  const rankBase = `${officialBase}/programs/cub-scouts/adventures`;

  function slugify(value) {
    return value
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function adventure(name, description, category, rankSlug, officialSlug) {
    const slug = slugify(name);
    return {
      slug,
      name,
      description,
      category,
      icon: `/assets/images/cub-scouts/adventures/${rankSlug}/${slug}.jpg`,
      iconAlt: `${name} adventure insignia`,
      officialUrl: `${officialBase}/cub-scout-adventures/${officialSlug || slug}/`,
    };
  }

  function required(rankSlug, items) {
    return items.map(([name, category, description, officialSlug]) => adventure(name, description, category, rankSlug, officialSlug));
  }

  function elective(rankSlug, names) {
    return names.map((name) => adventure(name, 'An elective adventure families may complete with their den, pack, or at home.', 'Elective', rankSlug));
  }

  const cubScoutRanks = {
    lion: {
      slug: 'lion',
      name: 'Lion',
      title: 'Lion Adventures',
      emblem: '/assets/ranks/lion.jpg',
      emblemWidth: 530,
      emblemHeight: 500,
      grade: 'Kindergarten',
      ageRange: 'Ages 5-6',
      introduction: 'Lion Adventures are fun, hands-on activities that help Kindergarten children learn new things, build confidence, and grow a love for learning and the outdoors.',
      officialRequirementsUrl: `${rankBase}/lion/`,
      accentColor: '#f2a900',
      requiredAdventures: required('lion', [
        ['Bobcat Adventure', 'Character & Leadership', 'Build den belonging and learn the first safety and family foundations.', 'lion-bobcat'],
        ['Fun on the Run', 'Personal Fitness', 'Practice active play, healthy habits, and taking care of your body.'],
        ["Lion's Roar", 'Personal Safety', 'Learn simple safety steps and how to ask trusted adults for help.', 'lions-roar'],
        ["Lion's Pride", 'Family & Reverence', 'Explore family, gratitude, and reverence in age-appropriate ways.', 'lions-pride'],
        ['King of the Jungle', 'Citizenship', 'Practice helping the group, using good manners, and being kind.'],
        ['Mountain Lion', 'Outdoors', 'Get outside, explore nature, and learn basic outdoor awareness.'],
      ]),
      electiveAdventures: elective('lion', [
        'Build It Up, Knock It Down',
        'Champions for Nature Lion',
        'Count On Me',
        'Everyday Tech',
        'Gizmos and Gadgets',
        'Go Fish',
        "I'll Do It Myself",
        "Let's Camp Lion",
        'On a Roll',
        'On Your Mark',
        'Pick My Path',
        'Race Time Lion',
        'Ready, Set, Grow',
        'Time to Swim',
        'Archery Lion',
        'Slingshot',
      ]),
    },
    tiger: {
      slug: 'tiger',
      name: 'Tiger',
      title: 'Tiger Adventures',
      emblem: '/assets/ranks/tiger.jpg',
      emblemWidth: 720,
      emblemHeight: 720,
      grade: '1st Grade',
      ageRange: 'Ages 6-7',
      introduction: 'Tiger Adventures help first grade Scouts learn by doing with their adult partners, their den, and their pack.',
      officialRequirementsUrl: `${rankBase}/tiger/`,
      accentColor: '#f05a28',
      requiredAdventures: required('tiger', [
        ['Bobcat Adventure', 'Character & Leadership', 'Build den belonging and learn the first safety and family foundations.', 'tiger-bobcat'],
        ['Tiger Bites', 'Personal Fitness', 'Practice nutrition, movement, and personal wellness.'],
        ["Tiger's Roar", 'Personal Safety', 'Learn safety habits and how to respond when something feels unsafe.', 'tigers-roar'],
        ['Tiger Circles', 'Family & Reverence', 'Talk about family, gratitude, and reverence with trusted adults.'],
        ['Team Tiger', 'Citizenship', 'Practice teamwork, service, and being part of a community.'],
        ['Tigers in the Wild', 'Outdoors', 'Explore the outdoors and learn simple outdoor skills.'],
      ]),
      electiveAdventures: elective('tiger', [
        'Champions for Nature Tiger',
        'Curiosity, Intrigue, and Magical Mysteries',
        'Designed by Tiger',
        'Fish On',
        'Floats and Boats',
        'Good Knights',
        "Let's Camp Tiger",
        'Race Time Tiger',
        'Rolling Tigers',
        'Safe and Smart',
        'Sky is the Limit',
        'Stories in Shapes',
        'Summertime Fun Tiger',
        'Tech All Around',
        'Tiger Tag',
        'Tiger-iffic!',
        'Tigers in the Water',
        'Archery Tiger',
        'Slingshot',
        'BB Guns',
      ]),
    },
    wolf: {
      slug: 'wolf',
      name: 'Wolf',
      title: 'Wolf Adventures',
      emblem: '/assets/ranks/wolf.jpg',
      emblemWidth: 720,
      emblemHeight: 720,
      grade: '2nd Grade',
      ageRange: 'Ages 7-8',
      introduction: 'Wolf Adventures give second grade Scouts practical ways to build skills, confidence, fitness, safety, service, and outdoor curiosity.',
      officialRequirementsUrl: `${rankBase}/wolf/`,
      accentColor: '#c41230',
      requiredAdventures: required('wolf', [
        ['Bobcat Adventure', 'Character & Leadership', 'Build den belonging and learn the first safety and family foundations.', 'wolf-bobcat'],
        ['Running With the Pack', 'Personal Fitness', 'Explore healthy choices, movement, rest, and personal wellness.'],
        ['Safety in Numbers', 'Personal Safety', 'Practice safety awareness and trusted-adult communication.'],
        ['Footsteps', 'Family & Reverence', 'Explore reverence, gratitude, and family values.'],
        ['Council Fire', 'Citizenship', 'Learn about community, service, and doing your part.'],
        ['Paws on the Path', 'Outdoors', 'Practice outdoor skills, hiking awareness, and preparedness.'],
      ]),
      electiveAdventures: elective('wolf', [
        'A Wolf Goes Fishing',
        'Adventures in Coins',
        'Air of the Wolf',
        'Champions for Nature Wolf',
        'Code of the Wolf',
        'Computing Wolves',
        'Cubs Who Care',
        'Digging in the Past',
        'Finding Your Way',
        'Germs Alive!',
        "Let's Camp Wolf",
        'Paws for Water',
        'Paws of Skill',
        'Pedal With the Pack',
        'Race Time Wolf',
        'Spirit of the Water',
        'Summertime Fun Wolf',
        'Archery Wolf',
        'Slingshot',
        'BB Guns',
      ]),
    },
    bear: {
      slug: 'bear',
      name: 'Bear',
      title: 'Bear Adventures',
      emblem: '/assets/ranks/bear.jpg',
      emblemWidth: 720,
      emblemHeight: 720,
      grade: '3rd Grade',
      ageRange: 'Ages 8-9',
      introduction: 'Bear Adventures help third grade Scouts stretch their independence through service, safety, outdoor skills, creativity, and discovery.',
      officialRequirementsUrl: `${rankBase}/bear/`,
      accentColor: '#0082a7',
      requiredAdventures: required('bear', [
        ['Bobcat Adventure', 'Character & Leadership', 'Build den belonging and learn the first safety and family foundations.', 'bear-bobcat'],
        ['Bear Strong', 'Personal Fitness', 'Practice strength, wellness, and healthy habits.'],
        ['Standing Tall', 'Personal Safety', 'Learn ways to stay safe and ask for help.'],
        ['Fellowship', 'Family & Reverence', 'Explore respect, gratitude, and family values.'],
        ['Paws for Action', 'Citizenship', 'Serve others and learn about community responsibility.'],
        ['Bear Habitat', 'Outdoors', 'Explore outdoor spaces, wildlife, and conservation.'],
      ]),
      electiveAdventures: elective('bear', [
        'A Bear Goes Fishing',
        'Balancing Bears',
        'Baloo the Builder',
        'Bears Afloat',
        'Bears on Bikes',
        'Champions for Nature Bear',
        'Chef Tech',
        'Critter Care',
        'Forensics',
        "Let's Camp Bear",
        'Marble Madness',
        'Race Time Bear',
        'Roaring Laughter',
        'Salmon Run',
        'Summertime Fun Bear',
        'Super Science',
        'Whittling',
        'Archery Bear',
        'Slingshot',
        'BB Guns',
      ]),
    },
    webelos: {
      slug: 'webelos',
      name: 'Webelos',
      title: 'Webelos Adventures',
      emblem: '/assets/ranks/webelos.jpg',
      emblemWidth: 591,
      emblemHeight: 720,
      grade: '4th Grade',
      ageRange: 'Ages 9-10',
      introduction: 'Webelos Adventures prepare fourth grade Scouts for more leadership, stronger outdoor skills, and the next steps in Scouting.',
      officialRequirementsUrl: `${rankBase}/webelos/`,
      accentColor: '#082b57',
      requiredAdventures: required('webelos', [
        ['Bobcat Adventure', 'Character & Leadership', 'Build den belonging and learn the first safety and family foundations.', 'webelos-bobcat'],
        ['Stronger, Faster, Higher', 'Personal Fitness', 'Build fitness habits and learn how your body grows stronger.'],
        ['My Safety', 'Personal Safety', 'Practice safety planning and trusted-adult communication.'],
        ['My Family', 'Family & Reverence', 'Explore family identity, respect, and reverence.'],
        ['My Community', 'Citizenship', 'Learn how communities work and how Scouts can help.'],
        ['Webelos Walkabout', 'Outdoors', 'Prepare for and complete an outdoor walkabout.'],
      ]),
      electiveAdventures: elective('webelos', [
        'Aquanaut',
        'Art Explosion',
        'Aware and Care',
        'Build It',
        'Catch the Big One',
        'Champions for Nature Webelos',
        "Chef's Knife",
        'Earth Rocks',
        "Let's Camp Webelos",
        'Math on the Trail',
        'Modular Design',
        'Paddle Onward',
        'Pedal Away',
        'Race Time Webelos',
        'Summertime Fun Webelos',
        'Tech on the Trail',
        'Yo-yo',
        'Archery Webelos',
        'Slingshot',
        'BB Guns',
      ]),
    },
    'arrow-of-light': {
      slug: 'arrow-of-light',
      name: 'Arrow of Light',
      title: 'Arrow of Light Adventures',
      emblem: '/assets/ranks/aol.jpg',
      emblemWidth: 720,
      emblemHeight: 286,
      grade: '5th Grade',
      ageRange: 'Ages 10-11',
      introduction: 'Arrow of Light Adventures help fifth grade Scouts practice leadership, outdoor readiness, citizenship, and the skills that prepare them for Scouts BSA.',
      officialRequirementsUrl: `${rankBase}/arrow-of-light/`,
      accentColor: '#4b8b3b',
      requiredAdventures: required('arrow-of-light', [
        ['Bobcat Adventure', 'Character & Leadership', 'Build den belonging and learn the first safety and family foundations.', 'arrow-of-light-bobcat'],
        ['Personal Fitness', 'Personal Fitness', 'Practice fitness, health, and personal readiness.'],
        ['First Aid', 'Personal Safety', 'Learn first-aid awareness and emergency response basics.'],
        ['Duty to God', 'Family & Reverence', 'Explore reverence and personal values with family guidance.'],
        ['Citizenship', 'Citizenship', 'Practice leadership, service, and community responsibility.'],
        ['Outdoor Adventurer', 'Outdoors', 'Build outdoor skills and prepare for more independent adventures.'],
      ]),
      electiveAdventures: elective('arrow-of-light', [
        'Champions for Nature AOL',
        'Cycling',
        'Engineer',
        'Estimations',
        'Fishing',
        'High Tech Outdoors',
        'Into the Wild',
        'Into the Woods',
        'Knife Safety',
        'Paddle Craft',
        'Race Time AOL',
        'Summertime Fun AOL',
        'Swimming',
        'Archery Arrow of Light',
        'Slingshot',
        'BB Guns',
      ]),
    },
  };

  Object.values(cubScoutRanks).forEach((rank) => {
    rank.officialRankUrl = rank.officialRequirementsUrl;
  });

  return {
    cubScoutRanks,
    cubScoutRankOrder: ['lion', 'tiger', 'wolf', 'bear', 'webelos', 'arrow-of-light'],
  };
}));
