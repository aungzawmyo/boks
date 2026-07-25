"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { OrderDto } from "@boks/shared-types";
import { ORDER_STATUS_LABELS, OrderStatus } from "@boks/configuration";

const STATUS_BADGES: Record<string, string> = {
  PENDING_PAYMENT: "bg-warning-50 text-warning-600 dark:bg-warning-500/15",
  PAID: "bg-success-50 text-success-600 dark:bg-success-500/15",
  PROCESSING: "bg-warning-50 text-warning-600 dark:bg-warning-500/15",
  SHIPPED: "bg-blue-light-50 text-blue-light-600 dark:bg-blue-light-500/15",
  DELIVERED: "bg-success-50 text-success-600 dark:bg-success-500/15",
  CANCELLED: "bg-error-50 text-error-600 dark:bg-error-500/15",
  REFUNDED: "bg-gray-100 text-gray-600 dark:bg-gray-500/15",
};

const FILTERS: Array<{ label: string; value: OrderStatus | "" }> = [
  { label: "All", value: "" },
  { label: "Paid", value: "PAID" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Refunded", value: "REFUNDED" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [q, setQ] = useState("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await api.admin.orders.list({
        status: status || undefined,
        q: q || undefined,
        page,
        pageSize: 20,
      });
      setOrders(res.data);
      setTotal(res.meta.total);
      setTotalPages(res.meta.totalPages);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load orders");
    }
  }, [status, q, page]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          Orders
        </h1>
        <span className="text-sm text-gray-500">{total} orders</span>
      </div>

      {error && (
        <div className="rounded-lg bg-error-50 px-3 py-2 text-sm text-error-600">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => {
              setStatus(f.value);
              setPage(1);
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              status === f.value
                ? "bg-brand-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            {f.label}
          </button>
        ))}
        <input
          className="ml-auto rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
          placeholder="Search number or email…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs uppercase text-gray-400 dark:border-gray-800">
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-medium">
                  <Link
                    href={`/commerce/orders/${o.id}`}
                    className="text-brand-500 hover:underline"
                  >
                    {o.number}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                  {o.customer?.name}
                  <div className="text-xs text-gray-400">{o.customer?.email}</div>
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                  {o.items.reduce((s, i) => s + i.quantity, 0)}
                </td>
                <td className="px-4 py-3 font-medium text-gray-800 dark:text-white/90">
                  ${o.total.toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_BADGES[o.status] ?? ""}`}
                  >
                    {ORDER_STATUS_LABELS[o.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(o.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 text-sm">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-gray-700"
          >
            Previous
          </button>
          <span className="text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 disabled:opacity-40 dark:border-gray-700"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
