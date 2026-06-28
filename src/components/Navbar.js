"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Menu, X, Users, Shield, LogOut, LayoutDashboard } from "lucide-react";
import { initFirebase, getFirebaseAuth } from "@/firebase/config";
import { isAdminEmail } from "@/lib/constants";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);

  const isAdminRoute = pathname?.startsWith("/admin");

  useEffect(() => {
    initFirebase();
    const auth = getFirebaseAuth();
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdminUser(Boolean(user && isAdminEmail(user.email)));
    });
    return unsubscribe;
  }, []);

  const showAdminNav = isAdminRoute || isAdminUser;

  async function handleLogout() {
    const auth = getFirebaseAuth();
    if (auth) await signOut(auth);
    window.location.href = "/admin";
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href={showAdminNav ? "/admin" : "/"}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              {showAdminNav ? (
                <Shield className="w-5 h-5 text-white" />
              ) : (
                <Users className="w-5 h-5 text-white" />
              )}
            </div>
            <span className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              {showAdminNav ? "InflConnect Admin" : "InflConnect"}
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {showAdminNav ? (
              <>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 font-medium transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                {isAdminUser && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-slate-600 hover:text-red-600 border border-slate-200 rounded-xl hover:border-red-200 text-sm font-medium transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                )}
              </>
            ) : (
              <>
                <Link
                  href="/"
                  className="text-slate-600 hover:text-indigo-600 font-medium transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="/onboard"
                  className="inline-flex items-center px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Join as Influencer
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
          {showAdminNav ? (
            <>
              <Link
                href="/admin"
                className="block px-3 py-2 text-slate-600 hover:text-indigo-600 font-medium rounded-lg hover:bg-slate-50"
                onClick={() => setMobileOpen(false)}
              >
                Dashboard
              </Link>
              {isAdminUser && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="block w-full px-3 py-2 text-red-600 font-medium rounded-lg hover:bg-red-50 text-left"
                >
                  Logout
                </button>
              )}
            </>
          ) : (
            <>
              <Link
                href="/"
                className="block px-3 py-2 text-slate-600 hover:text-indigo-600 font-medium rounded-lg hover:bg-slate-50"
                onClick={() => setMobileOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/onboard"
                className="block px-3 py-2 bg-indigo-600 text-white font-semibold rounded-xl text-center hover:bg-indigo-700 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Join as Influencer
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
