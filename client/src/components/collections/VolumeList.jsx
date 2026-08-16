import VolumeCard from "./VolumeCard.jsx";

export default function VolumeList({ volumes = [], collection, ...handlers }) {
  const sortedVolumes = [...volumes].sort(
    (first, second) =>
      (first.volumeNumber || Number.MAX_SAFE_INTEGER) -
        (second.volumeNumber || Number.MAX_SAFE_INTEGER) ||
      (first.title || "").localeCompare(second.title || ""),
  );

  return (
    <div className="space-y-3">
      {sortedVolumes.map((volume) => (
        <VolumeCard
          key={volume.id}
          volume={volume}
          collection={collection}
          {...handlers}
        />
      ))}
    </div>
  );
}
