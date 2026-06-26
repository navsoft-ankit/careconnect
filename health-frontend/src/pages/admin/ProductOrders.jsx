import { useEffect, useState } from "react";
import api from "../../api/axios";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

export default function ProductOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await api.get("/admin/product-orders");
    setOrders(res.data);
  };

  return (
    <div className="flex">
      <Sidebar />

      <div className="ml-64 w-full min-h-screen bg-gray-100">
        <Navbar />

        <div className="p-6">

          <h2 className="text-3xl font-bold mb-6">
            Product Orders
          </h2>

          <div className="bg-white rounded shadow overflow-x-auto">

            <table className="w-full">

              <thead className="bg-blue-700 text-white">

                <tr>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Product</th>
                  <th className="p-3">Qty</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                </tr>

              </thead>

              <tbody>

                {orders.map(o => (

                  <tr key={o.orderId} className="border-b">

                    <td className="p-3">{o.customerName}</td>

                    <td className="p-3">{o.customerEmail}</td>

                    <td className="p-3">{o.productName}</td>

                    <td className="p-3">{o.quantity}</td>

                    <td className="p-3">₹{o.unitPrice}</td>

                    <td className="p-3">₹{o.total}</td>

                    <td className="p-3">{o.status}</td>

                    <td className="p-3">
                      {new Date(o.orderDate).toLocaleString()}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
}