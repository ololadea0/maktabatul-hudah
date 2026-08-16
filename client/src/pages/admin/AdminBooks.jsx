import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Edit2, Eye, Plus, Search, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  deleteBook,
  fetchBooks,
  updateBook,
} from "../../features/books/bookSlice.js";
import { fetchCategories } from "../../features/categories/categorySlice.js";

const coverColors = [
  "rgb(15, 118, 110)",
  "rgb(20, 83, 45)",
  "rgb(124, 58, 237)",
  "rgb(3, 105, 161)",
  "rgb(194, 65, 12)",
  "rgb(29, 78, 216)",
];

const categoryStyles = {
  hadith: "border-emerald-200 bg-emerald-50 text-emerald-700",
  aqeedah: "border-sky-200 bg-sky-50 text-sky-700",
  tafsir: "border-purple-200 bg-purple-50 text-purple-700",
  seerah: "border-orange-200 bg-orange-50 text-orange-700",
  fiqh: "border-teal-200 bg-teal-50 text-teal-700",
  tazkiyah: "border-indigo-200 bg-indigo-50 text-indigo-700",
};

export default function AdminBooks() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: books, status, error } = useSelector((state) => state.books);
  const { items: categories } = useSelector((state) => state.categories);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  useEffect(() => {
    dispatch(fetchBooks({ limit: 100, includeCollectionVolumes: true }));
    dispatch(fetchCategories());
  }, [dispatch]);

  const filteredBooks = useMemo(() => {
    const term = search.trim().toLowerCase();
    return books.filter((book) => {
      const matchesSearch = term
        ? [book.title, book.author, book.category?.name, book.collection?.title].some((value) =>
            value?.toLowerCase().includes(term),
          )
        : true;
      const matchesCategory =
        selectedCategory === "All" || book.category?.name === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [books, search, selectedCategory]);

  const visibleBooks = useMemo(
    () =>
      filteredBooks.filter((book) => {
        if (selectedStatus === "Published") return book.isPublished !== false;
        if (selectedStatus === "Drafts") return book.isPublished === false;
        return true;
      }),
    [filteredBooks, selectedStatus],
  );

  const draftBooks = useMemo(
    () => filteredBooks.filter((book) => book.isPublished === false),
    [filteredBooks],
  );

  const publishedCount = filteredBooks.filter(
    (book) => book.isPublished !== false,
  ).length;

  const filterCategories = useMemo(
    () => ["All", ...categories.map((category) => category.name).slice(0, 6)],
    [categories],
  );

  const handleDelete = async (book) => {
    if (!window.confirm(`Delete "${book.title}"?`)) return;
    try {
      await dispatch(deleteBook(book.id)).unwrap();
      toast.success("Book deleted");
    } catch (deleteError) {
      toast.error(deleteError);
    }
  };

  const handleView = (book) => {
    if (book.pdfUrl) {
      window.open(book.pdfUrl, "_blank", "noopener,noreferrer");
      return;
    }
    toast.info("No PDF URL is available for this book yet.");
  };

  const handlePublish = async (book) => {
    const payload = new FormData();
    payload.append("isPublished", "true");

    try {
      await dispatch(updateBook({ id: book.id, payload })).unwrap();
      toast.success("Book published");
    } catch (publishError) {
      toast.error(publishError || "Failed to publish book.");
    }
  };

  const getVolumeLabel = (book) => {
    if (!book.volumeNumber && !book.totalVolumes) return null;
    if (book.volumeNumber && book.totalVolumes) {
      return `Vol. ${book.volumeNumber} of ${book.totalVolumes}`;
    }
    return book.volumeNumber ? `Vol. ${book.volumeNumber}` : `${book.totalVolumes} vols`;
  };

  const getCategoryClass = (categoryName) => {
    const key = categoryName?.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return categoryStyles[key] || "border-gray-200 bg-gray-50 text-gray-600";
  };

  return (
    <div className="space-y-5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-bold text-secondary">
            Books
          </h1>
          <p className="text-xs text-gray-400">
            Manage the library book collection{" "}
            <code className="rounded bg-gray-100 px-1 py-0.5 text-xs text-gray-500">
              GET /api/books
            </code>
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/admin/upload")}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-display text-sm font-semibold text-white shadow-[0_2px_12px_rgba(15,118,110,0.3)]"
        >
          <Plus size={15} />
          Add Book
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.055)]">
        <div className="relative min-w-48 flex-1">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            className="w-full rounded-xl border border-primary/15 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            placeholder="Search books or authors..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {filterCategories.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            ["All", filteredBooks.length],
            ["Published", publishedCount],
            ["Drafts", draftBooks.length],
          ].map(([statusLabel, count]) => {
            const isActive = selectedStatus === statusLabel;
            return (
              <button
                key={statusLabel}
                type="button"
                onClick={() => setSelectedStatus(statusLabel)}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-secondary text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {statusLabel} ({count})
              </button>
            );
          })}
        </div>
        <span className="text-xs text-gray-400">
          {visibleBooks.length} {visibleBooks.length === 1 ? "book" : "books"}
        </span>
      </div>

      <section className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.055)]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-sm font-bold text-secondary">
              Draft Books
            </h2>
            <p className="mt-1 text-xs text-gray-400">
              Unpublished books waiting for review or files.
            </p>
          </div>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            {draftBooks.length} {draftBooks.length === 1 ? "draft" : "drafts"}
          </span>
        </div>

        {draftBooks.length ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {draftBooks.slice(0, 4).map((book) => (
              <div
                key={book.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-100 bg-amber-50/40 p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-semibold text-secondary">
                    {book.title}
                  </p>
                  <p className="mt-1 truncate text-xs text-gray-500">
                    {book.author} - {book.category?.name || "Uncategorized"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/upload?edit=${book.id}`)}
                    className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    Edit Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePublish(book)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    <CheckCircle2 size={13} />
                    Publish
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-gray-200 px-4 py-5 text-sm text-gray-500">
            No draft books match the current filters.
          </p>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.055)]">
        {status === "failed" ? (
          <p className="px-5 py-4 text-sm text-red-600">{error}</p>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                {[
                  "Book",
                  "Author",
                  "Category",
                  "Pages",
                  "Language",
                  "Downloads",
                  "Status",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-400"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleBooks.map((book, index) => (
                <tr
                  key={book.id}
                  className="border-t border-gray-50 transition-colors hover:bg-gray-50/60"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {book.coverImage ? (
                        <img
                          src={book.coverImage}
                          alt=""
                          className="h-12 w-9 flex-shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <div
                          className="relative h-12 w-9 flex-shrink-0 overflow-hidden rounded-lg"
                          style={{
                            backgroundColor:
                              coverColors[index % coverColors.length],
                          }}
                        >
                          <div className="absolute inset-y-0 left-0 w-1 bg-black/20" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="max-w-[180px] truncate font-display text-[13px] font-semibold text-secondary">
                          {book.title}
                        </p>
                        {getVolumeLabel(book) ? (
                          <p className="mt-0.5 max-w-[180px] truncate text-[10px] font-medium text-gray-400">
                            {book.collection?.title || book.volumeSet || getVolumeLabel(book)}{" "}
                            {book.collection || book.volumeSet ? `- ${getVolumeLabel(book)}` : ""}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-500">
                    {book.author}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getCategoryClass(book.category?.name)}`}
                    >
                      {book.category?.name || "Uncategorized"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-500">
                    {book.pages || "-"}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-500">
                    {book.language || "-"}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-500">
                    {new Intl.NumberFormat().format(book.downloads || 0)}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        book.isPublished === false
                          ? "bg-amber-50 text-amber-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {book.isPublished === false ? "Draft" : "Published"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        aria-label="View book"
                        onClick={() => handleView(book)}
                        className="rounded-lg p-1.5 text-primary transition-colors hover:bg-primary/10"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        type="button"
                        aria-label={
                          book.isPublished === false
                            ? "Edit draft"
                            : "Edit book"
                        }
                        onClick={() => navigate(`/admin/upload?edit=${book.id}`)}
                        className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-secondary"
                      >
                        <Edit2 size={14} />
                      </button>
                      {book.isPublished === false ? (
                        <button
                          type="button"
                          aria-label="Publish draft"
                          onClick={() => handlePublish(book)}
                          className="rounded-lg p-1.5 text-emerald-600 transition-colors hover:bg-emerald-50"
                        >
                          <CheckCircle2 size={14} />
                        </button>
                      ) : null}
                      <button
                        type="button"
                        aria-label="Delete book"
                        onClick={() => handleDelete(book)}
                        className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!visibleBooks.length ? (
            <p className="px-5 py-8 text-sm text-gray-500">
              No books match the current filters.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
