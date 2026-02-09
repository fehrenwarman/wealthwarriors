import { getSupabase, isSupabaseConfigured } from './supabase';
import type {
  Family,
  Kid,
  Pet,
  SpendingGoal,
  Cause,
  Badge,
  Transaction,
  PetType,
} from '../types';
import { getWarriorRank } from '../types';

// Helper to safely get supabase client
function db() {
  return getSupabase();
}

// Convert database rows to app types
function dbKidToAppKid(
  kid: {
    id: string;
    name: string;
    age: number;
    avatar: string;
    total_xp: number;
    warrior_rank: number;
    pending_allocation: number | null;
  },
  buckets: {
    save_balance: number;
    save_interest_rate: number;
    spend_balance: number;
    share_balance: number;
    share_total_given: number;
  } | null,
  pet: {
    id: string;
    type: string;
    name: string;
    level: number;
    created_at: string;
  } | null,
  petStable: Array<{
    id: string;
    type: string;
    name: string;
    raised_to_elder_at: string;
  }>,
  goals: Array<{
    id: string;
    name: string;
    target_amount: number;
    current_amount: number;
    visual: string | null;
    visual_type: string;
    image_url: string | null;
    link_url: string | null;
    completed: boolean;
    purchased: boolean;
    purchased_at: string | null;
    created_at: string;
  }>,
  customCauses: Array<{
    id: string;
    name: string;
    description: string | null;
    emoji: string | null;
    image_url: string | null;
  }>,
  badges: Array<{
    type: string;
    name: string;
    threshold: number;
    earned_at: string;
  }>,
  transactions: Array<{
    id: string;
    type: string;
    amount: number;
    bucket: string | null;
    description: string | null;
    xp_earned: number;
    created_at: string;
  }>
): Kid {
  return {
    id: kid.id,
    name: kid.name,
    age: kid.age,
    avatar: kid.avatar,
    totalXP: kid.total_xp,
    warriorRank: kid.warrior_rank,
    currentPet: pet
      ? {
          id: pet.id,
          type: pet.type as PetType,
          name: pet.name,
          level: pet.level,
          createdAt: pet.created_at,
        }
      : null,
    petStable: petStable.map((p) => ({
      id: p.id,
      type: p.type as PetType,
      name: p.name,
      level: 5 as const,
      raisedToElderAt: p.raised_to_elder_at,
    })),
    buckets: {
      save: {
        balance: Number(buckets?.save_balance || 0),
        interestRate: Number(buckets?.save_interest_rate || 5),
      },
      spend: {
        balance: Number(buckets?.spend_balance || 0),
        goals: goals.map((g) => ({
          id: g.id,
          name: g.name,
          targetAmount: Number(g.target_amount),
          currentAmount: Number(g.current_amount),
          visual: g.visual || undefined,
          visualType: g.visual_type as 'emoji' | 'image' | 'gif',
          imageUrl: g.image_url || undefined,
          linkUrl: g.link_url || undefined,
          completed: g.completed,
          purchased: g.purchased,
          purchasedAt: g.purchased_at || undefined,
          createdAt: g.created_at,
        })),
      },
      share: {
        balance: Number(buckets?.share_balance || 0),
        totalGiven: Number(buckets?.share_total_given || 0),
        customCauses: customCauses.map((c) => ({
          id: c.id,
          name: c.name,
          description: c.description || '',
          emoji: c.emoji || undefined,
          imageUrl: c.image_url || undefined,
          isCustom: true,
        })),
      },
    },
    pendingAllocation: kid.pending_allocation ? Number(kid.pending_allocation) : null,
    badges: badges.map((b) => ({
      type: b.type,
      name: b.name,
      threshold: b.threshold,
      earnedAt: b.earned_at,
    })),
    transactions: transactions.map((t) => ({
      id: t.id,
      type: t.type as Transaction['type'],
      amount: Number(t.amount),
      bucket: t.bucket as Transaction['bucket'],
      description: t.description || '',
      xpEarned: t.xp_earned,
      timestamp: t.created_at,
    })),
  };
}

export const dataService = {
  // ============ FAMILY ============
  async getFamily(): Promise<Family | null> {
    if (!isSupabaseConfigured) return null;

    const { data: families, error } = await db()
      .from('families')
      .select('*')
      .limit(1);

    if (error || !families || families.length === 0) return null;

    const family = families[0];
    const kids = await this.getKidsByFamily(family.id);

    return {
      id: family.id,
      name: family.name,
      kids,
      settings: {
        weeklyAllowances: {},
        parentPin: family.parent_pin || undefined,
      },
    };
  },

  async createFamily(name: string): Promise<Family> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await db()
      .from('families')
      .insert({ name })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      kids: [],
      settings: { weeklyAllowances: {} },
    };
  },

  async updateFamilyPin(familyId: string, pin: string): Promise<void> {
    if (!isSupabaseConfigured) return;

    await db().from('families').update({ parent_pin: pin }).eq('id', familyId);
  },

  // ============ KIDS ============
  async getKidsByFamily(familyId: string): Promise<Kid[]> {
    if (!isSupabaseConfigured) return [];

    const { data: kids, error } = await db()
      .from('kids')
      .select('*')
      .eq('family_id', familyId);

    if (error || !kids) return [];

    const kidPromises = kids.map(async (kid) => {
      const supabase = db();
      const [buckets, pet, petStable, goals, customCauses, badges, transactions] =
        await Promise.all([
          supabase.from('buckets').select('*').eq('kid_id', kid.id).single(),
          supabase.from('pets').select('*').eq('kid_id', kid.id).single(),
          supabase.from('pet_stable').select('*').eq('kid_id', kid.id),
          supabase.from('goals').select('*').eq('kid_id', kid.id),
          supabase.from('custom_causes').select('*').eq('kid_id', kid.id),
          supabase.from('badges').select('*').eq('kid_id', kid.id),
          supabase
            .from('transactions')
            .select('*')
            .eq('kid_id', kid.id)
            .order('created_at', { ascending: false }),
        ]);

      return dbKidToAppKid(
        kid,
        buckets.data,
        pet.data,
        petStable.data || [],
        goals.data || [],
        customCauses.data || [],
        badges.data || [],
        transactions.data || []
      );
    });

    return Promise.all(kidPromises);
  },

  async addKid(
    familyId: string,
    name: string,
    age: number,
    avatar: string
  ): Promise<Kid> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase not configured');
    }

    const supabase = db();

    // Create kid
    const { data: kid, error: kidError } = await supabase
      .from('kids')
      .insert({
        family_id: familyId,
        name,
        age,
        avatar,
        total_xp: 0,
        warrior_rank: 1,
      })
      .select()
      .single();

    if (kidError) throw kidError;

    // Create buckets
    await supabase.from('buckets').insert({
      kid_id: kid.id,
      save_balance: 0,
      save_interest_rate: 5,
      spend_balance: 0,
      share_balance: 0,
      share_total_given: 0,
    });

    return {
      id: kid.id,
      name: kid.name,
      age: kid.age,
      avatar: kid.avatar,
      totalXP: 0,
      warriorRank: 1,
      currentPet: null,
      petStable: [],
      buckets: {
        save: { balance: 0, interestRate: 5 },
        spend: { balance: 0, goals: [] },
        share: { balance: 0, totalGiven: 0 },
      },
      pendingAllocation: null,
      badges: [],
      transactions: [],
    };
  },

  async updateKidXP(kidId: string, totalXP: number): Promise<void> {
    if (!isSupabaseConfigured) return;

    const warriorRank = getWarriorRank(totalXP);
    await db()
      .from('kids')
      .update({ total_xp: totalXP, warrior_rank: warriorRank })
      .eq('id', kidId);
  },

  async updatePendingAllocation(kidId: string, amount: number | null): Promise<void> {
    if (!isSupabaseConfigured) return;

    await db()
      .from('kids')
      .update({ pending_allocation: amount })
      .eq('id', kidId);
  },

  // ============ BUCKETS ============
  async updateBuckets(
    kidId: string,
    saveBalance: number,
    spendBalance: number,
    shareBalance: number,
    shareTotalGiven?: number
  ): Promise<void> {
    if (!isSupabaseConfigured) return;

    const updateData: {
      save_balance: number;
      spend_balance: number;
      share_balance: number;
      share_total_given?: number;
    } = {
      save_balance: saveBalance,
      spend_balance: spendBalance,
      share_balance: shareBalance,
    };

    if (shareTotalGiven !== undefined) {
      updateData.share_total_given = shareTotalGiven;
    }

    await db().from('buckets').update(updateData).eq('kid_id', kidId);
  },

  async setInterestRate(kidId: string, rate: number): Promise<void> {
    if (!isSupabaseConfigured) return;

    await db()
      .from('buckets')
      .update({ save_interest_rate: rate })
      .eq('kid_id', kidId);
  },

  // ============ PETS ============
  async setPet(kidId: string, type: PetType, name: string, level: number): Promise<Pet> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase not configured');
    }

    const supabase = db();

    // Delete existing pet
    await supabase.from('pets').delete().eq('kid_id', kidId);

    // Insert new pet
    const { data, error } = await supabase
      .from('pets')
      .insert({ kid_id: kidId, type, name, level })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      type: data.type as PetType,
      name: data.name,
      level: data.level,
      createdAt: data.created_at,
    };
  },

  async updatePetLevel(kidId: string, level: number): Promise<void> {
    if (!isSupabaseConfigured) return;

    await db().from('pets').update({ level }).eq('kid_id', kidId);
  },

  async movePetToStable(kidId: string, pet: Pet): Promise<void> {
    if (!isSupabaseConfigured) return;

    const supabase = db();

    // Add to stable
    await supabase.from('pet_stable').insert({
      kid_id: kidId,
      type: pet.type,
      name: pet.name,
    });

    // Delete from current pets
    await supabase.from('pets').delete().eq('id', pet.id);
  },

  // ============ GOALS ============
  async addGoal(
    kidId: string,
    name: string,
    targetAmount: number,
    visual: string,
    imageUrl?: string,
    linkUrl?: string
  ): Promise<SpendingGoal> {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await db()
      .from('goals')
      .insert({
        kid_id: kidId,
        name,
        target_amount: targetAmount,
        visual,
        visual_type: imageUrl ? 'image' : 'emoji',
        image_url: imageUrl || null,
        link_url: linkUrl || null,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      targetAmount: Number(data.target_amount),
      currentAmount: 0,
      visual: data.visual || undefined,
      visualType: data.visual_type as 'emoji' | 'image' | 'gif',
      imageUrl: data.image_url || undefined,
      linkUrl: data.link_url || undefined,
      completed: false,
      purchased: false,
      createdAt: data.created_at,
    };
  },

  async fundGoal(goalId: string, newAmount: number, completed: boolean): Promise<void> {
    if (!isSupabaseConfigured) return;

    await db()
      .from('goals')
      .update({ current_amount: newAmount, completed })
      .eq('id', goalId);
  },

  async purchaseGoal(goalId: string): Promise<void> {
    if (!isSupabaseConfigured) return;

    await db()
      .from('goals')
      .update({ purchased: true, purchased_at: new Date().toISOString() })
      .eq('id', goalId);
  },

  // ============ CUSTOM CAUSES ============
  async addCustomCause(kidId: string, cause: Cause): Promise<void> {
    if (!isSupabaseConfigured) return;

    await db().from('custom_causes').insert({
      kid_id: kidId,
      name: cause.name,
      description: cause.description,
      emoji: cause.emoji || null,
      image_url: cause.imageUrl || null,
    });
  },

  // ============ BADGES ============
  async addBadge(kidId: string, badge: Badge): Promise<void> {
    if (!isSupabaseConfigured) return;

    await db().from('badges').insert({
      kid_id: kidId,
      type: badge.type,
      name: badge.name,
      threshold: badge.threshold,
      earned_at: badge.earnedAt,
    });
  },

  // ============ TRANSACTIONS ============
  async addTransaction(kidId: string, transaction: Transaction): Promise<void> {
    if (!isSupabaseConfigured) return;

    await db().from('transactions').insert({
      kid_id: kidId,
      type: transaction.type,
      amount: transaction.amount,
      bucket: transaction.bucket || null,
      description: transaction.description || null,
      xp_earned: transaction.xpEarned || 0,
    });
  },
};
