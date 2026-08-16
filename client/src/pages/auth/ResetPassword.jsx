import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { resetPassword, selectAuth } from "../../features/auth/authSlice.js";
import { LIBRARY_LOGO_URL, LIBRARY_NAME } from "../../config/branding.js";

function ResetPassword() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useParams();
  const { status } = useSelector(selectAuth);
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const isSubmitting = status === "loading";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const result = await dispatch(
      resetPassword({
        token,
        password: form.password,
        confirmPassword: form.confirmPassword,
      }),
    );

    if (resetPassword.fulfilled.match(result)) {
      toast.success(result.payload.message || "Password reset successful");
      navigate("/", { replace: true });
      return;
    }

    toast.error(result.payload || "Could not reset password.");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-8">
      <section className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <Link to="/" className="mb-8 flex items-center gap-2">
          <img src={LIBRARY_LOGO_URL} alt={`${LIBRARY_NAME} logo`} className="h-10 w-10 rounded-xl object-contain" />
          <span className="font-display text-lg font-bold text-secondary">{LIBRARY_NAME}</span>
        </Link>

        <div className="mb-6">
          <h1 className="mb-1 font-display text-2xl font-bold text-gray-900">Reset password</h1>
          <p className="text-sm text-gray-500">Choose a new password for your account.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-700">New Password</span>
            <span className="relative block">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                required
                minLength={8}
                className="w-full rounded-2xl border border-gray-200 py-3 pl-11 pr-12 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-primary/25"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-700">
              Confirm Password
            </span>
            <span className="relative block">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                required
                minLength={8}
                className="w-full rounded-2xl border border-gray-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-primary/25"
              />
            </span>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-primary to-secondary py-3.5 font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? "Please wait..." : "Reset Password"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          Back to{" "}
          <Link to="/auth" className="font-semibold text-primary hover:underline">
            sign in
          </Link>
        </p>
      </section>
    </main>
  );
}

export default ResetPassword;
