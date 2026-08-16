import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Preview from "../../components/admin/newsletters/NewsletterPreview.jsx";
import { fetchNewsletter } from "../../features/newsletters/newsletterSlice.js";

export default function NewsletterPreview() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selectedNewsletter, loading } = useSelector((state) => state.newsletters);

  useEffect(() => {
    dispatch(fetchNewsletter(id));
  }, [dispatch, id]);

  return (
    <div className="space-y-5 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-secondary">Newsletter Preview</h1>
          <p className="mt-1 text-sm text-gray-500">Approximate subscriber email view.</p>
        </div>
        {selectedNewsletter?.status === "DRAFT" ? (
          <Link to={`/admin/newsletters/${selectedNewsletter.id}/edit`} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
            Edit Draft
          </Link>
        ) : null}
      </div>
      {loading && !selectedNewsletter ? (
        <div className="rounded-lg bg-white p-8 text-sm text-gray-500 shadow-sm">Loading preview...</div>
      ) : (
        <Preview subject={selectedNewsletter?.subject} content={selectedNewsletter?.content} />
      )}
    </div>
  );
}
