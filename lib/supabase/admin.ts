import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

// Secret-key / admin client for API routes (webhooks, background sync).
// Never import this in client components — bypasses RLS.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
