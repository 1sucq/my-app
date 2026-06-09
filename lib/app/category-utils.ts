import type { Category } from "./types";

export type CategoryNode = Category & {
  children: CategoryNode[];
  path: string;
};

export function buildCategoryTree(categories: Category[]): CategoryNode[] {
  const nodes = new Map<string, CategoryNode>();

  categories.forEach((category) => {
    nodes.set(category.id, { ...category, children: [], path: category.name });
  });

  const roots: CategoryNode[] = [];

  nodes.forEach((node) => {
    if (node.parentId && nodes.has(node.parentId)) {
      nodes.get(node.parentId)?.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortNodes = (items: CategoryNode[]) => {
    items.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
    items.forEach((item) => sortNodes(item.children));
  };

  const applyPath = (items: CategoryNode[], parentPath = "") => {
    items.forEach((item) => {
      item.path = parentPath ? `${parentPath} / ${item.name}` : item.name;
      applyPath(item.children, item.path);
    });
  };

  sortNodes(roots);
  applyPath(roots);

  return roots;
}

export function flattenCategoryNode(node: CategoryNode): CategoryNode[] {
  return [node, ...node.children.flatMap((child) => flattenCategoryNode(child))];
}

export function buildCategoryPathMap(categories: Category[]) {
  return buildCategoryTree(categories).reduce<Record<string, string>>((paths, root) => {
    flattenCategoryNode(root).forEach((node) => {
      paths[node.id] = node.path;
    });
    return paths;
  }, {});
}

export function getCategoryPath(categoryId: string, categories: Category[]) {
  return buildCategoryPathMap(categories)[categoryId] ?? categoryId;
}

export function getCategoryPaths(categoryIds: string[], categories: Category[]) {
  const pathMap = buildCategoryPathMap(categories);
  return categoryIds.map((categoryId) => pathMap[categoryId] ?? categoryId);
}

export function getDescendantCategoryIds(categoryId: string, categories: Category[]) {
  const tree = buildCategoryTree(categories);
  const nodes = tree.flatMap((root) => flattenCategoryNode(root));
  const target = nodes.find((node) => node.id === categoryId);
  return target ? flattenCategoryNode(target).map((node) => node.id) : [];
}

export function expandCategoryIds(categoryIds: string[], categories: Category[]) {
  return [
    ...new Set(
      categoryIds.flatMap((categoryId) => getDescendantCategoryIds(categoryId, categories)),
    ),
  ];
}
