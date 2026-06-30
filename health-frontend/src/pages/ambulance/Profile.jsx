import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Truck,
  ShieldCheck,
  Star,
  Edit3,
  Save,
  X,
  Loader2,
  AlertTriangle,
  RefreshCw,
  UserCircle2,
  BadgeCheck,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Design tokens — single source of truth, referenced everywhere     */
/* ------------------------------------------------------------------ */
const TOKENS = {
  cream: "#F5F0E8",
  creamDark: "#EDE7D9",
  green: "#2D5016",
  greenLight: "#EBF2E3",
  terra: "#C4622D",
  terraLight: "#FAF0EA",
  ink: "#1A1A1A",
  muted: "#6B7280",
  border: "#E2DACE",
  white: "#FFFFFF",
  amber: "#D97706",
  amberLight: "#FEF3C7",
  red: "#DC2626",
  redLight: "#FEE2E2",
  blue: "#1D4ED8",
  blueLight: "#DBEAFE",
};

const VEHICLE_TYPES = [
  { value: "NonAC", label: "Non-AC" },
  { value: "AC", label: "AC" },
  { value: "Big", label: "Big / ICU" },
];

const API_BASE = "/api/Ambulance";
const PHONE_RE = /^[0-9+()\-\s]{7,15}$/;

/* ------------------------------------------------------------------ */
/*  API helpers                                                       */
/* ------------------------------------------------------------------ */
function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, { headers: { ...authHeaders() } });
  if (!res.ok) throw new ApiError(res.status, await safeMessage(res));
  return res.json();
}

async function apiPut(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new ApiError(res.status, await safeMessage(res));
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function safeMessage(res) {
  try {
    const data = await res.json();
    return data?.message || data?.title || null;
  } catch {
    return null;
  }
}

class ApiError extends Error {
  constructor(status, message) {
    super(message || `Request failed (${status})`);
    this.status = status;
  }
}

/* ------------------------------------------------------------------ */
/*  Validation                                                        */
/* ------------------------------------------------------------------ */
function validate(form) {
  const errors = {};
  if (!form.driverName?.trim()) errors.driverName = "Name is required";
  if (!form.driverPhone?.trim()) errors.driverPhone = "Phone number is required";
  else if (!PHONE_RE.test(form.driverPhone)) errors.driverPhone = "Enter a valid phone number";
  if (!form.baseLocation?.trim()) errors.baseLocation = "Base location is required";
  if (!form.vehicleNumber?.trim()) errors.vehicleNumber = "Vehicle number is required";
  if (!form.licenseNumber?.trim()) errors.licenseNumber = "Licence number is required";
  return errors;
}

const typeLabel = (value) => VEHICLE_TYPES.find((v) => v.value === value)?.label || value || "—";

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */
export default function Profile() {
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [loadError, setLoadError] = useState(null);

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [availabilityPending, setAvailabilityPending] = useState(false);
  const [toast, setToast] = useState(null);

  const loadProfile = useCallback(async () => {
    setStatus("loading");
    setLoadError(null);
    try {
      const data = await apiGet("/profile");
      setProfile(data);
      setForm(data);
      setStatus("ready");
    } catch (e) {
      setLoadError(
        e instanceof ApiError && e.status === 401
          ? "Your session has expired. Please log in again."
          : e.message || "Couldn't load your profile. Check your connection and try again."
      );
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const isDirty = useMemo(() => {
    if (!profile || !form) return false;
    return JSON.stringify(profile) !== JSON.stringify(form);
  }, [profile, form]);

  function handleChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }));
  }

  function startEdit() {
    setSaveError(null);
    setErrors({});
    setEditing(true);
  }

  function cancelEdit() {
    setForm(profile);
    setErrors({});
    setSaveError(null);
    setEditing(false);
  }

  async function saveProfile() {
    const fieldErrors = validate(form);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;
    if (!isDirty) {
      setEditing(false);
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      const updated = await apiPut("/profile", form);
      const next = updated || form;
      setProfile(next);
      setForm(next);
      setEditing(false);
      showToast("success", "Profile updated");
    } catch (e) {
      setSaveError(
        e instanceof ApiError && e.status === 401
          ? "Your session has expired. Please log in again."
          : e.message || "Couldn't save your changes. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleAvailability() {
    if (availabilityPending) return;
    const next = !profile.isAvailable;
    setAvailabilityPending(true);
    setProfile((p) => ({ ...p, isAvailable: next }));
    setForm((f) => ({ ...f, isAvailable: next }));
    try {
      await apiPut("/availability", { isAvailable: next });
      showToast("success", next ? "You're now online" : "You're now offline");
    } catch (e) {
      setProfile((p) => ({ ...p, isAvailable: !next }));
      setForm((f) => ({ ...f, isAvailable: !next }));
      showToast("error", "Couldn't update status — try again");
    } finally {
      setAvailabilityPending(false);
    }
  }

  function showToast(kind, message) {
    setToast({ kind, message });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 3000);
  }

  /* ---------------------------- render states ---------------------------- */

  if (status === "loading") return <ProfileSkeleton />;

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center px-5" style={{ backgroundColor: TOKENS.cream }}>
        <div
          className="max-w-sm w-full rounded-3xl p-8 text-center shadow-sm"
          style={{ backgroundColor: TOKENS.white, border: `1px solid ${TOKENS.border}` }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: TOKENS.redLight }}
          >
            <AlertTriangle className="w-6 h-6" style={{ color: TOKENS.red }} />
          </div>
          <h2 className="text-base font-semibold mb-1.5" style={{ color: TOKENS.ink }}>
            Couldn't load your profile
          </h2>
          <p className="text-sm mb-5" style={{ color: TOKENS.muted }}>
            {loadError}
          </p>
          <button
            onClick={loadProfile}
            className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl text-white"
            style={{ backgroundColor: TOKENS.green }}
          >
            <RefreshCw className="w-4 h-4" /> Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: TOKENS.cream }}>
      <div className="w-full px-8 lg:px-12 py-8">
        {/* Page header */}
        <div className="mb-7">
          <h1 className="font-serif text-3xl font-bold" style={{ color: TOKENS.ink }}>
            My Profile
          </h1>
          <p className="text-sm mt-1" style={{ color: TOKENS.muted }}>
            Your driver information on CareConnect
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-8 items-start">
          {/* ---------------- Left sidebar card ---------------- */}
          <div
  className="rounded-3xl overflow-hidden shadow-lg h-full"
            style={{ backgroundColor: TOKENS.white, border: `1px solid ${TOKENS.border}` }}
          >
<div
  className="h-6"
  style={{
    backgroundColor: TOKENS.white,
    borderBottom: `1px solid ${TOKENS.border}`,
  }}
></div>

            <div className="px-5 pb-5">
              <div
                className="w-20 h-20 rounded-full -mt-10 mb-3 flex items-center justify-center overflow-hidden shadow-sm"
                style={{ backgroundColor: TOKENS.creamDark, border: `4px solid ${TOKENS.white}` }}
              >
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle2 className="w-12 h-12" style={{ color: TOKENS.muted }} />
                )}
              </div>

              <h2 className="font-serif text-lg font-bold leading-snug" style={{ color: TOKENS.ink }}>
                {profile.driverName}
              </h2>

              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span
                  className="inline-flex text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: TOKENS.terraLight, color: TOKENS.terra }}
                >
                  {typeLabel(profile.type)}
                </span>
                {profile.verified && (
                  <span
                    className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
                    style={{ backgroundColor: TOKENS.creamDark, color: TOKENS.green }}
                  >
                    <BadgeCheck className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm" style={{ color: TOKENS.muted }}>
                  <Truck className="w-4 h-4 shrink-0" />
                  <span className="truncate">{profile.vehicleNumber || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm" style={{ color: TOKENS.muted }}>
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span className="truncate">{profile.baseLocation || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm" style={{ color: TOKENS.muted }}>
                  <Mail className="w-4 h-4 shrink-0" />
                  <span className="truncate">{profile.email}</span>
                </div>
              </div>

              <div
                className="mt-4 rounded-2xl px-4 py-3 flex items-center justify-between"
                style={{ backgroundColor: TOKENS.creamDark }}
              >
                <div>
                  <p
                    className="text-[11px] font-semibold uppercase tracking-wide"
                    style={{ color: TOKENS.muted }}
                  >
                    Rating
                  </p>
                  <p className="text-lg font-bold flex items-center gap-1" style={{ color: TOKENS.green }}>
                    <Star className="w-4 h-4 fill-current" style={{ color: TOKENS.amber }} />
                    {(profile.rating ?? 0).toFixed(1)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleAvailability}
                  disabled={availabilityPending}
                  aria-pressed={profile.isAvailable}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl disabled:opacity-60"
                  style={{
                    backgroundColor: profile.isAvailable ? TOKENS.white : TOKENS.creamDark,
                    color: profile.isAvailable ? TOKENS.green : TOKENS.muted,
                  }}
                >
                  {availabilityPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: profile.isAvailable ? TOKENS.green : TOKENS.muted }}
                    />
                  )}
                  {profile.isAvailable ? "Online" : "Offline"}
                </button>
              </div>
            </div>
          </div>

          {/* ---------------- Right details card ---------------- */}
          <div
            className="rounded-3xl shadow-sm"
            style={{ backgroundColor: TOKENS.white, border: `1px solid ${TOKENS.border}` }}
          >
            <div
              className="flex items-center justify-between px-6 sm:px-7 py-5"
              style={{ borderBottom: `1px solid ${TOKENS.border}` }}
            >
              <h3 className="font-serif text-lg font-bold" style={{ color: TOKENS.ink }}>
                Driver Details
              </h3>

              {!editing ? (
                <button
                  type="button"
                  onClick={startEdit}
                  className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl text-white focus-visible:ring-2 focus-visible:ring-offset-2"
                  style={{ backgroundColor: TOKENS.terra }}
                >
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    disabled={saving}
                    aria-label="Cancel editing"
                    className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-xl disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-offset-2"
                    style={{ backgroundColor: TOKENS.creamDark, color: TOKENS.ink }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={saveProfile}
                    disabled={saving || !isDirty}
                    className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl text-white disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-offset-2"
                    style={{ backgroundColor: TOKENS.green }}
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save
                  </button>
                </div>
              )}
            </div>

            {saveError && (
              <p
                className="mx-6 sm:mx-7 mt-4 text-xs px-3 py-2 rounded-lg"
                style={{ backgroundColor: TOKENS.redLight, color: TOKENS.red }}
              >
                {saveError}
              </p>
            )}

            <div className="px-6 sm:px-7">
              <Row icon={<Mail className="w-4 h-4" />} label="Email">
                <p className="text-sm font-semibold" style={{ color: TOKENS.ink }}>
                  {profile.email}
                </p>
                {editing && (
                  <p className="text-xs mt-0.5" style={{ color: TOKENS.muted }}>
                    Can't be changed here — it's your login ID.
                  </p>
                )}
              </Row>

              <Row icon={<UserCircle2 className="w-4 h-4" />} label="Driver name">
                <EditableValue
                  editing={editing}
                  value={form.driverName}
                  error={errors.driverName}
                  onChange={(v) => handleChange("driverName", v)}
                />
              </Row>

              <Row icon={<Phone className="w-4 h-4" />} label="Phone">
                <EditableValue
                  editing={editing}
                  value={form.driverPhone}
                  error={errors.driverPhone}
                  onChange={(v) => handleChange("driverPhone", v)}
                />
              </Row>

              <Row icon={<Truck className="w-4 h-4" />} label="Vehicle type">
                {editing ? (
                  <select
                    value={form.type}
                    onChange={(e) => handleChange("type", e.target.value)}
                    className="w-full max-w-xs text-sm rounded-xl px-3 py-2 outline-none focus-visible:ring-2"
                    style={{
                      backgroundColor: TOKENS.cream,
                      border: `1px solid ${TOKENS.border}`,
                      color: TOKENS.ink,
                    }}
                  >
                    {VEHICLE_TYPES.map((v) => (
                      <option key={v.value} value={v.value}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm font-semibold" style={{ color: TOKENS.ink }}>
                    {typeLabel(profile.type)}
                  </p>
                )}
              </Row>

              <Row icon={<Truck className="w-4 h-4" />} label="Vehicle number">
                <EditableValue
                  editing={editing}
                  value={form.vehicleNumber}
                  error={errors.vehicleNumber}
                  onChange={(v) => handleChange("vehicleNumber", v)}
                />
              </Row>

              <Row icon={<ShieldCheck className="w-4 h-4" />} label="Licence number">
                <EditableValue
                  editing={editing}
                  value={form.licenseNumber}
                  error={errors.licenseNumber}
                  onChange={(v) => handleChange("licenseNumber", v)}
                />
              </Row>

              <Row icon={<MapPin className="w-4 h-4" />} label="Base location" last>
                <EditableValue
                  editing={editing}
                  value={form.baseLocation}
                  error={errors.baseLocation}
                  onChange={(v) => handleChange("baseLocation", v)}
                />
              </Row>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg text-white"
          style={{ backgroundColor: toast.kind === "error" ? TOKENS.red : TOKENS.ink }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Subcomponents                                                      */
/* ------------------------------------------------------------------ */
function Row({ icon, label, children, last = false }) {
  return (
    <div
      className="flex items-start gap-4 py-4"
      style={{ borderBottom: last ? "none" : `1px solid ${TOKENS.border}` }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: TOKENS.creamDark, color: TOKENS.green }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-[11px] font-semibold uppercase tracking-wide mb-1"
          style={{ color: TOKENS.muted }}
        >
          {label}
        </p>
        {children}
      </div>
    </div>
  );
}

function EditableValue({ editing, value, error, onChange }) {
  if (!editing) {
    return (
      <p className="text-sm font-semibold" style={{ color: TOKENS.ink }}>
        {value || "—"}
      </p>
    );
  }
  return (
    <>
      <input
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        className="w-full max-w-xs text-sm rounded-xl px-3 py-2 outline-none focus-visible:ring-2"
        style={{
          backgroundColor: TOKENS.cream,
          border: `1px solid ${error ? TOKENS.red : TOKENS.border}`,
          color: TOKENS.ink,
        }}
      />
      {error && (
        <p className="text-xs mt-1" style={{ color: TOKENS.red }}>
          {error}
        </p>
      )}
    </>
  );
}

function ProfileSkeleton() {
  const pulse = { backgroundColor: TOKENS.creamDark };
  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: TOKENS.cream }}>
      <div className="w-full px-8 lg:px-12 py-8">
        <div className="h-8 w-40 rounded animate-pulse mb-2" style={pulse} />
        <div className="h-4 w-56 rounded animate-pulse mb-7" style={pulse} />
        <div className="grid md:grid-cols-[280px_1fr] gap-6">
          <div className="h-80 rounded-3xl animate-pulse" style={pulse} />
          <div className="h-96 rounded-3xl animate-pulse" style={pulse} />
        </div>
      </div>
    </div>
  );
}