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
    renderView?: (props: unknown) => React.ReactElement;
    renderTrackHorizontal?: (props: unknown) => React.ReactElement;
    renderTrackVertical?: (props: unknown) => React.ReactElement;
    renderThumbHorizontal?: (props: unknown) => React.ReactElement;
    renderThumbVertical?: (props: unknown) => React.ReactElement;
    onScroll?: (event: Event) => void;
    onScrollFrame?: (values: unknown) => void;
    onScrollStart?: () => void;
    onScrollStop?: () => void;
    onUpdate?: (values: unknown) => void;
    children?: React.ReactNode;
  }

  export class Scrollbars extends Component<ScrollbarsProps> {}
}
