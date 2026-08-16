import { Link } from "react-router-dom";
import { Edit, Eye, Trash2 } from "lucide-react";

function formatDate(value) {
  return value
    ? new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : "Not sent";
}

export default function NewsletterList({ newsletters, onDelete }) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              {["Subject", "Status", "Recipients", "Date", "Actions"].map((heading) => (
                <th key={heading} className="px-5 py-3 text-left font-display text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-400">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {newsletters.map((newsletter) => (
              <tr key={newsletter.id} className="border-t border-gray-50">
                <td className="px-5 py-3.5 font-display text-[13px] font-semibold text-secondary">{newsletter.subject}</td>
                <td className="px-5 py-3.5">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${newsletter.status === "SENT" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                    {newsletter.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-xs text-gray-500">{newsletter.recipientCount ?? "-"}</td>
                <td className="px-5 py-3.5 text-xs text-gray-500">{formatDate(newsletter.sentAt || newsletter.createdAt)}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <Link to={`/admin/newsletters/${newsletter.id}/preview`} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100" title="View">
                      <Eye size={15} />
                    </Link>
                    {newsletter.status === "DRAFT" ? (
                      <>
                        <Link to={`/admin/newsletters/${newsletter.id}/edit`} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100" title="Edit">
                          <Edit size={15} />
                        </Link>
                        <button type="button" onClick={() => onDelete(newsletter.id)} className="rounded-lg p-2 text-red-500 hover:bg-red-50" title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!newsletters.length ? <p className="px-5 py-8 text-sm text-gray-500">No newsletters have been created yet.</p> : null}
    </div>
  );
}
