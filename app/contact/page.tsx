"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Header from "../clients/components/Header";
import Footer from "../clients/components/Footer";
import SEO from "../clients/components/SEO";
import { Phone, Mail, MapPin, Send, Clock, MessageSquare } from "lucide-react";
import CooperateSection from "../clients/components/CooperateSection";
export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
    // Reset form
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const contactStructuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    mainEntity: {
      "@type": "Organization",
      name: "AusGlobal Connection",
      url: "https://globalconnection.vn",
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: "+61-415-616-789",
          contactType: "Customer Service",
          areaServed: "AU",
          availableLanguage: ["en", "vi"],
        },
        {
          "@type": "ContactPoint",
          email: "info@globalconnection.vn",
          contactType: "Customer Service",
          areaServed: "AU",
        },
      ],
      address: {
        "@type": "PostalAddress",
        addressCountry: "AU",
        addressLocality: "Australia",
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "09:00",
          closes: "18:00",
        },
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: "Saturday",
          opens: "09:00",
          closes: "14:00",
        },
      ],
    },
  };

  return (
    <main className="relative">
      <SEO
        title="Contact Us - Get in Touch with AusGlobal Connection"
        description="Contact AusGlobal Connection for wholesale inquiries, partnership opportunities, product information, and custom import solutions. We're here to help bring premium Vietnamese and Asian products to your business."
        canonical="https://globalconnection.vn/contact"
        ogImage="/banner.jpg"
        structuredData={contactStructuredData}
      />
      <Header />

      {/* Hero Section */}
      <section className="relative h-[40vh] sm:h-[50vh] md:h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/banner.jpg"
            alt="Contact Us"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/20 via-transparent to-yellow-900/15"></div>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <h4 className="text-green-400 text-xs sm:text-sm md:text-base font-semibold mb-2 sm:mb-3 tracking-wide uppercase">
              Get In Touch
            </h4>
            <h1 className="text-white font-semibold leading-tight text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-3 sm:mb-4">
              Contact Us
            </h1>
            <p className="text-white/90 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
              We'd love to hear from you. Reach out for partnerships, inquiries, or any questions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="relative py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="text-center p-5 sm:p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100 group"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#F8C32C] to-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-md">
                <Phone className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-[#164333] mb-2">
                Phone
              </h3>
              <a
                href="tel:+61415616789"
                className="text-gray-700 text-sm sm:text-base hover:text-green-700 transition-colors font-medium block"
              >
                +61 415 616 789
              </a>
              <p className="text-gray-500 text-xs mt-1.5">Available 24/7</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="text-center p-5 sm:p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100 group"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#F8C32C] to-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-md">
                <Mail className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-[#164333] mb-2">
                Email
              </h3>
              <a
                href="mailto:ngocluannguyen2013@gmail.vn"
                className="text-gray-700 text-xs sm:text-sm hover:text-green-700 transition-colors font-medium break-all block"
              >
                ngocluannguyen2013@gmail.vn
              </a>
              <p className="text-gray-500 text-xs mt-1.5">Quick response</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="text-center p-5 sm:p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100 group"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#F8C32C] to-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-md">
                <MapPin className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-[#164333] mb-2">
                Address
              </h3>
              <p className="text-gray-700 text-xs sm:text-sm font-medium leading-relaxed">
                77 Derrimut Dr,<br />
                Derrimut VIC 3026,<br />
                Australia
              </p>
              <p className="text-gray-500 text-xs mt-1.5">Visit us anytime</p>
            </motion.div>
          </div>
        </div>
      </section>

      <CooperateSection />

      {/* Map Section */}
      <section className="relative py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#164333] mb-3">
              Find Us
            </h2>
            <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
              Visit our office in Derrimut, Victoria, Australia
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="rounded-xl overflow-hidden shadow-lg border border-gray-200 h-[300px] sm:h-[400px] md:h-[500px]"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.835434509037!2d144.7895823153166!3d-37.81362797975197!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad65d4dd5a05d97%3A0x3e64f855a564844d!2s77%20Derrimut%20Dr%2C%20Derrimut%20VIC%203026%2C%20Australia!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

