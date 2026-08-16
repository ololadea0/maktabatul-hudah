import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Menu,
  X,
  Home,
  Search,
  Library,
  Download,
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";
import { selectAuth, logout } from "../../features/auth/authSlice.js";
import { LIBRARY_LOGO_URL, LIBRARY_SHORT_NAME } from "../../config/branding.js";

const stackedBrandName = LIBRARY_SHORT_NAME.split(/\s+/).filter(Boolean);

function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, isCheckingAuth, user } = useSelector(selectAuth);
  const readerName = user?.fullName || user?.name || "Reader";
  const readerEmail = user?.email || "reader@example.com";
  const readerInitial = readerName.charAt(0).toUpperCase();
  const isAdmin = user?.role === "ADMIN";

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    if (path === "/books") {
      return (
        location.pathname === "/books" ||
        location.pathname.startsWith("/books/") ||
        location.pathname.startsWith("/book-details/")
      );
    }

    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const isSearchActive =
    location.pathname === "/books" && location.search.includes("search=");

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Books", path: "/books" },
    { label: "Categories", path: "/categories" },
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" },
  ];

  // Handle scroll event
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLoginClick = () => {
    navigate("/auth");
  };

  const handleBrowseClick = () => {
    navigate("/books");
  };

  const handleProfileClick = () => {
    navigate("/profile");
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    await dispatch(logout());
    setIsMenuOpen(false);
    navigate("/");
  };

  return (
    <>
      {/* Top Navigation */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: hasScrolled
            ? "rgba(255, 255, 255, 0.98)"
            : "transparent",
          backdropFilter: hasScrolled ? "blur(10px)" : "none",
          boxShadow: hasScrolled ? "0 2px 8px rgba(0, 0, 0, 0.1)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
              <img
                src={LIBRARY_LOGO_URL}
                alt={`${LIBRARY_SHORT_NAME} logo`}
                className="h-10 w-10 rounded-xl object-contain"
              />
              <div className="text-left" aria-label={LIBRARY_SHORT_NAME}>
                <p
                  className="flex flex-col font-bold"
                  style={{
                    color: "rgb(20, 83, 45)",
                    fontSize: "15px",
                    lineHeight: "1.05",
                    fontFamily: "Poppins, sans-serif",
                  }}
                >
                  {stackedBrandName.map((word) => (
                    <span key={word}>{word}</span>
                  ))}
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-7">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="rounded-full px-3 py-2 text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: isActive(link.path)
                      ? "rgba(15, 118, 110, 0.1)"
                      : "transparent",
                    color: isActive(link.path)
                      ? "rgb(15, 118, 110)"
                      : "rgb(55, 65, 81)",
                    fontWeight: isActive(link.path) ? 700 : 500,
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                type="button"
                aria-label="Search"
                onClick={() => navigate("/books")}
                className="p-2 rounded-xl transition-colors hover:bg-gray-100"
              >
                <Search size={17} className="text-gray-700" />
              </button>

              {isCheckingAuth ? (
                <div className="h-9 w-28 animate-pulse rounded-xl bg-gray-100" />
              ) : isAuthenticated && user ? (
                <div className="flex items-center gap-2">
                  {isAdmin ? (
                    <button
                      type="button"
                      onClick={() => navigate("/admin")}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors hover:bg-primary/5"
                      style={{
                        color: "rgb(15, 118, 110)",
                        border: "1.5px solid rgb(15, 118, 110)",
                        fontFamily: "Poppins, sans-serif",
                      }}
                    >
                      <LayoutDashboard size={12} />
                      Admin
                    </button>
                  ) : null}
                  <div className="relative group">
                    <button
                      type="button"
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-colors hover:bg-gray-100"
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{
                          backgroundColor: "rgb(15, 118, 110)",
                          fontFamily: "Poppins, sans-serif",
                        }}
                      >
                        {readerInitial}
                      </div>
                      <span
                        className="max-w-28 truncate"
                        style={{
                          color: "rgb(55, 65, 81)",
                          fontSize: "13px",
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 500,
                        }}
                      >
                        {readerName}
                      </span>
                      <ChevronDown
                        size={13}
                        className="text-gray-400 transition-transform group-hover:rotate-180"
                      />
                    </button>
                    <div
                      className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-white py-1 opacity-0 invisible shadow-lg border transition-all group-hover:visible group-hover:opacity-100"
                      style={{ borderColor: "rgba(15, 118, 110, 0.12)" }}
                    >
                      <div className="border-b border-gray-100 px-3 py-2">
                        <p
                          className="truncate"
                          style={{
                            fontFamily: "Poppins, sans-serif",
                            fontWeight: 600,
                            color: "rgb(20, 83, 45)",
                            fontSize: "12px",
                          }}
                        >
                          {readerName}
                        </p>
                        <p className="truncate text-[10px] text-gray-400">
                          {readerEmail}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleProfileClick}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-600 transition-colors hover:bg-teal-50 hover:text-teal-700"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        <User size={13} />
                        Profile
                      </button>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-500 transition-colors hover:bg-red-50"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        <LogOut size={13} />
                        Sign out
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleBrowseClick}
                    className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    style={{
                      backgroundColor: "rgb(15, 118, 110)",
                      fontFamily: "Poppins, sans-serif",
                      boxShadow: "rgba(15, 118, 110, 0.3) 0px 2px 12px",
                    }}
                  >
                    Browse Library
                  </button>
                </div>
              ) : (
                // Login and Browse buttons when not logged in
                <>
                  <button
                    onClick={handleLoginClick}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                    style={{
                      border: "1.5px solid rgb(15, 118, 110)",
                      color: "rgb(15, 118, 110)",
                      fontFamily: "Poppins, sans-serif",
                      backgroundColor: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor =
                        "rgba(15, 118, 110, 0.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "transparent";
                    }}
                  >
                    Login
                  </button>
                  <button
                    onClick={handleBrowseClick}
                    className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    style={{
                      backgroundColor: "rgb(15, 118, 110)",
                      fontFamily: "Poppins, sans-serif",
                      boxShadow: "rgba(15, 118, 110, 0.3) 0px 2px 12px",
                    }}
                  >
                    Browse Library
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="lg:hidden p-2 rounded-xl transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X size={22} className="text-gray-700" />
              ) : (
                <Menu size={22} className="text-gray-700" />
              )}
            </button>
          </div>

          {/* Mobile Menu Drawer */}
          {isMenuOpen && (
            <div className="lg:hidden bg-white border-t border-gray-200 animate-in fade-in duration-200">
              <div className="px-4 py-4 space-y-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="block px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: isActive(link.path)
                        ? "rgba(15, 118, 110, 0.1)"
                        : "transparent",
                      color: isActive(link.path)
                        ? "rgb(15, 118, 110)"
                        : "rgb(55, 65, 81)",
                      fontWeight: isActive(link.path) ? "600" : "500",
                    }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="border-t border-gray-200 pt-3 mt-3 flex flex-col gap-2">
                  {isAuthenticated && user ? (
                    <>
                      <div className="flex items-center gap-3 rounded-xl bg-teal-50 px-3 py-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                          style={{
                            backgroundColor: "rgb(15, 118, 110)",
                            fontFamily: "Poppins, sans-serif",
                          }}
                        >
                          {readerInitial}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-green-950">
                            {readerName}
                          </p>
                          <p className="truncate text-[11px] text-gray-500">
                            {readerEmail}
                          </p>
                        </div>
                      </div>
                      {isAdmin ? (
                        <button
                          type="button"
                          onClick={() => {
                            navigate("/admin");
                            setIsMenuOpen(false);
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                          style={{
                            color: "rgb(15, 118, 110)",
                            fontFamily: "Poppins, sans-serif",
                            backgroundColor: "transparent",
                            border: "1.5px solid rgb(15, 118, 110)",
                          }}
                        >
                          <LayoutDashboard size={16} />
                          Admin
                        </button>
                      ) : null}
                      <button
                        onClick={() => {
                          handleProfileClick();
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                        style={{
                          color: "rgb(15, 118, 110)",
                          fontFamily: "Poppins, sans-serif",
                          backgroundColor: "transparent",
                          border: "1.5px solid rgb(15, 118, 110)",
                        }}
                      >
                        <User size={16} />
                        Profile
                      </button>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                        style={{
                          backgroundColor: "rgb(15, 118, 110)",
                          fontFamily: "Poppins, sans-serif",
                          boxShadow: "rgba(15, 118, 110, 0.3) 0px 2px 12px",
                        }}
                      >
                        <LogOut size={16} />
                        Sign out
                      </button>
                      <button
                        onClick={() => {
                          handleBrowseClick();
                          setIsMenuOpen(false);
                        }}
                        className="w-full px-5 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                        style={{
                          backgroundColor: "rgb(15, 118, 110)",
                          fontFamily: "Poppins, sans-serif",
                          boxShadow: "rgba(15, 118, 110, 0.3) 0px 2px 12px",
                        }}
                      >
                        Browse Library
                      </button>
                    </>
                  ) : (
                    // Login and Browse buttons when not logged in
                    <>
                      <button
                        onClick={() => {
                          handleLoginClick();
                          setIsMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                        style={{
                          border: "1.5px solid rgb(15, 118, 110)",
                          color: "rgb(15, 118, 110)",
                          fontFamily: "Poppins, sans-serif",
                          backgroundColor: "transparent",
                        }}
                      >
                        Login
                      </button>
                      <button
                        onClick={() => {
                          handleBrowseClick();
                          setIsMenuOpen(false);
                        }}
                        className="w-full px-5 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                        style={{
                          backgroundColor: "rgb(15, 118, 110)",
                          fontFamily: "Poppins, sans-serif",
                          boxShadow: "rgba(15, 118, 110, 0.3) 0px 2px 12px",
                        }}
                      >
                        Browse Library
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-gray-200 z-40">
        <div className="flex items-center justify-around h-16">
          <Link
            to="/"
            className="flex flex-col items-center justify-center w-full h-full transition-colors"
            style={{
              color: isActive("/") ? "rgb(15, 118, 110)" : "rgb(55, 65, 81)",
              borderTop: isActive("/")
                ? "3px solid rgb(15, 118, 110)"
                : "3px solid transparent",
            }}
          >
            <Home size={24} />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <button
            type="button"
            onClick={() => navigate("/books")}
            className="flex flex-col items-center justify-center w-full h-full transition-colors"
            style={{
              color: isSearchActive ? "rgb(15, 118, 110)" : "rgb(55, 65, 81)",
              borderTop: isSearchActive
                ? "3px solid rgb(15, 118, 110)"
                : "3px solid transparent",
            }}
          >
            <Search size={24} />
            <span className="text-xs mt-1">Search</span>
          </button>
          <Link
            to="/books"
            className="flex flex-col items-center justify-center w-full h-full transition-colors"
            style={{
              color: isActive("/books")
                ? "rgb(15, 118, 110)"
                : "rgb(55, 65, 81)",
              borderTop: isActive("/books")
                ? "3px solid rgb(15, 118, 110)"
                : "3px solid transparent",
            }}
          >
            <Library size={24} />
            <span className="text-xs mt-1">Library</span>
          </Link>
          <button
            type="button"
            onClick={() => navigate("/books")}
            className="flex flex-col items-center justify-center w-full h-full transition-colors text-gray-700 hover:text-teal-700"
          >
            <Download size={24} />
            <span className="text-xs mt-1">Downloads</span>
          </button>
          <button
            onClick={isAuthenticated ? handleProfileClick : handleLoginClick}
            className="flex flex-col items-center justify-center w-full h-full transition-colors"
            style={{
              color:
                isActive("/profile") && isAuthenticated
                  ? "rgb(15, 118, 110)"
                  : "rgb(55, 65, 81)",
              borderTop:
                isActive("/profile") && isAuthenticated
                  ? "3px solid rgb(15, 118, 110)"
                  : "3px solid transparent",
            }}
          >
            <User size={24} />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </nav>
    </>
  );
}

export default NavBar;
