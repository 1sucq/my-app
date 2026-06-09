import type { PublicationStatus, RegistrationStatus, RoleCode, SyncStatus } from "./types";

export const ROLE_CODES = {
  USER: "user",
  EDITOR: "editor",
  ADMIN: "admin",
} as const satisfies Record<string, RoleCode>;

export const ROLE_LABELS: Record<RoleCode, string> = {
  user: "利用者",
  editor: "編集者",
  admin: "管理者",
};

export const REGISTRATION_STATUSES = [
  "下書き",
  "レビュー中",
  "承認済",
  "公開中",
  "廃止",
] as const satisfies readonly RegistrationStatus[];

export const SYNC_STATUSES = [
  "未同期",
  "同期中",
  "同期済",
  "同期失敗",
] as const satisfies readonly SyncStatus[];

export const PUBLICATION_STATUSES = [
  "下書き",
  "公開中",
  "非公開",
] as const satisfies readonly PublicationStatus[];

export const CATEGORY_CODES = {
  HR: "hr",
  HR_RULES: "hr-rules",
  HR_WORK_RULES: "hr-work-rules",
  SERVICE: "service",
  SERVICE_FULLTIME: "service-fulltime",
  SERVICE_CONTRACT: "service-contract",
  SERVICE_RULES: "service-rules",
  SERVICE_ATTITUDE: "service-attitude",
  SERVICE_SIDEJOB: "service-sidejob",
  SERVICE_DUALJOB: "service-dualjob",
  SERVICE_LATE: "service-late",
  SERVICE_VIOLATION: "service-violation",
  GENERAL_AFFAIRS: "general-affairs",
  ACCOUNTING: "accounting",
} as const;

export const CURRENT_PROFILE_ID = "profile-yamada";
export const CURRENT_GROUP_ID = "group-hr";
