import { BookOpen, Download, Edit2, Trash2 } from "lucide-react";

export default function VolumeCard({
  volume,
  collection,
  onRead,
  onDownload,
  onOpen,
  onEdit,
  onDelete,
  admin = false,
}) {
  const title = volume.title || `Volume ${volume.volumeNumber || ""}`.trim();
  const coverImage = volume.coverImage || collection?.coverImage;

  return (
    <article className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.055)] ring-1 ring-primary/10 sm:flex-row sm:items-center">
      {coverImage ? (
        <img src={coverImage} alt="" className="h-24 w-16 shrink-0 rounded-xl object-cover" />
      ) : (
        <div className="h-24 w-16 shrink-0 rounded-xl bg-primary/80" />
      )}
      <div className="min-w-0 flex-1">
        <p className="font-display text-sm font-bold text-secondary">
          {volume.volumeNumber ? `Volume ${volume.volumeNumber}` : "Volume"}
        </p>
        <p className="mt-1 line-clamp-1 text-sm text-gray-600">{title}</p>
        <p className="mt-2 text-xs text-gray-400">
          {volume.pages || volume.pageCount || "-"} pages
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onRead?.(volume)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white"
        >
          <BookOpen size={13} />
          Read
        </button>
        <button
          type="button"
          onClick={() => onDownload?.(volume)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-primary px-4 py-2 text-xs font-semibold text-primary"
        >
          <Download size={13} />
          Download
        </button>
        {onOpen ? (
          <button type="button" onClick={() => onOpen(volume)} className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600">
            Details
          </button>
        ) : null}
        {admin ? (
          <>
            <button type="button" aria-label="Edit volume" onClick={() => onEdit?.(volume)} className="rounded-xl p-2 text-gray-500 hover:bg-gray-100">
              <Edit2 size={14} />
            </button>
            <button type="button" aria-label="Delete volume" onClick={() => onDelete?.(volume)} className="rounded-xl p-2 text-red-500 hover:bg-red-50">
              <Trash2 size={14} />
            </button>
          </>
        ) : null}
      </div>
    </article>
  );
}
