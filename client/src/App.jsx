import { lazy, Suspense, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import PublicLayout from "./layouts/PublicLayout.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import { checkAuth, selectAuth } from "./features/auth/authSlice.js";

const Home = lazy(() => import("./pages/public/Home.jsx"));
const About = lazy(() => import("./pages/public/About.jsx"));
const Contact = lazy(() => import("./pages/public/Contact.jsx"));
const Books = lazy(() => import("./pages/public/Books.jsx"));
const BookDetail = lazy(() => import("./pages/public/BookDetail.jsx"));
const CollectionDetails = lazy(() => import("./pages/public/CollectionDetails.jsx"));
const BookReaderPage = lazy(() => import("./pages/public/BookReaderPage.jsx"));
const Profile = lazy(() => import("./pages/public/Profile.jsx"));
const Login = lazy(() => import("./pages/auth/Login.jsx"));
const AuthSuccess = lazy(() => import("./pages/auth/AuthSuccess.jsx"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword.jsx"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.jsx"));
const AdminBooks = lazy(() => import("./pages/admin/AdminBooks.jsx"));
const AdminUpload = lazy(() => import("./pages/admin/AdminUpload.jsx"));
const AddCollection = lazy(() => import("./pages/admin/AddCollection.jsx"));
const CollectionVolumes = lazy(() => import("./pages/admin/CollectionVolumes.jsx"));
const EditCollection = lazy(() => import("./pages/admin/EditCollection.jsx"));
const ManageCollections = lazy(() => import("./pages/admin/ManageCollections.jsx"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories.jsx"));
const Newsletters = lazy(() => import("./pages/admin/Newsletters.jsx"));
const CreateNewsletter = lazy(() => import("./pages/admin/CreateNewsletter.jsx"));
const EditNewsletter = lazy(() => import("./pages/admin/EditNewsletter.jsx"));
const NewsletterPreview = lazy(() => import("./pages/admin/NewsletterPreview.jsx"));
const Subscribers = lazy(() => import("./pages/admin/Subscribers.jsx"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers.jsx"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings.jsx"));

function PageLoader() {
  return <div className="min-h-screen bg-background" aria-label="Loading page" />;
}

function AdminRoute({ children }) {
  const { isAuthenticated, isCheckingAuth, user } = useSelector(selectAuth);
  const isAdmin = user?.role === "ADMIN";

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background" aria-label="Checking access" />
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
}

function AppContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <div id="container">
      <div className="tailwind">
        <div id="fig-code-root">
          <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes with navbar */}
            <Route
              path="/"
              element={
                <PublicLayout>
                  <Home />
                </PublicLayout>
              }
            />
            <Route
              path="/books"
              element={
                <PublicLayout>
                  <Books />
                </PublicLayout>
              }
            />
            <Route
              path="/book-details/:bookSlug"
              element={
                <PublicLayout>
                  <BookDetail />
                </PublicLayout>
              }
            />
            <Route
              path="/books/:bookSlug"
              element={
                <PublicLayout>
                  <BookDetail />
                </PublicLayout>
              }
            />
            <Route
              path="/collections/:id"
              element={
                <PublicLayout>
                  <CollectionDetails />
                </PublicLayout>
              }
            />
            <Route
              path="/categories"
              element={
                <PublicLayout>
                  <Books />
                </PublicLayout>
              }
            />
            <Route
              path="/about"
              element={
                <PublicLayout>
                  <About />
                </PublicLayout>
              }
            />
            <Route
              path="/contact"
              element={
                <PublicLayout>
                  <Contact />
                </PublicLayout>
              }
            />
            <Route
              path="/profile"
              element={
                <PublicLayout>
                  <Profile />
                </PublicLayout>
              }
            />
            <Route path="/read/:bookId" element={<BookReaderPage />} />

            {/* Auth routes without navbar */}
            <Route path="/auth" element={<Login />} />
            <Route path="/auth/success" element={<AuthSuccess />} />
            <Route path="/auth/google/success" element={<AuthSuccess />} />
            <Route path="/auth/reset/:token" element={<ResetPassword />} />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/books"
              element={
                <AdminRoute>
                  <AdminBooks />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/upload"
              element={
                <AdminRoute>
                  <AdminUpload />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <AdminRoute>
                  <AdminCategories />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/collections"
              element={
                <AdminRoute>
                  <ManageCollections />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/collections/new"
              element={
                <AdminRoute>
                  <AddCollection />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/collections/edit"
              element={
                <AdminRoute>
                  <EditCollection />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/collections/:id/volumes"
              element={
                <AdminRoute>
                  <CollectionVolumes />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/newsletters"
              element={
                <AdminRoute>
                  <Newsletters />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/newsletters/create"
              element={
                <AdminRoute>
                  <CreateNewsletter />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/newsletters/:id/edit"
              element={
                <AdminRoute>
                  <EditNewsletter />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/newsletters/:id/preview"
              element={
                <AdminRoute>
                  <NewsletterPreview />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/subscribers"
              element={
                <AdminRoute>
                  <Subscribers />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <AdminRoute>
                  <AdminSettings />
                </AdminRoute>
              }
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
      <Toaster richColors position="top-right" />
    </Router>
  );
}

export default App;
