import Image from 'next/image';

interface LogoProps {
  className?: string;
  size?: number;
}

export function PartnershipLogo({ className = '', size = 70 }: LogoProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <Image
        src="/images/partnership-white.png"
        alt="برنامج الشراكة الطلابية"
        width={size * 3}
        height={size}
        style={{ height: `${size}px`, width: 'auto' }}
        className="object-contain w-auto transition-transform duration-300 hover:scale-105"
        priority
      />
    </div>
  );
}

export function MediaCommitteeLogo({ className = '', size = 70 }: LogoProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <Image
        src="/images/media-committee.png"
        alt="اللجنة الإعلامية"
        width={size * 3}
        height={size}
        style={{ height: `${size}px`, width: 'auto' }}
        className="object-contain w-auto transition-transform duration-300 hover:scale-105"
        priority
      />
    </div>
  );
}

export function TechnicalCommitteeLogo({ className = '', size = 80 }: LogoProps) {
  return (
    <div className={`relative flex items-center justify-center gap-2 ${className}`}>
      <Image
        src="/images/technical-committee.png"
        alt="اللجنة التقنية"
        width={size * 3.5}
        height={size}
        style={{ height: `${size}px`, width: 'auto' }}
        className="object-contain w-auto transition-transform duration-300 hover:scale-105"
        priority
      />
    </div>
  );
}

