"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type LoginTarget = "user" | "admin";

export default function Home() {
  const router = useRouter();
  const [loginTarget, setLoginTarget] = useState<LoginTarget>("user");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (!loginId.trim() || !password.trim()) {
      setErrorMessage("IDとパスワードを入力してください。");
      return;
    }

    setIsLoading(true);
    window.setTimeout(() => {
      router.push(loginTarget === "user" ? "/user/chat" : "/admin");
      setIsLoading(false);
    }, 300);
  };

  return (
    <main className="flex min-h-dvh flex-1 items-center justify-center bg-slate-50 px-6 py-12 text-slate-900">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold text-slate-500">YourNavi-QAI</p>
          <h1 className="mt-1 text-2xl font-bold">ログイン</h1>
          <p className="mt-2 text-sm text-slate-600">
            利用する画面を選び、IDとパスワードを入力してください。
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 rounded-lg bg-slate-100 p-1">
          {[
            { key: "user", label: "利用者" },
            { key: "admin", label: "管理者" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setLoginTarget(item.key as LoginTarget);
                setErrorMessage("");
              }}
              className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                loginTarget === item.key
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <form className="space-y-5" onSubmit={handleLogin}>
          <div>
            <label
              htmlFor="loginId"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              ID
            </label>
            <input
              id="loginId"
              name="loginId"
              type="text"
              autoComplete="username"
              placeholder={loginTarget === "user" ? "user01" : "admin01"}
              value={loginId}
              onChange={(event) => setLoginId(event.target.value)}
              required
              className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              パスワード
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="パスワードを入力"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {errorMessage ? (
            <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isLoading
              ? "ログイン中..."
              : `${loginTarget === "user" ? "チャット画面へ" : "管理者ホームへ"}ログイン`}
          </button>
        </form>

        <p className="mt-6 rounded-md bg-slate-50 px-4 py-3 text-sm text-slate-600">
          画面確認用のモックログインです。ID/PASSは任意の文字を入力すると遷移できます。
        </p>
      </section>
    </main>
  );
}
