"use client";
import AcmeLogo from '@/app/ui/acme-logo';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
import { useState, useEffect } from 'react';

export default function Page() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = ['/background00.jpg', '/background01.jpg', '/background02.jpg'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); 

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <main className={`${styles.main} flex min-h-screen flex-col items-center justify-center`}>
      <Image
        src={images[currentImageIndex]}
        layout="fill"
        objectFit="cover"
        alt="Background Image"
      />
      <div className="flex h-20 shrink-0 items-center justify-center rounded-lg bg-blue-500 p-4 mb-8 w-full z-10">
        <AcmeLogo />
      </div>

      <div className="flex flex-col items-center justify-center gap-6 rounded-lg bg-gray-50 px-6 py-10 w-full z-10">
        {/* ... (Welcome text) ... */}

        {/* Button Group */}
        <div className="flex gap-4"> 
          <Link
            href="ui/login"
            className="flex items-center gap-5 self-center rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base"
          >
            <span>Log in</span> <ArrowRightIcon className="w-5 md:w-6" />
          </Link>

          {/* New Subreddits Button */}
          <Link
            href="ui/home"
            className="flex items-center gap-5 self-center rounded-lg bg-gray-300 px-6 py-3 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-400 md:text-base"
          >
            <span>Default Subreddits</span>
          </Link>
        </div> 
      </div>
    </main>
  );
}
