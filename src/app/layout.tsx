import type { Metadata } from "next";
import "./globals.css";
import { FaWhatsapp } from "react-icons/fa";
import { SiGmail } from "react-icons/si";

export const metadata: Metadata = {
  title: "Nivase's Portfolio",
  description: "Explore Nivase's Portfolio - Software Engineer & Developer",
  icons:"/favicon.ico",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="relative">
        {/* Floating WhatsApp + Gmail Row */}
        <div className="absolute top-6 right-6 flex items-center gap-4 z-[200000]">
          {/* WhatsApp */}
          <a
            href="https://wa.me/917010477407?text=Hello%20Nivas%2C%20I%20visited%20your%20portfolio%20and%20would%20like%20to%20connect."
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-full bg-green-500 shadow-md hover:shadow-lg
              transform hover:-translate-y-1 transition-all duration-300 ease-out"
            title="Chat on WhatsApp"
          >
            <FaWhatsapp className="w-7 h-7 text-white" />
          </a>

          {/* Gmail */}
          <a
            href="mailto:nivashrajar@gmail.com?subject=Portfolio%20Contact&body=Hello%20Nivas%2C%20I%20saw%20your%20portfolio%20and%20want%20to%20get%20in%20touch."
            className="p-4 rounded-full bg-[#FF0000] shadow-md hover:shadow-lg
              transform hover:-translate-y-1 transition-all duration-300 ease-out"
            title="Send Email"
          >
            <SiGmail className="w-7 h-7 text-white" />
          </a>
        </div>

        {children}
      </body>
    </html>
  );
}
