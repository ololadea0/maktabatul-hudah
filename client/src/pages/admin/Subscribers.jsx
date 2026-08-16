import { useEffect, useState } from "react";
import { Search, Users } from "lucide-react";
import { toast } from "sonner";
import { getSubscribersRequest } from "../../features/newsletters/newsletterAPI.js";

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : "-";
}

export default function Subscribers() {
  const [subscribers, setSubscribers] = useState([]);
  const [stats, setStats] = useState({ active: 0, unsubscribed: 0, total: 0 });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSubscribers = async () => {
      setLoading(true);
      try {
        const { data } = await getSubscribersRequest({ search, status: status || undefined, limit: 100 });
        setSubscribers(data.data?.subscribers || []);
        setStats(data.data?.stats || { active: 0, unsubscribed: 0, total: 0 });
      } catch (error) {
        toast.error(error.response?.data?.message || "Unable to load subscribers");
      } finally {
        setLoading(false);
      }
    };

    const timeout = window.setTimeout(loadSubscribers, 250);
    return () => window.clearTimeout(timeout);
  }, [search, status]);

  return (
    <div className="space-y-5 p-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-secondary">Subscribers</h1>
        <p className="mt-1 text-sm text-gray-500">Search and review newsletter subscribers.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Active Subscribers", stats.active],
          ["Unsubscribed", stats.unsubscribed],
          ["Total", stats.total],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs text-gray-500">{label}</p>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users size={17} />
              </div>
            </div>
            <p className="font-display text-[28px] font-extrabold leading-none text-secondary">{value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-lg bg-white p-5 shadow-sm sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search subscribers"
            className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="UNSUBSCRIBED">UNSUBSCRIBED</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                {["Email", "Status", "Subscribed Date"].map((heading) => (
                  <th key={heading} className="px-5 py-3 text-left font-display text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-400">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id} className="border-t border-gray-50">
                  <td className="px-5 py-3.5 text-sm font-semibold text-secondary">{subscriber.email}</td>
                  <td className="px-5 py-3.5">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${subscriber.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                      {subscriber.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-500">{formatDate(subscriber.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading ? <p className="px-5 py-5 text-sm text-gray-500">Loading subscribers...</p> : null}
        {!loading && !subscribers.length ? <p className="px-5 py-8 text-sm text-gray-500">No subscribers found.</p> : null}
      </div>
    </div>
  );
}
