import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Image, Upload } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  createBook,
  fetchBookById,
  updateBook,
} from "../../features/books/bookSlice.js";
import { fetchCategories } from "../../features/categories/categorySlice.js";
import {
  createCollection,
  getCollections,
} from "../../features/collections/collectionSlice.js";

const initialForm = {
  title: "",
  author: "",
  categoryId: "",
  language: "Arabic",
  isbn: "",
  publisher: "",
  publicationYear: "",
  pages: "",
  volumeNumber: "",
  totalVolumes: "",
  collectionId: "",
  description: "",
  about: "",
};

const languages = ["Arabic", "English", "Arabic / English", "Urdu", "French"];
const maxPublicationYear = new Date().getFullYear() + 1;

export default function AdminUpload() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editingId = searchParams.get("edit");
  const defaultCollectionId = searchParams.get("collectionId") || "";
  const { items: categories } = useSelector((state) => state.categories);
  const { items: collections } = useSelector((state) => state.collections);
  const { selectedBook, selectedStatus } = useSelector((state) => state.books);
  const [form, setForm] = useState(initialForm);
  const [bookType, setBookType] = useState(
    defaultCollectionId ? "volume" : "standalone",
  );
  const [collectionMode, setCollectionMode] = useState("existing");
  const [newCollection, setNewCollection] = useState({
    title: "",
    author: "",
    language: "English",
    description: "",
    about: "",
    categoryId: "",
    totalVolumes: "",
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [isDragOverPdf, setIsDragOverPdf] = useState(false);
  const [isDragOverCover, setIsDragOverCover] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pdfInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const isEditingDraft = editingId && selectedBook?.isPublished === false;

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(getCollections());
  }, [dispatch]);

  useEffect(() => {
    if (editingId) {
      dispatch(fetchBookById(editingId));
    }
  }, [dispatch, editingId]);

  useEffect(() => {
    if (!editingId || selectedBook?.id !== editingId) return;
    setForm({
      title: selectedBook.title || "",
      author: selectedBook.author || "",
      categoryId: selectedBook.categoryId || "",
      language: selectedBook.language || "Arabic",
      isbn: selectedBook.isbn || "",
      publisher: selectedBook.publisher || "",
      publicationYear: selectedBook.publicationYear || "",
      pages: selectedBook.pages || "",
      volumeNumber: selectedBook.volumeNumber || "",
      totalVolumes: selectedBook.totalVolumes || "",
      collectionId: selectedBook.collectionId || "",
      description: selectedBook.description || "",
      about: selectedBook.about || "",
    });
    setBookType(selectedBook.collectionId ? "volume" : "standalone");
    setPdfFile(null);
    setCoverFile(null);
  }, [editingId, selectedBook]);

  useEffect(() => {
    if (defaultCollectionId && !editingId) {
      setField("collectionId", defaultCollectionId);
      setBookType("volume");
    }
  }, [defaultCollectionId, editingId]);

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setPdfFile(null);
    setCoverFile(null);
  };

  const handleFileChange = (field, file) => {
    if (!file) return;
    if (field === "pdf") {
      setPdfFile(file);
      return;
    }
    setCoverFile(file);
  };

  const buildFormData = (publish, resolvedCollectionId) => {
    const data = new FormData();
    const payload = {
      ...form,
      collectionId:
        bookType === "volume" ? resolvedCollectionId || form.collectionId : "",
    };

    Object.entries(payload).forEach(([key, value]) => {
      if (value === "" || value === null || value === undefined) {
        return;
      }

      data.append(key, value);
    });
    data.append("isPublished", publish ? "true" : "false");

    if (pdfFile) {
      data.append("pdf", pdfFile);
    }
    if (coverFile) {
      data.append("coverImage", coverFile);
    }

    return data;
  };

  const handleSubmit = async (event, publish = true) => {
    event.preventDefault();
    if (isSubmitting) return;
    const isVolume = bookType === "volume";
    const missingAuthor =
      !form.author &&
      !(isVolume && collectionMode === "new" && newCollection.author);
    if (
      !form.title ||
      missingAuthor ||
      (bookType !== "volume" && !form.categoryId) ||
      (!editingId && !pdfFile) ||
      (isVolume && collectionMode === "existing" && !form.collectionId) ||
      (isVolume &&
        collectionMode === "new" &&
        (!newCollection.title.trim() || !newCollection.categoryId)) ||
      (isVolume && !form.volumeNumber)
    ) {
      toast.error(
        editingId
          ? "Please complete the required fields."
          : "Please complete the required fields and attach the PDF file.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      let resolvedCollectionId = form.collectionId;
      if (isVolume && collectionMode === "new") {
        const collectionData = new FormData();
        Object.entries(newCollection).forEach(([key, value]) => {
          if (value) collectionData.append(key, value);
        });
        const created = await dispatch(
          createCollection(collectionData),
        ).unwrap();
        resolvedCollectionId = created.data?.collection?.id;
      }

      const payload = buildFormData(publish, resolvedCollectionId);
      // If adding a volume to an existing collection, avoid sending collection-level fields
      if (isVolume && (collectionMode === "existing" || resolvedCollectionId)) {
        payload.delete("about");
        payload.delete("author");
        payload.delete("description");
        payload.delete("categoryId");
        payload.delete("volumeSet");
      }
      if (editingId) {
        await dispatch(updateBook({ id: editingId, payload })).unwrap();
        toast.success(publish ? "Book published" : "Draft saved");
      } else {
        await dispatch(createBook(payload)).unwrap();
        toast.success(publish ? "Book uploaded" : "Book saved as draft");
      }
      resetForm();
      navigate("/admin/books");
    } catch (error) {
      toast.error(error || "Failed to upload book.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDrop = (event, field) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileChange(field, file);
    }
    if (field === "pdf") {
      setIsDragOverPdf(false);
    } else {
      setIsDragOverCover(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6 p-6 font-display">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-secondary">
            {editingId ? "Edit Book" : "Upload Book"}
          </h2>
          <p className="mt-1 text-xs text-gray-400">
            {editingId
              ? "Update the book details or replace its files."
              : "Add a new book to the library."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/admin/books")}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
        >
          <ArrowLeft size={14} />
          Books
        </button>
      </div>

      <form
        className="space-y-6"
        onSubmit={(event) => handleSubmit(event, true)}
      >
        {editingId && selectedStatus === "loading" ? (
          <p className="rounded-2xl bg-white p-4 text-sm text-gray-500 shadow-[0_2px_12px_rgba(0,0,0,0.055)]">
            Loading book details...
          </p>
        ) : null}

        <div className="rounded-2xl bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.055)]">
          <h3 className="mb-4 text-sm font-bold text-secondary">
            Book Details
          </h3>
          <div className="mb-5 flex flex-wrap gap-2">
            {[
              ["standalone", "Standalone Book"],
              ["volume", "Volume of a Collection"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setBookType(value)}
                className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                  bookType === value
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {bookType === "volume" ? (
            <div className="mb-5 rounded-2xl border border-primary/10 bg-primary/5 p-4">
              <div className="mb-3 flex flex-wrap gap-2">
                {[
                  ["existing", "Existing Collection"],
                  ["new", "Create Collection"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setCollectionMode(value)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
                      collectionMode === value
                        ? "bg-secondary text-white"
                        : "bg-white text-gray-600"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {collectionMode === "existing" ? (
                <label>
                  <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Collection <span className="text-red-500">*</span>
                  </span>
                  <select
                    value={form.collectionId}
                    onChange={(event) =>
                      setField("collectionId", event.target.value)
                    }
                    className="w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none"
                    style={{ borderColor: "rgba(15, 118, 110, 0.2)" }}
                  >
                    <option value="">Select collection...</option>
                    {collections.map((collection) => (
                      <option key={collection.id} value={collection.id}>
                        {collection.title}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={newCollection.title}
                    onChange={(event) =>
                      setNewCollection((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                    placeholder="Collection title"
                    className="rounded-xl border bg-white px-3 py-2.5 text-sm outline-none"
                  />
                  <input
                    value={newCollection.author}
                    onChange={(event) =>
                      setNewCollection((current) => ({
                        ...current,
                        author: event.target.value,
                      }))
                    }
                    placeholder="Collection author"
                    className="rounded-xl border bg-white px-3 py-2.5 text-sm outline-none"
                  />
                  <select
                    value={newCollection.categoryId}
                    onChange={(event) =>
                      setNewCollection((current) => ({
                        ...current,
                        categoryId: event.target.value,
                      }))
                    }
                    className="rounded-xl border bg-white px-3 py-2.5 text-sm outline-none"
                  >
                    <option value="">Select category...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <textarea
                    value={newCollection.description}
                    onChange={(event) =>
                      setNewCollection((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Collection description"
                    className="sm:col-span-2 w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none resize-none"
                  />
                  <input
                    type="number"
                    min="1"
                    value={newCollection.totalVolumes}
                    onChange={(event) =>
                      setNewCollection((current) => ({
                        ...current,
                        totalVolumes: event.target.value,
                      }))
                    }
                    placeholder="Total volumes (optional)"
                    className="rounded-xl border bg-white px-3 py-2.5 text-sm outline-none"
                  />
                  <textarea
                    value={newCollection.about}
                    onChange={(event) =>
                      setNewCollection((current) => ({
                        ...current,
                        about: event.target.value,
                      }))
                    }
                    placeholder="About the collection"
                    className="sm:col-span-2 w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none resize-none"
                  />
                </div>
              )}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                value={form.title}
                onChange={(event) => setField("title", event.target.value)}
                placeholder="e.g. Riyadh as-Salihin"
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                style={{ borderColor: "rgba(15, 118, 110, 0.2)" }}
              />
            </div>

            {bookType !== "volume" ? (
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Author <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.author}
                  onChange={(event) => setField("author", event.target.value)}
                  placeholder="e.g. Imam An-Nawawi"
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  style={{ borderColor: "rgba(15, 118, 110, 0.2)" }}
                />
              </div>
            ) : null}

            {bookType !== "volume" ? (
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.categoryId}
                  onChange={(event) =>
                    setField("categoryId", event.target.value)
                  }
                  className="w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  style={{ borderColor: "rgba(15, 118, 110, 0.2)" }}
                >
                  <option value="">Select category...</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Language
              </label>
              <select
                value={form.language}
                onChange={(event) => setField("language", event.target.value)}
                className="w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                style={{ borderColor: "rgba(15, 118, 110, 0.2)" }}
              >
                {languages.map((language) => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                ISBN
              </label>
              <input
                value={form.isbn}
                onChange={(event) => setField("isbn", event.target.value)}
                placeholder="e.g. 9786035000000"
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                style={{ borderColor: "rgba(15, 118, 110, 0.2)" }}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Publisher
              </label>
              <input
                value={form.publisher}
                onChange={(event) => setField("publisher", event.target.value)}
                placeholder="e.g. Darussalam"
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                style={{ borderColor: "rgba(15, 118, 110, 0.2)" }}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Publication Year
              </label>
              <input
                type="number"
                min="1"
                max={maxPublicationYear}
                value={form.publicationYear}
                onChange={(event) =>
                  setField("publicationYear", event.target.value)
                }
                placeholder="e.g. 2024"
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                style={{ borderColor: "rgba(15, 118, 110, 0.2)" }}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Number of Pages
              </label>
              <input
                type="number"
                min="1"
                value={form.pages}
                onChange={(event) => setField("pages", event.target.value)}
                placeholder="e.g. 512"
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                style={{ borderColor: "rgba(15, 118, 110, 0.2)" }}
              />
              <p className="mt-1 text-[11px] text-gray-400">
                Optional. Used as a fallback if the PDF page count cannot be
                detected automatically.
              </p>
            </div>

            {/* Volume Set removed — collection title will group volumes */}

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Volume Number
              </label>
              <input
                type="number"
                min="1"
                value={form.volumeNumber}
                onChange={(event) =>
                  setField("volumeNumber", event.target.value)
                }
                placeholder="e.g. 2"
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                style={{ borderColor: "rgba(15, 118, 110, 0.2)" }}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                Total Volumes
              </label>
              <input
                type="number"
                min="1"
                value={form.totalVolumes}
                onChange={(event) =>
                  setField("totalVolumes", event.target.value)
                }
                placeholder="e.g. 5"
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                style={{ borderColor: "rgba(15, 118, 110, 0.2)" }}
              />
            </div>

            {bookType !== "volume" ? (
              <>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Description
                  </label>
                  <textarea
                    rows="3"
                    value={form.description}
                    onChange={(event) =>
                      setField("description", event.target.value)
                    }
                    placeholder="Brief description of the book content..."
                    className="w-full resize-none rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                    style={{ borderColor: "rgba(15, 118, 110, 0.2)" }}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    About the Book
                  </label>
                  <textarea
                    rows="3"
                    value={form.about}
                    onChange={(event) => setField("about", event.target.value)}
                    placeholder="Detailed information about the book..."
                    className="w-full resize-none rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                    style={{ borderColor: "rgba(15, 118, 110, 0.2)" }}
                  />
                </div>
              </>
            ) : null}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.055)]">
            <h3 className="mb-3 text-sm font-bold text-secondary">
              PDF File{" "}
              {!editingId ? (
                <span className="text-[11px] text-red-500">*</span>
              ) : null}
            </h3>

            <div
              className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
                isDragOverPdf ? "bg-primary/5" : "bg-transparent"
              }`}
              style={{ borderColor: "rgba(15, 118, 110, 0.25)" }}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragOverPdf(true);
              }}
              onDragLeave={() => setIsDragOverPdf(false)}
              onDrop={(event) => handleDrop(event, "pdf")}
              onClick={() => pdfInputRef.current?.click()}
            >
              <Upload size={28} className="mx-auto mb-2 text-primary/60" />
              <p className="text-sm font-semibold text-secondary">
                Drop PDF here
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {editingId
                  ? "click to replace PDF - "
                  : "or click to browse - "}
                Max 100MB
              </p>
              {pdfFile ? (
                <p className="mt-3 truncate text-xs text-gray-600">
                  Selected file: {pdfFile.name}
                </p>
              ) : editingId && selectedBook?.pdfUrl ? (
                <p className="mt-3 truncate text-xs text-gray-600">
                  Existing PDF will be kept
                </p>
              ) : null}
              <input
                ref={pdfInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(event) =>
                  handleFileChange("pdf", event.target.files?.[0])
                }
              />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.055)]">
            <h3 className="mb-3 text-sm font-bold text-secondary">
              Cover Image
            </h3>

            <div
              className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
                isDragOverCover ? "bg-amber-50" : "bg-transparent"
              }`}
              style={{ borderColor: "rgba(212, 175, 55, 0.35)" }}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragOverCover(true);
              }}
              onDragLeave={() => setIsDragOverCover(false)}
              onDrop={(event) => handleDrop(event, "coverImage")}
              onClick={() => coverInputRef.current?.click()}
            >
              <Image size={28} className="mx-auto mb-2 text-amber-500/80" />
              <p className="text-sm font-semibold text-secondary">
                Drop image here
              </p>
              <p className="mt-1 text-xs text-gray-400">
                JPG, PNG - Recommended 400x600
              </p>
              {coverFile ? (
                <p className="mt-3 truncate text-xs text-gray-600">
                  Selected file: {coverFile.name}
                </p>
              ) : null}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(event) =>
                  handleFileChange("coverImage", event.target.files?.[0])
                }
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-2xl bg-primary px-8 py-3 text-base font-semibold text-white shadow-[0_4px_20px_rgba(15,118,110,0.3)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {editingId
              ? isEditingDraft
                ? "Publish Book"
                : "Update Book"
              : "Upload Book"}
          </button>
          <button
            type="button"
            onClick={(event) => handleSubmit(event, false)}
            disabled={isSubmitting}
            className="rounded-2xl border border-gray-200 px-8 py-3 text-base font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {editingId ? "Save to Draft" : "Save as Draft"}
          </button>
        </div>
      </form>
    </div>
  );
}
