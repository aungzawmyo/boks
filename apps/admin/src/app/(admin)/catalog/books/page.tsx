"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { BookListItemDto } from "@boks/shared-types";

export default function BooksPage() {
  const [books, setBooks] = useState<BookListItemDto[]>([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load(search = q) {
    setLoading(true);
    try {
      const res = await api.admin.books.list({ q: search || undefined, pageSize: 50 });
      setBooks(res.data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function remove(id: string) {
    if (!confirm("Delete this book?")) return;
    await api.admin.books.remove(id);
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Books
          </h1>
          <p className="text-sm text-gray-500">Manage catalog titles and formats</p>
        </div>
        <Link
          href="/catalog/books/new"
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          Add book
        </Link>
      </div>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title, author, ISBN…"
          className="w-full max-w-md rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
        />
        <button className="rounded-lg border border-gray-200 px-4 py-2 text-sm dark:border-gray-700">
          Search
        </button>
      </form>

      {error && (
        <div className="rounded-lg bg-error-50 px-3 py-2 text-sm text-error-600">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 dark:bg-white/[0.02]">
            <tr className="text-gray-500">
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Formats</th>
              <th className="px-4 py-3 font-medium">Price from</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr
                key={book.id}
                className="border-t border-gray-100 dark:border-gray-800"
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-800 dark:text-white/90">
                    {book.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {book.authors.map((a) => a.name).join(", ")}
                  </div>
                </td>
                <td className="px-4 py-3">{book.status}</td>
                <td className="px-4 py-3">
                  {book.formats.map((f) => f.format).join(", ")}
                </td>
                <td className="px-4 py-3">
                  ${book.lowestPrice?.toFixed(2) ?? "—"}
                </td>
                <td className="px-4 py-3 space-x-2">
                  <Link
                    href={`/catalog/books/${book.id}`}
                    className="text-brand-500 hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => remove(book.id)}
                    className="text-error-500 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!loading && !books.length && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No books found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
