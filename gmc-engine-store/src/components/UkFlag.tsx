export default function UkFlag({ className = "w-6 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 40" className={className} aria-hidden="true">
      <clipPath id="uk-r">
        <rect width="60" height="40" rx="3" />
      </clipPath>
      <g clipPath="url(#uk-r)">
        <rect width="60" height="40" fill="#012169" />
        <path d="M0,0 60,40 M60,0 0,40" stroke="#fff" strokeWidth="8" />
        <path d="M0,0 60,40 M60,0 0,40" stroke="#C8102E" strokeWidth="4" />
        <path d="M30,0 V40 M0,20 H60" stroke="#fff" strokeWidth="13" />
        <path d="M30,0 V40 M0,20 H60" stroke="#C8102E" strokeWidth="7" />
      </g>
    </svg>
  );
}
