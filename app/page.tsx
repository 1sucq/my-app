export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center bg-slate-50 px-6 py-12 text-slate-900">
      <section className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">ログイン</h1>
          <p className="mt-2 text-sm text-slate-600">
            メールアドレスとパスワードを入力してください。
          </p>
        </div>

        <form className="space-y-5">
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
              className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <button
            type="button"
            className="w-full rounded-md bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2"
          >
            ログイン
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          アカウントをお持ちでない方は{" "}
          <button
            type="button"
            className="font-semibold text-slate-900 underline underline-offset-4 hover:text-slate-700"
          >
            新規登録はこちら
          </button>
        </p>
      </section>
    </main>
  );
}
