import NavBar from "../components/common/NavBar";

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 pt-16 lg:pt-20 pb-16 lg:pb-0">{children}</main>
    </div>
  );
}

export default PublicLayout;
