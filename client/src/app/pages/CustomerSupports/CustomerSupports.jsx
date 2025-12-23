import React, { useState, useRef, useEffect } from 'react';
import { 
  HelpCircle, 
  MessageSquare, 
  Phone, 
  Mail, 
  Clock, 
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  User,
  Send,
  Globe,
  BookOpen,
  Video
} from 'lucide-react';

const SupportCard = ({ children, className }) => (
  <div className={`bg-white rounded-xl shadow-md border border-gray-200 p-6 ${className}`}>
    {children}
  </div>
);

const CustomerSupports = () => {
  const [activeFaq, setActiveFaq] = useState(null);
  const [message, setMessage] = useState('');
  const chatEndRef = useRef(null);

  // FAQ data
  const faqs = [
    { id: 1, question: 'How do I apply for a job?', answer: 'Click on any job listing, then click the "Apply Now" button. You can upload your resume, fill in your details, and submit your application in just a few minutes.' },
    { id: 2, question: 'How can companies post job vacancies?', answer: 'Companies need to register for an employer account, verify their business, and then use the "Post a Job" button in their dashboard to create job listings.' },
    { id: 3, question: 'Is the chat feature secure?', answer: 'Yes, all chats are encrypted end-to-end. We never share your contact information until you choose to do so during the application process.' },
    { id: 4, question: 'How do I delete my account?', answer: 'Go to Account Settings > Privacy > Delete Account. Note: This action is permanent and cannot be undone.' },
    { id: 5, question: 'What payment methods do you accept?', answer: 'We accept all major credit cards, PayPal, and bank transfers for premium services. All transactions are secured with SSL encryption.' }
  ];

  // Support categories
  const supportCategories = [
    { icon: <HelpCircle className="h-8 w-8" />, title: 'Help Center', description: 'Browse articles and tutorials', color: 'bg-blue-100 text-blue-600' },
    { icon: <MessageSquare className="h-8 w-8" />, title: 'Live Chat', description: 'Chat with support agents', color: 'bg-green-100 text-green-600' },
    { icon: <Phone className="h-8 w-8" />, title: 'Phone Support', description: 'Call our support team', color: 'bg-purple-100 text-purple-600' },
    { icon: <Mail className="h-8 w-8" />, title: 'Email Support', description: 'Send us an email', color: 'bg-orange-100 text-orange-600' }
  ];

  // Contact information
  const contactInfo = [
    { icon: <Phone />, title: 'Phone Number', value: '+1 (800) 123-4567', available: '24/7' },
    { icon: <Mail />, title: 'Email Address', value: 'support@jobportal.com', available: 'Response within 2 hours' },
    { icon: <Clock />, title: 'Business Hours', value: 'Monday - Friday: 9 AM - 6 PM EST', available: 'Live chat available' },
    { icon: <Globe />, title: 'Global Support', value: 'Available in 12 languages', available: 'Multilingual agents' }
  ];

  // Quick links
  const quickLinks = [
    { title: 'Privacy Policy', url: '#' },
    { title: 'Terms of Service', url: '#' },
    { title: 'Cookie Policy', url: '#' },
    { title: 'Community Guidelines', url: '#' },
    { title: 'Safety Center', url: '#' },
    { title: 'Report an Issue', url: '#' }
  ];

  // Support tickets
  const supportTickets = [
    { id: 'TKT-001', subject: 'Account Verification Issue', status: 'Resolved', date: '2024-01-15' },
    { id: 'TKT-002', subject: 'Payment Failed', status: 'In Progress', date: '2024-01-18' },
    { id: 'TKT-003', subject: 'Job Posting Error', status: 'Open', date: '2024-01-20' }
  ];

  const toggleFaq = (id) => setActiveFaq(activeFaq === id ? null : id);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    alert('Message sent! Our team will get back to you within 2 hours.');
    setMessage('');
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [message]);

  return (
    <div className="min-h-screen bg-[#c1fbd9]">
      {/* Hero */}
      <div className="bg-[#c1fbd9] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-green-800">Customer Support</h1>
          <p className="text-xl text-green-400 max-w-3xl mx-auto">
            We're here to help you 24/7. Find answers, get support, or contact our team.
          </p>
        </div>
      </div>

      {/* Support Categories */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {supportCategories.map((cat, i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition transform hover:-translate-y-1 cursor-pointer">
              <div className={`${cat.color} w-14 h-14 rounded-lg flex items-center justify-center mb-4`}>
                {cat.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{cat.title}</h3>
              <p className="text-gray-600">{cat.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8">
        {/* Left Column: FAQ + Chat */}
        <div className="lg:col-span-2 space-y-8">
          {/* FAQ */}
          <SupportCard>
            <div className="flex items-center gap-3 mb-6">
              <HelpCircle className="h-8 w-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-4">
              {faqs.map(faq => (
                <div key={faq.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={activeFaq === faq.id}
                    aria-controls={`faq-${faq.id}`}
                    className="w-full px-6 py-4 text-left flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <span className="font-semibold text-gray-900">{faq.question}</span>
                    {activeFaq === faq.id ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                  </button>
                  <div id={`faq-${faq.id}`} hidden={activeFaq !== faq.id} className="px-6 py-4 bg-white">
                    <p className="text-gray-700">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900">Need more help?</h3>
                <p className="text-blue-800 mt-1">
                  Browse our complete documentation or contact our support team for personalized assistance.
                </p>
              </div>
            </div>
          </SupportCard>

          {/* Live Chat */}
          <SupportCard>
            <div className="flex items-center gap-3 mb-6">
              <MessageCircle className="h-8 w-8 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Live Chat Support</h2>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 min-h-[300px] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Support Agent</p>
                    <p className="text-sm text-gray-500">Online • Typically replies in 2 minutes</p>
                  </div>
                </div>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-start">
                    <div className="bg-blue-100 rounded-lg p-4 max-w-[80%]">
                      <p className="text-gray-800">Hello! How can I help you today?</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-green-100 rounded-lg p-4 max-w-[80%]">
                      <p className="text-gray-800">I need help with my job application</p>
                    </div>
                  </div>
                  <div ref={chatEndRef}></div>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="flex gap-3">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
                >
                  <Send className="h-5 w-5" /> Send
                </button>
              </form>
            </div>
          </SupportCard>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Contact Info */}
          <SupportCard>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
            <div className="space-y-6">
              {contactInfo.map((info, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg text-blue-600">{info.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{info.title}</h3>
                    <p className="text-gray-700 mt-1">{info.value}</p>
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" /> {info.available}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </SupportCard>

          {/* Quick Links */}
          <SupportCard>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Links</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-4 py-3 rounded-lg transition flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" /> {link.title}
                </a>
              ))}
            </div>
          </SupportCard>

          {/* Support Resources */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4">Support Resources</h2>
            <div className="space-y-4">
              <a href="#" className="flex items-center gap-3 p-3 bg-blue-800 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition">
                <BookOpen className="h-5 w-5" /> Help Documentation
              </a>
              <a href="#" className="flex items-center gap-3 p-3 bg-blue-800 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition">
                <Video className="h-5 w-5" /> Video Tutorials
              </a>
              <a href="#" className="flex items-center gap-3 p-3 bg-blue-800 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition">
                <FileText className="h-5 w-5" /> Community Forum
              </a>
            </div>
          </div>

          {/* Support Tickets */}
          <SupportCard>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Support Tickets</h2>
            <div className="space-y-4">
              {supportTickets.map(ticket => (
                <div key={ticket.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-900">{ticket.subject}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      ticket.status === 'Resolved' ? 'bg-green-100 text-green-800'
                      : ticket.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'}`}>
                      {ticket.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>ID: {ticket.id}</span>
                    <span>{ticket.date}</span>
                  </div>
                </div>
              ))}
              <button className="w-full text-center text-blue-600 hover:text-blue-800 font-semibold py-3 border border-gray-300 rounded-lg hover:bg-blue-50 transition">
                View All Tickets
              </button>
            </div>
          </SupportCard>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-green-900 to-emerald-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Still Can't Find What You're Looking For?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Our dedicated support team is ready to help you with any questions or issues.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-green-900 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg text-lg transition transform hover:scale-105">
              Contact Support Now
            </button>
            <button className="border-2 border-white hover:bg-green-800 font-bold py-3 px-8 rounded-lg text-lg transition">
              Schedule a Call
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSupports;
