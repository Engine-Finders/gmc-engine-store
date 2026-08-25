// Stylised British-Isles map with a radar location pin, used as its own column in
// the Warranty & Delivery section. Swap for a real map asset by passing `src`.
export default function UkMap({ className = "", src }: { className?: string; src?: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="UK delivery coverage" className={className} />;
  }
  return (
    <svg viewBox="0 0 220 280" className={className} fill="none" aria-hidden="true">
      {/* Great Britain */}
      <path
        d="M110 20 L150 22 C162 40 168 55 165 70 C158 82 148 88 150 95 C158 105 165 112 168 120
           C178 140 188 160 185 175 C176 180 168 182 170 190 C185 195 202 195 205 205
           C200 215 190 220 185 225 C192 230 195 234 192 238 C180 242 165 244 150 245
           C130 250 120 250 110 250 C90 254 72 256 60 258 C66 246 84 244 95 240
           C104 236 108 234 110 232 C98 236 84 238 78 235 C70 232 62 232 65 228
           C74 220 82 216 85 210 C76 202 70 196 72 190 C82 184 90 182 95 180
           C102 168 106 158 105 150 C98 142 88 138 95 135 C86 130 78 128 80 125
           C88 118 92 114 95 110 C88 100 82 92 85 85 C94 76 98 72 100 70
           C92 60 86 54 90 50 C96 40 104 30 110 20 Z"
        fill="#b9d0f0"
        fillOpacity="0.55"
        stroke="#6f9fdd"
        strokeOpacity="0.5"
        strokeWidth="1.4"
      />
      {/* Ireland */}
      <path
        d="M20 155 C38 148 48 162 46 180 C56 188 56 208 44 216 C46 230 32 236 20 228
           C8 232 2 214 10 202 C0 194 2 174 14 168 C16 160 18 156 20 155 Z"
        fill="#b9d0f0"
        fillOpacity="0.4"
        stroke="#6f9fdd"
        strokeOpacity="0.4"
        strokeWidth="1.4"
      />
      {/* radar rings + pin over central England */}
      <g stroke="#2563eb" fill="none">
        <circle cx="150" cy="196" r="20" strokeOpacity="0.35" strokeWidth="1.4" />
        <circle cx="150" cy="196" r="36" strokeOpacity="0.2" strokeWidth="1.4" />
        <circle cx="150" cy="196" r="54" strokeOpacity="0.1" strokeWidth="1.4" />
      </g>
      <g transform="translate(150 178)">
        <path d="M0 40 C-9 21 -15 14 -15 1 A15 15 0 1 1 15 1 C15 14 9 21 0 40 Z" fill="#2563eb" />
        <circle cx="0" cy="1" r="5.5" fill="#fff" />
      </g>
    </svg>
  );
}
