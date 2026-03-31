"use client";

import { useState } from "react";
import data115 from "@/data/dongming115.json";
import data114 from "@/data/dongming114.json";
import firstLevelDiff from "@/data/dongming_first_level_diff_114_115.json";

const DATASETS = {
  "115": data115,
  "114": data114
} as const;

type YearKey = keyof typeof DATASETS;

const LEVEL_ORDER = ["第一階", "第二階", "第三階", "不補貼_定價租金"] as const;

const LEVEL_LABEL: Record<(typeof LEVEL_ORDER)[number], string> = {
  第一階: "第一階",
  第二階: "第二階",
  第三階: "第三階",
  不補貼_定價租金: "不補貼（定價）"
};

const formatNumber = (n: number | null | undefined) =>
  n == null ? "—" : n.toLocaleString("zh-TW");

const formatPercent = (diff: number, base: number) => {
  if (!base || diff === 0) return "—";
  const pct = (diff / base) * 100;
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
};

export default function Home() {
  const [year, setYear] = useState<YearKey>("115");
  const [avgMonthlyIncome, setAvgMonthlyIncome] = useState<string>("");
  const current = DATASETS[year];

  const appendix1Units = current.appendix_1_rent_table.units;
  const appendix3Units = current.appendix_3_renewal_table.units;
  const incomeClassification = current.income_classification;
  const firstLevelUnits = firstLevelDiff.units;

  const parsedIncome = Number(
    avgMonthlyIncome.replace(/[^0-9]/g, "")
  );

  const getIncomeLevel = () => {
    if (!parsedIncome || !incomeClassification) return null;

    for (const level of incomeClassification.levels as any[]) {
      const range = level.monthly_income_per_person;
      const minOk =
        range.min == null || parsedIncome >= Number(range.min);
      const maxOk =
        range.max == null || parsedIncome <= Number(range.max);
      if (minOk && maxOk) {
        return {
          type: level.level as string,
          title: level.level as string,
          description: level.standard as string,
          text: range.text as string
        };
      }
    }

    const ns = incomeClassification.no_subsidy
      .monthly_income_per_person;
    const nsMinOk =
      ns.min == null || parsedIncome >= Number(ns.min);
    const nsMaxOk =
      ns.max == null || parsedIncome <= Number(ns.max);

    if (nsMinOk && nsMaxOk) {
      return {
        type: "no_subsidy",
        title: incomeClassification.no_subsidy.label as string,
        description: incomeClassification.no_subsidy.condition as string,
        text: ns.text as string
      };
    }

    if (parsedIncome > Number(ns.max ?? 0)) {
      return {
        type: "above",
        title: "高於不補貼級距",
        description: "超過目前表列之家庭所得範圍",
        text: ""
      };
    }

    return null;
  };

  const incomeLevel = getIncomeLevel();

  return (
    <main className="min-h-screen bg-stone-50 text-stone-800">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <header className="mb-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
          <p className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            東明社會住宅・{year} 年
          </p>
          <h1 className="mt-3 text-2xl font-bold md:text-3xl">
            租金分級與續租 1.1 倍租金差異
          </h1>
          <p className="mt-3 text-sm leading-7 text-stone-600 md:text-base">
            使用「115 年社宅所得分級標準表」附表一、附表三資料，直接比較各所得級距相較「不補貼（定價租金）」的租金差額及折扣百分比，
            以及續租條件下 1.1 倍租金的增加幅度。
          </p>
          <div className="mt-4 flex gap-2 text-xs">
            {(["115", "114"] as YearKey[]).map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setYear(y)}
                className={
                  "rounded-full border px-3 py-1 transition " +
                  (year === y
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-stone-300 bg-white text-stone-700 hover:border-emerald-500 hover:text-emerald-700")
                }
              >
                {y} 年度
              </button>
            ))}
          </div>
        </header>

        <section className="mb-6 grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
            <h2 className="text-sm font-semibold">
              輸入平均每人每月收入，判斷所得級距
            </h2>
            <p className="mt-1 text-[11px] text-stone-500">
              依目前選擇的年度（{year} 年）之「家庭總收入平均每人每月」標準計算。
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="text-xs text-stone-600">
                家庭總收入平均每人每月
              </label>
              <div className="flex flex-1 items-center gap-2">
                <span className="text-xs text-stone-500">NT$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="例如 25000"
                  value={avgMonthlyIncome}
                  onChange={(e) => setAvgMonthlyIncome(e.target.value)}
                  className="flex-1 rounded-xl border border-stone-300 bg-stone-50 px-3 py-1.5 text-xs outline-none ring-emerald-500 focus:bg-white focus:ring-2"
                />
              </div>
            </div>
            <div className="mt-3 rounded-2xl bg-stone-50 px-3 py-3 text-xs">
              {incomeLevel ? (
                <div>
                  <p className="text-stone-500">判斷結果：</p>
                  <p className="mt-1 text-sm font-semibold">
                    {incomeLevel.title}
                  </p>
                  {incomeLevel.description && (
                    <p className="mt-1 text-[11px] text-stone-500">
                      {incomeLevel.description}
                    </p>
                  )}
                  {incomeLevel.text && (
                    <p className="mt-1 text-[11px] text-stone-500">
                      （對應標準：{incomeLevel.text}）
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-stone-500">
                  請輸入金額後，即可顯示對應的所得級距。
                </p>
              )}
            </div>
          </div>

          <div className="rounded-3xl bg-emerald-700 p-5 text-xs text-emerald-50 shadow-sm ring-1 ring-emerald-800/40">
            <h2 className="text-sm font-semibold text-white">
              當年度所得門檻摘要（{year} 年）
            </h2>
            <ul className="mt-2 space-y-1.5">
              {incomeClassification.levels.map((level: any) => (
                <li key={level.level}>
                  <span className="font-semibold text-emerald-50">
                    {level.level}：
                  </span>
                  <span className="text-emerald-100">
                    {level.monthly_income_per_person.text}
                  </span>
                </li>
              ))}
              <li>
                <span className="font-semibold text-emerald-50">
                  {incomeClassification.no_subsidy.label}：
                </span>
                <span className="text-emerald-100">
                  {
                    incomeClassification.no_subsidy
                      .monthly_income_per_person.text
                  }
                </span>
              </li>
            </ul>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
            <div className="mb-4 flex items-end justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold">
                  各級距相較定價租金的差異
                </h2>
                <p className="mt-1 text-xs text-stone-500">
                  以「不補貼（定價租金）」為基準，顯示第一階、第二階、第三階的差額與差異百分比（負值代表折扣）。
                </p>
              </div>
              <span className="text-xs text-stone-400">單位：新臺幣元</span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-stone-50">
              <table className="min-w-full border-separate border-spacing-0 text-xs">
                <thead>
                  <tr>
                    <th className="border-b border-stone-200 bg-stone-100 px-3 py-2 text-left font-semibold text-stone-700">
                      房型 / 坪數
                    </th>
                    <th className="border-b border-stone-200 bg-stone-100 px-3 py-2 text-left font-semibold text-stone-700">
                      所得級距
                    </th>
                    <th className="border-b border-stone-200 bg-stone-100 px-3 py-2 text-right font-semibold text-stone-700">
                      租金
                    </th>
                    <th className="border-b border-stone-200 bg-stone-100 px-3 py-2 text-right font-semibold text-stone-700">
                      與定價差額
                    </th>
                    <th className="border-b border-stone-200 bg-stone-100 px-3 py-2 text-right font-semibold text-stone-700">
                      差異百分比
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {appendix1Units.map((unit) => {
                    const base = unit.rent["不補貼_定價租金"];
                    return LEVEL_ORDER.map((levelKey, index) => {
                      const rent = unit.rent[levelKey];
                      const isBase = levelKey === "不補貼_定價租金";
                      const diff = isBase ? 0 : rent - base;
                      const diffClass =
                        diff === 0
                          ? "text-stone-400"
                          : diff < 0
                          ? "text-emerald-700 font-semibold"
                          : "text-red-600 font-semibold";
                      const pctText = formatPercent(diff, base);

                      return (
                        <tr
                          key={`${unit.type}-${unit.rent_area_ping}-${levelKey}`}
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-stone-50/60"
                          }
                        >
                          {index === 0 && (
                            <td
                              rowSpan={LEVEL_ORDER.length}
                              className="border-b border-stone-200 px-3 py-3 align-top"
                            >
                              <div className="font-semibold">{unit.type}</div>
                              <div className="mt-0.5 text-[11px] text-stone-500">
                                {unit.rent_area_ping} 坪
                              </div>
                            </td>
                          )}
                          <td className="border-b border-stone-200 px-3 py-2">
                            <span
                              className={
                                "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold " +
                                (isBase
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-stone-100 text-stone-700")
                              }
                            >
                              {LEVEL_LABEL[levelKey]}
                            </span>
                          </td>
                          <td className="border-b border-stone-200 px-3 py-2 text-right tabular-nums">
                            <span className={isBase ? "font-semibold" : ""}>
                              {formatNumber(rent)}
                            </span>
                          </td>
                          <td
                            className={`border-b border-stone-200 px-3 py-2 text-right tabular-nums ${diffClass}`}
                          >
                            {diff === 0 ? "—" : formatNumber(diff)}
                          </td>
                          <td
                            className={`border-b border-stone-200 px-3 py-2 text-right tabular-nums ${diffClass}`}
                          >
                            {pctText}
                          </td>
                        </tr>
                      );
                    });
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 grid gap-2 text-[11px] text-stone-500 md:grid-cols-2">
              <p>• 差額 = 本級距租金 − 不補貼（定價租金）。</p>
              <p>• 差異百分比 = 差額 ÷ 不補貼（定價租金）。</p>
              <p>• 負值代表相較定價租金「較便宜」的幅度。</p>
              <p>• 資料來源：附表一「社宅租金分級表」（東明社宅）。</p>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
            <div className="mb-4 flex items-end justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold">
                  續租 1.1 倍租金與定價差異
                </h2>
                <p className="mt-1 text-xs text-stone-500">
                  以「不補貼（定價租金）」為基準，顯示續租條件下 1.1 倍租金的增加金額與增幅百分比。
                </p>
              </div>
              <span className="text-xs text-stone-400">單位：新臺幣元</span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-stone-50">
              <table className="min-w-full border-separate border-spacing-0 text-xs">
                <thead>
                  <tr>
                    <th className="border-b border-stone-200 bg-stone-100 px-3 py-2 text-left font-semibold text-stone-700">
                      房型 / 坪數
                    </th>
                    <th className="border-b border-stone-200 bg-stone-100 px-3 py-2 text-right font-semibold text-stone-700">
                      定價租金
                    </th>
                    <th className="border-b border-stone-200 bg-stone-100 px-3 py-2 text-right font-semibold text-stone-700">
                      續租 1.1 倍租金
                    </th>
                    <th className="border-b border-stone-200 bg-stone-100 px-3 py-2 text-right font-semibold text-stone-700">
                      差額
                    </th>
                    <th className="border-b border-stone-200 bg-stone-100 px-3 py-2 text-right font-semibold text-stone-700">
                      增幅百分比
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {appendix3Units.map((u) => {
                    const base = appendix1Units.find(
                      (x) =>
                        x.type === u.type &&
                        x.rent_area_ping === u.rent_area_ping
                    )?.rent["不補貼_定價租金"];

                    const renewal = u.rent_1_1x;
                    const diff =
                      base != null && renewal != null ? renewal - base : 0;
                    const diffClass =
                      diff > 0
                        ? "text-red-600 font-semibold"
                        : diff < 0
                        ? "text-emerald-700 font-semibold"
                        : "text-stone-400";

                    return (
                      <tr
                        key={`${u.type}-${u.rent_area_ping}`}
                        className="bg-white even:bg-stone-50/60"
                      >
                        <td className="border-b border-stone-200 px-3 py-3">
                          <div className="font-semibold">{u.type}</div>
                          <div className="mt-0.5 text-[11px] text-stone-500">
                            {u.rent_area_ping} 坪
                          </div>
                        </td>
                        <td className="border-b border-stone-200 px-3 py-2 text-right tabular-nums text-stone-500">
                          {formatNumber(base ?? null)}
                        </td>
                        <td className="border-b border-stone-200 px-3 py-2 text-right tabular-nums font-semibold">
                          {formatNumber(renewal)}
                        </td>
                        <td
                          className={`border-b border-stone-200 px-3 py-2 text-right tabular-nums ${diffClass}`}
                        >
                          {base == null ? "—" : formatNumber(diff)}
                        </td>
                        <td
                          className={`border-b border-stone-200 px-3 py-2 text-right tabular-nums ${diffClass}`}
                        >
                          {base == null ? "—" : formatPercent(diff, base)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-[11px] leading-5 text-stone-500">
              續租 1.1 倍租金適用情形：續租時承租人育有二名以上二十歲以下家庭成員，家庭年所得為申請續租當年度本市
              50% 分位點家庭之平均所得以上，其所得總額平均分配家庭成員人口數，平均每人每月不超過本市最低生活費標準之
              3.5 倍，且申請續租時同意續租期間以原租金之 1.1 倍計收。
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
          <h2 className="text-base font-semibold">
            第一階：114 年 vs 115 年租金差異
          </h2>
          <p className="mt-2 text-xs leading-5 text-stone-600">
            以下以第一階承租戶為例，比較 114 年度與 115 年度「實際每月支出」（114 年：租金 + 管理費；115 年：實付租金，已含管理費）。
          </p>

          <div className="mt-3 overflow-x-auto rounded-2xl border border-stone-200 bg-stone-50">
            <table className="min-w-full border-separate border-spacing-0 text-xs">
              <thead>
                <tr>
                  <th className="border-b border-stone-200 bg-stone-100 px-3 py-2 text-left font-semibold text-stone-700">
                    房型 / 坪數
                  </th>
                  <th className="border-b border-stone-200 bg-stone-100 px-3 py-2 text-right font-semibold text-stone-700">
                    114 年實付（租金 + 管理費）
                  </th>
                  <th className="border-b border-stone-200 bg-stone-100 px-3 py-2 text-right font-semibold text-stone-700">
                    115 年實付（含管理費）
                  </th>
                  <th className="border-b border-stone-200 bg-stone-100 px-3 py-2 text-right font-semibold text-stone-700">
                    差額（115 − 114）
                  </th>
                  <th className="border-b border-stone-200 bg-stone-100 px-3 py-2 text-right font-semibold text-stone-700">
                    差異百分比
                  </th>
                </tr>
              </thead>
              <tbody>
                {firstLevelUnits.map((u: any) => {
                  const base = u.year_114.total_monthly_payment;
                  const next = u.year_115.total_monthly_payment;
                  const diff = u.difference.amount;
                  const diffPct = u.difference.percent;
                  const diffClass =
                    diff > 0
                      ? "text-red-600 font-semibold"
                      : diff < 0
                      ? "text-emerald-700 font-semibold"
                      : "text-stone-500";

                  return (
                    <tr
                      key={`${u.type}-${u.rent_area_ping}`}
                      className="bg-white even:bg-stone-50/60"
                    >
                      <td className="border-b border-stone-200 px-3 py-3">
                        <div className="font-semibold">{u.type}</div>
                        <div className="mt-0.5 text-[11px] text-stone-500">
                          {u.rent_area_ping} 坪
                        </div>
                      </td>
                      <td className="border-b border-stone-200 px-3 py-2 text-right tabular-nums text-stone-500">
                        {formatNumber(base)}
                      </td>
                      <td className="border-b border-stone-200 px-3 py-2 text-right tabular-nums font-semibold">
                        {formatNumber(next)}
                      </td>
                      <td
                        className={`border-b border-stone-200 px-3 py-2 text-right tabular-nums ${diffClass}`}
                      >
                        {diff === 0 ? "—" : formatNumber(diff)}
                      </td>
                      <td
                        className={`border-b border-stone-200 px-3 py-2 text-right tabular-nums ${diffClass}`}
                      >
                        {diff === 0 ? "—" : `${diffPct.toFixed(1)}%`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-[11px] leading-5 text-stone-500">
            註：差額 = 115 年實付 − 114 年實付；差異百分比 = 差額 ÷ 114 年實付。
          </p>
        </section>

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
          <h2 className="text-base font-semibold">適用所得條件摘要</h2>
          <p className="mt-2 text-xs leading-5 text-stone-600">
            本頁所示租金級距適用「{incomeClassification.applicable_condition}
            」之申請戶，「{incomeClassification.no_subsidy.label}」則為
            {incomeClassification.no_subsidy.condition}。
          </p>
          <ul className="mt-3 grid gap-2 text-[11px] text-stone-500 md:grid-cols-2">
            {incomeClassification.levels.map((level) => (
              <li key={level.level}>
                • {level.level}：{level.monthly_income_per_person.text}。
              </li>
            ))}
            <li>
              • {incomeClassification.no_subsidy.label}：
              {incomeClassification.no_subsidy.monthly_income_per_person.text}。
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
