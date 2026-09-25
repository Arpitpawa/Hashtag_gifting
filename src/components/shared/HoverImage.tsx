import Image from "next/image";

/**
 * Product card image: shows the main photo and, on hover (parent needs the
 * `group` class), cross-fades to the 2nd image (the graphic). No zoom.
 * Must be placed inside a `relative` container with a fixed size.
 *
 * `priority`/`lazy`: every grid that renders this component maps over a
 * product list with no idea which tiles land above the fold — historically
 * that meant EVERY tile (including the very first, always-visible one)
 * loaded with the browser's default lazy behavior, which delays the
 * request until layout/intersection catches up with it. On slow
 * connections this repeatedly made a first-row product image the page's
 * actual LCP element with a multi-second load delay. Callers now pass
 * `priority` for the very first tile (real <link rel=preload>, fetches
 * immediately, highest network priority — same mechanism Next uses for
 * hero images) and `lazy={false}` for the next few first-row tiles
 * (fetch immediately but no preload link, so they don't compete with the
 * one true priority image). Every tile past that stays `lazy` (default),
 * which is correct — no reason to eagerly fetch products the visitor
 * hasn't scrolled to yet.
 */
export default function HoverImage({
  images,
  alt,
  sizes,
  lazy = true,
  priority = false,
}: {
  images: string[];
  alt: string;
  sizes: string;
  lazy?: boolean;
  priority?: boolean;
}) {
  const first = images?.[0] || "/placeholder.jpg";
  const second = images?.[1] && images[1] !== first ? images[1] : null;
  return (
    <>
      <Image
        src={first}
        alt={alt}
        fill
        priority={priority}
        fetchPriority={priority ? "high" : undefined}
        loading={priority ? undefined : lazy ? "lazy" : "eager"}
        sizes={sizes}
        className={`object-cover transition-opacity duration-500 ${second ? "group-hover:opacity-0" : ""}`}
      />
      {second && (
        <Image
          src={second}
          alt=""
          aria-hidden="true"
          fill
          loading="lazy"
          sizes={sizes}
          className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
      )}
    </>
  );
}
