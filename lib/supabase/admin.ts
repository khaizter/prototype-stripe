import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

// Service-role client for API routes (webhooks, background sync).
// Never import this in client components.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
