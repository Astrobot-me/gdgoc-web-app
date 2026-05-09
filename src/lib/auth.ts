const normalizeEmail = (value: string) => value.trim().toLowerCase();

const adminEmailList = (() => {
  const raw = process.env.ADMIN_EMAILS ?? process.env.ADMIN_EMAIL ?? "";
  return raw
    .split(",")
    .map(normalizeEmail)
    .filter((email) => email.length > 0);
})();

export const isAdminEmail = (email?: string | null) => {
  if (!email) {
    return false;
  }

  return adminEmailList.includes(normalizeEmail(email));
};
