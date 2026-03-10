"use client";

import { useState } from "react";

const plans = [
  {
    name: "月付",
    price: "$5",
    period: "/月",
    description: "按月订阅三元专栏",
    priceEnv: "monthly",
    features: ["无限阅读所有专栏文章", "搞钱之路完整内容"],
  },
  {
    name: "年付",
    price: "$50",
    period: "/年",
    description: "年度订阅 · 省 $10",
    priceEnv: "annual",
    badge: "省17%",
    features: ["月付全部权益", "年度会员专属内容"],
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSubscribe(plan: string) {
    setLoading(plan);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "创建订阅失败，请重试");
      }
    } catch {
      alert("网络错误，请重试");
    } finally {
      setLoading(null);
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-56px)] w-full max-w-4xl flex-col items-center px-5 py-20 md:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
        选择你的<span className="text-[#06b6d4]">计划</span>
      </h1>
      <p className="mt-3 text-sm text-[#666] md:text-base">
        解锁全部内容 · 随时取消
      </p>

      <div className="mt-14 grid w-full max-w-2xl grid-cols-1 gap-6 md:grid-cols-2">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className="relative overflow-hidden rounded-2xl border border-[#1a1a1a] bg-[#111] p-8 transition-all duration-300 hover:border-[#06b6d4]/40 hover:shadow-lg hover:shadow-[#06b6d4]/5"
          >
            {plan.badge && (
              <span className="absolute right-4 top-4 rounded-full bg-[#06b6d4]/15 px-3 py-1 text-xs font-medium text-[#06b6d4]">
                {plan.badge}
              </span>
            )}
            <h2 className="text-lg font-semibold text-white">{plan.name}</h2>
            <p className="mt-1 text-xs text-[#555]">{plan.description}</p>
            <div className="mt-5 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white">{plan.price}</span>
              <span className="text-sm text-[#555]">{plan.period}</span>
            </div>
            <ul className="mt-6 space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-[#999]">
                  <span className="mt-0.5 text-[#06b6d4]">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe(plan.priceEnv)}
              disabled={loading !== null}
              className="mt-8 w-full rounded-xl bg-[#06b6d4] py-3 text-sm font-medium text-black transition-all hover:bg-[#06b6d4]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === plan.priceEnv ? "跳转中..." : "立即订阅"}
            </button>
          </div>
        ))}
      </div>

      <p className="mt-12 text-xs text-[#333]">
        支付由 Stripe 安全处理 · 随时可在账户设置中取消订阅
      </p>
    </main>
  );
}
