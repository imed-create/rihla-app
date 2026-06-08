declare module 'react-native-svg' {
  import { Component } from 'react';
  import { ViewProps } from 'react-native';

  export interface SvgProps extends ViewProps {
    width?: number | string;
    height?: number | string;
    viewBox?: string;
    fill?: string;
    stroke?: string;
  }

  export class Svg extends Component<SvgProps> {}
  export class Path extends Component<any> {}
  export class Circle extends Component<any> {}
  export class Rect extends Component<any> {}
  export class G extends Component<any> {}
  export class Ellipse extends Component<any> {}
  export class Line extends Component<any> {}
  export class Polygon extends Component<any> {}
  export class Polyline extends Component<any> {}
  export class Text extends Component<any> {}
  export class TSpan extends Component<any> {}
  export class Defs extends Component<any> {}
  export class LinearGradient extends Component<any> {}
  export class Stop extends Component<any> {}
  export default Svg;
}
