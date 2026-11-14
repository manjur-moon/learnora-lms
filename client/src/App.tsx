import { useEffect } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router";
import { AdminGuard } from "./components/admin/AdminGuard";
import { AdminLayout } from "./components/admin/AdminLayout";
import { HomePage } from "./pages/HomePage";
import { CoursesPage } from "./pages/CoursesPage";
import { CourseDetailsPage } from "./pages/CourseDetailsPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminCoursesPage } from "./pages/admin/AdminCoursesPage";
import { AdminCourseFormPage } from "./pages/admin/AdminCourseFormPage";
import { AdminLecturesPage } from "./pages/admin/AdminLecturesPage";

function AdminShell() {
  return (
    <AdminGuard>
      <AdminLayout><Outlet /></AdminLayout>
    </AdminGuard>
  );
}

export default function App() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (hash) {
        document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
      } else {
        window.scrollTo(0, 0);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<Navigate to="/#about" replace />} />
      <Route path="/courses" element={<CoursesPage />} />
      <Route path="/courses/:courseId" element={<CourseDetailsPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route element={<AdminShell />}>
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/courses" element={<AdminCoursesPage />} />
        <Route path="/admin/courses/new" element={<AdminCourseFormPage />} />
        <Route path="/admin/courses/:courseId/edit" element={<AdminCourseFormPage />} />
        <Route path="/admin/courses/:courseId/lectures" element={<AdminLecturesPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
