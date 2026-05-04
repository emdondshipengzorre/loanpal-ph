interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 32, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="64" height="64" rx="16" fill="currentColor" className="text-primary" />
      <path
        d="M20 16V48H40C41.1 48 42 47.1 42 46C42 44.9 41.1 44 40 44H25V16C25 14.9 24.1 14 23 14H22C20.9 14 20 14.9 20 16Z"
        fill="white"
        fillOpacity="0.95"
      />
      <circle cx="43" cy="28" r="11" fill="white" fillOpacity="0.95" />
      <text
        x="43"
        y="33"
        textAnchor="middle"
        fontSize="16"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
        fill="currentColor"
        className="text-primary"
      >
        ₱
      </text>
    </svg>
  );
}
