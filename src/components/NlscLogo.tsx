type Props = { className?: string; withBg?: boolean };

export function NlscLogo({ className, withBg = true }: Props) {
  return (
    <svg
      viewBox="0 0 680 680"
      role="img"
      aria-label="NLSC logo"
      className={className}
    >
      {withBg && <rect width="680" height="680" rx="120" fill="#080808" />}
      <path
        fill="none"
        stroke="#5a9e82"
        strokeWidth="40"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M 185 220 C 185 220, 185 370, 340 370 C 495 370, 495 480, 495 480"
      />
      <path
        fill="none"
        stroke="#5a9e82"
        strokeWidth="40"
        strokeLinecap="round"
        d="M 495 220 C 495 220, 495 370, 340 370 C 185 370, 185 480, 185 480"
      />
      <circle fill="#5a9e82" cx="340" cy="530" r="26" />
    </svg>
  );
}
