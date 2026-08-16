import ReaderLoading from "./ReaderLoading.jsx";

export default function ReaderPage({ pageUrl, pageNumber, zoom, loading }) {
  return (
    <section className="flex min-h-[calc(100vh-190px)] justify-center overflow-auto bg-stone-100 px-3 py-5 sm:px-6">
      <div className="flex w-full justify-center">
        {loading && !pageUrl ? (
          <ReaderLoading />
        ) : pageUrl ? (
          <img
            src={pageUrl}
            alt={`Page ${pageNumber}`}
            className="h-auto max-w-full self-start bg-white shadow-[0_10px_35px_rgba(20,83,45,0.14)] ring-1 ring-stone-200"
            style={{
              width: `${zoom}%`,
              maxWidth: "1100px",
            }}
          />
        ) : (
          <div className="flex min-h-[55vh] items-center justify-center text-sm text-stone-500">
            Page image is not available.
          </div>
        )}
      </div>
    </section>
  );
}

