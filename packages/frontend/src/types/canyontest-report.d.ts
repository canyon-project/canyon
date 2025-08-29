declare module 'canyon-report';

declare module 'react-custom-scrollbars' {
  import { Component } from 'react';
  
  export interface ScrollbarsProps {
    style?: React.CSSProperties;
    autoHide?: boolean;
    autoHideTimeout?: number;
    autoHideDuration?: number;
    thumbSize?: number;
    thumbMinSize?: number;
    universal?: boolean;
    autoHeight?: boolean;
    autoHeightMin?: number;
    autoHeightMax?: number | string;
    hideTracksWhenNotNeeded?: boolean;
    renderView?: (props: any) => React.ReactElement;
    renderTrackHorizontal?: (props: any) => React.ReactElement;
    renderTrackVertical?: (props: any) => React.ReactElement;
    renderThumbHorizontal?: (props: any) => React.ReactElement;
    renderThumbVertical?: (props: any) => React.ReactElement;
    onScroll?: (event: Event) => void;
    onScrollFrame?: (values: any) => void;
    onScrollStart?: () => void;
    onScrollStop?: () => void;
    onUpdate?: (values: any) => void;
    children?: React.ReactNode;
  }
  
  export class Scrollbars extends Component<ScrollbarsProps> {}
}
