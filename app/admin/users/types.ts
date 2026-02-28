export type AdminUserRow = {
  id: string;
  email: string | null;
  phone: string | null;
  username: string | null;
  phone_verified: boolean | null;
  is_banned: boolean | null;
  created_at?: string | null;
};