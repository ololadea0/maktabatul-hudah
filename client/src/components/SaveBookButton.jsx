import { useEffect } from "react";
import { Bookmark } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  fetchSaveStatus,
  saveBook,
  unsaveBook,
} from "../features/savedBooks/savedBookSlice.js";
import {
  selectIsBookSaved,
  selectSaveActionStatus,
} from "../features/savedBooks/savedBookSelectors.js";
import { selectAuth } from "../features/auth/authSlice.js";

export default function SaveBookButton({
  bookId,
  iconOnly = false,
  autoFetchStatus = false,
  className = "",
  style,
  variant = "outline",
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useSelector(selectAuth);
  const isSaved = useSelector(selectIsBookSaved(bookId));
  const actionStatus = useSelector(selectSaveActionStatus(bookId));
  const statusByBookId = useSelector((state) => state.savedBooks.statusByBookId);
  const isBusy = actionStatus === "saving" || actionStatus === "removing";

  useEffect(() => {
    if (
      autoFetchStatus &&
      isAuthenticated &&
      bookId &&
      !statusByBookId[bookId]
    ) {
      dispatch(fetchSaveStatus(bookId));
    }
  }, [autoFetchStatus, bookId, dispatch, isAuthenticated, statusByBookId]);

  const handleClick = async (event) => {
    event.stopPropagation();

    if (!bookId || isBusy) {
      return;
    }

    if (!isAuthenticated) {
      toast.info("Please log in to save books.");
      navigate("/auth", { state: { from: location.pathname } });
      return;
    }

    const result = await dispatch(isSaved ? unsaveBook(bookId) : saveBook(bookId));

    if (saveBook.rejected.match(result) || unsaveBook.rejected.match(result)) {
      toast.error(result.payload?.message || "Unable to update saved books.");
    }
  };

  const label = isBusy
    ? actionStatus === "saving"
      ? "Saving..."
      : "Removing..."
    : isSaved
      ? "Saved"
      : "Save";

  const baseStyle =
    variant === "solid"
      ? {
          backgroundColor: isSaved ? "rgba(15, 118, 110, 0.1)" : "white",
          borderColor: isSaved ? "rgba(15, 118, 110, 0.45)" : "rgba(15, 118, 110, 0.18)",
          color: "rgb(15, 118, 110)",
        }
      : {
          backgroundColor: isSaved ? "rgba(15, 118, 110, 0.08)" : "transparent",
          borderColor: isSaved ? "rgba(15, 118, 110, 0.35)" : "rgb(229, 231, 235)",
          color: isSaved ? "rgb(15, 118, 110)" : "rgb(107, 114, 128)",
        };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isBusy}
      aria-pressed={isSaved}
      aria-label={label}
      title={label}
      className={`flex items-center justify-center gap-2 border font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
      style={{
        ...baseStyle,
        fontFamily: "Poppins, sans-serif",
        ...style,
      }}
    >
      <Bookmark
        size={iconOnly ? 15 : 16}
        className={isSaved ? "fill-current" : ""}
      />
      {iconOnly ? null : label}
    </button>
  );
}
