import type { SupabaseClient } from "@supabase/supabase-js";

export type SupportedSchool = {
  domain: string;
  shortName: string;
  status: "active" | "coming_soon";
};

/**
 * Queries the schools table for an active school matching the given domain.
 * Returns null if the school does not exist or is not active.
 * Uses the caller's Supabase client so no extra connection is created in middleware.
 */
export async function lookupActiveSchool(
  supabase: SupabaseClient,
  domain: string
): Promise<SupportedSchool | null> {
  const { data } = await supabase
    .from("schools")
    .select("domain, short_name, status")
    .eq("domain", domain.toLowerCase())
    .eq("status", "active")
    .maybeSingle();

  if (!data) return null;

  return {
    domain: data.domain,
    shortName: data.short_name,
    status: data.status,
  };
}
