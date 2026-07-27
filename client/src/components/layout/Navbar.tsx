// components/layout/Navbar.tsx — adapt into your existing one, don't fully replace if it has more (logo, mobile menu, etc.)
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-[#27272A]">
      <Link to="/" className="font-semibold text-[#F9FAFB]">JobSphere <span className="text-[#8B5CF6]">AI</span></Link>

      <div className="flex items-center gap-6 text-sm">
        <Link to="/jobs" className="text-zinc-300 hover:text-white">Browse Jobs</Link>

        {user?.role === "RECRUITER" && (
          <>
            <Link to="/recruiter/jobs" className="text-zinc-300 hover:text-white">My Jobs</Link>
            <Link to="/recruiter/post-job" className="text-zinc-300 hover:text-white">Post a Job</Link>
          </>
        )}
        {user?.role === "CANDIDATE" && (
          <Link to="/candidate/applications" className="text-zinc-300 hover:text-white">My Applications</Link>
        )}

        {user ? (
          <Button variant="outline" size="sm" onClick={logout}>Log out</Button>
        ) : (
          <>
            <Link to="/login" className="text-zinc-300 hover:text-white">Sign in</Link>
            <Button size="sm" onClick={() => navigate("/register")}>Get Started</Button>
          </>
        )}
      </div>
    </nav>
  );
}