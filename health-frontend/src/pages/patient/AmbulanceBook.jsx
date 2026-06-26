import { useState } from "react";
import api from "../../api/axios";

export default function AmbulanceBook() {
  const [location, setLocation] = useState("");

  const book = async () => {
    await api.post("/ambulance/request", {
      pickupLocation: location,
    });

    alert("Ambulance requested");
  };

  return (
    <div>
      <h2>Book Ambulance</h2>

      <input
        className="input"
        placeholder="Pickup location"
        onChange={(e) => setLocation(e.target.value)}
      />

      <button className="btn btn-danger" onClick={book}>
        Request Ambulance
      </button>
    </div>
  );
}