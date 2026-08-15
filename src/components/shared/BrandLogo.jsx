import Image from "next/image";
import Link from "next/link";

export default function BrandLogo({
  href = "/",
  className = "",
  imageClassName = "",
  priority = false,
}) {
  const image = (
    <Image
      src="/logo%20ipoh-01-01.png"
      alt="Mali2Ipoh logo"
      width={220}
      height={146}
      priority={priority}
      className={`h-auto w-full max-w-[170px] ${imageClassName}`.trim()}
    />
  );

  if (!href) {
    return <div className={className}>{image}</div>;
  }

  return (
    <Link href={href} className={className}>
      {image}
    </Link>
  );
}
