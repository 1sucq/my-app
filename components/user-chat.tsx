"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { CategoryTree } from "@/components/category-tree";
import { categories, groups } from "@/lib/app/mock-data";

const initialThreads = [
  "就業規則について",
  "有給休暇について",
  "経費精算について",
  "社内手続きについて",
];

export function UserChat() {
  const router = useRouter();
  const [threads, setThreads] = useState(initialThreads);
  const [activeThread, setActiveThread] = useState(initialThreads[1]);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "こんにちは。閲覧可能カテゴリに含まれる教師データをもとに回答します。",
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  const visibleCategories = useMemo(
    () => groups.find((group) => group.displayName === "人事部")?.categories ?? [],
    [],
  );

  const createThread = () => {
    const threadName = `新規チャット ${threads.length + 1}`;
    setThreads((currentThreads) => [threadName, ...currentThreads]);
    setActiveThread(threadName);
    setMessages([
    ]);
    setInput("");
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
          text: "これはAPIモック回答です。実装時は所属グループの閲覧可能カテゴリだけを検索対象にします。",
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
                className={`max-w-2xl rounded-lg px-4 py-3 text-sm ${
                  message.role === "user"
                    ? "ml-auto bg-slate-950 text-white"
                    : "bg-slate-100 text-slate-800"
                }`}
              >
                {message.text}
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
            所属グループの閲覧可能カテゴリのみを検索対象にします。
          </p>
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <CategoryTree
              categories={categories}
              selectedValues={visibleCategories}
              selectable="none"
            />
          </div>
        </aside>
      </section>
    </main>
  );
}
