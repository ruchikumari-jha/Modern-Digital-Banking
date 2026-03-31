import React, { useState, useEffect, useCallback } from "react";
import AppLayout from "../components/AppLayout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Flame,
  RefreshCw,
  AlertCircle,
  BarChart2,
  Download,
  Loader2,
} from "lucide-react";
import axios from "axios";

// ── Helpers ──────────────────────────────────────────────────────────────────

import BASE_URL from "../api";

const PALETTE = [
  "#f59e0b",
  "#34d399",
  "#60a5fa",
  "#f87171",
  "#a78bfa",
  "#fb923c",
  "#2dd4bf",
  "#e879f9",
  "#a3e635",
  "#facc15",
];

/** Decode user_id from the JWT stored in localStorage (no library needed). */
function getUserIdFromToken() {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.user_id ?? null;
  } catch {
    return null;
  }
}

function authHeaders() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Sub-components ────────────────────────────────────────────────────────────

const SectionCard = ({ icon: Icon, iconColor, iconBg, title, subtitle, children, loading, error }) => (
  <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] p-7 shadow-sm border border-stone-100 dark:border-stone-800 flex flex-col gap-5 transition-colors">
    {/* Card Header */}
    <div className="flex items-center gap-3">
      <div className={`p-2.5 rounded-2xl border ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div>
        <h2 className="text-base font-black text-stone-900 dark:text-stone-100 tracking-tight">{title}</h2>
        {subtitle && <p className="text-[11px] text-stone-400 font-medium mt-0.5">{subtitle}</p>}
      </div>
    </div>

    {/* Content */}
    {loading ? (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
      </div>
    ) : error ? (
      <div className="flex flex-col items-center justify-center h-48 gap-3 text-stone-400">
        <AlertCircle className="w-8 h-8 text-red-300" />
        <p className="text-xs font-bold text-center">{error}</p>
      </div>
    ) : (
      children
    )}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 rounded-2xl shadow-xl p-3 min-w-[120px]">
      {label && <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} className="text-sm font-black" style={{ color: p.color || "#292524" }}>
          {p.name}: ₹{Number(p.value).toLocaleString()}
        </p>
      ))}
    </div>
  );
};

// ── Cash Flow Widget ──────────────────────────────────────────────────────────

const CashFlowWidget = ({ userId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${BASE_URL}/insights/cashflow`, {
        params: { user_id: userId },
        headers: authHeaders(),
      });
      // Format month label for readability
      const formatted = (res.data || []).map((d) => ({
        ...d,
        month: d.month
          ? new Date(d.month + "-01").toLocaleString("default", { month: "short", year: "2-digit" })
          : d.month,
      }));
      setData(formatted);
    } catch (err) {
      console.error("Cashflow error:", err);
      setError("Could not load cash flow data. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  const totalIncome = data.reduce((s, d) => s + (d.income || 0), 0);
  const totalExpense = data.reduce((s, d) => s + (d.expense || 0), 0);
  const net = totalIncome - totalExpense;

  return (
    <SectionCard
      icon={TrendingUp}
      iconColor="text-green-600"
      iconBg="bg-green-50 border-green-100 dark:bg-green-500/10 dark:border-green-500/30"
      title="Cash Flow"
      subtitle="Monthly income vs. expenses"
      loading={loading}
      error={error}
    >
      {/* KPI row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Income", value: totalIncome, color: "text-green-600" },
          { label: "Expense", value: totalExpense, color: "text-red-500" },
          { label: "Net", value: net, color: net >= 0 ? "text-amber-600" : "text-red-500" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-stone-50 dark:bg-stone-950 rounded-2xl p-3 text-center border border-stone-100 dark:border-stone-800">
            <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-1">{label}</p>
            <p className={`text-sm font-black ${color}`}>
              {value < 0 ? "-" : ""}₹{Math.abs(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
        ))}
      </div>

      {/* Chart */}
      {data.length === 0 ? (
        <EmptyState message="No cash flow data available." />
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} margin={{ top: 0, right: 0, left: -15, bottom: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 700, fill: "#78716c" }} />
            <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: "#78716c" }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 10, fontWeight: 700, paddingTop: 8 }} />
            <Bar dataKey="income" name="Income" fill="#34d399" radius={[6, 6, 0, 0]} />
            <Bar dataKey="expense" name="Expense" fill="#f87171" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </SectionCard>
  );
};

// ── Category Spend Widget ─────────────────────────────────────────────────────

const CategorySpendWidget = ({ userId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${BASE_URL}/insights/category-spend`, {
        params: { user_id: userId },
        headers: authHeaders(),
      });
      // Sort descending by total
      const sorted = (res.data || []).sort((a, b) => (b.total || 0) - (a.total || 0));
      setData(sorted);
    } catch (err) {
      console.error("Category spend error:", err);
      setError("Could not load category spend data.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  const total = data.reduce((s, d) => s + (d.total || 0), 0);

  return (
    <SectionCard
      icon={BarChart2}
      iconColor="text-violet-600"
      iconBg="bg-violet-50 border-violet-100 dark:bg-violet-500/10 dark:border-violet-500/30"
      title="Category-wise Spending"
      subtitle="Where your money goes"
      loading={loading}
      error={error}
    >
      {data.length === 0 ? (
        <EmptyState message="No category data available." />
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          {/* Pie */}
          <div className="shrink-0">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="total"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend + bars */}
          <div className="flex-1 space-y-3 w-full max-h-52 overflow-y-auto pr-1">
            {data.map((d, i) => {
              const pct = total > 0 ? ((d.total / total) * 100).toFixed(1) : 0;
              return (
                <div key={d.category}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PALETTE[i % PALETTE.length] }} />
                      <span className="text-xs font-bold text-stone-700 dark:text-stone-300 capitalize">{d.category || "Other"}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-stone-900 dark:text-stone-100">₹{(d.total || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      <span className="text-[10px] text-stone-400 ml-1.5">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: PALETTE[i % PALETTE.length] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </SectionCard>
  );
};

// ── Top Merchants Widget ──────────────────────────────────────────────────────

const TopMerchantsWidget = ({ userId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${BASE_URL}/insights/top-merchants`, {
        params: { user_id: userId },
        headers: authHeaders(),
      });
      setData(res.data || []);
    } catch (err) {
      console.error("Top merchants error:", err);
      setError("Could not load top merchants.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  const max = data.reduce((m, d) => Math.max(m, d.total || 0), 1);

  return (
    <SectionCard
      icon={ShoppingBag}
      iconColor="text-amber-600"
      iconBg="bg-amber-50 border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/30"
      title="Top Merchants"
      subtitle="Highest spend destinations"
      loading={loading}
      error={error}
    >
      {data.length === 0 ? (
        <EmptyState message="No merchant data available." />
      ) : (
        <div className="space-y-3">
          {data.map((d, i) => {
            const pct = ((d.total / max) * 100).toFixed(1);
            const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
            return (
              <div key={d.merchant || i} className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-100 dark:border-stone-800 hover:border-amber-200 dark:hover:border-amber-500/30 transition-colors">
                <span className="text-lg w-6 text-center shrink-0">{medal || `${i + 1}`}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-black text-stone-800 dark:text-stone-200 truncate">{d.merchant || "Unknown"}</p>
                    <p className="text-xs font-black text-stone-900 dark:text-stone-100 ml-2 shrink-0">₹{(d.total || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="h-1.5 w-full bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-amber-400 transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
};

// ── Budget Burn Rate Widget ───────────────────────────────────────────────────

const BurnRateWidget = ({ userId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${BASE_URL}/insights/burn-rate`, {
        params: { user_id: userId },
        headers: authHeaders(),
      });
      setData(res.data || []);
    } catch (err) {
      console.error("Burn rate error:", err);
      setError("Could not load budget burn rate.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  const getColor = (rate) => {
    if (rate >= 100) return { bar: "bg-red-500", text: "text-red-500", badge: "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400" };
    if (rate >= 75) return { bar: "bg-amber-500", text: "text-amber-600", badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" };
    return { bar: "bg-green-500", text: "text-green-600", badge: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400" };
  };

  return (
    <SectionCard
      icon={Flame}
      iconColor="text-red-500"
      iconBg="bg-red-50 border-red-100 dark:bg-red-500/10 dark:border-red-500/30"
      title="Budget Burn Rate"
      subtitle="How fast you're burning through each budget"
      loading={loading}
      error={error}
    >
      {data.length === 0 ? (
        <EmptyState message="No budget data found. Add budgets first." />
      ) : (
        <div className="space-y-4">
          {data.map((d) => {
            const rate = Math.min(d.burn_rate || 0, 100);
            const actualRate = d.burn_rate || 0;
            const colors = getColor(actualRate);

            return (
              <div key={d.category} className="p-4 bg-stone-50 dark:bg-stone-950 rounded-2xl border border-stone-100 dark:border-stone-800">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-black text-stone-800 dark:text-stone-200 capitalize">{d.category}</p>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${colors.badge}`}>
                    {actualRate >= 100 ? "Exceeded" : actualRate >= 75 ? "Warning" : "On Track"}
                  </span>
                </div>

                <div className="h-2 w-full bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
                    style={{ width: `${rate}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                    <div>
                      <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Spent</p>
                      <p className="text-xs font-black text-stone-800 dark:text-stone-100">₹{(d.spent || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Limit</p>
                      <p className="text-xs font-black text-stone-800 dark:text-stone-100">₹{(d.limit || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>
                  </div>
                  <p className={`text-lg font-black ${colors.text}`}>{actualRate.toFixed(0)}%</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
};

// ── Empty State ───────────────────────────────────────────────────────────────

const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-36 gap-3">
    <div className="w-12 h-12 bg-stone-50 dark:bg-stone-800 rounded-full flex items-center justify-center border border-stone-100 dark:border-stone-700">
      <BarChart2 className="w-6 h-6 text-stone-200 dark:text-stone-600" />
    </div>
    <p className="text-xs font-bold text-stone-400 text-center">{message}</p>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────

const Insights = () => {
  const userId = getUserIdFromToken();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => setRefreshKey((k) => k + 1);

    const handleExportCSV = () => {
    window.location.href = `${BASE_URL}/export/transactions?format=csv`;
  };

  return (
    <AppLayout
      title={
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 dark:bg-amber-500/20 rounded-2xl border border-amber-200 dark:border-stone-800">
            <BarChart2 className="w-6 h-6 text-amber-600 dark:text-amber-500" />
          </div>
          <span>Insights</span>
        </div>
      }
      description="A snapshot of your financial health — cash flow, spending, and budget status."
      actions={
        <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:border-amber-300 dark:hover:border-amber-500/40 hover:text-amber-700 dark:hover:text-amber-400 transition-all shadow-sm"
              title="Download Insights Report (PDF)"
            >
              <Download className="w-4 h-4" />
              Download Insights Report (PDF)
            </button>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:border-amber-300 dark:hover:border-amber-500/40 hover:text-amber-700 dark:hover:text-amber-400 transition-all shadow-sm"
              title="Refresh all widgets"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
        </div>
      }
    >
      {/* No user_id banner */}
      {!userId && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-2xl">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-sm font-bold text-amber-800 dark:text-amber-400">
            Could not detect your user session. Please log out and log back in.
          </p>
        </div>
      )}

      {/* Grid layout */}
      <div key={refreshKey} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Flow — full width */}
        <div className="lg:col-span-2">
          <CashFlowWidget userId={userId} />
        </div>

        {/* Category Spend */}
        <CategorySpendWidget userId={userId} />

        {/* Top Merchants */}
        <TopMerchantsWidget userId={userId} />

        {/* Burn Rate — full width */}
        <div className="lg:col-span-2">
          <BurnRateWidget userId={userId} />
        </div>
      </div>
    </AppLayout>
  );
};

export default Insights;
