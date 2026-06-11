"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  buildCategoryTree,
  flattenCategoryNode,
  type CategoryNode,
} from "@/lib/app/category-utils";
import { Category } from "@/lib/app/types";

type ValueMode = "id" | "path";

type CategoryTreeProps = {
  categories: Category[];
  selectedValues?: string[];
  valueMode?: ValueMode;
  selectable?: "single" | "multiple" | "none";
  showActions?: boolean;
  onSelect?: (value: string) => void;
  onChange?: (values: string[]) => void;
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
};

type CategoryTreeSelectProps = {
  categories: Category[];
  value: string | string[];
  mode: "single" | "multiple";
  valueMode?: ValueMode;
  onChange: (value: string | string[]) => void;
};

function nodeValue(node: CategoryNode, valueMode: ValueMode) {
  return valueMode === "id" ? node.id : node.path;
}

function TreeCheckbox({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean;
  indeterminate: boolean;
  onChange: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 rounded border-slate-300"
    />
  );
}

export function CategoryTree({
  categories,
  selectedValues = [],
  valueMode = "path",
  selectable = "none",
  showActions = false,
  onSelect,
  onChange,
  onEdit,
  onDelete,
}: CategoryTreeProps) {
  const roots = useMemo(() => buildCategoryTree(categories), [categories]);
  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(categories.map((category) => category.id)),
  );

  const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues]);

  const toggleOpen = (id: string) => {
    setOpenIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleMultiple = (node: CategoryNode) => {
    const descendants = flattenCategoryNode(node).map((item) => nodeValue(item, valueMode));
    const allSelected = descendants.every((value) => selectedSet.has(value));
    const next = new Set(selectedSet);

    descendants.forEach((value) => {
      if (allSelected) next.delete(value);
      else next.add(value);
    });

    onChange?.([...next]);
  };

  const renderNode = (node: CategoryNode) => {
    const hasChildren = node.children.length > 0;
    const isOpen = openIds.has(node.id);
    const value = nodeValue(node, valueMode);
    const descendantValues = flattenCategoryNode(node).map((item) => nodeValue(item, valueMode));
    const selectedCount = descendantValues.filter((item) => selectedSet.has(item)).length;
    const isChecked = selectable === "multiple"
      ? selectedCount === descendantValues.length
      : selectedSet.has(value);
    const isIndeterminate =
      selectable === "multiple" && selectedCount > 0 && selectedCount < descendantValues.length;

    return (
      <div key={node.id} className="space-y-1">
        <div
          className={`flex flex-wrap items-center gap-2 rounded-md px-2 py-1.5 text-sm sm:flex-nowrap ${
            selectedSet.has(value)
              ? "bg-sky-50 text-sky-950 ring-1 ring-sky-100"
              : "text-slate-700 hover:bg-slate-50"
          }`}
          style={{ marginLeft: `${(node.level - 1) * 18}px` }}
        >
          <button
            type="button"
            onClick={() => hasChildren && toggleOpen(node.id)}
            className="flex h-5 w-5 items-center justify-center rounded text-slate-500 hover:bg-slate-200"
            aria-label={hasChildren ? `${node.name}を開閉` : node.name}
          >
            {hasChildren ? (isOpen ? "▼" : "▶") : "・"}
          </button>

          {selectable === "single" ? (
            <input
              type="radio"
              checked={selectedSet.has(value)}
              onChange={() => onSelect?.(value)}
              className="h-4 w-4 border-slate-300"
            />
          ) : null}
          {selectable === "multiple" ? (
            <TreeCheckbox
              checked={isChecked}
              indeterminate={isIndeterminate}
              onChange={() => toggleMultiple(node)}
            />
          ) : null}

          <button
            type="button"
            onClick={() => {
              if (selectable === "single") onSelect?.(value);
              if (selectable === "multiple") toggleMultiple(node);
            }}
            className="min-w-0 flex-1 truncate text-left font-medium"
          >
            {node.name}
          </button>

          {showActions ? (
            <div className="ml-7 flex w-full shrink-0 justify-end gap-2 sm:ml-0 sm:w-auto">
              <button
                type="button"
                onClick={() => onEdit?.(node)}
                className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-white"
              >
                編集
              </button>
              <button
                type="button"
                onClick={() => onDelete?.(node)}
                className="rounded-md border border-rose-300 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
              >
                削除
              </button>
            </div>
          ) : null}
        </div>
        {hasChildren && isOpen ? (
          <div className="space-y-1">
            {node.children.map((child) => renderNode(child))}
          </div>
        ) : null}
      </div>
    );
  };

  return <div className="space-y-1">{roots.map((node) => renderNode(node))}</div>;
}

export function CategoryTreeSelect({
  categories,
  value,
  mode,
  valueMode = "path",
  onChange,
}: CategoryTreeSelectProps) {
  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <CategoryTree
        categories={categories}
        selectedValues={selectedValues}
        valueMode={valueMode}
        selectable={mode}
        onSelect={(nextValue) => onChange(nextValue)}
        onChange={(nextValues) => onChange(nextValues)}
      />
    </div>
  );
}
