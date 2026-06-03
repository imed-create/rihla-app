import React, { memo } from 'react';
import Svg, { Circle, Ellipse, Line, Path, Rect } from 'react-native-svg';
import type { BeachAssetKind } from '@/constants/beachLayout';

type IconProps = { size?: number; color?: string };

export const MiniUmbrella = memo(({ size = 28, color = '#64748B' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 32 32">
    <Path d="M16 6 C8 6 6 14 6 14 L26 14 C26 14 24 6 16 6 Z" fill={color} opacity={0.9} />
    <Line x1="16" y1="14" x2="16" y2="26" stroke={color} strokeWidth={2} />
    <Ellipse cx="16" cy="27" rx="4" ry="1.2" fill={color} opacity={0.35} />
  </Svg>
));

export const MiniLounger = memo(({ size = 28, color = '#64748B' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 32 32">
    <Rect x="6" y="14" width="20" height="4" rx="2" fill={color} opacity={0.85} />
    <Path d="M8 18 L6 24 L10 24 Z" fill={color} opacity={0.7} />
    <Rect x="20" y="10" width="4" height="10" rx="1" fill={color} opacity={0.5} />
  </Svg>
));

export const MiniTable = memo(({ size = 28, color = '#64748B' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 32 32">
    <Ellipse cx="16" cy="12" rx="10" ry="4" fill={color} opacity={0.85} />
    <Line x1="10" y1="14" x2="9" y2="24" stroke={color} strokeWidth={2} />
    <Line x1="22" y1="14" x2="23" y2="24" stroke={color} strokeWidth={2} />
  </Svg>
));

export const MiniJetSki = memo(({ size = 32, color = '#0a2540' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 40 40">
    <Path
      d="M8 26 Q20 18 32 26 L30 30 L10 30 Z"
      fill={color}
      opacity={0.85}
    />
    <Path d="M14 20 L18 12 L22 20 Z" fill={color} />
    <Circle cx="12" cy="28" r="2" fill="#334155" />
    <Circle cx="28" cy="28" r="2" fill="#334155" />
  </Svg>
));

export const MiniPedalo = memo(({ size = 32, color = '#48CAE4' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 40 40">
    <Ellipse cx="20" cy="24" rx="14" ry="6" fill={color} opacity={0.8} />
    <Circle cx="12" cy="28" r="2.5" fill="#334155" />
    <Circle cx="28" cy="28" r="2.5" fill="#334155" />
    <Path d="M18 14 L20 8 L22 14" stroke={color} strokeWidth={2} fill="none" />
  </Svg>
));

export const MiniVolleyballCourt = memo(({ size = 36, color = '#20C997' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 44 44">
    <Rect x="4" y="10" width="36" height="24" rx="2" fill="none" stroke={color} strokeWidth={2} />
    <Line x1="22" y1="10" x2="22" y2="34" stroke={color} strokeWidth={1.5} opacity={0.6} />
    <Circle cx="22" cy="22" r="5" fill="none" stroke={color} strokeWidth={1.5} />
  </Svg>
));

export const MiniCabana = memo(({ size = 30, color = '#845EC2' }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 32 32">
    <Path d="M4 18 L16 8 L28 18 Z" fill={color} opacity={0.75} />
    <Rect x="8" y="18" width="16" height="10" fill={color} opacity={0.45} />
    <Rect x="14" y="22" width="4" height="6" fill="#fff" opacity={0.5} />
  </Svg>
));

export function BeachAssetIcon({
  kind,
  size,
  color,
}: {
  kind: BeachAssetKind;
  size?: number;
  color?: string;
}) {
  if (kind === 'lounger') return <MiniLounger size={size} color={color} />;
  if (kind === 'table') return <MiniTable size={size} color={color} />;
  return <MiniUmbrella size={size} color={color} />;
}

MiniUmbrella.displayName = 'MiniUmbrella';
MiniLounger.displayName = 'MiniLounger';
MiniTable.displayName = 'MiniTable';
