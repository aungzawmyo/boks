"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { AuthorDto, CategoryDto, PublisherDto } from "@boks/shared-types";

export default function BookFormPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const isNew = params.id === "new";

  const [authors, setAuthors] = useState<AuthorDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [publishers, setPublishers] = useState<PublisherDto[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">(
    "PUBLISHED",
  );
  const [authorId, setAuthorId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [publisherId, setPublisherId] = useState("");
  const [physicalPrice, setPhysicalPrice] = useState("16.99");
  const [ebookPrice, setEbookPrice] = useState("9.99");
  const [stock, setStock] = useState("20");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      api.admin.authors.list(),
      api.admin.categories.list(),
      api.admin.publishers.list(),
    ]).then(([a, c, p]) => {
      setAuthors(a);
      setCategories(c);
      setPublishers(p);
      if (a[0]) setAuthorId(a[0].id);
      if (c[0]) setCategoryId(c[0].id);
      if (p[0]) setPublisherId(p[0].id);
    });

    if (!isNew) {
      api.admin.books.get(params.id).then((book) => {
        setTitle(book.title);
        setDescription(book.description);
        setStatus(book.status);
        if (book.authors[0]) setAuthorId(book.authors[0].id);
        if (book.categories[0]) setCategoryId(book.categories[0].id);
        if (book.publisher) setPublisherId(book.publisher.id);
        const physical = book.formats.find((f) => f.format === "PHYSICAL");
        const ebook = book.formats.find((f) => f.format === "EBOOK");
        if (physical) setPhysicalPrice(String(physical.price));
        if (ebook) setEbookPrice(String(ebook.price));
        if (book.inventory?.[0]) setStock(String(book.inventory[0].onHand));
      });
    }
  }, [isNew, params.id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      title,
      description,
      status,
      language: "en",
      publisherId: publisherId || null,
      authorIds: [authorId],
      categoryIds: [categoryId],
      inventoryOnHand: Number(stock) || 0,
      formats: [
        {
          format: "PHYSICAL" as const,
          price: Number(physicalPrice),
          currency: "USD",
        },
        {
          format: "EBOOK" as const,
          price: Number(ebookPrice),
          currency: "USD",
          previewPages: 15,
        },
      ],
    };
    try {
      if (isNew) await api.admin.books.create(payload);
      else await api.admin.books.update(params.id, payload);
      router.push("/catalog/books");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
        {isNew ? "Add book" : "Edit book"}
      </h1>
      {error && (
        <div className="rounded-lg bg-error-50 px-3 py-2 text-sm text-error-600">
          {error}
        </div>
      )}
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <label className="block text-sm">
          <span className="mb-1 block text-gray-500">Title</span>
          <input
            className="w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-gray-500">Description</span>
          <textarea
            className="w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-gray-500">Author</span>
            <select
              className="w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
              value={authorId}
              onChange={(e) => setAuthorId(e.target.value)}
            >
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-gray-500">Category</span>
            <select
              className="w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-gray-500">Publisher</span>
            <select
              className="w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
              value={publisherId}
              onChange={(e) => setPublisherId(e.target.value)}
            >
              {publishers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-gray-500">Status</span>
            <select
              className="w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as typeof status)
              }
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-gray-500">Physical price</span>
            <input
              type="number"
              step="0.01"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
              value={physicalPrice}
              onChange={(e) => setPhysicalPrice(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-gray-500">Ebook price</span>
            <input
              type="number"
              step="0.01"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
              value={ebookPrice}
              onChange={(e) => setEbookPrice(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-gray-500">Stock on hand</span>
            <input
              type="number"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700 dark:bg-gray-900"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </label>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save book"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/catalog/books")}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm dark:border-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
