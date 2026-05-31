import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { verifyOtp } from "@/lib/otpManager";

export const authOptions: NextAuthOptions = {
  providers: [

    // ── 1. GOOGLE ──
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // ── 2. EMAIL + PASSWORD ──
    CredentialsProvider({
      id:   "credentials",
      name: "Email & Password",
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user)            throw new Error("No account found with this email");
        if (!user.password)   throw new Error("Please login with Google");

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid)         throw new Error("Incorrect password");

        return {
          id:    String(user.id),
          name:  user.name,
          email: user.email,
          image: user.image,
          role:  user.role,
          phone: user.phone,
        };
      },
    }),

    // ── 3. PHONE OTP ──
    CredentialsProvider({
      id:   "phone-otp",
      name: "Phone OTP",
      credentials: {
        phone: { label: "Phone", type: "text" },
        otp:   { label: "OTP",   type: "text" },
      },

      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.otp) {
          throw new Error("Phone and OTP are required");
        }

        // ── VERIFY OTP ──
        const result = await verifyOtp(credentials.phone, credentials.otp);

        if (!result.valid) {
          throw new Error(result.error || "Invalid OTP");
        }

        // ── FIND OR CREATE USER ──
        let user = await prisma.user.findFirst({
          where: { phone: credentials.phone },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              phone:    credentials.phone,
              role:     "CUSTOMER",
              password: "",
            },
          });
        }

        return {
          id:    String(user.id),
          name:  user.name,
          email: user.email,
          image: user.image,
          role:  user.role,
          phone: user.phone,
        };
      },
    }),
  ],

  session: { strategy: "jwt" },

  pages: {
    signIn: "/login",
    error:  "/login",
  },

  callbacks: {

    // ── GOOGLE AUTO-CREATE ──
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const existing = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (!existing) {
            await prisma.user.create({
              data: {
                name:     user.name,
                email:    user.email!,
                image:    user.image,
                password: "",
                role:     "CUSTOMER",
              },
            });
          }
        } catch (err) {
          console.error("Google signIn error:", err);
          return false;
        }
      }
      return true;
    },

    // ── JWT ──
    async jwt({ token, user }) {
      if (user) {
        token.id    = (user as any).id;
        token.role  = (user as any).role;
        token.phone = (user as any).phone || null;
      }

      // Refresh from DB periodically
      if (token.email && !user) {
        const dbUser = await prisma.user.findUnique({
          where:  { email: token.email as string },
          select: { id: true, role: true, phone: true },
        });
        if (dbUser) {
          token.id    = dbUser.id;
          token.role  = dbUser.role;
          token.phone = dbUser.phone;
        }
      }

      // For phone users — refresh by id
      if (!token.email && token.id && !user) {
        const dbUser = await prisma.user.findUnique({
          where:  { id: Number(token.id) },
          select: { id: true, role: true, phone: true, email: true },
        });
        if (dbUser) {
          token.role  = dbUser.role;
          token.phone = dbUser.phone;
          if (dbUser.email) token.email = dbUser.email;
        }
      }

      return token;
    },

    // ── SESSION ──
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id    = token.id;
        (session.user as any).role  = token.role;
        (session.user as any).phone = token.phone;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};