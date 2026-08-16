import { AlertTriangle, Send, X } from "lucide-react";

export default function SendNewsletterModal({
  open,
  subject,
  recipients,
  loading,
  onClose,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-accent" />
            <h2 className="font-display text-sm font-bold text-secondary">Send this newsletter?</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>
        <div className="space-y-4 px-5 py-5 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Subject</p>
            <p className="mt-1 font-display font-bold text-secondary">{subject}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Recipients</p>
            <p className="mt-1 font-display font-bold text-secondary">{recipients} active subscribers</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600">
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading || recipients < 1}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Send size={14} />
            {loading ? "Sending..." : "Send Newsletter"}
          </button>
        </div>
      </div>
    </div>
  );
}
