interface AvatarBubbleProps {
  imageUrl?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AvatarBubble({ imageUrl, name = "User", size = 'md' }: AvatarBubbleProps) {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-20 h-20'
  };

  return (
    <div 
      className={`
        ${sizeClasses[size]} rounded-full overflow-hidden
        border-2 border-transparent bg-gradient-to-br from-[#6E4AE0] to-[#E879F9]
        p-0.5
      `}
    >
      <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-violet-200 to-purple-200 flex items-center justify-center text-violet-700 font-semibold">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}
