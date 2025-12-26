import Link from "next/link"

export function Logo({ size = "default" }) {
  const sizeClasses = {
    small: "text-lg",
    default: "text-2xl",
    large: "text-3xl",
  }

  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg blur opacity-75 animate-pulse"></div>
        <div className="relative bg-white dark:bg-gray-900 rounded-lg p-1 flex items-center justify-center">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
              fill="url(#gradient)"
            />
            <path d="M12 17L12 11" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="8" r="1" fill="url(#gradient)" />
            <defs>
              <linearGradient id="gradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#14b8a6" />
                <stop offset="1" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
      <span
        className={`font-bold ${sizeClasses[size]} bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-cyan-500`}
      >
        QuizGenius
      </span>
    </Link>
  )
}
