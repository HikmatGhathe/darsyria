export type Locale = 'ar' | 'de' | 'en';

export type User = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  phone_public: boolean;
  locale: Locale;
  is_admin: boolean;
  subscription_tier: string;
  created_at: string;
  account_type: 'individual' | 'company' | null;
  company_name: string | null;
  company_about: string | null;
  company_website: string | null;
  company_address: string | null;
  verification_status: 'unverified' | 'pending' | 'verified';
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
