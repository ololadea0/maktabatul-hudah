import { Link } from "react-router-dom";
import { BookOpen, ChevronRight, Download, Grid3X3 } from "lucide-react";
import Footer from "../../components/common/Footer.jsx";
import {
  LIBRARY_LOGO_URL,
  LIBRARY_NAME,
  LIBRARY_TAGLINE,
} from "../../config/branding.js";

const features = [
  {
    title: "Read Islamic books online",
    description:
      "Open available titles in the browser and continue learning from any device.",
    icon: BookOpen,
  },
  {
    title: "Download available books",
    description:
      "Save books that are offered for download so your study can continue offline.",
    icon: Download,
  },
  {
    title: "Browse by categories",
    description:
      "Move through subjects and collections to find books that match your study goals.",
    icon: Grid3X3,
  },
];

function About() {
  return (
    <div
      className="min-h-screen bg-white"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <section className="relative overflow-hidden py-20 sm:py-12">
        <PatternBackground
          id="about-hero-pattern"
          stroke="#0F766E"
          opacity="0.05"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(150deg, rgb(248, 245, 240) 0%, rgba(255, 255, 255, 0.92) 55%, rgb(236, 253, 245) 100%)",
          }}
        />
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <span className="mb-4 block text-xs font-bold uppercase tracking-widest text-teal-700">
            Our Story
          </span>
          <h1
            className="text-4xl font-bold leading-tight text-green-950 sm:text-6xl"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Knowledge Is a
            <br />
            <span className="text-teal-700">Sacred Trust</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            {LIBRARY_NAME} is a simple digital library for accessing Islamic
            books with ease. It helps readers discover beneficial knowledge,
            read online, and download available titles from one quiet, focused
            place.
          </p>
          <Link
            to="/books"
            className="mt-10 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-teal-700 to-green-950 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-teal-900/20 transition hover:-translate-y-0.5"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Explore the Library
            <ChevronRight size={18} />
          </Link>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-12">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <span className="mb-4 block text-xs font-bold uppercase tracking-widest text-teal-700">
              Our Mission
            </span>
            <h1
              className="max-w-3xl text-3xl font-bold leading-tight text-green-950 sm:text-4xl"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Bringing beneficial Islamic reading closer to every home
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-600">
              The library is built around the reader: clear browsing, online
              reading, and available downloads. Nothing on this page is pulled
              from the database, so it stays stable while the collection itself
              continues to grow.
            </p>
            <p className="mt-5 max-w-2xl leading-8 text-gray-600">
              Our aim is practical access. Readers should be able to find a
              category, open a book, and continue their study without noise or
              unnecessary steps.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[48px] bg-gradient-to-br from-teal-700 to-amber-400 opacity-15 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-teal-100 bg-white shadow-2xl shadow-teal-900/10">
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <img
                    src={LIBRARY_LOGO_URL}
                    alt={`${LIBRARY_NAME} logo`}
                    className="h-14 w-14 rounded-2xl object-contain"
                  />
                  <div>
                    <p
                      className="text-lg font-bold text-green-950"
                      style={{ fontFamily: "Poppins, sans-serif" }}
                    >
                      {LIBRARY_NAME}
                    </p>
                    <p className="text-sm text-teal-700">{LIBRARY_TAGLINE}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="mb-3 block text-xs font-bold uppercase tracking-widest text-teal-700">
              What you can do
            </span>
            <h2
              className="text-3xl font-bold text-green-950 sm:text-4xl"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              A library experience made for readers
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                    <Icon size={24} />
                  </div>
                  <h3
                    className="text-lg font-bold text-gray-950"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function PatternBackground({ id, opacity, stroke }) {
  return (
    <svg
      className="absolute inset-0 h-full w-full pointer-events-none"
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
          <g fill="none" stroke={stroke} strokeWidth="0.7">
            <polygon
              opacity={opacity}
              points="36,4 43.2,28.8 68,28.8 47.6,43.6 55.2,68 36,53.4 16.8,68 24.4,43.6 4,28.8 28.8,28.8"
            />
            <rect
              opacity={Number(opacity) * 0.6}
              x="18"
              y="18"
              width="36"
              height="36"
              transform="rotate(45 36 36)"
            />
            <rect
              opacity={Number(opacity) * 0.3}
              x="2"
              y="2"
              width="68"
              height="68"
            />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

export default About;
