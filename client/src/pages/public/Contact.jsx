import { useMemo, useState } from "react";
import { Globe, Mail, Send } from "lucide-react";
import Footer from "../../components/common/Footer.jsx";
import { PUBLIC_EMAIL, PUBLIC_WEBSITE } from "../../config/branding.js";
import { sendContactMessage } from "../../services/contactAPI.js";

const initialForm = {
  name: "",
  email: "",
  subject: "General Inquiry",
  message: "",
};

const subjectOptions = [
  "General Inquiry",
  "Book Suggestion",
  "Partnership / Collaboration",
  "Technical Support",
  "Volunteer / Contribute",
  "Other",
];

const fieldLimits = {
  name: 100,
  subject: 150,
  message: 3000,
};

function Contact() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle");
  const [feedback, setFeedback] = useState("");
  const [errors, setErrors] = useState({});

  const contactItems = useMemo(
    () =>
      [
        PUBLIC_EMAIL
          ? {
              title: "Email Us",
              value: PUBLIC_EMAIL,
              note: "Send questions, suggestions, or support requests.",
              href: `mailto:${PUBLIC_EMAIL}`,
              icon: Mail,
            }
          : null,
        PUBLIC_WEBSITE
          ? {
              title: "Website",
              value: PUBLIC_WEBSITE,
              note: "Visit the online library.",
              href: PUBLIC_WEBSITE.startsWith("http")
                ? PUBLIC_WEBSITE
                : `https://${PUBLIC_WEBSITE}`,
              icon: Globe,
            }
          : null,
      ].filter(Boolean),
    [],
  );

  const validateForm = () => {
    const nextErrors = {};
    const trimmed = {
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
    };

    if (!trimmed.name) nextErrors.name = "Name is required.";
    if (trimmed.name.length > fieldLimits.name) {
      nextErrors.name = `Name must be ${fieldLimits.name} characters or fewer.`;
    }

    if (!trimmed.email) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed.email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!trimmed.subject) nextErrors.subject = "Subject is required.";
    if (trimmed.subject.length > fieldLimits.subject) {
      nextErrors.subject = `Subject must be ${fieldLimits.subject} characters or fewer.`;
    }

    if (!trimmed.message) nextErrors.message = "Message is required.";
    if (trimmed.message.length > fieldLimits.message) {
      nextErrors.message = `Message must be ${fieldLimits.message} characters or fewer.`;
    }

    setErrors(nextErrors);
    return { isValid: Object.keys(nextErrors).length === 0, trimmed };
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    if (status !== "submitting") {
      setStatus("idle");
      setFeedback("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { isValid, trimmed } = validateForm();

    if (!isValid) {
      setStatus("error");
      setFeedback("Please correct the highlighted fields.");
      return;
    }

    setStatus("submitting");
    setFeedback("");

    try {
      const result = await sendContactMessage(trimmed);
      setForm(initialForm);
      setStatus("success");
      setFeedback(
        result?.message ||
          "Your message has been sent successfully. We'll get back to you soon.",
      );
      setErrors({});
    } catch (error) {
      const response = error?.response?.data;
      const nextErrors = {};

      response?.errors?.forEach((item) => {
        if (item.field) nextErrors[item.field] = item.message;
      });

      setErrors(nextErrors);
      setStatus("error");
      setFeedback(
        response?.message ||
          "Unable to send your message right now. Please try again.",
      );
    }
  };

  return (
    <div
      className="min-h-screen bg-white"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <section className="relative overflow-hidden py-20 sm:py-12">
        <PatternBackground id="contact-hero-pattern" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(150deg, rgb(248, 245, 240) 0%, rgba(255, 255, 255, 0.94) 60%, rgb(236, 253, 245) 100%)",
          }}
        />
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <span className="mb-4 block text-xs font-bold uppercase tracking-widest text-teal-700">
            Reach Out
          </span>
          <h1
            className="text-4xl font-bold leading-tight text-green-950 sm:text-6xl"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Contact <span className="text-teal-700">Us</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Have a question, suggestion, or need help with something? Send us a
            message and we&apos;ll get back to you.
          </p>
        </div>
      </section>

      {contactItems.length > 0 ? (
        <section className="bg-white py-14">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {contactItems.map((item) => {
                const Icon = item.icon;

                return (
                  <a
                    key={item.title}
                    href={item.href}
                    className="flex flex-col items-center gap-4 rounded-2xl border border-gray-100 p-7 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    style={{ background: "rgb(248, 245, 240)" }}
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                      <Icon size={24} />
                    </span>
                    <span>
                      <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-gray-400">
                        {item.title}
                      </span>
                      <span
                        className="block font-semibold text-gray-900"
                        style={{ fontFamily: "Poppins, sans-serif" }}
                      >
                        {item.value}
                      </span>
                      <span className="mt-1 block text-xs text-gray-500">
                        {item.note}
                      </span>
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <section className="py-10 pb-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-5 lg:px-8">
          <div className="lg:col-span-3">
            <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm sm:p-10">
              <h2
                className="mb-1 text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Send a Message
              </h2>
              <p className="mb-8 text-sm text-gray-400">
                All fields are required.
              </p>

              {feedback ? (
                <div
                  className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
                    status === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                  role="status"
                >
                  {feedback}
                </div>
              ) : null}

              <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FormField
                    label="Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    error={errors.name}
                    maxLength={fieldLimits.name}
                    placeholder="Your full name"
                  />
                  <FormField
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    error={errors.email}
                    placeholder="your@email.com"
                  />
                </div>

                <SubjectSelect
                  label="Subject"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  error={errors.subject}
                />

                <div>
                  <label
                    htmlFor="contact-message"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows="6"
                    value={form.message}
                    onChange={handleChange}
                    maxLength={fieldLimits.message}
                    placeholder="Tell us how we can help..."
                    className={`w-full resize-none rounded-2xl border px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-700/25 ${
                      errors.message ? "border-red-300" : "border-gray-200"
                    }`}
                    required
                  />
                  {errors.message ? (
                    <p className="mt-2 text-xs text-red-600">
                      {errors.message}
                    </p>
                  ) : null}
                </div>

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-teal-700 to-green-950 py-4 font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  <Send size={17} />
                  {status === "submitting" ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>

          <aside className="lg:col-span-2">
            <h2
              className="mb-2 text-2xl font-bold text-gray-900"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Support
            </h2>
            <p className="mb-8 text-sm leading-7 text-gray-500">
              Use the form for book suggestions, account questions, technical
              issues, or general library feedback.
            </p>
            <div
              className="rounded-2xl border border-gray-100 p-6"
              style={{ background: "rgb(248, 245, 240)" }}
            >
              <h3
                className="mb-2 font-bold text-gray-900"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Helpful details to include
              </h3>
              <ul className="space-y-3 text-sm leading-7 text-gray-600">
                <li>The book title or page you are asking about.</li>
                <li>A short description of the issue or suggestion.</li>
                <li>The device or browser if you need technical help.</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  maxLength,
  placeholder,
}) {
  const fieldId = `contact-${name}`;

  return (
    <div>
      <label
        htmlFor={fieldId}
        className="mb-2 block text-sm font-semibold text-gray-700"
      >
        {label}
      </label>
      <input
        id={fieldId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        placeholder={placeholder}
        className={`w-full rounded-2xl border px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-700/25 ${
          error ? "border-red-300" : "border-gray-200"
        }`}
        required
      />
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function SubjectSelect({ label, name, value, onChange, error }) {
  const fieldId = `contact-${name}`;

  return (
    <div>
      <label
        htmlFor={fieldId}
        className="mb-2 block text-sm font-semibold text-gray-700"
      >
        {label}
      </label>
      <select
        id={fieldId}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-700/25 ${
          error ? "border-red-300" : "border-gray-200"
        }`}
        required
      >
        {subjectOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function PatternBackground({ id }) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id={id}
          x="0"
          y="0"
          width="72"
          height="72"
          patternUnits="userSpaceOnUse"
        >
          <g fill="none" stroke="#0F766E" strokeWidth="0.7">
            <polygon
              opacity="0.05"
              points="36,4 43.2,28.8 68,28.8 47.6,43.6 55.2,68 36,53.4 16.8,68 24.4,43.6 4,28.8 28.8,28.8"
            />
            <rect
              opacity="0.03"
              x="18"
              y="18"
              width="36"
              height="36"
              transform="rotate(45 36 36)"
            />
            <rect opacity="0.015" x="2" y="2" width="68" height="68" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

export default Contact;
