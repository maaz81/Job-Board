import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function GuestRoute() {
    const { user, isLoading } = useAuth();
    console.log("GuestRoute");

    console.log({
        user,
        isLoading,
    });
    if (isLoading) return null;
    if (user) {
        return <Navigate to={user.role === "RECRUITER" ? "/recruiter/jobs" : "/candidate/applications"} replace />;
    }
    return <Outlet />;
}