import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Image } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  createCollection,
  getCollection,
  updateCollection,
} from "../../features/collections/collectionSlice.js";
import { fetchCategories } from "../../features/categories/categorySlice.js";

const initialForm = {
  title: "",
  author: "",
  categoryId: "",
  language: "English",
  description: "",
  about: "",
  totalVolumes: "",
};

export default function AddCollection() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editingId = searchParams.get("edit");
  const { selectedCollection, selectedStatus } = useSelector(
    (state) => state.collections,
  );
  const { items: categories } = useSelector((state) => state.categories);
  const [form, setForm] = useState(initialForm);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const coverInputRef = useRef(null);

  useEffect(() => {
    if (editingId) {
      dispatch(getCollection(editingId));
    }
    dispatch(fetchCategories());
  }, [dispatch, editingId]);

  useEffect(() => {
    if (!editingId || selectedCollection?.id !== editingId) return;
    setForm({
      title: selectedCollection.title || "",
      author: selectedCollection.author || "",
      categoryId:
        selectedCollection.category?.id || selectedCollection.categoryId || "",
      language: selectedCollection.language || "English",
      description: selectedCollection.description || "",
      about: selectedCollection.about || "",
      totalVolumes: selectedCollection.totalVolumes || "",
    });
    setCoverFile(null);
    setCoverPreview(selectedCollection.coverImage || null);
  }, [editingId, selectedCollection]);

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const buildPayload = () => {
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        data.append(key, value);
      }
    });
    if (coverFile) {
      data.append("coverImage", coverFile);
    }
    return data;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      toast.error("Collection title is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        await dispatch(
          updateCollection({ id: editingId, payload: buildPayload() }),
        ).unwrap();
        toast.success("Collection updated");
      } else {
        await dispatch(createCollection(buildPayload())).unwrap();
        toast.success("Collection created");
      }
      navigate("/admin/collections");
    } catch (error) {
      toast.error(error || "Failed to save collection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCoverSelect = (file) => {
    setCoverFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setCoverPreview(url);
    } else {
      setCoverPreview(null);
    }
  };

  const removeCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
    // also clear any existing remote cover preview when editing
  };

  return (
    <div className="max-w-3xl space-y-6 p-6 font-display">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-secondary">
            {editingId ? "Edit Collection" : "Add Collection"}
          </h2>
          <p className="mt-1 text-xs text-gray-400">
            Collections represent an overall work. PDFs stay attached to
            volumes.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/admin/collections")}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600"
        >
          <ArrowLeft size={14} />
          Collections
        </button>
      </div>

      {editingId && selectedStatus === "loading" ? (
        <p className="rounded-2xl bg-white p-4 text-sm text-gray-500">
          Loading collection...
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.055)]">
            <h3 className="mb-4 text-sm font-bold text-secondary">
              Basic Info
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title" required className="sm:col-span-2">
                <input
                  value={form.title}
                  onChange={(event) => setField("title", event.target.value)}
                  placeholder="Musnad Imam Ahmad Bin Hanbal"
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  style={{ borderColor: "rgba(15, 118, 110, 0.2)" }}
                />
              </Field>
              <Field label="Category">
                <select
                  value={form.categoryId}
                  onChange={(event) =>
                    setField("categoryId", event.target.value)
                  }
                  className="w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  style={{ borderColor: "rgba(15, 118, 110, 0.2)" }}
                >
                  <option value="">Select category...</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Author">
                <input
                  value={form.author}
                  onChange={(event) => setField("author", event.target.value)}
                  placeholder="Imam Ahmad Bin Hanbal"
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  style={{ borderColor: "rgba(15, 118, 110, 0.2)" }}
                />
              </Field>
              <Field label="Language">
                <input
                  value={form.language}
                  onChange={(event) => setField("language", event.target.value)}
                  placeholder="English"
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  style={{ borderColor: "rgba(15, 118, 110, 0.2)" }}
                />
              </Field>
              <Field label="Total Volumes">
                <input
                  type="number"
                  min="1"
                  value={form.totalVolumes}
                  onChange={(event) =>
                    setField("totalVolumes", event.target.value)
                  }
                  placeholder="e.g. 6"
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  style={{ borderColor: "rgba(15, 118, 110, 0.2)" }}
                />
              </Field>
              <Field label="Description" className="sm:col-span-2">
                <textarea
                  rows="4"
                  value={form.description}
                  onChange={(event) =>
                    setField("description", event.target.value)
                  }
                  placeholder="Short description shown on lists"
                  className="w-full resize-none rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  style={{ borderColor: "rgba(15, 118, 110, 0.2)" }}
                />
              </Field>
              <Field label="About" className="sm:col-span-2">
                <textarea
                  rows="6"
                  value={form.about}
                  onChange={(event) => setField("about", event.target.value)}
                  placeholder="More about the collection, editorial notes, provenance, etc."
                  className="w-full resize-none rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  style={{ borderColor: "rgba(15, 118, 110, 0.2)" }}
                />
              </Field>
            </div>
          </div>

          <aside className="rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.055)]">
            <h3 className="mb-4 text-sm font-bold text-secondary">Cover</h3>
            <div className="flex flex-col items-center gap-3">
              <div className="relative overflow-hidden h-40 w-40 rounded-2xl bg-gray-50 shadow-inner">
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="cover preview"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">
                    No cover
                  </div>
                )}
                <div
                  className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-md px-2 py-1"
                  style={{ backgroundColor: "rgba(15,118,110,0.9)" }}
                >
                  <Image size={12} className="text-white" />
                  <span className="text-xs font-semibold text-white">
                    Cover
                  </span>
                </div>
              </div>

              <div className="flex w-full gap-2">
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600"
                >
                  Choose Image
                </button>
                <button
                  type="button"
                  onClick={removeCover}
                  className="rounded-xl border border-red-100 px-3 py-2 text-sm font-semibold text-red-600"
                >
                  Remove
                </button>
              </div>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(event) =>
                  handleCoverSelect(event.target.files?.[0] || null)
                }
              />

              <p className="mt-2 text-xs text-gray-400">
                Recommended: 400x600px. JPG/PNG/WebP.
              </p>
            </div>

            <div className="mt-6">
              <button
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {editingId ? "Update Collection" : "Create Collection"}
              </button>
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
}

function Field({ label, required = false, className = "", children }) {
  return (
    <label className={className}>
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </span>
      {children}
    </label>
  );
}
