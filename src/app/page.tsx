import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import Providers from "../components/landing/Providers";
import WhyAIStock from "../components/landing/WhyAIStock";
import CTA from "../components/landing/CTA";
import Footer from "../components/landing/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#090b0f] text-white">

      <Navbar />

      <Hero />

      {/* About */}
      <section
        id="about"
        className="border-t border-white/[0.06] px-6 py-28 lg:px-8"
      >
        <div className="mx-auto max-w-5xl text-center">

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff4d61]">
            The Platform
          </p>

          <h2 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">
            Everything you need to
            <br />
            understand a stock.
          </h2>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-500">
            From price movements and technical indicators
            to AI-assisted analysis, AI Stock brings the
            important pieces together in one focused
            workspace.
          </p>

        </div>
      </section>

      <Features />

      <Providers />

      <WhyAIStock />

      <CTA />

      <Footer />

    </main>
  );
}