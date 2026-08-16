import { useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import {
  Bold,
  Heading1,
  Heading2,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Undo2,
} from "lucide-react";
import NewsletterPreview from "./NewsletterPreview.jsx";
import { LIBRARY_NAME } from "../../../config/branding.js";

function ToolButton({ active, label, icon: Icon, onClick }) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm transition-colors ${
        active ? "border-primary bg-primary text-white" : "border-gray-200 text-gray-600 hover:bg-gray-50"
      }`}
    >
      <Icon size={16} />
    </button>
  );
}

export default function NewsletterEditor({
  initialSubject = "",
  initialContent = "",
  loading,
  submitLabel,
  onSubmit,
}) {
  const [subject, setSubject] = useState(initialSubject);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [testEmail, setTestEmail] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: false,
      }),
      LinkExtension.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),
    ],
    content: initialContent || "<p></p>",
    editorProps: {
      attributes: {
        class: "min-h-[260px] rounded-b-lg border-x border-b border-gray-200 bg-white px-4 py-4 text-sm leading-7 text-gray-700 outline-none",
      },
    },
  });

  const addLink = () => {
    const previous = editor.getAttributes("link").href;
    const url = window.prompt("Link URL", previous || "https://");

    if (url === null) return;
    if (!url) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const intent = event.nativeEvent.submitter?.value || "save";
    onSubmit({ subject, content: editor?.getHTML() || "", testEmail, intent });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-lg bg-white p-5 shadow-sm">
        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400">Subject</label>
        <input
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          required
          maxLength={180}
          className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
          placeholder={`New Books Added to ${LIBRARY_NAME}`}
        />
      </div>

      <div className="rounded-lg bg-white p-5 shadow-sm">
        <div className="mb-3 flex flex-wrap gap-2">
          <ToolButton label="Bold" icon={Bold} active={editor?.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} />
          <ToolButton label="Italic" icon={Italic} active={editor?.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} />
          <ToolButton label="Heading 1" icon={Heading1} active={editor?.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
          <ToolButton label="Heading 2" icon={Heading2} active={editor?.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
          <ToolButton label="Bullet list" icon={List} active={editor?.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} />
          <ToolButton label="Ordered list" icon={ListOrdered} active={editor?.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
          <ToolButton label="Blockquote" icon={Quote} active={editor?.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
          <ToolButton label="Link" icon={LinkIcon} active={editor?.isActive("link")} onClick={addLink} />
          <ToolButton label="Undo" icon={Undo2} onClick={() => editor.chain().focus().undo().run()} />
          <ToolButton label="Redo" icon={Redo2} onClick={() => editor.chain().focus().redo().run()} />
        </div>
        <div className="rounded-lg">
          <div className="rounded-t-lg border border-gray-200 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Message
          </div>
          <EditorContent editor={editor} />
        </div>
      </div>

      {previewOpen ? <NewsletterPreview subject={subject} content={editor?.getHTML()} /> : null}

      <div className="flex flex-col gap-3 rounded-lg bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <input
            type="email"
            value={testEmail}
            onChange={(event) => setTestEmail(event.target.value)}
            placeholder="Test email"
            className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            name="intent"
            value="test"
            className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary"
          >
            Send Test Email
          </button>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setPreviewOpen((value) => !value)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600">
            Preview
          </button>
          <button type="submit" disabled={loading} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {loading ? "Saving..." : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
