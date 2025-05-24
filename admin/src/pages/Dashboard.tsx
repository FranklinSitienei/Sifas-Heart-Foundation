import React from "react";
import { Outlet } from "react-router-dom";

export const AdminLayout = () => {
  return (
    <div className="admin-dashboard">
      <header>Admin Panel</header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};
