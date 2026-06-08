"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { createSupabaseClient } from "@/lib/supabase/client";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const supabase = createSupabaseClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(`ログインに失敗しました: ${error.message}`);
        return;
      }

      router.push("/dashboard");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? `ログインに失敗しました: ${error.message}`
          : "ログインに失敗しました。",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    setErrorMessage("");
    setIsLoading(true);

    try {
      const supabase = createSupabaseClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setErrorMessage(`新規登録に失敗しました: ${error.message}`);
        return;
      }

      router.push("/dashboard");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? `新規登録に失敗しました: ${error.message}`
          : "新規登録に失敗しました。",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-1 items-center justify-center bg-slate-50 px-6 py-12 text-slate-900">
      <section className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">ログイン</h1>
          <p className="mt-2 text-sm text-slate-600">
            メールアドレスとパスワードを入力してください。
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleLogin}>
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              メールアドレス
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
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
            {isLoading ? "処理中..." : "ログイン"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          アカウントをお持ちでない方は{" "}
          <button
            type="button"
            onClick={handleSignUp}
            disabled={isLoading}
            className="font-semibold text-slate-900 underline underline-offset-4 hover:text-slate-700"
          >
            新規登録はこちら
          </button>
        </p>
      </section>
    </main>
  );
}
