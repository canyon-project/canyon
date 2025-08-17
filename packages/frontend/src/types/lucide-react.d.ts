declare module 'lucide-react' {
  import * as React from 'react';
  export interface LucideProps extends React.SVGProps<SVGSVGElement> {
    size?: number | string;
    color?: string;
    absoluteStrokeWidth?: boolean;
  }
  export const Bot: React.FC<LucideProps>;
  export const ClipboardList: React.FC<LucideProps>;
}


