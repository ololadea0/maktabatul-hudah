import {
  LIBRARY_LOGO_URL,
  LIBRARY_NAME,
  LIBRARY_TAGLINE,
} from "../../../config/branding.js";

export default function NewsletterPreview({ subject, content }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-100 bg-[#f8f5f0] p-4">
      <div className="mx-auto max-w-2xl overflow-hidden rounded-lg border border-emerald-100 bg-white">
        <div className="bg-primary px-6 py-6 text-center">
          <img src={LIBRARY_LOGO_URL} alt={`${LIBRARY_NAME} logo`} className="mx-auto mb-3 h-12 w-12 rounded-xl object-contain" />
          <p className="font-display text-xl font-bold text-white">{LIBRARY_NAME}</p>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-accent">
            {LIBRARY_TAGLINE}
          </p>
        </div>
        <div className="px-6 py-6">
          <h2 className="font-display text-2xl font-extrabold text-secondary">
            {subject || "Newsletter subject"}
          </h2>
          <div
            className="newsletter-preview mt-5 text-sm leading-7 text-gray-700"
            dangerouslySetInnerHTML={{
              __html: content || "<p>Your newsletter message will appear here.</p>",
            }}
          />
          <div className="mt-7 text-center">
            <span className="inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-bold text-secondary">
              Visit {LIBRARY_NAME}
            </span>
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 text-center text-xs leading-5 text-gray-500">
          You are receiving this email because you subscribed to {LIBRARY_NAME} updates.
          <br />
          <span className="font-semibold text-primary">Unsubscribe</span>
        </div>
      </div>
    </div>
  );
}
