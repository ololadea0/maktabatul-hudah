import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { BookMarked, Library, User } from "lucide-react";
import { selectAuth } from "../../features/auth/authSlice.js";
import { fetchSavedBooks } from "../../features/savedBooks/savedBookSlice.js";
import BookCard from "../../components/BookCard.jsx";

const getBookId = (book) => book.id || book._id || book.slug || book.title;
const getBookPath = (book) =>
  `/book-details/${encodeURIComponent(book.slug || getBookId(book))}`;
const getReadPath = (book) => `/read/${encodeURIComponent(getBookId(book))}`;

function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const hasFetchedSavedBooks = useRef(false);
  const { user, isAuthenticated, isCheckingAuth } = useSelector(selectAuth);
  const { savedBooks, status, error } = useSelector((state) => state.savedBooks);

  useEffect(() => {
    if (isAuthenticated && !hasFetchedSavedBooks.current) {
      hasFetchedSavedBooks.current = true;
      dispatch(fetchSavedBooks());
    }
  }, [dispatch, isAuthenticated]);

  if (!isCheckingAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-16 text-center">
        <div className="mx-auto max-w-md rounded-xl bg-white p-8 shadow-lg">
          <User size={38} className="mx-auto mb-4 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">Please log in</h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            You need an account to view your profile and saved books.
          </p>
          <Link
            to="/auth"
            className="mt-6 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>

        <div className="mb-8 rounded-xl bg-white p-8 shadow-lg">
          <div className="mb-8 flex items-center gap-6">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full"
              style={{ backgroundColor: "rgba(15, 118, 110, 0.2)" }}
            >
              <User size={40} style={{ color: "rgb(15, 118, 110)" }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {user?.fullName || "User"}
              </h2>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <h3 className="mb-6 text-xl font-bold text-gray-900">
              Account Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  value={user?.fullName || ""}
                  disabled
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-600"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-600"
                />
              </div>
            </div>
          </div>
        </div>

        <section className="rounded-xl border border-teal-200 bg-white p-6 shadow-lg">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-teal-50 p-2 text-primary">
                <BookMarked size={22} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Saved Books
                </h3>
                <p className="text-sm text-gray-500">
                  Your personal reading shelf
                </p>
              </div>
            </div>
            <Link
              to="/books"
              className="inline-flex items-center gap-2 rounded-xl border border-primary/20 px-4 py-2 text-sm font-semibold text-primary"
            >
              <Library size={15} />
              Explore Library
            </Link>
          </div>

          {status === "loading" ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-80 animate-pulse rounded-2xl bg-gray-100"
                />
              ))}
            </div>
          ) : status === "failed" ? (
            <p className="rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-600">
              {error || "Unable to load your saved books."}
            </p>
          ) : savedBooks.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {savedBooks.map((book, index) => (
                <BookCard
                  key={getBookId(book)}
                  book={book}
                  index={index}
                  onOpen={() =>
                    navigate(getBookPath(book), { state: { book } })
                  }
                  onRead={() => navigate(getReadPath(book), { state: { book } })}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-primary/30 bg-teal-50/40 p-8 text-center">
              <BookMarked size={34} className="mx-auto mb-4 text-primary" />
              <p className="text-lg font-bold text-gray-900">
                You haven't saved any books yet.
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                Save a book or volume from its details page, then it will appear
                here for quick access.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Profile;
