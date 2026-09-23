import Image from "next/image";

/**
 * Product card image: shows the main photo and, on hover (parent needs the
 * `group` class), cross-fades to the 2nd image (the graphic). No zoom.
 * Must be placed inside a `relative` container with a fixed size.
 */
export default function HoverImage({
  images,
  alt,
  sizes,
  lazy = true,
}: {
  images: string[];
  alt: string;
  sizes: string;
  lazy?: boolean;
}) {
  const first = images?.[0] || "/placeholder.jpg";
  const second = images?.[1] && images[1] !== first ? images[1] : null;
  return (
    <>
      <Image
        src={first}
        alt={alt}
        fill
        loading={lazy ? "lazy" : undefined}
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
