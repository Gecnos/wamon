import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 20, children, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}

export const ArrowRight = (p: IconProps) => <Icon {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Icon>;
export const ArrowLeft = (p: IconProps) => <Icon {...p}><path d="M19 12H5M11 18l-6-6 6-6" /></Icon>;
export const Check = (p: IconProps) => <Icon {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></Icon>;
export const Drop = (p: IconProps) => <Icon {...p}><path d="M12 3.5s6 6.4 6 10.5a6 6 0 0 1-12 0c0-4.1 6-10.5 6-10.5Z" /></Icon>;
export const Play = (p: IconProps) => <Icon {...p}><path d="M7 5v14l12-7Z" fill="currentColor" /></Icon>;
export const Pause = (p: IconProps) => <Icon {...p}><path d="M8 5v14M16 5v14" strokeWidth={3} /></Icon>;
export const Undo = (p: IconProps) => <Icon {...p}><path d="M9 14 4 9l5-5" /><path d="M4 9h10a6 6 0 0 1 0 12h-3" /></Icon>;
export const Reset = (p: IconProps) => <Icon {...p}><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></Icon>;
export const Projector = (p: IconProps) => <Icon {...p}><rect x="2" y="7" width="20" height="10" rx="2" /><circle cx="15" cy="12" r="2.5" /><path d="M6 17v2M18 17v2" /></Icon>;
export const Menu = (p: IconProps) => <Icon {...p}><path d="M4 7h16M4 12h16M4 17h16" /></Icon>;
export const Close = (p: IconProps) => <Icon {...p}><path d="M6 6l12 12M18 6 6 18" /></Icon>;
export const Dice = (p: IconProps) => <Icon {...p}><rect x="4" y="4" width="16" height="16" rx="3" /><circle cx="9" cy="9" r="1" fill="currentColor" /><circle cx="15" cy="15" r="1" fill="currentColor" /><circle cx="15" cy="9" r="1" fill="currentColor" /><circle cx="9" cy="15" r="1" fill="currentColor" /></Icon>;
export const Users = (p: IconProps) => <Icon {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18.5 20a6.5 6.5 0 0 0-2.5-5.1" /></Icon>;
export const Eye = (p: IconProps) => <Icon {...p}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></Icon>;
export const Plus = (p: IconProps) => <Icon {...p}><path d="M12 5v14M5 12h14" /></Icon>;
export const Minus = (p: IconProps) => <Icon {...p}><path d="M5 12h14" /></Icon>;
export const Flask = (p: IconProps) => <Icon {...p}><path d="M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3" /><path d="M7 15h10" /></Icon>;
export const Board = (p: IconProps) => <Icon {...p}><rect x="3" y="4" width="18" height="12" rx="1.5" /><path d="M12 16v4M8 20h8" /></Icon>;
export const Pin = (p: IconProps) => <Icon {...p}><path d="M12 21s-6-5.7-6-11a6 6 0 0 1 12 0c0 5.3-6 11-6 11Z" /><circle cx="12" cy="10" r="2" /></Icon>;
export const Trash = (p: IconProps) => <Icon {...p}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></Icon>;
export const Expand = (p: IconProps) => <Icon {...p}><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></Icon>;
export const Book = (p: IconProps) => <Icon {...p}><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H19v15H6a2 2 0 0 0-2 2V5.5Z" /><path d="M8 8h7M8 12h5" /></Icon>;
export const Beaker = (p: IconProps) => <Icon {...p}><path d="M6 3h12M8 3v16a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V3" /><path d="M8 11h8M8 15h3" /></Icon>;
export const Mail = (p: IconProps) => <Icon {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 7 8.5 6 8.5-6" /></Icon>;
