export const LogoMark = ({ size = 36, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M24 10 L48 22 V42 L24 54 L0 42 V22 Z"
      transform="translate(8 0)"
      stroke="#2563EB"
      strokeWidth="3.4"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M22 20 L32 44 L42 20"
      transform="translate(0 -1)"
      stroke="#FFFFFF"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <circle cx="45" cy="19" r="3.4" fill="#60A5FA" />
  </svg>
);

export const Logo = ({ dark = false, size = 36 }) => (
  <span className="inline-flex items-center gap-2.5 select-none">
    <LogoMark size={size} />
    <span
      className={`font-display font-extrabold tracking-tight ${dark ? "text-slate-900" : "text-white"}`}
      style={{ fontSize: size * 0.62 }}
    >
      Vidhya<span className="text-brand-light">setu</span>
    </span>
  </span>
);

export default Logo;
