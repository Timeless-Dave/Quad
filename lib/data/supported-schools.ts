export type SupportedSchool = {
  domain: string;
  shortName: string;
  status: "active" | "coming_soon";
};

export const SUPPORTED_SCHOOLS: SupportedSchool[] = [
  { domain: "uapb.edu", shortName: "UAPB", status: "active" },
];

const schoolMap = new Map(SUPPORTED_SCHOOLS.map((s) => [s.domain, s]));

export function lookupSchool(domain: string): SupportedSchool | undefined {
  return schoolMap.get(domain.toLowerCase());
}
