import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash, FaUserShield, FaArrowLeft } from "react-icons/fa";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!form.role) {
      setError("Please select a login role.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/api/auth/login", form);
      login(res.data);

      if (res.data.role === "admin") nav("/admin");
      else if (res.data.role === "teacher") nav("/teacher");
      else nav("/parent");

    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Fixed: Responsive padding and a consistent gradient background
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 px-4 py-12 font-sans">
      
      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-6 sm:p-10 transition-all duration-300">

        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-6 shadow-sm border border-indigo-100">
            <FaUserShield size={28} />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-gray-800 tracking-tight">
            Welcome Back
          </h2>
          <p className="text-gray-500 mt-2 text-sm font-medium">
            Login to access your dashboard
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-rose-50 text-rose-600 p-4 rounded-xl mt-6 text-xs font-bold border border-rose-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
            <div className="w-1 h-1 bg-rose-600 rounded-full shrink-0" />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">

          {/* Role Selection */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Login As</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer appearance-none"
            >
              <option value="" disabled>Select your role</option>
              <option value="admin">Administrator</option>
              <option value="teacher">Faculty Member</option>
              <option value="parent">Parent / Guardian</option>
            </select>
          </div>

          {/* Email Input */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="abc@example.com"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 px-2 flex items-center text-gray-400 hover:text-indigo-600 transition-colors"
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Authenticating...
              </span>
            ) : "Secure Login"}
          </button>
        </form>
      </div>

      {/* Back to Home Link */}
      <Link 
        to="/" 
        className="mt-8 flex items-center gap-2 text-white/70 hover:text-white font-bold text-xs uppercase tracking-widest transition-all group"
      >
        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
        Back to Home Page
      </Link>

    </div>
  );
}