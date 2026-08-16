import { Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { LIBRARY_NAME, SUPPORT_EMAIL } from "../../config/branding.js";

const initialSettings = {
  libraryName: LIBRARY_NAME,
  supportEmail: SUPPORT_EMAIL,
  allowRegistration: true,
  requireReview: true,
};

export default function AdminSettings() {
  const [settings, setSettings] = useState(initialSettings);

  const updateSetting = (field, value) => {
    setSettings((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    toast.success("App settings saved locally");
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5 rounded-lg bg-white p-5 shadow-sm">
        <div>
          <h1 className="font-display text-base font-bold text-secondary">App Settings</h1>
          <p className="mt-1 text-xs text-gray-500">Manage visible library configuration.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm text-gray-600">
            <span>Library name</span>
            <input className="w-full rounded-lg bg-input-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" value={settings.libraryName} onChange={(event) => updateSetting("libraryName", event.target.value)} />
          </label>
          <label className="space-y-1 text-sm text-gray-600">
            <span>Support email</span>
            <input className="w-full rounded-lg bg-input-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" value={settings.supportEmail} onChange={(event) => updateSetting("supportEmail", event.target.value)} />
          </label>
        </div>
        <div className="space-y-3 rounded-lg bg-gray-50 p-4">
          <label className="flex items-center justify-between gap-4 text-sm text-gray-700">
            Allow new registrations
            <input type="checkbox" checked={settings.allowRegistration} onChange={(event) => updateSetting("allowRegistration", event.target.checked)} />
          </label>
          <label className="flex items-center justify-between gap-4 text-sm text-gray-700">
            Review new books before publishing
            <input type="checkbox" checked={settings.requireReview} onChange={(event) => updateSetting("requireReview", event.target.checked)} />
          </label>
        </div>
        <button type="submit" className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
          <Save size={15} />
          Save Settings
        </button>
      </form>
    </div>
  );
}
