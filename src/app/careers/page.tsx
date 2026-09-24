import type { Metadata } from "next";
import Link from "next/link";
import {
  Heart, Zap, Gift, Users, MapPin, Mail,
  Briefcase, Star, Coffee, ArrowRight, CheckCircle,
} from "lucide-react";
import { getActiveProductCount, roundDownForMarketing } from "@/lib/productCount";
import { StoreButton } from "@/components/ui/StoreButton";

export const metadata: Metadata = {
  title:       "Careers — Join Our Team",
  description: "Join the Hashtag Gifting team in Jaipur. We're looking for passionate, creative people to help us change the idea of gifting. View open positions.",
};

const PERKS = [
  { icon: Heart,   title: "Work with purpose",        desc: "Every day you come to work, you're helping people express love and create memories. That's a pretty great reason to get out of bed." },
  { icon: Zap,     title: "Fast-paced & growing",     desc: "We're scaling fast. There's real opportunity to grow with the company — take ownership, move up and make a genuine impact." },
  { icon: Gift,    title: "Free gifts (obviously)",    desc: "Team members get personalised gifts for their birthdays, anniversaries and milestones. We give what we preach." },
  { icon: Coffee,  title: "Great work environment",   desc: "Casual, collaborative, creative. Our Jaipur workspace is designed to inspire — come in, do great work, have fun doing it." },
  { icon: Users,   title: "Small team, big impact",   desc: "You're not a number here. Your work is visible, your ideas are heard and your contribution directly affects the business." },
  { icon: Star,    title: "Competitive compensation", desc: "Fair pay, performance bonuses and growth-linked increments. We take care of the people who take care of our customers." },
];

const OPEN_ROLES = [
  {
    title:       "Graphic Designer / Print Artist",
    type:        "Full-time",
    location:    "Jaipur (On-site)",
    department:  "Design",
    description: "We're looking for a creative designer who can produce stunning personalised product designs — from mugs and frames to large print formats. You'll work directly with customer orders and develop new product templates.",
    requirements: [
      "Proficiency in Adobe Illustrator, Photoshop and Canva",
      "Understanding of print production (sublimation, UV printing preferred)",
      "Eye for typography and colour — especially for name/text-based designs",
      "Ability to work quickly without compromising quality",
      "1+ years experience in graphic design or print work",
    ],
    nice: ["Experience with product photography", "Knowledge of gifting industry trends"],
  },
  {
    title:       "Customer Experience Executive",
    type:        "Full-time",
    location:    "Jaipur (On-site / Hybrid)",
    department:  "Customer Success",
    description: "Be the face of Hashtag Gifting for our customers — handling WhatsApp, Instagram DMs, email and phone queries. You'll help customers choose gifts, resolve issues and ensure every order leaves a smile.",
    requirements: [
      "Excellent written and verbal communication in Hindi and English",
      "Empathy, patience and a genuine desire to help people",
      "Comfortable using WhatsApp Business, Instagram and basic CRM tools",
      "Ability to handle multiple conversations simultaneously",
      "Freshers welcome — training will be provided",
    ],
    nice: ["Previous customer service experience", "Passion for gifting and personalisation"],
  },
  {
    title:       "Social Media & Content Creator",
    type:        "Full-time / Part-time",
    location:    "Jaipur (Hybrid)",
    department:  "Marketing",
    description: "Create engaging content for Instagram, YouTube Shorts and WhatsApp. You'll ideate, shoot and edit content that showcases our products, tells customer stories and grows our online community.",
    requirements: [
      "Strong Instagram presence or demonstrated content creation skills",
      "Proficiency in video editing (Reels, Shorts format)",
      "Creativity and ability to spot gifting trends",
      "Understanding of SEO and social media algorithms",
      "Eye for aesthetics and product photography",
    ],
    nice: ["Experience with influencer marketing", "Understanding of e-commerce gifting space"],
  },
  {
    title:       "Production & Quality Executive",
    type:        "Full-time",
    location:    "Jaipur (On-site)",
    department:  "Operations",
    description: "Handle the physical production of personalised gifts — operating printing machinery, quality-checking finished products and managing packaging. You'll be responsible for ensuring every gift that leaves our facility is perfect.",
    requirements: [
      "Hands-on experience with sublimation printing or UV printing preferred",
      "Attention to detail — zero tolerance for quality issues",
      "Ability to work efficiently under time pressure (especially during peak seasons)",
      "Physical stamina for a production environment",
      "Willingness to learn new printing techniques",
    ],
    nice: ["Experience in personalised gifting or print production", "Knowledge of product finishing and packaging"],
  },
];

function RoleCard({ role }: { role: typeof OPEN_ROLES[0] }) {
  return (
    <div className="bg-white rounded-2xl border border-[#e8e0d5] overflow-hidden">
      <div className="p-6 border-b border-[#f0ece6]">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-[#c0555a] bg-[#c0555a]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {role.department}
              </span>
            </div>
            <h3 className="text-[18px] font-bold text-[#1a1a1a] mt-1"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {role.title}
            </h3>
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <span className="text-[12px] text-[#888] flex items-center gap-1">
                <Briefcase size={11} /> {role.type}
              </span>
              <span className="text-[12px] text-[#888] flex items-center gap-1">
                <MapPin size={11} /> {role.location}
              </span>
            </div>
          </div>
          <a
            href={`mailto:hashtaggiftsupport@gmail.com?subject=Application: ${role.title}&body=Hi Hashtag Gifting team,%0A%0AI'd like to apply for the ${role.title} position.%0A%0A[Please attach your resume and tell us about yourself]`}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#c0555a] text-white text-[13px] font-bold rounded-full hover:bg-[#a84449] transition-all whitespace-nowrap flex-shrink-0"
          >
            Apply now <ArrowRight size={13} />
          </a>
        </div>
      </div>

      <div className="p-6">
        <p className="text-[14px] text-[#555] leading-relaxed mb-5">{role.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-[12px] font-bold text-[#1a1a1a] uppercase tracking-wider mb-3">Requirements</p>
            <div className="flex flex-col gap-2">
              {role.requirements.map((req, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle size={13} className="text-[#c0555a] flex-shrink-0 mt-0.5" />
                  <p className="text-[13px] text-[#555] leading-snug">{req}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[12px] font-bold text-[#1a1a1a] uppercase tracking-wider mb-3">Nice to have</p>
            <div className="flex flex-col gap-2">
              {role.nice.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Star size={12} className="text-[#c4922a] flex-shrink-0 mt-0.5" />
                  <p className="text-[13px] text-[#555] leading-snug">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function CareersPage() {
  let productCount = 0;
  try {
    productCount = roundDownForMarketing(await getActiveProductCount());
  } catch (err) {
    console.error("CAREERS PAGE: failed to load product count:", err);
  }

  return (
    <div className="min-h-screen bg-[#f3efe8]">

      {/* ── Hero ── */}
      <div className="bg-white border-b border-[#e8e0d5] py-16 md:py-24 text-center px-4">
        <p className="text-[12px] font-bold text-[#c0555a] uppercase tracking-widest mb-4">Join our team</p>
        <h1
          className="text-[36px] md:text-[56px] font-normal text-[#1a1a1a] mb-5 leading-[1.15]"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Help us change the
          <br />
          <span className="italic text-[#c0555a]">idea of gifting</span>
        </h1>
        <p className="text-[16px] text-[#666] max-w-2xl mx-auto leading-relaxed mb-8">
          We're a small, passionate team in Jaipur on a mission to make every gift feel personal.
          If you love creativity, care deeply about the work you do and want to be part of something growing — we'd love to meet you.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <StoreButton href="#open-roles" external variant="solid" size="md">
            View open roles <ArrowRight size={15} />
          </StoreButton>
          <StoreButton
            href="mailto:hashtaggiftsupport@gmail.com?subject=General Application — Hashtag Gifting"
            variant="dark-outline"
            size="md"
          >
            Send your CV
          </StoreButton>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-4 md:px-6 py-14">

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { num: "2019",  label: "Founded in Jaipur" },
            { num: "10K+",  label: "Orders fulfilled" },
            { num: "15+",   label: "Team members" },
            { num: productCount > 0 ? `${productCount}+` : "150+",  label: "Gift designs" },
          ].map(({ num, label }, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#e8e0d5] p-5 text-center">
              <p className="text-[28px] font-bold text-[#c0555a]">{num}</p>
              <p className="text-[13px] text-[#888] mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Why join us ── */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <p className="text-[12px] font-bold text-[#c0555a] uppercase tracking-widest mb-2">Why Hashtag Gifting</p>
            <h2
              className="text-[28px] md:text-[34px] font-normal text-[#1a1a1a]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              What it's like to work here
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PERKS.map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#e8e0d5] p-6">
                <div className="w-10 h-10 bg-[#c0555a]/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={18} className="text-[#c0555a]" strokeWidth={1.5} />
                </div>
                <h3 className="text-[15px] font-bold text-[#1a1a1a] mb-2">{title}</h3>
                <p className="text-[13px] text-[#666] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Open roles ── */}
        <div id="open-roles" className="mb-14">
          <div className="text-center mb-8">
            <p className="text-[12px] font-bold text-[#c0555a] uppercase tracking-widest mb-2">Now hiring</p>
            <h2
              className="text-[28px] md:text-[34px] font-normal text-[#1a1a1a]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Open positions
            </h2>
            <p className="text-[14px] text-[#888] mt-2">
              All roles are based in Jaipur. We believe in in-person collaboration.
            </p>
          </div>
          <div className="flex flex-col gap-5">
            {OPEN_ROLES.map((role, i) => <RoleCard key={i} role={role} />)}
          </div>
        </div>

        {/* ── Don't see a fit ── */}
        <div
          className="rounded-2xl p-10 text-center"
          style={{ backgroundColor: "#6B4F3F" }}
        >
          <Mail size={28} className="text-white mx-auto mb-4" strokeWidth={1.5} />
          <h2
            className="text-[24px] font-normal text-white mb-3"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Don't see the right role?
          </h2>
          <p className="text-white/75 text-[14px] mb-6 max-w-md mx-auto">
            We're always on the lookout for talented people. Send us your CV and tell us how you'd like to contribute.
            If we see a fit, we'll reach out.
          </p>
          <a
            href="mailto:hashtaggiftsupport@gmail.com?subject=General Application — Hashtag Gifting&body=Hi team,%0A%0AI'd love to be part of Hashtag Gifting. Here's a bit about me...%0A%0A[Attach your resume]"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-white font-bold rounded-full hover:bg-[#f3efe8] transition-colors text-[14px]"
            style={{ color: "#6B4F3F" }}
          >
            Send your CV <ArrowRight size={14} />
          </a>
        </div>

      </div>
    </div>
  );
}