"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import type { OrderDto } from "@boks/shared-types";
import { ORDER_STATUS_LABELS, SHIPPING_METHODS } from "@boks/configuration";

const STATUS_BADGES: Record<string, string> = {
  PENDING_PAYMENT: "bg-warning-50 text-warning-600",
  PAID: "bg-success-50 text-success-600",
  PROCESSING: "bg-warning-50 text-warning-600",
  SHIPPED: "bg-blue-light-50 text-blue-light-600",
  DELIVERED: "bg-success-50 text-success-600",
  CANCELLED: "bg-error-50 text-error-600",
  REFUNDED: "bg-gray-100 text-gray-600",
};

/** Valid next steps mirrored from the API's transition rules. */
const NEXT_ACTIONS: Record<string, Array<{ label: string; status: string; danger?: boolean }>> = {
  PAID: [
    { label: "Start processing", status: "PROCESSING" },
    { label: "Cancel order", status: "CANCELLED", danger: true },
  ],
  PROCESSING: [
    { label: "Mark shipped", status: "SHIPPED" },
    { label: "Cancel order", status: "CANCELLED", danger: true },
  ],
  SHIPPED: [
    { label: "Mark delivered", status: "DELIVERED" },
    { label: "Refund", status: "REFUNDED", danger: true },
  ],
  DELIVERED: [{ label: "Refund", status: "REFUNDED", danger: true }],
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDto | null>(null);
  const [tracking, setTracking] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const o = await api.admin.orders.get(id);
      setOrder(o);
      setTracking(o.trackingNumber ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load order");
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function transition(status: string) {
    if (!order) return;
    setBusy(true);
    try {
      const updated = await api.admin.orders.updateStatus(order.id, {
        status: status as never,
        trackingNumber: tracking || null,
      });
      setOrder(updated);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  if (!order) {
    return <div className="text-sm text-gray-500">{error ?? "Loading…"}</div>;
  }

  const actions = NEXT_ACTIONS[order.status] ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/commerce/orders"
          className="text-sm text-gray-500 hover:text-brand-500"
        >
          ← Orders
        </Link>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          {order.number}
        </h1>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_BADGES[order.status] ?? ""}`}
        >
          {ORDER_STATUS_LABELS[order.status]}
        </span>
        <span className="ml-auto text-sm text-gray-500">
          {new Date(order.createdAt).toLocaleString()}
        </span>
      </div>

      {error && (
        <div className="rounded-lg bg-error-50 px-3 py-2 text-sm text-error-600">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 className="mb-4 font-semibold text-gray-800 dark:text-white/90">
            Items
          </h2>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase text-gray-400 dark:border-gray-800">
                <th className="py-2">Title</th>
                <th className="py-2">Format</th>
                <th className="py-2">Qty</th>
                <th className="py-2 text-right">Price</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 font-medium text-gray-800 dark:text-white/90">
                    {item.title}
                  </td>
                  <td className="py-3 text-gray-500">
                    {item.format === "PHYSICAL" ? "Physical" : "Ebook"}
                  </td>
                  <td className="py-3 text-gray-500">{item.quantity}</td>
                  <td className="py-3 text-right text-gray-500">
                    ${item.unitPrice.toFixed(2)}
                  </td>
                  <td className="py-3 text-right font-medium text-gray-800 dark:text-white/90">
                    ${item.lineTotal.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 space-y-1 border-t border-gray-100 pt-4 text-sm dark:border-gray-800">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Shipping</span>
              <span>
                {order.shippingFee === 0 ? "Free" : `$${order.shippingFee.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-base font-semibold text-gray-800 dark:text-white/90">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h2 className="mb-3 font-semibold text-gray-800 dark:text-white/90">
              Customer
            </h2>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {order.customer?.name}
            </p>
            <p className="text-sm text-gray-500">{order.customer?.email}</p>
          </div>

          {order.address && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
              <h2 className="mb-3 font-semibold text-gray-800 dark:text-white/90">
                Shipping
              </h2>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {order.address.fullName}
              </p>
              <p className="text-sm text-gray-500">
                {order.address.line1}
                {order.address.line2 ? `, ${order.address.line2}` : ""}
              </p>
              <p className="text-sm text-gray-500">
                {order.address.city}
                {order.address.state ? `, ${order.address.state}` : ""}{" "}
                {order.address.postalCode}, {order.address.country}
              </p>
              {order.shippingMethod && (
                <p className="mt-2 text-xs text-gray-400">
                  {SHIPPING_METHODS[order.shippingMethod].label} (
                  {SHIPPING_METHODS[order.shippingMethod].description})
                </p>
              )}
            </div>
          )}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h2 className="mb-3 font-semibold text-gray-800 dark:text-white/90">
              Fulfillment
            </h2>
            <label className="mb-1 block text-xs text-gray-400">
              Tracking number
            </label>
            <input
              className="mb-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
              placeholder="e.g. TRACK-001"
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
            />
            <div className="space-y-2">
              {actions.map((a) => (
                <button
                  key={a.status}
                  disabled={busy}
                  onClick={() => transition(a.status)}
                  className={`w-full rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-50 ${
                    a.danger
                      ? "border border-error-300 text-error-600 hover:bg-error-50"
                      : "bg-brand-500 text-white hover:bg-brand-600"
                  }`}
                >
                  {a.label}
                </button>
              ))}
              {actions.length === 0 && (
                <p className="text-xs text-gray-400">
                  No further actions for this order.
                </p>
              )}
            </div>
            {order.trackingNumber && (
              <p className="mt-3 text-xs text-gray-400">
                Current tracking: {order.trackingNumber}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
