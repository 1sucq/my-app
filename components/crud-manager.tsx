"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";

import { CategoryTreeSelect } from "@/components/category-tree";
import {
  AppRecord,
  ColumnConfig,
  FieldConfig,
  FilterConfig,
} from "@/lib/app/types";

type IdentifiedRecord = AppRecord & { id: string };
type LoadingAction = "idle" | "searching" | "saving" | "deleting" | "importing" | "exporting";
type ToastType = "success" | "error";

type ToastState = {
  type: ToastType;
  message: string;
};

type CrudManagerProps<T extends IdentifiedRecord> = {
  title: string;
  description: string;
  breadcrumb: string[];
  initialRows: T[];
  columns: ColumnConfig<T>[];
  fields: FieldConfig<T>[];
  idPrefix: string;
  filters?: FilterConfig<T>[];
  enableUpload?: boolean;
  enablePasswordReset?: boolean;
};

function displayValue(value: AppRecord[string]) {
  if (Array.isArray(value)) return value.join("、");
  if (typeof value === "boolean") return value ? "有効" : "無効";
  return value?.toString() ?? "";
}

function displayRenderedValue(value: ReturnType<NonNullable<ColumnConfig<IdentifiedRecord>["render"]>>) {
  if (typeof value === "string" || typeof value === "number") return value.toString();
  return "";
}

function csvEscape(value: AppRecord[string]) {
  return `"${displayValue(value).replaceAll('"', '""')}"`;
}

function createEmptyRecord<T extends IdentifiedRecord>(
  fields: FieldConfig<T>[],
  id: string,
) {
  return fields.reduce<AppRecord>(
    (record, field) => {
      if (field.type === "boolean") record[field.key] = false;
      else if (field.type === "number") record[field.key] = 0;
      else if (field.type === "multiselect" || field.type === "category-multiple") {
        record[field.key] = [];
      }
      else record[field.key] = "";
      return record;
    },
    { id },
  ) as T;
}

function valueMatchesFilter(value: AppRecord[string], filterValue: string) {
  if (!filterValue) return true;
  if (Array.isArray(value)) return value.includes(filterValue);
  if (typeof value === "boolean") return String(value) === filterValue;
  return displayValue(value) === filterValue;
}

function BooleanBadge({ value }: { value: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
        value
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
          : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
      }`}
    >
      {value ? "有効" : "無効"}
    </span>
  );
}

export function CrudManager<T extends IdentifiedRecord>({
  title,
  description,
  breadcrumb,
  initialRows,
  columns,
  fields,
  idPrefix,
  filters = [],
  enableUpload = true,
  enablePasswordReset = false,
}: CrudManagerProps<T>) {
  const [rows, setRows] = useState<T[]>(initialRows);
  const [query, setQuery] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [editingRow, setEditingRow] = useState<T | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFileName, setUploadFileName] = useState("");
  const [toast, setToast] = useState<ToastState | null>(null);
  const [validationMessage, setValidationMessage] = useState("");
  const [rowToDelete, setRowToDelete] = useState<T | null>(null);
  const [loadingAction, setLoadingAction] = useState<LoadingAction>("idle");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const isBusy = loadingAction !== "idle";

  const showToast = (message: string, type: ToastType = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const showSearchLoading = () => {
    setLoadingAction("searching");
    window.setTimeout(() => setLoadingAction("idle"), 250);
  };

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesQuery =
        !normalizedQuery ||
        Object.values(row).some((value) =>
          displayValue(value).toLowerCase().includes(normalizedQuery),
        );
      const matchesFilters = filters.every((filter) =>
        valueMatchesFilter(row[filter.key], filterValues[filter.key] ?? ""),
      );
      return matchesQuery && matchesFilters;
    });
  }, [filterValues, filters, query, rows]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pagedRows = filteredRows.slice((safePage - 1) * pageSize, safePage * pageSize);

  const validateRow = (row: T) => {
    for (const field of fields) {
      if (!field.required) continue;
      const value = row[field.key];
      if (Array.isArray(value) && value.length === 0) return `${field.label}は必須です。`;
      if (typeof value === "string" && !value.trim()) return `${field.label}は必須です。`;
      if (value === undefined || value === "") return `${field.label}は必須です。`;
    }

    if ("email" in row) {
      const email = displayValue(row.email);
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return "メールアドレスの形式が正しくありません。";
      }
    }

    return "";
  };

  const openNewEditor = () => {
    setEditingRow(
      createEmptyRecord(fields, `${idPrefix}-${Date.now().toString(36)}`),
    );
    setValidationMessage("");
    setIsEditorOpen(true);
  };

  const saveRow = () => {
    if (!editingRow || isBusy) return;

    const validationError = validateRow(editingRow);
    if (validationError) {
      setValidationMessage(validationError);
      showToast("入力内容に誤りがあります。", "error");
      return;
    }

    setLoadingAction("saving");
    window.setTimeout(() => {
      setRows((currentRows) => {
        const exists = currentRows.some((row) => row.id === editingRow.id);
        if (exists) {
          return currentRows.map((row) =>
            row.id === editingRow.id ? editingRow : row,
          );
        }
        return [editingRow, ...currentRows];
      });
      setIsEditorOpen(false);
      setValidationMessage("");
      setLoadingAction("idle");
      showToast("保存しました");
    }, 350);
  };

  const confirmDelete = () => {
    if (!rowToDelete || isBusy) return;

    setLoadingAction("deleting");
    window.setTimeout(() => {
      setRows((currentRows) =>
        currentRows.filter((row) => row.id !== rowToDelete.id),
      );
      setRowToDelete(null);
      setLoadingAction("idle");
      showToast("削除しました");
    }, 350);
  };

  const exportCsv = () => {
    if (isBusy) return;

    setLoadingAction("exporting");
    window.setTimeout(() => {
      const header = columns.map((column) => csvEscape(column.label)).join(",");
      const body = rows
        .map((row) =>
          columns
            .map((column) =>
              csvEscape(
                column.render
                  ? displayRenderedValue(column.render(row))
                  : row[column.key],
              ),
            )
            .join(","),
        )
        .join("\n");
      const blob = new Blob([`${header}\n${body}`], {
        type: "text/csv;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${idPrefix}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
      setLoadingAction("idle");
      showToast("エクスポートしました");
    }, 350);
  };

  const importCsv = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || isBusy) return;

    setLoadingAction("importing");
    window.setTimeout(() => {
      setLoadingAction("idle");
      showToast("インポートしました");
    }, 350);
  };

  const updateField = (
    field: FieldConfig<T>,
    value: string | number | boolean | string[],
  ) => {
    setEditingRow((currentRow) => {
      if (!currentRow) return currentRow;
      const nextRow = { ...currentRow, [field.key]: value };
      return field.derive ? { ...nextRow, ...field.derive(value, nextRow) } : nextRow;
    });
    setValidationMessage("");
  };

  const renderCell = (row: T, column: ColumnConfig<T>) => {
    if (column.render) return column.render(row);
    const value = row[column.key];
    if (typeof value === "boolean") return <BooleanBadge value={value} />;
    return displayValue(value);
  };

  return (
    <section className="flex h-full min-h-0 flex-col gap-4">
      {toast ? (
        <div
          className={`fixed right-4 top-4 z-[60] rounded-lg px-4 py-3 text-sm font-semibold shadow-lg ${
            toast.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-rose-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {breadcrumb.join(" / ")}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">{title}</h1>
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={exportCsv}
            disabled={isBusy}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingAction === "exporting" ? "読み込み中..." : "CSVエクスポート"}
          </button>
          <label className="cursor-pointer rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            {loadingAction === "importing" ? "読み込み中..." : "CSVインポート"}
            <input
              type="file"
              accept=".csv"
              className="hidden"
              disabled={isBusy}
              onChange={importCsv}
            />
          </label>
          {enableUpload ? (
            <button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              disabled={isBusy}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              アップロード
            </button>
          ) : null}
          <button
            type="button"
            onClick={openNewEditor}
            disabled={isBusy}
            className="rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            新規作成
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 lg:flex-row lg:items-end">
        <label className="w-full max-w-md text-sm font-medium text-slate-700">
          検索
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setCurrentPage(1);
              showSearchLoading();
            }}
            placeholder={`${title}を検索`}
            className="mt-2 w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          />
        </label>
        {filters.map((filter) => (
          <label key={filter.key} className="w-full max-w-xs text-sm font-medium text-slate-700">
            {filter.label}
            <select
              value={filterValues[filter.key] ?? ""}
              onChange={(event) => {
                setFilterValues((currentValues) => ({
                  ...currentValues,
                  [filter.key]: event.target.value,
                }));
                setCurrentPage(1);
                showSearchLoading();
              }}
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            >
              <option value="">{filter.allLabel ?? "すべて"}</option>
              {filter.options.map((option) => (
                <option key={option} value={option}>
                  {filter.optionLabels?.[option] ?? option}
                </option>
              ))}
            </select>
          </label>
        ))}
        <div className="text-sm text-slate-500">
          {loadingAction === "searching" ? "読み込み中..." : `${filteredRows.length}件`}
        </div>
      </div>

      <div className="min-h-0 overflow-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full table-fixed border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-600">
            <tr>
              <th className="w-10 px-3 py-3">
                <input type="checkbox" aria-label="全選択" />
              </th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-3 py-3 ${column.align === "right" ? "text-right" : ""}`}
                >
                  {column.label}
                </th>
              ))}
              <th className="w-36 px-3 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {pagedRows.length > 0 ? (
              pagedRows.map((row) => (
                <tr key={row.id} className="hover:bg-sky-50/60">
                  <td className="px-3 py-3">
                    <input type="checkbox" aria-label={`${row.id}を選択`} />
                  </td>
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`truncate px-3 py-3 text-slate-700 ${
                        column.align === "right" || column.key === "updatedAt"
                          ? "text-right"
                          : ""
                      }`}
                    >
                      {renderCell(row, column)}
                    </td>
                  ))}
                  <td className="px-3 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingRow(row);
                          setValidationMessage("");
                          setIsEditorOpen(true);
                        }}
                        disabled={isBusy}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                      >
                        編集
                      </button>
                      <button
                        type="button"
                        onClick={() => setRowToDelete(row)}
                        disabled={isBusy}
                        className="rounded-md border border-rose-300 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + 2}
                  className="px-4 py-12 text-center text-sm text-slate-500"
                >
                  データがありません。新規作成ボタンから登録してください。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 lg:flex-row lg:items-center lg:justify-between">
        <label className="flex items-center gap-2">
          1ページあたり
          <select
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              setCurrentPage(1);
            }}
            className="rounded-md border border-slate-300 px-2 py-1"
          >
            {[10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}件
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={safePage <= 1}
            className="rounded-md border border-slate-300 px-3 py-1 font-medium disabled:opacity-50"
          >
            前へ
          </button>
          <span>
            {safePage} / {totalPages} ページ
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            disabled={safePage >= totalPages}
            className="rounded-md border border-slate-300 px-3 py-1 font-medium disabled:opacity-50"
          >
            次へ
          </button>
        </div>
      </div>

      {isEditorOpen && editingRow ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-bold text-slate-950">{title}編集</h2>
              <p className="mt-1 text-sm text-slate-500">入力内容はモックデータに保存されます。</p>
            </div>
            <div className="grid max-h-[70vh] gap-4 overflow-auto p-6 md:grid-cols-2">
              {validationMessage ? (
                <p className="md:col-span-2 rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {validationMessage}
                </p>
              ) : null}
              {fields.map((field) => (
                <label key={field.key} className="block text-sm font-medium text-slate-700">
                  {field.label}
                  {field.type === "textarea" ? (
                    <textarea
                      value={displayValue(editingRow[field.key])}
                      onChange={(event) => updateField(field, event.target.value)}
                      required={field.required}
                      className="mt-2 min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                    />
                  ) : field.type === "select" ? (
                    <select
                      value={displayValue(editingRow[field.key])}
                      onChange={(event) => updateField(field, event.target.value)}
                      required={field.required}
                      disabled={field.auto}
                      className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                    >
                      <option value="">選択してください</option>
                      {field.options?.map((option) => (
                        <option key={option} value={option}>
                          {field.optionLabels?.[option] ?? option}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "multiselect" ? (
                    <div className="mt-2 grid gap-2 rounded-md border border-slate-200 p-3">
                      {field.options?.map((option) => {
                        const selectedValues = Array.isArray(editingRow[field.key])
                          ? (editingRow[field.key] as string[])
                          : [];
                        const isChecked = selectedValues.includes(option);

                        return (
                          <label key={option} className="flex items-center gap-2 text-sm font-normal">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(event) => {
                                updateField(
                                  field,
                                  event.target.checked
                                    ? [...selectedValues, option]
                                    : selectedValues.filter((value) => value !== option),
                                );
                              }}
                            />
                            {field.optionLabels?.[option] ?? option}
                          </label>
                        );
                      })}
                    </div>
                  ) : field.type === "category-single" ? (
                    <div className="mt-2">
                      <CategoryTreeSelect
                        categories={field.categories ?? []}
                        mode="single"
                        valueMode="id"
                        value={displayValue(editingRow[field.key])}
                        onChange={(nextValue) => updateField(field, String(nextValue))}
                      />
                    </div>
                  ) : field.type === "category-multiple" ? (
                    <div className="mt-2">
                      <CategoryTreeSelect
                        categories={field.categories ?? []}
                        mode="multiple"
                        valueMode="id"
                        value={
                          Array.isArray(editingRow[field.key])
                            ? (editingRow[field.key] as string[])
                            : []
                        }
                        onChange={(nextValue) =>
                          updateField(field, Array.isArray(nextValue) ? nextValue : [String(nextValue)])
                        }
                      />
                    </div>
                  ) : field.type === "boolean" ? (
                    <span className="mt-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={Boolean(editingRow[field.key])}
                        onChange={(event) => updateField(field, event.target.checked)}
                      />
                      <span className="text-sm font-normal text-slate-600">有効にする</span>
                    </span>
                  ) : (
                    <input
                      type={field.type === "number" ? "number" : "text"}
                      value={displayValue(editingRow[field.key])}
                      onChange={(event) =>
                        updateField(
                          field,
                          field.type === "number"
                            ? Number(event.target.value)
                            : event.target.value,
                        )
                      }
                      required={field.required}
                      disabled={field.auto}
                      className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                    />
                  )}
                </label>
              ))}
              {enablePasswordReset ? (
                <div className="md:col-span-2">
                  <button
                    type="button"
                    onClick={() => showToast("パスワードリセットメールを送信しました。")}
                    className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-medium text-sky-800 hover:bg-sky-100"
                  >
                    パスワードリセット
                  </button>
                </div>
              ) : null}
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                disabled={isBusy}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={saveRow}
                disabled={isBusy}
                className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {loadingAction === "saving" ? "保存中..." : "保存"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {rowToDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-950">削除確認</h2>
            <p className="mt-3 text-sm text-slate-600">
              このデータを削除します。よろしいですか？
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRowToDelete(null)}
                disabled={isBusy}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isBusy}
                className="rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300"
              >
                {loadingAction === "deleting" ? "削除中..." : "削除する"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isUploadOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4">
          <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-950">ファイルアップロード</h2>
            <p className="mt-1 text-sm text-slate-500">
              将来はS3保存とベクトルDB同期をここから実行します。
            </p>
            <label className="mt-6 flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center hover:bg-slate-100">
              <span className="text-4xl text-slate-400">↑</span>
              <span className="mt-3 text-sm font-medium text-slate-700">
                ここにファイルをドラッグアンドドロップ
              </span>
              <span className="mt-1 text-sm text-slate-500">または</span>
              <span className="mt-3 rounded-md bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-900">
                ファイルを選択
              </span>
              <input
                type="file"
                className="hidden"
                onChange={(event) =>
                  setUploadFileName(event.target.files?.[0]?.name ?? "")
                }
              />
            </label>
            {uploadFileName ? (
              <p className="mt-3 text-sm text-slate-600">
                選択中: {uploadFileName}
              </p>
            ) : null}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsUploadOpen(false)}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast(uploadFileName ? "保存しました" : "入力内容に誤りがあります", uploadFileName ? "success" : "error");
                  setIsUploadOpen(false);
                }}
                className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
