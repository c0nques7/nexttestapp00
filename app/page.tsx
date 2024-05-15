import AcmeLogo from '@/app/ui/acme-logo';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="flex h-20 shrink-0 items-center justify-center rounded-lg bg-blue-500 p-4 mb-8 w-full">
        <AcmeLogo />
      </div>

      <div className="flex flex-col items-center justify-center gap-6 rounded-lg bg-gray-50 px-6 py-10 w-full"> {/* Center content */}
        <p className={`text-xl text-center text-gray-800 md:text-3xl md:leading-normal`}>
          <strong>Welcome to AcmeYourPage.</strong><br />
          This is the example for the
          YourPage prototype.
          Hosting and NextJS is powered
          by Vercel.
        </p>
        <Link
          href="ui/login"
          className="flex items-center gap-5 self-center rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base"
        >
          <span>Log in</span> <ArrowRightIcon className="w-5 md:w-6" />
        </Link>
      </div>

      {/* Image section (hidden on small screens) */}
      <div className="hidden md:flex items-center justify-center p-6 w-full">
        {/* Add Hero Images Here */}
      </div>
    </main>
  );
}