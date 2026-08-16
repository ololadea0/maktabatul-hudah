import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Filter,
  Grid3X3,
  Library,
  List,
  Search,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import BookCard from "../../components/BookCard.jsx";
import CollectionCard from "../../components/collections/CollectionCard.jsx";
import { fetchBooks } from "../../features/books/bookSlice.js";
import { fetchCategories } from "../../features/categories/categorySlice.js";
import { selectAuth } from "../../features/auth/authSlice.js";
import { fetchSavedBooks } from "../../features/savedBooks/savedBookSlice.js";

const languages = ["All", "Arabic", "English", "Arabic / English"];
const fileTypes = ["All", "PDF", "EPUB"];
const sortOptions = [
  "Most Popular",
  "Newest First",
  "Most Downloaded",
];
const getBookId = (book) => book.id || book._id || book.slug || book.title;
const getCategorySlug = (category) =>
  category.slug || category.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const getBookPath = (book) =>
  book.type === "collection"
    ? `/collections/${encodeURIComponent(getBookId(book))}`
    : `/book-details/${encodeURIComponent(book.slug || getBookId(book))}`;
const getReadPath = (book) => `/read/${encodeURIComponent(getBookId(book))}`;

export default function Books() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const routeParams = useParams();
  const [searchParams] = useSearchParams();
  const routeCategory = routeParams.categorySlug;
  const activeSearch = searchParams.get("search") || "";
  const activeAuthor = searchParams.get("author") || "";
  const activeCategory = routeCategory || searchParams.get("category") || "all";
  const activeLanguage = searchParams.get("language") || "All";
  const activePage = Number(searchParams.get("page")) || 1;
  const [search, setSearch] = useState(activeSearch);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("Newest First");
  const {
    items: books,
    status,
    error,
    pagination,
  } = useSelector((state) => state.books);
  const { isAuthenticated } = useSelector(selectAuth);
  const savedBooksStatus = useSelector((state) => state.savedBooks.status);
  const { items: categories, status: categoryStatus } = useSelector(
    (state) => state.categories,
  );

  useEffect(() => {
    if (categoryStatus === "idle") {
      dispatch(fetchCategories());
    }
  }, [categoryStatus, dispatch]);

  useEffect(() => {
    if (isAuthenticated && savedBooksStatus === "idle") {
      dispatch(fetchSavedBooks());
    }
  }, [dispatch, isAuthenticated, savedBooksStatus]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(activeSearch);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [activeSearch]);

  useEffect(() => {
    const nextSearch = search.trim();

    if (nextSearch === activeSearch) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      const next = new URLSearchParams(searchParams);

      if (routeCategory) {
        next.set("category", routeCategory);
      }

      if (nextSearch) {
        next.set("search", nextSearch);
        next.delete("author");
      } else {
        next.delete("search");
      }

      next.delete("page");

      const query = next.toString();
      navigate(query ? `/books?${query}` : "/books");
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [activeSearch, navigate, routeCategory, search, searchParams]);

  useEffect(() => {
    const params = { limit: 12, page: activePage, isPublished: true };
    if (activeSearch) params.search = activeSearch;
    if (activeAuthor) params.author = activeAuthor;
    if (activeCategory && activeCategory !== "all")
      params.categorySlug = activeCategory;
    if (activeLanguage && activeLanguage !== "All")
      params.language = activeLanguage;
    dispatch(fetchBooks(params));
  }, [
    dispatch,
    activeSearch,
    activeAuthor,
    activeCategory,
    activeLanguage,
    activePage,
  ]);

  const selectedCategory = useMemo(
    () =>
      categories.find(
        (category) => getCategorySlug(category) === activeCategory,
      ),
    [categories, activeCategory],
  );

  const sortedBooks = useMemo(() => {
    const nextBooks = [...books];
    if (sortBy === "Most Popular" || sortBy === "Most Downloaded") {
      return nextBooks.sort(
        (first, second) => (second.downloads || 0) - (first.downloads || 0),
      );
    }
    return nextBooks;
  }, [books, sortBy]);

  const resultTotal = pagination?.total ?? books.length;
  const totalPages = pagination?.totalPages || 1;

  const navigateWithFilters = (updates) => {
    const next = new URLSearchParams(searchParams);
    if (routeCategory) {
      next.set("category", routeCategory);
    }

    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "all" || value === "All") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });

    if (!updates.page) {
      next.delete("page");
    }

    const query = next.toString();
    navigate(query ? `/books?${query}` : "/books");
  };

  const handleSearch = (event) => {
    event.preventDefault();
    navigateWithFilters({ search: search.trim(), author: "" });
  };

  const handleRead = (book) => {
    navigate(getReadPath(book), { state: { book } });
  };

  const clearFilters = () => {
    setSearch("");
    navigate("/books");
  };

  return (
    <main
      className="min-h-screen pb-20 lg:pb-0"
      style={{ backgroundColor: "rgb(248, 245, 240)" }}
    >
      <CatalogHeader
        navigate={navigate}
        category={selectedCategory}
        author={activeAuthor}
        search={activeSearch}
      />

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex gap-6">
          <FilterSidebar
            categories={categories}
            activeCategory={activeCategory}
            activeLanguage={activeLanguage}
            sortBy={sortBy}
            setSortBy={setSortBy}
            onCategoryChange={(category) => navigateWithFilters({ category })}
            onLanguageChange={(language) => navigateWithFilters({ language })}
          />

          <section className="min-w-0 flex-1">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <form
                onSubmit={handleSearch}
                className="relative min-w-40 flex-1"
              >
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search books..."
                  className="w-full rounded-xl border bg-white py-2.5 text-sm outline-none"
                  style={{
                    paddingLeft: "38px",
                    paddingRight: "14px",
                    borderColor: "rgba(15, 118, 110, 0.14)",
                    fontFamily: "Inter, sans-serif",
                  }}
                />
              </form>

              <div
                className="flex items-center gap-1 rounded-xl bg-white p-1"
                style={{ border: "1px solid rgba(15, 118, 110, 0.14)" }}
              >
                <ViewButton
                  active={viewMode === "grid"}
                  onClick={() => setViewMode("grid")}
                  label="Grid view"
                >
                  <Grid3X3 size={14} />
                </ViewButton>
                <ViewButton
                  active={viewMode === "list"}
                  onClick={() => setViewMode("list")}
                  label="List view"
                >
                  <List size={14} />
                </ViewButton>
              </div>

              <button
                type="button"
                className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-primary lg:hidden"
                style={{
                  border: "1px solid rgba(15, 118, 110, 0.14)",
                  fontFamily: "Poppins, sans-serif",
                }}
              >
                <span className="inline-flex items-center gap-2">
                  <Filter size={14} />
                  Filters
                </span>
              </button>
            </div>

            <MobileFilters
              categories={categories}
              activeCategory={activeCategory}
              activeLanguage={activeLanguage}
              onCategoryChange={(category) => navigateWithFilters({ category })}
              onLanguageChange={(language) => navigateWithFilters({ language })}
            />

            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2
                  style={{
                    color: "rgb(20, 83, 45)",
                    fontFamily: "Poppins, sans-serif",
                    fontSize: "22px",
                    fontWeight: 800,
                  }}
                >
                  {selectedCategory?.name ||
                    activeAuthor ||
                    activeSearch ||
                    "All Books"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {status === "loading"
                    ? "Loading books..."
                    : `${resultTotal} matching ${resultTotal === 1 ? "book" : "books"}`}
                </p>
              </div>
              {activeSearch ||
              activeAuthor ||
              activeCategory !== "all" ||
              activeLanguage !== "All" ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-xl border border-primary/20 bg-white px-4 py-2 text-sm font-semibold text-primary"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Clear filters
                </button>
              ) : null}
            </div>

            {status === "failed" ? (
              <p className="rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-600">
                {error}
              </p>
            ) : status === "loading" ? (
              <BookSkeletonGrid />
            ) : sortedBooks.length ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
                    : "space-y-4"
                }
              >
                {sortedBooks.map((book, index) =>
                  book.type === "collection" ? (
                    <CollectionCard
                      key={getBookId(book)}
                      collection={book}
                      index={index}
                      viewMode={viewMode}
                      onOpen={() => navigate(getBookPath(book), { state: { collection: book } })}
                    />
                  ) : (
                    <BookCard
                      key={getBookId(book)}
                      book={book}
                      index={index}
                      viewMode={viewMode}
                      onOpen={() => navigate(getBookPath(book), { state: { book } })}
                      onRead={handleRead}
                    />
                  ),
                )}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-primary/30 bg-white p-10 text-center">
                <Library size={34} className="mx-auto mb-4 text-primary" />
                <h3 className="font-display text-xl font-bold text-secondary">
                  No books found
                </h3>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-gray-500">
                  Try another search term or clear the category filter.
                </p>
              </div>
            )}

            {totalPages > 1 ? (
              <Pagination
                page={pagination?.page || activePage}
                totalPages={totalPages}
                onPageChange={(page) => navigateWithFilters({ page })}
              />
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}

function CatalogHeader({ navigate, category, author, search }) {
  return (
    <header
      className="relative overflow-hidden px-4 pb-8 pt-6"
      style={{
        background:
          "linear-gradient(135deg, rgb(20, 83, 45), rgb(15, 118, 110))",
      }}
    >
      <PatternBackground
        id="books-header-pattern"
        size={64}
        opacity="0.07"
        stroke="white"
      />
      <div className="relative z-10 mx-auto max-w-7xl">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mb-4 flex items-center gap-2 text-sm transition-colors"
          style={{
            color: "rgba(255, 255, 255, 0.65)",
            fontFamily: "Inter, sans-serif",
          }}
        >
          <ArrowLeft size={14} />
          Back to Home
        </button>
        <h1
          className="mb-1"
          style={{
            color: "white",
            fontFamily: "Poppins, sans-serif",
            fontSize: "32px",
            fontWeight: 800,
          }}
        >
          {category?.name || author || search || "Islamic Library"}
        </h1>
        <p style={{ color: "rgba(255, 255, 255, 0.68)", fontSize: "15px" }}>
          Browse our complete collection of authentic Islamic books
        </p>
      </div>
    </header>
  );
}

function FilterSidebar({
  categories,
  activeCategory,
  activeLanguage,
  sortBy,
  setSortBy,
  onCategoryChange,
  onLanguageChange,
}) {
  return (
    <aside className="hidden w-56 flex-shrink-0 lg:block">
      <div
        className="sticky top-24 rounded-2xl bg-white p-5"
        style={{ boxShadow: "rgba(0, 0, 0, 0.06) 0px 4px 20px" }}
      >
        <div className="mb-5 flex items-center gap-2">
          <Filter size={14} style={{ color: "rgb(15, 118, 110)" }} />
          <h3
            style={{
              color: "rgb(20, 83, 45)",
              fontFamily: "Poppins, sans-serif",
              fontSize: "14px",
              fontWeight: 700,
            }}
          >
            Filters
          </h3>
        </div>

        <FilterGroup title="Category">
          <FilterOption
            active={activeCategory === "all"}
            onClick={() => onCategoryChange("all")}
            accented
          >
            All
          </FilterOption>
          {categories.map((category) => {
            const slug = getCategorySlug(category);
            return (
              <FilterOption
                key={category.id || slug}
                active={activeCategory === slug}
                onClick={() => onCategoryChange(slug)}
                accented
              >
                {category.name}
              </FilterOption>
            );
          })}
        </FilterGroup>

        <FilterGroup title="Language">
          {languages.map((language) => (
            <FilterOption
              key={language}
              active={activeLanguage === language}
              onClick={() => onLanguageChange(language)}
            >
              {language}
            </FilterOption>
          ))}
        </FilterGroup>

        <FilterGroup title="File Type">
          {fileTypes.map((type) => (
            <FilterOption key={type} active={type === "All"} onClick={() => {}}>
              {type}
            </FilterOption>
          ))}
        </FilterGroup>

        <div>
          <FilterTitle>Sort By</FilterTitle>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none"
            style={{
              borderColor: "rgba(15, 118, 110, 0.18)",
              color: "rgb(55, 65, 81)",
            }}
          >
            {sortOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>
    </aside>
  );
}

function MobileFilters({
  categories,
  activeCategory,
  activeLanguage,
  onCategoryChange,
  onLanguageChange,
}) {
  return (
    <div className="mb-5 space-y-3 lg:hidden">
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Chip
          active={activeCategory === "all"}
          onClick={() => onCategoryChange("all")}
        >
          All
        </Chip>
        {categories.map((category) => {
          const slug = getCategorySlug(category);
          return (
            <Chip
              key={category.id || slug}
              active={activeCategory === slug}
              onClick={() => onCategoryChange(slug)}
            >
              {category.name}
            </Chip>
          );
        })}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {languages.map((language) => (
          <Chip
            key={language}
            active={activeLanguage === language}
            onClick={() => onLanguageChange(language)}
          >
            {language}
          </Chip>
        ))}
      </div>
    </div>
  );
}

function FilterGroup({ title, children }) {
  return (
    <div className="mb-5">
      <FilterTitle>{title}</FilterTitle>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function FilterTitle({ children }) {
  return (
    <p
      className="mb-2 uppercase"
      style={{
        color: "rgb(156, 163, 175)",
        fontFamily: "Poppins, sans-serif",
        fontSize: "10px",
        fontWeight: 600,
        letterSpacing: "0.1em",
      }}
    >
      {children}
    </p>
  );
}

function FilterOption({ active, onClick, accented = false, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl px-3 py-2 text-left text-sm transition-all"
      style={{
        backgroundColor: active ? "rgba(15, 118, 110, 0.09)" : "transparent",
        borderLeft:
          accented && active
            ? "3px solid rgb(15, 118, 110)"
            : "3px solid transparent",
        color: active ? "rgb(15, 118, 110)" : "rgb(107, 114, 128)",
        fontWeight: active ? 600 : 400,
      }}
    >
      {children}
    </button>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold"
      style={{
        backgroundColor: active ? "rgb(15, 118, 110)" : "white",
        color: active ? "white" : "rgb(107, 114, 128)",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      {children}
    </button>
  );
}

function ViewButton({ active, onClick, label, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="rounded-lg p-2 transition-colors"
      style={{
        backgroundColor: active ? "rgb(15, 118, 110)" : "transparent",
        color: active ? "white" : "rgb(156, 163, 175)",
      }}
    >
      {children}
    </button>
  );
}

function BookSkeletonGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 9 }).map((_, index) => (
        <div key={index} className="h-80 animate-pulse rounded-2xl bg-white" />
      ))}
    </div>
  );
}

function Pagination({ page, totalPages, onPageChange }) {
  const pages = Array.from(
    { length: Math.min(totalPages, 5) },
    (_, index) => index + 1,
  );

  return (
    <div className="mt-10 flex items-center justify-center gap-2">
      {pages.map((pageNumber) => (
        <button
          key={pageNumber}
          type="button"
          onClick={() => onPageChange(pageNumber)}
          className="h-9 w-9 rounded-xl text-sm font-medium transition-colors"
          style={{
            backgroundColor:
              page === pageNumber ? "rgb(15, 118, 110)" : "white",
            boxShadow: "rgba(0, 0, 0, 0.06) 0px 2px 8px",
            color: page === pageNumber ? "white" : "rgb(107, 114, 128)",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          {pageNumber}
        </button>
      ))}
      {page < totalPages ? (
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          className="flex h-9 items-center gap-1 rounded-xl bg-white px-4 text-sm font-medium"
          style={{
            boxShadow: "rgba(0, 0, 0, 0.06) 0px 2px 8px",
            color: "rgb(107, 114, 128)",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          Next
          <ChevronRight size={13} />
        </button>
      ) : null}
    </div>
  );
}

function PatternBackground({ id, size, opacity, stroke = "#0F766E" }) {
  const center = size / 2;

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      <svg width="100%" height="100%">
        <defs>
          <pattern
            id={id}
            x="0"
            y="0"
            width={size}
            height={size}
            patternUnits="userSpaceOnUse"
          >
            <polygon
              points={`${center},${size * 0.13} ${size * 0.57},${size * 0.37} ${size * 0.79},${size * 0.25} ${size * 0.63},${size * 0.44} ${size * 0.87},${center} ${size * 0.63},${size * 0.56} ${size * 0.79},${size * 0.75} ${size * 0.57},${size * 0.63} ${center},${size * 0.87} ${size * 0.43},${size * 0.63} ${size * 0.21},${size * 0.75} ${size * 0.37},${size * 0.56} ${size * 0.13},${center} ${size * 0.37},${size * 0.44} ${size * 0.21},${size * 0.25} ${size * 0.43},${size * 0.37}`}
              fill="none"
              stroke={stroke}
              strokeWidth="0.9"
            />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill={`url(#${id})`}
          opacity={opacity}
        />
      </svg>
    </div>
  );
}
