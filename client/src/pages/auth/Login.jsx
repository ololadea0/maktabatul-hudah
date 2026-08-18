import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AtSign, Eye, EyeOff, Globe, Loader2, Lock, User } from "lucide-react";
import {
  forgotPassword,
  login,
  register,
  selectAuth,
  startGoogleLogin,
} from "../../features/auth/authSlice.js";
import { fetchLibraryStats } from "../../features/books/bookSlice.js";
import { LIBRARY_LOGO_URL, LIBRARY_NAME } from "../../config/branding.js";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
};

function formatStat(value) {
  const number = Number(value) || 0;

  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(number >= 10000000 ? 0 : 1)}M`;
  }

  if (number >= 1000) {
    return `${(number / 1000).toFixed(number >= 10000 ? 0 : 1)}K`;
  }

  return String(number);
}

const stackedBrandName = LIBRARY_NAME.split(/\s+/).filter(Boolean);

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const { status } = useSelector(selectAuth);
  const { stats, statsStatus } = useSelector((state) => state.books);

  const isRegistering = mode === "register";
  const isForgotPassword = mode === "forgot";
  const isSubmitting = status === "loading";
  const title = isRegistering ? `Join ${LIBRARY_NAME}` : "Welcome back";
  const subtitle = isForgotPassword
    ? "Enter your email and we will send reset instructions"
    : isRegistering
      ? "Create your free account today"
      : "Sign in to continue reading and learning";
  const submitLabel = isForgotPassword
    ? "Send Reset Link"
    : isRegistering
      ? "Create Account"
      : "Sign In";

  const googleLabel = useMemo(() => "Continue with Google", []);
  const libraryStats = useMemo(
    () => [
      [formatStat(stats?.books), "Books"],
      [formatStat(stats?.authors), "Authors"],
      [formatStat(stats?.downloads), "Downloads"],
    ],
    [stats],
  );

  useEffect(() => {
    if (statsStatus === "idle") {
      dispatch(fetchLibraryStats());
    }
  }, [dispatch, statsStatus]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setShowPassword(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      email: form.email.trim(),
      password: form.password,
    };

    // If registering, ensure we have first and last name and combine into fullName
    const action = isForgotPassword
      ? forgotPassword(form.email.trim())
      : isRegistering
        ? (() => {
            const first = (form.firstName || "").trim();
            const last = (form.lastName || "").trim();
            if (!first || !last) {
              toast.error("Please enter both first and last name.");
              return { type: "auth/abort" };
            }
            const fullName = `${first} ${last}`.trim();
            return register({ ...payload, fullName });
          })()
        : login(payload);

    if (action && action.type === "auth/abort") return;

    const result = await dispatch(action);

    if (forgotPassword.fulfilled.match(result)) {
      toast.success(result.payload.message);
      setMode("login");
      return;
    }

    if (login.fulfilled.match(result) || register.fulfilled.match(result)) {
      toast.success(result.payload.message || "Authentication successful");
      navigate("/");
      return;
    }

    toast.error(result.payload || "Something went wrong. Please try again.");
  };

  const handleGoogleAuth = () => {
    dispatch(startGoogleLogin());
  };

  return (
    <main className="flex min-h-screen bg-background font-sans">
      <section className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-secondary to-primary p-14 lg:flex">
        <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.26)_1px,transparent_0)] [background-size:32px_32px]" />

        <Link to="/" className="relative flex items-center gap-2.5">
          <img
            src={LIBRARY_LOGO_URL}
            alt={`${LIBRARY_NAME} logo`}
            className="h-11 w-11 rounded-2xl object-contain"
          />
          <div className="text-left" aria-label={LIBRARY_NAME}>
            <p
              className="flex flex-col font-bold"
              style={{
                color: "rgb(212, 238, 222)",
                fontSize: "25px",
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

        <div className="relative max-w-xl">
          <p className="mb-6 font-display text-3xl font-semibold leading-snug text-white">
            Seek knowledge with clarity, confidence, and care.
          </p>
          <p className="mb-10 text-sm leading-6 text-white/70">
            Access authentic Islamic knowledge from trusted scholars, organized
            for focused reading and steady study.
          </p>

          <div className="grid grid-cols-3 gap-5">
            {libraryStats.map(([value, label]) => (
              <div
                key={label}
                className="rounded-2xl bg-white/10 p-4 text-center"
              >
                <div className="font-display text-2xl font-bold text-white">
                  {value}
                </div>
                <div className="mt-0.5 text-xs text-white/60">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-white/50">
          Copyright 2026 {LIBRARY_NAME}. All rights reserved.
        </p>
      </section>

      <section className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <img
              src={LIBRARY_LOGO_URL}
              alt={`${LIBRARY_NAME} logo`}
              className="h-10 w-10 rounded-xl object-contain"
            />
            <span className="font-display text-lg font-bold text-secondary">
              {LIBRARY_NAME}
            </span>
          </Link>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-8 grid grid-cols-2 rounded-2xl bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => handleModeChange("login")}
                className={`rounded-xl py-2.5 text-sm font-semibold transition-all ${
                  !isRegistering
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleModeChange("register")}
                className={`rounded-xl py-2.5 text-sm font-semibold transition-all ${
                  isRegistering
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500"
                }`}
              >
                Create Account
              </button>
            </div>

            <div className="mb-6">
              <h1 className="mb-1 font-display text-2xl font-bold text-gray-900">
                {title}
              </h1>
              <p className="text-sm text-gray-500">{subtitle}</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {isRegistering && (
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-gray-700">
                      First name
                    </span>
                    <span className="relative block">
                      <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        name="firstName"
                        type="text"
                        value={form.firstName}
                        onChange={handleChange}
                        placeholder="First name"
                        required={isRegistering}
                        maxLength={50}
                        className="w-full rounded-2xl border border-gray-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-primary/25"
                      />
                    </span>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-gray-700">
                      Last name
                    </span>
                    <span className="relative block">
                      <input
                        name="lastName"
                        type="text"
                        value={form.lastName}
                        onChange={handleChange}
                        placeholder="Last name"
                        required={isRegistering}
                        maxLength={50}
                        className="w-full rounded-2xl border border-gray-200 py-3 pl-4 pr-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-primary/25"
                      />
                    </span>
                  </label>
                </div>
              )}

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-gray-700">
                  Email Address
                </span>
                <span className="relative block">
                  <AtSign className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                    className="w-full rounded-2xl border border-gray-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-primary/25"
                  />
                </span>
              </label>

              {!isForgotPassword && (
                <label className="block">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">
                      Password
                    </span>
                    {!isRegistering && (
                      <button
                        type="button"
                        onClick={() => handleModeChange("forgot")}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <span className="relative block">
                    <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Password"
                      required={!isForgotPassword}
                      minLength={isRegistering ? 8 : undefined}
                      className="w-full rounded-2xl border border-gray-200 py-3 pl-11 pr-12 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-primary/25"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </span>
                </label>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-primary to-secondary py-3.5 font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? "Please wait..." : submitLabel}
              </button>
            </form>

            {!isForgotPassword && (
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100" />
                </div>
                <div className="relative text-center">
                  <span className="bg-white px-4 text-xs text-gray-400">
                    or continue with
                  </span>
                </div>
              </div>
            )}

            {!isForgotPassword && (
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                <img
                  src="https://res.cloudinary.com/djw640wo2/image/upload/v1786786150/google_s7abln.png"
                  alt="Google"
                  className="h-4 w-4"
                />
                {googleLabel}
              </button>
            )}

            <p className="mt-6 text-center text-xs text-gray-400">
              {isForgotPassword
                ? "Remembered your password?"
                : isRegistering
                  ? "Already have an account?"
                  : "Need an account?"}{" "}
              <button
                type="button"
                onClick={() =>
                  handleModeChange(
                    isRegistering || isForgotPassword ? "login" : "register",
                  )
                }
                className="font-semibold text-primary hover:underline"
              >
                {isRegistering || isForgotPassword ? "Sign in" : "Create one"}
              </button>
            </p>
          </div>

          {/* <p className="mt-6 text-center text-xs text-gray-400">
            By continuing, you agree to our{" "}
            <button type="button" className="text-primary hover:underline">
              Terms
            </button>{" "}
            and{" "}
            <button type="button" className="text-primary hover:underline">
              Privacy Policy
            </button>
          </p> */}
        </div>
      </section>
    </main>
  );
}

export default Login;
