"use client";
import Link from 'next/link';
import '@/app/styles/global.css';

export default function Page() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-#79966e">
            <div className="neumorphic flex flex-col items-center justify-center gap-6 rounded-xl bg-gray-50 px-6 py-10 w-full max-w-md z-10">
                <h1 className="text-3xl font-bold text-center w-full">Welcome to PeakeFeed</h1>

                <div className="flex gap-4 w-full justify-center"> 
                    <Link
                        href="./register"
                        className="neumorphic-button text-white bg-blue-500 hover:bg-blue-700 focus:ring-blue-300 active:shadow-inner active:bg-blue-800 w-full"
                    >
                        Register/Log In
                    </Link>
                </div>
            </div>
        </main>
    );
}