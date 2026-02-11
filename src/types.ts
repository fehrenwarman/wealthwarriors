// Pet Types
export type PetType = 'dragon' | 'eagle' | 'wolf' | 'lion' | 'turtle' | 'owl';

export interface Pet {
  id: string;
  type: PetType;
  name: string;
  level: number; // 0=egg, 1=baby, 2=young, 3=teen, 4=adult, 5=elder
  createdAt: string;
}

export interface StablePet {
  id: string;
  type: PetType;
  name: string;
  level: 5;
  raisedToElderAt: string;
}

export const PET_OPTIONS: { type: PetType; emoji: string; name: string; description: string }[] = [
  { type: 'dragon', emoji: '🐉', name: 'Dragon', description: 'Fierce and loyal, guards your treasure' },
  { type: 'eagle', emoji: '🦅', name: 'Eagle', description: 'Soars high, sees the big picture' },
  { type: 'wolf', emoji: '🐺', name: 'Wolf', description: 'Strong pack instincts, steady growth' },
  { type: 'lion', emoji: '🦁', name: 'Lion', description: 'Courageous, king of savings' },
  { type: 'turtle', emoji: '🐢', name: 'Turtle', description: 'Slow and steady wins the race' },
  { type: 'owl', emoji: '🦉', name: 'Owl', description: 'Wise investor, patient wealth' },
];

export const PET_LEVELS = [
  { level: 0, name: 'Egg', minBalance: 0, emoji: '🥚' },
  { level: 1, name: 'Baby', minBalance: 25, emoji: '🐣' },
  { level: 2, name: 'Young', minBalance: 100, emoji: '🐤' },
  { level: 3, name: 'Teen', minBalance: 250, emoji: '🦅' },
  { level: 4, name: 'Adult', minBalance: 500, emoji: '🦅' },
  { level: 5, name: 'Elder', minBalance: 1000, emoji: '👑' },
];

export function getPetLevel(saveBalance: number, baseline: number = 0): number {
  const effectiveBalance = Math.max(0, saveBalance - baseline);
  if (effectiveBalance >= 1000) return 5;
  if (effectiveBalance >= 500) return 4;
  if (effectiveBalance >= 250) return 3;
  if (effectiveBalance >= 100) return 2;
  if (effectiveBalance >= 25) return 1;
  return 0;
}

export function getPetLevelName(level: number): string {
  return PET_LEVELS[level]?.name || 'Egg';
}

export function getNextPetLevelThreshold(level: number): number {
  if (level >= 5) return 1000;
  return PET_LEVELS[level + 1]?.minBalance || 1000;
}

export function getPetEmoji(type: PetType, level: number): string {
  if (level === 0) return '🥚';
  const petOption = PET_OPTIONS.find(p => p.type === type);
  if (level === 5) return `👑${petOption?.emoji || '🐉'}`;
  return petOption?.emoji || '🐉';
}

// Warrior/XP System
export const WARRIOR_RANKS = [
  { rank: 1, name: 'Novice Warrior', emoji: '⚔️', minXP: 0, description: 'Just starting your quest' },
  { rank: 2, name: 'Bronze Warrior', emoji: '🥉', minXP: 100, description: 'Learning the basics' },
  { rank: 3, name: 'Silver Warrior', emoji: '🥈', minXP: 300, description: 'Building good habits' },
  { rank: 4, name: 'Gold Warrior', emoji: '🥇', minXP: 600, description: 'Strong money skills' },
  { rank: 5, name: 'Platinum Warrior', emoji: '💎', minXP: 1000, description: 'Expert level' },
  { rank: 6, name: 'Diamond Warrior', emoji: '💠', minXP: 2000, description: 'Master of money' },
  { rank: 7, name: 'Legendary Warrior', emoji: '👑', minXP: 4000, description: 'Elite steward' },
];

export function getWarriorRank(totalXP: number): number {
  for (let i = WARRIOR_RANKS.length - 1; i >= 0; i--) {
    if (totalXP >= WARRIOR_RANKS[i].minXP) {
      return WARRIOR_RANKS[i].rank;
    }
  }
  return 1;
}

export function getWarriorRankInfo(rank: number) {
  return WARRIOR_RANKS.find(r => r.rank === rank) || WARRIOR_RANKS[0];
}

export function getNextRankXP(currentRank: number): number {
  const nextRank = WARRIOR_RANKS.find(r => r.rank === currentRank + 1);
  return nextRank?.minXP || WARRIOR_RANKS[WARRIOR_RANKS.length - 1].minXP;
}

export function getCurrentRankMinXP(rank: number): number {
  return WARRIOR_RANKS.find(r => r.rank === rank)?.minXP || 0;
}

// XP Awards (action-based, not dollar-based)
export const XP_REWARDS = {
  ALLOCATE_TO_BUCKET: 1,    // Per bucket allocated to (max 3 per allocation)
  PET_LEVEL_UP: 10,         // When pet evolves to next level
  COMPLETE_GOAL: 10,        // When purchasing a spend goal
  COMPLETE_DONATION: 10,    // When completing a donation goal
  EARN_INTEREST: 1,         // Monthly interest earned
};

// Spending Goals
export interface SpendingGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  visual?: string;
  visualType?: 'emoji' | 'image' | 'gif';
  imageUrl?: string;
  linkUrl?: string;
  completed: boolean;
  purchased: boolean;
  purchasedAt?: string;
  createdAt: string;
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

// Badges
export interface Badge {
  type: string;
  name: string;
  threshold: number;
  earnedAt: string;
}

export const SHARE_BADGES = [
  { type: 'community-starter', name: 'Community Starter', threshold: 10, emoji: '🌱', description: 'First steps to making a difference' },
  { type: 'community-helper', name: 'Community Helper', threshold: 25, emoji: '🤝', description: 'Building connections through giving' },
  { type: 'community-builder', name: 'Community Builder', threshold: 50, emoji: '🏘️', description: 'A pillar of your community' },
  { type: 'community-champion', name: 'Community Champion', threshold: 100, emoji: '🌟', description: 'A true leader in giving back' },
];

// Transactions
export interface Transaction {
  id: string;
  type: 'allocation' | 'interest' | 'goal_purchase' | 'donation' | 'grant';
  amount: number;
  bucket?: 'save' | 'spend' | 'share';
  description: string;
  xpEarned?: number;
  timestamp: string;
}

// Buckets
export interface SaveBucket {
  balance: number;
  interestRate: number;
  baseline: number; // Initial lump sum that doesn't count toward pet growth
}

export interface SpendBucket {
  balance: number;
  goals: SpendingGoal[];
}

export interface ShareBucket {
  balance: number;
  totalGiven: number;
  customCauses?: Cause[];
}

export interface Buckets {
  save: SaveBucket;
  spend: SpendBucket;
  share: ShareBucket;
}

// Kid
export interface Kid {
  id: string;
  name: string;
  age: number;
  avatar: string;

  // Warrior Progression
  totalXP: number;
  warriorRank: number;

  // Pet System
  currentPet: Pet | null;
  petStable: StablePet[];

  buckets: Buckets;
  pendingAllocation: number | null;
  badges: Badge[];
  transactions: Transaction[];
}

// Causes for donation
export type Cause = {
  id: string;
  name: string;
  emoji?: string;
  imageUrl?: string;
  description: string;
  isCustom?: boolean;
};

export const CAUSES: Cause[] = [
  { id: 'animal-shelter', name: 'Animal Shelter', emoji: '🐶', description: 'Help homeless pets find loving homes' },
  { id: 'food-bank', name: 'Food Bank', emoji: '🍎', description: 'Feed hungry families in need' },
  { id: 'ocean-cleanup', name: 'Ocean Cleanup', emoji: '🌊', description: 'Keep our oceans clean and healthy' },
  { id: 'library', name: 'Library', emoji: '📚', description: 'Help kids discover the joy of reading' },
  { id: 'plant-trees', name: 'Plant Trees', emoji: '🌳', description: 'Grow forests for a greener planet' },
  { id: 'kids-hospital', name: 'Kids Hospital', emoji: '🏥', description: 'Help sick children get better' },
];

// Family Settings
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

export const AVATAR_OPTIONS = ['⚔️', '🛡️', '🏆', '💎', '🦅', '🐉', '🔥', '⚡', '🌟', '👑'];
