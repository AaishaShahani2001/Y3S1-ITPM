import React, { useState } from "react";
import { FaGoogle, FaFacebookF, FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import authImg from "../assets/login.jpg";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const navigate = useNavigate();

  // =====================
  // SIGNUP
  // =====================
  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:3000/api/signup",
        {
          name,
          email: signupEmail,
          password: signupPassword,
        }
      );

      toast.success("Account created successfully!");

      // Switch to login form
      setIsSignUp(false);

      // Clear signup fields
      setName("");
      setSignupEmail("");
      setSignupPassword("");

    } catch (err) {
      toast.error(err.response?.data?.error || "Signup failed");
    }
  };

  // =====================
  // LOGIN
  // =====================
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:3000/api/login",
        {
          email: loginEmail,
          password: loginPassword,
        },
        {
          withCredentials: true,
        }
      );

      toast.success("Login successful!");

      // Store user
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...res.data.user,
          token: res.data.token,
        })
      );
      // Redirect to home page
      setTimeout(() => {
        navigate("/");
      }, 1000);

    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed");
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-100 bg-linear-to-br from-blue-50 to-blue-200 flex-col h-screen font-sans">
      <div className={`relative bg-white rounded-[30px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden w-212.5 max-w-full min-h-162.5 ${isSignUp ? "active" : ""}`} id="container">

        {/* Sign Up Form */}
        <div className={`absolute top-0 h-full transition-all duration-700 ease-in-out left-0 w-1/2 ${isSignUp ? "translate-x-full opacity-100 z-5" : "opacity-0 z-1"}`}>
          <form onSubmit={handleSignup} className="bg-white flex items-center justify-center flex-col px-12 h-full text-center">
            <h1 className="text-3xl font-bold mb-4 text-blue-900">Create Account</h1>
            <div className="flex space-x-4 mb-6">
              <a href="#" className="border border-gray-300 rounded-full w-10 h-10 flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 transition text-blue-900"><FaGoogle /></a>
              <a href="#" className="border border-gray-300 rounded-full w-10 h-10 flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 transition text-blue-900"><FaFacebookF /></a>
            </div>
            <span className="text-sm mb-4 text-gray-500">or use your email for registration</span>
            <div className="relative w-full mb-4">
              <FaUser className="absolute left-4 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-blue-50 py-3 px-4 pl-12 rounded-lg w-full outline-none"
                required
              />
            </div>
            <div className="relative w-full mb-4">
              <FaEnvelope className="absolute left-4 top-3.5 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                className="bg-blue-50 py-3 px-4 pl-12 rounded-lg w-full outline-none"
                required
              />
            </div>
            <div className="relative w-full mb-4">
              <FaLock className="absolute left-4 top-3.5 text-gray-400" />
              <input
                type="password"
                placeholder="Password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                className="bg-blue-50 py-3 px-4 pl-12 rounded-lg w-full outline-none"
                required
              />
            </div>
            <button className="bg-blue-600 text-white text-xs font-bold py-3 px-10 rounded-lg uppercase tracking-wider mt-4 cursor-pointer hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">Sign Up</button>
          </form>
        </div>

        {/* Sign In Form */}
        <div className={`absolute top-0 h-full transition-all duration-700 ease-in-out left-0 w-1/2 z-2 ${isSignUp ? "translate-x-full" : ""}`}>
          <form onSubmit={handleLogin} className="bg-white flex items-center justify-center flex-col px-12 h-full text-center">
            <h1 className="text-3xl font-bold mb-4 text-blue-900">Sign In</h1>
            <div className="flex space-x-4 mb-6">
              <a href="#" className="border border-gray-300 rounded-full w-10 h-10 flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 transition text-blue-900"><FaGoogle /></a>
              <a href="#" className="border border-gray-300 rounded-full w-10 h-10 flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 transition text-blue-900"><FaFacebookF /></a>
            </div>
            <span className="text-sm mb-4 text-gray-500">or use your email account</span>
            <div className="relative w-full mb-4">
              <FaEnvelope className="absolute left-4 top-3.5 text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="bg-blue-50 py-3 px-4 pl-12 rounded-lg w-full outline-none"
                required
              />
            </div>
            <div className="relative w-full mb-4">
              <FaLock className="absolute left-4 top-3.5 text-gray-400" />
              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="bg-blue-50 py-3 px-4 pl-12 rounded-lg w-full outline-none"
                required
              />
            </div>
            <a href="#" className="text-xs text-blue-600 mb-6 hover:underline font-medium">Forget Your Password?</a>
            <button className="bg-blue-600 text-white text-xs font-bold py-3 px-10 rounded-lg uppercase tracking-wider cursor-pointer hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">Sign In</button>
          </form>
        </div>

        {/* Toggle Container */}
        <div className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-all duration-700 ease-in-out z-100 rounded-l-[150px] ${isSignUp ? "-translate-x-full rounded-l-none rounded-r-[150px]" : ""}`}>
          <div
            className={`text-white relative -left-full h-full w-[200%] transform transition-all duration-700 ease-in-out ${isSignUp ? "translate-x-1/2" : "translate-x-0"}`}
            style={{ backgroundImage: `url(${authImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
            <div className="absolute inset-0 bg-blue-900/60 mix-blend-multiply"></div>

            {/* Left Panel (for Sign In) */}
            <div className={`absolute flex items-center justify-center flex-col px-12 text-center top-0 h-full w-1/2 transform transition-all duration-700 ease-in-out z-10 ${isSignUp ? "translate-x-0" : "-translate-x-[20%]"}`}>
              <h1 className="text-3xl font-bold mb-4">Welcome Back!</h1>
              <p className="text-sm leading-6 tracking-wide my-6 opacity-90">To keep connected with us please login with your personal info</p>
              <button
                className="bg-transparent border border-white text-white text-xs font-bold py-3 px-10 rounded-lg uppercase tracking-wider cursor-pointer hover:bg-white/10 transition"
                onClick={() => setIsSignUp(false)}
              >
                Sign In
              </button>
            </div>

            {/* Right Panel (for Sign Up) */}
            <div className={`absolute flex items-center justify-center flex-col px-12 text-center top-0 h-full w-1/2 right-0 transform transition-all duration-700 ease-in-out z-10 ${isSignUp ? "translate-x-[20%]" : "translate-x-0"}`}>
              <h1 className="text-3xl font-bold mb-4">Hello, Friend!</h1>
              <p className="text-sm leading-6 tracking-wide my-6 opacity-90">Enter your personal details and start your journey with us</p>
              <button
                className="bg-transparent border border-white text-white text-xs font-bold py-3 px-10 rounded-lg uppercase tracking-wider cursor-pointer hover:bg-white/10 transition"
                onClick={() => setIsSignUp(true)}
              >
                Sign Up
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
