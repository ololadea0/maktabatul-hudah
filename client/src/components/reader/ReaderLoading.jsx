export default function ReaderLoading({ label = "Loading page" }) {
  return (
    <div className="flex min-h-[55vh] w-full items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-100 border-t-teal-700" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

