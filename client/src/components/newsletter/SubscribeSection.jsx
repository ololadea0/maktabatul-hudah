import { useState } from "react";
import { Bell } from "lucide-react";
import { subscribeRequest } from "../../features/newsletters/newsletterAPI.js";
import { LIBRARY_NAME } from "../../config/branding.js";

export default function SubscribeSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const { data } = await subscribeRequest(email);
      setStatus("succeeded");
      setEmail("");
      setMessage(data.message || "You're subscribed! Check your inbox for future updates.");
    } catch (error) {
      setStatus("failed");
      setMessage(error.response?.data?.message || "Unable to subscribe right now. Please try again.");
    }
  };

  return (
    <section
      className="scroll-reveal relative py-20 overflow-hidden"
      style={{
        background:
          "linear-gradient(145deg, rgb(248, 245, 240) 0%, rgb(236, 253, 245) 100%)",
      }}
    >
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div
          className="w-14 h-14 rounded-2xl mx-auto mb-6 flex items-center justify-center"
          style={{
            backgroundColor: "rgb(15, 118, 110)",
            color: "white",
          }}
        >
          <Bell size={26} />
        </div>
        <div className="max-w-2xl mb-9 mx-auto text-center">
          <p className="mb-3 text-[13px] font-bold text-primary" style={{ fontFamily: "Poppins, sans-serif" }}>
            Stay Updated
          </p>
          <h2
            className="text-3xl sm:text-4xl mb-3"
            style={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 800,
              color: "rgb(20, 83, 45)",
              lineHeight: 1.12,
            }}
          >
            Get notified when new books and features are added
          </h2>
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              color: "rgb(75, 85, 99)",
              lineHeight: 1.8,
              fontSize: "16px",
            }}
          >
            Subscribe for collection updates, featured reads, and important additions to {LIBRARY_NAME}.
          </p>
        </div>

        <form className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto" onSubmit={handleSubmit}>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 rounded-xl outline-none bg-white text-sm"
            style={{
              border: "1px solid rgba(15, 118, 110, 0.14)",
              color: "rgb(20, 83, 45)",
            }}
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="px-6 py-3 rounded-xl text-sm font-semibold disabled:opacity-60"
            style={{
              backgroundColor: "rgb(212, 175, 55)",
              color: "rgb(20, 83, 45)",
              fontFamily: "Poppins, sans-serif",
            }}
          >
            {status === "loading" ? "Subscribing..." : "Subscribe"}
          </button>
        </form>
        {message ? (
          <p className={`mt-4 text-sm font-semibold ${status === "failed" ? "text-red-600" : "text-primary"}`}>
            {message}
          </p>
        ) : null}
      </div>
    </section>
  );
}
