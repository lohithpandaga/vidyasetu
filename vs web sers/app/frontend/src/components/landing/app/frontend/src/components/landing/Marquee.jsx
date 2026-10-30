import MarqueeBase from "react-fast-marquee";

const items = ["JEE MAIN", "JEE ADVANCED", "NEET UG", "CBSE BOARDS", "CUET", "OLYMPIADS", "BITSAT"];

export default function Marquee() {
  return (
    <section className="py-10 border-y border-white/[0.07] overflow-hidden" aria-label="Exams covered" data-testid="exam-marquee">
      <MarqueeBase speed={42} gradient={false} direction="left">
        <div className="flex items-center">
          {items.map((item) => (
            <span key={item} className="flex items-center whitespace-nowrap">
              <span className="font-display font-extrabold text-4xl sm:text-6xl tracking-tight text-outline px-8">
                {item}
              </span>
              <span className="w-2 h-2 rounded-full bg-brand" />
            </span>
          ))}
        </div>
      </MarqueeBase>
    </section>
  );
}
