import { createServerSupabaseClient } from "@/lib/supabase/server";
import { extractDomain } from "@/lib/auth/domain";

export type Professor = {
  id: string;
  fullName: string;
  title: string;
  email: string;
  officeRoom: string;
  building: string;
  department: string;
  mapImage: string;
  bookingUrl?: string;
};

const FALLBACK_PROFESSORS: Professor[] = [
  {
    id: "p1",
    fullName: "Dr. Evelyn Thomas",
    title: "Chair & Professor",
    email: "thomase@uapb.edu",
    officeRoom: "Room 301",
    building: "Hazzard Hall",
    department: "Computer Science",
    mapImage: "/maps/hazzard-hall-level-3.svg",
    bookingUrl: "https://example.com/dr-thomas-office-hours",
  },
  {
    id: "p2",
    fullName: "Prof. Marcus Reed",
    title: "Associate Professor",
    email: "reedm@uapb.edu",
    officeRoom: "Room 204",
    building: "Hazzard Hall",
    department: "Computer Science",
    mapImage: "/maps/hazzard-hall-level-2.svg",
  },
  {
    id: "p3",
    fullName: "Dr. Alicia Benton",
    title: "Assistant Professor",
    email: "bentona@uapb.edu",
    officeRoom: "Room 112",
    building: "Corbin Hall",
    department: "Computer Science",
    mapImage: "/maps/corbin-hall-level-1.svg",
  },
];

export async function getProfessorsByUserEmail(userEmail: string): Promise<Professor[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return FALLBACK_PROFESSORS;

  const domain = extractDomain(userEmail);

  const { data: school } = await supabase
    .from("schools")
    .select("id")
    .eq("domain", domain)
    .single();

  if (!school) return FALLBACK_PROFESSORS;

  const { data: rows } = await supabase
    .from("professors")
    .select(`
      id,
      full_name,
      title,
      email,
      office_room,
      booking_url,
      departments ( name ),
      buildings ( name, map_image_url )
    `)
    .eq("school_id", school.id);

  if (!rows || rows.length === 0) return FALLBACK_PROFESSORS;

  return rows.map((r: Record<string, unknown>) => {
    const dept = r.departments as Record<string, string> | null;
    const bldg = r.buildings as Record<string, string> | null;
    return {
      id: String(r.id),
      fullName: r.full_name as string,
      title: r.title as string,
      email: r.email as string,
      officeRoom: r.office_room as string,
      building: bldg?.name ?? "",
      department: dept?.name ?? "",
      mapImage: bldg?.map_image_url ?? "",
      bookingUrl: (r.booking_url as string) || undefined,
    };
  });
}
