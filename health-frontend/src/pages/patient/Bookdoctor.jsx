import { useNavigate } from "react-router-dom";

export default function BookDoctor() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <h2 className="text-2xl font-bold mb-6">🧑‍⚕️ Book Doctor</h2>

      {/* SAMPLE DOCTOR CARD */}
      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="text-xl font-bold">Dr. Ahmed</h3>
          <p>Cardiology</p>
          <p>Fee: 1000 BDT</p>

          <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
            Book Appointment
          </button>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="text-xl font-bold">Dr. Rahman</h3>
          <p>Neurology</p>
          <p>Fee: 1200 BDT</p>

          <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
            Book Appointment
          </button>
        </div>

      </div>

    </div>
  );
}