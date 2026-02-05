"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/shared/DashboardLayout";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useAuth } from "@/lib/hooks/useAuth";
import { useClearedAppointments } from "@/lib/hooks/useClearedAppointments";
import { resolveAvatarUrl } from "@/lib/utils/avatar";
import { useBookings } from "@/lib/hooks/useBookings";
import { formatTime12h } from "@/lib/utils/time";
import { getInitials } from "@/lib/utils/formatting";
import {
  acceptBooking,
  Booking,
  cancelBooking,
  getDoctorBookings,
  rejectBooking,
} from "@/lib/api/booking";

function cityFromAddress(addr?: string | null): string | null {
  const raw = String(addr || "").trim();
  if (!raw) return null;
  const parts = raw.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) return parts[parts.length - 1];
  return null;
}

function statusBadgeClass(status: string) {
  switch (status) {
    case "ACCEPTED":
      return "bg-green-200 text-green-900 border-green-300";
    case "PENDING":
      return "bg-yellow-200 text-yellow-900 border-yellow-300";
    case "REJECTED":
      return "bg-red-200 text-red-900 border-red-300";
    case "CANCELLED":
      return "bg-gray-200 text-gray-800 border-gray-300";
    default:
      return "bg-gray-200 text-gray-800 border-gray-300";
  }
}

function statusLabel(status: string): string {
  const s = String(status || "").toUpperCase();
  if (s === "ACCEPTED") return "APPROVED";
  return s;
}

function canClearAppointment(status: string): boolean {
  return status === "REJECTED" || status === "CANCELLED";
}

function getErrorMessage(err: any, defaultMsg: string): string {
  return err?.response?.data?.message || 
         err?.response?.data?.error ||
         err?.message || 
         defaultMsg;
}

type UiTab = "ALL" | "PENDING" | "APPROVED" | "COMPLETED" | "CANCELLED";

export default function AppointmentsPage() {
  const { user, isBootstrapping, requireAuth } = useAuth();
  const isPatient = user?.role === "PATIENT";
  const isDoctor = user?.role === "DOCTOR";
  const { clearAppointment, filterCleared } = useClearedAppointments();

  useEffect(() => {
    if (isBootstrapping) return;
    requireAuth(["PATIENT", "DOCTOR"]);
  }, [isBootstrapping, requireAuth]);

  const {
    bookings,
    loading,
    error,
    refetch,
    cancellingId,
    cancelError,
    cancelBooking,
  } = useBookings({ enabled: isPatient && !isBootstrapping });

  const [doctorItems, setDoctorItems] = useState<Booking[]>([]);
  const [doctorLoading, setDoctorLoading] = useState<boolean>(true);
  const [doctorError, setDoctorError] = useState<string | null>(null);
  const [tab, setTab] = useState<UiTab>("ALL");
  const [actingId, setActingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchDoctorBookings = useCallback(async () => {
    if (!isDoctor) return;
    try {
      setDoctorError(null);
      setDoctorLoading(true);
      const data = await getDoctorBookings();
      setDoctorItems(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Appointments: Failed to load doctor bookings:', err);
      setDoctorError(getErrorMessage(err, "Failed to load appointments"));
      setDoctorItems([]);
    } finally {
      setDoctorLoading(false);
    }
  }, [isDoctor]);

  useEffect(() => {
    if (!isDoctor || isBootstrapping) return;
    fetchDoctorBookings();
  }, [fetchDoctorBookings, isDoctor, isBootstrapping]);

  const filteredPatientItems = useMemo(() => filterCleared(bookings), [bookings, filterCleared]);
  const filteredDoctorItems = useMemo(() => filterCleared(doctorItems), [doctorItems, filterCleared]);

  const rowsAll = useMemo(() => {
    return filteredDoctorItems
      .slice()
      .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
  }, [filteredDoctorItems]);

  const rows = useMemo(() => {
    const normalized = (s: string) => String(s || "").toUpperCase();
    const status = (b: Booking) => normalized(b.status);
    if (tab === "ALL") return rowsAll;
    if (tab === "PENDING") return rowsAll.filter((b) => status(b) === "PENDING");
    if (tab === "APPROVED")
      return rowsAll.filter((b) => status(b) === "ACCEPTED" || status(b) === "APPROVED");
    if (tab === "COMPLETED") return rowsAll.filter((b) => status(b) === "COMPLETED");
    return rowsAll.filter((b) => status(b) === "CANCELLED" || status(b) === "REJECTED");
  }, [rowsAll, tab]);

  const onApprove = async (id: string) => {
    try {
      setActionError(null);
      setActingId(id);
      const updated = await acceptBooking(id);
      setDoctorItems((prev) => prev.map((b) => (b.id === id ? updated : b)));
    } catch (err: any) {
      setActionError(getErrorMessage(err, "Failed to approve appointment. Please try again."));
    } finally {
      setActingId(null);
    }
  };

  const onReject = async (id: string) => {
    try {
      setActionError(null);
      setActingId(id);
      const updated = await rejectBooking(id);
      setDoctorItems((prev) => prev.map((b) => (b.id === id ? updated : b)));
    } catch (err: any) {
      setActionError(getErrorMessage(err, "Failed to reject appointment. Please try again."));
    } finally {
      setActingId(null);
    }
  };

  if (isBootstrapping || !user) {
    return <LoadingSpinner />;
  }

  if (isPatient) {
    return (
      <DashboardLayout title="My Appointments">
        <div className="space-y-6">
          <div className="flex items-center justify-end">
            <Link href="/find-doctor" className="text-sm font-semibold text-blue-600 hover:underline">
              Book new appointment
            </Link>
          </div>

          {loading && (
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-600">Loading bookings...</p>
              <div className="mt-3 space-y-2">
                <div className="h-12 w-full animate-pulse rounded-md bg-gray-100" />
                <div className="h-12 w-full animate-pulse rounded-md bg-gray-100" />
                <div className="h-12 w-full animate-pulse rounded-md bg-gray-100" />
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
              <p className="text-sm font-medium text-red-700">{error}</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-3 inline-flex items-center rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              {cancelError && (
                <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3">
                  <p className="text-sm font-medium text-red-700">{cancelError}</p>
                </div>
              )}

              {filteredPatientItems.length === 0 ? (
                <p className="text-sm text-gray-600">No bookings yet.</p>
              ) : (
                <div className="space-y-3">
                  {filteredPatientItems.map((b) => {
                    const doctorName = b.doctor
                      ? `Dr. ${b.doctor.firstName} ${b.doctor.lastName}`
                      : `Doctor ${b.doctorId}`;
                    const specialty = (b.doctor?.specialty || "").trim();
                    const address = b.doctor?.clinicAddress || null;
                    const city = cityFromAddress(address);
                    const avatar = b.doctor?.avatar || null;
                    const avatarUrl = resolveAvatarUrl(avatar, { fallback: "" });
                    const canCancel = b.status === "PENDING" || b.status === "ACCEPTED";
                    const isCancelling = cancellingId === b.id;

                    return (
                      <div key={b.id} className="rounded-xl border bg-white p-4 shadow-sm">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div className="flex min-w-0 items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-50 text-sm font-bold text-blue-700">
                              {avatarUrl ? (

                                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                              ) : (
                                getInitials(b.doctor?.firstName, b.doctor?.lastName, "DR")
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="truncate text-base font-semibold text-gray-900">
                                {doctorName}
                              </div>
                              {specialty ? (
                                <div className="mt-1 inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                  {specialty}
                                </div>
                              ) : null}

                              <div className="mt-2 space-y-1 text-xs text-gray-600">
                                <div className="flex items-center gap-2">
                                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-gray-500" fill="none" aria-hidden="true">
                                    <path
                                      d="M12 22s7-5.33 7-12a7 7 0 1 0-14 0c0 6.67 7 12 7 12Zm0-9a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"
                                      fill="currentColor"
                                    />
                                  </svg>
                                  <span className="truncate">
                                    {address || "Location not provided"}
                                  </span>
                                </div>
                                {city ? (
                                  <div className="text-xs text-gray-500">{city}</div>
                                ) : null}
                              </div>
                            </div>
                          </div>

                          <div className="flex shrink-0 flex-col items-start gap-3 md:items-end">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">{b.date}</span>
                              <span className="text-sm text-gray-500">•</span>
                              <span className="text-sm font-medium text-gray-700">
                                {formatTime12h(b.startTime)}–{formatTime12h(b.endTime)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(
                                  b.status,
                                )}`}
                              >
                                {b.status}
                              </span>

                              {canClearAppointment(b.status) ? (
                                <button
                                  type="button"
                                  onClick={() => clearAppointment(b.id)}
                                  className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                                >
                                  Clear
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled={!canCancel || isCancelling}
                                  onClick={async () => {
                                    const ok = window.confirm(
                                      "Are you sure you want to cancel this booking?",
                                    );
                                    if (!ok) return;

                                    try {
                                      await cancelBooking(b.id);
                                      await refetch();
                                    } catch {

                                    }
                                  }}
                                  className={`rounded-xl border px-3 py-2 text-xs font-semibold transition
                                    ${
                                      !canCancel
                                        ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
                                        : isCancelling
                                          ? "cursor-not-allowed border-red-200 bg-red-100 text-red-700"
                                          : "border-red-200 bg-white text-red-700 hover:bg-red-50"
                                    }`}
                                >
                                  {isCancelling ? "Cancelling..." : "Cancel"}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  if (isDoctor) {
    return (
      <DashboardLayout title="Appointments">
        <div className="space-y-4">
          <div className="flex items-center justify-end">
            <Link
              href="/availability"
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              + New Availability
            </Link>
          </div>

          <div className="rounded-xl border bg-white p-2 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 px-2 py-2">
              {([
                { key: "ALL", label: "All" },
                { key: "PENDING", label: "Pending" },
                { key: "APPROVED", label: "Approved" },
                { key: "COMPLETED", label: "Completed" },
                { key: "CANCELLED", label: "Cancelled" },
              ] as Array<{ key: UiTab; label: string }>).map((t) => {
                const isActive = tab === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTab(t.key)}
                    className={
                      isActive
                        ? "rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700"
                        : "rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    }
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {doctorLoading && (
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-600">Loading appointments…</p>
            </div>
          )}

          {!doctorLoading && doctorError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
              <p className="text-sm font-medium text-red-700">{doctorError}</p>
            </div>
          )}

          {!doctorLoading && !doctorError && actionError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
              <p className="text-sm font-medium text-red-700">{actionError}</p>
            </div>
          )}

          {!doctorLoading && !doctorError && rowsAll.length === 0 && (
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-600">No appointments found.</p>
            </div>
          )}

          {!doctorLoading && !doctorError && rowsAll.length > 0 && rows.length === 0 && (
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-600">No appointments in this tab.</p>
            </div>
          )}

          {!doctorLoading && !doctorError && rows.length > 0 && (
            <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
              <div className="grid grid-cols-12 gap-4 border-b bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600">
                <div className="col-span-4">Patient Details</div>
                <div className="col-span-3">Date &amp; Time</div>
                <div className="col-span-3">Status</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              <div className="divide-y">
                {rows.map((b) => {
                  const p = b.patient;
                  const patientNameRaw = p
                    ? `${(p.firstName || "").trim()} ${(p.lastName || "").trim()}`.trim()
                    : "";
                  const patientName = patientNameRaw || p?.email || `Patient ${b.patientId}`;
                  const dateLabel = b.date;
                  const timeRange = `${formatTime12h(b.startTime)} → ${formatTime12h(b.endTime)}`;
                  const isPending = b.status === "PENDING";

                  return (
                    <div key={b.id} className="grid grid-cols-12 gap-4 px-4 py-4 text-sm text-gray-700">
                      <div className="col-span-4 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-600">
                          {getInitials(p?.firstName, p?.lastName)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{patientName}</div>
                          {p?.email ? (
                            <div className="text-xs text-gray-500">{p.email}</div>
                          ) : null}
                        </div>
                      </div>
                      <div className="col-span-3">
                        <div className="font-medium text-gray-900">{dateLabel}</div>
                        <div className="text-xs text-gray-500">{timeRange}</div>
                      </div>
                      <div className="col-span-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(b.status)}`}>
                          {statusLabel(b.status)}
                        </span>
                      </div>
                      <div className="col-span-2 flex justify-end gap-2">
                        {canClearAppointment(b.status) ? (
                          <button
                            type="button"
                            onClick={() => clearAppointment(b.id)}
                            className="rounded-lg bg-gray-600 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-700"
                          >
                            Clear
                          </button>
                        ) : isPending ? (
                          <>
                            <button
                              type="button"
                              disabled={actingId === b.id}
                              onClick={() => onApprove(b.id)}
                              className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
                            >
                              {actingId === b.id ? "Saving..." : "Approve"}
                            </button>
                            <button
                              type="button"
                              disabled={actingId === b.id}
                              onClick={() => onReject(b.id)}
                              className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                            >
                              {actingId === b.id ? "Saving..." : "Reject"}
                            </button>
                          </>
                        ) : b.status === "ACCEPTED" ? (
                          <button
                            type="button"
                            disabled={actingId === b.id}
                            onClick={async () => {
                              const ok = window.confirm(
                                "Are you sure you want to cancel this approved appointment?"
                              );
                              if (!ok) return;
                              setActingId(b.id);
                              setActionError(null);
                              try {
                                await cancelBooking(b.id);
                                await fetchDoctorBookings();
                              } catch (err: any) {
                                setActionError(getErrorMessage(err, "Failed to cancel appointment."));
                              } finally {
                                setActingId(null);
                              }
                            }}
                            className="rounded-lg bg-orange-600 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-700"
                          >
                            {actingId === b.id ? "Cancelling..." : "Cancel"}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  return null;
}
