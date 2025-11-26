"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Building2, Mail, Phone, Facebook, Youtube, Instagram, Linkedin, Loader2 } from "lucide-react";

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
    account: [
      { label: "My Account", href: "/profile" },
      { label: "Rewards", href: "/rewards" },
      { label: "Cart", href: "/cart" },
      { label: "Orders", href: "/orders" },
    ],
    information: [
      { label: "About Us", href: "/about" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Export", href: "/export" },
      { label: "Careers", href: "/careers" },
    ],
    support: [
      { label: "Shopping Guide", href: "/guide" },
      { label: "Return Policy", href: "/return-policy" },
      { label: "Shipping", href: "/shipping" },
      { label: "Contact Us", href: "/contact" },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: config.facebook, label: "Facebook" },
    { icon: Youtube, href: config.youtube, label: "Youtube" },
    { icon: Instagram, href: config.instagram, label: "Instagram" },
    { icon: Linkedin, href: config.linkedin, label: "LinkedIn" },
  ].filter((link) => link.href);

  if (loading) {
    return (
      <footer className="w-full bg-[#0a923c] text-white">
        <div className="container mx-auto px-4 sm:px-5">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="w-full bg-[#0a923c] text-white mt-12 sm:mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-10 sm:py-12 md:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* COLUMN 1 — COMPANY INFO */}
            <div className="sm:col-span-2 lg:col-span-2 space-y-6">
              {/* Logo */}
              <div className="relative w-[140px] h-[70px] sm:w-[160px] sm:h-[80px]">
                <Image
                  src={config.logo || "/logo_AU.png"}
                  alt={config.siteName || "AU Logo"}
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              {/* Company Description */}
              <p className="text-sm sm:text-base text-white/90 leading-relaxed max-w-md">
                Your trusted partner for premium agricultural products. Quality, sustainability, and excellence in every harvest.
              </p>

              {/* Contact Info */}
              <div className="space-y-3.5">
                {config.address && (
                  <ContactItem
                    icon={<MapPin className="w-4 h-4" />}
                    label="Business Address:"
                    text={config.address}
                  />
                )}
                {config.addressContact && (
                  <ContactItem
                    icon={<MapPin className="w-4 h-4" />}
                    label="Contact Address:"
                    text={config.addressContact}
                  />
                )}
                {config.warehouse && (
                  <ContactItem
                    icon={<Building2 className="w-4 h-4" />}
                    label="Warehouse:"
                    text={config.warehouse}
                  />
                )}
                {config.email && (
                  <ContactLink
                    icon={<Mail className="w-4 h-4" />}
                    href={`mailto:${config.email}`}
                    text={config.email}
                  />
                )}
                {config.phone && (
                  <ContactLink
                    icon={<Phone className="w-4 h-4" />}
                    href={`tel:${config.phone.replace(/\s/g, "")}`}
                    text={`${config.phone}${config.businessHours ? ` (${config.businessHours})` : ""}`}
                    bold
                  />
                )}
              </div>

              {/* Social Media */}
              {socialLinks.length > 0 && (
                <div className="flex items-center gap-3 pt-2">
                  {socialLinks.map((social, index) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={index}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg"
                        aria-label={social.label}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {/* COLUMN 2 — ACCOUNT */}
            <FooterColumn
              title="Account"
              items={footerLinks.account}
            />

            {/* COLUMN 3 — INFORMATION */}
            <FooterColumn
              title="Information"
              items={footerLinks.information}
            />

            {/* COLUMN 4 — SUPPORT */}
            <FooterColumn
              title="Support"
              items={footerLinks.support}
            />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-white/80 text-center sm:text-left">
              {config.copyright || `© ${new Date().getFullYear()} ${config.siteName || "AU"}. All rights reserved.`}
            </p>
            <div className="flex items-center gap-6 text-xs sm:text-sm text-white/80">
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/sitemap" className="hover:text-white transition-colors">
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

type ContactItemProps = {
  icon: React.ReactNode;
  label: string;
  text: string;
};

function ContactItem({ icon, label, text }: ContactItemProps) {
  return (
    <div className="flex items-start gap-3 text-sm sm:text-base">
      <div className="shrink-0 mt-0.5 text-white/90">{icon}</div>
      <div className="flex-1">
        <span className="font-semibold text-white/90 mr-2">{label}</span>
        <span className="text-white/80 leading-relaxed">{text}</span>
      </div>
    </div>
  );
}

type ContactLinkProps = {
  icon: React.ReactNode;
  text: string;
  href: string;
  bold?: boolean;
};

function ContactLink({ icon, text, href, bold }: ContactLinkProps) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 text-sm sm:text-base hover:text-white transition-colors group"
    >
      <div className="shrink-0 text-white/90 group-hover:text-white transition-colors">{icon}</div>
      <span className={`text-white/80 group-hover:text-white transition-colors ${bold ? "font-semibold" : "font-medium"}`}>
        {text}
      </span>
    </a>
  );
}

type FooterColumnProps = {
  title: string;
  items: Array<{ label: string; href: string }>;
};

function FooterColumn({ title, items }: FooterColumnProps) {
  return (
    <div>
      <h3 className="font-bold text-sm sm:text-base mb-4 sm:mb-5 pb-3 border-b border-white/20">
        {title}
      </h3>
      <ul className="space-y-2.5 sm:space-y-3">
        {items.map((item, i) => (
          <li key={i}>
            <Link
              href={item.href}
              className="text-sm sm:text-base text-white/80 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
