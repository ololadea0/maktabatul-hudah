import { Layers } from "lucide-react";

export default function CollectionHeader({ collection }) {
  const count = collection?.volumesCount || collection?.volumes?.length || 0;

  return (
    <section className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <div className="aspect-[2/3] overflow-hidden rounded-3xl bg-primary shadow-[0_20px_60px_rgba(15,118,110,0.22)]">
        {collection?.coverImage ? (
          <img src={collection.coverImage} alt="" className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="min-w-0">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Layers size={13} />
          {count} {count === 1 ? "Volume" : "Volumes"}
        </p>
        <h1 className="font-display text-3xl font-extrabold leading-tight text-secondary">
          {collection?.title}
        </h1>
        {collection?.author ? (
          <p className="mt-2 font-display text-base font-semibold text-primary">
            by {collection.author}
          </p>
        ) : null}
        <div className="mt-6 grid gap-3 text-sm text-gray-600 sm:grid-cols-2">
          {collection?.language ? <Info label="Language" value={collection.language} /> : null}
          {collection?.createdAt ? <Info label="Added" value={new Date(collection.createdAt).toLocaleDateString()} /> : null}
        </div>
        {collection?.description ? (
          <p className="mt-6 max-w-3xl text-sm leading-8 text-gray-600">
            {collection.description}
          </p>
        ) : null}
      </div>
    </section>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)] ring-1 ring-primary/10">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 font-display text-sm font-bold text-secondary">{value}</p>
    </div>
  );
}
