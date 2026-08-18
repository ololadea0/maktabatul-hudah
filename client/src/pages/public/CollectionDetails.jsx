import { useEffect, useMemo } from "react";
import { ArrowLeft, BookOpen, Download, Layers, Library } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { downloadBook } from "../../features/books/bookSlice.js";
import { getCollection } from "../../features/collections/collectionSlice.js";

const getBookId = (book) => book.id || book._id || book.slug || book.title;
const getBookPath = (book) =>
  `/books/${encodeURIComponent(book.slug || getBookId(book))}`;
const libraryPrimary = "rgb(15, 118, 110)";
const librarySecondary = "rgb(20, 83, 45)";
const gold = "rgb(212, 175, 55)";

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function sortVolumes(volumes = []) {
  return [...volumes].sort(
    (first, second) =>
      (first.volumeNumber || Number.MAX_SAFE_INTEGER) -
        (second.volumeNumber || Number.MAX_SAFE_INTEGER) ||
      (first.title || "").localeCompare(second.title || ""),
  );
}

export default function CollectionDetails() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { selectedCollection, selectedStatus, error } = useSelector(
    (state) => state.collections,
  );

  useEffect(() => {
    dispatch(getCollection(id));
  }, [dispatch, id]);

  const volumes = useMemo(
    () => sortVolumes(selectedCollection?.volumes || []),
    [selectedCollection],
  );
  const firstVolume = volumes[0];
  const category = firstVolume?.category?.name;
  const volumeCount = selectedCollection?.volumesCount || volumes.length;
  const totalPages = volumes.reduce(
    (total, volume) => total + Number(volume.pages || volume.pageCount || 0),
    0,
  );
  const totalDownloads = volumes.reduce(
    (total, volume) => total + Number(volume.downloads || 0),
    0,
  );

  const handleRead = (volume) => {
    navigate(`/read/${encodeURIComponent(getBookId(volume))}`, {
      state: { book: volume },
    });
  };

  const handleDownload = async (volume) => {
    const result = await dispatch(downloadBook(getBookId(volume)));
    const pdfUrl = result.payload?.data?.pdfUrl || volume.pdfUrl;
    if (pdfUrl) {
      window.open(pdfUrl, "_blank", "noopener,noreferrer");
      return;
    }
    toast.info("No PDF URL is available for this volume yet.");
  };

  return (
    <main
      className="min-h-screen pb-20 font-sans lg:pb-0"
      style={{ backgroundColor: "rgb(248, 245, 240)" }}
    >
      {selectedStatus === "loading" ? (
        <CollectionSkeleton />
      ) : selectedStatus === "failed" ? (
        <NotFound error={error} />
      ) : selectedCollection ? (
        <>
          <Hero
            collection={selectedCollection}
            category={category}
            volumeCount={volumeCount}
            totalPages={totalPages}
            totalDownloads={totalDownloads}
            firstVolume={firstVolume}
            onBack={() => navigate("/books")}
            onReadFirst={() => firstVolume && handleRead(firstVolume)}
          />

          <div className="mx-auto max-w-6xl px-4 py-7">
            <div className="flex gap-6">
              <section className="min-w-0 flex-1">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-base font-bold text-secondary">
                      All Volumes
                    </h2>
                    <p className="mt-1 text-xs text-gray-400">
                      {volumeCount} {volumeCount === 1 ? "volume" : "volumes"}
                      {totalPages
                        ? ` - ${formatNumber(totalPages)} total pages`
                        : ""}
                    </p>
                  </div>
                  {selectedCollection.language ? (
                    <span className="rounded-lg border border-primary/15 bg-primary/10 px-2.5 py-1 font-display text-[10px] font-semibold text-primary">
                      {selectedCollection.language}
                    </span>
                  ) : null}
                </div>

                {volumes.length ? (
                  <div className="space-y-2.5">
                    {volumes.map((volume, index) => (
                      <VolumeRow
                        key={getBookId(volume)}
                        volume={volume}
                        index={index}
                        collection={selectedCollection}
                        onRead={handleRead}
                        onDownload={handleDownload}
                        onOpen={(nextVolume) =>
                          navigate(getBookPath(nextVolume))
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <p className="rounded-2xl border border-dashed border-primary/25 bg-white p-6 text-sm text-gray-500">
                    No published volumes are available for this collection yet.
                  </p>
                )}
              </section>

              <CollectionSidebar
                collection={selectedCollection}
                volumes={volumes}
                category={category}
                volumeCount={volumeCount}
                totalPages={totalPages}
                totalDownloads={totalDownloads}
                onBrowse={() => navigate("/books")}
              />
            </div>
          </div>
        </>
      ) : null}
    </main>
  );
}

function Hero({
  collection,
  category,
  volumeCount,
  totalPages,
  totalDownloads,
  firstVolume,
  onBack,
  onReadFirst,
}) {
  return (
    <header
      className="relative overflow-hidden px-4 pb-8 pt-6"
      style={{
        background: `linear-gradient(145deg, ${librarySecondary} 0%, ${libraryPrimary} 60%, rgba(15, 118, 110, 0.84) 100%)`,
      }}
    >
      <PatternBackground
        id="collection-detail-hero-pattern"
        size={72}
        stroke="white"
        opacity="0.09"
      />
      <div className="relative z-10 mx-auto max-w-6xl">
        <button
          type="button"
          onClick={onBack}
          className="mb-5 flex items-center gap-2 text-sm text-white/65 transition-colors hover:text-white"
        >
          <ArrowLeft size={14} />
          Back to Library
        </button>

        <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center">
          <HeroCover collection={collection} volumeCount={volumeCount} />
          <div className="min-w-0 flex-1">
            <div className="mb-2.5 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1">
                <Layers size={11} className="text-white" />
                <span className="font-display text-[10px] font-bold uppercase tracking-wider text-white">
                  Multi-volume Collection
                </span>
              </div>
              {category ? (
                <span className="rounded-full border border-white/20 bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white">
                  {category}
                </span>
              ) : null}
            </div>

            <h1 className="mb-1 max-w-3xl font-display text-2xl font-extrabold leading-tight text-white sm:text-3xl">
              {collection.title}
            </h1>
            {collection.author ? (
              <p className="mb-2.5 text-sm text-white/70">
                by {collection.author}
              </p>
            ) : null}
            {collection.description ? (
              <p className="mb-3 max-w-2xl text-sm leading-6 text-white/75">
                {collection.description}
              </p>
            ) : null}
            {collection.about ? (
              <p className="mb-5 max-w-2xl text-sm leading-6 text-white/70">
                {collection.about}
              </p>
            ) : null}

            <div className="mb-5 flex flex-wrap gap-2.5">
              <HeroStat
                value={formatNumber(volumeCount)}
                label={volumeCount === 1 ? "Volume" : "Volumes"}
              />
              {totalPages ? (
                <HeroStat
                  value={formatNumber(totalPages)}
                  label="Total Pages"
                />
              ) : null}
              {totalDownloads ? (
                <HeroStat
                  value={formatNumber(totalDownloads)}
                  label="Downloads"
                />
              ) : null}
              {collection.language ? (
                <HeroStat value={collection.language} label="Language" />
              ) : null}
            </div>

            {firstVolume ? (
              <button
                type="button"
                onClick={onReadFirst}
                className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 font-display text-xs font-semibold text-primary transition-opacity hover:opacity-90"
              >
                <BookOpen size={15} />
                Read Volume {firstVolume.volumeNumber || 1}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

function HeroCover({ collection, volumeCount }) {
  return (
    <div className="relative h-32 w-24 flex-shrink-0 sm:h-36 sm:w-28">
      {collection.coverImage ? (
        <img
          src={collection.coverImage}
          alt=""
          className="h-full w-full rounded-lg object-cover shadow-[6px_8px_20px_rgba(0,0,0,0.28)]"
        />
      ) : (
        <StackedBooks
          title={collection.title}
          author={collection.author}
          size="hero"
        />
      )}
      <div
        className="absolute -right-2 -top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full shadow-lg"
        style={{ backgroundColor: gold }}
      >
        <span className="font-display text-xs font-extrabold text-white">
          {volumeCount}
        </span>
      </div>
    </div>
  );
}

function HeroStat({ value, label }) {
  return (
    <div className="flex flex-col rounded-xl bg-white/15 px-3 py-2 backdrop-blur">
      <span className="font-display text-base font-extrabold leading-none text-white">
        {value}
      </span>
      <span className="mt-0.5 text-[9px] text-white/60">{label}</span>
    </div>
  );
}

function VolumeRow({ volume, index, collection, onRead, onDownload, onOpen }) {
  const title = volume.title || `Volume ${volume.volumeNumber || index + 1}`;
  const label = volume.volumeNumber || index + 1;
  const coverImage = volume.coverImage || collection.coverImage;

  return (
    <article
      id={`volume-${getBookId(volume)}`}
      className="flex overflow-hidden rounded-xl bg-white transition-all duration-200 hover:-translate-y-0.5"
      style={{
        border: "1px solid rgba(0, 0, 0, 0.05)",
        boxShadow: "rgba(0, 0, 0, 0.06) 0 2px 12px",
      }}
    >
      <button
        type="button"
        onClick={() => onOpen?.(volume)}
        aria-label={`Open ${title}`}
        className="relative flex w-10 flex-shrink-0 flex-col items-center justify-center overflow-hidden text-white"
        style={{ backgroundColor: libraryPrimary }}
      >
        <div className="absolute inset-y-0 left-0 w-1.5 bg-black/20" />
        <PatternBackground
          id={`volume-row-${getBookId(volume)}`}
          size={22}
          stroke="white"
          opacity="0.1"
        />
        <span className="relative z-10 font-display text-xs font-extrabold">
          {label}
        </span>
      </button>

      <div className="flex min-w-0 flex-1 flex-col gap-3 p-3 sm:flex-row sm:items-center">
        {coverImage ? (
          <img
            src={coverImage}
            alt=""
            className="h-16 w-11 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <StackedBooks title={title} size="row" />
        )}

        <div className="min-w-0 flex-1">
          <p className="font-display text-[13px] font-bold text-secondary">
            Volume {label}
          </p>
          <p className="mt-0.5 line-clamp-1 text-[13px] text-gray-600">
            {title}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-2 text-[10px] text-gray-400">
            {volume.category?.name ? <span>{volume.category.name}</span> : null}
            {volume.pages || volume.pageCount ? (
              <span>
                {formatNumber(volume.pages || volume.pageCount)} pages
              </span>
            ) : null}
            {volume.downloads ? (
              <span>{formatNumber(volume.downloads)} downloads</span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onRead?.(volume)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white"
          >
            <BookOpen size={13} />
            Read
          </button>
          <button
            type="button"
            onClick={() => onDownload?.(volume)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary px-3 py-1.5 text-xs font-semibold text-primary"
          >
            <Download size={13} />
            Download
          </button>
        </div>
      </div>
    </article>
  );
}

function CollectionSidebar({
  collection,
  volumes,
  category,
  volumeCount,
  totalPages,
  totalDownloads,
  onBrowse,
}) {
  const details = [
    ["Total Volumes", volumeCount],
    totalPages ? ["Total Pages", formatNumber(totalPages)] : null,
    collection.totalVolumes
      ? ["Planned Volumes", collection.totalVolumes]
      : null,
    collection.author ? ["Author", collection.author] : null,
    category ? ["Category", category] : null,
    collection.language ? ["Language", collection.language] : null,
    totalDownloads ? ["Downloads", formatNumber(totalDownloads)] : null,
  ].filter(Boolean);

  return (
    <aside className="hidden w-60 flex-shrink-0 lg:block">
      <div
        className="sticky top-24 rounded-xl bg-white p-4"
        style={{
          border: "1px solid rgba(0, 0, 0, 0.05)",
          boxShadow: "rgba(0, 0, 0, 0.06) 0 2px 12px",
        }}
      >
        <h3 className="mb-3 font-display text-[13px] font-bold text-secondary">
          Volume Navigator
        </h3>
        {volumes.length ? (
          <div className="mb-4 grid grid-cols-5 gap-1.5">
            {volumes.map((volume, index) => (
              <button
                key={getBookId(volume)}
                type="button"
                className="aspect-square rounded-md text-[10px] font-bold text-white transition-opacity hover:opacity-80"
                style={{ backgroundColor: libraryPrimary }}
                onClick={() => {
                  document
                    .getElementById(`volume-${getBookId(volume)}`)
                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
              >
                {volume.volumeNumber || index + 1}
              </button>
            ))}
          </div>
        ) : null}

        <div className="space-y-2">
          {details.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-2">
              <span className="text-[11px] text-gray-400">{label}</span>
              <span className="max-w-[58%] text-right text-[11px] font-medium leading-snug text-gray-700">
                {value}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t border-gray-100 pt-3">
          <button
            type="button"
            onClick={onBrowse}
            className="w-full rounded-lg bg-primary py-2.5 font-display text-xs font-semibold text-white transition-opacity hover:opacity-90"
          >
            Browse More Books
          </button>
        </div>
      </div>
    </aside>
  );
}

function StackedBooks({ title, author, size }) {
  const isHero = size === "hero";
  const isRow = size === "row";
  const width = isHero ? 72 : 34;
  const height = isHero ? 96 : 50;
  const radius = isHero ? "0.5rem" : "0.375rem";

  return (
    <div
      className={`relative shrink-0 ${isHero ? "h-32 w-24 sm:h-36 sm:w-28" : "h-16 w-11"}`}
      aria-hidden="true"
    >
      <div
        className="absolute bottom-0 overflow-hidden"
        style={{
          left: isHero ? 16 : 8,
          width,
          height: Math.round(height * 0.88),
          borderRadius: radius,
          backgroundColor: librarySecondary,
          opacity: 0.5,
          zIndex: 1,
        }}
      />
      <div
        className="absolute bottom-0 overflow-hidden"
        style={{
          left: isHero ? 8 : 4,
          width,
          height: Math.round(height * 0.95),
          borderRadius: radius,
          backgroundColor: librarySecondary,
          opacity: 0.7,
          zIndex: 2,
        }}
      />
      <div
        className="absolute bottom-0 overflow-hidden"
        style={{
          left: 0,
          width,
          height,
          borderRadius: radius,
          backgroundColor: libraryPrimary,
          boxShadow: isHero
            ? "rgba(0, 0, 0, 0.35) 8px 8px 24px"
            : "rgba(0, 0, 0, 0.2) 4px 4px 12px",
          zIndex: 3,
        }}
      >
        <div
          className="absolute inset-y-0 left-0 bg-black/20"
          style={{ width: isHero ? 14 : 7 }}
        />
        <PatternBackground
          id={`stacked-book-${title}-${size}`}
          size={isHero ? 30 : 20}
          stroke="white"
          opacity="0.18"
        />
        {!isRow ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-3 text-center">
            <p className="font-display text-[10px] font-bold leading-snug text-white">
              {title}
            </p>
            {author ? (
              <>
                <div className="my-1.5 h-px w-6 bg-white/40" />
                <p className="text-[8px] text-white/60">{author}</p>
              </>
            ) : null}
          </div>
        ) : null}
        <div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{ backgroundColor: gold }}
        />
      </div>
    </div>
  );
}

function PatternBackground({ id, size, stroke, opacity }) {
  const center = size / 2;
  const safeId = id.replace(/[^a-zA-Z0-9-]/g, "-");

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <svg width="100%" height="100%">
        <defs>
          <pattern
            id={safeId}
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
          fill={`url(#${safeId})`}
          opacity={opacity}
        />
      </svg>
    </div>
  );
}

function CollectionSkeleton() {
  return (
    <>
      <div className="h-80 animate-pulse bg-primary/80" />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="h-96 animate-pulse rounded-2xl bg-white" />
      </div>
    </>
  );
}

function NotFound({ error }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20">
      <div className="rounded-2xl bg-white p-8 text-center shadow-[0_4px_20px_rgba(0,0,0,0.055)]">
        <Library size={34} className="mx-auto mb-4 text-primary" />
        <h1 className="font-display text-xl font-bold text-secondary">
          Collection not found
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          {error || "This collection could not be loaded."}
        </p>
      </div>
    </div>
  );
}
