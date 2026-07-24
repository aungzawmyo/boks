"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { api } from "@/lib/api";
import type { BookListItemDto, DashboardStatsDto } from "@boks/shared-types";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

function KpiCard({
  label,
  value,
  growth,
  warn,
}: {
  label: string;
  value: string;
  growth?: number;
  warn?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <div className="mt-3 flex items-end justify-between">
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          {value}
        </h3>
        {typeof growth === "number" && (
          <span
            className={`text-sm font-medium ${
              warn
                ? "text-error-500"
                : growth >= 0
                  ? "text-success-500"
                  : "text-error-500"
            }`}
          >
            {growth >= 0 ? "+" : ""}
            {growth}%
          </span>
        )}
      </div>
    </div>
  );
}

export default function BookstoreDashboard() {
  const [stats, setStats] = useState<DashboardStatsDto | null>(null);
  const [books, setBooks] = useState<BookListItemDto[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.admin.dashboard(), api.admin.books.list({ pageSize: 5 })])
      .then(([dashboard, list]) => {
        setStats(dashboard);
        setBooks(list.data);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const revenueSeries = [
    {
      name: "Physical",
      data: [12, 18, 15, 22, 28, 24, 31],
    },
    {
      name: "Ebook",
      data: [8, 11, 14, 13, 19, 21, 25],
    },
  ];

  const revenueOptions = {
    chart: { toolbar: { show: false }, fontFamily: "Outfit, sans-serif" },
    colors: ["#12B76A", "#465FFF"],
    stroke: { curve: "smooth" as const, width: 3 },
    dataLabels: { enabled: false },
    xaxis: {
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    legend: { position: "top" as const },
  };

  const statusSeries = [51.4, 18.9, 17.1, 9.6, 2.9];
  const statusOptions = {
    labels: ["Delivered", "Processing", "Shipped", "Pending", "Cancelled"],
    colors: ["#12B76A", "#465FFF", "#F79009", "#9CB9FF", "#F04438"],
    legend: { position: "bottom" as const },
    chart: { fontFamily: "Outfit, sans-serif" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          Bookstore Overview
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Revenue, orders, and catalog health for your store.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-600">
          {error}. Sign in as admin to load live metrics.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
        <KpiCard
          label="Net Revenue"
          value={`$${(stats?.netRevenue ?? 124560.8).toLocaleString()}`}
          growth={stats?.revenueGrowth ?? 18.6}
        />
        <KpiCard
          label="Orders"
          value={`${stats?.orders ?? 1248}`}
          growth={stats?.ordersGrowth ?? 14.3}
        />
        <KpiCard
          label="Ebooks Sold"
          value={`${stats?.ebooksSold ?? 832}`}
          growth={stats?.ebooksGrowth ?? 22.7}
        />
        <KpiCard
          label="Low Stock"
          value={`${stats?.lowStockCount ?? 23}`}
          growth={-4.2}
          warn
        />
      </div>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 rounded-2xl border border-gray-200 bg-white p-5 xl:col-span-8 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
            Revenue by Format
          </h3>
          <ReactApexChart
            options={revenueOptions}
            series={revenueSeries}
            type="line"
            height={300}
          />
        </div>
        <div className="col-span-12 rounded-2xl border border-gray-200 bg-white p-5 xl:col-span-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
            Order Status
          </h3>
          <ReactApexChart
            options={statusOptions}
            series={statusSeries}
            type="donut"
            height={300}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Top Selling Books
          </h3>
          <a
            href="/catalog/books"
            className="text-sm font-medium text-brand-500 hover:text-brand-600"
          >
            View all
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 dark:border-gray-800">
                <th className="px-3 py-3 font-medium">#</th>
                <th className="px-3 py-3 font-medium">Title</th>
                <th className="px-3 py-3 font-medium">Formats</th>
                <th className="px-3 py-3 font-medium">Rating</th>
                <th className="px-3 py-3 font-medium">From</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book, i) => (
                <tr
                  key={book.id}
                  className="border-b border-gray-50 dark:border-gray-800/60"
                >
                  <td className="px-3 py-3 text-gray-500">{i + 1}</td>
                  <td className="px-3 py-3">
                    <div className="font-medium text-gray-800 dark:text-white/90">
                      {book.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {book.authors.map((a) => a.name).join(", ")}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex gap-1">
                      {book.formats.map((f) => (
                        <span
                          key={f.id}
                          className="rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-white/5"
                        >
                          {f.format === "PHYSICAL" ? "Physical" : "Ebook"}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-3">{book.averageRating.toFixed(1)}</td>
                  <td className="px-3 py-3">
                    ${book.lowestPrice?.toFixed(2) ?? "—"}
                  </td>
                </tr>
              ))}
              {!books.length && !error && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-8 text-center text-gray-500"
                  >
                    Loading catalog…
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
