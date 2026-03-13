"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  IndianRupee,
  ShoppingBag,
  ShoppingCart,
  Users,
  ArrowUpRight,
  RefreshCw,
  Download,
  X,
XCircle } from "lucide-react";

interface MonthlyData {
  month: string;
  revenue: number;
  orders: number;
  customers: number;
}

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  cancelledOrders: number;
  cancelledRevenue: number;
  monthlyChartData: MonthlyData[];
  recentOrders: {
    id: string;
    displayId: string;
    customer: string;
    date: string;
    total: number;
    status: string;
  }[];
  topProducts: {
    id: string;
    name: string;
    price: number;
    image: string;
    sales: number;
  }[];
}

const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (typeof window === "undefined") return headers;
  const userStr = localStorage.getItem("teesforteens_user");
  if (userStr) {
    const token = JSON.parse(userStr).token;
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

const formatINR = (amount: number) =>
  "₹" + amount.toLocaleString("en-IN", { maximumFractionDigits: 0 });

const statusStyle = (status: string) => {
  switch (status) {
    case "Delivered":
      return "bg-green-100 text-green-700";
    case "Shipped":
      return "bg-blue-100 text-blue-700";
    case "Cancelled":
      return "bg-red-100 text-red-700";
    case "Confirmed":
    case "Packed":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-yellow-100 text-yellow-700";
  }
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeChart, setActiveChart] = useState<
    "revenue" | "orders" | "customers" | "products" | null
  >(null);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

  const fetchStats = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) setIsRefreshing(true);
        else setIsLoading(true);
        setError(null);

        const res = await fetch(`${API_URL}/orders/dashboard-stats`, {
          headers: getAuthHeaders(),
        });

        if (!res.ok) {
          if (res.status === 401)
            throw new Error("Unauthorized. Please log in as admin.");
          throw new Error("Failed to load dashboard data.");
        }

        const data = await res.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [API_URL],
  );

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleDownloadReport = () => {
    if (!stats) return;
    const rows = [
      ["Order ID", "Customer", "Date", "Status", "Total"],
      ...stats.recentOrders.map((o) => [
        o.displayId,
        o.customer,
        new Date(o.date).toLocaleDateString("en-IN"),
        o.status,
        formatINR(o.total),
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dashboard-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-8 w-56 bg-gray-200 rounded-lg" />
          <div className="h-9 w-36 bg-gray-200 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 border border-gray-200 h-36"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 h-80" />
          <div className="bg-white rounded-2xl border border-gray-200 h-80" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-600 font-medium">{error}</p>
        <button
          onClick={() => fetchStats()}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!stats) return null;

  const chartDataMap = {
    revenue: { key: "revenue", label: "Revenue (₹)", color: "#22c55e" },
    orders: { key: "orders", label: "Orders", color: "#3b82f6" },
    customers: { key: "customers", label: "Customers", color: "#f97316" },
    products: { key: "orders", label: "Orders", color: "#a855f7" },
  };

  const STATS = [
    {
      title: "Total Revenue",
      value: formatINR(stats.totalRevenue),
      icon: <IndianRupee size={24} className="text-white" />,
      color: "bg-green-500",
      chartKey: "revenue" as const,
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString("en-IN"),
      icon: <ShoppingBag size={24} className="text-white" />,
      color: "bg-blue-500",
      chartKey: "orders" as const,
    },
    {
      title: "Total Products",
      value: stats.totalProducts.toLocaleString("en-IN"),
      icon: <ShoppingCart size={24} className="text-white" />,
      color: "bg-purple-500",
      chartKey: "products" as const,
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers.toLocaleString("en-IN"),
      icon: <Users size={24} className="text-white" />,
      color: "bg-orange-500",
      chartKey: "customers" as const,
    },
  ];

  const cancelledCard = {
    title: "Cancelled Orders",
    value: (stats.cancelledOrders || 0).toLocaleString("en-IN"),
    sub: `₹${(stats.cancelledRevenue || 0).toLocaleString("en-IN")} lost`,
    icon: <XCircle size={24} className="text-white" />,
    color: "bg-red-500",
  };

  return (
    <div className="space-y-6">
      {/* Chart Modal */}
      {activeChart && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setActiveChart(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {STATS.find((s) => s.chartKey === activeChart)?.title} — Last 6
                Months
              </h3>
              <button
                onClick={() => setActiveChart(null)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={18} />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={stats.monthlyChartData || []}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(val: any) =>
                    activeChart === "revenue" ? formatINR(val) : val
                  }
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                  }}
                />
                <Bar
                  dataKey={chartDataMap[activeChart].key}
                  fill={chartDataMap[activeChart].color}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-400 text-center mt-2">
              Click outside to close
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-between items-center gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Dashboard Overview
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => fetchStats(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 bg-white border border-gray-300 shadow-sm px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={isRefreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-2 bg-white border border-gray-300 shadow-sm px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Download size={14} />
            Download Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat) => (
          <div
            key={stat.title}
            onClick={() => setActiveChart(stat.chartKey)}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all cursor-pointer hover:border-[#29bc89] hover:scale-[1.02] active:scale-100"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.color}`}>{stat.icon}</div>
              <span className="text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 bg-green-100 text-green-700">
                <ArrowUpRight size={12} />
                Live
              </span>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">
                {stat.title}
              </p>
              <h3 className="text-2xl font-extrabold text-gray-900">
                {stat.value}
              </h3>
              <p className="text-[10px] text-gray-400 mt-1">
                Tap to view chart
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
            <a
              href="/admin/orders"
              className="text-green-600 text-sm font-bold hover:underline"
            >
              View All
            </a>
          </div>
          <div className="overflow-x-auto flex-1">
            {stats.recentOrders.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
                No orders yet
              </div>
            ) : (
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats.recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {order.displayId}
                      </td>
                      <td className="px-6 py-4">{order.customer}</td>
                      <td className="px-6 py-4">
                        {new Date(order.date).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-xs font-bold ${statusStyle(order.status)}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900">
                        {formatINR(order.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">
              Top Selling Products
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">By units sold</p>
          </div>
          <div className="p-4 flex-1 flex flex-col gap-4">
            {stats.topProducts.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm py-8">
                No sales data yet
              </div>
            ) : (
              <>
                {/* Bar Chart */}
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart
                    data={stats.topProducts.map((p) => ({
                      name:
                        p.name.length > 10 ? p.name.slice(0, 10) + "…" : p.name,
                      sales: p.sales,
                    }))}
                    margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                    <Tooltip
                      formatter={(val: any) => [`${val} units`, "Sales"]}
                      contentStyle={{
                        borderRadius: "10px",
                        border: "1px solid #e5e7eb",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="sales" fill="#29bc89" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>

                {/* Product List */}
                <div className="flex flex-col gap-3 mt-1">
                  {stats.topProducts.map((product, i) => (
                    <div key={product.id} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-gray-400 w-4 shrink-0">
                        #{i + 1}
                      </span>
                      <div className="w-9 h-9 bg-gray-100 rounded-lg shrink-0 overflow-hidden">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-900 truncate">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                            <div
                              className="bg-[#29bc89] h-1.5 rounded-full"
                              style={{
                                width: `${Math.min(100, (product.sales / (stats.topProducts[0]?.sales || 1)) * 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 shrink-0">
                            {product.sales} sold
                          </span>
                        </div>
                      </div>
                      <div className="font-bold text-gray-900 text-sm shrink-0">
                        {formatINR(product.price)}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
