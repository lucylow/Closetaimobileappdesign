import { ChevronRight } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
}

export function SectionHeader({ title, onSeeAll }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      {onSeeAll && (
        <button 
          onClick={onSeeAll}
          className="flex items-center gap-1 text-[#00C9B7] font-semibold text-sm hover:gap-2 transition-all"
        >
          See all
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
