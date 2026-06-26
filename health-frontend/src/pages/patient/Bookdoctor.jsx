import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function DoctorBooking() {
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // load doctors
  useEffect(() => {
    api.get("/patient/doctors")
      .then(res => setDoctors(res.data))
      .catch(err => console.log(err));
  }, []);

  // load slots
  const loadSlots = (doctorId) => {
    setSelectedDoctor(doctorId);

    api.get(`/patient/doctor/${doctorId}/slots`)
      .then(res => setSlots(res.data))
      .catch(err => console.log(err));
  };

  // book slot
  const bookSlot = (slotId) => {
    api.post("/patient/book", {
      doctorAvailabilityId: slotId,
      razorpayPaymentId: "demo_payment" // পরে real payment বসাবে
    })
    .then(res => {
      alert("Appointment Booked!");
      console.log(res.data);
    })
    .catch(err => console.log(err));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <h2 className="text-2xl font-bold mb-6">🧑‍⚕️ Book Doctor</h2>

      {/* DOCTORS */}
      <div className="grid md:grid-cols-3 gap-4">
        {doctors.map(doc => (
          <div key={doc.id} className="bg-white p-4 shadow rounded">
            <h3 className="font-bold">{doc.name}</h3>
            <p>{doc.specialization}</p>
            <p>Fee: {doc.fee}</p>

            <button
              onClick={() => loadSlots(doc.id)}
              className="mt-3 bg-blue-600 text-white px-3 py-1 rounded"
            >
              View Slots
            </button>
          </div>
        ))}
      </div>

      {/* SLOTS */}
      {selectedDoctor && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-3">Available Slots</h3>

          <div className="grid md:grid-cols-3 gap-4">
            {slots.map(slot => (
              <div key={slot.id} className="bg-white p-4 shadow rounded">

                <p>
                  {new Date(slot.availableFrom).toLocaleString()}
                </p>

                <button
                  onClick={() => bookSlot(slot.id)}
                  className="mt-3 bg-green-600 text-white px-3 py-1 rounded"
                >
                  Book Now
                </button>

              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}