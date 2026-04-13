import { Outlet } from "react-router";
import { useState } from "react";
import Navbar from "@/widgets/navbar";
import Footer from "@/widgets/footer";
import Sidebar from "@/widgets/sidebar";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
        <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

      <div className="mx-auto flex max-w-8xl">
        <Sidebar open={sidebarOpen} />
        
        <div className="flex min-w-0 flex-1 flex-col">
            <main className="flex-1 min-w-0">
            <Outlet />
            </main>
            <Footer />
        </div>
      </div>
    </div>
  );
}