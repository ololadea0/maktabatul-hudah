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

const initialForm = {
  title: "",
  author: "",
  language: "English",
  description: "",
};

export default function AddCollection() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editingId = searchParams.get("edit");
  const { selectedCollection, selectedStatus } = useSelector((state) => state.collections);
  const [form, setForm] = useState(initialForm);
  const [coverFile, setCoverFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const coverInputRef = useRef(null);

  useEffect(() => {
    if (editingId) {
      dispatch(getCollection(editingId));
    }
  }, [dispatch, editingId]);

  useEffect(() => {
    if (!editingId || selectedCollection?.id !== editingId) return;
    setForm({
      title: selectedCollection.title || "",
      author: selectedCollection.author || "",
      language: selectedCollection.language || "English",
      description: selectedCollection.description || "",
    });
    setCoverFile(null);
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
        await dispatch(updateCollection({ id: editingId, payload: buildPayload() })).unwrap();
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

  return (
    <div className="max-w-3xl space-y-6 p-6 font-display">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-secondary">
            {editingId ? "Edit Collection" : "Add Collection"}
          </h2>
          <p className="mt-1 text-xs text-gray-400">
            Collections represent an overall work. PDFs stay attached to volumes.
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
        <p className="rounded-2xl bg-white p-4 text-sm text-gray-500">Loading collection...</p>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-5">
        <section className="rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.055)]">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" required className="sm:col-span-2">
              <input value={form.title} onChange={(event) => setField("title", event.target.value)} className="input" placeholder="Musnad Imam Ahmad Bin Hanbal" />
            </Field>
            <Field label="Author">
              <input value={form.author} onChange={(event) => setField("author", event.target.value)} className="input" placeholder="Imam Ahmad Bin Hanbal" />
            </Field>
            <Field label="Language">
              <input value={form.language} onChange={(event) => setField("language", event.target.value)} className="input" placeholder="English" />
            </Field>
            <Field label="Description" className="sm:col-span-2">
              <textarea rows="4" value={form.description} onChange={(event) => setField("description", event.target.value)} className="input resize-none" />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.055)]">
          <h3 className="mb-3 text-sm font-bold text-secondary">Collection Cover</h3>
          <div
            className="cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center"
            style={{ borderColor: "rgba(212, 175, 55, 0.35)" }}
            onClick={() => coverInputRef.current?.click()}
          >
            <Image size={28} className="mx-auto mb-2 text-amber-500/80" />
            <p className="text-sm font-semibold text-secondary">Drop or choose an image</p>
            {coverFile ? <p className="mt-3 truncate text-xs text-gray-600">{coverFile.name}</p> : null}
            <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => setCoverFile(event.target.files?.[0] || null)} />
          </div>
        </section>

        <button disabled={isSubmitting} className="rounded-2xl bg-primary px-8 py-3 text-base font-semibold text-white disabled:opacity-50">
          {editingId ? "Update Collection" : "Create Collection"}
        </button>
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
