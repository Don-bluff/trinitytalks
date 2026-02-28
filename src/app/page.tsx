import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-5xl flex-col justify-center px-6 py-14 md:px-8">
      <div className="mb-10">
        <h1 className="text-4xl font-semibold tracking-tight text-[#e5e5e5] md:text-5xl">TrinityTalks</h1>
        <p className="mt-3 text-base text-[#9ca3af] md:text-lg">三元空间 · 知识与搞钱</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link
          href="/column"
          className="rounded-2xl border border-[#222222] bg-[#111111] p-6 transition-all hover:-translate-y-[1px] hover:border-[#06b6d4]/60"
        >
          <p className="text-sm uppercase tracking-wide text-[#06b6d4]">三元专栏</p>
          <h2 className="mt-3 text-2xl font-medium text-[#e5e5e5]">知识探索</h2>
          <p className="mt-2 text-sm text-[#9ca3af]">思想、学习与认知升级</p>
        </Link>

        <Link
          href="/money"
          className="rounded-2xl border border-[#222222] bg-[#111111] p-6 transition-all hover:-translate-y-[1px] hover:border-[#06b6d4]/60"
        >
          <p className="text-sm uppercase tracking-wide text-[#06b6d4]">搞钱之路</p>
          <h2 className="mt-3 text-2xl font-medium text-[#e5e5e5]">商业智慧</h2>
          <p className="mt-2 text-sm text-[#9ca3af]">策略、执行与增长路径</p>
        </Link>
      </div>
    </main>
  );
}
