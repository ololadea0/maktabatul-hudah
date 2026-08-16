import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { BookOpen, Loader2 } from "lucide-react";
import { checkAuth } from "../../features/auth/authSlice.js";

function AuthSuccess() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(checkAuth())
      .unwrap()
      .then(() => {
        toast.success("Login successful");
        navigate("/", { replace: true });
      })
      .catch(() => {
        toast.error("Google sign in did not return a valid session.");
        navigate("/auth", { replace: true });
      });
  }, [dispatch, navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
      <div>
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white">
          <BookOpen className="h-6 w-6" />
        </div>
        <div className="flex items-center justify-center gap-2 text-sm font-semibold text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Completing sign in
        </div>
      </div>
    </main>
  );
}

export default AuthSuccess;
