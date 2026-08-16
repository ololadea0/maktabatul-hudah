import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MailPlus, Plus } from "lucide-react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import NewsletterList from "../../components/admin/newsletters/NewsletterList.jsx";
import {
  deleteNewsletter,
  fetchNewsletters,
} from "../../features/newsletters/newsletterSlice.js";

export default function Newsletters() {
  const dispatch = useDispatch();
  const { items, loading, error, activeSubscriberCount } = useSelector((state) => state.newsletters);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    dispatch(fetchNewsletters());
  }, [dispatch]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this draft newsletter?")) return;
    setDeletingId(id);
    const result = await dispatch(deleteNewsletter(id));
    setDeletingId(null);

    if (deleteNewsletter.fulfilled.match(result)) {
      toast.success("Newsletter deleted");
    } else {
      toast.error(result.payload || "Unable to delete newsletter");
    }
  };

  return (
    <div className="space-y-5 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-secondary">Newsletter Management</h1>
          <p className="mt-1 text-sm text-gray-500">{activeSubscriberCount} active subscribers</p>
        </div>
        <Link to="/admin/newsletters/create" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
          <Plus size={15} />
          Create Newsletter
        </Link>
      </div>

      {error ? <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}
      {loading && !items.length ? (
        <div className="rounded-lg bg-white p-8 text-sm text-gray-500 shadow-sm">Loading newsletters...</div>
      ) : (
        <NewsletterList newsletters={items} onDelete={deletingId ? () => {} : handleDelete} />
      )}

      {!items.length && !loading ? (
        <div className="rounded-lg border border-dashed border-primary/30 bg-white p-8 text-center">
          <MailPlus className="mx-auto text-primary" size={28} />
          <p className="mt-3 font-display text-sm font-bold text-secondary">Create your first newsletter draft</p>
        </div>
      ) : null}
    </div>
  );
}
