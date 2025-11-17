import { GameConfig } from './types';

export const gameConfigs: GameConfig[] = [
  {
    name: 'VALORANT',
    id: 'valorant',
    theme: {
      primary: '#FF4655',
      secondary: '#0F1923',
      accent: '#FFFBF5',
      gradient: 'from-red-600 via-red-500 to-black',
    },
    font: {
      display: 'Oswald',
      body: 'Rajdhani',
    },
    teamSizes: [
      { size: 'duo', label: 'Find a Duo', price: 50, slots: 2 },
      { size: 'trio', label: 'Find 1 in Trio', price: 150, slots: 3 },
      { size: '5-stack', label: 'Find 1 in 5-Stack', price: 250, slots: 5 },
    ],
    ranks: [
      'Iron 1', 'Iron 2', 'Iron 3',
      'Bronze 1', 'Bronze 2', 'Bronze 3',
      'Silver 1', 'Silver 2', 'Silver 3',
      'Gold 1', 'Gold 2', 'Gold 3',
      'Platinum 1', 'Platinum 2', 'Platinum 3',
      'Diamond 1', 'Diamond 2', 'Diamond 3',
      'Ascendant 1', 'Ascendant 2', 'Ascendant 3',
      'Immortal 1', 'Immortal 2', 'Immortal 3',
      'Radiant'
    ],
    image: '/images/valorant-bg.jpg',
  },
  {
    name: 'APEX LEGENDS',
    id: 'apex',
    theme: {
      primary: '#DA292E',
      secondary: '#1B1F23',
      accent: '#F89A1E',
      gradient: 'from-orange-500 via-red-600 to-gray-900',
    },
    font: {
      display: 'Orbitron',
      body: 'Orbitron',
    },
    teamSizes: [
      { size: 'duo', label: 'Find a Duo', price: 50, slots: 2 },
      { size: 'trio', label: 'Find 1 in Trio', price: 150, slots: 3 },
    ],
    ranks: [
      'Rookie I', 'Rookie II', 'Rookie III', 'Rookie IV',
      'Bronze I', 'Bronze II', 'Bronze III', 'Bronze IV',
      'Silver I', 'Silver II', 'Silver III', 'Silver IV',
      'Gold I', 'Gold II', 'Gold III', 'Gold IV',
      'Platinum I', 'Platinum II', 'Platinum III', 'Platinum IV',
      'Diamond I', 'Diamond II', 'Diamond III', 'Diamond IV',
      'Master',
      'Predator'
    ],
    image: '/images/apex-bg.jpg',
  },
  {
    name: 'FORTNITE',
    id: 'fortnite',
    theme: {
      primary: '#7B3FF2',
      secondary: '#0A0E27',
      accent: '#00D9FF',
      gradient: 'from-purple-600 via-blue-500 to-cyan-400',
    },
    font: {
      display: 'Rubik',
      body: 'Rubik',
    },
    teamSizes: [
      { size: 'duo', label: 'Find a Duo', price: 50, slots: 2 },
      { size: 'squad', label: 'Find Squad Member', price: 250, slots: 4 },
    ],
    ranks: [
      'Bronze I', 'Bronze II', 'Bronze III',
      'Silver I', 'Silver II', 'Silver III',
      'Gold I', 'Gold II', 'Gold III',
      'Platinum I', 'Platinum II', 'Platinum III',
      'Diamond I', 'Diamond II', 'Diamond III',
      'Elite', 'Champion', 'Unreal'
    ],
    image: '/images/fortnite-bg.jpg',
  },
  {
    name: '2XKO',
    id: '2xko',
    theme: {
      primary: '#D4AF37',
      secondary: '#0A1428',
      accent: '#C89B3C',
      gradient: 'from-yellow-600 via-amber-500 to-gray-900',
    },
    font: {
      display: 'Cinzel',
      body: 'Cinzel',
    },
    teamSizes: [
      { size: 'duo', label: 'Find a Partner', price: 50, slots: 2 },
    ],
    ranks: [
      'Iron', 'Bronze', 'Silver', 'Gold',
      'Platinum', 'Emerald', 'Diamond',
      'Master', 'Grandmaster', 'Challenger'
    ],
    image: '/images/2xko-bg.jpg',
  },
];
