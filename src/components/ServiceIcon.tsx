import {
  Camera,
  Clapperboard,
  Film,
  Layers,
  PenTool,
  Scissors,
  Share2,
  Smartphone,
  Sparkles,
} from 'lucide-react';

interface ServiceIconProps {
  iconKey: string;
  className?: string;
}

export function ServiceIcon({ iconKey, className = 'w-5 h-5' }: ServiceIconProps) {
  switch (iconKey) {
    case 'smartphone':
      return <Smartphone className={className} strokeWidth={1.5} />;
    case 'camera':
      return <Camera className={className} strokeWidth={1.5} />;
    case 'scissors':
      return <Scissors className={className} strokeWidth={1.5} />;
    case 'layers':
      return <Layers className={className} strokeWidth={1.5} />;
    case 'share':
      return <Share2 className={className} strokeWidth={1.5} />;
    case 'clapperboard':
      return <Clapperboard className={className} strokeWidth={1.5} />;
    case 'pen':
      return <PenTool className={className} strokeWidth={1.5} />;
    case 'film':
      return <Film className={className} strokeWidth={1.5} />;
    case 'sparkles':
    default:
      return <Sparkles className={className} strokeWidth={1.5} />;
  }
}
