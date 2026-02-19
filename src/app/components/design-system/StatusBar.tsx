import { Wifi, Battery, Signal } from "lucide-react";

export function StatusBar() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const timeString = `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')}`;

  return (
    <div className="absolute top-0 left-0 right-0 h-[59px] px-6 flex items-center justify-between text-gray-900 z-50">
      <span className="text-sm font-semibold">{timeString}</span>
      <div className="flex items-center gap-1">
        <Signal className="w-4 h-4" />
        <Wifi className="w-4 h-4" />
        <Battery className="w-5 h-5" />
      </div>
    </div>
  );
}
