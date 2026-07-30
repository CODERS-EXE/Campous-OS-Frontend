interface CampusLogoProps {
  className?: string;
  variant?: "default" | "icon" | "text";
  showText?: boolean;
}

export function CampusLogo({ 
  className = "", 
  variant = "default",
  showText = true 
}: CampusLogoProps) {
  if (variant === "icon") {
    return (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          <linearGradient id="campusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
        </defs>
        {/* Modern C shape with circuit-like design */}
        <path
          d="M24 4C13.5066 4 5 12.5066 5 23C5 33.4934 13.5066 42 24 42C28.4183 42 32.4649 40.4246 35.6066 37.7803"
          stroke="url(#campusGradient)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Inner accent lines */}
        <path
          d="M24 12C17.9249 12 13 16.9249 13 23C13 29.0751 17.9249 34 24 34"
          stroke="url(#campusGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.6"
        />
        {/* Connection dots */}
        <circle cx="38" cy="23" r="3" fill="#7C3AED" />
        <circle cx="24" cy="38" r="2.5" fill="#A855F7" opacity="0.8" />
        <circle cx="10" cy="23" r="2" fill="#7C3AED" opacity="0.6" />
      </svg>
    );
  }

  if (variant === "text") {
    return (
      <span className={`font-heading font-bold text-2xl gradient-text ${className}`}>
        CampusOS
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-10"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
        </defs>
        <path
          d="M24 4C13.5066 4 5 12.5066 5 23C5 33.4934 13.5066 42 24 42C28.4183 42 32.4649 40.4246 35.6066 37.7803"
          stroke="url(#logoGradient)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M24 12C17.9249 12 13 16.9249 13 23C13 29.0751 17.9249 34 24 34"
          stroke="url(#logoGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.6"
        />
        <circle cx="38" cy="23" r="3" fill="#7C3AED" />
        <circle cx="24" cy="38" r="2.5" fill="#A855F7" opacity="0.8" />
        <circle cx="10" cy="23" r="2" fill="#7C3AED" opacity="0.6" />
      </svg>
      {showText && (
        <span className="font-heading font-bold text-2xl gradient-text">
          CampusOS
        </span>
      )}
    </div>
  );
}
