import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ReaderPagination({
  currentPage,
  pageCount,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
  onGoToPage,
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-stone-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-center">
      <button
        type="button"
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-stone-200 px-4 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-45"
      >
        <ChevronLeft size={18} />
        Previous
      </button>

      <form
        className="flex items-center justify-center gap-2 text-sm text-stone-600"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          onGoToPage(Number(formData.get("page")));
        }}
      >
        <span>Page</span>
        <input
          name="page"
          type="number"
          min="1"
          max={pageCount || 1}
          defaultValue={currentPage}
          key={currentPage}
          className="h-10 w-20 rounded-md border border-stone-200 text-center font-semibold text-stone-800 outline-none focus:border-teal-700"
        />
        <span>/ {pageCount || "-"}</span>
      </form>

      <button
        type="button"
        onClick={onNext}
        disabled={!canGoNext}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-45"
      >
        Next
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

