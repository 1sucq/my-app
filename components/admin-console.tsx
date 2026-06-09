"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { CategoryManager } from "@/components/category-manager";
import { CrudManager } from "@/components/crud-manager";
import {
  categories,
  categoryNames,
  documents,
  faqs,
  glossaries,
  groups,
  roles,
  users,
} from "@/lib/app/mock-data";
import {
  ColumnConfig,
  DocumentItem,
  FaqItem,
  FieldConfig,
  FilterConfig,
  GlossaryItem,
  GroupItem,
  RoleItem,
  UserItem,
} from "@/lib/app/types";

type AdminScreenKey =
  | "home"
  | "categories"
  | "documents"
  | "faqs"
  | "glossaries"
  | "users"
  | "groups"
  | "roles";

const screenLabels: Record<AdminScreenKey, string> = {
  home: "ホーム",
  categories: "カテゴリ",
  documents: "ドキュメント",
  faqs: "FAQ",
  glossaries: "用語集",
  users: "ユーザ",
  groups: "グループ",
  roles: "ロール",
};

const menuSections: { title: string; items: { key: AdminScreenKey; label: string }[] }[] = [
  {
    title: "教師データ",
    items: [
      { key: "categories", label: "カテゴリ" },
      { key: "documents", label: "ドキュメント" },
      { key: "faqs", label: "FAQ" },
      { key: "glossaries", label: "用語集" },
    ],
  },
  {
    title: "権限",
    items: [
      { key: "users", label: "ユーザ" },
      { key: "groups", label: "グループ" },
      { key: "roles", label: "ロール" },
    ],
  },
];

const rolePermissions: Record<string, AdminScreenKey[]> = {
  利用者: [],
  編集者: ["categories", "documents", "faqs", "glossaries"],
  管理者: ["categories", "documents", "faqs", "glossaries", "users", "groups", "roles"],
};

const roleOptions = roles.map((role) => role.displayName);
const groupOptions = groups.map((group) => group.displayName);
const documentRegistrationStatuses = ["下書き", "レビュー中", "承認済", "公開中", "廃止"];
const documentSyncStatuses = ["未同期", "同期中", "同期済", "同期失敗"];

const documentColumns: ColumnConfig<DocumentItem>[] = [
  { key: "id", label: "ドキュメントID" },
  { key: "displayName", label: "表示名" },
  { key: "version", label: "バージョン" },
  { key: "category", label: "カテゴリ" },
  { key: "registrationStatus", label: "登録状態" },
  { key: "syncStatus", label: "同期状態" },
  { key: "uploadFileName", label: "アップロードファイル名" },
  { key: "updatedAt", label: "更新日時", align: "right" },
];

const documentFields: FieldConfig<DocumentItem>[] = [
  { key: "id", label: "ドキュメントID", required: true },
  { key: "displayName", label: "表示名", required: true },
  { key: "version", label: "バージョン", required: true },
  { key: "category", label: "カテゴリ", type: "category-single", categories, required: true },
  {
    key: "registrationStatus",
    label: "登録状態",
    type: "select",
    options: documentRegistrationStatuses,
    required: true,
  },
  {
    key: "syncStatus",
    label: "同期状態",
    type: "select",
    options: documentSyncStatuses,
    required: true,
  },
  { key: "uploadFileName", label: "アップロードファイル名" },
  { key: "storagePath", label: "S3保存先" },
  { key: "updatedAt", label: "更新日時" },
];

const faqColumns: ColumnConfig<FaqItem>[] = [
  { key: "displayName", label: "表示名" },
  { key: "featured", label: "よくある質問フラグ" },
  { key: "category", label: "カテゴリ" },
  { key: "updatedAt", label: "更新日時", align: "right" },
];

const faqFields: FieldConfig<FaqItem>[] = [
  { key: "displayName", label: "表示名", required: true },
  { key: "body", label: "FAQ本文", type: "textarea", required: true },
  { key: "featured", label: "よくある質問フラグ", type: "boolean" },
  { key: "category", label: "カテゴリ", type: "category-single", categories, required: true },
  { key: "updatedAt", label: "更新日時" },
];

const documentFilters: FilterConfig<DocumentItem>[] = [
  { key: "category", label: "カテゴリ", options: categoryNames },
  {
    key: "registrationStatus",
    label: "登録状態",
    options: documentRegistrationStatuses,
  },
  {
    key: "syncStatus",
    label: "同期状態",
    options: documentSyncStatuses,
  },
];

const faqFilters: FilterConfig<FaqItem>[] = [
  {
    key: "featured",
    label: "よくある質問フラグ",
    options: ["true", "false"],
    optionLabels: { true: "有効", false: "無効" },
  },
  { key: "category", label: "カテゴリ", options: categoryNames },
];

const userFilters: FilterConfig<UserItem>[] = [
  { key: "groups", label: "グループ", options: groupOptions },
  { key: "role", label: "ロール", options: roleOptions },
];

const glossaryColumns: ColumnConfig<GlossaryItem>[] = [
  { key: "term", label: "用語" },
  { key: "meaning", label: "意味" },
  { key: "updatedAt", label: "更新日時" },
];

const glossaryFields: FieldConfig<GlossaryItem>[] = [
  { key: "term", label: "用語", required: true },
  { key: "meaning", label: "意味", type: "textarea", required: true },
  { key: "updatedAt", label: "更新日時" },
];

const userColumns: ColumnConfig<UserItem>[] = [
  { key: "displayName", label: "表示名" },
  { key: "email", label: "メールアドレス" },
  { key: "groups", label: "グループ" },
  { key: "role", label: "ロール" },
];

const userFields: FieldConfig<UserItem>[] = [
  { key: "displayName", label: "表示名", required: true },
  { key: "email", label: "メールアドレス", required: true },
  { key: "groups", label: "グループ", type: "multiselect", options: groupOptions, required: true },
  { key: "role", label: "ロール", type: "select", options: roleOptions, required: true },
];

const groupColumns: ColumnConfig<GroupItem>[] = [
  { key: "displayName", label: "表示名" },
  {
    key: "categories",
    label: "カテゴリ数",
    render: (row) => row.categories.length.toString(),
  },
  { key: "memberCount", label: "所属人数" },
];

const groupFields: FieldConfig<GroupItem>[] = [
  { key: "displayName", label: "表示名", required: true },
  {
    key: "categories",
    label: "閲覧可能カテゴリ",
    type: "category-multiple",
    categories,
  },
  { key: "memberCount", label: "所属人数", type: "number" },
];

const roleColumns: ColumnConfig<RoleItem>[] = [
  { key: "displayName", label: "表示名" },
  { key: "chatUsage", label: "チャット利用" },
  { key: "categoryManagement", label: "カテゴリ管理" },
  { key: "documentManagement", label: "ドキュメント管理" },
  { key: "faqManagement", label: "FAQ管理" },
  { key: "glossaryManagement", label: "用語集管理" },
  { key: "userManagement", label: "ユーザ管理" },
  { key: "groupManagement", label: "グループ管理" },
  { key: "roleManagement", label: "ロール管理" },
];

const roleFields: FieldConfig<RoleItem>[] = [
  { key: "displayName", label: "表示名", required: true },
  { key: "chatUsage", label: "チャット利用", type: "boolean" },
  { key: "categoryManagement", label: "カテゴリ管理", type: "boolean" },
  { key: "documentManagement", label: "ドキュメント管理", type: "boolean" },
  { key: "faqManagement", label: "FAQ管理", type: "boolean" },
  { key: "glossaryManagement", label: "用語集管理", type: "boolean" },
  { key: "userManagement", label: "ユーザ管理", type: "boolean" },
  { key: "groupManagement", label: "グループ管理", type: "boolean" },
  { key: "roleManagement", label: "ロール管理", type: "boolean" },
];

function AdminHome() {
  return (
    <section className="min-h-[560px] rounded-lg border border-slate-200 bg-white p-6">
      <p className="text-sm font-semibold text-amber-700">管理者画面</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-950">ホーム</h1>
      <p className="mt-2 text-sm text-slate-600">
        左メニューから管理対象を選択してください。
      </p>
    </section>
  );
}

export function AdminConsole() {
  const router = useRouter();
  const [activeScreen, setActiveScreen] = useState<AdminScreenKey>("home");
  const [currentRole, setCurrentRole] = useState("管理者");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    教師データ: true,
    権限: true,
  });
  const visibleScreens = rolePermissions[currentRole];
  const visibleMenuSections = menuSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => visibleScreens.includes(item.key)),
    }))
    .filter((section) => section.items.length > 0);

  const navigateAdmin = (screen: AdminScreenKey) => {
    setActiveScreen(screen);
  };

  const toggleSection = (title: string) => {
    setOpenSections((current) => ({ ...current, [title]: !current[title] }));
  };

  return (
    <main className="flex min-h-dvh bg-slate-100 text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="border-b border-slate-200 px-5 py-5">
          <p className="text-sm font-semibold text-slate-500">AIチャットボット</p>
          <h1 className="mt-1 text-xl font-bold text-slate-950">YourNavi-QAI</h1>
        </div>
        <nav className="flex-1 overflow-auto px-3 py-4">
          {visibleMenuSections.map((section) => (
            <div key={section.title} className="mb-5">
              <button
                type="button"
                onClick={() => toggleSection(section.title)}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-slate-500 hover:bg-slate-100"
              >
                <span>{section.title}</span>
                <span className="text-sm">{openSections[section.title] ? "⌄" : "›"}</span>
              </button>
              {openSections[section.title] ? (
                <div className="mt-1 space-y-1 border-l border-slate-200 pl-3">
                  {section.items.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => navigateAdmin(item.key)}
                      className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium ${
                        activeScreen === item.key
                          ? "bg-amber-100 text-amber-950"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>
        <div className="border-t border-slate-200 px-5 py-4 text-sm text-slate-500">
          お問い合わせ
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur lg:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">管理者</p>
              <h2 className="text-2xl font-bold text-slate-950">{screenLabels[activeScreen]}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-xs font-semibold text-slate-600">
                ロール
                <select
                  value={currentRole}
                  onChange={(event) => {
                    const nextRole = event.target.value;
                    setCurrentRole(nextRole);
                    setActiveScreen("home");
                  }}
                  className="ml-2 rounded-md border border-slate-300 px-2 py-1 text-sm"
                >
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={() => router.push("/user/chat")}
                className="w-fit rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-900 hover:bg-sky-100"
              >
                利用者画面へ
              </button>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 lg:hidden">
            {visibleMenuSections.flatMap((section) => [
              <button
                key={section.title}
                type="button"
                onClick={() => toggleSection(section.title)}
                className="col-span-2 rounded-md bg-white px-3 py-2 text-left text-sm font-bold text-slate-700"
              >
                {openSections[section.title] ? "⌄" : "›"} {section.title}
              </button>,
              ...(openSections[section.title]
                ? section.items.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => navigateAdmin(item.key)}
                  className={`rounded-md px-3 py-2 text-sm font-medium ${
                    activeScreen === item.key
                      ? "bg-amber-100 text-amber-950"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {item.label}
                </button>
                  ))
                : []),
            ])}
          </div>
        </header>

        <div className="min-h-0 flex-1 p-4 lg:p-8">
          {activeScreen === "home" ? <AdminHome /> : null}
          {activeScreen === "categories" ? (
            <CategoryManager initialRows={categories} />
          ) : null}
          {activeScreen === "documents" ? (
            <CrudManager
              title="ドキュメント"
              description="S3保存とベクトルDB同期を想定したドキュメント管理です。"
              breadcrumb={["管理者", "教師データ", "ドキュメント"]}
              initialRows={documents}
              columns={documentColumns}
              fields={documentFields}
              filters={documentFilters}
              idPrefix="doc"
            />
          ) : null}
          {activeScreen === "faqs" ? (
            <CrudManager
              title="FAQ"
              description="カテゴリに紐づくFAQを管理します。よくある質問フラグで利用者表示を制御します。"
              breadcrumb={["管理者", "教師データ", "FAQ"]}
              initialRows={faqs}
              columns={faqColumns}
              fields={faqFields}
              filters={faqFilters}
              idPrefix="faq"
            />
          ) : null}
          {activeScreen === "glossaries" ? (
            <CrudManager
              title="用語集"
              description="カテゴリに紐づかない用語と意味を管理します。"
              breadcrumb={["管理者", "教師データ", "用語集"]}
              initialRows={glossaries}
              columns={glossaryColumns}
              fields={glossaryFields}
              idPrefix="glossary"
            />
          ) : null}
          {activeScreen === "users" ? (
            <CrudManager
              title="ユーザ"
              description="表示名、メールアドレス、所属グループ、ロールを管理します。パスワードは一覧表示しません。"
              breadcrumb={["管理者", "権限", "ユーザ"]}
              initialRows={users}
              columns={userColumns}
              fields={userFields}
              filters={userFilters}
              idPrefix="user"
              enableUpload={false}
              enablePasswordReset
            />
          ) : null}
          {activeScreen === "groups" ? (
            <CrudManager
              title="グループ"
              description="グループごとに閲覧可能カテゴリを複数設定します。"
              breadcrumb={["管理者", "権限", "グループ"]}
              initialRows={groups}
              columns={groupColumns}
              fields={groupFields}
              idPrefix="group"
              enableUpload={false}
            />
          ) : null}
          {activeScreen === "roles" ? (
            <CrudManager
              title="ロール"
              description="機能権限をON/OFFで管理します。"
              breadcrumb={["管理者", "権限", "ロール"]}
              initialRows={roles}
              columns={roleColumns}
              fields={roleFields}
              idPrefix="role"
              enableUpload={false}
            />
          ) : null}
        </div>
      </section>
    </main>
  );
}
