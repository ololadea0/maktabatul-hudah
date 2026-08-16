import { BookOpen, Bookmark } from "lucide-react";
import SaveBookButton from "./SaveBookButton.jsx";

const coverColors = [
  "rgb(15, 118, 110)",
  "rgb(20, 83, 45)",
  "rgb(29, 78, 216)",
  "rgb(124, 58, 237)",
  "rgb(180, 83, 9)",
  "rgb(67, 56, 202)",
];

const getAuthorName = (book) =>
  book.author?.name || book.author || "Unknown Author";
const getBookId = (book) => book.id || book._id || book.slug || book.title;
const getCategoryName = (book) =>
  book.category?.name || book.category || "Islamic Book";

export default function BookCard({
  book,
  index = 0,
  viewMode = "grid",
  onOpen,
  onRead,
}) {
  const title = book.title || "Untitled Book";
  const author = getAuthorName(book);
  const category = getCategoryName(book);
  const description =
    book.description ||
    "A beneficial title from the Maktabatul Huda collection, prepared for easy online reading and download.";
  const coverColor = coverColors[index % coverColors.length];
  const pageCount = book.pages || book.pageCount;
  const fileSize = book.fileSize || book.size || book.pdfSize;

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen();
    }
  };

  if (viewMode === "list") {
    return (
      <article
        role="link"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={handleKeyDown}
        className="flex cursor-pointer items-center gap-4 rounded-2xl bg-white px-4 py-4 transition-all duration-300 hover:-translate-y-0.5 sm:gap-5 sm:px-6"
        style={{
          border: "1px solid rgba(15, 118, 110, 0.07)",
          boxShadow: "rgba(0, 0, 0, 0.07) 0px 4px 18px",
        }}
      >
        <BookCover book={book} color={coverColor} compact decorative />

        <div className="min-w-0 flex-1 py-1">
          <p
            className="mb-1 line-clamp-1"
            style={{
              color: "rgb(20, 83, 45)",
              fontFamily: "Poppins, sans-serif",
              fontSize: "15px",
              fontWeight: 700,
            }}
          >
            {title}
          </p>
          <p className="mb-2 text-sm text-gray-500">{author}</p>
          <ListMetaRow
            pageCount={pageCount}
            fileSize={fileSize}
          />
        </div>

        <div className="hidden shrink-0 items-center gap-4 sm:flex">
          <CategoryPill>{category}</CategoryPill>
          <CardActions
            book={book}
            onRead={onRead}
            compact
          />
        </div>
      </article>
    );
  }

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={handleKeyDown}
      className="cursor-pointer overflow-hidden rounded-2xl bg-white transition-all duration-300 hover:-translate-y-1"
      style={{
        border: "1px solid rgba(15, 118, 110, 0.07)",
        boxShadow: "rgba(0, 0, 0, 0.06) 0px 2px 12px",
      }}
    >
      <BookCover book={book} title={title} author={author} color={coverColor} />
      <div className="p-4">
        <p
          className="mb-0.5 line-clamp-1"
          style={{
            color: "rgb(20, 83, 45)",
            fontFamily: "Poppins, sans-serif",
            fontSize: "13px",
            fontWeight: 600,
            lineHeight: 1.35,
          }}
        >
          {title}
        </p>
        <p className="mb-2 text-[11px] text-gray-500">{author}</p>
        <MetaRow category={category} />
        <p className="mb-4 line-clamp-2 text-xs leading-5 text-gray-500">
          {description}
        </p>
        <CardActions book={book} onRead={onRead} />
      </div>
    </article>
  );
}

function BookCover({
  book,
  title,
  author,
  color,
  compact = false,
  decorative = false,
}) {
  const coverImage = book.coverImage || book.coverUrl || book.cover;

  return (
    <div
      className={`relative overflow-hidden ${compact ? "h-20 w-14 shrink-0 rounded-2xl" : "h-48"}`}
      style={{ backgroundColor: color }}
    >
      {coverImage ? (
        <img src={coverImage} alt="" className="h-full w-full object-cover" />
      ) : decorative ? null : (
        <>
          <div
            className="absolute inset-y-0 left-0 w-3"
            style={{ background: "rgba(0, 0, 0, 0.2)" }}
          />
          <PatternBackground
            id={`book-cover-${getBookId(book)}`}
            size={36}
            opacity="0.15"
            stroke="white"
          />
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-5 text-center">
            <p
              className="line-clamp-3"
              style={{
                color: "white",
                fontFamily: "Poppins, sans-serif",
                fontSize: compact ? "10px" : "13px",
                fontWeight: 700,
                lineHeight: 1.4,
              }}
            >
              {title}
            </p>
            <div className="my-2 h-px w-8 bg-white/40" />
            <p
              style={{
                color: "rgba(255, 255, 255, 0.65)",
                fontSize: compact ? "9px" : "11px",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {author}
            </p>
          </div>
        </>
      )}
      {!compact ? (
        <button
          type="button"
          className="absolute right-2 top-2 z-10 rounded-full p-1.5 transition-colors"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
          onClick={(event) => event.stopPropagation()}
          aria-label="Bookmark book"
        >
          <Bookmark className="text-white" size={11} />
        </button>
      ) : null}
    </div>
  );
}

function CategoryPill({ children }) {
  return (
    <span
      className="max-w-32 truncate rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {children}
    </span>
  );
}

function ListMetaRow({ pageCount, fileSize }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-400">
      {pageCount ? (
        <span>{pageCount} pages</span>
      ) : null}
      {fileSize ? (
        <>
          {pageCount ? <span aria-hidden="true">.</span> : null}
          <span>{fileSize}</span>
        </>
      ) : null}
    </div>
  );
}

function MetaRow({ category }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span
        className="rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {category}
      </span>
    </div>
  );
}

function CardActions({ book, onRead, compact = false }) {
  const handleRead = (event) => {
    event.stopPropagation();
    onRead?.(book);
  };

  return (
    <div className={compact ? "flex shrink-0 gap-2" : "flex gap-2"}>
      <button
        type="button"
        onClick={handleRead}
        className={`flex items-center justify-center gap-1.5 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90 ${compact ? "px-4 py-2.5" : "flex-1 py-2"}`}
        style={{
          backgroundColor: "rgb(15, 118, 110)",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        {compact ? null : <BookOpen size={12} />}
        Read
      </button>
      <SaveBookButton
        bookId={getBookId(book)}
        className={`gap-1.5 rounded-xl bg-white text-xs ${compact ? "px-4 py-2.5" : "flex-1 py-2"}`}
        style={{
          border: "1.5px solid rgb(15, 118, 110)",
          color: "rgb(15, 118, 110)",
        }}
        iconOnly={compact}
        variant="solid"
      />
    </div>
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
