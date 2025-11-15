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
    teamSizes: [
      { size: 'duo', label: 'Find a Duo', price: 50, slots: 2 },
      { size: 'trio', label: 'Find 1 in Trio', price: 150, slots: 3 },
      { size: '5-stack', label: 'Find 1 in 5-Stack', price: 250, slots: 5 },
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
    teamSizes: [
      { size: 'duo', label: 'Find a Duo', price: 50, slots: 2 },
      { size: 'trio', label: 'Find 1 in Trio', price: 150, slots: 3 },
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
    teamSizes: [
      { size: 'duo', label: 'Find a Duo', price: 50, slots: 2 },
      { size: 'squad', label: 'Find Squad Member', price: 250, slots: 4 },
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
    teamSizes: [
      { size: 'duo', label: 'Find a Partner', price: 50, slots: 2 },
    ],
    image: '/images/2xko-bg.jpg',
  },
];
