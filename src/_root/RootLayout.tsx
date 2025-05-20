import React from "react";
import BottomBar from "@/components/shared/BottomBar";
import LeftSidebar from "@/components/shared/LeftSidebar";
import TopBar from "@/components/shared/TopBar";
import { Outlet } from "react-router-dom";

const RootLayout: React.FC = () => {
  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* TopBar spans full width at the top */}
      <TopBar />

      {/* Main content area with sidebar and content side-by-side */}
      <div className="flex flex-1 min-h-0">
        <LeftSidebar />
        <section className="flex-1 overflow-auto">
          <Outlet />
        </section>
      </div>

      {/* BottomBar spans full width at the bottom */}
      <BottomBar />
    </div>
  );
};

export default RootLayout;
