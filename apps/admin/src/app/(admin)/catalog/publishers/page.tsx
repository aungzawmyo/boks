"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { PublisherDto } from "@boks/shared-types";

export default function PublishersPage() {
  const [items, setItems] = useState<PublisherDto[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setItems(await api.admin.publishers.list());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    await api.admin.publishers.create({ name });
    setName("");
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Delete publisher?")) return;
    try {
      await api.admin.publishers.remove(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
        Publishers
      </h1>
      {error && (
        <div className="rounded-lg bg-error-50 px-3 py-2 text-sm text-error-600">
          {error}
        </div>
      )}
      <form onSubmit={create} className="flex gap-2">
        <input
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
          placeholder="Publisher name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button className="rounded-lg bg-brand-500 px-4 py-2 text-sm text-white">
          Add
        </button>
      </form>
      <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white dark:divide-gray-800 dark:border-gray-800 dark:bg-white/[0.03]">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between px-4 py-3 text-sm"
          >
            <span className="font-medium text-gray-800 dark:text-white/90">
              {item.name}
            </span>
            <button
              onClick={() => remove(item.id)}
              className="text-error-500 hover:underline"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
