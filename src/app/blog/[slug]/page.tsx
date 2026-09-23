import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, Tag, Share2, ArrowRight } from "lucide-react";
import { BLOG_POSTS, getBlogPost, getRelatedPosts } from "../blogData";
import { getActiveProductCount, roundDownForMarketing } from "@/lib/productCount";

// Generate static params for all blog posts
export function generateStaticParams() {
  return BLOG_POSTS.map(post => ({ slug: post.slug }));
}

// Dynamic SEO metadata per post
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Post not found" };

  return {
    title:       `${post.title} — Hashtag Gifting Blog`,
    description: post.excerpt,
    keywords:    post.tags.join(", "),
    openGraph: {
      title:       post.title,
      description: post.excerpt,
      images:      [{ url: post.coverImage, width: 1200, height: 630 }],
      type:        "article",
      publishedTime: post.publishedAt,
      authors:     [post.author],
    },
    twitter: {
      card:        "summary_large_image",
      title:       post.title,
      description: post.excerpt,
      images:      [post.coverImage],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post     = getBlogPost(slug);
  if (!post) notFound();

  const related = getRelatedPosts(slug, 3);

  let productCount = 0;
  try {
    productCount = roundDownForMarketing(await getActiveProductCount());
  } catch (err) {
    console.error("BLOG POST PAGE: failed to load product count:", err);
  }

  return (
    <div className="min-h-screen bg-[#f3efe8]">

      {/* ── Hero image ── */}
      <div className="relative h-[340px] md:h-[460px] w-full overflow-hidden">
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Back button */}
        <Link
          href="/blog"
          className="absolute top-6 left-6 flex items-center gap-2 text-white/90 hover:text-white text-[13px] font-medium bg-black/30 hover:bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm transition-all"
        >
          <ArrowLeft size={14} /> All articles
        </Link>

        {/* Category */}
        <div className="absolute top-6 right-6">
          <span className="bg-[#c0555a] text-white text-[11px] font-bold px-3 py-1.5 rounded-full">
            {post.category}
          </span>
        </div>
      </div>

      <div className="max-w-[780px] mx-auto px-4 md:px-6">

        {/* ── Article header ── */}
        <div className="bg-white rounded-2xl border border-[#e8e0d5] -mt-12 relative z-10 p-7 md:p-10 mb-8 shadow-sm">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 mb-5 text-[12px] text-[#aaa]">
            <span className="flex items-center gap-1.5">
              <Calendar size={12} />
              {new Date(post.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={12} /> {post.readTime}
            </span>
          </div>

          {/* Title */}
          <h1
            className="text-[26px] md:text-[36px] font-normal text-[#1a1a1a] leading-[1.2] mb-5"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {post.title}
          </h1>

          {/* Author */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#c0555a] flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0">
                {post.author.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <p className="text-[13px] font-bold text-[#1a1a1a]">{post.author}</p>
                <p className="text-[11px] text-[#aaa]">{post.authorRole}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Article content ── */}
        <div className="bg-white rounded-2xl border border-[#e8e0d5] p-7 md:p-10 mb-8 shadow-sm">
          {/* Excerpt */}
          <p className="text-[16px] text-[#555] leading-relaxed mb-8 pb-8 border-b border-[#f0ece6] font-medium italic">
            {post.excerpt}
          </p>

          {/* Content */}
          <div
            className="prose prose-sm max-w-none"
            style={{
              fontSize: "15px",
              lineHeight: "1.8",
              color: "#444",
            }}
            dangerouslySetInnerHTML={{ __html: post.content
              .replace(/<h2>/g, '<h2 style="font-family:\'Playfair Display\',Georgia,serif; font-size:22px; font-weight:600; color:#1a1a1a; margin:32px 0 12px; line-height:1.3">')
              .replace(/<h3>/g, '<h3 style="font-size:17px; font-weight:700; color:#1a1a1a; margin:24px 0 8px">')
              .replace(/<p>/g, '<p style="margin:0 0 16px; color:#555; line-height:1.8">')
              .replace(/<ul>/g, '<ul style="margin:0 0 16px; padding-left:20px">')
              .replace(/<ol>/g, '<ol style="margin:0 0 16px; padding-left:20px">')
              .replace(/<li>/g, '<li style="margin:0 0 8px; color:#555; line-height:1.7">')
              .replace(/<strong>/g, '<strong style="color:#1a1a1a; font-weight:700">')
              .replace(/<em>/g, '<em style="color:#c0555a">')
            }}
          />

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-[#f0ece6]">
            <Tag size={13} className="text-[#aaa] mt-0.5" />
            {post.tags.map(tag => (
              <span key={tag} className="text-[11px] font-medium text-[#888] bg-[#f3efe8] px-3 py-1 rounded-full border border-[#e8e0d5]">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="bg-[#c0555a] rounded-2xl p-8 text-center text-white mb-8">
          <h3
            className="text-[22px] font-normal text-white mb-3"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Ready to find the perfect gift?
          </h3>
          <p className="text-white/80 text-[13px] mb-5">
            Browse {productCount > 0 ? `${productCount}+` : "our"} personalised gifts — delivered in 3 hours within Jaipur.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-7 py-3 bg-white text-[#c0555a] font-bold rounded-full hover:bg-[#f3efe8] transition-colors text-[13px]"
          >
            Shop all gifts <ArrowRight size={14} />
          </Link>
        </div>

        {/* ── Related posts ── */}
        {related.length > 0 && (
          <div className="mb-12">
            <h2
              className="text-[20px] font-normal text-[#1a1a1a] mb-5"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              You might also like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map(relPost => (
                <Link key={relPost.slug} href={`/blog/${relPost.slug}`} className="group">
                  <div className="bg-white rounded-2xl border border-[#e8e0d5] overflow-hidden hover:border-[#c0555a]/30 transition-all">
                    <div className="relative aspect-video">
                      <Image
                        src={relPost.coverImage}
                        alt={relPost.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="33vw"
                      />
                    </div>
                    <div className="p-4">
                      <span className="text-[10px] font-bold text-[#c0555a] uppercase tracking-wider">{relPost.category}</span>
                      <p className="text-[13px] font-bold text-[#1a1a1a] mt-1 leading-snug group-hover:text-[#c0555a] transition-colors line-clamp-2"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                      >
                        {relPost.title}
                      </p>
                      <p className="text-[11px] text-[#aaa] mt-1.5 flex items-center gap-1">
                        <Clock size={9} /> {relPost.readTime}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}