import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Download,
  Globe,
  Headphones,
  Landmark,
  Languages,
  Library,
  Mail,
  MapPin,
  Quote,
  Search,
  Sparkles,
  Smartphone,
  Scale,
  Moon,
  MoonStar,
  Book,
  Clock,
  Users,
} from "lucide-react";
import BookCard from "../../components/BookCard.jsx";
import BooksCarousel from "../../components/BooksCarousel.jsx";
import SubscribeSection from "../../components/newsletter/SubscribeSection.jsx";
import {
  LIBRARY_LOGO_URL,
  LIBRARY_NAME,
  PUBLIC_EMAIL,
  PUBLIC_WEBSITE,
} from "../../config/branding.js";
import {
  downloadBook,
  fetchBooks,
  fetchLibraryStats,
} from "../../features/books/bookSlice.js";
import { fetchCategories } from "../../features/categories/categorySlice.js";
import Footer from "../../components/common/Footer.jsx";

function buildTrustedScholars(books) {
  const scholarMap = new Map();

  books.forEach((book) => {
    const authorName = getAuthorName(book);

    if (!authorName || authorName === "Unknown Author") {
      return;
    }

    const existing = scholarMap.get(authorName) || {
      name: authorName,
      count: 0,
      categories: new Map(),
    };
    const categoryName =
      book.category?.name || book.category || "Islamic Studies";

    existing.count += 1;
    existing.categories.set(
      categoryName,
      (existing.categories.get(categoryName) || 0) + 1,
    );
    scholarMap.set(authorName, existing);
  });

  return Array.from(scholarMap.values())
    .sort(
      (first, second) =>
        second.count - first.count || first.name.localeCompare(second.name),
    )
    .slice(0, 4)
    .map((scholar) => ({
      name: scholar.name,
      specialty: getTopCategory(scholar.categories),
      books: `${scholar.count} ${scholar.count === 1 ? "Book" : "Books"}`,
      initials: getInitials(scholar.name),
    }));
}

function getAuthorName(book) {
  return book.author?.name || book.author || "Unknown Author";
}

function getBookId(book) {
  return book.id || book._id || book.slug || book.title;
}

function getBookPath(book) {
  return `/book-details/${encodeURIComponent(book.slug || getBookId(book))}`;
}

function getReadPath(book) {
  return `/read/${encodeURIComponent(getBookId(book))}`;
}

function getTopCategory(categories) {
  return (
    Array.from(categories.entries()).sort(
      ([firstName, firstCount], [secondName, secondCount]) =>
        secondCount - firstCount || firstName.localeCompare(secondName),
    )[0]?.[0] || "Islamic Studies"
  );
}

function getInitials(name) {
  const words = name
    .replace(/[^a-zA-Z\s-]/g, "")
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) {
    return "IL";
  }

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function formatStat(value) {
  const number = Number(value) || 0;

  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(number >= 10000000 ? 0 : 1)}M`;
  }

  if (number >= 1000) {
    return `${(number / 1000).toFixed(number >= 10000 ? 0 : 1)}K`;
  }

  return String(number);
}

function getBookStats(stats, pagination, books, categories) {
  const fallbackAuthors = new Set(
    books
      .map((book) => getAuthorName(book))
      .filter((author) => author && author !== "Unknown Author"),
  ).size;
  const fallbackDownloads = books.reduce(
    (total, book) => total + Number(book.downloads || 0),
    0,
  );

  return {
    books: stats?.books ?? pagination?.total ?? books.length,
    authors: stats?.authors ?? fallbackAuthors,
    categories: stats?.categories ?? categories.length,
    downloads: stats?.downloads ?? fallbackDownloads,
  };
}

const categoryIcons = {
  library: Library,
  "book-open": BookOpen,
  scale: Scale,
  moon: Moon,
  sparkles: Sparkles,
  languages: Languages,
  landmark: Landmark,
  "moon-star": MoonStar,
  book: Book,
  "rotate-ccw-clock": Clock,
};

function getCategoryIconKey(category) {
  const fallback =
    category.slug || category.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return category.icon || fallback || "library";
}

function getCategoryIcon(category) {
  return categoryIcons[getCategoryIconKey(category)] || categoryIcons.library;
}

function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [scrollProgress, setScrollProgress] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    items: books,
    status: bookStatus,
    error: bookError,
    pagination,
    stats,
    statsStatus,
  } = useSelector((state) => state.books);
  const {
    items: categories,
    status: categoryStatus,
    error: categoryError,
  } = useSelector((state) => state.categories);

  const featuredBooks = useMemo(() => books.slice(0, 4), [books]);
  const trustedScholars = useMemo(() => buildTrustedScholars(books), [books]);
  const libraryStats = useMemo(
    () => getBookStats(stats, pagination, books, categories),
    [stats, pagination, books, categories],
  );

  useEffect(() => {
    if (bookStatus === "idle") {
      dispatch(fetchBooks({ limit: 24, isPublished: true }));
    }

    if (statsStatus === "idle") {
      dispatch(fetchLibraryStats());
    }

    if (categoryStatus === "idle") {
      dispatch(fetchCategories({ limit: 6 }));
    }
  }, [bookStatus, statsStatus, categoryStatus, dispatch]);

  useEffect(() => {
    const revealElements = Array.from(
      document.querySelectorAll(".scroll-reveal"),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.16,
      },
    );

    revealElements.forEach((element, index) => {
      element.style.setProperty(
        "--reveal-delay",
        `${Math.min(index % 4, 3) * 70}ms`,
      );
      observer.observe(element);
    });

    const updateScrollProgress = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(
        maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0,
      );
    };

    updateScrollProgress();
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("resize", updateScrollProgress);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", updateScrollProgress);
      window.removeEventListener("resize", updateScrollProgress);
    };
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchTerm.trim();
    navigate(query ? `/books?search=${encodeURIComponent(query)}` : "/books");
  };

  return (
    <main
      className="-mt-16 lg:-mt-20"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <div
        className="fixed left-0 right-0 top-0 z-[60] h-1 origin-left"
        style={{
          background:
            "linear-gradient(90deg, rgb(212, 175, 55), rgb(15, 118, 110))",
          transform: `scaleX(${scrollProgress})`,
        }}
      />
      <HeroSection
        navigate={navigate}
        stats={libraryStats}
        books={featuredBooks}
      />

      <section
        className="scroll-reveal relative py-16 overflow-hidden"
        style={{ backgroundColor: "rgb(248, 245, 240)" }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSearch} className="relative">
            <div
              className="flex items-center gap-3 bg-white rounded-3xl p-3"
              style={{
                border: "1px solid rgba(15, 118, 110, 0.14)",
                boxShadow: "rgba(15, 118, 110, 0.12) 0px 18px 48px",
              }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: "rgba(15, 118, 110, 0.08)",
                  color: "rgb(15, 118, 110)",
                }}
              >
                <Search size={22} />
              </div>
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search books, authors, or topics"
                className="w-full outline-none text-sm sm:text-base"
                style={{
                  fontFamily: "Inter, sans-serif",
                  color: "rgb(20, 83, 45)",
                }}
              />
              <button
                type="submit"
                className="px-5 sm:px-7 py-3 rounded-2xl text-sm font-semibold text-white transition-all hover:scale-105"
                style={{
                  backgroundColor: "rgb(15, 118, 110)",
                  fontFamily: "Poppins, sans-serif",
                  boxShadow: "rgba(15, 118, 110, 0.25) 0px 6px 20px",
                }}
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      <CategoriesSection
        categories={categories}
        status={categoryStatus}
        error={categoryError}
        navigate={navigate}
      />

      <section
        className="scroll-reveal relative py-20 overflow-hidden"
        style={{
          background: "rgb(248, 245, 240)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="Featured Books"
            title="Handpicked from the library"
            text="Selected books from the collection will appear here automatically as the library grows."
            centered
          />

          {bookStatus === "loading" ? (
            <SkeletonGrid />
          ) : bookError ? (
            <ErrorState message={bookError} />
          ) : featuredBooks.length ? (
            <BooksCarousel books={featuredBooks} navigate={navigate} />
          ) : (
            <EmptyState
              icon={<BookOpen size={30} />}
              title="No books found"
              text="Books from the backend will appear here when they are added."
            />
          )}
        </div>
      </section>

      <PopularScholars
        scholars={trustedScholars}
        status={bookStatus}
        error={bookError}
        navigate={navigate}
      />
      <ReadingMadeEasy />
      <ByTheNumbers stats={libraryStats} />
      <SubscribeSection />
      <Footer />
    </main>
  );
}

function HeroSection({ navigate, stats, books }) {
  const latestBooks = books.slice(0, 2);
  const bookCount = formatStat(stats.books);
  const authorCount = formatStat(stats.authors);
  const downloadCount = formatStat(stats.downloads);

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{
        background:
          "linear-gradient(145deg, rgb(248, 245, 240) 0%, rgb(255, 255, 255) 55%, rgb(236, 253, 245) 100%)",
      }}
    >
      <PatternBackground id="hero-pattern" size={72} opacity="0.045" />

      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgb(212, 175, 55) 40%, rgb(212, 175, 55) 60%, transparent)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-28 pb-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <div
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-8"
              style={{
                backgroundColor: "rgba(15, 118, 110, 0.08)",
                border: "1px solid rgba(15, 118, 110, 0.2)",
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: "rgb(212, 175, 55)" }}
              />
              <span
                dir="rtl"
                style={{
                  color: "rgb(15, 118, 110)",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 600,
                  fontSize: "13px",
                }}
              >
                {
                  "\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0647\u0650 \u0627\u0644\u0631\u064e\u0651\u062d\u0652\u0645\u0670\u0646\u0650 \u0627\u0644\u0631\u064e\u0651\u062d\u0650\u064a\u0652\u0645\u0650"
                }
              </span>
            </div>

            <h1
              className="text-4xl sm:text-5xl lg:text-[3.5rem] mb-5"
              style={{
                fontFamily: "Poppins, sans-serif",
                fontWeight: 800,
                color: "rgb(20, 83, 45)",
                lineHeight: 1.08,
                letterSpacing: 0,
              }}
            >
              Seek Knowledge.
              <br />
              <span style={{ color: "rgb(15, 118, 110)" }}>Read Anywhere.</span>
            </h1>

            <p
              className="mb-9 max-w-lg"
              style={{
                fontFamily: "Inter, sans-serif",
                color: "rgb(75, 85, 99)",
                lineHeight: 1.8,
                fontSize: "17px",
              }}
            >
              Access hundreds of authentic Islamic books from trusted authors,
              available to read online or download for free.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <button
                type="button"
                onClick={() => navigate("/books")}
                className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-base font-semibold text-white transition-all hover:scale-105"
                style={{
                  backgroundColor: "rgb(15, 118, 110)",
                  fontFamily: "Poppins, sans-serif",
                  boxShadow: "rgba(15, 118, 110, 0.35) 0px 6px 28px",
                }}
              >
                <BookOpen size={18} />
                Explore Books
              </button>
              <button
                type="button"
                onClick={() => navigate("/books")}
                className="flex items-center gap-2 px-7 py-3.5 rounded-2xl text-base font-semibold transition-all hover:scale-105"
                style={{
                  border: "2px solid rgb(15, 118, 110)",
                  color: "rgb(15, 118, 110)",
                  fontFamily: "Poppins, sans-serif",
                }}
              >
                <BookOpen size={18} />
                Read Online
              </button>
            </div>

            <div className="flex flex-wrap gap-8">
              <Stat value={bookCount} label="Authentic Books" />
              <Stat value={authorCount} label="Trusted Authors" />
              <Stat value={downloadCount} label="Downloads" />
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="relative w-full max-w-md aspect-square">
              <HeroFrame />
              <DecorativeBookTop book={latestBooks[0]} />
              <DecorativeBookBottom book={latestBooks[1] || latestBooks[0]} />
              <PhonePreview />
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 overflow-hidden"
        style={{ lineHeight: 0 }}
      >
        <svg
          viewBox="0 0 1440 72"
          fill="none"
          style={{ display: "block", width: "100%" }}
        >
          <path
            d="M0,36 C480,72 960,0 1440,36 L1440,72 L0,72 Z"
            fill="#F8F5F0"
          />
        </svg>
      </div>
    </section>
  );
}

function CategoriesSection({ categories, status, error, navigate }) {
  return (
    <section className="scroll-reveal relative py-20 bg-white overflow-hidden">
      <PatternBackground id="categories-pattern" size={72} opacity="0.035" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="Featured Categories"
          title="Explore by category"
          text="Categories from the backend will help organize books by topics like Tafsir, Hadith, Fiqh, Seerah, Arabic, and more."
          centered
        />

        {status === "loading" ? (
          <SkeletonGrid />
        ) : error ? (
          <ErrorState message={error} />
        ) : categories.length ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((category) => (
              <CategoryCard
                key={category.id || category._id || category.slug}
                category={category}
                navigate={navigate}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Library size={30} />}
            title="No categories found"
            text="There are no categories in the database right now."
          />
        )}
      </div>
    </section>
  );
}

function BooksSection({
  label,
  title,
  text,
  books,
  status,
  error,
  navigate,
  shaded = false,
}) {
  const dispatch = useDispatch();

  const handleDownload = async (book) => {
    const result = await dispatch(downloadBook(getBookId(book)));
    const pdfUrl = result.payload?.data?.pdfUrl || book.pdfUrl;
    if (pdfUrl) {
      window.open(pdfUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleRead = (book) => {
    navigate(getReadPath(book), { state: { book } });
  };

  return (
    <section
      className="scroll-reveal relative py-20 overflow-hidden"
      style={{
        background: shaded
          ? "linear-gradient(145deg, rgb(248, 245, 240) 0%, rgb(255, 255, 255) 100%)"
          : "rgb(248, 245, 240)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader label={label} title={title} text={text} centered />

        {status === "loading" ? (
          <SkeletonGrid />
        ) : error ? (
          <ErrorState message={error} />
        ) : books.length ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {books.map((book, index) => (
              <BookCard
                key={getBookId(book)}
                book={book}
                index={index}
                onOpen={() => navigate(getBookPath(book), { state: { book } })}
                onRead={handleRead}
                onDownload={handleDownload}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<BookOpen size={30} />}
            title="No books found"
            text="Books from the backend will appear here when they are added."
          />
        )}
      </div>
    </section>
  );
}

function CategoryCard({ category, navigate }) {
  const categorySlug =
    category.slug || category.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const target = categorySlug
    ? `/books?category=${encodeURIComponent(categorySlug)}`
    : "/books";
  const Icon = getCategoryIcon(category);

  return (
    <button
      type="button"
      onClick={() => navigate(target)}
      className="group h-full rounded-2xl bg-white p-5 text-left transition-all hover:-translate-y-0.5"
      style={{
        border: "1px solid rgba(15, 118, 110, 0.1)",
        boxShadow: "rgba(20, 83, 45, 0.06) 0px 6px 20px",
      }}
    >
      <Icon
        className="mb-4 transition-transform group-hover:scale-105"
        size={28}
        strokeWidth={1.8}
        style={{ color: "rgb(15, 118, 110)" }}
      />
      <div className="min-w-0">
        <h3
          className="mb-1"
          style={{
            color: "rgb(20, 83, 45)",
            fontFamily: "Poppins, sans-serif",
            fontWeight: 800,
            fontSize: "17px",
          }}
        >
          {category.name || "Untitled Category"}
        </h3>
        <p
          style={{
            color: "rgb(75, 85, 99)",
            fontFamily: "Inter, sans-serif",
            fontSize: "13px",
            lineHeight: 1.6,
          }}
        >
          {category.description || "Books in this category will appear here."}
        </p>
        <span
          className="mt-3 inline-flex text-xs font-semibold"
          style={{
            color: "rgb(15, 118, 110)",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          Browse {category.booksCount || 0} books
        </span>
      </div>
    </button>
  );
}

function PopularScholars({ scholars, status, error, navigate }) {
  return (
    <section className="scroll-reveal relative py-20 bg-white overflow-hidden">
      <PatternBackground id="scholars-pattern" size={80} opacity="0.028" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="Popular Scholars"
          title="Learn from trusted voices"
          text="Browse works from respected scholars whose books continue to guide students of knowledge across generations."
          centered
        />

        {status === "loading" ? (
          <SkeletonGrid />
        ) : error ? (
          <ErrorState message={error} />
        ) : scholars.length ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {scholars.map((scholar) => (
              <button
                key={scholar.name}
                type="button"
                onClick={() =>
                  navigate(`/books?author=${encodeURIComponent(scholar.name)}`)
                }
                className="bg-white rounded-2xl p-6 text-center transition-all hover:-translate-y-1"
                style={{
                  border: "1px solid rgba(15, 118, 110, 0.1)",
                  boxShadow: "rgba(20, 83, 45, 0.08) 0px 8px 28px",
                }}
              >
                <div
                  className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                  style={{
                    backgroundColor: "rgba(15, 118, 110, 0.08)",
                    color: "rgb(15, 118, 110)",
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 800,
                  }}
                >
                  {scholar.initials}
                </div>
                <h3
                  className="mb-1"
                  style={{
                    color: "rgb(20, 83, 45)",
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 800,
                    fontSize: "17px",
                  }}
                >
                  {scholar.name}
                </h3>
                <p
                  className="mb-3"
                  style={{
                    color: "rgb(75, 85, 99)",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "13px",
                  }}
                >
                  {scholar.specialty}
                </p>
                <span
                  className="inline-flex px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: "rgba(212, 175, 55, 0.14)",
                    color: "rgb(20, 83, 45)",
                    fontFamily: "Poppins, sans-serif",
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                >
                  {scholar.books}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Users size={30} />}
            title="No scholars found"
            text="Trusted scholars will appear here when books with author names are added."
          />
        )}
      </div>
    </section>
  );
}

function ReadingMadeEasy() {
  const features = [
    {
      icon: <Smartphone size={24} />,
      title: "Read on any device",
      text: "A clean reading experience for phones, tablets, and desktop screens.",
    },
    {
      icon: <Download size={24} />,
      title: "Download for later",
      text: "Keep beneficial books available when you are offline or travelling.",
    },
    {
      icon: <Search size={24} />,
      title: "Find topics faster",
      text: "Search by title, author, category, or subject without breaking focus.",
    },
    {
      icon: <Headphones size={24} />,
      title: "Study comfortably",
      text: "Organized metadata makes repeated reading and study easier to maintain.",
    },
  ];

  return (
    <section
      className="scroll-reveal relative py-20 overflow-hidden"
      style={{
        background:
          "linear-gradient(145deg, rgb(248, 245, 240) 0%, rgb(255, 255, 255) 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="Reading Made Easy"
          title="Everything shaped around focused study"
          text="The homepage points readers quickly toward books, categories, scholars, and reliable resources."
          centered
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="bg-white rounded-2xl p-6 text-center"
              style={{
                border: "1px solid rgba(15, 118, 110, 0.1)",
                boxShadow: "rgba(20, 83, 45, 0.08) 0px 8px 28px",
              }}
            >
              <div
                className="w-12 h-12 rounded-xl mx-auto mb-5 flex items-center justify-center"
                style={{
                  backgroundColor: "rgb(15, 118, 110)",
                  color: "white",
                }}
              >
                {feature.icon}
              </div>
              <h3
                className="mb-2"
                style={{
                  color: "rgb(20, 83, 45)",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 800,
                  fontSize: "17px",
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  color: "rgb(75, 85, 99)",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                  lineHeight: 1.75,
                }}
              >
                {feature.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ByTheNumbers({ stats }) {
  const numberStats = [
    [formatStat(stats.books), "Books"],
    [formatStat(stats.authors), "Authors"],
    [formatStat(stats.categories), "Categories"],
    ["100%", "Free Access"],
  ];

  return (
    <section
      className="scroll-reveal relative py-20 overflow-hidden"
      style={{ backgroundColor: "rgb(20, 83, 45)" }}
    >
      <PatternBackground
        id="numbers-pattern"
        size={54}
        opacity="0.08"
        stroke="white"
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label="By the Numbers"
          title="A growing library for every reader"
          text="Simple, accessible, and built to keep expanding as more beneficial books are added."
          centered
          dark
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {numberStats.map(([value, label]) => (
            <div
              key={label}
              className="rounded-2xl p-7 text-center"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
              }}
            >
              <p
                className="text-4xl mb-2"
                style={{
                  color: "rgb(212, 175, 55)",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 800,
                }}
              >
                {value}
              </p>
              <p
                style={{
                  color: "rgba(255, 255, 255, 0.76)",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HeroFrame() {
  return (
    <svg
      viewBox="0 0 420 420"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    >
      <polygon
        points="148,22 272,22 398,148 398,272 272,398 148,398 22,272 22,148"
        fill="rgba(15,118,110,0.04)"
        stroke="#0F766E"
        strokeWidth="1.5"
        strokeOpacity="0.25"
      />
      <polygon
        points="162,40 258,40 380,162 380,258 258,380 162,380 40,258 40,162"
        fill="none"
        stroke="#D4AF37"
        strokeWidth="1"
        strokeOpacity="0.35"
      />
      <polygon
        points="178,58 242,58 362,178 362,242 242,362 178,362 58,242 58,178"
        fill="none"
        stroke="#0F766E"
        strokeWidth="0.6"
        strokeOpacity="0.15"
      />
      <circle cx="210" cy="22" r="5" fill="#D4AF37" opacity="0.55" />
      <circle cx="398" cy="210" r="5" fill="#D4AF37" opacity="0.55" />
      <circle cx="210" cy="398" r="5" fill="#D4AF37" opacity="0.55" />
      <circle cx="22" cy="210" r="5" fill="#D4AF37" opacity="0.55" />
    </svg>
  );
}

function DecorativeBookTop({ book }) {
  const title = book?.title || LIBRARY_NAME;
  const author = book ? getAuthorName(book) : "Loading latest books";
  const category = book?.category?.name || book?.category || "Book";

  return (
    <div
      className="absolute top-6 right-2 w-36 bg-white rounded-2xl p-3 rotate-3 z-10"
      style={{ boxShadow: "rgba(15, 118, 110, 0.16) 0px 10px 36px" }}
    >
      <div
        className="w-full h-[72px] rounded-xl mb-2.5 relative overflow-hidden flex items-center justify-center"
        style={{ backgroundColor: "rgb(15, 118, 110)" }}
      >
        <PatternBackground
          id="gpr66gp"
          size={22}
          opacity="0.18"
          stroke="white"
        />
        <p
          className="relative z-10 text-white text-[10px] font-bold text-center px-2 leading-tight"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          {title}
        </p>
      </div>
      <p
        style={{
          fontFamily: "Poppins, sans-serif",
          fontWeight: 600,
          color: "rgb(20, 83, 45)",
          fontSize: "10px",
        }}
      >
        {author}
      </p>
      <p
        className="mt-1 truncate"
        style={{ fontSize: "9px", color: "rgb(107, 114, 128)" }}
      >
        {category}
      </p>
    </div>
  );
}

function DecorativeBookBottom({ book }) {
  const title = book?.title || "Recently Added";
  const author = book ? getAuthorName(book) : "Loading latest books";
  const pages = book?.pages ? `${book.pages} pages` : "Available online";

  return (
    <div
      className="absolute bottom-12 left-2 w-40 bg-white rounded-2xl p-3 -rotate-2 z-10"
      style={{ boxShadow: "rgba(20, 83, 45, 0.16) 0px 10px 36px" }}
    >
      <div
        className="w-full h-20 rounded-xl mb-2.5 relative overflow-hidden flex items-center justify-center"
        style={{ backgroundColor: "rgb(20, 83, 45)" }}
      >
        <PatternBackground
          id="gpr6mgp"
          size={22}
          opacity="0.18"
          stroke="white"
        />
        <p
          className="relative z-10 text-white text-[10px] font-bold text-center px-2 leading-tight"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          {title}
        </p>
      </div>
      <p
        style={{
          fontFamily: "Poppins, sans-serif",
          fontWeight: 600,
          color: "rgb(20, 83, 45)",
          fontSize: "10px",
        }}
      >
        {author}
      </p>
      <p
        className="mt-0.5"
        style={{ color: "rgb(156, 163, 175)", fontSize: "9px" }}
      >
        {pages}
      </p>
    </div>
  );
}

function PhonePreview() {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-20">
      <div
        className="w-44 h-[240px] rounded-3xl overflow-hidden"
        style={{
          backgroundColor: "rgb(255, 255, 255)",
          boxShadow: "rgba(15, 118, 110, 0.22) 0px 32px 72px",
          border: "1px solid rgba(15, 118, 110, 0.12)",
        }}
      >
        <div className="h-8 flex items-center px-3 border-b border-gray-100">
          <div className="flex gap-1 mr-auto">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
          </div>
          <BookOpen size={9} style={{ color: "rgb(15, 118, 110)" }} />
        </div>

        <div className="p-4">
          <p
            className="text-center font-bold text-[#14532D] text-[9px] mb-2"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            {LIBRARY_NAME}
          </p>
          <ProgressLine width="70%" color="rgb(15, 118, 110)" />
          <ProgressLine width="90%" color="rgb(15, 118, 110)" />
          <ProgressLine width="65%" color="rgb(212, 175, 55)" />
          <ProgressLine width="85%" color="rgb(229, 231, 235)" />
          <ProgressLine width="55%" color="rgb(229, 231, 235)" />
          <ProgressLine width="75%" color="rgb(229, 231, 235)" />

          <div className="mt-3 flex gap-1.5">
            <div
              className="flex-1 h-7 rounded-xl flex items-center justify-center text-white text-[9px] font-bold"
              style={{ backgroundColor: "rgb(15, 118, 110)" }}
            >
              Read
            </div>
            <div
              className="flex-1 h-7 rounded-xl flex items-center justify-center text-[9px] font-bold"
              style={{
                border: "1.5px solid rgb(15, 118, 110)",
                color: "rgb(15, 118, 110)",
              }}
            >
              Save
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ label, title, text, centered = false, dark = false }) {
  return (
    <div className={`max-w-2xl mb-9 ${centered ? "mx-auto text-center" : ""}`}>
      <p
        className="mb-3"
        style={{
          color: dark ? "rgb(212, 175, 55)" : "rgb(15, 118, 110)",
          fontFamily: "Poppins, sans-serif",
          fontWeight: 700,
          fontSize: "13px",
        }}
      >
        {label}
      </p>
      <h2
        className="text-3xl sm:text-4xl mb-3"
        style={{
          fontFamily: "Poppins, sans-serif",
          fontWeight: 800,
          color: dark ? "white" : "rgb(20, 83, 45)",
          lineHeight: 1.12,
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontFamily: "Inter, sans-serif",
          color: dark ? "rgba(255, 255, 255, 0.72)" : "rgb(75, 85, 99)",
          lineHeight: 1.8,
          fontSize: "16px",
        }}
      >
        {text}
      </p>
    </div>
  );
}

function EmptyState({ icon, title, text }) {
  return (
    <div
      className="rounded-3xl p-8 sm:p-10 text-center bg-white"
      style={{
        border: "1px dashed rgba(15, 118, 110, 0.28)",
        boxShadow: "rgba(15, 118, 110, 0.08) 0px 10px 32px",
      }}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
        style={{
          color: "rgb(15, 118, 110)",
          backgroundColor: "rgba(15, 118, 110, 0.08)",
        }}
      >
        {icon}
      </div>
      <h3
        className="text-xl mb-2"
        style={{
          fontFamily: "Poppins, sans-serif",
          fontWeight: 800,
          color: "rgb(20, 83, 45)",
        }}
      >
        {title}
      </h3>
      <p
        className="max-w-xl mx-auto"
        style={{
          fontFamily: "Inter, sans-serif",
          color: "rgb(75, 85, 99)",
          lineHeight: 1.8,
          fontSize: "15px",
        }}
      >
        {text}
      </p>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="rounded-3xl p-8 bg-white border border-red-100 text-center">
      <p
        className="font-semibold text-red-600"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        {message || "Something went wrong while loading data."}
      </p>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="bg-white rounded-2xl p-5 animate-pulse">
          <div className="h-36 rounded-xl bg-gray-200 mb-4" />
          <div className="h-3 rounded-full bg-gray-200 w-2/3 mb-3" />
          <div className="h-3 rounded-full bg-gray-200 w-full mb-2" />
          <div className="h-3 rounded-full bg-gray-200 w-1/2" />
        </div>
      ))}
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

function ProgressLine({ width, color }) {
  return (
    <div
      className="h-1.5 rounded-full mb-2"
      style={{ width, backgroundColor: color }}
    />
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <p
        style={{
          fontFamily: "Poppins, sans-serif",
          fontWeight: 800,
          color: "rgb(15, 118, 110)",
          fontSize: "22px",
          lineHeight: 1,
        }}
      >
        {value}
      </p>
      <p
        style={{
          color: "rgb(107, 114, 128)",
          fontSize: "12px",
          fontFamily: "Inter, sans-serif",
          marginTop: "4px",
        }}
      >
        {label}
      </p>
    </div>
  );
}

export default Home;
