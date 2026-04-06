import Sidebar from "@/components/layout/Sidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import MobileNav from "@/components/layout/MobileNav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-center min-h-screen">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="w-full max-w-feed min-h-screen border-x border-border-primary sm:ml-[72px] xl:ml-[275px] lg:mr-[350px]">
        {children}
      </main>

      {/* Right Sidebar */}
      <RightSidebar />

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
