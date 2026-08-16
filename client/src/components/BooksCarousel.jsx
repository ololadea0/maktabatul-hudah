import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import BookCard from "./BookCard.jsx";

export default function BooksCarousel({ books = [], navigate }) {
  const trackRef = useRef(null);
  const containerRef = useRef(null);
  const intervalRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [index, setIndex] = useState(0);
  const [itemWidth, setItemWidth] = useState(0);

  const total = books.length;
  const extended = total ? [...books, ...books] : [];

  useEffect(() => {
    const track = trackRef.current;
    const container = containerRef.current;
    if (!track || !container || total === 0) return undefined;

    const first = track.querySelector("[data-carousel-item]");
    const gapRaw = getComputedStyle(track).gap || "16px";
    const gap = parseFloat(gapRaw) || 16;
    const w = first ? first.offsetWidth + gap : container.clientWidth;
    setItemWidth(w);

    const advance = () => setIndex((i) => i + 1);
    intervalRef.current = setInterval(() => {
      if (!isPaused) advance();
    }, 3000);

    const onResize = () => {
      const firstNow = track.querySelector("[data-carousel-item]");
      const wNow = firstNow
        ? firstNow.offsetWidth + gap
        : container.clientWidth;
      setItemWidth(wNow);
    };

    window.addEventListener("resize", onResize);
    return () => {
      clearInterval(intervalRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [total, isPaused]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || itemWidth === 0) return;
    track.style.transition = "transform 500ms ease";
    const translate = -(index * itemWidth);
    track.style.transform = `translateX(${translate}px)`;
  }, [index, itemWidth]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    const handler = () => {
      if (total === 0) return;
      if (index >= total) {
        track.style.transition = "none";
        setIndex(0);
        // force reflow then restore transition
        // eslint-disable-next-line no-unused-expressions
        track.offsetHeight;
        track.style.transition = "transform 500ms ease";
      }
    };
    track.addEventListener("transitionend", handler);
    return () => track.removeEventListener("transitionend", handler);
  }, [index, total]);

  const goNext = () => setIndex((i) => i + 1);
  const goPrev = () => {
    const track = trackRef.current;
    if (!track) return;
    if (index === 0 && total > 0) {
      track.style.transition = "none";
      const start = total;
      setIndex(start);
      setTimeout(() => {
        track.style.transition = "transform 500ms ease";
        setIndex(start - 1);
      }, 20);
      return;
    }
    setIndex((i) => Math.max(0, i - 1));
  };

  const handleRead = (book) => {
    navigate(
      `/read/${encodeURIComponent(book.id || book._id || book.slug || book.title)}`,
      { state: { book } },
    );
  };

  return (
    <section className="relative">
      <div className="absolute left-2 top-1/2 z-20 -translate-y-1/2">
        <button
          type="button"
          aria-label="Previous"
          onClick={goPrev}
          className="rounded-full bg-white p-2 shadow-md"
        >
          <ChevronLeft size={18} />
        </button>
      </div>
      <div className="absolute right-2 top-1/2 z-20 -translate-y-1/2">
        <button
          type="button"
          aria-label="Next"
          onClick={goNext}
          className="rounded-full bg-white p-2 shadow-md"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div
        ref={containerRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="overflow-hidden py-2"
      >
        <div
          ref={trackRef}
          className="flex items-start gap-4"
          style={{ transform: "translateX(0px)" }}
        >
          {extended.map((book, idx) => (
            <div
              key={`${book.id || book._id || book.slug || idx}-${idx}`}
              data-carousel-item
              className="min-w-[220px] max-w-[220px] flex-shrink-0"
            >
              <BookCard
                book={book}
                index={idx % total}
                onOpen={() =>
                  navigate(
                    `/book-details/${encodeURIComponent(book.slug || book.id || book._id || book.title)}`,
                    { state: { book } },
                  )
                }
                onRead={handleRead}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
