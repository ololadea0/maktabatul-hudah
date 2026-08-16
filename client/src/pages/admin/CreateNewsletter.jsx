import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import NewsletterEditor from "../../components/admin/newsletters/NewsletterEditor.jsx";
import {
  createNewsletter,
  sendTestNewsletter,
} from "../../features/newsletters/newsletterSlice.js";

export default function CreateNewsletter() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.newsletters);

  const handleSubmit = async ({ subject, content, testEmail, intent }) => {
    const created = await dispatch(createNewsletter({ subject, content }));

    if (!createNewsletter.fulfilled.match(created)) {
      toast.error(created.payload || "Unable to save newsletter");
      return;
    }

    const newsletter = created.payload.data?.newsletter;

    if (intent === "test") {
      if (!testEmail) {
        toast.error("Enter a test email address first");
        return;
      }

      const result = await dispatch(sendTestNewsletter({ id: newsletter.id, email: testEmail }));
      if (sendTestNewsletter.fulfilled.match(result)) {
        toast.success("Test email sent");
      } else {
        toast.error(result.payload || "Unable to send test email");
      }
      return;
    }

    toast.success("Newsletter draft created");
    navigate(`/admin/newsletters/${newsletter.id}/edit`);
  };

  return (
    <div className="space-y-5 p-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-secondary">Create Newsletter</h1>
        <p className="mt-1 text-sm text-gray-500">Write, preview, and save a draft before sending.</p>
      </div>
      <NewsletterEditor loading={loading} submitLabel="Save Draft" onSubmit={handleSubmit} />
    </div>
  );
}
