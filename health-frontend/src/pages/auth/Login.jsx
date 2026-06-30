import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { loginUser } from "../../services/authService";
import { AuthContext } from "../../context/AuthContext";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);

    try {
      const data = await loginUser({ email, password });

      // console.log("LOGIN RESPONSE:", data);

      login(data);

      localStorage.setItem("token", data.token);
      localStorage.setItem("name", data.name);
      localStorage.setItem("email", data.email);

      const payload = JSON.parse(atob(data.token.split(".")[1]));

      const role =
        payload[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ];

      if (role === "Admin") navigate("/admin");
      else if (role === "Doctor") navigate("/doctor");
      else if (role === "AmbulanceDriver") navigate("/ambulance");
      else navigate("/patient");
    }catch (err) {
  console.log(err);
  console.log(err.response);
  console.log(err.response?.data);

  alert(JSON.stringify(err.response?.data));
} finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0]">

      <div className="max-w-7xl mx-auto min-h-screen grid lg:grid-cols-2">

        {/* LEFT */}

        <div className="hidden lg:flex flex-col justify-center px-20 relative overflow-hidden">

          <div className="absolute w-80 h-80 bg-green-100 rounded-full -top-24 -left-24 blur-3xl opacity-70"></div>

          <div className="absolute w-96 h-96 bg-emerald-100 rounded-full bottom-0 right-0 blur-3xl opacity-60"></div>

          <div className="relative">

            <span className="text-[#2E5E4E] tracking-[6px] uppercase text-sm font-semibold">
              CareConnect
            </span>

            <h1
              className="mt-6 text-6xl font-semibold text-[#1B4332] leading-tight"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              Welcome
              <br />
              Back
            </h1>

            <p className="mt-8 text-lg leading-8 text-[#4F6F64] max-w-md">
              Sign in to access appointments,
              pharmacy services, ambulance booking
              and your healthcare dashboard.
            </p>

            <div className="mt-14 rounded-[30px] border border-green-200 bg-white/60 backdrop-blur-xl p-8 shadow-xl">

              <h3
                className="text-3xl text-[#1B4332]"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                Secure Healthcare
              </h3>

              <p className="mt-5 text-[#5D756C] leading-7">
                Fast, secure and simple authentication
                designed for doctors, patients and
                healthcare professionals.
              </p>

            </div>

          </div>

        </div>

        {/* RIGHT */}

        <div className="flex items-center justify-center px-8 py-12">

          <div className="w-full max-w-md rounded-[35px] bg-white/70 backdrop-blur-xl border border-white shadow-2xl p-10">

            <h2
              className="text-4xl text-[#1B4332]"
              style={{ fontFamily: "Playfair Display, serif" }}
            >
              Sign In
            </h2>

            <p className="mt-2 text-[#5D756C]">
              Welcome back to CareConnect
            </p>
            {/* Email */}

            <div className="mt-10">

              <label className="mb-2 block text-sm font-medium text-[#1B4332]">
                Email Address
              </label>

              <div className="relative">

                <Mail
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4F6F64]"
                />

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-green-200 bg-white pl-12 pr-4 text-[#1B4332] outline-none transition-all duration-300 focus:border-[#2D6A4F] focus:ring-4 focus:ring-green-100"
                />

              </div>

            </div>

            {/* Password */}

            <div className="mt-6">

              <label className="mb-2 block text-sm font-medium text-[#1B4332]">
                Password
              </label>

              <div className="relative">

                <Lock
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4F6F64]"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-green-200 bg-white pl-12 pr-14 text-[#1B4332] outline-none transition-all duration-300 focus:border-[#2D6A4F] focus:ring-4 focus:ring-green-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4F6F64] hover:text-[#1B4332]"
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>

              </div>

            </div>

            {/* Remember */}

            <div className="mt-6 flex items-center justify-between">

              <label className="flex items-center gap-2 text-sm text-[#4F6F64]">

                <input
                  type="checkbox"
                  className="accent-[#2D6A4F]"
                />

                Remember me

              </label>

              <button
                className="text-sm text-[#2D6A4F] hover:text-[#1B4332]"
              >
                Forgot password?
              </button>

            </div>

            {/* Login Button */}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="mt-8 h-14 w-full rounded-2xl bg-[#1B4332] text-white font-semibold transition-all duration-300 hover:bg-[#2D6A4F] hover:shadow-xl disabled:opacity-60"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <div className="my-8 flex items-center">

              <div className="h-px flex-1 bg-green-200"></div>

              <span className="px-4 text-sm text-[#4F6F64]">
                OR
              </span>

              <div className="h-px flex-1 bg-green-200"></div>

            </div>

            <p className="text-center text-[#4F6F64]">

              Don't have an account?

              <Link
                to="/register"
                className="ml-2 font-semibold text-[#1B4332] hover:text-[#2D6A4F]"
              >
                Create Account
              </Link>

            </p>
          </div>
        </div>
      </div>

      {/* Decorative Leaves */}

      <div className="hidden lg:block">

        {/* Top Right Leaf */}
        <div className="absolute top-16 right-20 rotate-12 opacity-20">
          <svg
            width="180"
            height="180"
            viewBox="0 0 200 200"
            fill="none"
          >
            <path
              d="M30 170C130 160 180 90 170 20C90 30 30 90 30 170Z"
              fill="#2D6A4F"
            />
          </svg>
        </div>

        {/* Bottom Left Leaf */}
        <div className="absolute bottom-10 left-16 -rotate-12 opacity-15">
          <svg
            width="220"
            height="220"
            viewBox="0 0 200 200"
            fill="none"
          >
            <path
              d="M30 170C130 160 180 90 170 20C90 30 30 90 30 170Z"
              fill="#40916C"
            />
          </svg>
        </div>

        {/* Small Circle */}
        <div className="absolute top-44 right-44 h-4 w-4 rounded-full bg-[#2D6A4F]"></div>

        <div className="absolute bottom-32 left-40 h-3 w-3 rounded-full bg-[#95D5B2]"></div>

      </div>

    </div>
  );
}