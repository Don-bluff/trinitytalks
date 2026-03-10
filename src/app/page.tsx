import Link from "next/link";
import Image from "next/image";

const categories = [
  {
    tag: "思维提升",
    title: "认知升级",
    desc: "思想、学习与认知框架",
    href: "/column",
    icon: "💡",
  },
  {
    tag: "财富增长",
    title: "搞钱之路",
    desc: "策略、执行与增长路径",
    href: "/money",
    icon: "💰",
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-56px)] w-full max-w-6xl flex-col items-center justify-center px-5 md:px-8">
      {/* Hero */}
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-6">
          <div className="absolute -inset-4 rounded-full bg-[#06b6d4]/10 blur-2xl" />
          <Image src="/logo.jpg" alt="TrinityTalks" width={80} height={80} className="relative rounded-2xl shadow-lg shadow-[#06b6d4]/20" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
          Trinity<span className="text-[#06b6d4]">Talks</span>
        </h1>
        <p className="mt-3 text-base text-[#666] md:text-lg">三元空间 · 知识与搞钱</p>
      </div>

      {/* 三元专栏 */}
      <section className="mt-14 w-full max-w-2xl">
        <h2 className="mb-6 text-center text-sm font-medium uppercase tracking-widest text-[#555]">
          三元专栏
        </h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {categories.map((cat) => (
            <Link
              key={cat.tag}
              href={cat.href}
              className="group relative overflow-hidden rounded-2xl border border-[#1a1a1a] bg-[#111] p-7 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#06b6d4]/40 hover:shadow-lg hover:shadow-[#06b6d4]/5"
            >
              <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl from-[#06b6d4]/8 to-transparent" />
              <div className="relative">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{cat.icon}</span>
                  <span className="inline-block rounded-full bg-[#06b6d4]/10 px-3 py-1 text-xs font-medium text-[#06b6d4]">
                    {cat.tag}
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-white">{cat.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#666]">{cat.desc}</p>
                <div className="mt-5 flex items-center gap-1 text-xs text-[#555] transition-colors group-hover:text-[#06b6d4]">
                  <span>浏览全部</span>
                  <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <p className="mt-20 pb-10 text-xs text-[#333]">© 2026 TrinityTalks</p>
    </main>
  );
}
