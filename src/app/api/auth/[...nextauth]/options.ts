import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { verifyOtp } from "@/lib/otpManager";
import { rateLimit } from "@/lib/rateLimit";
import { requireEmailVerification } from "@/lib/emailVerification";

// Only include Google provider if keys are configured
const providers: NextAuthOptions["providers"] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

// A login is stale if it was issued before the password last changed.
function isStale(token: any, passwordChangedAt: Date | null | undefined) {
  if (!passwordChangedAt || !token.iat) return false;
  return Number(token.iat) * 1000 < new Date(passwordChangedAt).getTime() - 1000;
}

export const authOptions: NextAuthOptions = {
  providers: [
    ...providers,

    // ── EMAIL + PASSWORD ──
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

        const email = credentials.email.toLowerCase().trim();

        // Brute-force guard: 8 attempts per email per 15 minutes.
        const limited = rateLimit(`login:${email}`, { maxRequests: 8, windowMs: 15 * 60_000 });
        if (!limited.success) {
          throw new Error("Too many attempts. Please try again in a few minutes.");
        }

        const user = await prisma.user.findUnique({ where: { email } });

        // One generic message for "no such account", "Google-only account" and
        // "wrong password" so the form can't be used to discover which emails
        // are registered. The bcrypt compare always runs to keep timing similar.
        const hash = user?.password || "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv";
        const isValid = await bcrypt.compare(credentials.password, hash);
        if (!user || !user.password || !isValid) {
          throw new Error("Incorrect email or password");
        }

        // Password is right but the email was never confirmed (only enforced
        // once REQUIRE_EMAIL_VERIFICATION=true — see lib/emailVerification.ts).
        if (requireEmailVerification() && !(user as any).emailVerifiedAt) {
          throw new Error("EMAIL_NOT_VERIFIED");
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
        // The OTP just proved this person controls the number. An account that
        // merely TYPED the same number at signup (never OTP-verified) must not
        // be handed to them — that would let someone pre-register a victim's
        // phone. So: prefer an OTP-verified account; otherwise a squatter
        // account (its email was never verified either) loses the number.
        const matches: any[] = await prisma.user.findMany({ where: { phone: credentials.phone } });
        let user: any =
          matches.find((u) => u.phoneVerifiedAt) ||
          matches.find((u) => u.emailVerifiedAt) || // a real, verified person who added their number
          null;

        for (const u of matches) {
          if (u !== user && !u.phoneVerifiedAt && !u.emailVerifiedAt) {
            await prisma.user.update({ where: { id: u.id }, data: { phone: null } });
          }
        }

        if (!user) {
          user = await prisma.user.create({
            data: {
              phone:    credentials.phone,
              role:     "CUSTOMER",
              password: "",
              phoneVerifiedAt: new Date(),
            } as any,
          });
        } else if (!user.phoneVerifiedAt) {
          await prisma.user.update({ where: { id: user.id }, data: { phoneVerifiedAt: new Date() } as any });
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
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        // Only trust Google accounts whose email Google has verified —
        // otherwise someone could claim another person's email address.
        if (!user.email || (profile as any)?.email_verified === false) return false;
        try {
          const existing: any = await prisma.user.findUnique({
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
                emailVerifiedAt: new Date(),
              } as any,
            });
          } else if (!existing.emailVerifiedAt) {
            // Google has just proven this person owns the email. If the account
            // was made by someone typing the address at signup (never verified),
            // wipe that password so the sign-up can't be used to get back in.
            await prisma.user.update({
              where: { id: existing.id },
              data:  { password: "", emailVerifiedAt: new Date(), passwordChangedAt: new Date() } as any,
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

      // Refresh from DB periodically — wrapped in try/catch: a momentary
      // Neon connection hiccup here used to throw all the way out of the
      // jwt callback, which makes NextAuth's /api/auth/session route return
      // an error page instead of JSON (the "Unexpected token '<'... is not
      // valid JSON" CLIENT_FETCH_ERROR). Falling back to the existing token
      // keeps the user's session alive for that one request instead of
      // breaking the session fetch entirely.
      try {
        if (token.email && !user) {
          const dbUser: any = await prisma.user.findUnique({
            where: { email: token.email as string },
          });
          if (dbUser) {
            token.id    = dbUser.id;
            token.role  = dbUser.role;
            token.phone = dbUser.phone;
            if (isStale(token, dbUser.passwordChangedAt)) token.invalidated = true;
          }
        }

        // For phone users — refresh by id
        if (!token.email && token.id && !user) {
          const dbUser: any = await prisma.user.findUnique({
            where: { id: Number(token.id) },
          });
          if (dbUser) {
            token.role  = dbUser.role;
            token.phone = dbUser.phone;
            if (dbUser.email) token.email = dbUser.email;
            if (isStale(token, dbUser.passwordChangedAt)) token.invalidated = true;
          }
        }
      } catch (err) {
        console.error("JWT callback DB refresh failed — keeping existing token:", err);
      }

      return token;
    },

    // ── SESSION ──
    async session({ session, token }) {
      // Signed out everywhere: this login was issued before the password was
      // last changed/reset. An empty session = "not logged in" to the client
      // and to getServerSession().
      if (token.invalidated) return {} as any;
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