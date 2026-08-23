"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getStoredToken, getStoredUser, getRedirectPathForRole } from "@/lib/auth";
import { UserRole } from "@/lib/types";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);

  useEffect(() => {
    const token = getStoredToken();
    const user = getStoredUser();

    if (!token || !user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      // User is authenticated but navigating to an unauthorized role page
      const properPath = getRedirectPathForRole(user.role);
      router.replace(properPath);
      return;
    }

    setIsAuthorized(true);
    setChecking(false);
  }, [allowedRoles, pathname, router]);

  if (checking || !isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-sm font-medium text-slate-500">Checking permissions...</p>
      </div>
    );
  }

  return <>{children}</>;
}
