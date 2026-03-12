"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Eye, MoreVertical, X, Trash2, Edit } from "lucide-react";
import { useOrders, Order } from "@/context/OrdersContext";

export default function AdminOrdersPage() {
  const { orders, isLoading, updateOrderStatus, deleteOrder } = useOrders();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.displayId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All Status" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const currentOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm">
            Track, fulfill and manage customer orders.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-mint-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-bold animate-pulse">
            Fetching orders from MongoDB...
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative max-w-md w-full">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by Order ID or Customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mint-500 focus:outline-none text-sm transition-colors text-black"
              />
            </div>
            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-mint-500 focus:outline-none"
              >
                <option>All Status</option>
                <option>Pending</option>
                <option>Confirmed</option>
                <option>Packed</option>
                <option>Shipped</option>
                <option>Delivered</option>
                <option>Cancelled</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Items / Total</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No orders found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  currentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-gray-900 font-mono text-xs">
                        {order.displayId}
                      </td>
                      <td className="px-6 py-4">{order.date}</td>
                      <td className="px-6 py-4 font-medium text-gray-900 flex flex-col items-start gap-1">
                        {order.customer}
                        {order.shippingDetails?.email && (
                          <span className="text-xs text-gray-400 font-normal">
                            {order.shippingDetails.email}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {order.items} items
                        <br />
                        <span className="font-bold text-gray-900">
                          {order.total}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold w-fit ${
                              order.paymentMethod === "UPI"
                                ? "bg-violet-100 text-violet-700"
                                : order.paymentMethod === "Card"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {order.paymentMethod === "UPI" && (
                              <svg
                                className="w-3 h-3"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M11.4 3.4L7.7 20.6l4.8-7.5 4.8 7.5L13.6 3.4h-2.2z" />
                              </svg>
                            )}
                            {order.paymentMethod === "Card" && (
                              <svg
                                className="w-3 h-3"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <rect
                                  x="1"
                                  y="4"
                                  width="22"
                                  height="16"
                                  rx="2"
                                  ry="2"
                                />
                                <line x1="1" y1="10" x2="23" y2="10" />
                              </svg>
                            )}
                            {order.paymentMethod === "COD" && (
                              <svg
                                className="w-3 h-3"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <line x1="12" y1="1" x2="12" y2="23" />
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                              </svg>
                            )}
                            {order.paymentMethod || "COD"}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider ${
                              order.payment === "Paid"
                                ? "text-green-600"
                                : "text-gray-400"
                            }`}
                          >
                            {order.payment}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateOrderStatus(order.id, e.target.value)
                          }
                          className={`text-xs font-bold px-2 py-1 rounded-md outline-none cursor-pointer border-transparent ring-0 ${
                            order.status === "Delivered"
                              ? "bg-green-100 text-green-700 focus:ring-green-500"
                              : order.status === "Shipped"
                                ? "bg-blue-100 text-blue-700 focus:ring-blue-500"
                                : order.status === "Packed"
                                  ? "bg-purple-100 text-purple-700 focus:ring-purple-500"
                                  : order.status === "Confirmed"
                                    ? "bg-indigo-100 text-indigo-700 focus:ring-indigo-500"
                                    : order.status === "Pending"
                                      ? "bg-yellow-100 text-yellow-700 focus:ring-yellow-500"
                                      : "bg-red-100 text-red-700 focus:ring-red-500"
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Packed">Packed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 text-gray-400 hover:text-mint-600 transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdown(
                                activeDropdown === order.id ? null : order.id,
                              );
                            }}
                            className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors"
                          >
                            <MoreVertical size={16} />
                          </button>

                          {activeDropdown === order.id && (
                            <div
                              ref={dropdownRef}
                              className="absolute right-6 top-10 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-10 py-2"
                            >
                              <button
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setActiveDropdown(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Eye size={14} /> View Details
                              </button>
                              {order.status !== "Cancelled" && (
                                <button
                                  onClick={() => {
                                    updateOrderStatus(order.id, "Cancelled");
                                    setActiveDropdown(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                                >
                                  <X size={14} /> Cancel Order
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  if (
                                    confirm("Delete this order permanently?")
                                  ) {
                                    deleteOrder(order.id);
                                    setActiveDropdown(null);
                                  }
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center gap-2 font-bold border-t border-gray-100 mt-1"
                              >
                                🗑️ Delete Order
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 0 && (
            <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 text-sm text-gray-500">
              <div>
                Showing{" "}
                <span className="font-bold text-gray-900">
                  {filteredOrders.length > 0
                    ? (currentPage - 1) * itemsPerPage + 1
                    : 0}
                </span>{" "}
                to{" "}
                <span className="font-bold text-gray-900">
                  {Math.min(currentPage * itemsPerPage, filteredOrders.length)}
                </span>{" "}
                of{" "}
                <span className="font-bold text-gray-900">
                  {filteredOrders.length}
                </span>{" "}
                results
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-gray-700"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${currentPage === i + 1 ? "bg-mint-600 text-white font-bold border-mint-600" : "bg-white border text-gray-700 border-gray-200 hover:bg-gray-50"}`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-gray-700"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Order{" "}
                  <span className="font-mono">{selectedOrder.displayId}</span>
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Placed on {selectedOrder.date}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto bg-gray-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Customer Details */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                    Customer Details
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-500 block mb-0.5">Name</span>
                      <span className="font-medium text-gray-900">
                        {selectedOrder.customer}
                      </span>
                    </div>
                    {selectedOrder.shippingDetails && (
                      <>
                        <div>
                          <span className="text-gray-500 block mb-0.5">
                            Email
                          </span>
                          <span className="font-medium text-gray-900">
                            {selectedOrder.shippingDetails.email}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 block mb-0.5">
                            Phone
                          </span>
                          <span className="font-medium text-gray-900">
                            {selectedOrder.shippingDetails.phone}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                    Shipping Address
                  </h4>
                  <div className="text-sm text-gray-700 leading-relaxed bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    {selectedOrder.shippingDetails ? (
                      selectedOrder.shippingDetails.address
                        .split(",")
                        .map((line, i) => (
                          <span key={i}>
                            {line.trim()}
                            <br />
                          </span>
                        ))
                    ) : (
                      <span className="italic text-gray-400">
                        Address details not captured during mock checkout.
                      </span>
                    )}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="md:col-span-2">
                  <h4 className="font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                    Financial Summary
                  </h4>
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Payment Status</span>
                      <span
                        className={`font-bold ${selectedOrder.payment === "Paid" ? "text-green-600" : "text-gray-700"}`}
                      >
                        {selectedOrder.payment}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Payment Method</span>
                      <span
                        className={`font-bold ${
                          selectedOrder.paymentMethod === "UPI"
                            ? "text-violet-600"
                            : selectedOrder.paymentMethod === "Card"
                              ? "text-blue-600"
                              : "text-orange-600"
                        }`}
                      >
                        {selectedOrder.paymentMethod || "COD"}
                      </span>
                    </div>
                    {selectedOrder.subtotal && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="font-medium text-gray-900">
                          ₹{selectedOrder.subtotal}
                        </span>
                      </div>
                    )}
                    {selectedOrder.discount &&
                      parseInt(selectedOrder.discount) > 0 && (
                        <div className="flex justify-between text-sm text-mint-600">
                          <span>
                            Discount{" "}
                            {selectedOrder.couponCode
                              ? `(${selectedOrder.couponCode})`
                              : ""}
                          </span>
                          <span>-₹{selectedOrder.discount}</span>
                        </div>
                      )}
                    {selectedOrder.shipping && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Shipping</span>
                        <span className="font-medium text-green-600">
                          {selectedOrder.shipping === "Free"
                            ? "Free"
                            : `₹${selectedOrder.shipping}`}
                        </span>
                      </div>
                    )}
                    {selectedOrder.tax && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Tax (5%)</span>
                        <span className="font-medium text-gray-900">
                          ₹{selectedOrder.tax}
                        </span>
                      </div>
                    )}
                    <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                      <span className="font-bold text-gray-900">
                        Total Charged
                      </span>
                      <span className="font-extrabold text-lg text-mint-600">
                        {selectedOrder.total}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ordered Items */}
                <div className="md:col-span-2">
                  <h4 className="font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                    Items Ordered
                  </h4>
                  {selectedOrder.orderedItems &&
                  selectedOrder.orderedItems.length > 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
                      {selectedOrder.orderedItems.map((item, idx) => (
                        <div key={idx} className="p-4 flex items-center gap-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg bg-gray-100 border border-gray-200"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-gray-900 text-sm truncate">
                              {item.name}
                            </h5>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Size: {item.size} | Color: {item.color}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900 text-sm">
                              ₹{item.price}
                            </p>
                            <p className="text-xs text-gray-500">
                              Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-500 italic text-center">
                      No exact item details captured for this older mock order.
                      Total items: {selectedOrder.items}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-white flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
