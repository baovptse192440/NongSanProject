"use client";

import { motion } from "framer-motion";
import Header from "../clients/components/Header";
import Footer from "../clients/components/Footer";
import AboutSection from "../clients/components/AboutSection";
import SEO from "../clients/components/SEO";
import { Phone, Mail, MapPin, Award, Users, Target, CheckCircle, TrendingUp, Globe, Shield } from "lucide-react";

const values = [
  {
    icon: Award,
    title: "Quality Excellence",
    desc: "We maintain the highest standards in sourcing and distributing premium products.",
  },
  {
    icon: Users,
    title: "Trusted Partnership",
    desc: "Building long-term relationships with suppliers and customers across Australia.",
  },
  {
    icon: Target,
    title: "Sustainable Growth",
    desc: "Committed to ethical practices and sustainable agricultural solutions.",
  },
];

const stats = [
  { number: "10+", label: "Years of Experience", icon: TrendingUp },
  { number: "500+", label: "Happy Customers", icon: Users },
  { number: "50+", label: "Product Lines", icon: Globe },
  { number: "100%", label: "Quality Assured", icon: Shield },
];

const highlights = [
  "Premium Vietnamese coffee and agricultural products",
  "Authentic Asian specialty foods and ingredients",
  "Full compliance with Australian import standards",
  "Transparent supply chain from farm to shelf",
  "Long-term partnerships with trusted suppliers",
  "Reliable distribution network across Australia",
];

export default function AboutPage() {
  const aboutStructuredData = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    mainEntity: {
      "@type": "Organization",
      name: "AusGlobal Connection",
      description: "AusGlobal Connection is a trusted importer and distributor of premium Vietnamese agricultural products and authentic Asian specialty foods in Australia. We maintain the highest standards in sourcing and distributing premium products, building long-term relationships with suppliers and customers across Australia.",
      foundingDate: "2014",
      numberOfEmployees: {
        "@type": "QuantitativeValue",
        value: "10-50",
      },
      areaServed: {
        "@type": "Country",
        name: "Australia",
      },
      knowsAbout: [
        "Vietnamese Agricultural Products",
        "Asian Specialty Foods",
        "Coffee Import and Distribution",
        "Food Import and Export",
      ],
    },
  };

  return (
    <main className="relative">
      <SEO
        title="About Us - Trusted Import & Distribution Partner"
        description="Learn about AusGlobal Connection - a trusted importer and distributor of premium Vietnamese agricultural products and authentic Asian specialty foods in Australia. Quality excellence, trusted partnerships, sustainable growth."
        canonical="https://globalconnection.vn/about"
        ogImage="/banner.jpg"
        structuredData={aboutStructuredData}
      />
      <Header />

      {/* Hero Section - Enhanced */}
      <section className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <motion.img
            src="/banner.jpg"
            alt="About AusGlobal Connection"
            className="w-full h-full object-cover"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5 }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/20 to-transparent"></div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-32 h-32 bg-green-500/10 rounded-full blur-3xl hidden lg:block"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl hidden lg:block"></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-block mb-4 sm:mb-6"
            >
              <span className="text-green-400 text-xs sm:text-sm md:text-base font-semibold tracking-widest uppercase px-4 py-2 border border-green-400/30 rounded-full bg-green-400/10 backdrop-blur-sm">
                About AusGlobal Connection
              </span>
            </motion.div>
            <h1 className="text-white font-semibold leading-tight drop-shadow-2xl text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-3 sm:mb-4">
              Connecting Vietnam & Asia
              <br />
              <span className="text-green-400">to Australia</span>
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-white/95 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
            >
              Your trusted partner for premium Vietnamese agricultural products and authentic Asian foods
            </motion.p>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center"
          >
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
          </motion.div>
        </motion.div>
      </section>

      {/* About Section */}
      <AboutSection />

      {/* Highlights Section */}
      <section className="relative py-12 sm:py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h4 className="text-green-700 text-xs sm:text-sm md:text-base font-semibold mb-2 sm:mb-3 tracking-wide">
                Why Choose Us
              </h4>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-[#164333] tracking-tight mb-4 sm:mb-6">
                What Makes Us <span className="text-green-700">Stand Out</span>
              </h2>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
                At AusGlobal Connection, we combine years of expertise with a passion for bringing authentic flavors to Australian tables. Our commitment to quality, transparency, and customer satisfaction sets us apart.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-3 sm:space-y-4"
            >
              {highlights.map((highlight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-3 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-white rounded-lg hover:shadow-md transition-shadow border-l-4 border-green-500"
                >
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 shrink-0 mt-0.5" />
                  <p className="text-gray-700 text-sm sm:text-base font-medium">
                    {highlight}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section - Enhanced */}
      <section className="relative py-12 sm:py-16 md:py-20 bg-gradient-to-b from-white via-gray-50 to-white overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-green-100/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-100/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#164333] mb-2">
              Our Achievements
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm md:text-base max-w-2xl mx-auto">
              Numbers that reflect our commitment to excellence
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center bg-white p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
                </div>
                <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-green-700 mb-1.5">
                  {stat.number}
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm md:text-base font-medium">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section - Enhanced */}
      <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-gray-50 via-white to-gray-50 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-green-100/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-yellow-100/20 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <h4 className="text-green-700 text-xs sm:text-sm md:text-base font-semibold mb-2 sm:mb-3 tracking-wide">
              Our Core Values
            </h4>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-[#164333] tracking-tight mb-3">
              What We Stand For
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm md:text-base max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white p-5 sm:p-6 md:p-8 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100 group relative overflow-hidden"
              >
                {/* Decorative gradient */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full blur-2xl group-hover:bg-green-500/10 transition-colors"></div>
                
                <div className="relative z-10">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-100 to-green-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                    <value.icon className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#164333] mb-2 sm:mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    {value.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info Section - Enhanced */}
      <section className="relative py-12 sm:py-16 md:py-20 bg-gradient-to-b from-white via-gray-50 to-white overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-green-50/30"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h4 className="text-green-700 text-xs sm:text-sm md:text-base font-semibold mb-2 sm:mb-3 tracking-wide">
              Contact Us
            </h4>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-[#164333] tracking-tight mb-3">
              Get In Touch
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm md:text-base max-w-2xl mx-auto">
              We'd love to hear from you. Reach out to us for partnerships, inquiries, or any questions.
            </p>
          </motion.div>

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

      <Footer />
    </main>
  );
}

