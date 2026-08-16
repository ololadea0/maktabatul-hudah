import { useEffect } from "react";
import { ShieldCheck, User, Users } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminDashboard } from "../../features/users/userSlice.js";
import { SUPPORT_EMAIL } from "../../config/branding.js";

export default function AdminUsers() {
  const dispatch = useDispatch();
  const { dashboard, status, error } = useSelector((state) => state.users);
  const currentUser = useSelector((state) => state.auth.user);
  const totalUsers = dashboard?.totals?.users || 0;

  useEffect(() => {
    dispatch(fetchAdminDashboard());
  }, [dispatch]);

  return (
    <div className="space-y-5 p-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-lg bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users size={17} />
          </div>
          <p className="font-display text-3xl font-extrabold text-secondary">{totalUsers}</p>
          <p className="text-xs text-gray-500">Registered users</p>
        </div>
        <div className="rounded-lg bg-white p-5 shadow-sm">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <ShieldCheck size={17} />
          </div>
          <p className="font-display text-3xl font-extrabold text-secondary">1</p>
          <p className="text-xs text-gray-500">Active admin session</p>
        </div>
      </div>

      {status === "failed" ? <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      <section className="overflow-hidden rounded-lg bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h1 className="font-display text-base font-bold text-secondary">Users</h1>
          <p className="text-xs text-gray-500">Current API exposes user totals; full user listing can plug in here when the endpoint is added.</p>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between rounded-lg border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
                <User size={17} />
              </div>
              <div>
                <p className="font-display text-sm font-bold text-secondary">{currentUser?.fullName || "Admin User"}</p>
                <p className="text-xs text-gray-500">{currentUser?.email || SUPPORT_EMAIL}</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
              Administrator
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
