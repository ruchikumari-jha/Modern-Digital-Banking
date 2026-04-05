import React, { useState, useMemo, useRef, useEffect } from "react";
import AppLayout from "../components/AppLayout";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  BarChart2,
  TrendingDown,
  TrendingUp,
  Activity,
  Wallet,
  Bell,
  CheckCheck,
  AlertTriangle,
} from "lucide-react";
import { useAlerts } from "../context/AppContext";
import axios from "axios";

// ----------  ALL TRANSACTION DATA  ----------


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

// ----------  CONSTANTS  ----------
const MONTHS = [
  "All",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const YEARS = ["All", "2024", "2025", "2026"];

const PALETTE = [
  "#f59e0b",
  "#78716c",
  "#a78bfa",
  "#34d399",
  "#f87171",
  "#60a5fa",
  "#fb923c",
  "#a3e635",
  "#e879f9",
  "#2dd4bf",
  "#facc15",
  "#94a3b8",
];

// Memoized: only re-renders if active/payload reference changes
const CustomTooltip = React.memo(({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-stone-100 rounded-2xl shadow-xl p-4 min-w-[130px]">
        <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">
          {payload[0].name}
        </p>
        <p className="text-lg font-black text-stone-900">
          ₹{Number(payload[0].value).toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
});


// ----------  CUSTOM PIE LABEL  ----------
const RADIAN = Math.PI / 180;
const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}) => {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      style={{ fontWeight: 900, fontSize: 11 }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// ======================================
const Reports = () => {
  const [selectedMonth, setSelectedMonth] = useState("Mar");
  const [selectedYear, setSelectedYear] = useState("All");
  const [activeChart, setActiveChart] = useState("pie");
  const [allTransactionsData, setAllTransactionsData] = useState([]);
  const [cashflow, setCashflow] = useState([]);
  const [cashflowLoading, setCashflowLoading] = useState(true);

  // ── Global alert state from context ──
  const [alerts, setAlerts] = useState([]);
  const fetchAlerts = async () => {
  try {
    const token = localStorage.getItem("access_token");

    const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/alerts/`, {
      params: { user_id: getUserIdFromToken() },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setAlerts(res.data || []);
  } catch (err) {
    console.error("Alerts error:", err);
  }
};
useEffect(() => {
  fetchAlerts();
}, []);
  const handleMarkRead = async (id) => {
  try {
    const token = localStorage.getItem("access_token");

    await axios.post(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/alerts/mark-read`, null, {
      params: { alert_id: id },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchAlerts(); // 🔥 refresh
  } catch (err) {
    console.error(err);
  }
};
  const handleMarkAllRead = async () => {
  try {
    const token = localStorage.getItem("access_token");

    await axios.post(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/alerts/mark-all-read`, null, {
      params: { user_id: getUserIdFromToken() },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchAlerts();
  } catch (err) {
    console.error(err);
  }
};

//   const unreadCount = (alerts || []).filter((a) => !a.read).length;
  const [alertsOpen, setAlertsOpen] = useState(false);
  const alertsPanelRef = useRef(null);
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem("access_token");

        const monthIndex = MONTHS.indexOf(selectedMonth);
        const month = monthIndex === 0 ? new Date().getMonth() + 1 : monthIndex;

        const year =
          selectedYear === "All"
            ? new Date().getFullYear()
            : Number(selectedYear);

        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/reports/spending-by-category`,
          {
            params: { month, year },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        // 🔥 Convert backend category totals → fake transactions
      const converted = res.data.results.map((item) => ({
  name: item.category,
  value: item.total_spent,
}));

setAllTransactionsData(converted);
      } catch (err) {
        console.error("Report error:", err);
        setAllTransactionsData([]);
      }
      
      try {
        setCashflowLoading(true);
        const token = localStorage.getItem("access_token");
        const userId = getUserIdFromToken();
        if (userId) {
          const resCashflow = await axios.get(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/insights/cashflow`, {
            params: { user_id: userId },
            headers: { Authorization: `Bearer ${token}` }
          });
          const formatted = (resCashflow.data || []).map((d) => ({
             month: d.month ? new Date(d.month + "-01").toLocaleString("default", { month: "short" }) : d.month,
             Income: d.income || 0,
             Expense: d.expense || 0,
             year: d.month ? d.month.split("-")[0] : "",
          }));
          setCashflow(formatted);
        }
      } catch (err) {
        console.error("Cashflow error:", err);
        setCashflow([]);
      } finally {
        setCashflowLoading(false);
      }
    };

    fetchReport();
  }, [selectedMonth, selectedYear]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (  
        alertsPanelRef.current &&
        !alertsPanelRef.current.contains(e.target)
      ) {
        setAlertsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unreadCount = alerts.filter((a) => !a.is_read).length;

 

  

  // Aggregate by category
 const categoryData = allTransactionsData;
const totalSpent = useMemo(() => {
  return categoryData.reduce((sum, c) => sum + c.value, 0);
}, [categoryData]);

// This API gives ONLY expenses
const totalIncome = cashflow.reduce((sum, c) => sum + (c.Income || 0), 0);

const net = totalIncome - totalSpent; 
  // Get filtered cashflow by selected year
  const monthlyBar = useMemo(() => {
    if (selectedYear === "All") return cashflow;
    return cashflow.filter(c => c.year === selectedYear);
  }, [cashflow, selectedYear]);

  const isEmpty = categoryData.length === 0;

  return (
    <AppLayout
      title="Spending Reports"
      description="Visual breakdown of where your money goes."
    >
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <header className="mb-10 pt-4 md:pt-0 flex flex-col md:flex-row md:items-center justify-end gap-6">
          {/* Right side: Alerts + Filters grouped together */}
          <div className="flex items-center gap-3">
            {/* Filters pill */}
            <div className="flex items-center gap-2 bg-white dark:bg-stone-900 p-2 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 transition-colors">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent border-none text-xs font-black text-stone-600 focus:ring-0 cursor-pointer px-3 outline-none"
              >
                {MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <div className="w-px h-4 bg-stone-100" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-transparent border-none text-xs font-black text-stone-600 focus:ring-0 cursor-pointer px-3 outline-none"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Alerts Bell */}
            <div className="relative" ref={alertsPanelRef}>
              <button
                onClick={() => setAlertsOpen((o) => !o)}
                className="relative p-3 bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-all"
              >
                <Bell className="w-5 h-5 text-stone-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Alerts Dropdown */}
              {alertsOpen && (
                <div className="absolute right-0 top-14 w-80 bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-[2rem] shadow-2xl shadow-stone-200/50 dark:shadow-black/50 z-50 overflow-hidden">
                  <div className="px-6 py-4 border-b border-stone-50 dark:border-stone-800 flex items-center justify-between">
                    <h3 className="font-black text-stone-900 dark:text-stone-100 text-sm">
                      Alerts
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="flex items-center gap-1 text-[10px] font-black text-amber-600 hover:text-amber-800 transition-colors"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-stone-50">
                    {alerts.length === 0 ? (
                      <div className="py-12 text-center">
                        <p className="text-stone-400 text-xs font-bold">
                          No alerts. You're on track! 🎉
                        </p>
                      </div>
                    ) : (
                      alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`px-5 py-4 flex items-start gap-3 transition-all ${
                            !alert.is_read ? "bg-red-50/40" : "bg-white opacity-60"
                          }`}
                        >
                          <div
                            className={`mt-0.5 p-1.5 rounded-xl shrink-0 ${
                              alert.type === "budget_exceeded"
                                ? "bg-red-100"
                                : "bg-amber-100"
                            }`}
                          >
                            <AlertTriangle
                              className={`w-3.5 h-3.5 ${
                                alert.type === "budget_exceeded"
                                  ? "text-red-500"
                                  : "text-amber-500"
                              }`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span
                                className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full ${
                                  alert.type === "budget_exceeded"
                                    ? "bg-red-100 text-red-600"
                                    : "bg-amber-100 text-amber-700"
                                }`}
                              >
                                {alert.type === "budget_exceeded"
                                  ? "Exceeded"
                                  : "Warning"}
                              </span>
                              <span className="text-[9px] font-bold text-stone-400">
                                {alert.month} {alert.year}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-stone-700 leading-relaxed">
                              {alert.message}
                            </p>
                          </div>
                          {!alert.read && (
                            <button
                              onClick={() => handleMarkRead(alert.id)}
                              className="shrink-0 w-2 h-2 bg-amber-500 rounded-full mt-1.5 hover:bg-amber-700 transition-colors"
                              title="Mark as read"
                            />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          {[
            {
              label: "Total Income",
              value: totalIncome,
              icon: TrendingUp,
              color: "text-green-600",
              bg: "bg-green-50",
              border: "border-green-100",
            },
            {
              label: "Total Spent",
              value: totalSpent,
              icon: TrendingDown,
              color: "text-red-500",
              bg: "bg-red-50",
              border: "border-red-100",
            },
            {
              label: "Net",
              value: net,
              icon: Wallet,
              color: net >= 0 ? "text-amber-600" : "text-red-500",
              bg: "bg-amber-50",
              border: "border-amber-100",
            },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="bg-white dark:bg-stone-900 rounded-[2.5rem] p-7 shadow-sm border border-stone-100 dark:border-stone-800 flex items-center justify-between hover:shadow-lg transition-all duration-300"
            >
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2">
                  {kpi.label}
                </p>
                <p className={`text-2xl font-black ${kpi.color}`}>
                  {net < 0 && kpi.label === "Net" ? "-" : ""}₹
                  {Math.abs(kpi.value).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className={`p-3 rounded-2xl ${kpi.bg} border ${kpi.border}`}>
                <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
          {/* Main Chart */}
          <div className="lg:col-span-3 bg-white dark:bg-stone-900 rounded-[2.5rem] p-8 shadow-sm border border-stone-100 dark:border-stone-800 transition-colors">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-black text-stone-900 dark:text-stone-100">
                Spending Breakdown
              </h2>
              {/* Chart toggle */}
              <div className="flex gap-1 bg-stone-50 p-1 rounded-xl border border-stone-100">
                <button
                  onClick={() => setActiveChart("pie")}
                  className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${activeChart === "pie" ? "bg-white shadow-sm text-stone-900 border border-stone-100" : "text-stone-400 hover:text-stone-600"}`}
                >
                  Pie
                </button>
                <button
                  onClick={() => setActiveChart("bar")}
                  className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${activeChart === "bar" ? "bg-white shadow-sm text-stone-900 border border-stone-100" : "text-stone-400 hover:text-stone-600"}`}
                >
                  Bar
                </button>
              </div>
            </div>

            {isEmpty ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center border border-stone-100">
                  <Activity className="w-8 h-8 text-stone-200" />
                </div>
                <p className="text-stone-400 font-bold text-sm">
                  No spending data for this period.
                </p>
              </div>
            ) : activeChart === "pie" ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={115}
                    paddingAngle={3}
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomLabel}
                  >
                    {categoryData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={PALETTE[index % PALETTE.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={categoryData}
                  margin={{ top: 0, right: 0, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fontWeight: 700, fill: "#78716c" }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fontWeight: 700, fill: "#78716c" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {categoryData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={PALETTE[index % PALETTE.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Legend / Category Breakdown */}
          <div className="lg:col-span-2 bg-white dark:bg-stone-900 rounded-[2.5rem] p-8 shadow-sm border border-stone-100 dark:border-stone-800 transition-colors">
            <h2 className="text-lg font-black text-stone-900 dark:text-stone-100 mb-6">
              By Category
            </h2>
            {isEmpty ? (
              <p className="text-stone-400 font-bold text-sm text-center mt-16">
                No data.
              </p>
            ) : (
              <div className="space-y-4 overflow-y-auto max-h-72 pr-1">
                {categoryData.map((cat, i) => {
                  const pct =
                    totalSpent > 0
                      ? ((cat.value / totalSpent) * 100).toFixed(1)
                      : 0;
                  return (
                    <div key={cat.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ background: PALETTE[i % PALETTE.length] }}
                          />
                          <span className="text-xs font-black text-stone-700 dark:text-stone-300">
                            {cat.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-stone-900 dark:text-stone-100">
                            ₹{cat.value.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-stone-400 ml-2">
                            {pct}%
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full bg-stone-50 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            background: PALETTE[i % PALETTE.length],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Monthly Overview Bar Chart */}
        <div className="bg-white dark:bg-stone-900 rounded-[2.5rem] p-8 shadow-sm border border-stone-100 dark:border-stone-800 mb-10 transition-colors">
          <h2 className="text-lg font-black text-stone-900 dark:text-stone-100 mb-8">
            Monthly Income vs Expense
            <span className="ml-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              ({selectedYear})
            </span>
          </h2>
          {cashflowLoading ? (
            <div className="flex items-center justify-center h-60">
                <span className="text-stone-400 font-bold text-sm flex items-center gap-2">
                    <Activity className="w-5 h-5 animate-spin" /> Loading cashflow...
                </span>
            </div>
          ) : monthlyBar.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 gap-4">
                <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center border border-stone-100">
                    <Activity className="w-8 h-8 text-stone-200" />
                </div>
                <p className="text-stone-400 font-bold text-sm">No cashflow data available.</p>
            </div>
          ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={monthlyBar}
              margin={{ top: 0, right: 0, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f5f5f4"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fontWeight: 700, fill: "#78716c" }}
              />
              <YAxis
                tick={{ fontSize: 10, fontWeight: 700, fill: "#78716c" }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "1rem",
                  border: "1px solid #f5f5f4",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
                }}
                labelStyle={{ fontWeight: 900, color: "#292524" }}
                itemStyle={{ fontWeight: 700 }}
              />
              <Legend
                wrapperStyle={{
                  fontSize: "11px",
                  fontWeight: 700,
                  paddingTop: "12px",
                }}
              />
              <Bar dataKey="Income" fill="#34d399" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Expense" fill="#f87171" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          )}
        </div>

        {/* Summary dark card */}
        <div className="bg-stone-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-stone-900/10 relative overflow-hidden group mb-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-110 transition-transform" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-black tracking-tight mb-1">
                Period Summary
              </h3>
              <p className="text-xs text-stone-400 font-medium">
                {selectedMonth === "All" ? "All months" : selectedMonth} ·{" "}
                {selectedYear === "All" ? "All years" : selectedYear}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-6 md:gap-10">
              <div>
                <p className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] mb-1">
                  Categories
                </p>
                <p className="text-2xl font-black text-white">
                  {categoryData.length}
                </p>
              </div>
              <div className="w-px h-10 bg-white/10 hidden md:block" />
              <div>
                <p className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] mb-1">
                  Top Spend
                </p>
                <p className="text-2xl font-black text-amber-400">
                  {categoryData[0]?.name ?? "—"}
                </p>
              </div>
              <div className="w-px h-10 bg-white/10 hidden md:block" />
              <div>
                <p className="text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] mb-1">
                  Savings Rate
                </p>
                <p className="text-2xl font-black text-green-400">
                  {totalIncome > 0
                    ? `${((net / totalIncome) * 100).toFixed(0)}%`
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Reports;
