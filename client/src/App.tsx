import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";

import MainLayout from "@/components/layout/MainLayout";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";

const Landing = lazy(() => import("@/pages/Landing"));
const Login = lazy(() => import("@/pages/Auth/Login"));
const Register = lazy(() => import("@/pages/Auth/Register"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Jobs = lazy(() => import("@/pages/Jobs"));
const JobDetail = lazy(() => import("@/pages/Jobs/JobDetail"));
const Profile = lazy(() => import("@/pages/Profile"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const PostJob = lazy(() => import("@/pages/Recruiter/PostJob"));
const MyJobs = lazy(() => import("@/pages/Recruiter/MyJobs"));
const MyApplications = lazy(() => import("@/pages/candidate/MyApplications"));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
      <div className="w-8 h-8 border-2 border-[#4f46e5] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<MainLayout />}>
            {/* Public within layout */}
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:slug" element={<JobDetail />} />

            {/* Requires auth, role-agnostic for now */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["RECRUITER"]} />}>
            <Route path="/recruiter/post-job" element={<PostJob />} />
            <Route path="/recruiter/jobs" element={<MyJobs />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={["CANDIDATE"]} />}>
            <Route path="/candidate/applications" element={<MyApplications />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}