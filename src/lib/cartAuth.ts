import crypto from "crypto";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

/**
 * Guest carts are identified by an integer id, which is guessable. To stop one
 * visitor reading / editing / merging another visitor's guest cart, the server
 * hands the browser an httpOnly cookie "hg_cart" = "<cartId>.<HMAC(cartId)>"
 * and only treats a guest cart as yours when that cookie matches its id.
 * Logged-in carts are owned via the session (cart.userId).
 */
const COOKIE = "hg_cart";
const MAX_AGE = 60 * 60 * 24 * 90; // 90 days

function secret() {
  const s = process.env.NEXTAUTH_SECRET;
  if (!s) throw new Error("NEXTAUTH_SECRET is not set");
  return s;
}

function sign(cartId: number) {
  return crypto.createHmac("sha256", secret()).update(String(cartId)).digest("hex").slice(0, 32);
}

/** Cart id proven by the caller's cookie, or null. */
export async function getSignedGuestCartId(): Promise<number | null> {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return null;
  const [idStr, sig] = raw.split(".");
  const id = Number(idStr);
  if (!Number.isInteger(id) || id <= 0 || !sig) return null;
  const expected = sign(id);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return id;
}

export async function setGuestCartCookie(cartId: number) {
  const jar = await cookies();
  jar.set(COOKIE, `${cartId}.${sign(cartId)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearGuestCartCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

/** Does the current visitor (session user or cookie holder) own this cart? */
export async function ownsCart(cart: { id: number; userId: number | null }): Promise<boolean> {
  if (cart.userId) {
    const session = await getServerSession(authOptions);
    return !!session?.user?.id && Number(session.user.id) === cart.userId;
  }
  return (await getSignedGuestCartId()) === cart.id;
}
