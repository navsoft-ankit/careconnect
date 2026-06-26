import api from "../api/client";

let scriptLoaded = false;

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (scriptLoaded || window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      scriptLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error("Razorpay SDK failed to load"));
    document.body.appendChild(script);
  });
}

export async function payHalfAdvance({ amount, description, onSuccess, onFailure }) {
  await loadRazorpayScript();

  const { data: order } = await api.post("/payment/create-order", {
    amount,
    currency: "INR",
    description,
  });

  return new Promise((resolve, reject) => {
    const options = {
      key: order.razorpayKeyId,
      amount: order.amount,
      currency: order.currency,
      name: "Lakeview Hospital",
      description,
      order_id: order.orderId,
      theme: { color: "#0f6fde" },
      handler: async function (response) {
        try {
          await api.post("/payment/verify", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          await onSuccess(response);
          resolve(response);
        } catch (err) {
          onFailure?.(err);
          reject(err);
        }
      },
      modal: {
        ondismiss: function () {
          onFailure?.(new Error("Payment cancelled"));
          reject(new Error("Payment cancelled"));
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", function (resp) {
      onFailure?.(resp);
      reject(resp);
    });
    rzp.open();
  });
}