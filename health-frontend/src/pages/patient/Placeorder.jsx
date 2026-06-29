import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import {
    FiMapPin,
    FiCheckCircle,
    FiArrowLeft,
    FiTruck,
    FiCreditCard,
    FiShield,
} from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";

const STEPS = ["Delivery address", "Payment", "Confirm"];

function loadRazorpayScript() {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

function StepHeader({ step, productName }) {
    return (
        <div className="mb-7">
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[#C9683F] uppercase tracking-wide">
                    {productName ? `Ordering ${productName}` : "Place order"}
                </span>
                <span className="text-xs text-[#A8A192] font-medium">
                    Step {step + 1} of {STEPS.length}
                </span>
            </div>
            <h1 className="text-[26px] font-serif font-semibold text-[#16332B] leading-tight">
                {STEPS[step]}
            </h1>
            <div className="flex gap-1.5 mt-4">
                {STEPS.map((s, i) => (
                    <div
                        key={s}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-[#16332B]" : "bg-[#E7E2D6]"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}

export default function PlaceOrder() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const productId = searchParams.get("productId");
    const quantity = parseInt(searchParams.get("quantity") || "1", 10);
    const productName = searchParams.get("productName") || "";
    const unitPrice = parseFloat(searchParams.get("price") || "0");

    const [step, setStep] = useState(0);
    const [address, setAddress] = useState("");
    const [paymentMode, setPaymentMode] = useState(null); // "COD" | "Online"
    const [paying, setPaying] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);

    const totalAmount = useMemo(
        () => Math.round(unitPrice * quantity * 100) / 100,
        [unitPrice, quantity]
    );

    useEffect(() => {
        if (!productId) {
            setError("No product selected.");
        }
    }, [productId]);

    function canContinueAddress() {
        return address.trim().length >= 8;
    }

    async function placeOrderCOD() {
        await submitOrder({ paymentMode: "COD" });
    }

    async function placeOrderOnline() {
        setPaying(true);
        try {
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                toast.error("Couldn't load payment gateway. Check your connection.");
                setPaying(false);
                return;
            }

            const orderRes = await api.post("/payment/create-order", {
                amount: totalAmount,
                currency: "INR",
            });

            const { orderId, amount, currency, razorpayKeyId } = orderRes.data;

            const options = {
                key: razorpayKeyId,
                order_id: orderId,
                amount,
                currency,
                name: "Lakeview Pharmacy",
                description: productName || "Medicine order",
                theme: { color: "#16332B" },
                handler: async (response) => {
                    const verifyRes = await api.post("/payment/verify", {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                    });

                    if (!verifyRes.data?.verified) {
                        toast.error("Payment verification failed.");
                        setPaying(false);
                        return;
                    }

                    await submitOrder({
                        paymentMode: "Online",
                        razorpayPaymentId: response.razorpay_payment_id,
                    });
                },
                modal: {
                    ondismiss: () => setPaying(false),
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            toast.error("Couldn't start payment. Please try again.");
            setPaying(false);
        }
    }

    async function submitOrder({ paymentMode, razorpayPaymentId }) {
        setSubmitting(true);
        setError("");
        try {
            const res = await api.post("/patient/order", {
                productId: parseInt(productId, 10),
                quantity,
                deliveryAddress: address.trim(),
                paymentMode,
                razorpayPaymentId,
            });

            setResult(res.data);
            setStep(2);
            toast.success("Order placed!");
        } catch (err) {
            setError(err?.response?.data || "Couldn't place the order. Please try again.");
            toast.error("Order failed.");
        } finally {
            setSubmitting(false);
            setPaying(false);
        }
    }

    return (
        <>
            <Toaster position="top-right" />

            <div className="min-h-screen bg-[#F8F6F0]">
                <div className="max-w-xl mx-auto px-4 py-10">

                    {step < 2 && (
                        <button
                            onClick={() => (step === 0 ? navigate(-1) : setStep((s) => s - 1))}
                            className="flex items-center gap-1.5 text-sm text-[#6B6458] hover:text-[#16332B] mb-6 transition"
                        >
                            <FiArrowLeft size={15} />
                            Back
                        </button>
                    )}

                    <div className="bg-white rounded-2xl border border-[#E7E2D6] p-6 sm:p-8">

                        {step < 2 && <StepHeader step={step} productName={productName} />}

                        {/* Order summary strip — shown on steps 0 & 1 */}
                        {step < 2 && productId && (
                            <div className="bg-[#F8F6F0] rounded-xl border border-[#E7E2D6] p-4 flex items-center justify-between mb-6">
                                <div>
                                    <p className="text-sm font-medium text-[#16332B]">
                                        {productName || `Product #${productId}`}
                                    </p>
                                    <p className="text-xs text-[#8B8478] mt-0.5">
                                        Qty {quantity} × ₹{unitPrice}
                                    </p>
                                </div>
                                <p className="text-lg font-semibold text-[#C9683F]">₹{totalAmount}</p>
                            </div>
                        )}

                        {error && step !== 2 && (
                            <div className="bg-[#FBEAE5] border border-[#E8B8AA] rounded-xl p-4 text-center mb-4">
                                <p className="text-[#9E3A20] text-sm">{error}</p>
                            </div>
                        )}

                        {/* Step 0: Address */}
                        {step === 0 && (
                            <div>
                                <label className="text-sm font-medium text-[#16332B] mb-2 flex items-center gap-1.5">
                                    <FiMapPin size={14} />
                                    Delivery address
                                </label>
                                <textarea
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="House/flat no., street, locality, city, PIN code"
                                    rows={4}
                                    className="w-full p-4 rounded-xl border border-[#E7E2D6] focus:outline-none focus:ring-2 focus:ring-[#16332B]/20 focus:border-[#16332B] text-sm placeholder:text-[#A8A192] resize-none transition"
                                />
                                <p className="text-xs text-[#A8A192] mt-2">
                                    We'll deliver to this address. Make sure the PIN code is correct.
                                </p>

                                <button
                                    onClick={() => setStep(1)}
                                    disabled={!canContinueAddress()}
                                    className="w-full mt-6 bg-[#16332B] hover:bg-[#0F241D] disabled:opacity-40 text-white py-3 rounded-xl font-medium transition"
                                >
                                    Continue to payment
                                </button>
                            </div>
                        )}

                        {/* Step 1: Payment mode */}
                        {step === 1 && (
                            <div>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => setPaymentMode("COD")}
                                        className={`w-full text-left rounded-xl border p-4 flex items-center gap-4 transition ${paymentMode === "COD"
                                                ? "border-[#16332B] bg-[#F8F6F0]"
                                                : "border-[#E7E2D6] hover:border-[#16332B]/30"
                                            }`}
                                    >
                                        <FiTruck className="text-[#16332B] shrink-0" size={20} />
                                        <div>
                                            <p className="text-sm font-semibold text-[#16332B]">
                                                Cash on delivery
                                            </p>
                                            <p className="text-xs text-[#8B8478] mt-0.5">
                                                Pay in cash when your order arrives
                                            </p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setPaymentMode("Online")}
                                        className={`w-full text-left rounded-xl border p-4 flex items-center gap-4 transition ${paymentMode === "Online"
                                                ? "border-[#16332B] bg-[#F8F6F0]"
                                                : "border-[#E7E2D6] hover:border-[#16332B]/30"
                                            }`}
                                    >
                                        <FiCreditCard className="text-[#16332B] shrink-0" size={20} />
                                        <div>
                                            <p className="text-sm font-semibold text-[#16332B]">
                                                Pay online
                                            </p>
                                            <p className="text-xs text-[#8B8478] mt-0.5">
                                                UPI, card, or net banking via Razorpay
                                            </p>
                                        </div>
                                    </button>
                                </div>

                                {paymentMode === "Online" && (
                                    <div className="flex items-center gap-2 mt-4 text-xs text-[#8B8478]">
                                        <FiShield size={14} className="text-[#16332B]" />
                                        Secured by Razorpay · your card details never touch our servers
                                    </div>
                                )}

                                <button
                                    onClick={paymentMode === "Online" ? placeOrderOnline : placeOrderCOD}
                                    disabled={!paymentMode || submitting || paying}
                                    className="w-full mt-6 bg-[#C9683F] hover:bg-[#B85A33] disabled:opacity-40 text-white py-3 rounded-xl font-medium transition"
                                >
                                    {paying
                                        ? "Opening payment…"
                                        : submitting
                                            ? "Placing order…"
                                            : paymentMode === "Online"
                                                ? `Pay ₹${totalAmount}`
                                                : "Place order"}
                                </button>
                            </div>
                        )}

                        {/* Step 2: Confirm / Success */}
                        {step === 2 && result && (
                            <div className="text-center py-4">
                                <div className="w-16 h-16 mx-auto rounded-full bg-[#E9F2EC] flex items-center justify-center">
                                    <FiCheckCircle className="text-[#2F6B47]" size={30} />
                                </div>
                                <h2 className="text-lg font-semibold text-[#16332B] mt-5">
                                    Order confirmed
                                </h2>
                                <p className="text-[#6B6458] text-sm mt-2">
                                    Order #{result.orderId}
                                </p>
                                <p className="text-[#8B8478] text-sm mt-1">
                                    ₹{result.totalAmount} · {result.paymentMode === "Online" ? "Paid online" : "Cash on delivery"}
                                </p>

                                <button
                                    onClick={() => navigate("/patient/orders")}
                                    className="w-full mt-7 bg-[#16332B] hover:bg-[#0F241D] text-white py-3 rounded-xl font-medium transition"
                                >
                                    View my orders
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}