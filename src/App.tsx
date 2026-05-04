import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/providers/AuthProvider";
import RequireAuth from "@/components/RequireAuth";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import AuthCallback from "@/pages/AuthCallback";
import Onboarding from "@/pages/Onboarding";
import Home from "@/pages/Home";
import NewCompany from "@/pages/companies/NewCompany";
import CompanyDetail from "@/pages/companies/CompanyDetail";
import BrandOSPage from "@/pages/companies/modules/BrandOSPage";
import AssessmentPage from "@/pages/companies/modules/AssessmentPage";
import AssessmentResultPage from "@/pages/companies/modules/AssessmentResultPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import CohortList from "@/pages/admin/CohortList";
import CohortDetail from "@/pages/admin/CohortDetail";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        <Route
          path="/onboarding"
          element={
            <RequireAuth>
              <Onboarding />
            </RequireAuth>
          }
        />
        <Route
          path="/home"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />

        <Route
          path="/companies/new"
          element={
            <RequireAuth>
              <NewCompany />
            </RequireAuth>
          }
        />
        <Route
          path="/companies/:id"
          element={
            <RequireAuth>
              <CompanyDetail />
            </RequireAuth>
          }
        />
        <Route
          path="/companies/:id/brand_os"
          element={
            <RequireAuth>
              <BrandOSPage />
            </RequireAuth>
          }
        />
        <Route
          path="/companies/:id/assessment"
          element={
            <RequireAuth>
              <AssessmentPage />
            </RequireAuth>
          }
        />
        <Route
          path="/companies/:id/assessment/result"
          element={
            <RequireAuth>
              <AssessmentResultPage />
            </RequireAuth>
          }
        />

        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminDashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/cohorts"
          element={
            <RequireAuth>
              <CohortList />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/cohorts/:id"
          element={
            <RequireAuth>
              <CohortDetail />
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
