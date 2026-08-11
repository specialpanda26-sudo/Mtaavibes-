import "./globals.css";
import FloatingBrands from "@/components/FloatingBrands";
import BottomNav from "@/components/BottomNav";
import AnimatedLogo from "@/components/AnimatedLogo";

export const metadata = {
  title: "Mtaa Vibes",
  description:
    "Kenyan events, zero stress. Fashion shows, dressing competitions, dance events, campus nights & club events — pay with M-Pesa, get instant QR tickets.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="relative min-h-screen font-sans text-ink">
        <FloatingBrands />
        <AnimatedLogo />
        <div className="relative z-10 pb-24">{children}</div>
        <BottomNav />
      </body>
    </html>
  );
}
