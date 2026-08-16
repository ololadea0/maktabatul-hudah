import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import NewsletterEditor from "../../components/admin/newsletters/NewsletterEditor.jsx";
import SendNewsletterModal from "../../components/admin/newsletters/SendNewsletterModal.jsx";
import {
  fetchNewsletter,
  fetchNewsletters,
  sendNewsletter,
  sendTestNewsletter,
  updateNewsletter,
} from "../../features/newsletters/newsletterSlice.js";

export default function EditNewsletter() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedNewsletter, loading, activeSubscriberCount } = useSelector((state) => state.newsletters);
  const [sendOpen, setSendOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchNewsletter(id));
    dispatch(fetchNewsletters());
  }, [dispatch, id]);

  const handleSubmit = async ({ subject, content, testEmail, intent }) => {
    const result = await dispatch(updateNewsletter({ id, payload: { subject, content } }));

    if (!updateNewsletter.fulfilled.match(result)) {
      toast.error(result.payload || "Unable to update newsletter");
      return;
    }

    if (intent === "test") {
      if (!testEmail) {
        toast.error("Enter a test email address first");
        return;
      }

      const testResult = await dispatch(sendTestNewsletter({ id, email: testEmail }));
      if (sendTestNewsletter.fulfilled.match(testResult)) {
        toast.success("Test email sent");
      } else {
        toast.error(testResult.payload || "Unable to send test email");
      }
      return;
    }

    toast.success("Newsletter saved");
  };

  const handleSend = async () => {
    const result = await dispatch(sendNewsletter(id));

    if (sendNewsletter.fulfilled.match(result)) {
      toast.success("Newsletter sent");
      setSendOpen(false);
      navigate("/admin/newsletters");
    } else {
      toast.error(result.payload || "Unable to send newsletter");
    }
  };

  if (!selectedNewsletter && loading) {
    return <div className="p-6 text-sm text-gray-500">Loading newsletter...</div>;
  }

  return (
    <div className="space-y-5 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-secondary">Edit Newsletter</h1>
          <p className="mt-1 text-sm text-gray-500">Drafts can be edited and sent once.</p>
        </div>
        {selectedNewsletter?.status === "DRAFT" ? (
          <button type="button" onClick={() => setSendOpen(true)} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
            Send Newsletter
          </button>
        ) : null}
      </div>
      {selectedNewsletter ? (
        <NewsletterEditor
          key={selectedNewsletter.id}
          initialSubject={selectedNewsletter.subject}
          initialContent={selectedNewsletter.content}
          loading={loading}
          submitLabel="Save Changes"
          onSubmit={handleSubmit}
        />
      ) : (
        <div className="rounded-lg bg-white p-8 text-sm text-gray-500 shadow-sm">Newsletter not found.</div>
      )}
      <SendNewsletterModal
        open={sendOpen}
        subject={selectedNewsletter?.subject}
        recipients={activeSubscriberCount}
        loading={loading}
        onClose={() => setSendOpen(false)}
        onConfirm={handleSend}
      />
    </div>
  );
}
