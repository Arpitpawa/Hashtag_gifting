import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [

    // ── GOOGLE LOGIN ──
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // ── EMAIL + PASSWORD LOGIN ──
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("No account found with this email");
        }

        // Google users have no password
        if (!user.password) {
          throw new Error("Please login with Google");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          throw new Error("Incorrect password");
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

    // ── AUTO CREATE USER ON GOOGLE LOGIN ──
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
                password: "", // empty for Google users
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

    // ── STORE EXTRA DATA IN JWT ──
    async jwt({ token, user }) {
      if (user) {
        token.id    = (user as any).id;
        token.role  = (user as any).role;
        token.phone = (user as any).phone || null;
      }

      // Refresh role from DB on every token refresh
      // (so role changes take effect without re-login)
      if (token.email && !user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { id: true, role: true, phone: true },
        });
        if (dbUser) {
          token.id    = dbUser.id;
          token.role  = dbUser.role;
          token.phone = dbUser.phone;
        }
      }

      return token;
    },

    // ── ATTACH DATA TO SESSION ──
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id    = token.id;
        (session.user as any).role  = token.role;
        (session.user as any).phone = token.phone;
      }
      return session;
    },

    // ── SAFE REDIRECT ──
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};