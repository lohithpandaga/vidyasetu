import { useEffect } from "react";
import Lenis from "lenis";
import Nav from "@/components/landing/Nav";
import Hero from "@/components/landing/Hero";
import Marquee from "@/components/landing/Marquee";
import Stats from "@/components/landing/Stats";
import Bento from "@/components/landing/Bento";
import Courses from "@/components/landing/Courses";
import Testimonials from "@/components/landing/Testimonials";
import Footer from "@/components/landing/Footer";

export default function Landing() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    let raf;
    const loop = (t) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (a) {
        e.preventDefault();
        lenis.scrollTo(a.getAttribute("href"), { offset: -80 });
      }
    };
    document.addEventListener("click", onClick);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      document.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <div className="noise relative bg-brand-ink text-white overflow-x-clip">
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Stats />
        <Bento />
        <Courses />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
