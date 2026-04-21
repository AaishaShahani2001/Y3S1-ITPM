import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import logo from "../assets/Logo.png";

export default function Footer() {
  const socialLinks = [
    {
      name: "Facebook",
      Icon: FaFacebookF,
      href: "#",
      hoverClass: "hover:bg-[#1877F2] hover:text-white",
    },
    {
      name: "Twitter",
      Icon: FaTwitter,
      href: "#",
      hoverClass: "hover:bg-[#1DA1F2] hover:text-white",
    },
    {
      name: "Instagram",
      Icon: FaInstagram,
      href: "#",
      hoverClass: "hover:bg-gradient-to-br hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] hover:text-white",
    },
    {
      name: "LinkedIn",
      Icon: FaLinkedinIn,
      href: "#",
      hoverClass: "hover:bg-[#0A66C2] hover:text-white",
    },
  ];

  return (
    <footer className="bg-transparent pt-32 relative overflow-hidden">

      {/* Decorative Background for Footer Bottom */}
      <div className="absolute bottom-0 w-full h-1/2 bg-white/20 -z-10" />

      {/* MAIN FOOTER CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-slate-600 mt-10">

        {/* BRAND / CONTACT */}
        <div>
          <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
            <img src={logo} alt="MindBridge logo" className="w-12 h-12 rounded-xl object-cover shadow-lg shadow-blue-200/60" />
            <span className="text-blue-600">MindBridge</span>
          </h3>
          <p className="text-sm leading-relaxed mb-6">
            Empowering university students with professional wellbeing support,
            counselling, and guidance for a balanced academic life.
          </p>
          <div className="space-y-3 text-sm font-medium">
            <p className="flex items-center gap-2">📍 <span className="text-slate-800">Colombo, Sri Lanka</span></p>
            <p className="flex items-center gap-2">📧 <span className="text-slate-800">support@mindbridge.lk</span></p>
            <p className="flex items-center gap-2">📞 <span className="text-slate-800">+94 77 123 4567</span></p>
          </div>
        </div>

        {/* HELP CENTER */}
        <div>
          <h4 className="text-slate-900 font-bold mb-6 text-lg">Help Center</h4>
          <ul className="space-y-3 text-sm">
            {["FAQs", "Terms & Conditions", "Privacy Policy", "Support"].map((item) => (
              <li key={item} className="hover:text-blue-600 hover:translate-x-1 transition-all duration-200 cursor-pointer w-fit">
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* QUICK LINKS */}
        <div>
          <h4 className="text-slate-900 font-bold mb-6 text-lg">Quick Links</h4>
          <ul className="space-y-3 text-sm">
            {["About Us", "Counsellors", "Appointments", "Contact"].map((item) => (
              <li key={item} className="hover:text-blue-600 hover:translate-x-1 transition-all duration-200 cursor-pointer w-fit">
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* NEWSLETTER & SOCIALS */}
        <div>
          <h4 className="text-slate-900 font-bold mb-6 text-lg">Newsletter</h4>
          <p className="text-sm mb-4 leading-relaxed">
            Subscribe to our newsletter to receive wellbeing tips and university updates.
          </p>
          <div className="flex mb-8">
            <input
              type="email"
              placeholder="Your email address"
              className="px-4 py-3 w-full rounded-l-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
            />
            <button className="bg-blue-600 text-white px-5 rounded-r-xl hover:bg-blue-700 transition font-medium">
              Submit
            </button>
          </div>

          <div className="flex gap-4">
            {socialLinks.map(({ name, Icon, href, hoverClass }) => (
              <a
                key={name}
                href={href}
                aria-label={name}
                className={`w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center transition-all duration-300 ${hoverClass}`}
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="bg-white/40 backdrop-blur-md border-t border-slate-100 py-6 text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} MindBridge. All rights reserved.</p>
      </div>
    </footer>
  );
}
