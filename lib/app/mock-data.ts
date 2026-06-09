import {
  CATEGORY_CODES,
  ROLE_CODES,
} from "./constants";
import { getCategoryPaths, getCategoryPath } from "./category-utils";
import {
  Category,
  Document,
  DocumentItem,
  DocumentVersion,
  Faq,
  FaqItem,
  GlossaryItem,
  GlossaryTerm,
  GroupItem,
  Profile,
  RoleItem,
  UserItem,
} from "./types";

export const categories: Category[] = [
  { id: "cat-hr", code: CATEGORY_CODES.HR, name: "人事", level: 1, order: 1 },
  {
    id: "cat-hr-rules",
    code: CATEGORY_CODES.HR_RULES,
    name: "規程",
    parentId: "cat-hr",
    level: 2,
    order: 1,
  },
  {
    id: "cat-hr-work",
    code: CATEGORY_CODES.HR_WORK_RULES,
    name: "就業規則",
    parentId: "cat-hr-rules",
    level: 3,
    order: 1,
  },
  { id: "cat-service", code: CATEGORY_CODES.SERVICE, name: "服務", level: 1, order: 2 },
  {
    id: "cat-service-fulltime",
    code: CATEGORY_CODES.SERVICE_FULLTIME,
    name: "正社員",
    parentId: "cat-service",
    level: 2,
    order: 1,
  },
  {
    id: "cat-service-contract",
    code: CATEGORY_CODES.SERVICE_CONTRACT,
    name: "契約社員",
    parentId: "cat-service",
    level: 2,
    order: 2,
  },
  {
    id: "cat-service-rules",
    code: CATEGORY_CODES.SERVICE_RULES,
    name: "服務規律",
    parentId: "cat-service",
    level: 2,
    order: 3,
  },
  {
    id: "cat-service-attitude",
    code: CATEGORY_CODES.SERVICE_ATTITUDE,
    name: "勤務態度",
    parentId: "cat-service",
    level: 2,
    order: 4,
  },
  {
    id: "cat-service-sidejob",
    code: CATEGORY_CODES.SERVICE_SIDEJOB,
    name: "副業",
    parentId: "cat-service",
    level: 2,
    order: 5,
  },
  {
    id: "cat-service-dualjob",
    code: CATEGORY_CODES.SERVICE_DUALJOB,
    name: "兼業",
    parentId: "cat-service",
    level: 2,
    order: 6,
  },
  {
    id: "cat-service-late",
    code: CATEGORY_CODES.SERVICE_LATE,
    name: "遅刻・早退",
    parentId: "cat-service",
    level: 2,
    order: 7,
  },
  {
    id: "cat-service-violation",
    code: CATEGORY_CODES.SERVICE_VIOLATION,
    name: "服務違反",
    parentId: "cat-service",
    level: 2,
    order: 8,
  },
  { id: "cat-ga", code: CATEGORY_CODES.GENERAL_AFFAIRS, name: "総務", level: 1, order: 3 },
  { id: "cat-acc", code: CATEGORY_CODES.ACCOUNTING, name: "経理", level: 1, order: 4 },
];

export const categoryNames = getCategoryPaths(
  categories.map((category) => category.id),
  categories,
);

export const documentMasters: Document[] = [
  {
    id: "document-service-policy",
    documentCode: "po_reg_01",
    displayName: "服務規程",
    categoryId: "cat-hr-rules",
    createdAt: "2026/04/01",
    updatedAt: "2026/06/01",
  },
  {
    id: "document-expense-manual",
    documentCode: "expense_manual",
    displayName: "経費精算マニュアル",
    categoryId: "cat-acc",
    createdAt: "2026/05/01",
    updatedAt: "2026/05/10",
  },
  {
    id: "document-service-rules",
    documentCode: "service_rules_guide",
    displayName: "服務規律ガイド",
    categoryId: "cat-service-rules",
    createdAt: "2026/06/01",
    updatedAt: "2026/06/03",
  },
  {
    id: "document-fulltime-handbook",
    documentCode: "fulltime_service_handbook",
    displayName: "正社員服務ハンドブック",
    categoryId: "cat-service-fulltime",
    createdAt: "2026/06/01",
    updatedAt: "2026/06/04",
  },
  {
    id: "document-sidejob-guideline",
    documentCode: "sidejob_guideline",
    displayName: "副業・兼業ガイドライン",
    categoryId: "cat-service-sidejob",
    createdAt: "2026/06/01",
    updatedAt: "2026/06/07",
  },
  {
    id: "document-late-rules",
    documentCode: "late_early_leave_rules",
    displayName: "遅刻・早退時の服務取扱い",
    categoryId: "cat-service-late",
    createdAt: "2026/06/01",
    updatedAt: "2026/06/07",
  },
  {
    id: "document-violation-manual",
    documentCode: "service_violation_manual",
    displayName: "服務違反対応マニュアル",
    categoryId: "cat-service-violation",
    createdAt: "2026/06/01",
    updatedAt: "2026/06/07",
  },
];

export const documentVersions: DocumentVersion[] = [
  {
    id: "doc-001",
    documentId: "document-service-policy",
    version: "Ver.1.2",
    registrationStatus: "レビュー中",
    syncStatus: "未同期",
    uploadFileName: "服務規程_20260401_r5.pdf",
    storagePath: "s3://qai-documents/policy-operations/regulation/po_reg_01.pdf",
    isCurrent: true,
    updatedAt: "2026/06/01",
  },
  {
    id: "doc-002",
    documentId: "document-expense-manual",
    version: "Ver.2.0",
    registrationStatus: "公開中",
    syncStatus: "同期済",
    uploadFileName: "expense_manual_20260510.pdf",
    storagePath: "s3://qai-documents/accounting/expense_manual.pdf",
    isCurrent: true,
    updatedAt: "2026/05/10",
  },
  {
    id: "doc-003",
    documentId: "document-service-rules",
    version: "Ver.1.0",
    registrationStatus: "公開中",
    syncStatus: "同期済",
    uploadFileName: "service_rules_guide_20260601.pdf",
    storagePath: "s3://qai-documents/service/rules/service_rules_guide.pdf",
    isCurrent: true,
    updatedAt: "2026/06/03",
  },
  {
    id: "doc-004",
    documentId: "document-fulltime-handbook",
    version: "Ver.1.1",
    registrationStatus: "公開中",
    syncStatus: "同期済",
    uploadFileName: "fulltime_service_handbook_20260601.pdf",
    storagePath: "s3://qai-documents/service/fulltime/handbook.pdf",
    isCurrent: true,
    updatedAt: "2026/06/04",
  },
  {
    id: "doc-005",
    documentId: "document-sidejob-guideline",
    version: "Ver.1.0",
    registrationStatus: "公開中",
    syncStatus: "同期済",
    uploadFileName: "sidejob_guideline_20260601.pdf",
    storagePath: "s3://qai-documents/service/sidejob/guideline.pdf",
    isCurrent: true,
    updatedAt: "2026/06/07",
  },
  {
    id: "doc-006",
    documentId: "document-late-rules",
    version: "Ver.1.0",
    registrationStatus: "公開中",
    syncStatus: "同期済",
    uploadFileName: "late_early_leave_rules_20260601.pdf",
    storagePath: "s3://qai-documents/service/attendance/late_early_leave.pdf",
    isCurrent: true,
    updatedAt: "2026/06/07",
  },
  {
    id: "doc-007",
    documentId: "document-violation-manual",
    version: "Ver.1.0",
    registrationStatus: "公開中",
    syncStatus: "同期済",
    uploadFileName: "service_violation_manual_20260601.pdf",
    storagePath: "s3://qai-documents/service/violation/manual.pdf",
    isCurrent: true,
    updatedAt: "2026/06/07",
  },
];

export const faqMasters: Faq[] = [
  {
    id: "faq-001",
    code: "paid_leave_application",
    displayName: "有給休暇の申請方法",
    body: "勤怠システムから申請し、上長承認後に確定します。",
    featured: true,
    publicationStatus: "公開中",
    categoryId: "cat-hr-rules",
    updatedAt: "2026/06/02",
  },
  {
    id: "faq-002",
    code: "receipt_deadline",
    displayName: "領収書の提出期限",
    body: "原則として精算月の翌月5営業日以内です。",
    featured: false,
    publicationStatus: "公開中",
    categoryId: "cat-acc",
    updatedAt: "2026/05/20",
  },
  {
    id: "faq-003",
    code: "service_rule_contact",
    displayName: "服務規律違反時の確認先",
    body: "服務規律に関する確認は、所属長または人事労務担当へ相談してください。",
    featured: true,
    publicationStatus: "公開中",
    categoryId: "cat-service-rules",
    updatedAt: "2026/06/05",
  },
  {
    id: "faq-004",
    code: "contract_service_rule",
    displayName: "契約社員の服務ルール",
    body: "契約社員の服務ルールは雇用契約と服務規律に基づきます。",
    featured: false,
    publicationStatus: "公開中",
    categoryId: "cat-service-contract",
    updatedAt: "2026/06/06",
  },
  {
    id: "faq-005",
    code: "sidejob_allowed",
    displayName: "副業はできますか",
    body: "副業は事前申請と会社承認が必要です。競業や勤務に支障が出る場合は認められないことがあります。",
    featured: true,
    publicationStatus: "公開中",
    categoryId: "cat-service-sidejob",
    updatedAt: "2026/06/07",
  },
  {
    id: "faq-006",
    code: "late_attendance",
    displayName: "遅刻した場合の扱い",
    body: "遅刻時は速やかに上長へ連絡し、勤怠システムで理由を申請してください。頻度や理由により指導対象となる場合があります。",
    featured: true,
    publicationStatus: "公開中",
    categoryId: "cat-service-late",
    updatedAt: "2026/06/07",
  },
  {
    id: "faq-007",
    code: "service_violation_examples",
    displayName: "服務違反になる行為",
    body: "無断欠勤、情報持ち出し、ハラスメント、勤務時間中の私用行為などは服務違反に該当する可能性があります。",
    featured: true,
    publicationStatus: "公開中",
    categoryId: "cat-service-violation",
    updatedAt: "2026/06/07",
  },
];

export const glossaryTerms: GlossaryTerm[] = [
  {
    id: "gls-001",
    term: "ベクトルDB",
    meaning: "文章を検索しやすい数値表現に変換して保存するデータベースです。",
    updatedAt: "2026/06/01",
  },
  {
    id: "gls-002",
    term: "RAG",
    meaning: "検索した社内文書をもとにAIが回答する仕組みです。",
    updatedAt: "2026/05/29",
  },
];

export const roles: RoleItem[] = [
  {
    id: "role-user",
    code: ROLE_CODES.USER,
    displayName: "利用者",
    chatUsage: true,
    categoryManagement: false,
    documentManagement: false,
    faqManagement: false,
    glossaryManagement: false,
    userManagement: false,
    groupManagement: false,
    roleManagement: false,
  },
  {
    id: "role-editor",
    code: ROLE_CODES.EDITOR,
    displayName: "編集者",
    chatUsage: true,
    categoryManagement: true,
    documentManagement: true,
    faqManagement: true,
    glossaryManagement: true,
    userManagement: false,
    groupManagement: false,
    roleManagement: false,
  },
  {
    id: "role-admin",
    code: ROLE_CODES.ADMIN,
    displayName: "管理者",
    chatUsage: true,
    categoryManagement: true,
    documentManagement: true,
    faqManagement: true,
    glossaryManagement: true,
    userManagement: true,
    groupManagement: true,
    roleManagement: true,
  },
];

export const groups: GroupItem[] = [
  {
    id: "group-hr",
    code: "hr",
    displayName: "人事部",
    categoryIds: ["cat-hr", "cat-service"],
    categories: ["人事", "服務"],
    memberCount: 12,
  },
  {
    id: "group-backoffice",
    code: "backoffice",
    displayName: "管理部",
    categoryIds: ["cat-hr", "cat-hr-rules", "cat-service", "cat-acc"],
    categories: ["人事", "人事 / 規程", "服務", "経理"],
    memberCount: 24,
  },
];

export const profiles: Profile[] = [
  {
    id: "profile-yamada",
    displayName: "山田 太郎",
    email: "taro.yamada@example.com",
    groupIds: ["group-hr"],
    roleId: "role-editor",
  },
  {
    id: "profile-sato",
    displayName: "佐藤 花子",
    email: "hanako.sato@example.com",
    groupIds: ["group-backoffice", "group-hr"],
    roleId: "role-admin",
  },
];

export const documents: DocumentItem[] = documentVersions.map((version) => {
  const document = documentMasters.find((item) => item.id === version.documentId);
  const categoryId = document?.categoryId ?? "";

  return {
    ...version,
    documentCode: document?.documentCode ?? version.documentId,
    displayName: document?.displayName ?? "",
    categoryId,
    category: getCategoryPath(categoryId, categories),
    updatedAt: version.updatedAt ?? document?.updatedAt ?? "",
  };
});

export const faqs: FaqItem[] = faqMasters.map((faq) => ({
  ...faq,
  category: getCategoryPath(faq.categoryId, categories),
  updatedAt: faq.updatedAt ?? "",
}));

export const glossaries: GlossaryItem[] = glossaryTerms.map((term) => ({
  ...term,
  updatedAt: term.updatedAt ?? "",
}));

export const users: UserItem[] = profiles.map((profile) => ({
  ...profile,
  groups: profile.groupIds
    .map((groupId) => groups.find((group) => group.id === groupId)?.displayName)
    .filter((groupName): groupName is string => Boolean(groupName)),
  role: roles.find((role) => role.id === profile.roleId)?.displayName ?? "",
}));
