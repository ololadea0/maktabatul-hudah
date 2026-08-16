import { ArrowLeft, Maximize, Minus, Plus } from "lucide-react";

export default function ReaderToolbar({
  title,
  currentPage,
  pageCount,
  zoom,
  onBack,
  onZoomIn,
  onZoomOut,
  onFullscreen,
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="flex min-h-16 items-center gap-3 px-3 sm:px-5">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-stone-700 transition hover:bg-stone-100"
          aria-label="Back"
          title="Back"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-bold text-emerald-950 sm:text-base">
            {title || "Reader"}
          </h1>
          <p className="text-xs font-medium text-stone-500">
            Page {currentPage} / {pageCount || "-"}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onZoomOut}
            disabled={zoom <= 60}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-stone-700 transition hover:bg-stone-100 disabled:opacity-40"
            aria-label="Zoom out"
            title="Zoom out"
          >
            <Minus size={18} />
          </button>
          <button
            type="button"
            onClick={onZoomIn}
            disabled={zoom >= 140}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-stone-700 transition hover:bg-stone-100 disabled:opacity-40"
            aria-label="Zoom in"
            title="Zoom in"
          >
            <Plus size={18} />
          </button>
          <button
            type="button"
            onClick={onFullscreen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-stone-700 transition hover:bg-stone-100"
            aria-label="Fullscreen"
            title="Fullscreen"
          >
            <Maximize size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}

