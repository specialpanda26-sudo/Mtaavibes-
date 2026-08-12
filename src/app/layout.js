import "./globals.css";
import FloatingBrands from "@/components/FloatingBrands";
import BottomNav from "@/components/BottomNav";
import AnimatedLogo from "@/components/AnimatedLogo";
import CursorGlow from "@/components/CursorGlow";

export const metadata = {
  title: "Mtaa Vibes",
  description:
    "Kenyan events, zero stress. Fashion shows, dressing competitions, dance events, campus nights & club events.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="relative min-h-screen font-sans text-ink">
        <CursorGlow />
        <FloatingBrands />
        <AnimatedLogo />
        <div className="relative z-10 pb-24">{children}</div>
        <BottomNav />
      </body>
    </html>
  );
}
