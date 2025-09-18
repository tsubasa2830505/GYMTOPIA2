export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgba(254,255,250,0.96)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-[var(--gt-secondary-strong)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[color:var(--foreground)]">
            メールをご確認ください
          </h2>
          
          <p className="mt-2 text-center text-sm text-[color:var(--text-subtle)]">
            登録いただいたメールアドレスに確認メールを送信しました。
          </p>
          
          <p className="mt-4 text-center text-sm text-[color:var(--text-subtle)]">
            メール内のリンクをクリックして、アカウントの登録を完了してください。
          </p>
          
          <div className="mt-6">
            <a
              href="/auth/login"
              className="font-medium text-[color:var(--gt-secondary-strong)] hover:text-[color:var(--gt-secondary)]"
            >
              ログイン画面に戻る
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}