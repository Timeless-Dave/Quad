export function extractDomain(email: string): string {
  const [, domain] = email.toLowerCase().split("@");
  return domain ?? "";
}

export function isEduEmail(email: string): boolean {
  return extractDomain(email).endsWith(".edu");
}
