import type { Metadata } from "next";
import Link from "next/link";
import NewsletterForm from "@/components/layout/NewsletterForm";
import Image from "next/image";
import { ArrowRight, Clock, Tag } from "lucide-react";
import { BLOG_POSTS } from "./blogData";

export const metadata: Metadata = {
  title:       "Blog | Gift Ideas, Tips & Inspiration",
  description: "Discover personalised gift ideas, gifting tips, anniversary inspiration and more on the Hashtag Gifting blog. India's favourite gifting brand.",
  openGraph: {
    title:       "Blog — Hashtag Gifting",
    description: "Gift ideas, guides and inspiration from Jaipur's most loved personalised gifting brand.",
  },
};

const CATEGORIES = ["All", "Gift Ideas", "Corporate Gifting", "Gift Guides", "Gifting Culture", "Delivery & Service"];

function BlogCard({ post, featured = false }: { post: typeof BLOG_POSTS[0]; featured?: boolean }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <div className={`bg-white rounded-2xl border border-[#e8e0d5] overflow-hidden hover:border-[#c0555a]/30 hover:shadow-md transition-all duration-300 h-full ${featured ? "md:flex" : ""}`}>
        {/* Image */}
        <div className={`relative overflow-hidden bg-[#f3efe8] ${featured ? "md:w-[45%] flex-shrink-0" : ""}`}>
          <div className={`relative ${featured ? "h-64 md:h-full" : "aspect-[16/10]"}`}>
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes={featured ? "(max-width: 768px) 100vw, 45vw" : "(max-width: 640px) 100vw, 33vw"}
            />
          </div>
          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span className="bg-[#c0555a] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
              {post.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className={`p-5 flex flex-col ${featured ? "justify-center md:p-8" : ""}`}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[11px] text-[#aaa] flex items-center gap-1">
              <Clock size={10} /> {post.readTime}
            </span>
            <span className="text-[#ddd]">·</span>
            <span className="text-[11px] text-[#aaa]">
              {new Date(post.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>

          <h2 className={`font-bold text-[#1a1a1a] leading-snug mb-3 group-hover:text-[#c0555a] transition-colors ${featured ? "text-[20px] md:text-[24px]" : "text-[16px]"}`}
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {post.title}
          </h2>

          <p className={`text-[#666] leading-relaxed mb-4 ${featured ? "text-[14px]" : "text-[13px]"} line-clamp-3`}>
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#c0555a] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                {post.author.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <span className="text-[12px] text-[#888]">{post.author}</span>
            </div>
            <span className="text-[12px] text-[#c0555a] font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
              Read more <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function BlogPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const activeCategory = searchParams?.category || "All";
  const featured = BLOG_POSTS.filter(p => p.featured);
  const filtered = activeCategory === "All"
    ? BLOG_POSTS
    : BLOG_POSTS.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#f3efe8]">

      {/* ── Hero ── */}
      <div className="bg-white border-b border-[#e8e0d5] py-14 text-center px-4">
        <p className="text-[12px] font-bold text-[#c0555a] uppercase tracking-widest mb-3">
          Gifting inspiration
        </p>
        <h1
          className="text-[36px] md:text-[52px] font-normal text-[#1a1a1a] mb-4"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          The Hashtag Gifting Blog
        </h1>
        <p className="text-[15px] text-[#888] max-w-lg mx-auto">
          Gift ideas, guides, inspiration and tips from Jaipur's most loved personalised gifting brand.
        </p>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-12">

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <Link
              key={cat}
              href={cat === "All" ? "/blog" : `/blog?category=${encodeURIComponent(cat)}`}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-[12px] font-semibold border transition-all ${
                activeCategory === cat
                  ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                  : "bg-white text-[#555] border-[#e8e0d5] hover:border-[#c0555a] hover:text-[#c0555a]"
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>

        {/* Featured posts — only show on "All" */}
        {activeCategory === "All" && featured.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-5">
              <Tag size={14} className="text-[#c0555a]" />
              <h2 className="text-[14px] font-bold text-[#1a1a1a] uppercase tracking-wider">Featured</h2>
            </div>
            <div className="flex flex-col gap-5">
              {featured.map(post => (
                <BlogCard key={post.slug} post={post} featured />
              ))}
            </div>
          </div>
        )}

        {/* All / filtered posts */}
        {activeCategory !== "All" || filtered.length > featured.length ? (
          <div>
            {activeCategory === "All" && (
              <div className="flex items-center gap-2 mb-5">
                <h2 className="text-[14px] font-bold text-[#1a1a1a] uppercase tracking-wider">All posts</h2>
                <span className="text-[12px] text-[#aaa]">({filtered.length})</span>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {(activeCategory === "All" ? BLOG_POSTS : filtered).map(post => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        ) : null}

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[16px] font-bold text-[#1a1a1a] mb-2">No posts in this category yet</p>
            <Link href="/blog" className="text-[13px] text-[#c0555a] font-semibold hover:underline">View all posts</Link>
          </div>
        )}

        {/* Newsletter CTA */}
        <div
          className="mt-14 rounded-2xl p-10 text-center text-white"
          style={{ backgroundColor: "#6B4F3F" }}
        >
          <h2
            className="text-[24px] md:text-[30px] font-normal text-white mb-3"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Get gifting ideas in your inbox
          </h2>
          <p className="text-white/70 text-[14px] mb-6 max-w-md mx-auto">
            Subscribe for new gift guides, exclusive deals and seasonal inspiration — straight from our team in Jaipur.
          </p>
          <div className="max-w-md mx-auto">
            <NewsletterForm
              className="flex gap-2"
              inputClass="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-[13px] outline-none focus:border-white transition-colors"
              buttonClass="px-5 py-3 bg-white text-[#6B4F3F] font-bold rounded-xl hover:bg-[#f3efe8] transition-colors text-[13px] whitespace-nowrap"
            />
          </div>
        </div>

      </div>
    </div>
  );
}