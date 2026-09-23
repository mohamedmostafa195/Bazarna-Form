import type { Metadata } from "next";
import { Inter, Outfit, Bebas_Neue, Caveat } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ToastContainer } from "@/components/ToastContainer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BAZARNA POP-UP SOCIETY | Egypt's Leading Pop-Up Platform Since 2010",
  description:
    "Egypt's premier pop-up incubator and retail growth platform. Accelerating local homegrown brands through visibility, sales, and community.",
  keywords: [
    "Bazarna",
    "Bazarna Pop-Up Society",
    "Egyptian Brands",
    "Cairo Pop-up Market",
    "B.youth",
    "Premium Outlet",
    "Fashion Bazaar Egypt",
  ],
  icons: {
    icon: "/images/bazarna-symbol.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} ${bebas.variable} ${caveat.variable}`}
    >
      <body className="min-h-screen flex flex-col font-sans bg-[#FAF8F5] text-zinc-900 antialiased selection:bg-bazarna-red selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 w-full">{children}</main>
          <Footer />
          <ToastContainer />
        </AuthProvider>
      </body>
    </html>
  );
}
