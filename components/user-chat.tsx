"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { CategoryTree } from "@/components/category-tree";
import { categories, documents, faqs, glossaries, groups } from "@/lib/app/mock-data";
import { Category } from "@/lib/app/types";

const initialThreads = [
  "就業規則について",
  "有給休暇について",
  "経費精算について",
  "社内手続きについて",
];

type ReferenceInfo = {
  category: string;
  dataType: "ドキュメント" | "FAQ" | "用語集";
  title: string;
  version?: string;
  section: string;
  storagePath?: string;
};

type AnswerCandidate = {
  title: string;
  body: string;
  usedCategories: string[];
  references: ReferenceInfo[];
};

type ChatMessage =
  | {
      role: "user";
      text: string;
    }
  | {
      role: "bot";
      text?: string;
      searchCategories?: string[];
      answers?: AnswerCandidate[];
    };

function buildCategoryPaths(items: Category[]) {
  const categoryMap = new Map(items.map((category) => [category.id, category]));

  const pathOf = (category: Category): string => {
    if (!category.parentId) return category.name;
    const parent = categoryMap.get(category.parentId);
    return parent ? `${pathOf(parent)} / ${category.name}` : category.name;
  };

  return items.reduce<Record<string, string>>((paths, category) => {
    paths[category.id] = pathOf(category);
    return paths;
  }, {});
}

function getDescendantCategoryPaths(parentPath: string, allPaths: string[]) {
  return allPaths.filter(
    (path) => path === parentPath || path.startsWith(`${parentPath} / `),
  );
}

function pickPreferredCategory(question: string, searchCategories: string[]) {
  const keywordMap = [
    { keyword: "副業", category: "服務 / 副業" },
    { keyword: "兼業", category: "服務 / 兼業" },
    { keyword: "遅刻", category: "服務 / 遅刻・早退" },
    { keyword: "早退", category: "服務 / 遅刻・早退" },
    { keyword: "服務違反", category: "服務 / 服務違反" },
    { keyword: "服務", category: "服務 / 服務規律" },
  ];
  const matched = keywordMap.find(
    (item) => question.includes(item.keyword) && searchCategories.includes(item.category),
  );
  return matched?.category;
}

function createMockAnswers(question: string, searchCategories: string[]): AnswerCandidate[] {
  if (question.includes("副業")) {
    return createSideJobAnswers(searchCategories);
  }

  const preferredCategory = pickPreferredCategory(question, searchCategories);
  const primaryDocument =
    documents.find((document) => document.category === preferredCategory) ??
    documents.find((document) => searchCategories.includes(document.category)) ??
    documents[0];
  const secondaryDocument =
    documents.find(
      (document) =>
        document.id !== primaryDocument.id && searchCategories.includes(document.category),
    ) ?? primaryDocument;
  const relatedFaq =
    faqs.find((faq) => faq.category === preferredCategory) ??
    faqs.find((faq) => searchCategories.includes(faq.category)) ??
    faqs[0];
  const glossary = glossaries[0];
  const fallbackCategory = searchCategories[0] ?? primaryDocument.category;

  const answers: AnswerCandidate[] = [
    {
      title: "回答案1：最も該当可能性が高い回答",
      body:
        "該当する社内規程では、申請・確認は所定の社内手続きに沿って行う想定です。まず対象カテゴリの最新公開文書を確認し、必要に応じて上長または担当部署へ確認してください。",
      usedCategories: [primaryDocument.category],
      references: [
        {
          category: primaryDocument.category,
          dataType: "ドキュメント",
          title: primaryDocument.displayName,
          version: primaryDocument.version,
          section: "該当箇所: 手続き・申請ルール",
          storagePath: primaryDocument.storagePath,
        },
      ],
    },
    {
      title: "回答案2：別条件・別カテゴリに該当する可能性がある回答",
      body:
        "条件によってはFAQに記載された運用ルールが優先される場合があります。よくある質問に該当する内容がある場合は、FAQ本文の補足条件も確認してください。",
      usedCategories: [relatedFaq.category],
      references: [
        {
          category: relatedFaq.category,
          dataType: "FAQ",
          title: relatedFaq.displayName,
          section: "該当箇所: FAQ本文",
        },
        {
          category: secondaryDocument.category,
          dataType: "ドキュメント",
          title: secondaryDocument.displayName,
          version: secondaryDocument.version,
          section: "該当箇所: 関連する運用ルール",
          storagePath: secondaryDocument.storagePath,
        },
      ],
    },
  ];

  if (glossary) {
    answers.push({
      title: "回答案3：補足・例外条件を踏まえた回答",
      body:
        "関連用語の定義や例外条件によって回答の解釈が変わる場合があります。文書やFAQだけで判断しづらい場合は、用語定義も合わせて確認してください。",
      usedCategories: [fallbackCategory],
      references: [
        {
          category: fallbackCategory,
          dataType: "用語集",
          title: glossary.term,
          section: "該当箇所: 用語の意味",
        },
        {
          category: primaryDocument.category,
          dataType: "ドキュメント",
          title: primaryDocument.displayName,
          version: primaryDocument.version,
          section: "該当箇所: 補足条件・例外条件",
          storagePath: primaryDocument.storagePath,
        },
      ],
    });
  }

  return answers.slice(0, 3);
}

function mockSignedUrl(storagePath?: string) {
  if (!storagePath) return "#";
  return `https://mock-s3-signed-url.example.com/open?path=${encodeURIComponent(storagePath)}`;
}

function createSideJobAnswers(searchCategories: string[]): AnswerCandidate[] {
  const includesHr = searchCategories.some(
    (category) => category === "人事" || category.startsWith("人事 /"),
  );
  const includesService = searchCategories.some(
    (category) => category === "服務" || category.startsWith("服務 /"),
  );
  const hrDocument = documents.find((document) => document.category === "人事 / 規程") ?? documents[0];
  const serviceDocument =
    documents.find((document) => document.category === "服務 / 副業") ?? documents[0];
  const serviceFaq = faqs.find((faq) => faq.category === "服務 / 副業");

  if (includesHr && includesService) {
    return [
      {
        title: "回答案1：人事規程と服務ルールを合わせた回答",
        body:
          "副業は可能な場合がありますが、事前申請と会社承認が必要です。人事規程で雇用上の手続きを確認し、服務カテゴリの副業ルールで競業・勤務影響・情報管理の条件を確認してください。",
        usedCategories: ["服務 / 副業", "人事 / 規程"],
        references: [
          {
            category: "服務 / 副業",
            dataType: "ドキュメント",
            title: serviceDocument.displayName,
            version: serviceDocument.version,
            section: "該当箇所: 副業の申請条件・禁止条件",
            storagePath: serviceDocument.storagePath,
          },
          {
            category: "人事 / 規程",
            dataType: "ドキュメント",
            title: hrDocument.displayName,
            version: hrDocument.version,
            section: "該当箇所: 雇用上の申請手続き",
            storagePath: hrDocument.storagePath,
          },
        ],
      },
      {
        title: "回答案2：服務カテゴリを優先した回答",
        body:
          "副業の可否判断では、勤務時間への影響、競業避止、会社情報の取り扱いが重要です。服務ルールに抵触する場合は、承認されない可能性があります。",
        usedCategories: ["服務 / 副業"],
        references: [
          {
            category: "服務 / 副業",
            dataType: serviceFaq ? "FAQ" : "ドキュメント",
            title: serviceFaq?.displayName ?? serviceDocument.displayName,
            version: serviceFaq ? undefined : serviceDocument.version,
            section: serviceFaq ? "該当箇所: FAQ本文" : "該当箇所: 副業の制限事項",
            storagePath: serviceFaq ? undefined : serviceDocument.storagePath,
          },
        ],
      },
    ];
  }

  if (includesHr) {
    return [
      {
        title: "回答案1：人事カテゴリのみを参照した回答",
        body:
          "人事カテゴリのみを検索対象にしているため、副業の詳細な服務条件までは参照していません。雇用上の申請や承認フローを確認し、必要に応じて服務カテゴリも検索対象に追加してください。",
        usedCategories: ["人事 / 規程"],
        references: [
          {
            category: "人事 / 規程",
            dataType: "ドキュメント",
            title: hrDocument.displayName,
            version: hrDocument.version,
            section: "該当箇所: 社内申請・承認手続き",
            storagePath: hrDocument.storagePath,
          },
        ],
      },
    ];
  }

  if (includesService) {
    return [
      {
        title: "回答案1：服務カテゴリのみを参照した回答",
        body:
          "副業は事前申請と会社承認が必要です。服務上は、競業にあたる業務、勤務に支障が出る働き方、会社情報を利用する活動は認められない可能性があります。",
        usedCategories: ["服務 / 副業"],
        references: [
          {
            category: "服務 / 副業",
            dataType: "ドキュメント",
            title: serviceDocument.displayName,
            version: serviceDocument.version,
            section: "該当箇所: 副業・兼業の許可条件",
            storagePath: serviceDocument.storagePath,
          },
          ...(serviceFaq
            ? [
                {
                  category: "服務 / 副業",
                  dataType: "FAQ" as const,
                  title: serviceFaq.displayName,
                  section: "該当箇所: FAQ本文",
                },
              ]
            : []),
        ],
      },
    ];
  }

  return [];
}

export function UserChat() {
  const router = useRouter();
  const [threads, setThreads] = useState(initialThreads);
  const [activeThread, setActiveThread] = useState(initialThreads[1]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "bot",
      text: "こんにちは。閲覧可能カテゴリに含まれる教師データをもとに回答します。",
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["人事", "服務"]);

  const groupCategories = useMemo(
    () => groups.find((group) => group.displayName === "人事部")?.categories ?? [],
    [],
  );
  const categoryPaths = useMemo(() => buildCategoryPaths(categories), []);
  const allCategoryPaths = useMemo(() => Object.values(categoryPaths), [categoryPaths]);
  const visibleCategories = useMemo(
    () =>
      [...new Set(
        groupCategories.flatMap((category) =>
          getDescendantCategoryPaths(category, allCategoryPaths),
        ),
      )],
    [allCategoryPaths, groupCategories],
  );
  const visibleCategorySet = useMemo(() => new Set(visibleCategories), [visibleCategories]);
  const visibleRootCategoryTree = useMemo(
    () =>
      categories.filter(
        (category) =>
          category.level === 1 &&
          groupCategories.includes(categoryPaths[category.id]),
      ),
    [categoryPaths, groupCategories],
  );
  const effectiveSearchCategories = useMemo(
    () =>
      [...new Set(
        selectedCategories.flatMap((category) =>
          getDescendantCategoryPaths(category, visibleCategories),
        ),
      )],
    [selectedCategories, visibleCategories],
  );
  const searchCategories = effectiveSearchCategories.length > 0
    ? effectiveSearchCategories
    : visibleCategories;

  const createThread = () => {
    const threadName = `新規チャット ${threads.length + 1}`;
    setThreads((currentThreads) => [threadName, ...currentThreads]);
    setActiveThread(threadName);
    setMessages([]);
    setInput("");
    setSelectedCategories(groupCategories);
  };

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!input.trim() || isSending) {
      return;
    }

    const userInput = input;
    setInput("");
    setIsSending(true);
    setMessages((currentMessages) => [
      ...currentMessages,
      { role: "user", text: userInput },
    ]);
    window.setTimeout(() => {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "bot",
          searchCategories: selectedCategories.length > 0 ? selectedCategories : groupCategories,
          answers: createMockAnswers(userInput, searchCategories),
        },
      ]);
      setIsSending(false);
    }, 700);
  };

  return (
    <main className="flex min-h-dvh flex-col bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white px-4 py-4 lg:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">1.2 利用者</p>
            <h1 className="text-2xl font-bold text-slate-950">チャット</h1>
          </div>
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="w-fit rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100"
          >
            管理者画面へ
          </button>
        </div>
      </header>

      <section className="grid min-h-0 flex-1 gap-4 p-4 lg:grid-cols-[240px_1fr_320px] lg:p-8">
        <aside className="flex min-h-0 flex-col rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 bg-sky-500 px-4 py-3 text-base font-bold text-white">
            YourNavi-QAI
          </div>
          <div className="flex-1 overflow-auto p-4">
            <button
              type="button"
              onClick={createThread}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              新規チャット
            </button>
            <input
              placeholder="検索"
              className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
            <h2 className="mt-6 text-sm font-bold text-slate-950">履歴</h2>
            <div className="mt-3 space-y-1">
              {threads.map((thread) => (
                <button
                  key={thread}
                  type="button"
                  onClick={() => setActiveThread(thread)}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm ${
                    activeThread === thread
                      ? "bg-sky-100 text-sky-950"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span className="truncate">{thread}</span>
                  <span className="ml-2 text-slate-400">...</span>
                </button>
              ))}
            </div>
          </div>
          <div className="border-t border-slate-200 p-4 text-sm text-slate-500">
            ユーザ
          </div>
        </aside>

        <div className="flex min-h-0 flex-col rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-xl font-bold text-slate-950">AIチャット</h2>
            <p className="mt-1 text-sm text-slate-600">
              {activeThread}
            </p>
          </div>
          <div className="min-h-[420px] flex-1 space-y-4 overflow-auto p-6">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-3xl rounded-lg px-4 py-3 text-sm ${
                  message.role === "user"
                    ? "ml-auto bg-slate-950 text-white"
                    : "bg-slate-100 text-slate-800"
                }`}
              >
                {message.role === "bot" && message.answers ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500">
                        この回答は以下のカテゴリを検索して生成されました
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        検索対象カテゴリ：{message.searchCategories?.join("、") || "指定なし"}
                      </p>
                    </div>
                    {message.answers.map((answer) => (
                      <article
                        key={answer.title}
                        className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <h3 className="text-sm font-bold text-slate-950">{answer.title}</h3>
                        <p className="mt-3 leading-6 text-slate-700">{answer.body}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {answer.usedCategories.map((category) => (
                            <span
                              key={category}
                              className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800 ring-1 ring-sky-100"
                            >
                              使用カテゴリ: {category}
                            </span>
                          ))}
                        </div>
                        <div className="mt-4 space-y-3 rounded-md bg-slate-50 p-3">
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            参照情報
                          </p>
                          {answer.references.map((reference) => (
                            <div
                              key={`${reference.dataType}-${reference.title}`}
                              className="grid gap-1 text-xs text-slate-600"
                            >
                              <span>教師データ種別：{reference.dataType}</span>
                              <span>使用カテゴリ：{reference.category}</span>
                              <span>参照名：{reference.title}</span>
                              {reference.version ? <span>バージョン：{reference.version}</span> : null}
                              <span>{reference.section}</span>
                              {reference.storagePath ? (
                                <a
                                  href={mockSignedUrl(reference.storagePath)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="w-fit font-semibold text-sky-700 underline underline-offset-4"
                                >
                                  ドキュメントを開く
                                </a>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  message.text
                )}
              </div>
            ))}
            {isSending ? (
              <div className="max-w-2xl rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-500">
                回答中...
              </div>
            ) : null}
          </div>
          <form onSubmit={sendMessage} className="flex gap-3 border-t border-slate-200 p-4">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              placeholder="質問を入力"
              rows={1}
              className="min-w-0 flex-1 resize-none rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
            <button
              type="submit"
              disabled={isSending}
              className="rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSending ? "送信中..." : "送信"}
            </button>
          </form>
        </div>

        <aside className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-bold text-slate-950">検索対象カテゴリ</h2>
          <p className="mt-2 text-sm text-slate-600">
            未選択の場合は、所属グループの閲覧可能カテゴリをすべて検索します。選択すると、そのカテゴリ配下のみで絞り込みます。
          </p>
          <div className="mt-4 rounded-md bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-900">
            現在の検索対象：{selectedCategories.length > 0 ? selectedCategories.join("、") : "指定なし"}
          </div>
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <CategoryTree
              categories={visibleRootCategoryTree}
              selectedValues={selectedCategories}
              selectable="multiple"
              onChange={(values) =>
                setSelectedCategories(values.filter((value) => visibleCategorySet.has(value)))
              }
            />
          </div>
          <button
            type="button"
            onClick={() => setSelectedCategories(groupCategories)}
            className="mt-3 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            全カテゴリを選択
          </button>
        </aside>
      </section>
    </main>
  );
}
