import React, { useEffect } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";

import AppRoutes from "./routes";
import { Toaster } from "@/shared/ui/sonner";
import { useAppDispatch } from "./hooks";
import { fetchMeThunk } from "@/modules/auth/store/authSlice";
import Navbar from "@/shared/ui/Navbar/Navbar";
import Footer from "@/shared/ui/Footer/Footer";

export default function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchMeThunk());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

function AppLayout() {
  const location = useLocation();
  const authPaths = ["/auth/login", "/auth/register"];
  const hideLayout = authPaths.includes(location.pathname);

  return (
    <>
      {!hideLayout && <Navbar />}
      <AppRoutes />
      {!hideLayout && <Footer />}
      <Toaster position="top-right" richColors />
    </>
  );
}
