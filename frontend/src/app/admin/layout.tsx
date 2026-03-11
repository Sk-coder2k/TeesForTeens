"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, ShoppingBag, ShoppingCart, Users, Tag,
  LogOut, Bell, X, AlertCircle, LayoutGrid, Menu,
} from "lucide-react";
import { useOrders } from "@/context/OrdersContext";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isAuthReady, logout } = useAuth();
  const { orders } = useOrders();

  // ALL hooks must be at top — before any conditional returns
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [clearedNotifs, setClearedNotifs] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run auth guard when actually on an admin route
    if (!pathname.startsWith("/admin")) return;
    if (!isAuthReady) return;
    if (!isAuthenticated) router.replace("/login");
    else if (!user?.isAdmin) router.replace("/");
  }, [isAuthReady, isAuthenticated, user?.isAdmin, pathname]); // removed router from deps - it's stable

  useEffect(() => {
    const saved = localStorage.getItem("teesforteens_cleared_notifs");
    if (saved) setClearedNotifs(JSON.parse(saved));

    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const actionableOrders = orders.filter(
    (o) => (o.status === "Pending" || o.status === "Cancelled") && !clearedNotifs.includes(o.id),
  );
  const actionRequiredCount = actionableOrders.length;

  const clearNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setClearedNotifs((prev) => {
      const updated = [...prev, id];
      localStorage.setItem("teesforteens_cleared_notifs", JSON.stringify(updated));
      return updated;
    });
  };

  const clearAllNotifications = () => {
    const allIds = actionableOrders.map((o) => o.id);
    setClearedNotifs((prev) => {
      const updated = [...prev, ...allIds];
      localStorage.setItem("teesforteens_cleared_notifs", JSON.stringify(updated));
      return updated;
    });
    setIsNotifOpen(false);
  };

  const NAV_LINKS = [
    { title: "Dashboard", href: "/admin", icon: <LayoutDashboard size={20} /> },
    { title: "Products", href: "/admin/products", icon: <ShoppingCart size={20} /> },
    { title: "Orders", href: "/admin/orders", icon: <ShoppingBag size={20} />, badge: actionRequiredCount > 0 ? actionRequiredCount : null },
    { title: "Customers", href: "/admin/users", icon: <Users size={20} /> },
    { title: "Coupons", href: "/admin/coupons", icon: <Tag size={20} /> },
    { title: "Homepage Manager", href: "/admin/homepage", icon: <LayoutGrid size={20} /> },
  ];

  // Auth guard — only block if we're on an admin route and not verified yet
  if (pathname.startsWith("/admin") && (!isAuthReady || !isAuthenticated || !user?.isAdmin)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex overflow-hidden">

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 text-gray-900 flex-shrink-0 flex flex-col transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <div className="h-16 flex items-center px-6 border-b border-gray-200 justify-between">
          <span className="font-bold text-xl tracking-tighter text-[#29bc89]">
            TeesforTeens Admin.
          </span>
          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-gray-400 hover:text-[#29bc89] transition-colors"
            >
              View Store ↗
            </a>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1 text-gray-400 hover:text-gray-900"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.title}
                href={link.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-colors font-medium ${
                  isActive ? "bg-mint-100 text-mint-800" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-3">{link.icon} {link.title}</div>
                {link.badge && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors font-medium"
          >
            <LogOut size={20} /> Log out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={22} />
          </button>
          <div className="lg:hidden font-bold text-[#29bc89] text-sm">Admin Panel</div>
          <div className="flex items-center gap-4 sm:gap-6">

            {/* Bell */}
            <div ref={notifRef} className="relative">
              <button
                className="cursor-pointer text-gray-500 hover:text-gray-900 transition-colors p-2 rounded-full hover:bg-gray-100 relative"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
              >
                <Bell size={20} />
                {actionRequiredCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                    {actionRequiredCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
                    {actionableOrders.length > 0 && (
                      <button onClick={clearAllNotifications} className="text-xs font-semibold text-mint-600 hover:text-mint-700">
                        Clear all
                      </button>
                    )}
                  </div>
                  <div className="max-h-[320px] overflow-y-auto">
                    {actionableOrders.length === 0 ? (
                      <div className="px-4 py-8 text-center text-gray-500 text-sm">
                        You're all caught up! No pending actions.
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {actionableOrders.map((order) => (
                          <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors flex gap-3 relative group">
                            <div className="flex-shrink-0 mt-0.5">
                              <AlertCircle className={`w-5 h-5 ${order.status === "Cancelled" ? "text-red-500" : "text-yellow-500"}`} />
                            </div>
                            <div className="flex-1 min-w-0 pr-6">
                              <p className="text-sm font-medium text-gray-900 mb-0.5 truncate">
                                Order {order.displayId || order.id}
                              </p>
                              <p className="text-xs text-gray-500 leading-snug">
                                {order.status === "Cancelled"
                                  ? `${order.customer} cancelled. Refund required.`
                                  : `New order from ${order.customer}. Ready to fulfill.`}
                              </p>
                              <p className="text-[10px] font-bold text-gray-400 mt-1">{order.date}</p>
                            </div>
                            <button
                              onClick={(e) => clearNotification(order.id, e)}
                              className="absolute top-4 right-4 text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all p-1"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {actionableOrders.length > 0 && (
                    <div className="p-2 bg-gray-50 border-t border-gray-100">
                      <Link
                        href="/admin/orders"
                        onClick={() => setIsNotifOpen(false)}
                        className="block w-full py-2 text-center text-xs font-bold text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        View All Orders
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-mint-200 flex items-center justify-center font-bold text-mint-800 text-sm">
                {user?.name?.charAt(0).toUpperCase() || "A"}
              </div>
              <span className="font-medium text-sm hidden sm:block text-gray-900">{user?.name || "Admin"}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
