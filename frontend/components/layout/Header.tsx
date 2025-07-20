"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

const navLinks = [
    ["الرئيسية", "/"],
    ["من نحن", "#about"],
    ["المحامي الذكي", "#lawyer-ai"],
        ["المكتبة الذكية", "#library"],
    ["خدماتنا", "#services"],
    ["المدونة", "#blog"],
    ["أسعارنا", "#pricing"],
    ["تواصل معنا", "#contact"],
];

export default function Header() {
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav dir="rtl" className="backdrop-blur-2xl  fixed w-full z-20 top-0 start-0  ">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
                    <Image
                        src="/logo.png"
                        width={64}
                        height={32}
                        alt="Logo"
                        className="h-auto ml-8"
                    />
                    <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
                مكتب الشاوي للمحاماة
                    </span>
                </Link>

                <div className="flex md:order-2 space-x-3 rtl:space-x-reverse md:space-x-0">
                    <button onClick={()=>{
                        router.push('/auth');
                    }} className="text-white cursor-pointer bg-[#D4AF37] hover:bg-[#3a3421] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                        تسجيل الدخول
                    </button>
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        type="button"
                        className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                        aria-controls="navbar-sticky"
                        aria-expanded={menuOpen}
                    >
                        <span className="sr-only">افتح القائمة</span>
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>

                <div
                    className={`items-center justify-between w-full md:flex md:w-auto md:order-1 ${
                        menuOpen ? "block" : "hidden"
                    }`}
                    id="navbar-sticky"
                >
                   <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border  rounded-lg  md:flex-row md:gap-x-6 rtl:space-x-reverse md:mt-0 md:border-0  dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">

                        {navLinks.map(([label, href]) => (
                            <li key={href}>
                                <Link
                                    href={href}
                                    className="block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:hover:text-[#D4AF37] hover:fpnt-bold md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                                >
                                    {label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </nav>
    );
}
