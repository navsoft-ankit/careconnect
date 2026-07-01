import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { Toaster, toast } from "react-hot-toast";
import {
    AlertCircle, RefreshCw, Loader2, Save, IndianRupee, Camera, X,
} from "lucide-react";

/* ─── Design tokens — shared across CareConnect panels ─── */
const T = {
    cream: "#F5F0E8",
    creamDark: "#EDE7D9",
    green: "#2D5016",
    greenDark: "#1F3A0F",
    greenLight: "#EBF2E3",
    terra: "#C4622D",
    terraLight: "#FBEAE0",
    ink: "#16332B",
    border: "#E2DACE",
    white: "#FFFFFF",
    red: "#B3441F",
    redLight: "#FBEAE0",
};

const FRAUNCES = "'Fraunces', serif";
const INTER = "'Inter', sans-serif";

const EMPTY_FORM = {
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    bloodGroup: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pinCode: "",
    avatarUrl: "",
};

const PHONE_RE = /^[0-9+()\-\s]{7,15}$/;
const PIN_RE = /^[0-9]{6}$/;
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function validate(form) {
    const errors = {};
    if (!form.fullName.trim()) errors.fullName = "Full name is required";
    if (form.phone && !PHONE_RE.test(form.phone.trim())) errors.phone = "Enter a valid phone number";
    if (form.pinCode && !PIN_RE.test(form.pinCode.trim())) errors.pinCode = "PIN code must be 6 digits";
    if (form.dob && new Date(form.dob) > new Date()) errors.dob = "Date of birth can't be in the future";
    return errors;
}

function initials(name) {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
}

export default function Profile() {
    const [status, setStatus] = useState("loading"); // loading | ready | error
    const [loadError, setLoadError] = useState(null);

    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const [refundBalance, setRefundBalance] = useState(0);
    const [refundLoading, setRefundLoading] = useState(true);

    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarUploading, setAvatarUploading] = useState(false);

    const loadProfile = useCallback(async () => {
        setStatus("loading");
        setLoadError(null);
        try {
            const res = await api.get("/patient/profile");
            const data = {
                ...EMPTY_FORM,
                ...res.data,
                dob: res.data.dob
                    ? res.data.dob.split("T")[0]
                    : ""
            };
            setProfile(data);
            setForm(data);
            setStatus("ready");
        } catch (err) {
            setLoadError(
                err?.response?.status === 401
                    ? "Your session has expired. Please log in again."
                    : "Couldn't load your profile. Check your connection and try again."
            );
            setStatus("error");
        }
    }, []);

    const loadRefundBalance = useCallback(async () => {
        setRefundLoading(true);
        try {
            const res = await api.get("/patient/refund-balance");
            setRefundBalance(res.data?.refundBalance ?? 0);
        } catch (err) {
            console.error(err);
        } finally {
            setRefundLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProfile();
        loadRefundBalance();
    }, [loadProfile, loadRefundBalance]);

    useEffect(() => {
        return () => {
            if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        };
    }, [avatarPreview]);

    const isDirty = useMemo(() => {
        if (!profile) return false;
        return JSON.stringify(profile) !== JSON.stringify(form) || !!avatarFile;
    }, [profile, form, avatarFile]);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
        if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
    }

    function handleAvatarSelect(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast.error("Please choose an image file.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be under 5MB.");
            return;
        }
        if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
        e.target.value = "";
    }

    function removeAvatarSelection() {
        if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        setAvatarFile(null);
        setAvatarPreview(null);
    }

    async function saveProfile() {
        const fieldErrors = validate(form);
        setErrors(fieldErrors);
        if (Object.keys(fieldErrors).length > 0) {
            toast.error("Please fix the highlighted fields.");
            return;
        }
        if (!isDirty) return;

        setSaving(true);
        try {
            let avatarUrl = form.avatarUrl;

            if (avatarFile) {
                setAvatarUploading(true);
                const fd = new FormData();
                fd.append("file", avatarFile);
                const uploadRes = await api.post("/patient/avatar", fd, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                avatarUrl = uploadRes.data?.avatarUrl || avatarUrl;
                console.log("Uploaded avatar:", avatarUrl);
                setAvatarUploading(false);
            }

            const payload = {
                ...form,
                dob: form.dob && form.dob.trim() !== "" ? form.dob : null,
                avatarUrl
            };
            console.log(payload);
            const res = await api.put("/patient/profile", payload);
            const updated = {
                ...payload,
                ...(res.data || {}),
                avatarUrl
            };
            setProfile(updated);
            setForm(updated);
            removeAvatarSelection();
            localStorage.setItem("name", updated.fullName);
            toast.success("Profile saved successfully.");
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                (typeof err?.response?.data === "string" ? err.response.data : null);
            toast.error(msg || "Couldn't save your changes. Please try again.");
        } finally {
            setSaving(false);
            setAvatarUploading(false);
        }
    }

    function discardChanges() {
        setForm(profile);
        setErrors({});
        removeAvatarSelection();
    }

    /* ---------------------------- render states ---------------------------- */

    if (status === "loading") return <ProfileSkeleton />;

    if (status === "error") {
        return (
            <div className="min-h-screen flex items-center justify-center px-5" style={{ backgroundColor: T.cream, fontFamily: INTER }}>
                <div className="max-w-sm w-full rounded-[28px] p-8 text-center shadow-xl" style={{ backgroundColor: T.white, border: `1px solid ${T.border}` }}>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: T.redLight }}>
                        <AlertCircle className="w-6 h-6" style={{ color: T.red }} />
                    </div>
                    <h2 className="text-base font-semibold mb-1.5" style={{ color: T.ink, fontFamily: FRAUNCES }}>
                        Couldn't load your profile
                    </h2>
                    <p className="text-sm mb-5" style={{ color: T.ink, opacity: 0.6 }}>{loadError}</p>
                    <button
                        onClick={loadProfile}
                        className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-xl text-white transition-transform active:scale-[0.97]"
                        style={{ backgroundColor: T.green }}
                    >
                        <RefreshCw className="w-4 h-4" /> Try again
                    </button>
                </div>
            </div>
        );
    }

    const displayAvatar = avatarPreview
        ? avatarPreview
        : form.avatarUrl
            ? `http://localhost:5008${form.avatarUrl}`
            : "";
    return (
        <div className="min-h-screen pb-28 md:pb-10" style={{ backgroundColor: T.cream, fontFamily: INTER }}>
            <Toaster position="top-right" />

            {/* ── Header band ── */}
            <div className="px-4 sm:px-8 pt-10 pb-6 max-w-5xl mx-auto">
                <p className="text-xs font-semibold tracking-[0.18em] uppercase mb-2" style={{ color: T.terra }}>
                    Account
                </p>
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <h1
                        style={{
                            fontFamily: FRAUNCES,
                            fontSize: "clamp(2rem, 4vw, 2.75rem)",
                            color: T.ink,
                            lineHeight: 1.05,
                        }}
                    >
                        My Profile
                    </h1>
                    {isDirty && (
                        <span
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                            style={{ backgroundColor: "#FDF2E9", color: T.terra, border: `1px solid ${T.terra}33` }}
                        >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: T.terra }} />
                            Unsaved changes
                        </span>
                    )}
                </div>
                <p className="mt-1 text-sm" style={{ color: T.ink, opacity: 0.55 }}>
                    Manage the details tied to your account and bookings.
                </p>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-8">
                <div className="rounded-[32px] shadow-sm overflow-hidden" style={{ backgroundColor: T.white, border: `1px solid ${T.border}` }}>

                    {/* Identity strip */}
                    <div className="flex items-center gap-6 p-6 sm:p-8" style={{ borderBottom: `1px solid ${T.border}` }}>
                        <div className="relative shrink-0">
                            {displayAvatar ? (
                                <img
                                    src={displayAvatar}
                                    alt=""
                                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover"
                                    style={{ border: `3px solid ${T.creamDark}` }}
                                />
                            ) : (
                                <div
                                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: T.greenLight, border: `3px solid ${T.creamDark}` }}
                                >
                                    <span style={{ fontFamily: FRAUNCES, fontSize: "1.75rem", color: T.green }}>
                                        {initials(form.fullName)}
                                    </span>
                                </div>
                            )}

                            <label
                                htmlFor="avatar-upload"
                                className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer shadow-md transition-transform hover:scale-105"
                                style={{ backgroundColor: T.ink }}
                                title="Change photo"
                            >
                                {avatarUploading ? (
                                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                                ) : (
                                    <Camera className="w-4 h-4 text-white" />
                                )}
                            </label>
                            <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} />

                            {avatarPreview && (
                                <button
                                    onClick={removeAvatarSelection}
                                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow"
                                    style={{ backgroundColor: T.white, border: `1px solid ${T.border}` }}
                                    title="Remove selected photo"
                                >
                                    <X className="w-3.5 h-3.5" style={{ color: T.ink }} />
                                </button>
                            )}
                        </div>

                        <div className="min-w-0">
                            <h2 className="text-xl sm:text-2xl font-semibold truncate" style={{ fontFamily: FRAUNCES, color: T.ink }}>
                                {form.fullName || "Patient"}
                            </h2>
                            <p className="text-sm truncate" style={{ color: T.ink, opacity: 0.55 }}>{form.email}</p>
                        </div>
                    </div>

                    {/* Refund balance — hairline stat strip */}
                    <div className="p-6 sm:p-8" style={{ borderBottom: `1px solid ${T.border}` }}>
                        <div
                            className="rounded-2xl px-6 py-5 flex flex-wrap items-center justify-between gap-4"
                            style={{ backgroundColor: T.greenLight }}
                        >
                            <div>
                                <p className="text-xs font-semibold tracking-[0.14em] uppercase" style={{ color: T.green, opacity: 0.75 }}>
                                    Refund Balance
                                </p>
                                <p className="mt-1 text-sm" style={{ color: T.ink, opacity: 0.6 }}>
                                    Applied automatically at your next appointment.
                                </p>
                            </div>
                            <div className="text-right">
                                {refundLoading ? (
                                    <Loader2 className="w-6 h-6 animate-spin ml-auto" style={{ color: T.green }} />
                                ) : (
                                    <h3
                                        className="flex items-center gap-0.5"
                                        style={{ fontFamily: FRAUNCES, fontSize: "clamp(1.75rem, 3vw, 2.25rem)", color: T.green }}
                                    >
                                        <IndianRupee className="w-6 h-6" strokeWidth={2.25} />
                                        {refundBalance}
                                    </h3>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="p-6 sm:p-8">
                        <p className="text-xs font-semibold tracking-[0.14em] uppercase mb-5" style={{ color: T.ink, opacity: 0.45 }}>
                            Personal Details
                        </p>
                        <div className="grid md:grid-cols-2 gap-5">
                            <FormField label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} error={errors.fullName} required />
                            <FormField label="Email" name="email" value={form.email} disabled hint="Email can't be changed here — it's your login ID." />
                            <FormField label="Phone" name="phone" value={form.phone} onChange={handleChange} error={errors.phone} placeholder="e.g. +91 98765 43210" />

                            <FormField as="select" label="Gender" name="gender" value={form.gender} onChange={handleChange}>
                                <option value="">Select gender</option>
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                            </FormField>

                            <FormField type="date" label="Date of Birth" name="dob" value={form.dob} onChange={handleChange} error={errors.dob} max={new Date().toISOString().split("T")[0]} />

                            <FormField as="select" label="Blood Group" name="bloodGroup" value={form.bloodGroup} onChange={handleChange}>
                                <option value="">Select</option>
                                {BLOOD_GROUPS.map((bg) => (
                                    <option key={bg}>{bg}</option>
                                ))}
                            </FormField>

                            <FormField as="textarea" rows={3} label="Address" name="address" value={form.address} onChange={handleChange} className="md:col-span-2" />

                            <FormField label="City" name="city" value={form.city} onChange={handleChange} />
                            <FormField label="State" name="state" value={form.state} onChange={handleChange} />
                            <FormField label="Country" name="country" value={form.country} onChange={handleChange} />
                            <FormField label="PIN Code" name="pinCode" value={form.pinCode} onChange={handleChange} error={errors.pinCode} placeholder="6-digit PIN code" />
                        </div>
                    </div>

                    {/* Desktop actions — inline, hidden on mobile in favor of sticky bar */}
                    <div className="hidden md:flex justify-end gap-3 px-8 pb-8">
                        {isDirty && (
                            <button
                                onClick={discardChanges}
                                disabled={saving}
                                className="px-7 py-3.5 rounded-2xl font-semibold transition-all disabled:opacity-60"
                                style={{ backgroundColor: T.cream, color: T.ink, border: `1.5px solid ${T.border}` }}
                            >
                                Discard
                            </button>
                        )}
                        <SaveButton saving={saving} isDirty={isDirty} onClick={saveProfile} />
                    </div>
                </div>
            </div>

            {/* Mobile sticky action bar */}
            {isDirty && (
                <div
                    className="md:hidden fixed bottom-0 left-0 right-0 flex gap-3 p-4 z-20"
                    style={{ backgroundColor: T.white, borderTop: `1px solid ${T.border}`, boxShadow: "0 -8px 24px rgba(22,51,43,0.08)" }}
                >
                    <button
                        onClick={discardChanges}
                        disabled={saving}
                        className="flex-1 py-3.5 rounded-2xl font-semibold disabled:opacity-60"
                        style={{ backgroundColor: T.cream, color: T.ink, border: `1.5px solid ${T.border}` }}
                    >
                        Discard
                    </button>
                    <div className="flex-[1.4]">
                        <SaveButton saving={saving} isDirty={isDirty} onClick={saveProfile} full />
                    </div>
                </div>
            )}
        </div>
    );
}

function SaveButton({ saving, isDirty, onClick, full }) {
    return (
        <button
            onClick={onClick}
            disabled={saving || !isDirty}
            className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed ${full ? "w-full" : "px-10"}`}
            style={{ backgroundColor: T.ink }}
            onMouseEnter={(e) => !saving && isDirty && (e.currentTarget.style.backgroundColor = T.greenDark)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = T.ink)}
        >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Changes"}
        </button>
    );
}

/* ─── Reusable field ──────────────────────────── */
function FormField({
    as = "input", type = "text", label, name, value, onChange, error, hint,
    required = false, disabled = false, placeholder, className = "", children, rows, max,
}) {
    const base = "w-full rounded-xl border px-4 outline-none transition-all duration-200 focus:ring-4";
    const style = {
        color: T.ink,
        borderColor: error ? "#E5A08A" : T.border,
        backgroundColor: disabled ? T.cream : T.white,
        ["--tw-ring-color"]: error ? "rgba(196,98,45,0.12)" : "rgba(45,80,22,0.10)",
    };

    return (
        <div className={className}>
            <label htmlFor={name} className="block mb-1.5 text-sm font-medium" style={{ color: T.ink, opacity: 0.85 }}>
                {label} {required && <span style={{ color: T.terra }}>*</span>}
            </label>

            {as === "select" ? (
                <select id={name} name={name} value={value ?? ""} onChange={onChange} disabled={disabled} className={`${base} h-12`} style={style}>
                    {children}
                </select>
            ) : as === "textarea" ? (
                <textarea id={name} name={name} rows={rows} value={value ?? ""} onChange={onChange} disabled={disabled} className={`${base} p-4`} style={style} />
            ) : (
                <input
                    id={name}
                    type={type}
                    name={name}
                    value={value ?? ""}
                    onChange={onChange}
                    disabled={disabled}
                    placeholder={placeholder}
                    max={max}
                    aria-invalid={!!error}
                    className={`${base} h-12`}
                    style={style}
                />
            )}

            {error && <p className="mt-1.5 text-xs" style={{ color: T.red }}>{error}</p>}
            {!error && hint && <p className="mt-1.5 text-xs" style={{ color: T.ink, opacity: 0.45 }}>{hint}</p>}
        </div>
    );
}

/* ─── Skeleton ─────────────────────────────────── */
function ProfileSkeleton() {
    const pulse = { backgroundColor: "#EDE7D9" };
    return (
        <div className="min-h-screen py-10 px-4" style={{ backgroundColor: T.cream }}>
            <div className="max-w-5xl mx-auto rounded-[32px] p-8" style={{ backgroundColor: T.white, border: `1px solid ${T.border}` }}>
                <div className="h-9 w-52 rounded-xl animate-pulse mb-3" style={pulse} />
                <div className="h-4 w-72 rounded animate-pulse mb-8" style={pulse} />
                <div className="flex items-center gap-6 mb-8">
                    <div className="w-28 h-28 rounded-full animate-pulse" style={pulse} />
                    <div>
                        <div className="h-6 w-40 rounded animate-pulse mb-2" style={pulse} />
                        <div className="h-4 w-52 rounded animate-pulse" style={pulse} />
                    </div>
                </div>
                <div className="h-24 rounded-2xl animate-pulse mb-8" style={pulse} />
                <div className="grid md:grid-cols-2 gap-5">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-12 rounded-xl animate-pulse" style={pulse} />
                    ))}
                </div>
            </div>
        </div>
    );
}