export function FloatingNodes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating network nodes */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-purple-400/30 rounded-full animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        />
      ))}
      
      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full opacity-10">
        <line x1="10%" y1="20%" x2="30%" y2="40%" stroke="url(#gradient1)" strokeWidth="1" />
        <line x1="30%" y1="40%" x2="60%" y2="30%" stroke="url(#gradient1)" strokeWidth="1" />
        <line x1="60%" y1="30%" x2="80%" y2="50%" stroke="url(#gradient1)" strokeWidth="1" />
        <line x1="20%" y1="70%" x2="50%" y2="80%" stroke="url(#gradient1)" strokeWidth="1" />
        <line x1="70%" y1="20%" x2="90%" y2="60%" stroke="url(#gradient1)" strokeWidth="1" />
        
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
