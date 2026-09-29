# Maktabatul Huda Library

Maktabatul Huda is a digital library platform for browsing, reading, and managing book content online. It is built for readers who want a clean way to discover books, follow collections, save titles for later, and continue reading without friction. The project also includes an admin side for managing content and library operations.

## Why I built this / What I learned

I built this project to create a complete digital library experience from end to end, covering both the public-facing reading experience and the behind-the-scenes content management workflow. It pushed me to work across the full stack, from React frontend design and state management to Express APIs, Prisma database modeling, authentication, and deployment concerns.

The main thing I learned was how much a good product depends on the small details: clean routing, clear admin workflows, reliable media handling, and a strong backend structure. It also gave me practical experience in integrating real services like Google login, storage providers, and email notifications.

## Main features

- searchable book catalog with categories and collections
- book detail pages with metadata and cover images
- PDF-style reading experience for books
- sign-up and login with local and Google authentication
- saved books and reading progress tracking
- admin dashboard for managing books, collections, and users
- newsletter subscription and contact form support
- Cloudinary and Supabase integration for file and media storage

## Tech stack

- Frontend: React, Vite, Redux Toolkit, React Router, Tailwind CSS
- Backend: Node.js, Express
- Database: PostgreSQL with Prisma
- Authentication: JWT and Passport
- Storage: Cloudinary and Supabase
- Email: Resend

## Project structure

- client/ — frontend application
- server/ — backend API and Prisma schema
- server/prisma/schema.prisma — database models and relationships
- server/src/ — controllers, routes, services, middleware, and config
- screenshots/ — project screenshots
- package.json — root scripts for the monorepo

## How to run locally

### 1. Install dependencies

```bash
npm install --prefix client
npm install --prefix server
```

### 2. Set up environment variables

Create a .env file in the server folder and add the required values. Keep all secrets in your local environment and never commit them.

### 3. Generate the Prisma client and apply the schema

```bash
npm run prisma:generate --prefix server
npm run prisma:deploy --prefix server
```

If you are working from a fresh local database, you may also need:

```bash
npm run prisma:migrate --prefix server
```

### 4. Start the app

Start the backend:

```bash
npm --prefix server run dev
```

Start the frontend:

```bash
npm --prefix client run dev
```

The frontend should run at http://localhost:5173 and the API at http://localhost:5000.

## Environment variables needed

These are the variables the app actually uses in the current codebase.

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/your_database
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
FRONTEND_URLS=http://localhost:5173,http://localhost:5174,http://localhost:5175
API_URL=http://localhost:5000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_STORAGE_BUCKET=Books
RESEND_API_KEY=your_resend_api_key
MAIL_FROM=no-reply@yourdomain.com
CONTACT_EMAIL=contact@yourdomain.com
```

## Screenshots

![Homepage](screenshots/homepage.jpg)

![Library](screenshots/library.jpg)

![Admin dashboard](screenshots/admin.jpg)

## My role and contributions

I was the primary developer on this project, from the initial setup through the full-stack build. My work included designing the application structure, building the React frontend, creating the Express API, setting up the Prisma database schema, implementing authentication and admin workflows, and integrating media and email services.

## Live demo

https://maktabatu-huda.onrender.com/

The project is currently deployed and available at the link above.

## Notes

- The backend is configured to serve the production frontend from the client build folder when running in production.
- This project is meant for a library or digital publishing workflow with admin-managed content.
- Some services, such as Google OAuth, Cloudinary, Supabase, and Resend, are optional depending on which features you enable in your environment.
