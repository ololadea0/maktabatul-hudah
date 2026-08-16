import { useEffect } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import VolumeList from "../../components/collections/VolumeList.jsx";
import { deleteBook, downloadBook } from "../../features/books/bookSlice.js";
import { getCollection } from "../../features/collections/collectionSlice.js";

export default function CollectionVolumes() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { selectedCollection, selectedStatus } = useSelector((state) => state.collections);

  useEffect(() => {
    dispatch(getCollection(id));
  }, [dispatch, id]);

  const handleDelete = async (volume) => {
    if (!window.confirm(`Delete "${volume.title}"?`)) return;
    try {
      await dispatch(deleteBook(volume.id)).unwrap();
      await dispatch(getCollection(id));
      toast.success("Volume deleted");
    } catch (error) {
      toast.error(error || "Failed to delete volume.");
    }
  };

  const handleDownload = async (volume) => {
    const result = await dispatch(downloadBook(volume.id));
    const pdfUrl = result.payload?.data?.pdfUrl || volume.pdfUrl;
    if (pdfUrl) window.open(pdfUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <button onClick={() => navigate("/admin/collections")} className="mb-3 inline-flex items-center gap-2 text-xs font-semibold text-gray-500">
            <ArrowLeft size={14} />
            Collections
          </button>
          <h1 className="font-display text-xl font-bold text-secondary">
            {selectedCollection?.title || "Collection Volumes"}
          </h1>
          <p className="mt-1 text-xs text-gray-400">
            {selectedCollection?.volumes?.length || 0} volumes
          </p>
        </div>
        <button onClick={() => navigate(`/admin/upload?collectionId=${id}`)} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-display text-sm font-semibold text-white">
          <Plus size={15} />
          Add Volume
        </button>
      </div>

      {selectedStatus === "loading" ? (
        <div className="h-48 animate-pulse rounded-2xl bg-white" />
      ) : (
        <VolumeList
          volumes={selectedCollection?.volumes || []}
          collection={selectedCollection}
          admin
          onRead={(volume) => navigate(`/read/${volume.id}`)}
          onDownload={handleDownload}
          onOpen={(volume) => navigate(`/books/${volume.slug}`)}
          onEdit={(volume) => navigate(`/admin/upload?edit=${volume.id}`)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
