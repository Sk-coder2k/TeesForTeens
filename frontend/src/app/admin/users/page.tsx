"use client";

import { useState } from "react";
import { Search, Trash2, Shield, User } from "lucide-react";
import { useDataUsers } from "@/context/UsersContext";

export default function AdminUsersPage() {
  const { users, isLoading, deleteUser } = useDataUsers();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 text-sm">Manage user accounts and view their history.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search users..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mint-500 focus:outline-none text-sm transition-colors text-black"
            />
          </div>
        </div>

        {/* Table/Loader Output */}
        {isLoading ? (
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-mint-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-bold animate-pulse">Scanning MongoDB for users...</p>
          </div>
        ) : (
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4">Total Orders</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-mint-100 text-mint-700 flex items-center justify-center font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold inline-flex items-center gap-1 ${
                      user.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role === 'Admin' ? <Shield size={12} /> : <User size={12} />}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">{user.joined}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{user.orders}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => { if (confirm('Delete this user permanently?')) deleteUser(user.id); }}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete User"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
}
