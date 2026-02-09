// Database types generated from Supabase schema

export interface Database {
  public: {
    Tables: {
      families: {
        Row: {
          id: string;
          name: string;
          parent_pin: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          parent_pin?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          parent_pin?: string | null;
          updated_at?: string;
        };
      };
      kids: {
        Row: {
          id: string;
          family_id: string;
          name: string;
          age: number;
          avatar: string;
          total_xp: number;
          warrior_rank: number;
          weekly_allowance: number;
          pending_allocation: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          name: string;
          age: number;
          avatar: string;
          total_xp?: number;
          warrior_rank?: number;
          weekly_allowance?: number;
          pending_allocation?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          age?: number;
          avatar?: string;
          total_xp?: number;
          warrior_rank?: number;
          weekly_allowance?: number;
          pending_allocation?: number | null;
          updated_at?: string;
        };
      };
      buckets: {
        Row: {
          id: string;
          kid_id: string;
          save_balance: number;
          save_interest_rate: number;
          spend_balance: number;
          share_balance: number;
          share_total_given: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          kid_id: string;
          save_balance?: number;
          save_interest_rate?: number;
          spend_balance?: number;
          share_balance?: number;
          share_total_given?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          save_balance?: number;
          save_interest_rate?: number;
          spend_balance?: number;
          share_balance?: number;
          share_total_given?: number;
          updated_at?: string;
        };
      };
      pets: {
        Row: {
          id: string;
          kid_id: string;
          type: 'dragon' | 'eagle' | 'wolf' | 'lion' | 'turtle' | 'owl';
          name: string;
          level: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          kid_id: string;
          type: 'dragon' | 'eagle' | 'wolf' | 'lion' | 'turtle' | 'owl';
          name: string;
          level?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          type?: 'dragon' | 'eagle' | 'wolf' | 'lion' | 'turtle' | 'owl';
          name?: string;
          level?: number;
          updated_at?: string;
        };
      };
      pet_stable: {
        Row: {
          id: string;
          kid_id: string;
          type: 'dragon' | 'eagle' | 'wolf' | 'lion' | 'turtle' | 'owl';
          name: string;
          raised_to_elder_at: string;
        };
        Insert: {
          id?: string;
          kid_id: string;
          type: 'dragon' | 'eagle' | 'wolf' | 'lion' | 'turtle' | 'owl';
          name: string;
          raised_to_elder_at?: string;
        };
        Update: {
          type?: 'dragon' | 'eagle' | 'wolf' | 'lion' | 'turtle' | 'owl';
          name?: string;
          raised_to_elder_at?: string;
        };
      };
      goals: {
        Row: {
          id: string;
          kid_id: string;
          name: string;
          target_amount: number;
          current_amount: number;
          visual: string | null;
          visual_type: 'emoji' | 'image' | 'gif';
          image_url: string | null;
          link_url: string | null;
          completed: boolean;
          purchased: boolean;
          purchased_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          kid_id: string;
          name: string;
          target_amount: number;
          current_amount?: number;
          visual?: string | null;
          visual_type?: 'emoji' | 'image' | 'gif';
          image_url?: string | null;
          link_url?: string | null;
          completed?: boolean;
          purchased?: boolean;
          purchased_at?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          target_amount?: number;
          current_amount?: number;
          visual?: string | null;
          visual_type?: 'emoji' | 'image' | 'gif';
          image_url?: string | null;
          link_url?: string | null;
          completed?: boolean;
          purchased?: boolean;
          purchased_at?: string | null;
        };
      };
      custom_causes: {
        Row: {
          id: string;
          kid_id: string;
          name: string;
          description: string | null;
          emoji: string | null;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          kid_id: string;
          name: string;
          description?: string | null;
          emoji?: string | null;
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          emoji?: string | null;
          image_url?: string | null;
        };
      };
      badges: {
        Row: {
          id: string;
          kid_id: string;
          type: string;
          name: string;
          threshold: number;
          earned_at: string;
        };
        Insert: {
          id?: string;
          kid_id: string;
          type: string;
          name: string;
          threshold: number;
          earned_at?: string;
        };
        Update: {
          type?: string;
          name?: string;
          threshold?: number;
          earned_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          kid_id: string;
          type: 'allocation' | 'interest' | 'goal_purchase' | 'donation' | 'grant';
          amount: number;
          bucket: 'save' | 'spend' | 'share' | null;
          description: string | null;
          xp_earned: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          kid_id: string;
          type: 'allocation' | 'interest' | 'goal_purchase' | 'donation' | 'grant';
          amount: number;
          bucket?: 'save' | 'spend' | 'share' | null;
          description?: string | null;
          xp_earned?: number;
          created_at?: string;
        };
        Update: {
          type?: 'allocation' | 'interest' | 'goal_purchase' | 'donation' | 'grant';
          amount?: number;
          bucket?: 'save' | 'spend' | 'share' | null;
          description?: string | null;
          xp_earned?: number;
        };
      };
    };
  };
}
