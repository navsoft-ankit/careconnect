import { useState, useContext } from "react";
import { loginUser } from "../../services/authService";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);

    try {
      const data = await loginUser({ email, password });

      // save token in context/localStorage
      login(data);
      localStorage.setItem("token", data.token);

      // decode token properly
      const token = data.token;
      const payload = JSON.parse(atob(token.split(".")[1]));
      const role =
  payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
console.log("ROLE:", role);


      // ROLE BASED REDIRECT
      if (role === "Admin") navigate("/admin");
      else if (role === "Doctor") navigate("/doctor");
      else if (role === "AmbulanceDriver") navigate("/ambulance");  
      else navigate("/patient");   // 👈 PATIENT DEFAULT

    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-700 to-purple-700 text-white flex-col justify-center items-center p-10">
        <h1 className="text-4xl font-bold mb-4">CareConnect</h1>
        <p className="text-center text-lg opacity-80">
          Smart Hospital System<br />
          Doctor | Ambulance | Pharmacy
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex w-full md:w-1/2 justify-center items-center bg-gray-100">

        <div className="bg-white p-8 rounded-2xl shadow-xl w-96">

          <h2 className="text-2xl font-bold text-center mb-6">
            Welcome Back 👋
          </h2>

          <input
            className="w-full border p-3 mb-3 rounded-lg"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="w-full border p-3 mb-4 rounded-lg"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </div>
      </div>
    </div>
  );
}