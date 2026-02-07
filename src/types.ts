export interface SpendingGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  completed: boolean;
  purchased: boolean;
  purchasedAt?: string;
  createdAt: string;
  icon: string;
}

export const GOAL_ICONS = [
  { emoji: '🎮', label: 'Video Game' },
  { emoji: '🧸', label: 'Toy' },
  { emoji: '📱', label: 'Tech' },
  { emoji: '👟', label: 'Shoes' },
  { emoji: '👕', label: 'Clothes' },
  { emoji: '🎧', label: 'Headphones' },
  { emoji: '📚', label: 'Books' },
  { emoji: '🎨', label: 'Art Supplies' },
  { emoji: '⚽', label: 'Sports' },
  { emoji: '🎸', label: 'Music' },
  { emoji: '🎁', label: 'Gift' },
  { emoji: '🍿', label: 'Entertainment' },
  { emoji: '🛹', label: 'Skateboard' },
  { emoji: '🚲', label: 'Bike' },
  { emoji: '💄', label: 'Beauty' },
  { emoji: '🎒', label: 'Backpack' },
];

export interface Badge {
  type: string;
  name: string;
  threshold: number;
  earnedAt: string;
}

export interface Transaction {
  id: string;
  type: 'allocation' | 'interest' | 'goal_purchase' | 'donation' | 'grant';
  amount: number;
  bucket?: 'save' | 'spend' | 'share';
  description: string;
  timestamp: string;
}

export interface SaveBucket {
  balance: number;
  interestRate: number;
}

export interface SpendBucket {
  balance: number;
  goals: SpendingGoal[];
}

export interface ShareBucket {
  balance: number;
  totalGiven: number;
}

export interface Buckets {
  save: SaveBucket;
  spend: SpendBucket;
  share: ShareBucket;
}

export interface Kid {
  id: string;
  name: string;
  age: number;
  avatar: string;
  piggyLevel: number;
  buckets: Buckets;
  pendingAllocation: number | null;
  badges: Badge[];
  transactions: Transaction[];
}

export interface WeeklyAllowances {
  [kidId: string]: number;
}

export interface FamilySettings {
  weeklyAllowances: WeeklyAllowances;
  parentPin?: string;
}

export interface Family {
  id: string;
  name: string;
  kids: Kid[];
  settings: FamilySettings;
}

export interface AppState {
  family: Family | null;
  currentMode: 'parent' | 'kid';
  selectedKidId: string | null;
}

export type Cause = {
  id: string;
  name: string;
  emoji: string;
  description: string;
};

export const CAUSES: Cause[] = [
  { id: 'animal-shelter', name: 'Animal Shelter', emoji: '🐶', description: 'Help homeless pets find loving homes' },
  { id: 'food-bank', name: 'Food Bank', emoji: '🍎', description: 'Feed hungry families in need' },
  { id: 'ocean-cleanup', name: 'Ocean Cleanup', emoji: '🌊', description: 'Keep our oceans clean and healthy' },
  { id: 'library', name: 'Library', emoji: '📚', description: 'Help kids discover the joy of reading' },
  { id: 'plant-trees', name: 'Plant Trees', emoji: '🌳', description: 'Grow forests for a greener planet' },
  { id: 'kids-hospital', name: 'Kids Hospital', emoji: '🏥', description: 'Help sick children get better' },
];

export const SHARE_BADGES = [
  { type: 'first-share', name: 'First Share', threshold: 10, emoji: '🥉' },
  { type: 'generous-giver', name: 'Generous Giver', threshold: 25, emoji: '🥈' },
  { type: 'super-sharer', name: 'Super Sharer', threshold: 50, emoji: '🥇' },
  { type: 'champion', name: 'Champion of Giving', threshold: 100, emoji: '👑' },
];

export const AVATAR_OPTIONS = ['⚔️', '🛡️', '🏆', '💎', '🦅', '🐉', '🔥', '⚡', '🌟', '👑'];

export function calculatePiggyLevel(saveBalance: number): number {
  if (saveBalance >= 100) return 4;
  if (saveBalance >= 50) return 3;
  if (saveBalance >= 25) return 2;
  return 1;
}

export function getPiggyLevelName(level: number): string {
  switch (level) {
    case 1: return 'Recruit';
    case 2: return 'Guardian';
    case 3: return 'Champion';
    case 4: return 'Legend';
    default: return 'Recruit';
  }
}

export function getNextLevelThreshold(level: number): number {
  switch (level) {
    case 1: return 25;
    case 2: return 50;
    case 3: return 100;
    case 4: return 100;
    default: return 25;
  }
}

export function getPreviousLevelThreshold(level: number): number {
  switch (level) {
    case 1: return 0;
    case 2: return 25;
    case 3: return 50;
    case 4: return 100;
    default: return 0;
  }
}
