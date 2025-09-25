"use client";

import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { Route } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredRoles?: string[];
}

export default function ProtectedRoute({ children, requiredRole, requiredRoles }: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session) {
      router.push("/");
      return;
    }

    // Check role permissions
    const userRole = session.user.role;
    const rolesToCheck = requiredRoles || (requiredRole ? [requiredRole] : []);

    if (rolesToCheck.length > 0 && !rolesToCheck.includes(userRole)) {
      router.push("/unauthorized" as Route);
      return;
    }
  }, [session, status, router, requiredRole, requiredRoles]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  // Check role permissions
  const userRole = session.user.role;
  const rolesToCheck = requiredRoles || (requiredRole ? [requiredRole] : []);

  if (rolesToCheck.length > 0 && !rolesToCheck.includes(userRole)) {
    return null; // Will redirect
  }

  return <>{children}</>;
}
