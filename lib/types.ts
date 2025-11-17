export type GameType = 'valorant' | 'apex' | 'fortnite' | '2xko';

export type TeamSize = 'duo' | 'trio' | 'squad' | '5-stack';

export interface TeamRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  game: GameType;
  teamSize: TeamSize;
  price: number;
  status: 'pending' | 'matched' | 'completed' | 'cancelled';
  createdAt: Date;
  paymentId?: string;
  matchedWith?: string[];
  rank?: string;
  region?: string;
  preferredPlayTime?: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: Date;
}

export interface GameConfig {
  name: string;
  id: GameType;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    gradient: string;
  };
  font: {
    display: string;
    body: string;
  };
  teamSizes: {
    size: TeamSize;
    label: string;
    price: number;
    slots: number;
  }[];
  ranks: string[];
  image: string;
}
