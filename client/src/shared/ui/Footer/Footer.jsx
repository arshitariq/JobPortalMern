// src/shared/ui/Footer/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Mail, 
  Phone, 
  MapPin,
  Heart,
  Users,
  Building,
  FileText,
  HelpCircle
} from 'lucide-react';

const Footer = () => {
  const footerLinks = {
    "Job Seekers": [
      { label: "Browse Jobs", path: "/jobs", icon: <Briefcase className="h-4 w-4" /> },
      { label: "Company Reviews", path: "/find-employers", icon: <Building className="h-4 w-4" /> },
      { label: "Career Advice", path: "/career-advice", icon: <FileText className="h-4 w-4" /> },
      { label: "Resume Builder", path: "/resume-builder", icon: <FileText className="h-4 w-4" /> }
    ],
    "Employers": [
      { label: "Post a Job", path: "/employer/post-job", icon: <Briefcase className="h-4 w-4" /> },
      { label: "Find Candidates", path: "/find-candidates", icon: <Users className="h-4 w-4" /> },
      { label: "Employer Branding", path: "/employer/branding", icon: <Building className="h-4 w-4" /> },
      { label: "Pricing", path: "/pricing", icon: <FileText className="h-4 w-4" /> }
    ],
    "Company": [
      { label: "About Us", path: "/about", icon: <Building className="h-4 w-4" /> },
      { label: "Careers", path: "/careers", icon: <Users className="h-4 w-4" /> },
      { label: "Blog", path: "/blog", icon: <FileText className="h-4 w-4" /> },
      { label: "Press", path: "/press", icon: <FileText className="h-4 w-4" /> }
    ],
    "Support": [
      { label: "Help Center", path: "/help", icon: <HelpCircle className="h-4 w-4" /> },
      { label: "Contact Support", path: "/customer-support", icon: <Mail className="h-4 w-4" /> },
      { label: "Community", path: "/community", icon: <Users className="h-4 w-4" /> },
      { label: "Safety Center", path: "/safety", icon: <HelpCircle className="h-4 w-4" /> }
    ]
  };

  const socialLinks = [
    { icon: <Facebook className="h-5 w-5" />, label: "Facebook", url: "#" },
    { icon: <Twitter className="h-5 w-5" />, label: "Twitter", url: "#" },
    { icon: <Linkedin className="h-5 w-5" />, label: "LinkedIn", url: "#" },
    { icon: <Instagram className="h-5 w-5" />, label: "Instagram", url: "#" }
  ];

  return (
    <footer className="bg-gradient-to-br from-[#c1fbd9] via-[#5eb883] to-[#799a87] text-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#5eb883] rounded-lg">
                <Briefcase className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">SkillLink</h2>
                <p className="text-[#3e6b54] text-sm">Connecting Talent</p>
              </div>
            </div>
            <p className="text-[#3e6b54] text-sm">
              Your premier destination for finding dream jobs and top talent worldwide.
            </p>
            
            {/* Social Links */}
            <div className="flex flex-col gap-3 mt-4">
              <p className="text-[#3e6b54] text-sm font-medium">Follow Us</p>
              <div className="flex gap-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    className="h-8 w-8 rounded-full bg-[#5eb883] flex items-center justify-center hover:bg-[#3e6b54] hover:text-white transition-all duration-300"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-[#3e6b54] font-semibold mb-3">{category}</h3>
              <ul className="space-y-2">
                {links.map((link, index) => (
                  <li key={index}>
                    <Link
                      to={link.path}
                      className="text-[#2f4f3c] hover:text-[#1f3728] hover:translate-x-1 transition-all duration-300 flex items-center gap-2 group text-sm"
                    >
                      <span className="group-hover:text-[#1f3728] opacity-70">{link.icon}</span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div className="mt-12 pt-8 border-t border-[#5eb883]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-[#5eb883] flex items-center justify-center">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-[#3e6b54] text-sm">Email us</p>
                <p className="font-medium">support@skilllink.com</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-[#5eb883] flex items-center justify-center">
                <Phone className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-[#3e6b54] text-sm">Call us</p>
                <p className="font-medium">+1 (800) 123-4567</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-[#5eb883] flex items-center justify-center">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-[#3e6b54] text-sm">Our Location</p>
                <p className="font-medium">San Francisco, CA</p>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-8">
          <div className="bg-[#5eb883]/20 rounded-xl p-6 border border-[#5eb883]">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-[#2f4f3c]">Stay Updated</h3>
                <p className="text-[#3e6b54] text-sm">Subscribe to our newsletter for latest job updates</p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 md:w-64 px-4 py-3 rounded-lg bg-[#799a87] border border-[#5eb883] text-white placeholder-[#c1fbd9] focus:outline-none focus:ring-2 focus:ring-[#3e6b54] focus:border-transparent text-sm"
                />
                <button className="px-6 py-3 bg-[#3e6b54] text-white font-bold rounded-lg hover:bg-[#2f4f3c] transition-all duration-300 whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#5eb883] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[#2f4f3c]">
            <div className="text-sm">
              <span className="font-bold text-[#1f3728]">50,000+</span> Jobs •{' '}
              <span className="font-bold text-[#1f3728]">10,000+</span> Companies
            </div>
            
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="hover:text-[#1f3728] text-sm transition-colors">Privacy Policy</Link>
              <span>•</span>
              <Link to="/terms" className="hover:text-[#1f3728] text-sm transition-colors">Terms</Link>
              <span>•</span>
              <Link to="/cookies" className="hover:text-[#1f3728] text-sm transition-colors">Cookies</Link>
            </div>
            
            <div className="flex items-center gap-2">
              <p className="text-sm flex items-center gap-1">
                <Heart className="h-4 w-4 text-red-500 fill-current" />
                Made with love
              </p>
              <span>•</span>
              <p className="text-sm">© {new Date().getFullYear()} SkillLink</p>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 h-12 w-12 rounded-full bg-[#3e6b54] text-white shadow-lg hover:bg-[#2f4f3c] hover:scale-110 transition-all duration-300 flex items-center justify-center z-40"
        aria-label="Back to top"
      >
        <svg 
          className="h-6 w-6" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </footer>
  );
};

export default Footer;
