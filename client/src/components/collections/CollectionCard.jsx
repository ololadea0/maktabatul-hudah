import { BookOpen, Layers } from "lucide-react";

const coverColors = [
  "rgb(15, 118, 110)",
  "rgb(20, 83, 45)",
];

const accentColors = [
  "rgb(15, 118, 110)",
  "rgb(20, 83, 45)",
];

function formatVolumeLabel(count) {
  return `${count} ${count === 1 ? "vol" : "vols"}`;
}

export default function CollectionCard({ collection, index = 0, viewMode = "grid", onOpen }) {
  const title = collection.title || "Untitled Collection";
  const author = collection.author || "Unknown Author";
  const count = collection.volumesCount || collection.volumes?.length || 0;
  const color = coverColors[index % coverColors.length];
  const accent = accentColors[index % accentColors.length];
  const category = collection.category?.name || (typeof collection.category === "string" ? collection.category : "Collection");
  const description =
    collection.description ||
    "A carefully organized multi-volume work from the Maktabatul Huda collection.";

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen?.();
    }
  };

  if (viewMode === "list") {
    return (
      <article
        role="link"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={handleKeyDown}
        className="flex cursor-pointer items-center gap-4 rounded-2xl bg-white px-4 py-4 transition-all hover:-translate-y-0.5 sm:px-6"
        style={{ border: "1px solid rgba(0, 0, 0, 0.06)", boxShadow: "rgba(0, 0, 0, 0.07) 0 2px 12px" }}
      >
        <CollectionCover
          title={title}
          coverImage={collection.coverImage}
          color={color}
          accent={accent}
          count={count}
          compact
        />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 font-display text-sm font-bold text-secondary">{title}</p>
          <p className="mt-1 text-xs text-gray-500">{author}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <CollectionChip accent={accent}>{category}</CollectionChip>
            <VolumeChip count={count} />
          </div>
        </div>
        <span
          className="hidden rounded-xl px-4 py-2 text-xs font-semibold text-white sm:inline-flex"
          style={{ backgroundColor: accent }}
        >
          View Collection
        </span>
      </article>
    );
  }

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={handleKeyDown}
      className="flex cursor-pointer flex-col overflow-hidden rounded-xl bg-white transition-all duration-300 hover:-translate-y-1"
      style={{ border: "1px solid rgba(0, 0, 0, 0.06)", boxShadow: "rgba(0, 0, 0, 0.07) 0 2px 12px" }}
    >
      <CollectionCover
        title={title}
        coverImage={collection.coverImage}
        color={color}
        accent={accent}
        count={count}
      />
      <div className="flex flex-1 flex-col p-3.5">
        <div className="mb-0.5 flex items-start justify-between gap-2">
          <p className="line-clamp-1 flex-1 font-display text-[13px] font-bold leading-snug text-secondary">
            {title}
          </p>
        </div>
        <p className="mb-2 text-[11px] text-gray-500">{author}</p>
        <div className="mb-2.5 flex flex-wrap items-center gap-2">
          <CollectionChip accent={accent}>{category}</CollectionChip>
          <VolumeChip count={count} />
        </div>
        <p className="mb-3.5 line-clamp-2 flex-1 text-xs leading-relaxed text-gray-500">
          {description}
        </p>
        <button
          type="button"
          className="flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: accent }}
          onClick={(event) => {
            event.stopPropagation();
            onOpen?.();
          }}
        >
          <BookOpen size={12} />
          View Collection
        </button>
      </div>
    </article>
  );
}

function CollectionChip({ accent, children }) {
  return (
    <span
      className="rounded-full border px-2 py-0.5 text-[10px] font-semibold"
      style={{
        backgroundColor: `${accent.replace("rgb", "rgba").replace(")", ", 0.08)")}`,
        borderColor: `${accent.replace("rgb", "rgba").replace(")", ", 0.18)")}`,
        color: accent,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {children}
    </span>
  );
}

function VolumeChip({ count }) {
  return (
    <span
      className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
      style={{
        backgroundColor: "rgba(212, 175, 55, 0.12)",
        border: "1px solid rgba(212, 175, 55, 0.3)",
        color: "rgb(146, 64, 14)",
      }}
    >
      <Layers size={9} />
      {formatVolumeLabel(count)}
    </span>
  );
}

function CollectionCover({ title, coverImage, color, accent, count, compact = false }) {
  const heightClass = compact ? "h-16 w-12 shrink-0 rounded-lg" : "h-40";

  return (
    <div
      className={`relative flex items-end justify-center overflow-hidden ${heightClass} ${compact ? "pb-1.5" : "pb-4"}`}
      style={{
        background: `linear-gradient(160deg, ${accent.replace("rgb", "rgba").replace(")", ", 0.13)")}, ${accent.replace("rgb", "rgba").replace(")", ", 0.09)")}) rgb(248, 245, 240)`,
      }}
    >
      {coverImage ? (
        <img src={coverImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <>
          <PatternBackground id={`collection-card-pattern-${compact ? "list" : "grid"}-${title}-${count}`} size={compact ? 32 : 48} stroke={accent} opacity="0.06" />
          <BookStack title={title} color={color} compact={compact} />
        </>
      )}
      {!compact ? (
        <>
          <div
                className="absolute left-2.5 top-2.5 z-10 flex items-center gap-1 rounded-md px-2 py-1"
            style={{ backgroundColor: accent, boxShadow: "rgba(0, 0, 0, 0.2) 0 2px 8px" }}
          >
            <Layers size={9} className="text-white" />
            <span className="font-display text-[9px] font-bold uppercase tracking-wider text-white">
              Collection
            </span>
          </div>
          <div
              className="absolute right-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full"
            style={{
              backgroundColor: "rgb(212, 175, 55)",
              boxShadow: "rgba(212, 175, 55, 0.4) 0 2px 8px",
            }}
          >
                <span className="font-display text-[10px] font-extrabold leading-none text-white">
              {count}
            </span>
          </div>
        </>
      ) : null}
      {!compact ? (
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5 opacity-60"
          style={{ backgroundColor: "rgb(212, 175, 55)" }}
        />
      ) : null}
    </div>
  );
}

function BookStack({ title, color, compact }) {
  const scale = compact ? 0.52 : 0.86;
  const width = Math.round(72 * scale);
  const heights = [108, 104, 100].map((height) => Math.round(height * scale));
  const spineWidth = Math.max(6, Math.round(10 * scale));

  return (
    <div className="relative flex items-end" style={{ height: compact ? 72 : 120, width: width + 8 }}>
      <div
        className="absolute bottom-0 overflow-hidden rounded-sm"
        style={{
          left: 8 * scale,
          zIndex: 3,
          width,
          height: heights[0],
          backgroundColor: color,
        }}
      />
      <div
        className="absolute bottom-0 overflow-hidden rounded-sm"
        style={{
          left: 4 * scale,
          zIndex: 2,
          width,
          height: heights[1],
          backgroundColor: `${color.replace("rgb", "rgba").replace(")", ", 0.8)")}`,
        }}
      />
      <div
        className="absolute bottom-0 overflow-hidden rounded-sm"
        style={{
          left: 0,
          zIndex: 1,
          width,
          height: heights[2],
          backgroundColor: color,
          boxShadow: compact ? "rgba(0, 0, 0, 0.18) 3px 3px 10px" : "rgba(0, 0, 0, 0.25) 4px 4px 16px",
        }}
      >
        <div className="absolute inset-y-0 left-0" style={{ width: spineWidth, background: "rgba(0, 0, 0, 0.22)" }} />
        <PatternBackground id={`book-stack-pattern-${title}-${compact ? "compact" : "large"}`} size={compact ? 20 : 28} stroke="white" opacity="0.2" />
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-2 text-center">
          <p
            className="line-clamp-3 font-display font-bold leading-snug text-white"
            style={{ fontSize: compact ? "7px" : "9px" }}
          >
            {title}
          </p>
        </div>
      </div>
    </div>
  );
}

function PatternBackground({ id, size, stroke, opacity }) {
  const center = size / 2;
  const safeId = id.replace(/[^a-zA-Z0-9-]/g, "-");

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg width="100%" height="100%">
        <defs>
          <pattern id={safeId} x="0" y="0" width={size} height={size} patternUnits="userSpaceOnUse">
            <polygon
              points={`${center},${size * 0.13} ${size * 0.57},${size * 0.37} ${size * 0.79},${size * 0.25} ${size * 0.63},${size * 0.44} ${size * 0.87},${center} ${size * 0.63},${size * 0.56} ${size * 0.79},${size * 0.75} ${size * 0.57},${size * 0.63} ${center},${size * 0.87} ${size * 0.43},${size * 0.63} ${size * 0.21},${size * 0.75} ${size * 0.37},${size * 0.56} ${size * 0.13},${center} ${size * 0.37},${size * 0.44} ${size * 0.21},${size * 0.25} ${size * 0.43},${size * 0.37}`}
              fill="none"
              stroke={stroke}
              strokeWidth="0.9"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${safeId})`} opacity={opacity} />
      </svg>
    </div>
  );
}
