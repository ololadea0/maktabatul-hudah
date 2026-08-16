import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  MoreVertical,
  PanelTopClose,
  RotateCw,
  Search,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  getReaderInfo,
  resetReader,
  saveReadingProgress,
  setCurrentPage,
  setFitMode,
  setReaderError,
  setRendering,
  setRotation,
  setSearchLoading,
  setSearchQuery,
  setSearchResults,
  setTotalPages,
  setZoom,
} from "../../features/reader/readerSlice.js";
import { selectReader } from "../../features/reader/readerSelectors.js";
import ReaderLoading from "./ReaderLoading.jsx";

const minZoom = 0.5;
const maxZoom = 2.5;
const zoomStep = 0.1;
const readerGutter = 16;

export default function BookReader({ bookId, onBack }) {
  const dispatch = useDispatch();
  const reader = useSelector(selectReader);
  const canvasRef = useRef(null);
  const pageShellRef = useRef(null);
  const pageInputRef = useRef(null);
  const pdfDocumentRef = useRef(null);
  const pdfJsRef = useRef(null);
  const loadingTaskRef = useRef(null);
  const renderTaskRef = useRef(null);
  const renderSequenceRef = useRef(0);
  const pagePickerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPagePickerOpen, setIsPagePickerOpen] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const progressPercent = useMemo(() => {
    if (!reader.totalPages) return 0;
    return Math.min(100, Math.max(0, (reader.currentPage / reader.totalPages) * 100));
  }, [reader.currentPage, reader.totalPages]);

  const quickPages = useMemo(() => {
    if (!reader.totalPages) return [];
    const pages = new Set([
      1,
      reader.currentPage - 2,
      reader.currentPage - 1,
      reader.currentPage,
      reader.currentPage + 1,
      reader.currentPage + 2,
      reader.totalPages,
    ]);

    return [...pages]
      .filter((pageNumber) => pageNumber >= 1 && pageNumber <= reader.totalPages)
      .sort((first, second) => first - second);
  }, [reader.currentPage, reader.totalPages]);

  const loadReader = useCallback(async () => {
    const result = await dispatch(getReaderInfo(bookId));
    if (getReaderInfo.rejected.match(result)) {
      return null;
    }
    return result.payload?.data || null;
  }, [bookId, dispatch]);

  const goToPage = useCallback(
    (pageNumber) => {
      if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > reader.totalPages) {
        toast.error("Choose a valid page number.");
        return;
      }
      dispatch(setCurrentPage(pageNumber));
    },
    [dispatch, reader.totalPages],
  );

  useEffect(() => {
    loadReader();
    return () => {
      renderTaskRef.current?.cancel();
      loadingTaskRef.current?.destroy();
      pdfDocumentRef.current?.destroy?.();
      dispatch(resetReader());
    };
  }, [dispatch, loadReader]);

  useEffect(() => {
    if (!reader.pdfUrl) return undefined;
    let cancelled = false;
    renderTaskRef.current?.cancel();
    pdfDocumentRef.current?.destroy?.();

    const loadPdf = async () => {
      await Promise.resolve();
      if (cancelled) return;
      setPdfReady(false);

      if (!pdfJsRef.current) {
        const [pdfjsLib, worker] = await Promise.all([
          import("pdfjs-dist"),
          import("pdfjs-dist/build/pdf.worker.mjs?url"),
        ]);
        pdfjsLib.GlobalWorkerOptions.workerSrc = worker.default;
        pdfJsRef.current = pdfjsLib;
      }

      const loadingTask = pdfJsRef.current.getDocument({
        url: reader.pdfUrl,
        disableAutoFetch: false,
        disableStream: false,
        rangeChunkSize: 65536,
      });
      loadingTaskRef.current = loadingTask;

      const pdfDocument = await loadingTask.promise;
        if (cancelled) return;
        pdfDocumentRef.current = pdfDocument;
        dispatch(setTotalPages(pdfDocument.numPages));
        setPdfReady(true);
    };

    loadPdf().catch(async () => {
      if (cancelled) return;
      setPdfReady(false);
      const refreshed = await loadReader();
      if (!refreshed?.pdfUrl && !refreshed?.signedUrl) {
        dispatch(setReaderError("Unable to open this PDF. The file may be corrupted or unavailable."));
      }
    });

    return () => {
      cancelled = true;
      loadingTaskRef.current?.destroy();
    };
  }, [dispatch, loadReader, reader.pdfUrl]);

  useEffect(() => {
    if (!reader.expiresAt) return undefined;
    const refreshIn = Math.max(new Date(reader.expiresAt).getTime() - Date.now() - 30000, 15000);
    const timeout = window.setTimeout(() => {
      loadReader();
    }, refreshIn);
    return () => window.clearTimeout(timeout);
  }, [loadReader, reader.expiresAt]);

  useEffect(() => {
    if (!pageShellRef.current) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setContainerSize({
        width: Math.max(0, width),
        height: Math.max(0, height),
      });
    });
    observer.observe(pageShellRef.current);
    return () => observer.disconnect();
  }, [pdfReady, reader.pdfUrl]);

  const renderPage = useCallback(async () => {
    if (!pdfDocumentRef.current || !canvasRef.current || !containerSize.width || !containerSize.height) return;

    dispatch(setRendering(true));
    renderTaskRef.current?.cancel();
    const renderId = (renderSequenceRef.current += 1);

    try {
      const page = await pdfDocumentRef.current.getPage(reader.currentPage);
      const baseViewport = page.getViewport({ scale: 1, rotation: reader.rotation });
      const horizontalPadding = window.innerWidth < 640 ? readerGutter * 2 : readerGutter * 4;
      const verticalPadding = readerGutter * 2;
      const availableWidth = Math.max(1, containerSize.width - horizontalPadding);
      const availableHeight = Math.max(1, containerSize.height - verticalPadding);
      const widthScale = availableWidth / baseViewport.width;
      const heightScale = availableHeight / baseViewport.height;
      const fitScale =
        reader.fitMode === "page"
          ? Math.min(widthScale, heightScale)
          : widthScale;
      const scale = Math.min(6, Math.max(0.1, fitScale * reader.zoom));
      const viewport = page.getViewport({ scale, rotation: reader.rotation });
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d", { alpha: false });
      const outputScale = window.devicePixelRatio || 1;

      if (renderId !== renderSequenceRef.current) return;

      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;
      context.save();
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.restore();

      renderTaskRef.current = page.render({
        canvasContext: context,
        viewport,
        transform:
          outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null,
      });

      await renderTaskRef.current.promise;
      page.cleanup?.();
    } catch (error) {
      if (error?.name !== "RenderingCancelledException") {
        dispatch(setReaderError("The page could not be rendered. Refreshing the secure file link..."));
        await loadReader();
      }
    } finally {
      if (renderId === renderSequenceRef.current) {
        dispatch(setRendering(false));
      }
    }
  }, [
    containerSize.height,
    containerSize.width,
    dispatch,
    loadReader,
    reader.currentPage,
    reader.fitMode,
    reader.rotation,
    reader.zoom,
  ]);

  useEffect(() => {
    if (pdfReady) {
      renderPage();
    }
  }, [pdfReady, renderPage]);

  useEffect(() => {
    if (!pdfDocumentRef.current || !pdfReady) return;
    [reader.currentPage - 1, reader.currentPage + 1]
      .filter((pageNumber) => pageNumber >= 1 && pageNumber <= reader.totalPages)
      .forEach((pageNumber) => {
        pdfDocumentRef.current.getPage(pageNumber).catch(() => {});
      });
  }, [pdfReady, reader.currentPage, reader.totalPages]);

  useEffect(() => {
    if (!reader.totalPages) return undefined;
    const timeout = window.setTimeout(() => {
      dispatch(
        saveReadingProgress({
          bookId,
          currentPage: reader.currentPage,
          zoom: reader.zoom,
        }),
      );
    }, 700);
    return () => window.clearTimeout(timeout);
  }, [bookId, dispatch, reader.currentPage, reader.totalPages, reader.zoom]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (reader.totalPages) {
        dispatch(
          saveReadingProgress({
            bookId,
            currentPage: reader.currentPage,
            zoom: reader.zoom,
          }),
        );
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      handleBeforeUnload();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [bookId, dispatch, reader.currentPage, reader.totalPages, reader.zoom]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && ["+", "="].includes(event.key)) {
        event.preventDefault();
        dispatch(setZoom(reader.zoom + zoomStep));
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key === "-") {
        event.preventDefault();
        dispatch(setZoom(reader.zoom - zoomStep));
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToPage(reader.currentPage - 1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goToPage(reader.currentPage + 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch, goToPage, reader.currentPage, reader.zoom]);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!pagePickerRef.current?.contains(event.target)) {
        setIsPagePickerOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const handlePageSubmit = (event) => {
    event.preventDefault();
    goToPage(Number(pageInputRef.current?.value));
    setIsPagePickerOpen(false);
  };

  const searchPdf = async (event) => {
    event.preventDefault();
    const query = reader.searchQuery.trim().toLowerCase();
    if (!query || !pdfDocumentRef.current) return;

    dispatch(setSearchLoading(true));
    try {
      const results = [];
      for (let pageNumber = 1; pageNumber <= pdfDocumentRef.current.numPages; pageNumber += 1) {
        const page = await pdfDocumentRef.current.getPage(pageNumber);
        const text = await page.getTextContent();
        const pageText = text.items.map((item) => item.str).join(" ").toLowerCase();
        page.cleanup?.();
        if (pageText.includes(query)) {
          results.push(pageNumber);
        }
      }
      dispatch(setSearchResults(results));
      if (results[0]) {
        dispatch(setCurrentPage(results[0]));
      } else {
        toast.error("No matches found in this PDF.");
      }
    } catch {
      toast.error("Search could not read this PDF.");
    } finally {
      dispatch(setSearchLoading(false));
    }
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
      return;
    }
    document.documentElement.requestFullscreen?.();
  };

  if (!reader.error && ((reader.loading && !reader.pdfUrl) || (reader.pdfUrl && !pdfReady))) {
    return <ReaderLoading label="Loading book..." />;
  }

  if (reader.error && !reader.pdfUrl) {
    return <ReaderNotice message={reader.error} onBack={onBack} />;
  }

  return (
    <main className="grid h-screen grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden bg-neutral-950 text-stone-100">
      <header className="z-30 border-b border-white/10 bg-neutral-950/95 backdrop-blur">
        <div className="flex min-h-16 items-center gap-3 px-3 sm:px-5">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-stone-200 transition hover:bg-white/10"
            aria-label="Back to library"
            title="Back to library"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <h1 className="truncate text-sm font-bold text-white sm:text-base">
              {reader.book?.title || "Book Reader"}
            </h1>
            <p className="truncate text-xs text-stone-400">{reader.book?.author || "Maktabatul Huda"}</p>
          </div>

          <form onSubmit={searchPdf} className="hidden w-64 items-center rounded-md border border-white/10 bg-white/5 px-2 sm:flex">
            <Search size={15} className="text-stone-400" />
            <input
              value={reader.searchQuery}
              onChange={(event) => dispatch(setSearchQuery(event.target.value))}
              placeholder="Search"
              className="h-9 min-w-0 flex-1 bg-transparent px-2 text-sm text-white outline-none placeholder:text-stone-500"
            />
          </form>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-stone-200 transition hover:bg-white/10"
            aria-label="More"
            title="More"
          >
            <MoreVertical size={19} />
          </button>
        </div>
      </header>

      <section
        className="relative min-h-0 overflow-auto p-4"
        onContextMenu={(event) => event.preventDefault()}
        onDragStart={(event) => event.preventDefault()}
      >
        <Watermark text={reader.watermark || "Maktabatul Huda"} />
        <div
          ref={pageShellRef}
          className={`relative flex min-h-full w-full justify-center ${
            reader.fitMode === "page" ? "items-center" : "items-start"
          }`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`${reader.currentPage}-${reader.rotation}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.18 }}
              className="relative shrink-0"
            >
              {reader.rendering ? <PageSkeleton /> : null}
              <canvas
                ref={canvasRef}
                draggable="false"
                className="bg-white shadow-2xl shadow-black/50"
                aria-label={`Page ${reader.currentPage}`}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-neutral-950/95 px-3 py-2">
        <div className="mx-auto flex max-w-6xl flex-col gap-2">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <IconButton label="Zoom out" disabled={reader.zoom <= minZoom} onClick={() => dispatch(setZoom(reader.zoom - zoomStep))}>
              <ZoomOut size={18} />
            </IconButton>
            <IconButton label="Fit page" active={reader.fitMode === "page"} onClick={() => dispatch(setFitMode("page"))}>
              <Minimize size={18} />
            </IconButton>
            <IconButton label="Fit width" active={reader.fitMode === "width"} onClick={() => dispatch(setFitMode("width"))}>
              <PanelTopClose size={18} />
            </IconButton>
            <IconButton label="Zoom in" disabled={reader.zoom >= maxZoom} onClick={() => dispatch(setZoom(reader.zoom + zoomStep))}>
              <ZoomIn size={18} />
            </IconButton>
            <IconButton label="Rotate" onClick={() => dispatch(setRotation((reader.rotation + 90) % 360))}>
              <RotateCw size={18} />
            </IconButton>
            <IconButton label="Fullscreen" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </IconButton>

            <IconButton label="Previous page" disabled={reader.currentPage <= 1} onClick={() => goToPage(reader.currentPage - 1)}>
              <ChevronLeft size={19} />
            </IconButton>

            <div ref={pagePickerRef} className="relative">
              <button
                type="button"
                onClick={() => setIsPagePickerOpen((isOpen) => !isOpen)}
                className="flex h-10 min-w-32 items-center justify-center rounded-md border border-white/10 bg-white/5 px-3 text-sm font-semibold text-stone-100 transition hover:bg-white/10"
                aria-expanded={isPagePickerOpen}
                aria-label="Choose page"
              >
                <motion.span
                  key={reader.currentPage}
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  Page {reader.currentPage} / {reader.totalPages || "-"}
                </motion.span>
              </button>

              {isPagePickerOpen ? (
                <div className="absolute bottom-12 left-1/2 z-40 w-64 -translate-x-1/2 rounded-lg border border-white/10 bg-neutral-900 p-3 shadow-2xl shadow-black/40">
                  <form onSubmit={handlePageSubmit} className="flex items-center gap-2">
                    <input
                      key={reader.currentPage}
                      ref={pageInputRef}
                      defaultValue={reader.currentPage}
                      onFocus={(event) => event.target.select()}
                      className="h-9 min-w-0 flex-1 rounded-md bg-neutral-950 px-3 text-center text-sm font-semibold text-white outline-none ring-1 ring-white/10 focus:ring-teal-400"
                      inputMode="numeric"
                    />
                    <button
                      type="submit"
                      className="h-9 rounded-md bg-teal-600 px-3 text-sm font-semibold text-white transition hover:bg-teal-500"
                    >
                      Go
                    </button>
                  </form>

                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {quickPages.map((pageNumber) => (
                      <button
                        key={pageNumber}
                        type="button"
                        onClick={() => {
                          goToPage(pageNumber);
                          setIsPagePickerOpen(false);
                        }}
                        className={`h-8 rounded-md text-xs font-semibold transition ${
                          pageNumber === reader.currentPage
                            ? "bg-teal-500 text-white"
                            : "bg-white/5 text-stone-300 hover:bg-white/10"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <IconButton label="Next page" disabled={!reader.totalPages || reader.currentPage >= reader.totalPages} onClick={() => goToPage(reader.currentPage + 1)}>
              <ChevronRight size={19} />
            </IconButton>
          </div>

          <form onSubmit={searchPdf} className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 sm:hidden">
            <Search size={15} className="text-stone-400" />
            <input
              value={reader.searchQuery}
              onChange={(event) => dispatch(setSearchQuery(event.target.value))}
              placeholder="Search inside PDF"
              className="h-10 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-stone-500"
            />
          </form>

          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-teal-500 transition-[width]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>{Math.round(reader.zoom * 100)}%</span>
            <span>{reader.searchLoading ? "Searching..." : reader.searchResults.length ? `${reader.searchResults.length} matches` : `${progressPercent.toFixed(0)}% read`}</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

function IconButton({ active, disabled, label, onClick, children }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-md transition ${
        active ? "bg-teal-500 text-white" : "bg-white/5 text-stone-200 hover:bg-white/10"
      } disabled:cursor-not-allowed disabled:opacity-40`}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}

function PageSkeleton() {
  return (
    <div className="absolute inset-0 z-10 animate-pulse bg-white">
      <div className="mx-auto mt-16 h-4 w-2/3 rounded bg-stone-200" />
      <div className="mx-auto mt-5 h-3 w-4/5 rounded bg-stone-200" />
      <div className="mx-auto mt-3 h-3 w-3/4 rounded bg-stone-200" />
    </div>
  );
}

function Watermark({ text }) {
  if (!text) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-20 grid rotate-[-22deg] grid-cols-2 gap-10 overflow-hidden opacity-[0.07] sm:grid-cols-3">
      {Array.from({ length: 18 }).map((_, index) => (
        <span key={index} className="whitespace-nowrap text-lg font-bold uppercase text-white">
          {text}
        </span>
      ))}
    </div>
  );
}

function ReaderNotice({ message, onBack }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 text-white">
      <section className="w-full max-w-md rounded-lg border border-white/10 bg-white/5 p-6 text-center">
        <h1 className="text-lg font-bold">Reader unavailable</h1>
        <p className="mt-2 text-sm leading-6 text-stone-400">{message}</p>
        <button
          type="button"
          onClick={onBack}
          className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-teal-600 px-4 text-sm font-semibold text-white hover:bg-teal-500"
        >
          Back to Library
        </button>
      </section>
    </main>
  );
}
