import { useEffect, useMemo, useState } from "react";
import {
    Mail,
    Search,
    Eye,
    Trash2,
    MessageSquare,
    Calendar,
    User,
    X,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import api from "../../api/axios";

export default function AdminContactMessages() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState(null);
    const [deleteItem, setDeleteItem] = useState(null);

    useEffect(() => {
        loadMessages();
    }, []);

    async function loadMessages() {
        try {
            setLoading(true);
            const res = await api.get("/admin/contact-messages");
            setMessages(res.data || []);
        } catch {
            toast.error("Failed to load messages");
        } finally {
            setLoading(false);
        }
    }

    async function viewMessage(id) {
        try {
            const res = await api.get(`/admin/contact-message/${id}`);
            setSelected(res.data);
        } catch {
            toast.error("Unable to load message");
        }
    }

    async function deleteMessage() {
        try {
            await api.delete(`/admin/contact-message/${deleteItem.id}`);
            toast.success("Message deleted");
            setDeleteItem(null);
            loadMessages();
        } catch {
            toast.error("Delete failed");
        }
    }

    const filtered = useMemo(() => {
        return messages.filter(
            (x) =>
                x.name?.toLowerCase().includes(search.toLowerCase()) ||
                x.email?.toLowerCase().includes(search.toLowerCase()) ||
                x.subject?.toLowerCase().includes(search.toLowerCase()) ||
                x.message?.toLowerCase().includes(search.toLowerCase())
        );
    }, [messages, search]);

    return (
        <>
            <Toaster position="top-right" />
            <div
                className="min-h-screen bg-[#FAF8F3] text-[#16332B]"
                style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
            >
                <div className="w-full px-8 lg:px-16 xl:px-24 2xl:px-32 py-16 max-w-[1500px] mx-auto">

                    {/* ── Header ── */}
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
                        <div>
                            <p className="text-[13px] uppercase tracking-[0.22em] text-[#B5562C] font-semibold mb-5">
                                Admin
                            </p>
                            <h1
                                style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                                className="leading-[1.05] tracking-tight"
                            >
                                <span style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)" }}>
                                    Contact
                                </span>{" "}
                                <span
                                    className="italic text-[#3E7C59]"
                                    style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)" }}
                                >
                                    messages.
                                </span>
                            </h1>
                            <p className="mt-3 text-[15px] text-[#16332B]/55">
                                Manage customer enquiries sent from the website.
                            </p>
                        </div>

                        <div className="relative w-full lg:w-[340px]">
                            <Search
                                size={16}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#16332B]/35"
                            />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search name, email, or subject"
                                className="w-full h-12 rounded-full border border-[#E4DFD3] bg-white pl-11 pr-4 text-sm placeholder:text-[#16332B]/35 outline-none focus:ring-2 focus:ring-[#16332B]/20 transition"
                            />
                        </div>
                    </div>

                    {/* ── Stats ── */}
                    <div className="grid md:grid-cols-3 gap-5 mb-10">
                        <div className="bg-white rounded-[20px] border border-[#E4DFD3] p-6">
                            <div className="w-11 h-11 rounded-xl bg-[#EBF2E3] flex items-center justify-center mb-4">
                                <Mail size={20} strokeWidth={1.75} className="text-[#3E7C59]" />
                            </div>
                            <h3
                                style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700 }}
                                className="text-[2rem] text-[#16332B]"
                            >
                                {messages.length}
                            </h3>
                            <p className="text-[13px] text-[#16332B]/55 mt-1">Total messages</p>
                        </div>

                        <div className="bg-white rounded-[20px] border border-[#E4DFD3] p-6">
                            <div className="w-11 h-11 rounded-xl bg-[#EBF2E3] flex items-center justify-center mb-4">
                                <MessageSquare size={20} strokeWidth={1.75} className="text-[#3E7C59]" />
                            </div>
                            <h3
                                style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700 }}
                                className="text-[2rem] text-[#16332B]"
                            >
                                {filtered.length}
                            </h3>
                            <p className="text-[13px] text-[#16332B]/55 mt-1">Showing results</p>
                        </div>

                        <div className="bg-white rounded-[20px] border border-[#E4DFD3] p-6">
                            <div className="w-11 h-11 rounded-xl bg-[#EBF2E3] flex items-center justify-center mb-4">
                                <User size={20} strokeWidth={1.75} className="text-[#3E7C59]" />
                            </div>
                            <h3
                                style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 700 }}
                                className="text-[2rem] text-[#16332B]"
                            >
                                {new Set(messages.map((x) => x.email)).size}
                            </h3>
                            <p className="text-[13px] text-[#16332B]/55 mt-1">Unique users</p>
                        </div>
                    </div>

                    {/* ── Messages table ── */}
                    <div className="bg-white rounded-[24px] border border-[#E4DFD3] overflow-hidden">
                        {loading ? (
                            <div className="py-24 text-center text-[#16332B]/55 text-sm">
                                Loading messages…
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="py-24 text-center">
                                <div className="w-14 h-14 mx-auto rounded-full bg-[#FAF8F3] flex items-center justify-center">
                                    <Mail size={22} className="text-[#16332B]/35" strokeWidth={1.5} />
                                </div>
                                <h3
                                    style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                                    className="text-[1.3rem] mt-6"
                                >
                                    No messages found
                                </h3>
                                <p className="text-[#16332B]/55 text-[14px] mt-2 max-w-xs mx-auto">
                                    There are no contact messages matching your search.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-[#FAF8F3] border-b border-[#E4DFD3]">
                                            {["Name", "Email", "Subject", "Date"].map((h) => (
                                                <th
                                                    key={h}
                                                    className="text-left px-6 py-4 text-[11px] font-semibold uppercase tracking-wide text-[#16332B]/50"
                                                >
                                                    {h}
                                                </th>
                                            ))}
                                            <th className="text-center px-6 py-4 text-[11px] font-semibold uppercase tracking-wide text-[#16332B]/50">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filtered.map((item) => (
                                            <tr
                                                key={item.id}
                                                className="border-b border-[#E4DFD3] last:border-b-0 hover:bg-[#FAF8F3] transition"
                                            >
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-[#EBF2E3] flex items-center justify-center shrink-0">
                                                            <User size={16} className="text-[#3E7C59]" />
                                                        </div>
                                                        <p className="font-semibold text-[#16332B] text-[14px]">
                                                            {item.name}
                                                        </p>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-5">
                                                    <span className="text-[#16332B]/60 text-[13px]">
                                                        {item.email}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-5 max-w-[280px]">
                                                    <p className="font-medium text-[#16332B] text-[14px] truncate">
                                                        {item.subject || "No subject"}
                                                    </p>
                                                    <p className="text-[12px] text-[#16332B]/45 mt-1 line-clamp-1">
                                                        {item.message}
                                                    </p>
                                                </td>

                                                <td className="px-6 py-5 whitespace-nowrap">
                                                    <div className="flex items-center gap-2 text-[#16332B]/55 text-[13px]">
                                                        <Calendar size={14} />
                                                        {new Date(item.createdAt).toLocaleDateString()}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-5">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => viewMessage(item.id)}
                                                            className="w-9 h-9 rounded-xl bg-[#EBF2E3] hover:bg-[#DDEBD4] flex items-center justify-center transition"
                                                        >
                                                            <Eye size={16} className="text-[#3E7C59]" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteItem(item)}
                                                            className="w-9 h-9 rounded-xl bg-[#FBEAE5] hover:bg-[#F5D9D0] flex items-center justify-center transition"
                                                        >
                                                            <Trash2 size={16} className="text-[#9E211A]" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* ── View message modal ── */}
                    {selected && (
                        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-5">
                            <div className="bg-white rounded-[24px] w-full max-w-2xl shadow-2xl">
                                <div className="flex items-center justify-between border-b border-[#E4DFD3] px-8 py-6">
                                    <div>
                                        <h2
                                            style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                                            className="text-[1.4rem] text-[#16332B]"
                                        >
                                            Contact message
                                        </h2>
                                        <p className="text-[13px] text-[#16332B]/55 mt-1">
                                            Submitted by {selected.name}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setSelected(null)}
                                        className="w-9 h-9 rounded-full hover:bg-[#FAF8F3] flex items-center justify-center transition"
                                    >
                                        <X size={18} className="text-[#16332B]/60" />
                                    </button>
                                </div>

                                <div className="p-8 space-y-6">
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-[11px] uppercase tracking-wide text-[#16332B]/45">
                                                Name
                                            </p>
                                            <p className="font-semibold text-[#16332B] text-[14px] mt-1">
                                                {selected.name}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[11px] uppercase tracking-wide text-[#16332B]/45">
                                                Email
                                            </p>
                                            <p className="font-semibold text-[#16332B] text-[14px] mt-1">
                                                {selected.email}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-[11px] uppercase tracking-wide text-[#16332B]/45">
                                            Subject
                                        </p>
                                        <p className="font-semibold text-[#16332B] text-[14px] mt-1">
                                            {selected.subject || "No subject"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[11px] uppercase tracking-wide text-[#16332B]/45 mb-2">
                                            Message
                                        </p>
                                        <div className="bg-[#FAF8F3] border border-[#E4DFD3] rounded-2xl p-5 whitespace-pre-wrap leading-7 text-[14px] text-[#16332B]">
                                            {selected.message}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-[#16332B]/50 text-[13px]">
                                        <Calendar size={14} />
                                        {new Date(selected.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Delete confirmation modal ── */}
                    {deleteItem && (
                        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-5">
                            <div className="bg-white rounded-[24px] w-full max-w-md p-8 shadow-2xl">
                                <div className="w-14 h-14 rounded-full bg-[#FBEAE5] flex items-center justify-center mx-auto">
                                    <Trash2 size={24} className="text-[#9E211A]" />
                                </div>
                                <h2
                                    style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 500 }}
                                    className="text-[1.3rem] text-center mt-6 text-[#16332B]"
                                >
                                    Delete message?
                                </h2>
                                <p className="text-center text-[#16332B]/55 text-[14px] mt-3 leading-6">
                                    Are you sure you want to permanently delete this contact message?
                                </p>
                                <div className="flex gap-3 mt-8">
                                    <button
                                        onClick={() => setDeleteItem(null)}
                                        className="flex-1 border border-[#E4DFD3] py-3 rounded-xl font-medium text-sm text-[#16332B] hover:bg-[#FAF8F3] transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={deleteMessage}
                                        className="flex-1 bg-[#9E211A] hover:bg-[#86190F] text-white py-3 rounded-xl font-medium text-sm transition"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}