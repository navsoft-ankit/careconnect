import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function PatientDashboard() {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [products, setProducts] = useState([]);
  const [ambulances, setAmbulances] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const d = await api.get("/patient/doctors");
      const p = await api.get("/patient/products");
      const a = await api.get("/patient/ambulances");

      setDoctors(d.data);
      setProducts(p.data);
      setAmbulances(a.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      <h1 className="text-2xl font-bold mb-4">
        Patient Dashboard
      </h1>

      {/* DOCTORS */}
      <h2 className="text-lg font-bold">Doctors</h2>
      <div className="grid md:grid-cols-3 gap-3 mb-6">
        {doctors.map((d) => (
          <div key={d.id} className="bg-white p-3 shadow rounded">
            <h3 className="font-bold">{d.name}</h3>
            <p>{d.specialization}</p>
            <p>₹{d.fee}</p>

            <button
              onClick={() => navigate("/patient/book-doctor")}
              className="bg-blue-500 text-white px-2 py-1 mt-2"
            >
              Book
            </button>
          </div>
        ))}
      </div>

      {/* PRODUCTS */}
      <h2 className="text-lg font-bold">Products</h2>
      <div className="grid md:grid-cols-3 gap-3 mb-6">
        {products.map((p) => (
          <div key={p.id} className="bg-white p-3 shadow rounded">
            <h3 className="font-bold">{p.name}</h3>
            <p>₹{p.price}</p>

            <button
              onClick={() => navigate("/patient/products")}
              className="bg-green-500 text-white px-2 py-1 mt-2"
            >
              Buy
            </button>
          </div>
        ))}
      </div>

      {/* AMBULANCE */}
      <h2 className="text-lg font-bold">Ambulance</h2>
      <div className="grid md:grid-cols-3 gap-3">
        {ambulances.map((a) => (
          <div key={a.id} className="bg-white p-3 shadow rounded">
            <h3 className="font-bold">{a.driverName}</h3>

            <button
              onClick={() => navigate("/patient/ambulance")}
              className="bg-red-500 text-white px-2 py-1 mt-2"
            >
              Request
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}