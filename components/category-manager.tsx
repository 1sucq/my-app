"use client";

import { useMemo, useState } from "react";

import { CategoryTreeSelect, CategoryTree } from "@/components/category-tree";
import { Category } from "@/lib/app/types";

type CategoryManagerProps = {
  initialRows: Category[];
};

function collectDescendantIds(categoryId: string, categories: Category[]): string[] {
  const children = categories.filter((category) => category.parentId === categoryId);
  return children.flatMap((child) => [child.id, ...collectDescendantIds(child.id, categories)]);
}

function createEmptyCategory(categories: Category[]): Category {
  const id = `cat-${Date.now().toString(36)}`;

  return {
    id,
    code: id,
    name: "",
    level: 1,
    order: categories.filter((category) => !category.parentId).length + 1,
  };
}

export function CategoryManager({ initialRows }: CategoryManagerProps) {
  const [rows, setRows] = useState(initialRows);
  const [editingRow, setEditingRow] = useState<Category | null>(null);
  const [rowToDelete, setRowToDelete] = useState<Category | null>(null);
  const [message, setMessage] = useState("");

  const parentOptions = useMemo(
    () => rows.filter((category) => category.level < 3 && category.id !== editingRow?.id),
    [editingRow?.id, rows],
  );

  const deriveLevel = (parentId?: string) => {
    if (!parentId) return 1;
    const parent = rows.find((category) => category.id === parentId);
    return Math.min((parent?.level ?? 0) + 1, 3) as 1 | 2 | 3;
  };

  const saveCategory = () => {
    if (!editingRow) return;

    if (!editingRow.name.trim()) {
      setMessage("表示名は必須です。");
      return;
    }

    setRows((currentRows) => {
      const nextRow = {
        ...editingRow,
        name: editingRow.name.trim(),
        level: deriveLevel(editingRow.parentId),
      };
      const exists = currentRows.some((category) => category.id === nextRow.id);
      return exists
        ? currentRows.map((category) => (category.id === nextRow.id ? nextRow : category))
        : [...currentRows, nextRow];
    });
    setEditingRow(null);
    setMessage("保存しました。");
  };

  const deleteCategory = () => {
    if (!rowToDelete) return;
    const deleteIds = new Set([
      rowToDelete.id,
      ...collectDescendantIds(rowToDelete.id, rows),
    ]);
    setRows((currentRows) => currentRows.filter((category) => !deleteIds.has(category.id)));
    setRowToDelete(null);
    setMessage("削除しました。");
  };

  return (
    <section className="flex h-full min-h-0 flex-col gap-4">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">管理者 / 教師データ / カテゴリ</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">カテゴリ</h1>
          <p className="mt-1 text-sm text-slate-600">
            parentIdをもとに3階層までのカテゴリをツリー形式で管理します。
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingRow(createEmptyCategory(rows));
            setMessage("");
          }}
          className="w-full rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 sm:w-fit"
        >
          新規作成
        </button>
      </div>

      {message ? (
        <p className="rounded-md bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {message}
        </p>
      ) : null}

      <div className="min-h-0 overflow-auto rounded-lg border border-slate-200 bg-white p-3 sm:p-4">
        <div className="mb-3 grid min-w-[420px] grid-cols-[1fr_140px] border-b border-slate-200 px-2 pb-3 text-xs font-bold uppercase tracking-wide text-slate-500 sm:min-w-0">
          <span>カテゴリ名</span>
          <span className="text-right">操作</span>
        </div>
        <CategoryTree
          categories={rows}
          valueMode="id"
          showActions
          onEdit={(category) => {
            setEditingRow(category);
            setMessage("");
          }}
          onDelete={(category) => setRowToDelete(category)}
        />
      </div>

      {editingRow ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4">
          <div className="flex max-h-[92dvh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-xl">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-bold text-slate-950">カテゴリ編集</h2>
              <p className="mt-1 text-sm text-slate-500">
                親カテゴリを選ぶと階層を自動判定します。
              </p>
            </div>
            <div className="grid gap-5 overflow-auto p-4 sm:p-6">
              {message && message !== "保存しました。" && message !== "削除しました。" ? (
                <p className="rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {message}
                </p>
              ) : null}
              <label className="block text-sm font-medium text-slate-700">
                表示名
                <input
                  value={editingRow.name}
                  onChange={(event) =>
                    setEditingRow((current) =>
                      current ? { ...current, name: event.target.value } : current,
                    )
                  }
                  className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </label>

              <div>
                <p className="text-sm font-medium text-slate-700">親カテゴリ</p>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setEditingRow((current) =>
                        current ? { ...current, parentId: undefined, level: 1 } : current,
                      )
                    }
                    className={`mb-2 rounded-md px-3 py-2 text-sm font-medium ${
                      !editingRow.parentId
                        ? "bg-sky-100 text-sky-950"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    なし
                  </button>
                  <CategoryTreeSelect
                    categories={parentOptions}
                    value={editingRow.parentId ?? ""}
                    valueMode="id"
                    mode="single"
                    onChange={(value) => {
                      const parentId = String(value);
                      setEditingRow((current) =>
                        current
                          ? {
                              ...current,
                              parentId,
                              level: deriveLevel(parentId),
                            }
                          : current,
                      );
                    }}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  階層
                  <input
                    value={deriveLevel(editingRow.parentId)}
                    disabled
                    className="mt-2 w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-sm"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  並び順
                  <input
                    type="number"
                    value={editingRow.order}
                    onChange={(event) =>
                      setEditingRow((current) =>
                        current ? { ...current, order: Number(event.target.value) } : current,
                      )
                    }
                    className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  />
                </label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 border-t border-slate-200 px-4 py-4 sm:flex sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={() => setEditingRow(null)}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={saveCategory}
                className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {rowToDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl sm:p-6">
            <h2 className="text-lg font-bold text-slate-950">削除確認</h2>
            <p className="mt-3 text-sm text-slate-600">
              配下カテゴリも含めて削除します。よろしいですか？
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2 sm:flex sm:justify-end">
              <button
                type="button"
                onClick={() => setRowToDelete(null)}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={deleteCategory}
                className="rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
