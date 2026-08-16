import { useEffect, useMemo } from "react";
import { ArrowLeft, BookOpen, Download, Layers, Share2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  downloadBook,
  fetchBookById,
  fetchBookBySlug,
  fetchBooks,
} from "../../features/books/bookSlice.js";
import SaveBookButton from "../../components/SaveBookButton.jsx";

const coverColors = [
  "rgb(15, 118, 110)",
  "rgb(20, 83, 45)",
  "rgb(124, 58, 237)",
  "rgb(180, 83, 9)",
  "rgb(29, 78, 216)",
  "rgb(67, 56, 202)",
];

const getBookId = (book) => book?.id || book?._id || book?.slug || book?.title;
const getAuthorName = (book) =>
  book?.author?.name || book?.author || "Unknown Author";
const getCategoryName = (book) =>
  book?.category?.name || book?.category || "Islamic Book";
const getCategorySlug = (book) =>
  book?.category?.slug ||
  getCategoryName(book)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
const getBookPath = (book) =>
  `/book-details/${encodeURIComponent(book.slug || getBookId(book))}`;

export default function BookDetail() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { bookSlug } = useParams();
  const {
    items: books,
    selectedBook,
    selectedStatus,
    error,
  } = useSelector((state) => state.books);

  const selectedMatches =
    selectedBook &&
    (selectedBook.slug === bookSlug ||
      String(getBookId(selectedBook)) === bookSlug);
  const seededBook =
    location.state?.book &&
    (location.state.book.slug === bookSlug ||
      String(getBookId(location.state.book)) === bookSlug)
      ? location.state.book
      : null;
  const book = selectedMatches ? selectedBook : seededBook;

  useEffect(() => {
    let isMounted = true;

    const loadBook = async () => {
      const slugResult = await dispatch(fetchBookBySlug(bookSlug));
      if (isMounted && fetchBookBySlug.rejected.match(slugResult)) {
        dispatch(fetchBookById(bookSlug));
      }
    };

    loadBook();
    return () => {
      isMounted = false;
    };
  }, [bookSlug, dispatch]);

  useEffect(() => {
    if (!books.length) {
      dispatch(fetchBooks({ limit: 8 }));
    }
  }, [books.length, dispatch]);

  const relatedBooks = useMemo(() => {
    if (!book) return [];
    const currentId = getBookId(book);
    const categorySlug = getCategorySlug(book);
    return books
      .filter((item) => getBookId(item) !== currentId)
      .sort((first, second) => {
        const firstMatch = getCategorySlug(first) === categorySlug ? 1 : 0;
        const secondMatch = getCategorySlug(second) === categorySlug ? 1 : 0;
        return secondMatch - firstMatch;
      })
      .slice(0, 4);
  }, [book, books]);

  const handleDownload = async () => {
    if (!book) return;
    const result = await dispatch(downloadBook(getBookId(book)));
    const pdfUrl = result.payload?.data?.pdfUrl || book.pdfUrl;
    if (pdfUrl) {
      window.open(pdfUrl, "_blank", "noopener,noreferrer");
      return;
    }
    toast.info("No PDF URL is available for this book yet.");
  };

  const handleReadOnline = () => {
    if (!book) return;
    navigate(`/read/${encodeURIComponent(getBookId(book))}`);
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: book.title, url: shareUrl });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Book link copied");
    } catch {
      toast.error("Unable to share this book right now.");
    }
  };

  if (selectedStatus === "loading" && !book) {
    return (
      <main
        className="min-h-screen pb-20 lg:pb-0"
        style={{ backgroundColor: "rgb(248, 245, 240)" }}
      >
        <DetailHeader navigate={navigate} />
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="h-96 animate-pulse rounded-2xl bg-white" />
        </div>
      </main>
    );
  }

  if (!book && selectedStatus === "failed") {
    return (
      <main
        className="min-h-screen pb-20 lg:pb-0"
        style={{ backgroundColor: "rgb(248, 245, 240)" }}
      >
        <DetailHeader navigate={navigate} />
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="rounded-2xl bg-white p-8 text-center shadow-[0_4px_20px_rgba(0,0,0,0.055)]">
            <h1 className="font-display text-xl font-bold text-secondary">
              Book not found
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              {error || "This book could not be loaded."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const title = book?.title || "Untitled Book";
  const author = getAuthorName(book);
  const category = getCategoryName(book);
  const pages = book?.pages || book?.pageCount || "-";
  const language = book?.language || "Arabic / English";
  const fileSize = formatFileSize(book?.fileSize || book?.size);
  const downloads = Number(book?.downloads || 0);
  const about =
    book?.about ||
    "A beneficial title from the Maktabatul Huda collection, prepared for easy online reading and download.";

  return (
    <main
      className="min-h-screen pb-20 lg:pb-0"
      style={{ backgroundColor: "rgb(248, 245, 240)" }}
    >
      <DetailHeader navigate={navigate} />

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <LargeBookCover book={book} title={title} author={author} />

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleReadOnline}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-base font-semibold text-white transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: "rgb(15, 118, 110)",
                    boxShadow: "rgba(15, 118, 110, 0.3) 0px 4px 20px",
                    fontFamily: "Poppins, sans-serif",
                  }}
                >
                  <BookOpen size={18} />
                  Read Online
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 py-3.5 text-base font-semibold transition-colors"
                  style={{
                    borderColor: "rgb(15, 118, 110)",
                    color: "rgb(15, 118, 110)",
                    fontFamily: "Poppins, sans-serif",
                  }}
                >
                  <Download size={18} />
                  Download PDF
                </button>
                <div className="flex gap-2">
                  <SmallActionButton onClick={handleShare}>
                    <Share2 size={15} />
                    Share
                  </SmallActionButton>
                  <SaveBookButton
                    bookId={getBookId(book)}
                    autoFetchStatus
                    className="flex-1 rounded-2xl py-3 text-sm"
                  />
                </div>
              </div>
            </div>
          </aside>

          <section className="lg:col-span-2">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <CategoryBadge>{category}</CategoryBadge>
            </div>

            <h1
              className="mb-2"
              style={{
                color: "rgb(20, 83, 45)",
                fontFamily: "Poppins, sans-serif",
                fontSize: "30px",
                fontWeight: 800,
                lineHeight: 1.15,
              }}
            >
              {title}
            </h1>
            {book?.collection ? (
              <button
                type="button"
                onClick={() => navigate(`/collections/${book.collection.id}`)}
                className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
              >
                <Layers size={13} />
                {book.collection.title}
              </button>
            ) : null}
            <p
              className="mb-8"
              style={{
                color: "rgb(15, 118, 110)",
                fontFamily: "Poppins, sans-serif",
                fontSize: "16px",
                fontWeight: 600,
              }}
            >
              by {author}
            </p>

            <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard label="Pages" value={pages} />
              <StatCard label="Language" value={language} />
              <StatCard label="File Size" value={fileSize} />
              <StatCard
                label="Downloads"
                value={downloads ? `${formatCompact(downloads)}+` : "0"}
              />
            </div>

            <section className="mb-6 rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.055)] ring-1 ring-primary/10">
              <h2
                className="mb-3"
                style={{
                  color: "rgb(20, 83, 45)",
                  fontFamily: "Poppins, sans-serif",
                  fontSize: "17px",
                  fontWeight: 700,
                }}
              >
                About This Book
              </h2>
              <p className="text-sm leading-8 text-gray-600">{about}</p>
            </section>

            {relatedBooks.length ? (
              <section>
                <h2
                  className="mb-4"
                  style={{
                    color: "rgb(20, 83, 45)",
                    fontFamily: "Poppins, sans-serif",
                    fontSize: "19px",
                    fontWeight: 700,
                  }}
                >
                  Related Books
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {relatedBooks.map((relatedBook, index) => (
                    <RelatedBook
                      key={getBookId(relatedBook)}
                      book={relatedBook}
                      index={index}
                      onClick={() => navigate(getBookPath(relatedBook))}
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}

function DetailHeader({ navigate }) {
  return (
    <header
      className="relative overflow-hidden px-4 pb-6 pt-6"
      style={{
        background:
          "linear-gradient(135deg, rgb(20, 83, 45), rgb(15, 118, 110))",
      }}
    >
      <PatternBackground
        id="book-detail-header-pattern"
        size={64}
        opacity="0.07"
        stroke="white"
      />
      <div className="relative z-10 mx-auto max-w-7xl">
        <button
          type="button"
          onClick={() => navigate("/books")}
          className="flex items-center gap-2 text-sm transition-colors"
          style={{
            color: "rgba(255, 255, 255, 0.65)",
            fontFamily: "Inter, sans-serif",
          }}
        >
          <ArrowLeft size={14} />
          Back to Library
        </button>
      </div>
    </header>
  );
}

function LargeBookCover({ book, title, author }) {
  const color =
    coverColors[Math.abs(String(getBookId(book)).length) % coverColors.length];

  return (
    <div
      className="relative mb-6 aspect-[2/3] w-full overflow-hidden rounded-3xl"
      style={{
        backgroundColor: color,
        boxShadow: "rgba(15, 118, 110, 0.22) 0px 28px 72px",
      }}
    >
      {book.coverImage ? (
        <img
          src={book.coverImage}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        <>
          <div
            className="absolute inset-y-0 left-0 w-5"
            style={{ background: "rgba(0, 0, 0, 0.2)" }}
          />
          <PatternBackground
            id={`detail-cover-${getBookId(book)}`}
            size={44}
            opacity="0.14"
            stroke="white"
          />
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8 text-center">
            <p
              style={{
                color: "white",
                fontFamily: "Poppins, sans-serif",
                fontSize: "22px",
                fontWeight: 800,
                lineHeight: 1.3,
              }}
            >
              {title}
            </p>
            <div className="my-4 h-0.5 w-12 bg-white/40" />
            <p className="text-sm text-white/70">{author}</p>
          </div>
        </>
      )}
    </div>
  );
}

function SmallActionButton({ active = false, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-1 items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-semibold transition-colors"
      style={{
        backgroundColor: active ? "rgba(15, 118, 110, 0.08)" : "transparent",
        borderColor: active ? "rgba(15, 118, 110, 0.35)" : "rgb(229, 231, 235)",
        color: active ? "rgb(15, 118, 110)" : "rgb(107, 114, 128)",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      {children}
    </button>
  );
}

function CategoryBadge({ children }) {
  return (
    <span
      className="rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {children}
    </span>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-4 text-center shadow-[0_2px_12px_rgba(0,0,0,0.05)] ring-1 ring-primary/10">
      <p
        className="truncate"
        style={{
          color: "rgb(15, 118, 110)",
          fontFamily: "Poppins, sans-serif",
          fontSize: "22px",
          fontWeight: 800,
        }}
      >
        {value}
      </p>
      <p className="text-[11px] text-gray-400">{label}</p>
    </div>
  );
}

function RelatedBook({ book, index, onClick }) {
  const title = book.title || "Untitled Book";
  const author = getAuthorName(book);
  const color = coverColors[index % coverColors.length];

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      className="flex cursor-pointer items-center gap-3 rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)] ring-1 ring-primary/10 transition-all duration-200 hover:-translate-y-0.5"
    >
      {book.coverImage ? (
        <img
          src={book.coverImage}
          alt=""
          className="h-16 w-12 flex-shrink-0 rounded-xl object-cover"
        />
      ) : (
        <div
          className="relative h-16 w-12 flex-shrink-0 overflow-hidden rounded-xl"
          style={{ backgroundColor: color }}
        >
          <div className="absolute inset-y-0 left-0 w-1.5 bg-black/20" />
        </div>
      )}
      <div className="min-w-0">
        <p
          className="line-clamp-1"
          style={{
            color: "rgb(20, 83, 45)",
            fontFamily: "Poppins, sans-serif",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          {title}
        </p>
        <p className="mt-0.5 text-[11px] text-gray-400">{author}</p>
      </div>
    </article>
  );
}

function PatternBackground({ id, size, opacity, stroke = "#0F766E" }) {
  const center = size / 2;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
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

function formatCompact(value) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
  }
  return new Intl.NumberFormat().format(value);
}

function formatFileSize(value) {
  if (!value) {
    return "-";
  }

  if (typeof value === "string") {
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) {
      return value;
    }
    value = numericValue;
  }

  return `${Math.ceil(value / (1024 * 1024))} MB`;
}
