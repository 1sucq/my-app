import type { ReactNode } from "react";

export type RegistrationStatus = "下書き" | "レビュー中" | "承認済" | "公開中" | "廃止";
export type SyncStatus = "未同期" | "同期中" | "同期済" | "同期失敗";

export type AppRecord = Record<
  string,
  string | number | boolean | string[] | undefined
>;

export type Category = AppRecord & {
  id: string;
  name: string;
  parentId?: string;
  level: 1 | 2 | 3;
  order: number;
};

export type DocumentItem = AppRecord & {
  id: string;
  displayName: string;
  version: string;
  category: string;
  registrationStatus: RegistrationStatus;
  syncStatus: SyncStatus;
  uploadFileName: string;
  storagePath: string;
  updatedAt: string;
};

export type FaqItem = AppRecord & {
  id: string;
  displayName: string;
  body: string;
  featured: boolean;
  category: string;
  updatedAt: string;
};

export type GlossaryItem = AppRecord & {
  id: string;
  term: string;
  meaning: string;
  updatedAt: string;
};

export type UserItem = AppRecord & {
  id: string;
  displayName: string;
  email: string;
  groups: string[];
  role: string;
};

export type GroupItem = AppRecord & {
  id: string;
  displayName: string;
  categories: string[];
  memberCount: number;
};

export type RoleItem = AppRecord & {
  id: string;
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
