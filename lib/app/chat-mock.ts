import { categories, documents, faqs, glossaries } from "./mock-data";
import { getCategoryPath } from "./category-utils";

export const initialThreads = [
  "就業規則について",
  "有給休暇について",
  "経費精算について",
  "社内手続きについて",
];

export type ReferenceInfo = {
  category: string;
  dataType: "ドキュメント" | "FAQ" | "用語集";
  title: string;
  version?: string;
  section: string;
  storagePath?: string;
};

export type AnswerCandidate = {
  title: string;
  body: string;
  usedCategories: string[];
  references: ReferenceInfo[];
};

export type ChatMessage =
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

const sideJobCategoryId = "cat-service-sidejob";
const hrRulesCategoryId = "cat-hr-rules";

function categoryPath(categoryId: string) {
  return getCategoryPath(categoryId, categories);
}

function hasCategoryFamily(searchCategoryIds: string[], rootCategoryId: string) {
  return searchCategoryIds.some((categoryId) => {
    const path = categoryPath(categoryId);
    const rootPath = categoryPath(rootCategoryId);
    return path === rootPath || path.startsWith(`${rootPath} /`);
  });
}

function pickPreferredCategoryId(question: string, searchCategoryIds: string[]) {
  const keywordMap = [
    { keyword: "副業", categoryId: sideJobCategoryId },
    { keyword: "兼業", categoryId: "cat-service-dualjob" },
    { keyword: "遅刻", categoryId: "cat-service-late" },
    { keyword: "早退", categoryId: "cat-service-late" },
    { keyword: "服務違反", categoryId: "cat-service-violation" },
    { keyword: "服務", categoryId: "cat-service-rules" },
  ];

  return keywordMap.find(
    (item) => question.includes(item.keyword) && searchCategoryIds.includes(item.categoryId),
  )?.categoryId;
}

export function mockSignedUrl(storagePath?: string) {
  if (!storagePath) return "#";
  return `https://mock-s3-signed-url.example.com/open?path=${encodeURIComponent(storagePath)}`;
}

export function createMockAnswers(
  question: string,
  searchCategoryIds: string[],
): AnswerCandidate[] {
  if (question.includes("副業")) {
    return createSideJobAnswers(searchCategoryIds);
  }

  const preferredCategoryId = pickPreferredCategoryId(question, searchCategoryIds);
  const primaryDocument =
    documents.find((document) => document.categoryId === preferredCategoryId) ??
    documents.find((document) => searchCategoryIds.includes(document.categoryId)) ??
    documents[0];
  const secondaryDocument =
    documents.find(
      (document) =>
        document.id !== primaryDocument.id && searchCategoryIds.includes(document.categoryId),
    ) ?? primaryDocument;
  const relatedFaq =
    faqs.find((faq) => faq.categoryId === preferredCategoryId) ??
    faqs.find((faq) => searchCategoryIds.includes(faq.categoryId)) ??
    faqs[0];
  const glossary = glossaries[0];
  const fallbackCategoryId = searchCategoryIds[0] ?? primaryDocument.categoryId;

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
      usedCategories: [categoryPath(fallbackCategoryId)],
      references: [
        {
          category: categoryPath(fallbackCategoryId),
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

function createSideJobAnswers(searchCategoryIds: string[]): AnswerCandidate[] {
  const includesHr = hasCategoryFamily(searchCategoryIds, "cat-hr");
  const includesService = hasCategoryFamily(searchCategoryIds, "cat-service");
  const hrDocument = documents.find((document) => document.categoryId === hrRulesCategoryId) ?? documents[0];
  const serviceDocument =
    documents.find((document) => document.categoryId === sideJobCategoryId) ?? documents[0];
  const serviceFaq = faqs.find((faq) => faq.categoryId === sideJobCategoryId);

  if (includesHr && includesService) {
    return [
      {
        title: "回答案1：人事規程と服務ルールを合わせた回答",
        body:
          "副業は可能な場合がありますが、事前申請と会社承認が必要です。人事規程で雇用上の手続きを確認し、服務カテゴリの副業ルールで競業・勤務影響・情報管理の条件を確認してください。",
        usedCategories: [categoryPath(sideJobCategoryId), categoryPath(hrRulesCategoryId)],
        references: [
          {
            category: categoryPath(sideJobCategoryId),
            dataType: "ドキュメント",
            title: serviceDocument.displayName,
            version: serviceDocument.version,
            section: "該当箇所: 副業の申請条件・禁止条件",
            storagePath: serviceDocument.storagePath,
          },
          {
            category: categoryPath(hrRulesCategoryId),
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
        usedCategories: [categoryPath(sideJobCategoryId)],
        references: [
          {
            category: categoryPath(sideJobCategoryId),
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
        usedCategories: [categoryPath(hrRulesCategoryId)],
        references: [
          {
            category: categoryPath(hrRulesCategoryId),
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
        usedCategories: [categoryPath(sideJobCategoryId)],
        references: [
          {
            category: categoryPath(sideJobCategoryId),
            dataType: "ドキュメント",
            title: serviceDocument.displayName,
            version: serviceDocument.version,
            section: "該当箇所: 副業・兼業の許可条件",
            storagePath: serviceDocument.storagePath,
          },
          ...(serviceFaq
            ? [
                {
                  category: categoryPath(sideJobCategoryId),
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
