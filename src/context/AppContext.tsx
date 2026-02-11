import React, { createContext, useContext, useReducer, useEffect, useState, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  getWarriorRank,
  getPetLevel,
  SHARE_BADGES,
  XP_REWARDS,
  type PetType
} from '../types';
import type { AppState, Family, Kid, Transaction, SpendingGoal, Badge, Pet, StablePet, Cause } from '../types';
import { dataService } from '../lib/dataService';
import { isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY = 'wealth-warriors-data';

type AppAction =
  | { type: 'SET_FAMILY'; payload: Family }
  | { type: 'ADD_KID'; payload: { name: string; age: number; avatar: string } }
  | { type: 'UPDATE_KID'; payload: { kidId: string; name?: string; age?: number; avatar?: string } }
  | { type: 'GRANT_MONEY'; payload: { kidId: string; amount: number; description: string } }
  | { type: 'ALLOCATE_MONEY'; payload: { kidId: string; save: number; spend: number; share: number } }
  | { type: 'SET_INTEREST_RATE'; payload: { kidId: string; rate: number } }
  | { type: 'SET_BASELINE'; payload: { kidId: string; baseline: number } }
  | { type: 'ADD_GOAL'; payload: { kidId: string; name: string; targetAmount: number; icon: string; imageUrl?: string; linkUrl?: string } }
  | { type: 'ADD_CUSTOM_CAUSE'; payload: { kidId: string; cause: Cause } }
  | { type: 'FUND_GOAL'; payload: { kidId: string; goalId: string; amount: number } }
  | { type: 'PURCHASE_GOAL'; payload: { kidId: string; goalId: string } }
  | { type: 'DONATE'; payload: { kidId: string; amount: number; causeName: string } }
  | { type: 'SET_WEEKLY_ALLOWANCE'; payload: { kidId: string; amount: number } }
  | { type: 'APPLY_INTEREST'; payload: { kidId: string } }
  | { type: 'SWITCH_MODE'; payload: 'parent' | 'kid' }
  | { type: 'SELECT_KID'; payload: string | null }
  | { type: 'SET_PARENT_PIN'; payload: string }
  | { type: 'SET_PET'; payload: { kidId: string; petType: PetType; petName: string } }
  | { type: 'HATCH_NEW_PET'; payload: { kidId: string; petType: PetType; petName: string } }
  | { type: 'ADD_XP'; payload: { kidId: string; amount: number } }
  | { type: 'LOAD_STATE'; payload: AppState }
  | { type: 'RESET' };

const initialState: AppState = {
  family: null,
  currentMode: 'parent',
  selectedKidId: null,
};

function checkAndAwardBadges(kid: Kid): Badge[] {
  const newBadges: Badge[] = [...kid.badges];
  const totalGiven = kid.buckets.share.totalGiven;

  for (const badgeDef of SHARE_BADGES) {
    const alreadyHas = newBadges.some(b => b.type === badgeDef.type);
    if (!alreadyHas && totalGiven >= badgeDef.threshold) {
      newBadges.push({
        type: badgeDef.type,
        name: badgeDef.name,
        threshold: badgeDef.threshold,
        earnedAt: new Date().toISOString(),
      });
    }
  }

  return newBadges;
}

function updatePetLevel(kid: Kid): Kid {
  if (!kid.currentPet) return kid;

  const baseline = kid.buckets.save.baseline || 0;
  const newLevel = getPetLevel(kid.buckets.save.balance, baseline);

  // Check if pet reached Elder (level 5)
  if (newLevel === 5 && kid.currentPet.level < 5) {
    // Pet stays at level 5, will be moved to stable when user chooses new pet
    return {
      ...kid,
      currentPet: {
        ...kid.currentPet,
        level: 5,
      },
    };
  }

  if (newLevel !== kid.currentPet.level) {
    return {
      ...kid,
      currentPet: {
        ...kid.currentPet,
        level: newLevel,
      },
    };
  }

  return kid;
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_FAMILY': {
      return { ...state, family: action.payload };
    }

    case 'ADD_KID': {
      if (!state.family) return state;
      const newKid: Kid = {
        id: uuidv4(),
        name: action.payload.name,
        age: action.payload.age,
        avatar: action.payload.avatar,
        totalXP: 0,
        warriorRank: 1,
        currentPet: null,
        petStable: [],
        buckets: {
          save: { balance: 0, interestRate: 5, baseline: 0 },
          spend: { balance: 0, goals: [] },
          share: { balance: 0, totalGiven: 0 },
        },
        pendingAllocation: null,
        badges: [],
        transactions: [],
      };
      return {
        ...state,
        family: {
          ...state.family,
          kids: [...state.family.kids, newKid],
        },
      };
    }

    case 'UPDATE_KID': {
      if (!state.family) return state;
      const { kidId, name, age, avatar } = action.payload;
      return {
        ...state,
        family: {
          ...state.family,
          kids: state.family.kids.map(kid => {
            if (kid.id !== kidId) return kid;
            return {
              ...kid,
              ...(name !== undefined && { name }),
              ...(age !== undefined && { age }),
              ...(avatar !== undefined && { avatar }),
            };
          }),
        },
      };
    }

    case 'SET_PET': {
      if (!state.family) return state;
      const { kidId, petType, petName } = action.payload;
      return {
        ...state,
        family: {
          ...state.family,
          kids: state.family.kids.map(kid => {
            if (kid.id !== kidId) return kid;
            const baseline = kid.buckets.save.baseline || 0;
            const newPet: Pet = {
              id: uuidv4(),
              type: petType,
              name: petName,
              level: getPetLevel(kid.buckets.save.balance, baseline),
              createdAt: new Date().toISOString(),
            };
            return {
              ...kid,
              currentPet: newPet,
            };
          }),
        },
      };
    }

    case 'HATCH_NEW_PET': {
      if (!state.family) return state;
      const { kidId, petType, petName } = action.payload;
      return {
        ...state,
        family: {
          ...state.family,
          kids: state.family.kids.map(kid => {
            if (kid.id !== kidId) return kid;

            // Move current pet to stable if it's Elder
            let newStable = [...kid.petStable];
            if (kid.currentPet && kid.currentPet.level === 5) {
              const stablePet: StablePet = {
                id: kid.currentPet.id,
                type: kid.currentPet.type,
                name: kid.currentPet.name,
                level: 5,
                raisedToElderAt: new Date().toISOString(),
              };
              newStable = [...newStable, stablePet];
            }

            // Create new pet (starts at egg level 0)
            const newPet: Pet = {
              id: uuidv4(),
              type: petType,
              name: petName,
              level: 0, // Always starts as egg for new pet
              createdAt: new Date().toISOString(),
            };

            return {
              ...kid,
              currentPet: newPet,
              petStable: newStable,
            };
          }),
        },
      };
    }

    case 'ADD_XP': {
      if (!state.family) return state;
      const { kidId, amount } = action.payload;
      return {
        ...state,
        family: {
          ...state.family,
          kids: state.family.kids.map(kid => {
            if (kid.id !== kidId) return kid;
            const newTotalXP = kid.totalXP + amount;
            const newRank = getWarriorRank(newTotalXP);
            return {
              ...kid,
              totalXP: newTotalXP,
              warriorRank: newRank,
            };
          }),
        },
      };
    }

    case 'GRANT_MONEY': {
      if (!state.family) return state;
      const { kidId, amount, description } = action.payload;
      return {
        ...state,
        family: {
          ...state.family,
          kids: state.family.kids.map(kid => {
            if (kid.id !== kidId) return kid;
            const transaction: Transaction = {
              id: uuidv4(),
              type: 'grant',
              amount,
              description,
              timestamp: new Date().toISOString(),
            };
            return {
              ...kid,
              pendingAllocation: (kid.pendingAllocation || 0) + amount,
              transactions: [transaction, ...kid.transactions],
            };
          }),
        },
      };
    }

    case 'ALLOCATE_MONEY': {
      if (!state.family) return state;
      const { kidId, save, spend, share } = action.payload;
      return {
        ...state,
        family: {
          ...state.family,
          kids: state.family.kids.map(kid => {
            if (kid.id !== kidId) return kid;
            const timestamp = new Date().toISOString();
            const transactions: Transaction[] = [];

            // Calculate XP (action-based: 1 XP per bucket allocated to)
            let xpEarned = 0;
            if (save > 0) xpEarned += XP_REWARDS.ALLOCATE_TO_BUCKET;
            if (spend > 0) xpEarned += XP_REWARDS.ALLOCATE_TO_BUCKET;
            if (share > 0) xpEarned += XP_REWARDS.ALLOCATE_TO_BUCKET;

            // Check for pet level up bonus
            const baseline = kid.buckets.save.baseline || 0;
            const newSaveBalance = kid.buckets.save.balance + save;
            const oldPetLevel = kid.currentPet?.level || 0;
            const newPetLevel = getPetLevel(newSaveBalance, baseline);
            if (newPetLevel > oldPetLevel) {
              xpEarned += XP_REWARDS.PET_LEVEL_UP;
            }

            if (save > 0) {
              transactions.push({
                id: uuidv4(),
                type: 'allocation',
                amount: save,
                bucket: 'save',
                description: `Allocated $${save.toFixed(2)} to Save`,
                xpEarned: XP_REWARDS.ALLOCATE_TO_BUCKET,
                timestamp,
              });
            }
            if (spend > 0) {
              transactions.push({
                id: uuidv4(),
                type: 'allocation',
                amount: spend,
                bucket: 'spend',
                description: `Allocated $${spend.toFixed(2)} to Spend`,
                xpEarned: XP_REWARDS.ALLOCATE_TO_BUCKET,
                timestamp,
              });
            }
            if (share > 0) {
              transactions.push({
                id: uuidv4(),
                type: 'allocation',
                amount: share,
                bucket: 'share',
                description: `Allocated $${share.toFixed(2)} to Share`,
                xpEarned: XP_REWARDS.ALLOCATE_TO_BUCKET,
                timestamp,
              });
            }

            const newTotalXP = kid.totalXP + xpEarned;
            const newRank = getWarriorRank(newTotalXP);

            let updatedKid: Kid = {
              ...kid,
              pendingAllocation: null,
              totalXP: newTotalXP,
              warriorRank: newRank,
              buckets: {
                save: { ...kid.buckets.save, balance: newSaveBalance },
                spend: { ...kid.buckets.spend, balance: kid.buckets.spend.balance + spend },
                share: { ...kid.buckets.share, balance: kid.buckets.share.balance + share },
              },
              transactions: [...transactions, ...kid.transactions],
            };

            // Update pet level based on new save balance
            updatedKid = updatePetLevel(updatedKid);

            return updatedKid;
          }),
        },
      };
    }

    case 'SET_INTEREST_RATE': {
      if (!state.family) return state;
      const { kidId, rate } = action.payload;
      return {
        ...state,
        family: {
          ...state.family,
          kids: state.family.kids.map(kid => {
            if (kid.id !== kidId) return kid;
            return {
              ...kid,
              buckets: {
                ...kid.buckets,
                save: { ...kid.buckets.save, interestRate: rate },
              },
            };
          }),
        },
      };
    }

    case 'SET_BASELINE': {
      if (!state.family) return state;
      const { kidId, baseline } = action.payload;
      return {
        ...state,
        family: {
          ...state.family,
          kids: state.family.kids.map(kid => {
            if (kid.id !== kidId) return kid;
            // Recalculate pet level with new baseline
            const newPetLevel = getPetLevel(kid.buckets.save.balance, baseline);
            return {
              ...kid,
              currentPet: kid.currentPet ? { ...kid.currentPet, level: newPetLevel } : null,
              buckets: {
                ...kid.buckets,
                save: { ...kid.buckets.save, baseline },
              },
            };
          }),
        },
      };
    }

    case 'ADD_GOAL': {
      if (!state.family) return state;
      const { kidId, name, targetAmount, icon, imageUrl, linkUrl } = action.payload;
      const newGoal: SpendingGoal = {
        id: uuidv4(),
        name,
        targetAmount,
        currentAmount: 0,
        visual: icon,
        visualType: imageUrl ? 'image' : 'emoji',
        imageUrl,
        linkUrl,
        completed: false,
        purchased: false,
        createdAt: new Date().toISOString(),
      };
      return {
        ...state,
        family: {
          ...state.family,
          kids: state.family.kids.map(kid => {
            if (kid.id !== kidId) return kid;
            return {
              ...kid,
              buckets: {
                ...kid.buckets,
                spend: {
                  ...kid.buckets.spend,
                  goals: [...kid.buckets.spend.goals, newGoal],
                },
              },
            };
          }),
        },
      };
    }

    case 'ADD_CUSTOM_CAUSE': {
      if (!state.family) return state;
      const { kidId, cause } = action.payload;
      return {
        ...state,
        family: {
          ...state.family,
          kids: state.family.kids.map(kid => {
            if (kid.id !== kidId) return kid;
            return {
              ...kid,
              buckets: {
                ...kid.buckets,
                share: {
                  ...kid.buckets.share,
                  customCauses: [...(kid.buckets.share.customCauses || []), cause],
                },
              },
            };
          }),
        },
      };
    }

    case 'FUND_GOAL': {
      if (!state.family) return state;
      const { kidId, goalId, amount } = action.payload;
      return {
        ...state,
        family: {
          ...state.family,
          kids: state.family.kids.map(kid => {
            if (kid.id !== kidId) return kid;
            return {
              ...kid,
              buckets: {
                ...kid.buckets,
                spend: {
                  ...kid.buckets.spend,
                  goals: kid.buckets.spend.goals.map(goal => {
                    if (goal.id !== goalId) return goal;
                    const newAmount = goal.currentAmount + amount;
                    return {
                      ...goal,
                      currentAmount: newAmount,
                      completed: newAmount >= goal.targetAmount,
                    };
                  }),
                },
              },
            };
          }),
        },
      };
    }

    case 'PURCHASE_GOAL': {
      if (!state.family) return state;
      const { kidId, goalId } = action.payload;
      return {
        ...state,
        family: {
          ...state.family,
          kids: state.family.kids.map(kid => {
            if (kid.id !== kidId) return kid;
            const goal = kid.buckets.spend.goals.find(g => g.id === goalId);
            if (!goal || goal.purchased || kid.buckets.spend.balance < goal.targetAmount) {
              return kid;
            }

            // Award XP for completing goal
            const xpEarned = XP_REWARDS.COMPLETE_GOAL;
            const newTotalXP = kid.totalXP + xpEarned;
            const newRank = getWarriorRank(newTotalXP);

            const transaction: Transaction = {
              id: uuidv4(),
              type: 'goal_purchase',
              amount: -goal.targetAmount,
              bucket: 'spend',
              description: `Purchased: ${goal.name}`,
              xpEarned,
              timestamp: new Date().toISOString(),
            };
            return {
              ...kid,
              totalXP: newTotalXP,
              warriorRank: newRank,
              buckets: {
                ...kid.buckets,
                spend: {
                  balance: kid.buckets.spend.balance - goal.targetAmount,
                  goals: kid.buckets.spend.goals.map(g => {
                    if (g.id !== goalId) return g;
                    return {
                      ...g,
                      purchased: true,
                      purchasedAt: new Date().toISOString(),
                    };
                  }),
                },
              },
              transactions: [transaction, ...kid.transactions],
            };
          }),
        },
      };
    }

    case 'DONATE': {
      if (!state.family) return state;
      const { kidId, amount, causeName } = action.payload;
      return {
        ...state,
        family: {
          ...state.family,
          kids: state.family.kids.map(kid => {
            if (kid.id !== kidId) return kid;
            if (kid.buckets.share.balance < amount) return kid;

            // Award XP for completing donation (action-based)
            const xpEarned = XP_REWARDS.COMPLETE_DONATION;
            const newTotalXP = kid.totalXP + xpEarned;
            const newRank = getWarriorRank(newTotalXP);

            const transaction: Transaction = {
              id: uuidv4(),
              type: 'donation',
              amount: -amount,
              bucket: 'share',
              description: `Donated to ${causeName}`,
              xpEarned,
              timestamp: new Date().toISOString(),
            };
            const updatedKid: Kid = {
              ...kid,
              totalXP: newTotalXP,
              warriorRank: newRank,
              buckets: {
                ...kid.buckets,
                share: {
                  balance: kid.buckets.share.balance - amount,
                  totalGiven: kid.buckets.share.totalGiven + amount,
                },
              },
              transactions: [transaction, ...kid.transactions],
            };
            updatedKid.badges = checkAndAwardBadges(updatedKid);
            return updatedKid;
          }),
        },
      };
    }

    case 'SET_WEEKLY_ALLOWANCE': {
      if (!state.family) return state;
      const { kidId, amount } = action.payload;
      return {
        ...state,
        family: {
          ...state.family,
          settings: {
            ...state.family.settings,
            weeklyAllowances: {
              ...state.family.settings.weeklyAllowances,
              [kidId]: amount,
            },
          },
        },
      };
    }

    case 'APPLY_INTEREST': {
      if (!state.family) return state;
      const { kidId } = action.payload;
      return {
        ...state,
        family: {
          ...state.family,
          kids: state.family.kids.map(kid => {
            if (kid.id !== kidId) return kid;
            const monthlyRate = kid.buckets.save.interestRate / 12 / 100;
            const interestAmount = kid.buckets.save.balance * monthlyRate;
            if (interestAmount <= 0) return kid;

            // Award XP for earning interest
            const xpEarned = XP_REWARDS.EARN_INTEREST;
            const newTotalXP = kid.totalXP + xpEarned;
            const newRank = getWarriorRank(newTotalXP);

            const transaction: Transaction = {
              id: uuidv4(),
              type: 'interest',
              amount: interestAmount,
              bucket: 'save',
              description: `Monthly interest (${kid.buckets.save.interestRate}% APR)`,
              xpEarned,
              timestamp: new Date().toISOString(),
            };
            const newBalance = kid.buckets.save.balance + interestAmount;

            let updatedKid: Kid = {
              ...kid,
              totalXP: newTotalXP,
              warriorRank: newRank,
              buckets: {
                ...kid.buckets,
                save: {
                  ...kid.buckets.save,
                  balance: newBalance,
                },
              },
              transactions: [transaction, ...kid.transactions],
            };

            // Update pet level
            updatedKid = updatePetLevel(updatedKid);

            return updatedKid;
          }),
        },
      };
    }

    case 'SWITCH_MODE': {
      return { ...state, currentMode: action.payload, selectedKidId: null };
    }

    case 'SELECT_KID': {
      return { ...state, selectedKidId: action.payload };
    }

    case 'LOAD_STATE': {
      return action.payload;
    }

    case 'SET_PARENT_PIN': {
      if (!state.family) return state;
      return {
        ...state,
        family: {
          ...state.family,
          settings: {
            ...state.family.settings,
            parentPin: action.payload,
          },
        },
      };
    }

    case 'RESET': {
      return initialState;
    }

    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  isLoading: boolean;
  isSupabaseEnabled: boolean;
  createFamily: (name: string) => Promise<void>;
  addKid: (name: string, age: number, avatar: string) => Promise<void>;
  updateKid: (kidId: string, updates: { name?: string; age?: number; avatar?: string }) => Promise<void>;
  grantMoney: (kidId: string, amount: number, description: string) => Promise<void>;
  allocateMoney: (kidId: string, save: number, spend: number, share: number) => Promise<void>;
  setInterestRate: (kidId: string, rate: number) => Promise<void>;
  setBaseline: (kidId: string, baseline: number) => Promise<void>;
  addGoal: (kidId: string, name: string, targetAmount: number, icon: string, imageUrl?: string, linkUrl?: string) => Promise<void>;
  addCustomCause: (kidId: string, cause: Cause) => Promise<void>;
  fundGoal: (kidId: string, goalId: string, amount: number) => Promise<void>;
  setParentPin: (pin: string) => Promise<void>;
  purchaseGoal: (kidId: string, goalId: string) => Promise<void>;
  donate: (kidId: string, amount: number, causeName: string) => Promise<void>;
  setWeeklyAllowance: (kidId: string, amount: number) => void;
  applyInterest: (kidId: string) => Promise<void>;
  switchMode: (mode: 'parent' | 'kid') => void;
  selectKid: (kidId: string | null) => void;
  getSelectedKid: () => Kid | null;
  setPet: (kidId: string, petType: PetType, petName: string) => Promise<void>;
  hatchNewPet: (kidId: string, petType: PetType, petName: string) => Promise<void>;
  resetApp: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      if (isSupabaseConfigured) {
        // Try to load from Supabase
        try {
          const family = await dataService.getFamily();
          if (family) {
            dispatch({ type: 'LOAD_STATE', payload: { family, currentMode: 'parent', selectedKidId: null } });
          }
        } catch (e) {
          console.error('Failed to load from Supabase:', e);
        }
      } else {
        // Fall back to localStorage
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            dispatch({ type: 'LOAD_STATE', payload: parsed });
          } catch (e) {
            console.error('Failed to load saved state:', e);
          }
        }
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  // Save to localStorage (always, as backup)
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, isLoading]);

  const createFamily = async (name: string) => {
    let family: Family;

    if (isSupabaseConfigured) {
      try {
        family = await dataService.createFamily(name);
      } catch (e) {
        console.error('Failed to create family in Supabase:', e);
        family = {
          id: uuidv4(),
          name,
          kids: [],
          settings: { weeklyAllowances: {} },
        };
      }
    } else {
      family = {
        id: uuidv4(),
        name,
        kids: [],
        settings: { weeklyAllowances: {} },
      };
    }

    dispatch({ type: 'SET_FAMILY', payload: family });
  };

  const addKid = async (name: string, age: number, avatar: string) => {
    if (isSupabaseConfigured && state.family) {
      try {
        await dataService.addKid(state.family.id, name, age, avatar);
      } catch (e) {
        console.error('Failed to add kid in Supabase:', e);
      }
    }
    dispatch({ type: 'ADD_KID', payload: { name, age, avatar } });
  };

  const updateKid = async (kidId: string, updates: { name?: string; age?: number; avatar?: string }) => {
    dispatch({ type: 'UPDATE_KID', payload: { kidId, ...updates } });
    if (isSupabaseConfigured) {
      try {
        await dataService.updateKid(kidId, updates);
      } catch (e) {
        console.error('Failed to update kid in Supabase:', e);
      }
    }
  };

  const grantMoney = async (kidId: string, amount: number, description: string) => {
    dispatch({ type: 'GRANT_MONEY', payload: { kidId, amount, description } });
    if (isSupabaseConfigured) {
      try {
        const kid = state.family?.kids.find(k => k.id === kidId);
        const newPending = (kid?.pendingAllocation || 0) + amount;
        await dataService.updatePendingAllocation(kidId, newPending);
        await dataService.addTransaction(kidId, {
          id: uuidv4(),
          type: 'grant',
          amount,
          description,
          timestamp: new Date().toISOString(),
        });
      } catch (e) {
        console.error('Failed to grant money in Supabase:', e);
      }
    }
  };

  const allocateMoney = async (kidId: string, save: number, spend: number, share: number) => {
    dispatch({ type: 'ALLOCATE_MONEY', payload: { kidId, save, spend, share } });
    if (isSupabaseConfigured) {
      try {
        const kid = state.family?.kids.find(k => k.id === kidId);
        if (kid) {
          const newSave = kid.buckets.save.balance + save;
          const newSpend = kid.buckets.spend.balance + spend;
          const newShare = kid.buckets.share.balance + share;
          await dataService.updateBuckets(kidId, newSave, newSpend, newShare);
          await dataService.updatePendingAllocation(kidId, null);

          // Update pet level
          const baseline = kid.buckets.save.baseline || 0;
          const oldLevel = kid.currentPet?.level || 0;
          const newLevel = getPetLevel(newSave, baseline);
          if (kid.currentPet && newLevel !== oldLevel) {
            await dataService.updatePetLevel(kidId, newLevel);
          }

          // Update XP (action-based: 1 per bucket + 10 for pet level up)
          let xpEarned = 0;
          if (save > 0) xpEarned += XP_REWARDS.ALLOCATE_TO_BUCKET;
          if (spend > 0) xpEarned += XP_REWARDS.ALLOCATE_TO_BUCKET;
          if (share > 0) xpEarned += XP_REWARDS.ALLOCATE_TO_BUCKET;
          if (newLevel > oldLevel) xpEarned += XP_REWARDS.PET_LEVEL_UP;

          const newTotalXP = kid.totalXP + xpEarned;
          await dataService.updateKidXP(kidId, newTotalXP);
        }
      } catch (e) {
        console.error('Failed to allocate money in Supabase:', e);
      }
    }
  };

  const setInterestRate = async (kidId: string, rate: number) => {
    dispatch({ type: 'SET_INTEREST_RATE', payload: { kidId, rate } });
    if (isSupabaseConfigured) {
      try {
        await dataService.setInterestRate(kidId, rate);
      } catch (e) {
        console.error('Failed to set interest rate in Supabase:', e);
      }
    }
  };

  const setBaseline = async (kidId: string, baseline: number) => {
    dispatch({ type: 'SET_BASELINE', payload: { kidId, baseline } });
    if (isSupabaseConfigured) {
      try {
        await dataService.setBaseline(kidId, baseline);
      } catch (e) {
        console.error('Failed to set baseline in Supabase:', e);
      }
    }
  };

  const addGoal = async (kidId: string, name: string, targetAmount: number, icon: string, imageUrl?: string, linkUrl?: string) => {
    dispatch({ type: 'ADD_GOAL', payload: { kidId, name, targetAmount, icon, imageUrl, linkUrl } });
    if (isSupabaseConfigured) {
      try {
        await dataService.addGoal(kidId, name, targetAmount, icon, imageUrl, linkUrl);
      } catch (e) {
        console.error('Failed to add goal in Supabase:', e);
      }
    }
  };

  const addCustomCause = async (kidId: string, cause: Cause) => {
    dispatch({ type: 'ADD_CUSTOM_CAUSE', payload: { kidId, cause } });
    if (isSupabaseConfigured) {
      try {
        await dataService.addCustomCause(kidId, cause);
      } catch (e) {
        console.error('Failed to add custom cause in Supabase:', e);
      }
    }
  };

  const fundGoal = async (kidId: string, goalId: string, amount: number) => {
    dispatch({ type: 'FUND_GOAL', payload: { kidId, goalId, amount } });
    if (isSupabaseConfigured) {
      try {
        const kid = state.family?.kids.find(k => k.id === kidId);
        const goal = kid?.buckets.spend.goals.find(g => g.id === goalId);
        if (goal) {
          const newAmount = goal.currentAmount + amount;
          const completed = newAmount >= goal.targetAmount;
          await dataService.fundGoal(goalId, newAmount, completed);
        }
      } catch (e) {
        console.error('Failed to fund goal in Supabase:', e);
      }
    }
  };

  const setParentPin = async (pin: string) => {
    dispatch({ type: 'SET_PARENT_PIN', payload: pin });
    if (isSupabaseConfigured && state.family) {
      try {
        await dataService.updateFamilyPin(state.family.id, pin);
      } catch (e) {
        console.error('Failed to set parent pin in Supabase:', e);
      }
    }
  };

  const purchaseGoal = async (kidId: string, goalId: string) => {
    const kid = state.family?.kids.find(k => k.id === kidId);
    const goal = kid?.buckets.spend.goals.find(g => g.id === goalId);

    dispatch({ type: 'PURCHASE_GOAL', payload: { kidId, goalId } });

    if (isSupabaseConfigured && kid && goal) {
      try {
        await dataService.purchaseGoal(goalId);
        const newSpend = kid.buckets.spend.balance - goal.targetAmount;
        await dataService.updateBuckets(
          kidId,
          kid.buckets.save.balance,
          newSpend,
          kid.buckets.share.balance
        );

        // Update XP
        const newTotalXP = kid.totalXP + XP_REWARDS.COMPLETE_GOAL;
        await dataService.updateKidXP(kidId, newTotalXP);
      } catch (e) {
        console.error('Failed to purchase goal in Supabase:', e);
      }
    }
  };

  const donate = async (kidId: string, amount: number, causeName: string) => {
    dispatch({ type: 'DONATE', payload: { kidId, amount, causeName } });
    if (isSupabaseConfigured) {
      try {
        const kid = state.family?.kids.find(k => k.id === kidId);
        if (kid) {
          const newShare = kid.buckets.share.balance - amount;
          const newTotalGiven = kid.buckets.share.totalGiven + amount;
          await dataService.updateBuckets(
            kidId,
            kid.buckets.save.balance,
            kid.buckets.spend.balance,
            newShare,
            newTotalGiven
          );

          // Update XP (action-based)
          const xpEarned = XP_REWARDS.COMPLETE_DONATION;
          const newTotalXP = kid.totalXP + xpEarned;
          await dataService.updateKidXP(kidId, newTotalXP);

          await dataService.addTransaction(kidId, {
            id: uuidv4(),
            type: 'donation',
            amount: -amount,
            bucket: 'share',
            description: `Donated to ${causeName}`,
            xpEarned,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (e) {
        console.error('Failed to donate in Supabase:', e);
      }
    }
  };

  const setWeeklyAllowance = (kidId: string, amount: number) => {
    dispatch({ type: 'SET_WEEKLY_ALLOWANCE', payload: { kidId, amount } });
  };

  const applyInterest = async (kidId: string) => {
    dispatch({ type: 'APPLY_INTEREST', payload: { kidId } });
    if (isSupabaseConfigured) {
      try {
        const kid = state.family?.kids.find(k => k.id === kidId);
        if (kid) {
          const monthlyRate = kid.buckets.save.interestRate / 12 / 100;
          const interestAmount = kid.buckets.save.balance * monthlyRate;
          if (interestAmount > 0) {
            const newSave = kid.buckets.save.balance + interestAmount;
            await dataService.updateBuckets(
              kidId,
              newSave,
              kid.buckets.spend.balance,
              kid.buckets.share.balance
            );

            const baseline = kid.buckets.save.baseline || 0;
            const newLevel = getPetLevel(newSave, baseline);
            if (kid.currentPet && newLevel !== kid.currentPet.level) {
              await dataService.updatePetLevel(kidId, newLevel);
            }

            const newTotalXP = kid.totalXP + XP_REWARDS.EARN_INTEREST;
            await dataService.updateKidXP(kidId, newTotalXP);
          }
        }
      } catch (e) {
        console.error('Failed to apply interest in Supabase:', e);
      }
    }
  };

  const switchMode = (mode: 'parent' | 'kid') => {
    dispatch({ type: 'SWITCH_MODE', payload: mode });
  };

  const selectKid = (kidId: string | null) => {
    dispatch({ type: 'SELECT_KID', payload: kidId });
  };

  const getSelectedKid = (): Kid | null => {
    if (!state.family || !state.selectedKidId) return null;
    return state.family.kids.find(k => k.id === state.selectedKidId) || null;
  };

  const setPet = async (kidId: string, petType: PetType, petName: string) => {
    if (isSupabaseConfigured) {
      try {
        const kid = state.family?.kids.find(k => k.id === kidId);
        const baseline = kid?.buckets.save.baseline || 0;
        const level = kid ? getPetLevel(kid.buckets.save.balance, baseline) : 0;
        await dataService.setPet(kidId, petType, petName, level);
      } catch (e) {
        console.error('Failed to set pet in Supabase:', e);
      }
    }
    dispatch({ type: 'SET_PET', payload: { kidId, petType, petName } });
  };

  const hatchNewPet = async (kidId: string, petType: PetType, petName: string) => {
    if (isSupabaseConfigured) {
      try {
        const kid = state.family?.kids.find(k => k.id === kidId);
        if (kid?.currentPet && kid.currentPet.level === 5) {
          await dataService.movePetToStable(kidId, kid.currentPet);
        }
        await dataService.setPet(kidId, petType, petName, 0);
      } catch (e) {
        console.error('Failed to hatch pet in Supabase:', e);
      }
    }
    dispatch({ type: 'HATCH_NEW_PET', payload: { kidId, petType, petName } });
  };

  const resetApp = () => {
    localStorage.removeItem(STORAGE_KEY);
    dispatch({ type: 'RESET' });
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        isLoading,
        isSupabaseEnabled: isSupabaseConfigured,
        createFamily,
        addKid,
        updateKid,
        grantMoney,
        allocateMoney,
        setInterestRate,
        setBaseline,
        addGoal,
        addCustomCause,
        fundGoal,
        purchaseGoal,
        setParentPin,
        donate,
        setWeeklyAllowance,
        applyInterest,
        switchMode,
        selectKid,
        getSelectedKid,
        setPet,
        hatchNewPet,
        resetApp,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
