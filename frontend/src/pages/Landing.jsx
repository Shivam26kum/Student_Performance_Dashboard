import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaChartLine, FaComments, FaEnvelope } from "react-icons/fa";

export default function Landing() {
  const nav = useNavigate();

  // Sticky navbar shadow on scroll
  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector(".navbar");
      if (!navbar) return;
      if (window.scrollY > 50) navbar.classList.add("shadow-lg");
      else navbar.classList.remove("shadow-lg");
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">

      {/* Navbar */}
      <header>
        <nav className="navbar fixed top-0 w-full flex items-center justify-between px-6 py-4 bg-linear-to-r from-purple-700 to-blue-600 text-white transition-all z-50">
          <h2 className="text-2xl font-bold">Student Dashboard</h2>
          <div className="flex gap-3">
            <button
              onClick={() => nav("/login")}
              className="px-4 py-2 bg-white text-blue-600 rounded hover:bg-blue-100 transition"
            >
              Login
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 mt-20">
        <section className="hero flex flex-col md:flex-row items-center text-center md:text-left px-6 md:px-16 py-20 bg-linear-to-r from-blue-50 to-white">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
              Track Student Performance & Communicate Better
            </h1>
            <p className="text-gray-600 mb-6">
              Teachers manage performance. Parents view progress — all in one platform.
            </p>
            <button
              onClick={() => nav("/login")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Get Started
            </button>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <img
              src="/images/logo.jpeg"
              alt="Dashboard Preview"
              className="w-150 h-150 md:w-half rounded-full shadow-xl "
            />
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 text-center px-6 md:px-16">
          <h2 className="text-3xl font-bold mb-12 text-gray-800">Why Choose Our Dashboard?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-white rounded-xl shadow-md transform transition hover:scale-105">
              <FaChartLine size={50} className="mx-auto text-blue-600 mb-4"/>
              <h4 className="text-xl font-semibold mb-2">Track Performance</h4>
              <p className="text-gray-600">Monitor attendance, marks, and overall progress easily.</p>
            </div>
            <div className="p-8 bg-white rounded-xl shadow-md transform transition hover:scale-105">
              <FaUsers size={50} className="mx-auto text-green-600 mb-4"/>
              <h4 className="text-xl font-semibold mb-2">Parent-Teacher Communication</h4>
              <p className="text-gray-600">Seamless communication between parents and teachers anytime.</p>
            </div>
            <div className="p-8 bg-white rounded-xl shadow-md transform transition hover:scale-105">
              <FaComments size={50} className="mx-auto text-yellow-500 mb-4"/>
              <h4 className="text-xl font-semibold mb-2">Real-time Updates</h4>
              <p className="text-gray-600">Instant updates about your child’s performance and notices.</p>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 text-center bg-gray-50 px-6 md:px-16">
          <h2 className="text-3xl font-bold mb-6">About Our Dashboard</h2>
          <p className="text-gray-700 max-w-3xl mx-auto">
            Our Student Performance Dashboard connects teachers and parents in one platform, making student monitoring simple, interactive, and effective.
          </p>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 text-center px-6 md:px-16">
          <h2 className="text-3xl font-bold mb-12">What Parents Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-white rounded-xl shadow-md transform transition hover:scale-105">
              <p>"This dashboard makes it easy to track my child's performance and communicate with teachers."</p>
              <h5 className="mt-4 font-semibold text-gray-800">– Parent A</h5>
            </div>
            <div className="p-8 bg-white rounded-xl shadow-md transform transition hover:scale-105">
              <p>"Teachers can easily update marks and attendance. Parents stay informed!"</p>
              <h5 className="mt-4 font-semibold text-gray-800">– Parent B</h5>
            </div>
            <div className="p-8 bg-white rounded-xl shadow-md transform transition hover:scale-105">
              <p>"A clean, responsive, and interactive dashboard for everyone."</p>
              <h5 className="mt-4 font-semibold text-gray-800">– Parent C</h5>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 px-6 md:px-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <div>
            <h5 className="font-bold mb-3 ">Student Dashboard</h5>
            <p>Connecting teachers and parents for better student performance tracking.</p>
          </div>
          <div className="flex flex-col items-center mb-3">
            <h5 className="font-bold mb-3 ">Quick Links</h5>
            <p><a href="#features" className="hover:underline">Features</a></p>
            <p><a href="#about" className="hover:underline">About</a></p>
            <p><a href="#testimonials" className="hover:underline">Testimonials</a></p>
          </div>
          <div>
            <h5 className="font-bold mb-3">Contact</h5>
            <p>Email: info@studentdashboard.com</p>
            <p>Phone: +91 9928173068</p>
            <div className="flex gap-4 mt-2 text-xl">
              <a href="#!" className="hover:text-blue-400"><FaEnvelope /></a>
              <a href="#!" className="hover:text-blue-400"><FaUsers /></a>
            </div>
          </div>
        </div>
        <hr className="border-gray-600 my-6" />
        <p className="text-center">&copy; {new Date().getFullYear()} Student Performance Dashboard. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
