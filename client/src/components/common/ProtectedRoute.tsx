import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { Role } from "@/types";

export function ProtectedRoute({ allowedRoles }: { allowedRoles?: Role[] }) {
    const { user, token, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) return null; // swap for a spinner if you have one

    if (!token || !user) return <Navigate to="/login" state={{ from: location }} replace />;
    if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

    return <Outlet />;
}