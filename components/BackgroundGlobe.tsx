import Image from 'next/image';

export default function BackgroundGlobe() {
  return (
    <Image
      src="/globe.svg"
      alt=""
      fill
      className="object-cover opacity-20 pointer-events-none select-none"
      priority={false}
      sizes="100vw"
    />
  );
}
