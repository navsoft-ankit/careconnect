import { useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate(); // 🔥 add this

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const register = async () => {
    try {
      await api.post("/auth/register", form);

      alert("Registered successfully as Patient");

      // 🔥 redirect to login OR dashboard
      navigate("/login"); 
      // OR direct dashboard:
      // navigate("/patient");

    } catch (err) {
      alert(err.response?.data || "Registration failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Patient Register</h2>

        <input name="fullName" onChange={handleChange} placeholder="Full Name" className="input" />
        <input name="email" onChange={handleChange} placeholder="Email" className="input" />
        <input name="password" type="password" onChange={handleChange} placeholder="Password" className="input" />

        <button className="btn btn-primary w-full" onClick={register}>
          Register
        </button>
      </div>
    </div>
  );
}