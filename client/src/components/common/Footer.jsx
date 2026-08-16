import { Link } from "react-router-dom";
import { Globe, Mail, MapPin, Users } from "lucide-react";
import {
  LIBRARY_LOGO_URL,
  LIBRARY_NAME,
  PUBLIC_EMAIL,
  PUBLIC_WEBSITE,
} from "../../config/branding.js";

const quickLinks = [
  { label: "Home", path: "/" },
  { label: "Books", path: "/books" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
];

const categoryLinks = [
  { label: "Aqeedah", path: "/categories" },
  { label: "Fiqh", path: "/categories" },
  { label: "Tafsir", path: "/categories" },
  { label: "Hadith", path: "/categories" },
];

function Footer() {
  return (
    <footer style={{ backgroundColor: "rgb(20, 83, 45)" }}>
      <div
        className="h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgb(212, 175, 55) 40%, rgb(212, 175, 55) 60%, transparent)",
        }}
      />
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center gap-2.5">
              <img
                src={LIBRARY_LOGO_URL}
                alt={`${LIBRARY_NAME} logo`}
                className="h-10 w-10 rounded-xl object-contain"
              />
              <div>
                <p
                  style={{
                    color: "white",
                    fontSize: "17px",
                    lineHeight: 1,
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 700,
                  }}
                >
                  {LIBRARY_NAME}
                </p>
                <p
                  style={{
                    color: "rgb(212, 175, 55)",
                    fontSize: "9px",
                    letterSpacing: "0.1em",
                  }}
                >
                  SEEKING KNOWLEDGE SINCE 1444H
                </p>
              </div>
            </div>
            <p
              className="mb-6"
              style={{
                color: "rgba(255, 255, 255, 0.58)",
                lineHeight: 1.75,
                fontSize: "13px",
                maxWidth: "280px",
                fontFamily: "Inter, sans-serif",
              }}
            >
              A free digital library dedicated to preserving and sharing
              authentic Islamic knowledge from trusted scholars across
              generations.
            </p>
            <div className="flex gap-2">
              {[Globe, Mail, Users].map((Icon, index) => (
                <span
                  key={index}
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                >
                  <Icon className="text-white" size={14} />
                </span>
              ))}
            </div>
          </div>

          <FooterGroup title="Quick Links" links={quickLinks} />
          <FooterGroup title="Categories" links={categoryLinks} />
          <div>
            <h3
              className="mb-4"
              style={{
                color: "white",
                fontFamily: "Poppins, sans-serif",
                fontWeight: 700,
                fontSize: "13px",
              }}
            >
              Contact
            </h3>
            <ul className="space-y-3">
              {[
                [Mail, PUBLIC_EMAIL],
                [Globe, PUBLIC_WEBSITE],
                [MapPin, "Available Worldwide"],
              ].map(([Icon, text]) => (
                <li key={text} className="flex items-start gap-2.5">
                  <Icon
                    size={13}
                    style={{
                      color: "rgb(212, 175, 55)",
                      flexShrink: 0,
                      marginTop: "2px",
                    }}
                  />
                  <span
                    style={{
                      color: "rgba(255, 255, 255, 0.58)",
                      fontSize: "13px",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div
        className="border-t"
        style={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 sm:flex-row">
          <p style={{ color: "rgba(255, 255, 255, 0.38)", fontSize: "12px" }}>
            Copyright 2026 {LIBRARY_NAME}. All rights reserved.
          </p>
          <div className="flex gap-5">
            {["Privacy Policy", "Terms of Service", "Sitemap"].map((link) => (
              <button
                key={link}
                type="button"
                className="transition-colors hover:text-white"
                style={{
                  color: "rgba(255, 255, 255, 0.38)",
                  fontSize: "11px",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {link}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterGroup({ title, links }) {
  return (
    <div>
      <h3
        className="mb-4"
        style={{
          color: "white",
          fontFamily: "Poppins, sans-serif",
          fontWeight: 700,
          fontSize: "13px",
        }}
      >
        {title}
      </h3>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              to={link.path}
              className="transition-colors hover:text-white"
              style={{
                color: "rgba(255, 255, 255, 0.58)",
                fontSize: "13px",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Footer;
