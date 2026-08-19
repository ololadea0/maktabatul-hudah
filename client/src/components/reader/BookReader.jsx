import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  PanelTopClose,
  RotateCw,
  Search,
  SlidersHorizontal,
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
const mobileViewportQuery = "(max-width: 900px)";

export default function BookReader({ bookId, onBack }) {
  const dispatch = useDispatch();
  const reader = useSelector(selectReader);
  const canvasRef = useRef(null);
  const viewportRef = useRef(null);
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
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);
  const [docState, setDocState] = useState("idle"); // idle|loading|loaded|ready|error
  const [docError, setDocError] = useState(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const didSetMobileFit = useRef(false);
  const [isMobileViewport, setIsMobileViewport] = useState(() => {
    if (typeof window === "undefined") return false;
    const agent = navigator.userAgent || "";
    const isMobileAgent = /Android|iPhone|iPad|iPod|Mobile/i.test(agent);
    if (typeof window.matchMedia === "function") {
      return isMobileAgent || window.matchMedia(mobileViewportQuery).matches;
    }
    return isMobileAgent || window.innerWidth <= 900;
  });
  const [forceNativePdfViewer, setForceNativePdfViewer] = useState(false);

  // A single source of truth for the rendering mode.
  // Desktop always uses PDF.js; mobile must open the PDF in the browser.
  const useNativePdfViewer = forceNativePdfViewer || isMobileViewport;

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return undefined;
    }

    const mediaQueryList = window.matchMedia(mobileViewportQuery);
    const handleChange = (event) => {
      const agent = navigator.userAgent || "";
      const isMobileAgent = /Android|iPhone|iPad|iPod|Mobile/i.test(agent);
      setIsMobileViewport(isMobileAgent || event.matches);
    };

    const agent = navigator.userAgent || "";
    const isMobileAgent = /Android|iPhone|iPad|iPod|Mobile/i.test(agent);
    setIsMobileViewport(isMobileAgent || mediaQueryList.matches);

    if (typeof mediaQueryList.addEventListener === "function") {
      mediaQueryList.addEventListener("change", handleChange);
      return () => mediaQueryList.removeEventListener("change", handleChange);
    }

    mediaQueryList.addListener(handleChange);
    return () => mediaQueryList.removeListener(handleChange);
  }, []);

  useEffect(() => {
    // Activate reader mode and lock background scroll using position:fixed
    const html = document.documentElement;
    const body = document.body;
    const prev = {
      htmlClass: html.className,
      bodyClass: body.className,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
    };
    const scrollY = window.scrollY || window.pageYOffset || 0;
    html.classList.add("reader-active");
    body.classList.add("reader-active");
    // Use fixed positioning to lock background while allowing inner scrolling
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";

    return () => {
      html.classList.remove("reader-active");
      body.classList.remove("reader-active");
      // restore body styles and scroll position
      body.style.position = prev.bodyPosition || "";
      body.style.top = prev.bodyTop || "";
      body.style.left = prev.bodyLeft || "";
      body.style.right = prev.bodyRight || "";
      window.scrollTo(0, scrollY);
    };
  }, []);

  // Set a reliable CSS `--reader-height` value from the visual viewport
  // (or window.innerHeight) so mobile browsers use an explicit pixel height
  // instead of relying solely on newer viewport units which may behave
  // differently when deployed inside various webviews.
  useEffect(() => {
    const setCssReaderHeight = () => {
      const h = window.visualViewport?.height || window.innerHeight || 0;
      if (h) {
        document.documentElement.style.setProperty("--reader-height", `${h}px`);
      }
    };

    setCssReaderHeight();
    window.addEventListener("resize", setCssReaderHeight);
    window.visualViewport?.addEventListener("resize", setCssReaderHeight);
    window.visualViewport?.addEventListener("scroll", setCssReaderHeight);

    return () => {
      window.removeEventListener("resize", setCssReaderHeight);
      window.visualViewport?.removeEventListener("resize", setCssReaderHeight);
      window.visualViewport?.removeEventListener("scroll", setCssReaderHeight);
    };
  }, []);

  useEffect(() => {
    // Prefer the measured container width but fall back to the visual viewport
    // or window width for deployed environments where the ResizeObserver
    // may not report immediately. This prevents the reader from remaining
    // in a non-mobile fit mode when the initial measured width is 0.
    const measuredWidth =
      containerSize.width ||
      window.visualViewport?.width ||
      window.innerWidth ||
      0;

    if (
      didSetMobileFit.current ||
      measuredWidth === 0 ||
      measuredWidth >= 640
    ) {
      return;
    }
    didSetMobileFit.current = true;
    // For deployed mobile/webview environments prefer width-fit so the
    // page spans the viewport width and allows vertical scrolling.
    dispatch(setFitMode("width"));
  }, [containerSize.width, dispatch]);

  const progressPercent = useMemo(() => {
    if (!reader.totalPages) return 0;
    return Math.min(
      100,
      Math.max(0, (reader.currentPage / reader.totalPages) * 100),
    );
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
      .filter(
        (pageNumber) => pageNumber >= 1 && pageNumber <= reader.totalPages,
      )
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
      if (
        !Number.isInteger(pageNumber) ||
        pageNumber < 1 ||
        pageNumber > reader.totalPages
      ) {
        toast.error("Choose a valid page number.");
        return;
      }
      dispatch(setCurrentPage(pageNumber));
      // also scroll the inner viewport to the page element
      setTimeout(() => scrollToPageElement(pageNumber), 50);
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
      setDocState("loading");
      await Promise.resolve();
      if (cancelled) return;
      setPdfReady(false);
      // Mobile uses the browser's built-in PDF handler, never initializing
      // PDF.js or its worker, which avoids the JBIG2/mobile issue entirely.
      if (useNativePdfViewer) {
        setPdfReady(true);
        setDocState("ready");
        if (typeof window !== "undefined" && reader.pdfUrl) {
          window.open(reader.pdfUrl, "_blank", "noopener,noreferrer");
        }
        return;
      }

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

      console.log("PDFJS load start", {
        pdfUrl: reader.pdfUrl,
        width: containerSize.width,
        height: containerSize.height,
        innerWidth: window.innerWidth,
        visualWidth: window.visualViewport?.width,
        devicePixelRatio: window.devicePixelRatio,
      });

      const pdfDocument = await loadingTask.promise;
      if (cancelled) return;
      pdfDocumentRef.current = pdfDocument;
      console.log("PDFJS document loaded", {
        numPages: pdfDocument.numPages,
        pdfUrl: reader.pdfUrl,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
        containerWidth: containerSize.width,
        containerHeight: containerSize.height,
      });
      dispatch(setTotalPages(pdfDocument.numPages));
      setPdfReady(true);
      setDocState("loaded");
      // clear any previous reader error at document level
      dispatch(setReaderError(null));
    };

    loadPdf().catch(async (err) => {
      if (cancelled) return;
      setPdfReady(false);
      const msg = String(err?.message || err || "Failed to load PDF document");
      setDocState("error");
      setDocError(msg);
      dispatch(
        setReaderError(
          "Unable to open this PDF. The file may be corrupted or unavailable.",
        ),
      );
      const refreshed = await loadReader();
      // if refresh didn't provide a new PDF, keep the document error state
    });

    return () => {
      cancelled = true;
      loadingTaskRef.current?.destroy();
    };
  }, [dispatch, loadReader, reader.pdfUrl, useNativePdfViewer]);

  useEffect(() => {
    if (!reader.expiresAt) return undefined;
    const refreshIn = Math.max(
      new Date(reader.expiresAt).getTime() - Date.now() - 30000,
      15000,
    );
    const timeout = window.setTimeout(() => {
      loadReader();
    }, refreshIn);
    return () => window.clearTimeout(timeout);
  }, [loadReader, reader.expiresAt]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    const updateContainerSize = () => {
      const visualViewport = window.visualViewport;
      const width = Math.max(
        0,
        Math.min(
          viewport.clientWidth,
          visualViewport?.width ?? viewport.clientWidth,
        ),
      );
      const height = Math.max(0, viewport.clientHeight);

      setContainerSize({ width, height });
    };

    updateContainerSize();
    requestAnimationFrame(updateContainerSize);

    const observer = new ResizeObserver(() => {
      updateContainerSize();
    });
    observer.observe(viewport);

    window.addEventListener("resize", updateContainerSize);
    window.visualViewport?.addEventListener("resize", updateContainerSize);
    window.visualViewport?.addEventListener("scroll", updateContainerSize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateContainerSize);
      window.visualViewport?.removeEventListener("resize", updateContainerSize);
      window.visualViewport?.removeEventListener("scroll", updateContainerSize);
    };
  }, [reader.loading, reader.error, reader.pdfUrl, pdfReady]);

  const renderPage = useCallback(async () => {
    if (
      !pdfDocumentRef.current ||
      !canvasRef.current ||
      !containerSize.width ||
      !containerSize.height
    )
      return;

    dispatch(setRendering(true));
    renderTaskRef.current?.cancel();
    const renderId = (renderSequenceRef.current += 1);

    try {
      // Helper: try to get a page with a few retries for flaky PDFs.
      const tryGetPage = async (pageNumber, attempts = 3) => {
        let lastErr = null;
        for (let i = 0; i < attempts; i += 1) {
          try {
            return await pdfDocumentRef.current.getPage(pageNumber);
          } catch (err) {
            lastErr = err;
            const msg = String(err?.message || err);
            // If the worker transport is torn down, reload the PDF (will re-init worker).
            if (msg.includes("sendWithPromise") || msg.includes("worker")) {
              console.warn("PDF worker transport failure, reloading PDF:", err);
              try {
                renderTaskRef.current?.cancel();
                loadingTaskRef.current?.destroy?.();
                pdfDocumentRef.current?.destroy?.();
              } catch (destroyErr) {
                console.warn(
                  "Error while destroying pdf worker objects",
                  destroyErr,
                );
              }
              await loadReader();
              return null;
            }

            // Small backoff before retrying for transient PDF parsing issues.
            // Let user-triggered interactions still be quick: use short delays.
            // eslint-disable-next-line no-await-in-loop
            await new Promise((r) => setTimeout(r, i === 0 ? 200 : 500));
          }
        }
        throw lastErr;
      };

      const page = await tryGetPage(reader.currentPage);
      if (!page) return; // already reloaded via loadReader()
      console.log("PDFJS page render start", {
        pageNumber: reader.currentPage,
        fitMode: reader.fitMode,
        zoom: reader.zoom,
        rotation: reader.rotation,
        containerWidth: containerSize.width,
        containerHeight: containerSize.height,
        viewportWidth: window.innerWidth,
        devicePixelRatio: window.devicePixelRatio,
      });
      const baseViewport = page.getViewport({
        scale: 1,
        rotation: reader.rotation,
      });
      const horizontalPadding =
        containerSize.width < 640 ? readerGutter : readerGutter * 2;
      const verticalPadding = readerGutter;
      const availableWidth = Math.max(
        1,
        containerSize.width - horizontalPadding,
      );
      const availableHeight = Math.max(
        1,
        containerSize.height - verticalPadding,
      );
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
      const outputScale = Math.min(1.5, window.devicePixelRatio || 1);

      if (renderId !== renderSequenceRef.current) return;

      console.log("PDFJS canvas sizing", {
        pageNumber: reader.currentPage,
        baseViewportWidth: baseViewport.width,
        baseViewportHeight: baseViewport.height,
        targetScale: scale,
        viewportWidth: viewport.width,
        viewportHeight: viewport.height,
        devicePixelRatio: window.devicePixelRatio,
        canvasWidth: canvas?.width,
        canvasHeight: canvas?.height,
        canvasCssWidth: canvas?.clientWidth,
        canvasCssHeight: canvas?.clientHeight,
      });

      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      const displayWidth = Math.min(Math.floor(viewport.width), availableWidth);
      const displayHeight = Math.min(
        Math.floor(viewport.height),
        Math.floor((displayWidth / viewport.width) * viewport.height),
      );
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;
      canvas.style.maxWidth = "100vw";
      canvas.style.display = "block";
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

      console.log("PDFJS render task created", {
        pageNumber: reader.currentPage,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        outputScale,
        transform:
          outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null,
      });

      const renderTimeout = new Promise((_, reject) => {
        window.setTimeout(() => {
          reject(new Error("PDF page render timed out"));
        }, 30000);
      });

      await Promise.race([renderTaskRef.current.promise, renderTimeout]);
      page.cleanup?.();
    } catch (error) {
      if (error?.name !== "RenderingCancelledException") {
        // If the error is related to worker transport, try reloading the PDF.
        const msg = String(error?.message || error);
        if (msg.includes("sendWithPromise") || msg.includes("worker")) {
          console.warn(
            "PDF worker error caught during render, reloading:",
            error,
          );
          try {
            loadingTaskRef.current?.destroy?.();
            pdfDocumentRef.current?.destroy?.();
          } catch (destroyErr) {
            console.warn("Error while destroying pdf objects", destroyErr);
          }
          await loadReader();
        }
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
      // When PDF is ready we no longer render a single canvas. Pages are
      // rendered lazily by `PageView` components via IntersectionObserver.
    }
  }, [pdfReady, renderPage]);

  useEffect(() => {
    // noop: prefetching is handled by PageView instances when they near the
    // viewport. Keep this effect in case other logic expects it.
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
    const onFullscreenChange = () =>
      setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
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
      for (
        let pageNumber = 1;
        pageNumber <= pdfDocumentRef.current.numPages;
        pageNumber += 1
      ) {
        const page = await pdfDocumentRef.current.getPage(pageNumber);
        const text = await page.getTextContent();
        const pageText = text.items
          .map((item) => item.str)
          .join(" ")
          .toLowerCase();
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

  // Scroll helper: scroll the inner viewport to the requested page element
  const scrollToPageElement = (pageNumber) => {
    try {
      const container = viewportRef.current;
      const el = container?.querySelector(`[data-page="${pageNumber}"]`);
      if (el && container) {
        // Scroll so the page is centered vertically when possible.
        const top =
          el.offsetTop - container.clientHeight / 2 + el.clientHeight / 2;
        container.scrollTo({ top, behavior: "smooth" });
      }
    } catch (e) {
      // ignore
    }
  };

  if (
    !reader.error &&
    ((reader.loading && !reader.pdfUrl) || (reader.pdfUrl && !pdfReady))
  ) {
    return createPortal(
      <main
        className="reader-shell fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950"
        style={{ height: "var(--reader-height, 100vh)" }}
      >
        <ReaderLoading label="Loading book..." />
      </main>,
      document.body,
    );
  }

  if (reader.error && !reader.pdfUrl) {
    return createPortal(
      <ReaderNotice message={reader.error} onBack={onBack} />,
      document.body,
    );
  }

  return createPortal(
    <main
      className="reader-shell bg-neutral-950 text-stone-100"
      style={{
        // Explicit inline layout styles to prevent production CSS purge/ordering issues
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "grid",
        width: "100%",
        gridTemplateRows: "auto minmax(0,1fr) auto",
        overflow: "hidden",
        height: "var(--reader-height, 100vh)",
        maxHeight: "var(--reader-height, 100vh)",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
    >
      <header
        ref={/* headerRef placeholder */ null}
        className="z-30 shrink-0 border-b border-white/10 bg-neutral-950/95 backdrop-blur"
      >
        <div className="flex min-h-14 items-center gap-2 px-3 sm:min-h-16 sm:gap-3 sm:px-5">
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
            <p className="truncate text-xs text-stone-400">
              {reader.book?.author || "Maktabatul Huda"}
            </p>
          </div>
          {reader.pdfUrl ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.open(reader.pdfUrl, "_blank")}
                className="inline-flex h-9 items-center gap-2 rounded-md bg-white/5 px-3 text-xs font-semibold text-white hover:bg-white/10"
                title="Open PDF in browser"
              >
                Open in browser
              </button>
              <a
                href={reader.pdfUrl}
                download
                className="inline-flex h-9 items-center gap-2 rounded-md bg-white/10 px-3 text-xs font-semibold text-white hover:bg-white/20"
                title="Download PDF"
              >
                Download
              </a>
            </div>
          ) : null}
          <form
            onSubmit={searchPdf}
            className="hidden w-64 items-center rounded-md border border-white/10 bg-white/5 px-2 sm:flex"
          >
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
            onClick={() => {
              setMobileSearchOpen((open) => !open);
              setMobileToolsOpen(false);
            }}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-stone-200 transition hover:bg-white/10 sm:hidden"
            aria-label="Search"
            title="Search"
          >
            <Search size={18} />
          </button>

          <button
            type="button"
            onClick={() => {
              setMobileToolsOpen((open) => !open);
              setMobileSearchOpen(false);
            }}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-stone-200 transition hover:bg-white/10 sm:hidden"
            aria-label="Reader tools"
            title="Reader tools"
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>

        {mobileSearchOpen ? (
          <form
            onSubmit={(event) => {
              searchPdf(event);
              setMobileSearchOpen(false);
            }}
            className="flex items-center gap-2 border-t border-white/10 bg-neutral-950 px-3 py-2 sm:hidden"
          >
            <Search size={15} className="shrink-0 text-stone-400" />
            <input
              value={reader.searchQuery}
              onChange={(event) => dispatch(setSearchQuery(event.target.value))}
              placeholder="Search inside PDF"
              className="h-9 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-stone-500"
            />
            <button
              type="submit"
              className="shrink-0 rounded-md bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Go
            </button>
          </form>
        ) : null}
      </header>

      {/* Floating fallback FAB when header/footer aren't visible (helps when header/footer fail to render) */}
      <FloatingHeaderFallback
        reader={reader}
        isMobile={useNativePdfViewer}
        docState={docState}
        onUseIframe={() => setForceNativePdfViewer(true)}
      />

      {docState === "error" ? (
        useNativePdfViewer ? (
          <div
            style={{
              position: "fixed",
              left: "env(safe-area-inset-left,8px)",
              bottom: "env(safe-area-inset-bottom,8px)",
              zIndex: 120000,
            }}
          >
            <div className="rounded-lg bg-rose-900/95 px-3 py-2 shadow-lg text-white flex items-center gap-2">
              <a
                href={reader.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-md bg-white/10 px-3 py-1 text-sm font-semibold text-white"
              >
                Open PDF in browser
              </a>
              <a
                href={reader.pdfUrl}
                download
                className="rounded-md bg-white px-3 py-1 text-sm font-semibold text-neutral-900"
              >
                Download
              </a>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-3xl px-4 py-3 text-center bg-rose-900/80 text-white">
            <div className="max-w-2xl mx-auto">
              <p className="font-semibold">
                This PDF could not be fully rendered by the built-in reader.
              </p>
              <p className="text-sm opacity-90 mt-1">
                {docError ||
                  "The document appears to contain content the reader cannot decode."}
              </p>
              <div className="mt-3 flex items-center justify-center gap-3">
                <a
                  href={reader.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md bg-white/10 px-4 py-2 text-sm font-semibold text-white"
                >
                  Open PDF in browser
                </a>
                <a
                  href={reader.pdfUrl}
                  download
                  className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-neutral-900"
                >
                  Download PDF
                </a>
              </div>
            </div>
          </div>
        )
      ) : null}

      <section
        ref={viewportRef}
        className="relative min-h-0 min-w-0 overflow-auto overscroll-contain px-1 py-1 sm:px-4 sm:py-4"
        onContextMenu={(event) => event.preventDefault()}
        onDragStart={(event) => event.preventDefault()}
      >
        <Watermark text={reader.watermark || "Maktabatul Huda"} />
        <div
          ref={pageShellRef}
          className={`relative flex min-h-full w-full max-w-full justify-center ${
            reader.fitMode === "page" ? "items-center" : "items-start"
          } overflow-x-auto`}
        >
          {useNativePdfViewer ? (
            <div className="flex h-full w-full items-center justify-center bg-white px-4 text-center text-neutral-900">
              <div className="max-w-md rounded-2xl border border-neutral-200 bg-neutral-50 p-6 shadow-sm">
                <p className="text-lg font-semibold">
                  Open this PDF in your browser
                </p>
                <p className="mt-2 text-sm text-neutral-600">
                  Mobile devices render PDFs more reliably in the system browser
                  than inside the app.
                </p>
                <div className="mt-5 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      window.open(
                        reader.pdfUrl,
                        "_blank",
                        "noopener,noreferrer",
                      )
                    }
                    className="rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Open PDF
                  </button>
                  <a
                    href={reader.pdfUrl}
                    download
                    className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-900"
                  >
                    Download
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-4xl">
              {Array.from({ length: reader.totalPages || 0 }).map((_, i) => (
                <PageView
                  key={i + 1}
                  pageNumber={i + 1}
                  pdfDocumentRef={pdfDocumentRef}
                  containerWidth={containerSize.width}
                  rotation={reader.rotation}
                  zoom={reader.zoom}
                  fitMode={reader.fitMode}
                  viewportRef={viewportRef}
                  onRendered={() => {
                    if (docState !== "ready" && i + 1 === reader.currentPage) {
                      setDocState("ready");
                    }
                  }}
                  pdfUrl={reader.pdfUrl}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="shrink-0 border-t border-white/10 bg-neutral-950/95 px-2 py-2 sm:px-3">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2">
          <div className="flex items-center justify-center gap-2">
            <IconButton
              label="Previous page"
              disabled={reader.currentPage <= 1}
              onClick={() => goToPage(reader.currentPage - 1)}
            >
              <ChevronLeft size={19} />
            </IconButton>

            <div
              ref={pagePickerRef}
              className="relative min-w-0 flex-1 sm:flex-none"
            >
              <button
                type="button"
                onClick={() => setIsPagePickerOpen((isOpen) => !isOpen)}
                className="flex h-10 w-full min-w-0 items-center justify-center rounded-md border border-white/10 bg-white/5 px-3 text-sm font-semibold text-stone-100 transition hover:bg-white/10 sm:min-w-32 sm:w-auto"
                aria-expanded={isPagePickerOpen}
                aria-label="Choose page"
              >
                <motion.span
                  key={reader.currentPage}
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="truncate"
                >
                  Page {reader.currentPage} / {reader.totalPages || "-"}
                </motion.span>
              </button>

              {isPagePickerOpen ? (
                <div className="absolute bottom-12 left-1/2 z-40 w-[min(16rem,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border border-white/10 bg-neutral-900 p-3 shadow-2xl shadow-black/40">
                  <form
                    onSubmit={handlePageSubmit}
                    className="flex items-center gap-2"
                  >
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
                      className="h-9 shrink-0 rounded-md bg-teal-600 px-3 text-sm font-semibold text-white transition hover:bg-teal-500"
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

            <IconButton
              label="Next page"
              disabled={
                !reader.totalPages || reader.currentPage >= reader.totalPages
              }
              onClick={() => goToPage(reader.currentPage + 1)}
            >
              <ChevronRight size={19} />
            </IconButton>
          </div>

          <div className="hidden items-center justify-center gap-1 overflow-x-auto pb-0.5 sm:flex [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <IconButton
              label="Zoom out"
              disabled={reader.zoom <= minZoom}
              onClick={() => dispatch(setZoom(reader.zoom - zoomStep))}
            >
              <ZoomOut size={18} />
            </IconButton>
            <IconButton
              label="Fit page"
              active={reader.fitMode === "page"}
              onClick={() => dispatch(setFitMode("page"))}
            >
              <Minimize size={18} />
            </IconButton>
            <IconButton
              label="Fit width"
              active={reader.fitMode === "width"}
              onClick={() => dispatch(setFitMode("width"))}
            >
              <PanelTopClose size={18} />
            </IconButton>
            <IconButton
              label="Zoom in"
              disabled={reader.zoom >= maxZoom}
              onClick={() => dispatch(setZoom(reader.zoom + zoomStep))}
            >
              <ZoomIn size={18} />
            </IconButton>
            <IconButton
              label="Rotate"
              onClick={() =>
                dispatch(setRotation((reader.rotation + 90) % 360))
              }
            >
              <RotateCw size={18} />
            </IconButton>
            <IconButton
              label="Fullscreen"
              onClick={toggleFullscreen}
              className="hidden sm:inline-flex"
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </IconButton>
          </div>

          {mobileToolsOpen ? (
            <div className="grid grid-cols-4 gap-2 rounded-lg border border-white/10 bg-white/5 p-2 sm:hidden">
              <IconButton
                label="Zoom out"
                disabled={reader.zoom <= minZoom}
                onClick={() => dispatch(setZoom(reader.zoom - zoomStep))}
              >
                <ZoomOut size={18} />
              </IconButton>
              <IconButton
                label="Fit page"
                active={reader.fitMode === "page"}
                onClick={() => dispatch(setFitMode("page"))}
              >
                <Minimize size={18} />
              </IconButton>
              <IconButton
                label="Fit width"
                active={reader.fitMode === "width"}
                onClick={() => dispatch(setFitMode("width"))}
              >
                <PanelTopClose size={18} />
              </IconButton>
              <IconButton
                label="Zoom in"
                disabled={reader.zoom >= maxZoom}
                onClick={() => dispatch(setZoom(reader.zoom + zoomStep))}
              >
                <ZoomIn size={18} />
              </IconButton>
              <IconButton
                label="Rotate"
                onClick={() =>
                  dispatch(setRotation((reader.rotation + 90) % 360))
                }
              >
                <RotateCw size={18} />
              </IconButton>
              <IconButton label="Fullscreen" onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              </IconButton>
            </div>
          ) : null}

          <div className="h-1.5 overflow-hidden rounded-full bg-white/10 sm:h-2">
            <div
              className="h-full rounded-full bg-teal-500 transition-[width]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="hidden items-center justify-between text-xs text-stone-500 sm:flex">
            <span>{Math.round(reader.zoom * 100)}%</span>
            <span>
              {reader.searchLoading
                ? "Searching..."
                : reader.searchResults.length
                  ? `${reader.searchResults.length} matches`
                  : `${progressPercent.toFixed(0)}% read`}
            </span>
          </div>
        </div>
      </footer>
    </main>,
    document.body,
  );
}

function IconButton({
  active,
  disabled,
  label,
  onClick,
  children,
  className = "",
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md transition ${
        active
          ? "bg-teal-500 text-white"
          : "bg-white/5 text-stone-200 hover:bg-white/10"
      } disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
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

function PageView({
  pageNumber,
  pdfDocumentRef,
  containerWidth,
  rotation,
  zoom,
  fitMode,
  viewportRef,
  pdfUrl,
  onRendered,
}) {
  const dispatch = useDispatch();
  const containerRef = useRef(null);
  const canvasRefLocal = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | rendering | rendered | error
  const [errorMsg, setErrorMsg] = useState(null);
  const renderTaskLocal = useRef(null);

  const maxDPR = 1.5; // cap device pixel ratio to avoid huge canvases
  const padding = readerGutter;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    let mounted = true;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!mounted) return;
          if (entry.isIntersecting || entry.intersectionRatio > 0) {
            // nearby: start rendering
            if (status === "idle" || status === "error") {
              renderPage();
            }
          } else {
            // far away: cleanup to free memory
            if (status === "rendered") {
              cleanupCanvas();
            }
          }
        });
      },
      {
        root: viewportRef?.current || null,
        rootMargin: "800px 0px 800px 0px",
        threshold: 0.01,
      },
    );

    io.observe(el);

    return () => {
      mounted = false;
      io.disconnect();
      cleanupCanvas();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfDocumentRef.current, containerWidth, rotation, zoom, fitMode]);

  const cleanupCanvas = () => {
    try {
      renderTaskLocal.current?.cancel?.();
    } catch (e) {
      // ignore
    }
    const c = canvasRefLocal.current;
    if (c) {
      c.width = 0;
      c.height = 0;
      c.style.width = "0px";
      c.style.height = "0px";
    }
    setStatus("idle");
  };

  const renderPage = async () => {
    if (!pdfDocumentRef.current) return;
    setStatus("rendering");
    setErrorMsg(null);

    try {
      // fetch page with a couple attempts
      let page = null;
      let lastErr = null;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          // eslint-disable-next-line no-await-in-loop
          page = await pdfDocumentRef.current.getPage(pageNumber);
          break;
        } catch (err) {
          lastErr = err;
          // small backoff
          // eslint-disable-next-line no-await-in-loop
          await new Promise((r) => setTimeout(r, 200 + attempt * 300));
        }
      }

      if (!page) throw lastErr || new Error("Could not load page");

      const baseViewport = page.getViewport({ scale: 1, rotation });
      const availableWidth = Math.max(1, containerWidth - padding * 2);
      const widthScale = availableWidth / baseViewport.width;
      const heightScale =
        (viewportRef.current?.clientHeight || 9999) / baseViewport.height;
      const fitScale =
        fitMode === "page" ? Math.min(widthScale, heightScale) : widthScale;
      const targetScale = Math.max(0.1, fitScale * zoom);

      const outputScale = Math.min(maxDPR, window.devicePixelRatio || 1);

      const viewport = page.getViewport({ scale: targetScale, rotation });

      const canvas = canvasRefLocal.current;
      if (!canvas) throw new Error("Canvas not available");

      console.log("PageView sizing", {
        pageNumber,
        containerWidth,
        viewportWidth: viewport.width,
        viewportHeight: viewport.height,
        devicePixelRatio: window.devicePixelRatio,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        canvasCssWidth: canvas.clientWidth,
        canvasCssHeight: canvas.clientHeight,
      });

      const context = canvas.getContext("2d", { alpha: false });

      // Cap pixel count to avoid huge memory allocations while keeping the CSS
      // size correct. Internal raster resolution is reduced when needed.
      const maxPixels = 2200000; // ~2.2MP
      const desiredPixels =
        viewport.width * viewport.height * outputScale * outputScale;
      let scaleForPixels = outputScale;
      if (desiredPixels > maxPixels) {
        const targetRatio = Math.sqrt(maxPixels / desiredPixels);
        scaleForPixels = Math.max(
          0.5,
          Math.min(outputScale, outputScale * targetRatio),
        );
      }

      const renderWidth = Math.max(
        1,
        Math.round(viewport.width * scaleForPixels),
      );
      const renderHeight = Math.max(
        1,
        Math.round(viewport.height * scaleForPixels),
      );
      canvas.width = renderWidth;
      canvas.height = renderHeight;
      const displayWidth = Math.min(Math.floor(viewport.width), availableWidth);
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${Math.floor((displayWidth / viewport.width) * viewport.height)}px`;
      canvas.style.maxWidth = "100%";

      context.save();
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.restore();

      renderTaskLocal.current = page.render({
        canvasContext: context,
        viewport,
        transform:
          scaleForPixels !== 1
            ? [scaleForPixels, 0, 0, scaleForPixels, 0, 0]
            : null,
      });

      const pageRenderTimeout = new Promise((_, reject) => {
        window.setTimeout(() => {
          reject(new Error("PDF page render timed out"));
        }, 30000);
      });

      await Promise.race([renderTaskLocal.current.promise, pageRenderTimeout]);
      page.cleanup?.();
      setStatus("rendered");
      dispatch(setRendering(false));
      try {
        if (typeof onRendered === "function") onRendered(pageNumber);
      } catch (e) {
        // ignore
      }
    } catch (err) {
      setErrorMsg(String(err?.message || err));
      setStatus("error");
      dispatch(setRendering(false));
    }
  };

  return (
    <div
      ref={containerRef}
      data-page={pageNumber}
      className="mx-auto w-full px-2 py-4"
      style={{ maxWidth: "100%" }}
    >
      <div className="relative w-full rounded-lg bg-white/5 p-2">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-semibold text-white">
            Page {pageNumber}
          </div>
          {status === "error" ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => renderPage()}
                className="rounded-md bg-teal-600 px-3 py-1 text-xs font-semibold text-white"
              >
                Retry
              </button>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-md bg-white/5 px-3 py-1 text-xs font-semibold text-white"
              >
                Open PDF in browser
              </a>
            </div>
          ) : null}
        </div>

        {status === "idle" && (
          <div className="h-40 w-full rounded bg-white/3" />
        )}
        {status === "rendering" && (
          <div className="h-40 w-full rounded bg-white/10 animate-pulse" />
        )}
        <canvas ref={canvasRefLocal} className="w-full block bg-white" />
        {status === "error" && (
          <div className="mt-2 text-sm text-rose-400">
            {errorMsg || "Could not render page."}
          </div>
        )}
      </div>
    </div>
  );
}

function Watermark({ text }) {
  if (!text) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-20 grid rotate-[-22deg] grid-cols-2 gap-10 overflow-hidden opacity-[0.07] sm:grid-cols-3">
      {Array.from({ length: 18 }).map((_, index) => (
        <span
          key={index}
          className="whitespace-nowrap text-lg font-bold uppercase text-white"
        >
          {text}
        </span>
      ))}
    </div>
  );
}

function ReaderNotice({ message, onBack }) {
  return (
    <main
      className="reader-shell fixed inset-0 z-[100] flex w-full items-center justify-center bg-neutral-950 px-4 text-white"
      style={{
        height: "var(--reader-height, 100vh)",
        maxHeight: "var(--reader-height, 100vh)",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
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

function FloatingHeaderFallback({ reader, isMobile, docState, onUseIframe }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const check = () => {
      try {
        const root = document.querySelector(".reader-shell");
        if (!root) {
          setVisible(false);
          return;
        }
        const hdr = root.querySelector("header");
        const ftr = root.querySelector("footer");
        const hdrVisible =
          hdr &&
          hdr.getClientRects().length > 0 &&
          window.getComputedStyle(hdr).display !== "none";
        const ftrVisible =
          ftr &&
          ftr.getClientRects().length > 0 &&
          window.getComputedStyle(ftr).display !== "none";
        // Show fallback when header or footer are missing or the document failed to load
        setVisible(!(hdrVisible && ftrVisible));
      } catch (e) {
        setVisible(true);
      }
    };

    check();
    window.addEventListener("resize", check);
    const mo = new MutationObserver(check);
    const root = document.querySelector(".reader-shell");
    if (root)
      mo.observe(root, { childList: true, subtree: true, attributes: true });
    return () => {
      window.removeEventListener("resize", check);
      mo.disconnect();
    };
  }, []);

  if (!visible || !reader?.pdfUrl) return null;

  // Mobile: show a prominent overlay offering Open / Download / Use embedded viewer
  if (isMobile) {
    return (
      <div
        role="dialog"
        aria-label="Reader fallback"
        style={{
          position: "fixed",
          left: 12,
          right: 12,
          bottom: 12,
          zIndex: 150000,
        }}
      >
        <div className="rounded-lg bg-neutral-900/95 px-4 py-3 shadow-lg text-white flex items-center justify-between gap-3">
          <div className="flex-1 text-sm">
            {docState === "error" ? (
              <div className="font-semibold">
                Reader failed to load this document.
              </div>
            ) : (
              <div className="font-semibold">
                Reader UI appears hidden or broken.
              </div>
            )}
            <div className="text-xs opacity-90">
              You can open the original PDF or use an embedded viewer.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.open(reader.pdfUrl, "_blank")}
              className="rounded-md bg-white/90 px-3 py-1 text-xs font-semibold text-neutral-900"
            >
              Open
            </button>
            <a
              href={reader.pdfUrl}
              download
              className="rounded-md bg-white/10 px-3 py-1 text-xs font-semibold text-white"
            >
              Download
            </a>
            <button
              type="button"
              onClick={() => typeof onUseIframe === "function" && onUseIframe()}
              className="rounded-md bg-teal-600 px-3 py-1 text-xs font-semibold text-white"
            >
              Use viewer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop: small FAB at bottom-right
  return (
    <div style={{ position: "fixed", right: 12, bottom: 12, zIndex: 150000 }}>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => window.open(reader.pdfUrl, "_blank")}
          className="rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-neutral-900 shadow-lg"
          aria-label="Open PDF in browser"
        >
          Open
        </button>
        <a
          href={reader.pdfUrl}
          download
          className="rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white shadow-lg"
        >
          Download
        </a>
      </div>
    </div>
  );
}
