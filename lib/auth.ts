import { createClient } from '@/lib/supabase/server';

const ADMIN_EMAIL = 'timerainy2@gmail.com';

export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.email === ADMIN_EMAIL;
}

export async function requireAdmin() {
  const adminStatus = await isAdmin();
  if (!adminStatus) {
    throw new Error('Admin access required');
  }
  return adminStatus;
}

export function isAdminEmail(email: string | undefined): boolean {
  return email === ADMIN_EMAIL;
}
