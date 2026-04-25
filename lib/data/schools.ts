import { extractDomain } from "@/lib/auth/domain";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type School = {
  id: number;
  name: string;
  shortName: string;
  domain: string;
  status: "active" | "coming_soon";
  logoUrl: string | null;
};

function rowToSchool(row: Record<string, unknown>): School {
  return {
    id: row.id as number,
    name: row.name as string,
    shortName: row.short_name as string,
    domain: row.domain as string,
    status: row.status as "active" | "coming_soon",
    logoUrl: (row.logo_url as string) ?? null,
  };
}

export async function getSchoolByDomain(domain: string): Promise<School | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("schools")
    .select("*")
    .eq("domain", domain.toLowerCase())
    .single();

  return data ? rowToSchool(data) : null;
}

export async function getSchoolForUser(email: string): Promise<School | null> {
  return getSchoolByDomain(extractDomain(email));
}
