import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id:    string;
      role:  "CUSTOMER" | "ADMIN";
      phone: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id:    string;
    role:  "CUSTOMER" | "ADMIN";
    phone: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id:    string | number;
    role:  "CUSTOMER" | "ADMIN";
    phone: string | null;
  }
}