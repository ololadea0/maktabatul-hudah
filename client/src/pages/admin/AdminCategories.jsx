import { useEffect, useState } from "react";
import {
  BookOpen,
  Edit2,
  Landmark,
  Languages,
  Library,
  Moon,
  Plus,
  Scale,
  Sparkles,
  Trash2,
  MoonStar,
  Book,
  Clock,
  BookMarked,
  ShieldCheck,
  Heart,
  HeartHandShake,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from "../../features/categories/categorySlice.js";

const emptyCategory = { name: "", description: "", icon: "library" };

const categoryIcons = {
  library: { Icon: Library },
  "book-open": { Icon: BookOpen },
  scale: { Icon: Scale },
  moon: { Icon: Moon },
  sparkles: { Icon: Sparkles },
  languages: { Icon: Languages },
  landmark: { Icon: Landmark },
  "moon-star": { Icon: MoonStar },
  book: { Icon: Book },
  "rotate-ccw-clock": { Icon: Clock },
  "book-marked": { Icon: BookMarked },
  "shield-check": { Icon: ShieldCheck },
  heart: { Icon: Heart },
};

const getCategoryIconKey = (category) => {
  const fallback =
    category.slug || category.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return category.icon || fallback || "library";
};

const getIconOption = (key) => categoryIcons[key] || categoryIcons.library;

const getBooksCount = (category) =>
  category.booksCount || category._count?.books || 0;

export default function AdminCategories() {
  const dispatch = useDispatch();
  const {
    items: categories,
    status,
    error,
  } = useSelector((state) => state.categories);
  const [form, setForm] = useState(emptyCategory);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      icon: form.icon,
    };

    try {
      if (editingId) {
        await dispatch(updateCategory({ id: editingId, payload })).unwrap();
        toast.success("Category updated");
      } else {
        await dispatch(createCategory(payload)).unwrap();
        toast.success("Category created");
      }
      dispatch(fetchCategories());
      setEditingId(null);
      setForm(emptyCategory);
    } catch (submitError) {
      toast.error(submitError);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setForm({
      name: category.name || "",
      description: category.description || "",
      icon: getCategoryIconKey(category),
    });
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Delete "${category.name}"?`)) return;
    try {
      await dispatch(deleteCategory(category.id)).unwrap();
      toast.success("Category deleted");
    } catch (deleteError) {
      toast.error(deleteError);
    }
  };

  return (
    <div className="space-y-5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-bold text-secondary">
            Categories
          </h1>
          <p className="text-xs text-gray-400">
            Manage book categories{" "}
            <code className="rounded bg-gray-100 px-1 py-0.5 text-xs text-gray-500">
              GET /api/categories
            </code>
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingId(null);
            setForm(emptyCategory);
          }}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-display text-sm font-semibold text-white shadow-[0_2px_12px_rgba(15,118,110,0.3)]"
        >
          <Plus size={15} />
          Add Category
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-primary/15 bg-white p-5 shadow-[0_4px_20px_rgba(15,118,110,0.1)]"
      >
        <h2 className="mb-4 font-display text-sm font-bold text-secondary">
          {editingId ? "Edit Category" : "New Category"}
        </h2>
        <div className="grid gap-3 lg:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              Name
            </span>
            <input
              className="w-full rounded-xl border border-primary/20 px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              placeholder="e.g. Usul al-Fiqh"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              required
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              Description
            </span>
            <input
              className="w-full rounded-xl border border-primary/20 px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              placeholder="Short description"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
            />
          </label>
        </div>

        <div className="mt-4">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Icon
          </span>
          <div className="grid gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {Object.entries(categoryIcons).map(([key, { label, Icon }]) => {
              const isSelected = form.icon === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    setForm((current) => ({ ...current, icon: key }))
                  }
                  className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-colors ${
                    isSelected
                      ? "border-primary bg-primary text-white"
                      : "border-primary/15 bg-primary/5 text-primary hover:bg-primary/10"
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            className="rounded-xl bg-primary px-5 py-2 font-display text-sm font-semibold text-white"
          >
            {editingId ? "Update Category" : "Save Category"}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm(emptyCategory);
            }}
            className="rounded-xl border border-gray-200 px-5 py-2 font-display text-sm font-semibold text-gray-500"
          >
            Cancel
          </button>
        </div>
      </form>

      {status === "failed" ? (
        <p className="rounded-xl bg-red-50 px-5 py-4 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const booksCount = getBooksCount(category);
          const maxCount = Math.max(...categories.map(getBooksCount), 1);
          const progress = Math.max(
            (booksCount / maxCount) * 100,
            booksCount ? 8 : 0,
          );
          const { Icon } = getIconOption(getCategoryIconKey(category));

          return (
            <div
              key={category.id}
              className="rounded-2xl border border-primary/[0.07] bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.055)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,118,110,0.12)]"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon size={24} />
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    aria-label="Edit category"
                    onClick={() => handleEdit(category)}
                    className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-secondary"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    type="button"
                    aria-label="Delete category"
                    onClick={() => handleDelete(category)}
                    className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-50"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <h3 className="font-display text-[15px] font-bold text-secondary">
                {category.name}
              </h3>
              <p className="mt-0.5 text-[11px] text-gray-400">
                {category.description || "No description yet."}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-display text-sm font-semibold text-primary">
                  {booksCount} {booksCount === 1 ? "book" : "books"}
                </span>
                <div className="ml-3 h-1.5 flex-1 rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
