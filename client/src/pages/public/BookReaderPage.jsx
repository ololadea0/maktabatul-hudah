import { lazy, Suspense, useEffect } from "react";
import { BookOpen } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { fetchBookById } from "../../features/books/bookSlice.js";

const BookReader = lazy(() => import("../../components/reader/BookReader.jsx"));

const getBookId = (book) => book?.id || book?._id || book?.slug || book?.title;

export default function BookReaderPage() {
  const { bookId, id } = useParams();
  const activeBookId = bookId || id;
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isCheckingAuth } = useSelector((state) => state.auth);
  const { selectedBook, selectedStatus, error } = useSelector((state) => state.books);
  const seededBook =
    location.state?.book && String(getBookId(location.state.book)) === activeBookId
      ? location.state.book
      : null;
  const selectedMatches =
    selectedBook && String(getBookId(selectedBook)) === activeBookId ? selectedBook : null;
  const book = selectedMatches || seededBook;

  useEffect(() => {
    if (!book && activeBookId) {
      dispatch(fetchBookById(activeBookId));
    }
  }, [activeBookId, book, dispatch]);

  if (selectedStatus === "loading" || (!book && !error)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-100">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-100 border-t-teal-700" />
      </main>
    );
  }

  if (error && !book) {
    return (
      <ReaderLandingNotice
        title="Reader unavailable"
        message={error}
        onBack={() => navigate(-1)}
      />
    );
  }

  if (isCheckingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-100">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-100 border-t-teal-700" />
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <ReaderLandingNotice
        title="Sign in to read online"
        message="Please sign in so we can verify access and save your reading progress."
        onBack={() => navigate("/auth")}
      />
    );
  }

  return (
    <Suspense fallback={<ReaderSpinner />}>
      <BookReader bookId={activeBookId} onBack={() => navigate(-1)} />
    </Suspense>
  );
}

function ReaderSpinner() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-100">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-100 border-t-teal-700" />
    </main>
  );
}

function ReaderLandingNotice({ title, message, onBack }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-100 px-4">
      <section className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-sm ring-1 ring-stone-200">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-700">
          <BookOpen size={22} />
        </div>
        <h1 className="text-lg font-bold text-emerald-950">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-stone-500">{message}</p>
        <button
          type="button"
          onClick={onBack}
          className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800"
        >
          Back to Library
        </button>
      </section>
    </main>
  );
}
