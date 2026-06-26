import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function AmbulanceDashboard() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    api.get("/ambulance/requests").then(res => setRequests(res.data));
  }, []);

  return (
    <div>
      <h2>Ambulance Requests</h2>

      {requests.map(r => (
        <div key={r.id} className="card">
          <p>Location: {r.pickupLocation}</p>
          <p>Status: {r.status}</p>

          <button className="btn btn-success">Accept</button>
          <button className="btn btn-danger">Reject</button>
        </div>
      ))}
    </div>
  );
}