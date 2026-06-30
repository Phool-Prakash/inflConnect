"use client";

import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import Link from "next/link";
import {
  Loader2,
  LogOut,
  Check,
  X,
  Trash2,
  Search,
  Shield,
  Pencil,
  ExternalLink,
} from "lucide-react";
import { initFirebase, getFirebaseAuth } from "@/firebase/config";
import { isAdminEmail, STATUSES } from "@/lib/constants";
import {
  adminFetchInfluencers,
  adminCreateInfluencer,
  adminUpdateStatus,
  adminDeleteInfluencer,
  adminBulkAction,
} from "@/lib/api-client";
import InfluencerForm from "@/components/InfluencerForm";
import { formatPhoneDisplay } from "@/lib/phone";

export default function AdminClient() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [pending, setPending] = useState([]);
  const [allInfluencers, setAllInfluencers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [dataError, setDataError] = useState(null);

  const isAdmin = user && isAdminEmail(user.email);

  useEffect(() => {
    initFirebase();
    const firebaseAuth = getFirebaseAuth();
    if (!firebaseAuth) {
      setAuthLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!isAdmin || !user) return;

    async function loadData() {
      setDataLoading(true);
      setDataError(null);
      try {
        await user.getIdToken(true);
        const [pendingData, allData] = await Promise.all([
          adminFetchInfluencers({ status: "pending" }),
          adminFetchInfluencers(),
        ]);
        setPending(pendingData);
        setAllInfluencers(allData);
      } catch (err) {
        console.error("Failed to load admin data:", err);
        setDataError(
          err.message ||
            "Could not load influencers. Check browser console for details."
        );
      } finally {
        setDataLoading(false);
      }
    }

    loadData();
  }, [isAdmin, user, formSuccess]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [activeTab]);

  function toggleSelect(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll(items) {
    const ids = items.map((inf) => inf.id);
    const allSelected = ids.length > 0 && ids.every((id) => selectedIds.has(id));
    setSelectedIds(allSelected ? new Set() : new Set(ids));
  }

  async function handleBulkApprove(items) {
    const ids = items.filter((id) => selectedIds.has(id));
    const toApprove = ids.filter((id) => {
      const inf = allInfluencers.find((i) => i.id === id);
      return inf?.status === "pending";
    });

    if (toApprove.length === 0) {
      alert("No pending influencers selected.");
      return;
    }
    if (!confirm(`Approve ${toApprove.length} influencer(s)?`)) return;

    setBulkLoading(true);
    try {
      await adminBulkAction("approve", toApprove);
      setPending((prev) => prev.filter((p) => !toApprove.includes(p.id)));
      setAllInfluencers((prev) =>
        prev.map((inf) =>
          toApprove.includes(inf.id) ? { ...inf, status: "approved" } : inf
        )
      );
      setSelectedIds(new Set());
    } catch (err) {
      console.error(err);
      alert("Failed to approve selected influencers.");
    } finally {
      setBulkLoading(false);
    }
  }

  async function handleBulkDelete(items) {
    const ids = items.filter((id) => selectedIds.has(id));
    if (ids.length === 0) return;
    if (!confirm(`Permanently delete ${ids.length} influencer(s)?`)) return;

    setBulkLoading(true);
    try {
      await adminBulkAction("delete", ids);
      setAllInfluencers((prev) => prev.filter((inf) => !ids.includes(inf.id)));
      setPending((prev) => prev.filter((p) => !ids.includes(p.id)));
      setSelectedIds(new Set());
    } catch (err) {
      console.error(err);
      alert("Failed to delete selected influencers.");
    } finally {
      setBulkLoading(false);
    }
  }

  function BulkActionBar({ items }) {
    const selectedInTab = items.filter((inf) => selectedIds.has(inf.id));
    const pendingCount = selectedInTab.filter((inf) => inf.status === "pending").length;

    if (selectedInTab.length === 0) return null;

    return (
      <div className="mb-4 flex flex-wrap items-center gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
        <span className="text-sm font-medium text-indigo-900">
          {selectedInTab.length} selected
        </span>
        {pendingCount > 0 && (
          <button
            type="button"
            onClick={() => handleBulkApprove(items.map((inf) => inf.id))}
            disabled={bulkLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 disabled:opacity-60 transition-colors"
          >
            {bulkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Approve Selected ({pendingCount})
          </button>
        )}
        <button
          type="button"
          onClick={() => handleBulkDelete(items.map((inf) => inf.id))}
          disabled={bulkLoading}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-red-600 text-sm font-medium rounded-xl border border-red-200 hover:bg-red-50 disabled:opacity-60 transition-colors"
        >
          {bulkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Delete Selected
        </button>
        <button
          type="button"
          onClick={() => setSelectedIds(new Set())}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          Clear selection
        </button>
      </div>
    );
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    const normalizedEmail = email.trim().toLowerCase();

    if (!isAdminEmail(normalizedEmail)) {
      setLoginError(
        `${normalizedEmail} is not an admin email. Use the email set in NEXT_PUBLIC_ADMIN_EMAILS.`
      );
      setLoginLoading(false);
      return;
    }

    try {
      const firebaseAuth = getFirebaseAuth();
      if (!firebaseAuth) {
        setLoginError("Firebase is not ready. Refresh the page and try again.");
        return;
      }

      await signInWithEmailAndPassword(firebaseAuth, normalizedEmail, password);
    } catch (err) {
      console.error(err);
      const code = err?.code;
      if (
        code === "auth/invalid-credential" ||
        code === "auth/wrong-password" ||
        code === "auth/user-not-found"
      ) {
        setLoginError(
          "Invalid email or password. First create this user in Firebase Console → Authentication → Users → Add user."
        );
      } else if (code === "auth/invalid-email") {
        setLoginError("Invalid email format.");
      } else if (code === "auth/operation-not-allowed") {
        setLoginError("Email/Password sign-in is disabled. Enable it in Firebase Console → Authentication → Sign-in method.");
      } else {
        setLoginError(err.message || "Sign in failed. Check the browser console for details.");
      }
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleLogout() {
    try {
      const firebaseAuth = getFirebaseAuth();
      if (firebaseAuth) await signOut(firebaseAuth);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleApprove(id) {
    setActionLoading(id);
    try {
      await adminUpdateStatus(id, "approved");
      setPending((prev) => prev.filter((p) => p.id !== id));
      setAllInfluencers((prev) =>
        prev.map((inf) =>
          inf.id === id ? { ...inf, status: "approved" } : inf
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to approve influencer.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(id) {
    if (!confirm("Reject and delete this application?")) return;
    setActionLoading(id);
    try {
      await adminDeleteInfluencer(id);
      setPending((prev) => prev.filter((p) => p.id !== id));
      setAllInfluencers((prev) => prev.filter((inf) => inf.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to reject influencer.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleStatusChange(id, newStatus) {
    setActionLoading(id);
    try {
      await adminUpdateStatus(id, newStatus);
      setAllInfluencers((prev) =>
        prev.map((inf) => (inf.id === id ? { ...inf, status: newStatus } : inf))
      );
      if (newStatus === "pending") {
        const item = allInfluencers.find((inf) => inf.id === id);
        if (item) setPending((prev) => [{ ...item, status: newStatus }, ...prev]);
      } else {
        setPending((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Permanently delete this influencer?")) return;
    setActionLoading(id);
    try {
      await adminDeleteInfluencer(id);
      setAllInfluencers((prev) => prev.filter((inf) => inf.id !== id));
      setPending((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete influencer.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleManualAdd(formData) {
    setFormLoading(true);
    setFormError(null);
    setFormSuccess(null);
    try {
      const result = await adminCreateInfluencer(formData);
      setFormSuccess(
        result?.warning
          ? `Influencer added. Warning: ${result.warning}`
          : "Influencer added and approved successfully."
      );
    } catch (err) {
      console.error(err);
      setFormError(err.message || "Failed to add influencer. Please try again.");
    } finally {
      setFormLoading(false);
    }
  }

  const filteredAll = allInfluencers.filter((inf) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      inf.fullName?.toLowerCase().includes(q) ||
      inf.city?.toLowerCase().includes(q) ||
      inf.niche?.toLowerCase().includes(q) ||
      inf.email?.toLowerCase().includes(q) ||
      inf.phone?.includes(q.replace(/\D/g, ""))
    );
  });

  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {loginError}
            </div>
          )}

          {user && !isAdmin && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
              You are signed in as <strong>{user.email}</strong>, but this email is not
              authorized as admin. Update <code className="text-xs">NEXT_PUBLIC_ADMIN_EMAILS</code>{" "}
              in <code className="text-xs">.env.local</code> and restart the server.
              <button
                type="button"
                onClick={handleLogout}
                className="mt-2 block text-indigo-600 font-medium hover:underline"
              >
                Sign out
              </button>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition-colors"
            >
              {loginLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Panel</h1>
          <p className="text-slate-500 mt-1">Logged in as {user.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-red-600 border border-slate-200 rounded-xl hover:border-red-200 transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      {dataError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
          {dataError}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-slate-200">
        {[
          { key: "all", label: `All (${allInfluencers.length})` },
          { key: "pending", label: `Pending (${pending.length})` },
          { key: "add", label: "Add Manually" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {dataLoading && activeTab !== "add" ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <>
          {/* All Influencers */}
          {activeTab === "all" && (
            <div>
              <div className="relative mb-6 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, phone, city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <BulkActionBar items={filteredAll} />

              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        <th className="px-5 py-3 w-10">
                          <input
                            type="checkbox"
                            checked={
                              filteredAll.length > 0 &&
                              filteredAll.every((inf) => selectedIds.has(inf.id))
                            }
                            onChange={() => toggleSelectAll(filteredAll)}
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            aria-label="Select all"
                          />
                        </th>
                        <th className="text-left px-5 py-3 font-medium text-slate-600">Name</th>
                        <th className="text-left px-5 py-3 font-medium text-slate-600">Email</th>
                        <th className="text-left px-5 py-3 font-medium text-slate-600">Phone</th>
                        <th className="text-left px-5 py-3 font-medium text-slate-600">City</th>
                        <th className="text-left px-5 py-3 font-medium text-slate-600">Niche</th>
                        <th className="text-left px-5 py-3 font-medium text-slate-600">Status</th>
                        <th className="text-right px-5 py-3 font-medium text-slate-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAll.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-12 text-slate-500">
                            No influencers found.
                          </td>
                        </tr>
                      ) : (
                        filteredAll.map((inf) => (
                          <tr
                            key={inf.id}
                            className={`border-b border-slate-50 hover:bg-slate-50/50 ${
                              selectedIds.has(inf.id) ? "bg-indigo-50/40" : ""
                            }`}
                          >
                            <td className="px-5 py-3">
                              <input
                                type="checkbox"
                                checked={selectedIds.has(inf.id)}
                                onChange={() => toggleSelect(inf.id)}
                                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                aria-label={`Select ${inf.fullName}`}
                              />
                            </td>
                            <td className="px-5 py-3">
                              <div className="font-medium text-slate-900">{inf.fullName}</div>
                              <div className="text-xs text-slate-400 font-mono mt-0.5">{inf.id}</div>
                            </td>
                            <td className="px-5 py-3 text-slate-600 text-xs">{inf.email || "—"}</td>
                            <td className="px-5 py-3 text-slate-600 text-xs whitespace-nowrap">
                              {formatPhoneDisplay(inf.phone)}
                            </td>
                            <td className="px-5 py-3 text-slate-600">{inf.city}</td>
                            <td className="px-5 py-3 text-slate-600">{inf.niche}</td>
                            <td className="px-5 py-3">
                              <select
                                value={inf.status}
                                disabled={actionLoading === inf.id || bulkLoading}
                                onChange={(e) => handleStatusChange(inf.id, e.target.value)}
                                className={`px-2 py-1 rounded-lg text-xs font-medium border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                  inf.status === "approved"
                                    ? "bg-green-50 text-green-700"
                                    : "bg-yellow-50 text-yellow-700"
                                }`}
                              >
                                {STATUSES.map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-5 py-3 text-right">
                              <div className="inline-flex items-center gap-2">
                                <div className="inline-flex flex-col items-start gap-1">
                                  <Link
                                    href={`/admin/influencer/${inf.id}`}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg text-xs font-medium transition-colors"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                    Edit
                                  </Link>
                                  <Link
                                    href={`/influencer/${inf.id}`}
                                    target="_blank"
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-medium transition-colors"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    View
                                  </Link>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(inf.id)}
                                  disabled={actionLoading === inf.id || bulkLoading}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium transition-colors disabled:opacity-60"
                                >
                                  {actionLoading === inf.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3.5 h-3.5" />
                                  )}
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Pending Approvals */}
          {activeTab === "pending" && (
            <div className="space-y-4">
              {pending.length > 0 && (
                <label className="inline-flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      pending.length > 0 &&
                      pending.every((inf) => selectedIds.has(inf.id))
                    }
                    onChange={() => toggleSelectAll(pending)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Select all pending
                </label>
              )}

              <BulkActionBar items={pending} />

              {pending.length === 0 ? (
                <p className="text-slate-500 text-center py-12">
                  No pending applications.
                </p>
              ) : (
                pending.map((inf) => (
                  <div
                    key={inf.id}
                    className={`bg-white rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center gap-4 ${
                      selectedIds.has(inf.id)
                        ? "border-indigo-300 bg-indigo-50/30"
                        : "border-slate-100"
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(inf.id)}
                        onChange={() => toggleSelect(inf.id)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 flex-shrink-0"
                        aria-label={`Select ${inf.fullName}`}
                      />
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900">{inf.fullName}</h3>
                        <p className="text-sm text-slate-500">
                          {inf.email} · {formatPhoneDisplay(inf.phone)} · {inf.city} · {inf.niche}
                        </p>
                        <p className="text-xs text-slate-400 mt-1 font-mono">{inf.id}</p>
                        {inf.bio && (
                          <p className="text-sm text-slate-400 mt-1 line-clamp-1">
                            {inf.bio}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0 flex-wrap sm:ml-0 ml-7">
                      <Link
                        href={`/admin/influencer/${inf.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-indigo-600 text-sm font-medium rounded-xl border border-indigo-200 hover:bg-indigo-50 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                        View / Edit
                      </Link>
                      <button
                        onClick={() => handleApprove(inf.id)}
                        disabled={actionLoading === inf.id || bulkLoading}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 disabled:opacity-60 transition-colors"
                      >
                        {actionLoading === inf.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(inf.id)}
                        disabled={actionLoading === inf.id || bulkLoading}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-red-600 text-sm font-medium rounded-xl border border-red-200 hover:bg-red-50 disabled:opacity-60 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Add Manually */}
          {activeTab === "add" && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8">
              {formSuccess && (
                <div
                  className={`mb-6 p-4 rounded-2xl text-sm ${
                    formSuccess.toLowerCase().includes("warning")
                      ? "bg-amber-50 border border-amber-200 text-amber-800"
                      : "bg-green-50 border border-green-200 text-green-700"
                  }`}
                >
                  {formSuccess}
                </div>
              )}
              {formError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
                  {formError}
                </div>
              )}
              <InfluencerForm
                key={formSuccess ? "reset" : "form"}
                onSubmit={handleManualAdd}
                submitLabel="Add & Approve"
                loading={formLoading}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
