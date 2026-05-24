'use client';

import { useState } from 'react';

interface Props {
  name: string;
  logo?: string;
  colorClass?: string;
  className?: string;
  textClassName?: string;
}

function isImageLogo(value: string) {
  return /^(https?:\/\/|\/|data:image\/)/.test(value);
}

export default function CompanyLogo({
  name,
  logo = '',
  colorClass = 'bg-gray-500',
  className = 'w-12 h-12 rounded-xl',
  textClassName = 'text-lg',
}: Props) {
  const [logoError, setLogoError] = useState(false);
  const showLogoImage = Boolean(logo && isImageLogo(logo) && !logoError);
  const fallbackLogo = (name || '?').slice(0, 1).toUpperCase();

  return (
    <div
      className={`${className} flex items-center justify-center overflow-hidden text-white font-extrabold shrink-0 ${
        showLogoImage ? 'bg-white border border-gray-100' : colorClass
      } ${textClassName}`}
    >
      {showLogoImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo}
          alt={`${name} logo`}
          className="w-full h-full object-cover"
          onError={() => setLogoError(true)}
        />
      ) : (
        fallbackLogo
      )}
    </div>
  );
}
