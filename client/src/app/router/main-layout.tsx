import { Outlet } from "react-router";
import Navbar from "@/widgets/navbar";
import Footer from "@/widgets/footer";

export default function MainLayout() {
    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            <Navbar />
            <main className="flex-1 pt-[60px]">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
