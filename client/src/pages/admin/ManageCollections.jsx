import { useEffect, useMemo, useState } from "react";
import { Edit2, Eye, Layers, Plus, Search, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  deleteCollection,
  getCollections,
} from "../../features/collections/collectionSlice.js";

export default function ManageCollections() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: collections, status, error } = useSelector((state) => state.collections);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(getCollections());
  }, [dispatch]);

  const filteredCollections = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return collections;
    return collections.filter((collection) =>
      [collection.title, collection.author].some((value) => value?.toLowerCase().includes(term)),
    );
  }, [collections, search]);

  const handleDelete = async (collection) => {
    if (!window.confirm(`Delete "${collection.title}"? Books will be kept and detached.`)) return;
    try {
      await dispatch(deleteCollection(collection.id)).unwrap();
      toast.success("Collection deleted. Books were kept.");
    } catch (deleteError) {
      toast.error(deleteError || "Failed to delete collection.");
    }
  };

  return (
    <div className="space-y-5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-bold text-secondary">Collections</h1>
          <p className="text-xs text-gray-400">Manage parent works and their volumes.</p>
        </div>
        <button onClick={() => navigate("/admin/collections/new")} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-display text-sm font-semibold text-white">
          <Plus size={15} />
          Add Collection
        </button>
      </div>

      <div className="relative rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.055)]">
        <Search size={14} className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search collections..." className="w-full rounded-xl border border-primary/15 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none" />
      </div>

      <section className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.055)]">
        {status === "failed" ? <p className="px-5 py-4 text-sm text-red-600">{error}</p> : null}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                {["Collection", "Author", "Volumes", "Created", "Actions"].map((heading) => (
                  <th key={heading} className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-400">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredCollections.map((collection) => (
                <tr key={collection.id} className="border-t border-gray-50 hover:bg-gray-50/60">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {collection.coverImage ? <img src={collection.coverImage} alt="" className="h-12 w-9 rounded-lg object-cover" /> : <div className="h-12 w-9 rounded-lg bg-primary/80" />}
                      <p className="max-w-[240px] truncate font-display text-[13px] font-semibold text-secondary">{collection.title}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-500">{collection.author || "-"}</td>
                  <td className="px-5 py-3.5 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1.5"><Layers size={13} />{collection.volumesCount || 0}</span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-500">{collection.createdAt ? new Date(collection.createdAt).toLocaleDateString() : "-"}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button aria-label="View volumes" onClick={() => navigate(`/admin/collections/${collection.id}/volumes`)} className="rounded-lg p-1.5 text-primary hover:bg-primary/10"><Eye size={14} /></button>
                      <button aria-label="Edit collection" onClick={() => navigate(`/admin/collections/edit?edit=${collection.id}`)} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"><Edit2 size={14} /></button>
                      <button aria-label="Delete collection" onClick={() => handleDelete(collection)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filteredCollections.length ? <p className="px-5 py-8 text-sm text-gray-500">No collections match the current filters.</p> : null}
        </div>
      </section>
    </div>
  );
}
