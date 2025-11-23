"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Building2, Mail, Phone } from "lucide-react";

export default function FooterAU() {
  return (
    <footer className="w-full bg-[#0a923c] text-white pt-12 pb-8 mt-12 relative overflow-hidden">
      {/* BACKGROUND EFFECT */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.06 }}
        transition={{ duration: 1.2 }}
        className="absolute inset-0 bg-[url('/pattern.png')] bg-cover bg-center pointer-events-none"
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* GRID */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {/* COLUMN 1 — COMPANY INFO */}
          <div className="space-y-4 sm:col-span-2">
            <div className="relative w-[160px] h-[80px] sm:w-[180px] sm:h-[90px]">
              <Image
                src="/logo_AU.png"
                alt="AU logo"
                fill
                className="object-contain"
                priority
              />
            </div>

            <div className="space-y-2 text-xs leading-relaxed">
              <FooterItem
                icon={<MapPin className="w-4 h-4 text-white/80" />}
                text="Địa chỉ ĐKKD: Tầng 1, Tòa nhà số 109-111, Xã Bình Hưng, TP. Hồ Chí Minh, Việt Nam"
              />
              <FooterItem
                icon={<MapPin className="w-4 h-4 text-white/80" />}
                text="Địa chỉ liên hệ: 262/3 Lũy Bán Bích, Quận Tân Phú, TP. Hồ Chí Minh"
              />
              <FooterItem
                icon={<Building2 className="w-4 h-4 text-white/80" />}
                text="Kho Tân Phú: 284/11 Lũy Bán Bích, Quận Tân Phú"
              />
              <FooterItemLink
                icon={<Mail className="w-4 h-4 text-white/80" />}
                href="mailto:info@au.vn"
                text="info@au.vn"
              />
              <FooterItemLink
                icon={<Phone className="w-4 h-4 text-white/80" />}
                href="tel:02877702614"
                text="02877702614 (8h00 - 18h00)"
                bold
              />
            </div>
          </div>

          {/* COLUMN 2 — ACCOUNT */}
          <FooterList
            title="TÀI KHOẢN"
            items={["Tài khoản của tôi", "Điểm thưởng", "Giỏ hàng"]}
          />

          {/* COLUMN 3 — INFO */}
          <FooterList
            title="THÔNG TIN"
            items={["Về AU", "Điều khoản", "Bảo mật", "Xuất khẩu", "Tuyển dụng"]}
          />
        </motion.div>

        {/* COPYRIGHT */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-center text-white/80 text-xs mt-10 pt-6 border-t border-white/20"
        >
          <p>© AU 2025. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  );
}

/* -------------------------------- */
/* REUSABLE SUB COMPONENTS          */
/* -------------------------------- */

type FooterItemProps = {
  icon?: React.ReactNode;
  text: string;
};

function FooterItem({ icon, text }: FooterItemProps) {
  return (
    <div className="flex items-start gap-2.5 sm:gap-3 opacity-90">
      <div className="flex-shrink-0">{icon}</div>
      <span className="text-xs sm:text-sm">{text}</span>
    </div>
  );
}

type FooterItemLinkProps = {
  icon?: React.ReactNode;
  text: string;
  href?: string;
  bold?: boolean;
};

function FooterItemLink({ icon, text, href, bold }: FooterItemLinkProps) {
  return (
    <a
      href={href ?? "#"}
      className="flex items-center gap-2.5 sm:gap-3 hover:text-white opacity-90 transition-all"
    >
      <div className="flex-shrink-0">{icon}</div>
      <span className={bold ? "font-semibold text-xs sm:text-sm" : "text-xs sm:text-sm"}>{text}</span>
    </a>
  );
}

function FooterList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-6 sm:mt-0">
      <h3 className="font-semibold text-sm mb-3 pb-2 border-b border-white/25">
        {title}
      </h3>

      <ul className="space-y-2 text-xs sm:text-sm">
        {items.map((item, i) => (
          <motion.li
            key={i}
            whileHover={{ x: 4 }}
            transition={{ duration: 0.18 }}
            className="cursor-pointer text-white/80 hover:text-white transition"
          >
            {item}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
