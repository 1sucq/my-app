import type { ReactNode } from "react";

export type RegistrationStatus = "下書き" | "レビュー中" | "承認済" | "公開中" | "廃止";
export type SyncStatus = "未同期" | "同期中" | "同期済" | "同期失敗";
export type PublicationStatus = "下書き" | "公開中" | "非公開";
export type RoleCode = "user" | "editor" | "admin";

export type AuditFields = {
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: string;
};

export type AppRecord = Record<
  string,
  string | number | boolean | string[] | undefined
>;

export type Profile = AppRecord & AuditFields & {
  id: string;
  displayName: string;
  email: string;
  roleId: string;
  groupIds: string[];
};

export type Role = AppRecord & AuditFields & {
  id: string;
  code: RoleCode;
  displayName: string;
  chatUsage: boolean;
  categoryManagement: boolean;
  documentManagement: boolean;
  faqManagement: boolean;
  glossaryManagement: boolean;
  userManagement: boolean;
  groupManagement: boolean;
  roleManagement: boolean;
};

export type Group = AppRecord & AuditFields & {
  id: string;
  code: string;
  displayName: string;
  categoryIds: string[];
  memberCount: number;
};

export type Category = AppRecord & AuditFields & {
  id: string;
  code: string;
  name: string;
  parentId?: string;
  level: 1 | 2 | 3;
  order: number;
};

export type Document = AppRecord & AuditFields & {
  id: string;
  documentCode: string;
  displayName: string;
  categoryId: string;
};

export type DocumentVersion = AppRecord & AuditFields & {
  id: string;
  documentId: string;
  version: string;
  registrationStatus: RegistrationStatus;
  syncStatus: SyncStatus;
  uploadFileName: string;
  storagePath: string;
  isCurrent: boolean;
};

export type Faq = AppRecord & AuditFields & {
  id: string;
  code: string;
  displayName: string;
  body: string;
  featured: boolean;
  publicationStatus: PublicationStatus;
  categoryId: string;
};

export type GlossaryTerm = AppRecord & AuditFields & {
  id: string;
  term: string;
  meaning: string;
};

export type DocumentItem = DocumentVersion & {
  id: string;
  documentCode: string;
  displayName: string;
  categoryId: string;
  category: string;
  updatedAt: string;
};

export type FaqItem = Faq & {
  category: string;
  updatedAt: string;
};

export type GlossaryItem = GlossaryTerm & {
  updatedAt: string;
};

export type UserItem = Profile & {
  groups: string[];
  role: string;
};

export type GroupItem = Group & {
  categories: string[];
};

export type RoleItem = Role;

export type TreeOption = {
  value: string;
  label: string;
  level: 1 | 2 | 3;
  parentValue?: string;
};

export type FieldConfig<T extends AppRecord> = {
  key: keyof T & string;
  label: string;
  type?:
    | "text"
    | "textarea"
    | "select"
    | "multiselect"
    | "category-single"
    | "category-multiple"
    | "boolean"
    | "number";
  options?: string[];
  optionLabels?: Record<string, string>;
  categories?: Category[];
  required?: boolean;
  auto?: boolean;
  derive?: (value: string | number | boolean | string[], row: T) => Partial<T>;
};

export type ColumnConfig<T extends AppRecord> = {
  key: keyof T & string;
  label: string;
  align?: "left" | "right";
  render?: (row: T) => ReactNode;
};

export type FilterConfig<T extends AppRecord> = {
  key: keyof T & string;
  label: string;
  options: string[];
  optionLabels?: Record<string, string>;
  allLabel?: string;
};
