import { useEffect, useState } from "react";
import api from "../../api/axios";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import {
    Package, CheckCircle2, PackageCheck, Truck, PartyPopper,
    Wallet, Ban, ShoppingBag,
} from "lucide-react";

/* ─── Design tokens ───────────────────────────────── */
const T = {
    cream: "#FAF8F3",
    creamDark: "#EFEAE0",
    green: "#16332B",
    greenMid: "#3E7C59",
    greenLight: "#EBF2E3",
    terra: "#B5562C",
    ink: "#16332B",
    muted: "#6B7280",
    border: "#E4DFD3",
    white: "#FFFFFF",
    danger: "#9E211A",
    dangerLight: "#FBEAE5",
};

const STATUS_CFG = {
    Pending: { bg: "#FEF9C3", text: "#854D0E", border: "#FDE68A" },
    Confirmed: { bg: "#DBEAFE", text: "#1E40AF", border: "#BFDBFE" },
    Packed: { bg: "#EDE9FE", text: "#6D28D9", border: "#DDD6FE" },
    "Out for Delivery": { bg: "#FFEDD5", text: "#9A3412", border: "#FED7AA" },
    Delivered: { bg: T.greenLight, text: T.greenMid, border: "#BBD9A0" },
    Cancelled: { bg: T.dangerLight, text: T.danger, border: "#F5C6BB" },
};

function StatusBadge({ status }) {
    const s = STATUS_CFG[status] || { bg: T.creamDark, text: T.muted, border: T.border };
    return (
        <span style={{
            padding: "4px 12px", borderRadius: 99, fontSize: 11, fontWeight: 700,
            background: s.bg, color: s.text, border: `1px solid ${s.border}`, whiteSpace: "nowrap",
        }}>
            {status}
        </span>
    );
}

function ActionBtn({ label, icon, bg, fg, onClick }) {
    return (
        <button
            onClick={onClick}
            style={{
                display: "flex", alignItems: "center", gap: 6,
                background: bg, color: fg, border: "none",
                padding: "8px 14px", borderRadius: 8, fontWeight: 700, fontSize: 12,
                cursor: "pointer", transition: "opacity .15s", whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = ".8"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
        >
            {icon} {label}
        </button>
    );
}

export default function ProductOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        try {
            setLoading(true);
            const res = await api.get("/admin/product-orders");
            setOrders(res.data);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.put(
                `/admin/product-order/${id}/status`,
                JSON.stringify(status),
                { headers: { "Content-Type": "application/json" } }
            );
            await load();
        } catch (err) {
            console.log(err);
            alert("Failed to update status");
        }
    };

    const markPayment = async (id) => {
        await api.put(`/admin/product-order/${id}/payment`);
        await load();
    };

    const card = {
        background: T.white, borderRadius: 20,
        border: `1px solid ${T.border}`, boxShadow: "0 2px 8px rgba(0,0,0,.04)",
        overflow: "hidden",
    };

    return (
        <div className="flex" style={{ fontFamily: "Inter, sans-serif" }}>
            <Sidebar />

            <div className="ml-64 w-full min-h-screen" style={{ background: T.cream }}>
                <Navbar />

                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@700;900&family=Inter:wght@400;500;600;700&display=swap');
                    * { box-sizing: border-box; }
                `}</style>

                <div style={{ padding: 28 }}>

                    {/* Header */}
                    <div style={{ marginBottom: 28 }}>
                        <h1 style={{ fontFamily: "Fraunces, serif", fontWeight: 900, fontSize: 28, margin: 0, color: T.ink }}>
                            Product Orders
                        </h1>
                        <p style={{ fontSize: 14, color: T.muted, margin: "6px 0 0" }}>
                            Track and fulfill medicine & pharmacy orders
                        </p>
                    </div>

                    <div style={card}>
                        <div style={{ padding: "18px 24px", borderBottom: `1px solid ${T.border}`, background: T.cream, display: "flex", alignItems: "center", gap: 8 }}>
                            <Package size={17} color={T.green} />
                            <span style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 17, color: T.ink }}>Order List</span>
                        </div>

                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ background: T.cream }}>
                                        {["Customer", "Email", "Product", "Qty", "Price", "Total", "Status", "Payment", "Date"].map((h) => (
                                            <th key={h} style={{ padding: "13px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: .6, whiteSpace: "nowrap" }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={9} style={{ textAlign: "center", padding: "56px 0", color: T.muted }}>
                                                Loading orders…
                                            </td>
                                        </tr>
                                    ) : orders.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} style={{ textAlign: "center", padding: "56px 0", color: T.muted }}>
                                                <ShoppingBag size={44} style={{ opacity: .3, display: "block", margin: "0 auto 12px" }} />
                                                No orders found.
                                            </td>
                                        </tr>
                                    ) : orders.map((o) => (
                                        <tr key={o.orderId} style={{ borderTop: `1px solid ${T.border}`, transition: "background .12s" }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = T.cream}
                                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                        >
                                            <td style={{ padding: "15px 20px", fontWeight: 700, color: T.ink }}>{o.customerName}</td>
                                            <td style={{ padding: "15px 20px", fontSize: 13, color: T.muted }}>{o.customerEmail}</td>
                                            <td style={{ padding: "15px 20px", fontSize: 13, color: T.ink }}>{o.productName}</td>
                                            <td style={{ padding: "15px 20px", fontSize: 13, color: T.ink }}>{o.quantity}</td>
                                            <td style={{ padding: "15px 20px", fontSize: 13, color: T.ink }}>₹{o.unitPrice}</td>
                                            <td style={{ padding: "15px 20px", fontSize: 13, fontWeight: 700, color: T.ink }}>₹{o.total}</td>
                                            <td style={{ padding: "15px 20px" }}>
                                                <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
                                                    <StatusBadge status={o.status} />

                                                    {o.status === "Pending" && (
                                                        <ActionBtn
                                                            label="Accept"
                                                            icon={<CheckCircle2 size={13} />}
                                                            bg="#DBEAFE" fg="#1E40AF"
                                                            onClick={() => updateStatus(o.orderId, "Confirmed")}
                                                        />
                                                    )}
                                                    {o.status === "Confirmed" && (
                                                        <ActionBtn
                                                            label="Pack"
                                                            icon={<PackageCheck size={13} />}
                                                            bg="#EDE9FE" fg="#6D28D9"
                                                            onClick={() => updateStatus(o.orderId, "Packed")}
                                                        />
                                                    )}
                                                    {o.status === "Packed" && (
                                                        <ActionBtn
                                                            label="Dispatch"
                                                            icon={<Truck size={13} />}
                                                            bg="#FFEDD5" fg="#9A3412"
                                                            onClick={() => updateStatus(o.orderId, "Out for Delivery")}
                                                        />
                                                    )}
                                                    {o.status === "Out for Delivery" && (
                                                        <ActionBtn
                                                            label="Deliver"
                                                            icon={<PartyPopper size={13} />}
                                                            bg={T.greenLight} fg={T.greenMid}
                                                            onClick={() => updateStatus(o.orderId, "Delivered")}
                                                        />
                                                    )}
                                                    {o.status === "Delivered" && o.paymentStatus !== "Paid" && (
                                                        <ActionBtn
                                                            label="Payment Received"
                                                            icon={<Wallet size={13} />}
                                                            bg={T.greenLight} fg={T.greenMid}
                                                            onClick={() => markPayment(o.orderId)}
                                                        />
                                                    )}
                                                    {o.status === "Delivered" && o.paymentStatus === "Paid" && (
                                                        <span style={{ color: T.greenMid, fontWeight: 700, fontSize: 12 }}>
                                                            ✔ Completed
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ padding: "15px 20px" }}>
                                                {o.paymentStatus === "Paid" ? (
                                                    <span style={{
                                                        display: "inline-flex", alignItems: "center", gap: 5,
                                                        background: T.greenLight, color: T.greenMid,
                                                        padding: "4px 12px", borderRadius: 99, fontSize: 11, fontWeight: 700,
                                                    }}>
                                                        <CheckCircle2 size={12} /> Paid
                                                    </span>
                                                ) : (
                                                    <span style={{
                                                        display: "inline-flex", alignItems: "center", gap: 5,
                                                        background: T.dangerLight, color: T.danger,
                                                        padding: "4px 12px", borderRadius: 99, fontSize: 11, fontWeight: 700,
                                                    }}>
                                                        <Ban size={12} /> Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ padding: "15px 20px", fontSize: 13, color: T.ink, whiteSpace: "nowrap" }}>
                                                {new Date(o.orderDate).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ padding: "14px 24px", borderTop: `1px solid ${T.border}`, background: T.cream }}>
                            <span style={{ fontSize: 12, color: T.muted }}>
                                Showing <b style={{ color: T.ink }}>{orders.length}</b> order{orders.length !== 1 ? "s" : ""}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}