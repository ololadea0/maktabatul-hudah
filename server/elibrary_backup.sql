--
-- PostgreSQL database dump
--

\restrict wPk1Bu8MQUziTIcqt50HXzyejhI1fekIvepxZ7HrPDMW2fdjMXTG4DxY75oxN3d

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AuthProvider; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AuthProvider" AS ENUM (
    'LOCAL',
    'GOOGLE'
);


ALTER TYPE public."AuthProvider" OWNER TO postgres;

--
-- Name: BookProcessingStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."BookProcessingStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'READY',
    'FAILED'
);


ALTER TYPE public."BookProcessingStatus" OWNER TO postgres;

--
-- Name: NewsletterStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."NewsletterStatus" AS ENUM (
    'DRAFT',
    'SENT'
);


ALTER TYPE public."NewsletterStatus" OWNER TO postgres;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'USER',
    'ADMIN'
);


ALTER TYPE public."Role" OWNER TO postgres;

--
-- Name: SubscriberStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SubscriberStatus" AS ENUM (
    'ACTIVE',
    'UNSUBSCRIBED'
);


ALTER TYPE public."SubscriberStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Book; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Book" (
    id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    author text NOT NULL,
    description text,
    isbn text,
    "coverImage" text,
    "fileUrl" text,
    language text DEFAULT 'English'::text NOT NULL,
    publisher text,
    "publicationYear" integer,
    pages integer,
    "fileSize" integer,
    downloads integer DEFAULT 0 NOT NULL,
    "isPublished" boolean DEFAULT true NOT NULL,
    "categoryId" text NOT NULL,
    "uploadedById" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "coverImagePublicId" text,
    "filePublicId" text,
    "volumeSet" text,
    "volumeNumber" integer,
    "totalVolumes" integer,
    about text,
    "processingStatus" public."BookProcessingStatus" DEFAULT 'PENDING'::public."BookProcessingStatus" NOT NULL,
    "collectionId" text
);


ALTER TABLE public."Book" OWNER TO postgres;

--
-- Name: BookCollection; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."BookCollection" (
    id text NOT NULL,
    title text NOT NULL,
    author text,
    description text,
    language text,
    "coverImage" text,
    "coverImagePublicId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."BookCollection" OWNER TO postgres;

--
-- Name: Category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Category" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    icon text
);


ALTER TABLE public."Category" OWNER TO postgres;

--
-- Name: Newsletter; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Newsletter" (
    id text NOT NULL,
    subject text NOT NULL,
    content text NOT NULL,
    status public."NewsletterStatus" DEFAULT 'DRAFT'::public."NewsletterStatus" NOT NULL,
    "sentAt" timestamp(3) without time zone,
    "recipientCount" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Newsletter" OWNER TO postgres;

--
-- Name: ReadingProgress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ReadingProgress" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "bookId" text NOT NULL,
    "currentPage" integer DEFAULT 1 NOT NULL,
    progress double precision DEFAULT 0 NOT NULL,
    "lastReadAt" timestamp(3) without time zone NOT NULL,
    zoom double precision DEFAULT 1 NOT NULL
);


ALTER TABLE public."ReadingProgress" OWNER TO postgres;

--
-- Name: SavedBook; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SavedBook" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "bookId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."SavedBook" OWNER TO postgres;

--
-- Name: Subscriber; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Subscriber" (
    id text NOT NULL,
    email text NOT NULL,
    status public."SubscriberStatus" DEFAULT 'ACTIVE'::public."SubscriberStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Subscriber" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    "fullName" text NOT NULL,
    email text NOT NULL,
    password text,
    provider public."AuthProvider" DEFAULT 'LOCAL'::public."AuthProvider" NOT NULL,
    "googleId" text,
    avatar text,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    "resetPasswordToken" text,
    "resetPasswordExpires" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: Book; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Book" (id, title, slug, author, description, isbn, "coverImage", "fileUrl", language, publisher, "publicationYear", pages, "fileSize", downloads, "isPublished", "categoryId", "uploadedById", "createdAt", "updatedAt", "coverImagePublicId", "filePublicId", "volumeSet", "volumeNumber", "totalVolumes", about, "processingStatus", "collectionId") FROM stdin;
cmsmf6vei0001krgwqo9t7uhu	Musnad Imam Ahmad bin Hanbal	musnad-imam-ahmad-bin-hanbal-musnad-imam-ahmad-bin-hanbal-volume-1	Imam Ahmad bin Hanbal	One of the greatest compilations of the sunnah and books of hadith is the Musnad by Imam Ahmad bin Hanbal	978-603-500-108-3	https://res.cloudinary.com/djw640wo2/image/upload/v1786317280/al-ilm-library/books/covers/aiydd0p8pv6ctydbuhx2.webp	books/1786317280620-musnadahmadbinhanbalarabic-englishtranslation-volume1.pdf	English	Darussalam Publications	2012	626	12153988	0	t	cmsm4pni80001krn0nkqwguea	cmrdabb5k0001kr3guupuqp8n	2026-08-09 23:14:46.264	2026-08-13 17:28:53.641	al-ilm-library/books/covers/aiydd0p8pv6ctydbuhx2	books/1786317280620-musnadahmadbinhanbalarabic-englishtranslation-volume1.pdf	Musnad Imam Ahmad bin Hanbal	1	3	\N	PENDING	cmsrsijgo0004krfcfomg5koy
cmsq50ovc0001kr2w39p0fow6	Explanation of a Summary of al-‘Aqeedatul Hamawiyyah of Ibn Taymiyyah	explanation-of-a-summary-of-al-aqeedatul-hamawiyyah-of-ibn-taymiyyah	Imaam Muhammad Ibn Saaleh al-'Uthaymeen	Imam Muhammad ibn Saalih al-Uthaymeen's "Explanation of a Summary of Al-Aqeedatul-Hamawiyyah of Ibn Taymiyyah" is an exhaustive and educational work that plunges into the philosophical ideas and convictions portrayed in Ibn Taymiyyah's "Al-Aqeedatul-Hamawiyyah."	9798692642356	https://res.cloudinary.com/djw640wo2/image/upload/v1786542062/al-ilm-library/books/covers/sj2mlgezdzgaokqyrbeg.jpg	books/1786542064137-explanationofasummaryofaqeedathamawiyyah.pdf	Arabic / English	Darussalam	2005	139	1216820	4	t	cmsli0ju30000krsovnoaq8ju	cmrdabb5k0001kr3guupuqp8n	2026-08-12 13:41:06.392	2026-08-15 08:20:07.688	al-ilm-library/books/covers/sj2mlgezdzgaokqyrbeg	books/1786542064137-explanationofasummaryofaqeedathamawiyyah.pdf	\N	\N	\N	Explanation and Summary of Al-‘Aqeedah al-Hamawiyyah of Ibn Taymiyyah is an educational and accessible guide to understanding the major themes and arguments presented in Ibn Taymiyyah’s renowned work, Al-‘Aqeedah al-Hamawiyyah. It explains the fundamental principles of Islamic creed discussed in the original text, with particular attention to the Qur’an and Sunnah as the foundations for understanding Allah’s names and attributes. The book simplifies complex theological discussions and presents them in a clear and structured manner, making the subject more accessible to students and readers seeking a deeper understanding of Islamic creed. It serves as a useful introduction and study companion for those wishing to understand the theological positions and reasoning of Ibn Taymiyyah without having to navigate the original work alone.	PENDING	\N
cmslkb5p40002krfs0itpkpmz	The Evolution of Fiqh	the-evolution-of-fiqh	Dr. Abu Ameenah Bilal Philips	The overall purpose of this book is to acquaint the reader \r\nwith the historical factors behind the formulation of Islamic law \r\n(Fiqh), in order that he or she may better understand how and why \r\nthe various schools of Islamic law (Madh-habs)\r\n1 came about.	\N	https://res.cloudinary.com/djw640wo2/image/upload/v1786265415/al-ilm-library/books/covers/qkoimqrgr2i6chfiwfwc.jpg	books/cmslkb5p40002krfs0itpkpmz/original.pdf	English	\N	\N	149	511272	1	t	cmslk5hq00000krfs8xmx11lg	cmrdabb5k0001kr3guupuqp8n	2026-08-09 08:50:18.136	2026-08-15 09:38:01.565	al-ilm-library/books/covers/qkoimqrgr2i6chfiwfwc	books/cmslkb5p40002krfs0itpkpmz/original.pdf	\N	\N	\N	\N	READY	\N
cmsll7wcr0001kr2k5v38vifc	Hajj and Umrah	hajj-and-umrah	Dr. Abu Ameenah Bilal Philips	The uniqueness of this book on Hajj and ‘Umrah is that it is free of sectarian bias and relies strictly on the authentic Sunnah for its presentation.	\N	https://res.cloudinary.com/djw640wo2/image/upload/v1786266943/al-ilm-library/books/covers/zdvtxgszcdbwbb6pdt3n.jpg	books/1786316817703-hajj-umrah-2001-by-bilal-philips.pdf	English	\N	\N	169	15002164	0	t	cmslk5hq00000krfs8xmx11lg	cmrdabb5k0001kr3guupuqp8n	2026-08-09 09:15:45.675	2026-08-12 13:28:01.323	al-ilm-library/books/covers/zdvtxgszcdbwbb6pdt3n	books/1786316817703-hajj-umrah-2001-by-bilal-philips.pdf	\N	\N	\N	\N	PENDING	\N
cmsmgju8r0001krx4djdmjset	Musnad Imam Ahmad Bin Hanbal	musnad-imam-ahmad-bin-hanbal-musnad-imam-ahmad-bin-hanbal-volume-2	Imam Ahmad bin Hanbal	Musnad Imam Ahmad Bin Hanbal Vol. 2 represents the continued meticulous work of Imam Ahmad Bin Hanbal, one of the most prominent scholars in Islamic history.	978-603-500-109-0	https://res.cloudinary.com/djw640wo2/image/upload/v1786319915/al-ilm-library/books/covers/z4o7d3gjvzqkn1tcjp0x.png	\N	English	Darussalam Publications	2012	602	\N	0	t	cmsm4pni80001krn0nkqwguea	cmrdabb5k0001kr3guupuqp8n	2026-08-09 23:52:50.907	2026-08-13 17:28:36.303	al-ilm-library/books/covers/z4o7d3gjvzqkn1tcjp0x	\N	Musnad Imam Ahmad Bin Hanbal	2	3	\N	PENDING	cmsrsijgo0004krfcfomg5koy
\.


--
-- Data for Name: BookCollection; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."BookCollection" (id, title, author, description, language, "coverImage", "coverImagePublicId", "createdAt", "updatedAt") FROM stdin;
cmsrsijgo0004krfcfomg5koy	Musnad Imam Ahmad Bin Hanbal	Imam Ahmad Bin Hanbal	\N	English	https://res.cloudinary.com/djw640wo2/image/upload/v1786641993/al-ilm-library/collections/covers/hiwee1czxhnc43zw3jh5.webp	al-ilm-library/collections/covers/hiwee1czxhnc43zw3jh5	2026-08-13 17:26:36.553	2026-08-13 17:26:36.553
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Category" (id, name, slug, description, "createdAt", "updatedAt", icon) FROM stdin;
cmsli0ju30000krsovnoaq8ju	Aqeedah	aqeedah	Islamic Creed and Theology	2026-08-09 07:46:04.011	2026-08-12 12:41:47.434	moon-star
cmslk5hq00000krfs8xmx11lg	Fiqh	fiqh	Islamic Jurispudence	2026-08-09 08:45:53.784	2026-08-12 12:44:09.244	scale
cmsm4pni80001krn0nkqwguea	Hadith	hadith	Prophetic Traditions	2026-08-09 18:21:26.72	2026-08-12 12:45:35.211	book
cmsm4ejip0000krn0vzddoecg	Tafseer	tafseer	Quranic Exegesis	2026-08-09 18:12:48.337	2026-08-12 12:45:52.625	book-open
\.


--
-- Data for Name: Newsletter; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Newsletter" (id, subject, content, status, "sentAt", "recipientCount", "createdAt", "updatedAt") FROM stdin;
cmsu5r1ga0002krlwkgt45o7r	New Books Added to Maktabatul Huda	<p>If by <strong>“Subscribe”</strong> you mean users enter their email on the homepage to receive updates, you don't need a full payment/subscription system. That's basically a <strong>newsletter subscription</strong>.</p>	DRAFT	\N	\N	2026-08-15 09:12:40.475	2026-08-15 09:12:40.475
cmsu5revc0003krlwwznepz1l	New Books Added to Maktabatul Huda	<p>If by <strong>“Subscribe”</strong> you mean users enter their email on the homepage to receive updates, you don't need a full payment/subscription system. That's basically a <strong>newsletter subscription</strong>.</p>	DRAFT	\N	\N	2026-08-15 09:12:57.864	2026-08-15 09:12:57.864
\.


--
-- Data for Name: ReadingProgress; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ReadingProgress" (id, "userId", "bookId", "currentPage", progress, "lastReadAt", zoom) FROM stdin;
cmsrsnvna0006krfcdn9c5y7h	cmrdabb5k0001kr3guupuqp8n	cmsmf6vei0001krgwqo9t7uhu	1	0.16	2026-08-13 17:31:08.634	1
cmsrpnks8004jkrrweo8mfosf	cmrdabb5k0001kr3guupuqp8n	cmslkb5p40002krfs0itpkpmz	14	9.4	2026-08-15 09:37:58.427	0.4000000000000001
cmsrn6oqo0001krx0vhmhzgyp	cmrdabb5k0001kr3guupuqp8n	cmsq50ovc0001kr2w39p0fow6	18	12.95	2026-08-13 16:04:47.407	0.4000000000000006
\.


--
-- Data for Name: SavedBook; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SavedBook" (id, "userId", "bookId", "createdAt") FROM stdin;
cmsu5k1vj0001krlww3mswnfn	cmrdabb5k0001kr3guupuqp8n	cmsq50ovc0001kr2w39p0fow6	2026-08-15 09:07:14.43
\.


--
-- Data for Name: Subscriber; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Subscriber" (id, email, status, "createdAt", "updatedAt") FROM stdin;
cmsu0jkcj0000krws3w567mt9	ololadea626@gmail.com	ACTIVE	2026-08-15 06:46:53.635	2026-08-15 06:46:53.635
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, "fullName", email, password, provider, "googleId", avatar, role, "resetPasswordToken", "resetPasswordExpires", "createdAt", "updatedAt") FROM stdin;
cmrda5d8m0000kr3gmgm1nb61	Abdusalam fawaz	opeyemifawaz11@gmail.com	\N	GOOGLE	105522617909488816630	https://lh3.googleusercontent.com/a/ACg8ocLfD6OGXKkew8cCis5dGZ3oe6Db407DA_ugJAD1MTw6ovWZMr8=s96-c	USER	0d1d5a7f589f281dc8d3c26a267cce864db8ddbf83e3074b201e05008a54cb42	2026-07-13 10:39:11.182	2026-07-09 09:04:00.07	2026-07-13 09:39:11.185
cmrj189l10000krm0ja0315n4	Adio Diouf	lindawilson3097@gmail.com	$2b$12$iCsjzNbWRRCq7PyQuV8aN.r2iw/UyvdO2fimYSlJ3awoStF00fdM6	LOCAL	\N	\N	USER	\N	\N	2026-07-13 09:40:55.813	2026-07-13 09:40:55.813
cmrj56oys0001krm09wu1yuc8	Ololade Abdulsalam	oa9117671@gmail.com	\N	GOOGLE	111680979607346100081	https://lh3.googleusercontent.com/a/ACg8ocJzq2f0imq4QxJXS8hbiYDA35QyB-VVufNhZiBCzBamvBVjkw=s96-c	USER	\N	\N	2026-07-13 11:31:40.9	2026-07-13 11:31:40.9
cmrdabb5k0001kr3guupuqp8n	Abdulsalam Fawaz	ololadea626@gmail.com	$2b$12$8TMMFuNTiX3RXXjqqFSf4.aRZM3fHH7iMK77XnZcwYeXy/LjGy0IK	LOCAL	\N	\N	ADMIN	330d0e50302fad89e6bc8bcacd0403df9b4fba08b1b8acdf1e01f0bf70de6040	2026-08-04 14:47:38.632	2026-07-09 09:08:37.304	2026-08-04 13:47:38.637
cmsepvw6b0000kri424hkmrc7	Shakiru Adelaja	akinkunmia092@gmail.com	$2b$12$NxrLm6J/wkC6RcBY1GSLTO0Z2msUzKE9KPYGqoy9GcFD5kWpZph86	LOCAL	\N	\N	USER	\N	\N	2026-08-04 13:52:00.419	2026-08-04 13:52:00.419
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
c53027f8-9397-4414-a1f4-fd365b855674	dacb8c7ce9c1bf09cc4dc6e844cb39132cf745241c1b3496641f5808e54ac3e0	2026-07-08 11:34:57.922709+01	20260708103457_init	\N	\N	2026-07-08 11:34:57.875182+01	1
7d1edbd1-9fdd-4736-8036-8a8e7808dcf3	a485f8ab406ed58352ac829e2d3a0626f3488285db571058d20aedc322564c85	2026-07-09 22:59:30.408187+01	20260709215930_create_books_and_categories	\N	\N	2026-07-09 22:59:30.297576+01	1
eb666f0d-1393-408f-b0a8-b53da6064fc7	2d5c4e4dfd90756de234d6fc413bea64e41cda40ec1a685c2a714ce28510ac20	2026-07-10 00:21:27.100244+01	20260710000000_add_book_cloudinary_public_ids	\N	\N	2026-07-10 00:21:27.092508+01	1
7844d1d7-225f-4cda-868c-267aced5f15a	b82da598915908b3ab6512361d84ca06e4b03f8f85a2a681b9ef54523da62d44	2026-08-09 19:38:44.795844+01	20260809000000_add_category_icons_and_book_volumes	\N	\N	2026-08-09 19:38:44.786387+01	1
a9120d20-644e-4ee7-9c87-5272ad457a3d	d9d42e973689a2863afaa1a2277e3ae73289d48430132597148e3406785105f5	2026-08-12 15:13:48.060256+01	20260812000000_add_book_about	\N	\N	2026-08-12 15:13:48.053451+01	1
d1c93d93-5087-4e84-b761-9d37e800b2b1	b1e504ce0182e5330cfe0afa6a1979ba78caf7a0ee68eb2ee690b35c79515895	2026-08-12 15:13:48.063932+01	20260812000000_add_category_images	\N	\N	2026-08-12 15:13:48.061425+01	1
32772ce8-c1f9-4c47-a642-311e439ecb98	afada5e9b014389f34bb9c2255cbbcb7c53892e453ec22b4699abbc6de865939	2026-08-13 14:56:01.849208+01	20260813000000_add_book_pages	\N	\N	2026-08-13 14:56:01.717068+01	1
877ec389-2661-464c-a049-29d4c53711fd	e23aaa64080e22614e99026dc170e563cd2a74924eb5e782e9cfd4982d28e4fc	2026-08-13 15:57:08.740363+01	20260813010000_add_reader_zoom	\N	\N	2026-08-13 15:57:08.730477+01	1
3a7ea650-998e-464e-86f4-9f342b4e422b	aa18c2452ad08685072e18adecded6c4d5f8a3a44ca4ca5b2d47f0d3d1998c04	2026-08-13 16:44:14.307947+01	20260813020000_remove_book_pages	\N	\N	2026-08-13 16:44:14.271976+01	1
1b6bc6df-b4b4-480d-ab1b-93a5c2aebd4e	e4454b2c02a72de9d8026d65ebbbcdd9fcf095e7c41324a41027996001ab6e7a	2026-08-13 18:21:06.77418+01	20260813020000_add_book_collections	\N	\N	2026-08-13 18:21:06.698193+01	1
674ed954-afff-4117-a77b-cc8a8b506c32	1ca236bcd14f27cc4d5c4c3a2ab037003c3f57f9708e2db88f49e590d66428c7	2026-08-15 07:34:10.230193+01	20260815000000_add_newsletters_and_subscribers	\N	\N	2026-08-15 07:34:10.158939+01	1
2270836b-4cc5-4f0f-9b40-02e7bd867ef3	5c8c65622a2151ce9d96811b6bca5101e1faafbe1dbbb4f0a0deac9ea22bf848	2026-08-15 09:59:20.540742+01	20260815010000_add_saved_books	\N	\N	2026-08-15 09:59:20.480334+01	1
\.


--
-- Name: BookCollection BookCollection_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."BookCollection"
    ADD CONSTRAINT "BookCollection_pkey" PRIMARY KEY (id);


--
-- Name: Book Book_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Book"
    ADD CONSTRAINT "Book_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: Newsletter Newsletter_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Newsletter"
    ADD CONSTRAINT "Newsletter_pkey" PRIMARY KEY (id);


--
-- Name: ReadingProgress ReadingProgress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReadingProgress"
    ADD CONSTRAINT "ReadingProgress_pkey" PRIMARY KEY (id);


--
-- Name: SavedBook SavedBook_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SavedBook"
    ADD CONSTRAINT "SavedBook_pkey" PRIMARY KEY (id);


--
-- Name: Subscriber Subscriber_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Subscriber"
    ADD CONSTRAINT "Subscriber_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: BookCollection_author_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "BookCollection_author_idx" ON public."BookCollection" USING btree (author);


--
-- Name: BookCollection_title_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "BookCollection_title_idx" ON public."BookCollection" USING btree (title);


--
-- Name: Book_author_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Book_author_idx" ON public."Book" USING btree (author);


--
-- Name: Book_categoryId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Book_categoryId_idx" ON public."Book" USING btree ("categoryId");


--
-- Name: Book_collectionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Book_collectionId_idx" ON public."Book" USING btree ("collectionId");


--
-- Name: Book_collectionId_volumeNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Book_collectionId_volumeNumber_key" ON public."Book" USING btree ("collectionId", "volumeNumber");


--
-- Name: Book_isbn_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Book_isbn_key" ON public."Book" USING btree (isbn);


--
-- Name: Book_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Book_slug_key" ON public."Book" USING btree (slug);


--
-- Name: Book_title_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Book_title_idx" ON public."Book" USING btree (title);


--
-- Name: Book_uploadedById_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Book_uploadedById_idx" ON public."Book" USING btree ("uploadedById");


--
-- Name: Category_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Category_name_key" ON public."Category" USING btree (name);


--
-- Name: Category_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Category_slug_key" ON public."Category" USING btree (slug);


--
-- Name: Newsletter_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Newsletter_createdAt_idx" ON public."Newsletter" USING btree ("createdAt");


--
-- Name: Newsletter_sentAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Newsletter_sentAt_idx" ON public."Newsletter" USING btree ("sentAt");


--
-- Name: Newsletter_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Newsletter_status_idx" ON public."Newsletter" USING btree (status);


--
-- Name: ReadingProgress_bookId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ReadingProgress_bookId_idx" ON public."ReadingProgress" USING btree ("bookId");


--
-- Name: ReadingProgress_userId_bookId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ReadingProgress_userId_bookId_key" ON public."ReadingProgress" USING btree ("userId", "bookId");


--
-- Name: ReadingProgress_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "ReadingProgress_userId_idx" ON public."ReadingProgress" USING btree ("userId");


--
-- Name: SavedBook_bookId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SavedBook_bookId_idx" ON public."SavedBook" USING btree ("bookId");


--
-- Name: SavedBook_userId_bookId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "SavedBook_userId_bookId_key" ON public."SavedBook" USING btree ("userId", "bookId");


--
-- Name: SavedBook_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "SavedBook_userId_idx" ON public."SavedBook" USING btree ("userId");


--
-- Name: Subscriber_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Subscriber_createdAt_idx" ON public."Subscriber" USING btree ("createdAt");


--
-- Name: Subscriber_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Subscriber_email_key" ON public."Subscriber" USING btree (email);


--
-- Name: Subscriber_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Subscriber_status_idx" ON public."Subscriber" USING btree (status);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_googleId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_googleId_key" ON public."User" USING btree ("googleId");


--
-- Name: Book Book_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Book"
    ADD CONSTRAINT "Book_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Book Book_collectionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Book"
    ADD CONSTRAINT "Book_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES public."BookCollection"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Book Book_uploadedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Book"
    ADD CONSTRAINT "Book_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ReadingProgress ReadingProgress_bookId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReadingProgress"
    ADD CONSTRAINT "ReadingProgress_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES public."Book"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ReadingProgress ReadingProgress_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ReadingProgress"
    ADD CONSTRAINT "ReadingProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SavedBook SavedBook_bookId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SavedBook"
    ADD CONSTRAINT "SavedBook_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES public."Book"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SavedBook SavedBook_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SavedBook"
    ADD CONSTRAINT "SavedBook_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict wPk1Bu8MQUziTIcqt50HXzyejhI1fekIvepxZ7HrPDMW2fdjMXTG4DxY75oxN3d

