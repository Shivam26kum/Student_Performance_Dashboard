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
      if (window.scrollY > 50) navbar.classList.add("shadow-lg", "py-3");
      else navbar.classList.remove("shadow-lg", "py-3");
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Navbar */}
      <header>
        <nav className="navbar fixed top-0 w-full flex items-center justify-between px-6 md:px-12 py-5 bg-gradient-to-r from-purple-700 to-blue-600 text-white transition-all z-[100]">
          <h2 className="text-xl md:text-2xl font-black tracking-tighter italic">Campus Connect</h2>
          <div className="flex gap-3">
            <button
              onClick={() => nav("/login")}
              className="px-5 py-2 bg-white text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 transition-all active:scale-95 shadow-md shadow-black/10"
            >
              Login
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 mt-16">
        <section className="hero flex flex-col md:flex-row items-center text-center md:text-left px-6 sm:px-10 lg:px-24 py-16 md:py-28 bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="md:w-1/2 mb-12 md:mb-0 space-y-6">
            <h1 className="text-4xl md:text-6xl font-black leading-tight text-gray-900">
              Track Student Performance <br className="hidden lg:block" /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                & Communicate Better
              </span>
            </h1>
            <p className="text-gray-600 text-lg md:text-xl font-medium max-w-lg mx-auto md:mx-0">
              Teachers manage performance. Parents view progress. <br className="hidden sm:block" /> 
              Everything you need in one secure platform.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
              <button
                onClick={() => nav("/login")}
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-200"
              >
                Get Started Now
              </button>
            </div>
          </div>
          
          <div className="md:w-1/2 flex justify-center relative">
            {/* Background Blur Decor */}
            <div className="absolute inset-0 bg-blue-400/20 blur-3xl rounded-full scale-75"></div>
            <img
              src="/images/logo.jpeg"
              alt="Dashboard Preview"
              className="relative z-10 w-full max-w-xs md:max-w-md aspect-square object-cover rounded-[3rem] shadow-2xl border-8 border-white transform hover:rotate-2 transition-transform duration-500"
            />
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 text-center px-6 sm:px-10 lg:px-24">
          <div className="max-w-4xl mx-auto mb-16">
             <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Why Choose Our Dashboard?</h2>
             <div className="h-1.5 w-20 bg-blue-600 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<FaChartLine size={40} />} 
              title="Track Performance" 
              desc="Monitor attendance, marks, and overall progress with intuitive visual reports."
              color="text-blue-600"
              bgColor="bg-blue-50"
            />
            <FeatureCard 
              icon={<FaUsers size={40} />} 
              title="Seamless Access" 
              desc="Instant communication and data access for both parents and faculty anytime."
              color="text-emerald-600"
              bgColor="bg-emerald-50"
            />
            <FeatureCard 
              icon={<FaComments size={40} />} 
              title="Real-time Updates" 
              desc="Never miss a beat with instant push notifications for notices and exam results."
              color="text-amber-500"
              bgColor="bg-amber-50"
            />
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-24 text-center bg-gray-900 text-white px-6 sm:px-10 lg:px-24 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full -ml-32 -mt-32 blur-3xl"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-black mb-8">Empowering Education</h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
              Our Student Performance Dashboard bridges the gap between the classroom and home. 
              We believe that transparency in academic data leads to better student outcomes 
              and stronger parent-teacher partnerships.
            </p>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-24 text-center px-6 sm:px-10 lg:px-24 bg-white">
          <h2 className="text-3xl md:text-4xl font-black mb-16 text-gray-900">Trusted by Parents</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard 
              text="This dashboard makes it easy to track my child's performance and communicate with teachers." 
              author="Parent A" 
            />
            <TestimonialCard 
              text="Teachers can easily update marks and attendance. I always stay informed without needing to call!" 
              author="Parent B" 
            />
            <TestimonialCard 
              text="A clean, responsive, and interactive dashboard. Best digital transition our school has made." 
              author="Parent C" 
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-16 px-6 md:px-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center md:text-left space-y-4">
            <h5 className="text-xl font-black text-indigo-600">Campus Connect</h5>
            <p className="text-gray-500 text-sm leading-relaxed">
              Leading the way in digital academic management and parent communication.
            </p>
          </div>
          
          <div className="flex flex-col items-center space-y-4">
            <h5 className="font-black text-gray-900 uppercase text-xs tracking-widest">Quick Links</h5>
            <div className="flex flex-col items-center gap-2 text-sm font-bold text-gray-500">
              <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
              <a href="#about" className="hover:text-blue-600 transition-colors">About</a>
              <a href="#testimonials" className="hover:text-blue-600 transition-colors">Testimonials</a>
            </div>
          </div>
          
          <div className="text-center md:text-right space-y-4">
            <h5 className="font-black text-gray-900 uppercase text-xs tracking-widest">Get In Touch</h5>
            <div className="text-sm text-gray-500 font-medium">
              <p>Email: info@campusconnect.com</p>
              <p>Phone: +91 9928173068</p>
            </div>
            <div className="flex justify-center md:justify-end gap-4 mt-4">
              <a href="#!" className="p-3 bg-white rounded-full shadow-sm text-blue-600 hover:bg-blue-600 hover:text-white transition-all"><FaEnvelope /></a>
              <a href="#!" className="p-3 bg-white rounded-full shadow-sm text-blue-600 hover:bg-blue-600 hover:text-white transition-all"><FaUsers /></a>
            </div>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-gray-200 text-center">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Campus Connect Dashboard. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function FeatureCard({ icon, title, desc, color, bgColor }) {
  return (
    <div className="p-8 bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center">
      <div className={`p-5 ${bgColor} ${color} rounded-2xl mb-6 shrink-0`}>
        {icon}
      </div>
      <h4 className="text-xl font-bold text-gray-800 mb-3">{title}</h4>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function TestimonialCard({ text, author }) {
  return (
    <div className="p-8 bg-gray-50 rounded-[2rem] border border-transparent hover:border-blue-100 transition-all text-center">
      <p className="text-gray-600 italic leading-relaxed text-sm">"{text}"</p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-black text-xs">
          {author.charAt(author.length - 1)}
        </div>
        <h5 className="font-bold text-gray-800 text-xs uppercase tracking-widest">{author}</h5>
      </div>
    </div>
  );
}