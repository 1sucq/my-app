import {
  Category,
  DocumentItem,
  FaqItem,
  GlossaryItem,
  GroupItem,
  RoleItem,
  UserItem,
} from "./types";

export const categories: Category[] = [
  { id: "cat-hr", name: "人事", level: 1, order: 1 },
  { id: "cat-hr-rules", name: "規程", parentId: "cat-hr", level: 2, order: 1 },
  {
    id: "cat-hr-work",
    name: "就業規則",
    parentId: "cat-hr-rules",
    level: 3,
    order: 1,
  },
  { id: "cat-ga", name: "総務", level: 1, order: 2 },
  { id: "cat-acc", name: "経理", level: 1, order: 3 },
];

export const categoryNames = ["人事", "人事 / 規程", "人事 / 規程 / 就業規則", "総務", "経理"];

export const documents: DocumentItem[] = [
  {
    id: "doc-001",
    displayName: "服務規程",
    version: "Ver.1.2",
    category: "人事 / 規程",
    registrationStatus: "レビュー中",
    syncStatus: "未同期",
    uploadFileName: "服務規程_20260401_r5.pdf",
    storagePath: "s3://qai-documents/policy-operations/regulation/po_reg_01.pdf",
    updatedAt: "2026/06/01",
  },
  {
    id: "doc-002",
    displayName: "経費精算マニュアル",
    version: "Ver.2.0",
    category: "経理",
    registrationStatus: "公開中",
    syncStatus: "同期済",
    uploadFileName: "expense_manual_20260510.pdf",
    storagePath: "s3://qai-documents/accounting/expense_manual.pdf",
    updatedAt: "2026/05/10",
  },
];

export const faqs: FaqItem[] = [
  {
    id: "faq-001",
    displayName: "有給休暇の申請方法",
    body: "勤怠システムから申請し、上長承認後に確定します。",
    featured: true,
    category: "人事 / 規程",
    updatedAt: "2026/06/02",
  },
  {
    id: "faq-002",
    displayName: "領収書の提出期限",
    body: "原則として精算月の翌月5営業日以内です。",
    featured: false,
    category: "経理",
    updatedAt: "2026/05/20",
  },
];

export const glossaries: GlossaryItem[] = [
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
    displayName: "人事部",
    categories: ["人事", "人事 / 規程"],
    memberCount: 12,
  },
  {
    id: "group-backoffice",
    displayName: "管理部",
    categories: ["人事", "総務", "経理"],
    memberCount: 24,
  },
];

export const users: UserItem[] = [
  {
    id: "user-001",
    displayName: "山田 太郎",
    email: "taro.yamada@example.com",
    groups: ["人事部"],
    role: "編集者",
  },
  {
    id: "user-002",
    displayName: "佐藤 花子",
    email: "hanako.sato@example.com",
    groups: ["管理部", "人事部"],
    role: "管理者",
  },
];
