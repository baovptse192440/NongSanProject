"use client";

import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { Wheat } from "lucide-react";

const posts = [
  {
    id: 1,
    title: "Saving Resources While Growing Agriculture",
    date: "Feb 24, 2025",
    author: "DynamicLayers",
    category: "Fertilizers",
    excerpt:
      "Agriculture is the backbone of our society, providing food, raw materials, and economic stability.",
    image: "/new_1.jpg",
    href: "/posts/saving-resources",
  },
  {
    id: 2,
    title: "How Sustainability Shapes Farming Agriculture",
    date: "Feb 24, 2025",
    author: "DynamicLayers",
    category: "Farming",
    excerpt:
      "Practical methods and technologies that help farms reduce waste and increase yields sustainably.",
    image: "/new_2.jpg",
    href: "/posts/sustainability-shapes-farming",
  },
  {
    id: 3,
    title: "General Agriculture and Farming Insights",
    date: "Apr 21, 2025",
    author: "DynamicLayers",
    category: "Agriculture",
    excerpt:
      "Short insights and best practices for modern farming and resource management , and resource management.",
    image: "/new_3.jpg",
    href: "/posts/agriculture-insights",
  },
];

const parentVariant: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.16, delayChildren: 0.1 } },
};

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.92 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
  },
};

export default function BlogSection() {
  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-5 sm:px-6 lg:px-8 max-w-7xl">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16">
          {/* Left text */}
          <div className="max-w-2xl">
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-md font-medium text-[#43aa5c] flex items-center gap-2"
            >
              From the Blog
              <Wheat size={20} className="text-yellow-400" />
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-3 text-left text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#164333] leading-tight"
            >
              News & Insights!
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="mt-4 text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed"
            >
              Explore our latest articles, knowledge, tips and real-world insights from modern agriculture.
            </motion.p>
          </div>

          {/* Right button */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="mt-8 md:mt-0"
          >
            <a
              href="/blog"
              className="inline-block bg-[#f8c32c] text-white px-6 py-3 rounded-md font-semibold shadow-lg hover:bg-[#43aa5c] hover:text-white transition-all"
            >
              View All Posts
            </a>
          </motion.div>
        </div>

        {/* POSTS GRID */}
        <motion.div
          variants={parentVariant}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="
            grid 
            grid-cols-1 
            sm:grid-cols-2 
            lg:grid-cols-3 
            gap-5 
            md:gap-8
          "
        >
          {posts.map((post) => (
            <motion.article
              key={post.id}
              variants={cardVariant}
              whileHover={{
                y: -10,
                scale: 1.03,
                boxShadow: "0 25px 50px rgba(22, 44, 32, 0.18)",
              }}
              transition={{ type: "spring", stiffness: 250, damping: 18 }}
              className="
                bg-white 
                
                rounded-2xl 
                overflow-hidden 
                transition-all 
                duration-300
                shadow-sm
              "
            >
              {/* IMAGE */}
              <div className="relative h-56 sm:h-60 md:h-52 lg:h-56">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>

              {/* CONTENT */}
              <div className="p-6 md:p-7">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[#43aa5c] bg-[#43aa5c]/10 px-2 py-1 rounded-md">
                    {post.category}
                  </span>
                  <time className="text-xs text-gray-400">{post.date}</time>
                </div>

                <a href={post.href} className="block group">
                  <h3 className="text-lg md:text-xl font-bold text-[#164333] group-hover:text-[#43aa5c] transition-colors">
                    {post.title}
                  </h3>
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </a>

                {/* AUTHOR + READ BUTTON */}
                <div className="mt-5  flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-[#164333]">
                      {post.author[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#164333]">
                        {post.author}
                      </p>
                      <a
                        href={post.href}
                        className="text-xs text-gray-400 hover:text-gray-600 transition"
                      >
                        Read more →
                      </a>
                    </div>
                  </div>

                  <a
                    href={post.href}
                    className="
                      inline-flex items-center gap-2 
                      text-sm font-semibold 
                      text-[#164333] 
                      bg-[#F8F7F0] 
                      px-3 py-2 rounded-md
                      hover:bg-[#43aa5c] 
                      hover:text-white 
                      transition-all
                    "
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M5 12h14M12 5l7 7-7 7"
                      />
                    </svg>
                    Read
                  </a>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

