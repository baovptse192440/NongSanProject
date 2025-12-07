"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Building2, Mail, Phone, Facebook, Youtube, Instagram, Linkedin, Loader2, HelpCircle, Truck, Shield, CreditCard } from "lucide-react";

interface SiteConfig {
  logo?: string;
  siteName?: string;
  phone?: string;
  email?: string;
  address?: string;
  addressContact?: string;
  warehouse?: string;
  businessHours?: string;
  facebook?: string;
  youtube?: string;
  instagram?: string;
  linkedin?: string;
  copyright?: string;
}

export default function FooterAU() {
  const [config, setConfig] = useState<SiteConfig>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/api/config");
        const result = await response.json();
        if (result.success) {
          setConfig(result.data);
        }
      } catch (error) {
        console.error("Error fetching config:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const footerLinks = {
    customerService: [
      { label: "Help Center", href: "/help" },
      { label: "Contact Us", href: "/contact" },
      { label: "How to Buy", href: "/how-to-buy" },
      { label: "How to Sell", href: "/how-to-sell" },
      { label: "Returns & Refunds", href: "/returns" },
      { label: "Shipping Guide", href: "/shipping" },
    ],
    about: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Press & Media", href: "/press" },
      { label: "Investor Relations", href: "/investors" },
      { label: "Sitemap", href: "/sitemap" },
    ],
    partner: [
      { label: "Partnership", href: "/partnership" },
      { label: "Affiliate Program", href: "/affiliate" },
      { label: "API", href: "/api" },
      { label: "Become a Supplier", href: "/supplier" },
    ],
    shopping: [
      { label: "Browse by Category", href: "/category" },
      { label: "New Arrivals", href: "/new-arrivals" },
      { label: "Special Offers", href: "/offers" },
      { label: "Wholesale", href: "/wholesale" },
    ],
    legal: [
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Intellectual Property", href: "/ip" },
      { label: "Cookie Policy", href: "/cookies" },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: config.facebook, label: "Facebook" },
    { icon: Youtube, href: config.youtube, label: "Youtube" },
    { icon: Instagram, href: config.instagram, label: "Instagram" },
    { icon: Linkedin, href: config.linkedin, label: "LinkedIn" },
  ].filter((link) => link.href);

  const paymentMethods = [
    { name: "Visa", icon: "💳" },
    { name: "Mastercard", icon: "💳" },
    { name: "PayPal", icon: "💳" },
    { name: "Bank Transfer", icon: "🏦" },
  ];

  if (loading) {
    return (
      <footer className="w-full bg-white border-t border-gray-200">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="w-full bg-white border-t border-gray-200 mt-12 md:mt-16">
      <div className="mx-auto w-full max-w-7xl px-3 md:px-4 lg:px-6">
        {/* Main Footer Content */}
        <div className="py-8 md:py-10 lg:py-12">
          {/* Top Section - Multiple Columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8 lg:gap-10 mb-8 md:mb-10">
            {/* Customer Service */}
            <FooterColumn
              title="Customer Service"
              items={footerLinks.customerService}
            />

            {/* Shopping */}
            <FooterColumn
              title="Shopping"
              items={footerLinks.shopping}
            />

            {/* About */}
            <FooterColumn
              title="About"
              items={footerLinks.about}
            />

            {/* Partner */}
            <FooterColumn
              title="Partner"
              items={footerLinks.partner}
            />

            {/* Legal */}
            <FooterColumn
              title="Legal"
              items={footerLinks.legal}
            />

            {/* Stay Connected */}
            <div className="col-span-2 md:col-span-1">
              <h3 className="font-semibold text-sm md:text-base text-gray-900 mb-3 md:mb-4 pb-2 border-b border-gray-200">
                Stay Connected
              </h3>
              <div className="space-y-2 md:space-y-3">
                {config.email && (
                  <a
                    href={`mailto:${config.email}`}
                    className="flex items-center gap-2 text-xs md:text-sm text-gray-600 hover:text-gray-900 transition-colors break-all"
                  >
                    <Mail className="w-4 h-4 shrink-0" />
                    <span className="break-all">{config.email}</span>
                  </a>
                )}
                {config.phone && (
                  <a
                    href={`tel:${config.phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-2 text-xs md:text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Phone className="w-4 h-4 shrink-0" />
                    <span className="break-words">{config.phone}</span>
                  </a>
                )}
                {socialLinks.length > 0 && (
                  <div className="flex items-center gap-2 pt-2">
                    {socialLinks.map((social, index) => {
                      const Icon = social.icon;
                      return (
                        <a
                          key={index}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200"
                          aria-label={social.label}
                        >
                          <Icon className="w-4 h-4 text-gray-600" />
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Middle Section - Features & Payment */}
          <div className="border-t border-b border-gray-200 py-6 md:py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              {/* Customer Service Features */}
              <div className="flex items-start gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm md:text-base text-gray-900 mb-1">24/7 Customer Service</h4>
                  <p className="text-xs md:text-sm text-gray-600">We're here to help whenever you need us</p>
                </div>
              </div>

              {/* Free Shipping */}
              <div className="flex items-start gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm md:text-base text-gray-900 mb-1">Free Shipping</h4>
                  <p className="text-xs md:text-sm text-gray-600">On orders over $50</p>
                </div>
              </div>

              {/* Secure Payment */}
              <div className="flex items-start gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm md:text-base text-gray-900 mb-1">Secure Payment</h4>
                  <p className="text-xs md:text-sm text-gray-600">100% secure and protected</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="py-4 md:py-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="w-full">
                <h4 className="text-sm md:text-base font-semibold text-gray-900 mb-2 md:mb-3">We Accept</h4>
                <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                  {paymentMethods.map((method, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 bg-gray-50 rounded-md border border-gray-200"
                    >
                      <span className="text-base md:text-lg">{method.icon}</span>
                      <span className="text-xs md:text-sm text-gray-600">{method.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-4 md:py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
            {/* Copyright */}
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 lg:gap-4">
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                {config.copyright || `© ${new Date().getFullYear()} ${config.siteName || "AU"}. All rights reserved.`}
              </p>
              {config.address && (
                <>
                  <span className="hidden md:inline text-xs text-gray-400">•</span>
                  <p className="text-xs md:text-sm text-gray-600 leading-relaxed break-words">{config.address}</p>
                </>
              )}
            </div>

            {/* Additional Links */}
            <div className="flex items-center gap-3 md:gap-4 lg:gap-6 text-xs md:text-sm text-gray-600 flex-wrap">
              <Link href="/terms" className="hover:text-gray-900 transition-colors">
                Terms of Use
              </Link>
              <Link href="/privacy" className="hover:text-gray-900 transition-colors">
                Privacy Notice
              </Link>
              <Link href="/cookies" className="hover:text-gray-900 transition-colors">
                Cookies
              </Link>
              <Link href="/sitemap" className="hover:text-gray-900 transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* -------------------------------- */
/* REUSABLE COMPONENTS              */
/* -------------------------------- */

type FooterColumnProps = {
  title: string;
  items: Array<{ label: string; href: string }>;
};

function FooterColumn({ title, items }: FooterColumnProps) {
  return (
    <div>
      <h3 className="font-semibold text-sm md:text-base text-gray-900 mb-3 md:mb-4 pb-2 border-b border-gray-200">
        {title}
      </h3>
      <ul className="space-y-2 md:space-y-2.5">
        {items.map((item, i) => (
          <li key={i}>
            <Link
              href={item.href}
              className="text-xs md:text-sm text-gray-600 hover:text-gray-900 transition-colors inline-block break-words"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
