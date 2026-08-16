import { useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Download, Plus, Tags, Users } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminDashboard } from "../../features/users/userSlice.js";

const fallbackTrend = [28, 44, 52, 61, 78, 92];

function formatNumber(value) {
  return new Intl.NumberFormat().format(value || 0);
}

function StatCard({ label, value, note, icon: Icon, tone = "primary" }) {
  const color = tone === "accent" ? "text-accent bg-accent/10" : "text-primary bg-primary/10";

  return (
    <div className="rounded-lg border border-black/[0.04] bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-gray-500">{label}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
          <Icon size={17} />
        </div>
      </div>
      <p className="font-display text-[28px] font-extrabold leading-none text-secondary">
        {formatNumber(value)}
      </p>
      <p className="mt-1.5 text-[11px] text-primary">{note}</p>
    </div>
  );
}

function MiniChart({ values = fallbackTrend }) {
  const max = Math.max(...values, 1);

  return (
    <div className="flex h-44 items-end gap-3 rounded-lg bg-gray-50 px-4 py-3">
      {values.map((value, index) => (
        <div key={`${value}-${index}`} className="flex flex-1 flex-col items-center gap-2">
          <div
            className="w-full rounded-t bg-primary"
            style={{ height: `${Math.max((value / max) * 130, 12)}px` }}
          />
          <span className="text-[10px] text-gray-400">{["Jan", "Feb", "Mar", "Apr", "May", "Jun"][index]}</span>
        </div>
      ))}
    </div>
  );
}

function BookRows({ books }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50">
            {["Title", "Author", "Category", "Downloads", "Date Added"].map((heading) => (
              <th
                key={heading}
                className="px-5 py-3 text-left font-display text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-400"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.id} className="border-t border-gray-50">
              <td className="px-5 py-3.5 font-display text-[13px] font-semibold text-secondary">{book.title}</td>
              <td className="px-5 py-3.5 text-xs text-gray-500">{book.author}</td>
              <td className="px-5 py-3.5">
                <span className="rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700">
                  {book.category?.name || "Uncategorized"}
                </span>
              </td>
              <td className="px-5 py-3.5 text-xs text-gray-500">{formatNumber(book.downloads)}</td>
              <td className="px-5 py-3.5 text-[11px] text-gray-400">
                {book.createdAt ? new Date(book.createdAt).toLocaleDateString() : "Not set"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { dashboard, status, error } = useSelector((state) => state.users);
  const totals = dashboard?.totals || {};
  const recentBooks = dashboard?.recentBooks || [];

  useEffect(() => {
    dispatch(fetchAdminDashboard());
  }, [dispatch]);

  return (
    <div className="space-y-5 p-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Books" value={totals.books} note={`${formatNumber(totals.publishedBooks)} published`} icon={BookOpen} />
        <StatCard label="Downloads" value={totals.downloads} note="All time library downloads" icon={Download} tone="accent" />
        <StatCard label="Categories" value={totals.categories} note="Active collection groups" icon={Tags} />
        <StatCard label="Users" value={totals.users} note="Registered readers and admins" icon={Users} tone="accent" />
      </div>

      {status === "failed" ? (
        <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="rounded-lg bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-sm font-bold text-secondary">Library Activity</h2>
            <span className="text-[11px] text-gray-400">Last 6 months</span>
          </div>
          <MiniChart values={recentBooks.map((book) => book.downloads || 1).reverse()} />
        </div>
        <div className="rounded-lg bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-display text-sm font-bold text-secondary">Publishing Status</h2>
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex justify-between text-xs text-gray-500">
                <span>Published</span>
                <span>{formatNumber(totals.publishedBooks)}</span>
              </div>
              <div className="h-2 rounded bg-gray-100">
                <div
                  className="h-2 rounded bg-primary"
                  style={{ width: `${totals.books ? (totals.publishedBooks / totals.books) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="mb-2 flex justify-between text-xs text-gray-500">
                <span>Drafts</span>
                <span>{formatNumber(totals.unpublishedBooks)}</span>
              </div>
              <div className="h-2 rounded bg-gray-100">
                <div
                  className="h-2 rounded bg-accent"
                  style={{ width: `${totals.books ? (totals.unpublishedBooks / totals.books) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="font-display text-sm font-bold text-secondary">Recent Uploads</h2>
          <Link
            to="/admin/upload"
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white"
          >
            <Plus size={11} />
            Add Book
          </Link>
        </div>
        {recentBooks.length ? (
          <BookRows books={recentBooks} />
        ) : (
          <p className="px-5 py-8 text-sm text-gray-500">No books have been uploaded yet.</p>
        )}
      </div>
    </div>
  );
}
