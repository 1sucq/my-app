import type { RoleItem } from "./types";

export type AdminScreenKey =
  | "home"
  | "categories"
  | "documents"
  | "faqs"
  | "glossaries"
  | "users"
  | "groups"
  | "roles";

const permissionByScreen: Partial<Record<AdminScreenKey, keyof RoleItem>> = {
  categories: "categoryManagement",
  documents: "documentManagement",
  faqs: "faqManagement",
  glossaries: "glossaryManagement",
  users: "userManagement",
  groups: "groupManagement",
  roles: "roleManagement",
};

export function getVisibleAdminScreens(role: RoleItem | undefined): AdminScreenKey[] {
  if (!role) return [];

  return Object.entries(permissionByScreen)
    .filter(([, permissionKey]) => Boolean(role[permissionKey]))
    .map(([screen]) => screen as AdminScreenKey);
}
