export type Locale = 'ar' | 'de' | 'en';

export type User = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  locale: Locale;
  is_admin: boolean;
  subscription_tier: string;
  created_at: string;
};

export type AuthResponse = {
  user: User;
};

export type ChatResponse = {
  conversation_id: string;
  content: string;
  model: string;
  created_at: string;
};
