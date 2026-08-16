export default function ReaderProgress({ currentPage, pageCount }) {
  const percentage = pageCount ? Math.min(100, (currentPage / pageCount) * 100) : 0;

  return (
    <div className="h-1.5 w-full overflow-hidden bg-stone-200">
      <div
        className="h-full bg-teal-700 transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

