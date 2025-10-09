import type { CSSProperties } from 'vue';

import type {
  BorderConfig,
  BorderOption,
  SpacingOption,
  ThemedColor,
  WidgetTheme,
  SizeToken
} from './types';

const radiusMap: Record<SizeToken, string> = {
  '2xs': '4px',
  xs: '6px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '28px',
  '4xl': '32px',
  full: '9999px',
  '100%': '100%',
  none: '0px'
};

export const resolveColor = (
  color: ThemedColor | undefined,
  theme: WidgetTheme = 'light'
): string | undefined => {
  if (!color) return undefined;
  if (typeof color === 'string') return color;
  return theme === 'dark' ? color.dark : color.light;
};

const toCssValue = (value: number | string | undefined): string | undefined => {
  if (value === undefined) return undefined;
  if (typeof value === 'number') {
    return Number.isFinite(value) ? `${value}px` : String(value);
  }
  return value;
};

const assignStyle = (
  style: CSSProperties,
  key: string,
  value: string | number | undefined
) => {
  if (value === undefined) return;
  (style as Record<string, string | number>)[key] = value;
};

const applyEdgeSpacing = (
  style: CSSProperties,
  prefix: 'padding' | 'margin',
  spacing: SpacingOption
) => {
  if (spacing == null) return;
  if (typeof spacing === 'number' || typeof spacing === 'string') {
    assignStyle(style, prefix, toCssValue(spacing));
    return;
  }
  for (const [key, val] of Object.entries(spacing)) {
    if (val == null) continue;
    switch (key) {
      case 'x': {
        const value = toCssValue(val);
        assignStyle(style, `${prefix}Left`, value);
        assignStyle(style, `${prefix}Right`, value);
        break;
      }
      case 'y': {
        const value = toCssValue(val);
        assignStyle(style, `${prefix}Top`, value);
        assignStyle(style, `${prefix}Bottom`, value);
        break;
      }
      case 'top':
      case 'right':
      case 'bottom':
      case 'left': {
        const value = toCssValue(val);
        assignStyle(style, `${prefix}${key.charAt(0).toUpperCase()}${key.slice(1)}`, value);
        break;
      }
      default:
        break;
    }
  }
};

const resolveBorderConfig = (
  value: BorderConfig,
  theme: WidgetTheme
): { size: number; color?: string; style?: string } | null => {
  if (typeof value === 'number') {
    return { size: value, style: 'solid' };
  }
  if (typeof value === 'object' && value) {
    return {
      size: value.size,
      color: resolveColor(value.color, theme),
      style: value.style ?? 'solid'
    };
  }
  return null;
};

const applyBorder = (
  style: CSSProperties,
  border: BorderOption | undefined,
  theme: WidgetTheme
) => {
  if (!border) return;
  if (
    typeof border === 'number' ||
    ('size' in border && typeof (border as any).size === 'number')
  ) {
    const resolved = resolveBorderConfig(border as BorderConfig, theme);
    if (!resolved) return;
    assignStyle(style, 'borderWidth', toCssValue(resolved.size));
    assignStyle(style, 'borderStyle', resolved.style ?? 'solid');
    if (resolved.color) {
      assignStyle(style, 'borderColor', resolved.color);
    }
    return;
  }

  for (const [edge, value] of Object.entries(border)) {
    if (!value) continue;
    const resolved = resolveBorderConfig(value as BorderConfig, theme);
    if (!resolved) continue;
    const cssValue = toCssValue(resolved.size);
    const color = resolved.color;
    const apply = (suffix: 'Top' | 'Right' | 'Bottom' | 'Left') => {
      assignStyle(style, `border${suffix}Width`, cssValue);
      assignStyle(style, `border${suffix}Style`, resolved.style ?? 'solid');
      if (color) {
        assignStyle(style, `border${suffix}Color`, color);
      }
    };

    if (edge === 'x') {
      apply('Left');
      apply('Right');
      continue;
    }
    if (edge === 'y') {
      apply('Top');
      apply('Bottom');
      continue;
    }

    switch (edge) {
      case 'top':
        apply('Top');
        break;
      case 'right':
        apply('Right');
        break;
      case 'bottom':
        apply('Bottom');
        break;
      case 'left':
        apply('Left');
        break;
      default:
        break;
    }
  }
};

export const applyRadius = (
  style: CSSProperties,
  radius: SizeToken | undefined
) => {
  if (!radius) return;
  style.borderRadius = radiusMap[radius] ?? radius;
};

export const buildBoxStyles = (
  node: {
    padding?: SpacingOption;
    margin?: SpacingOption;
    background?: ThemedColor;
    radius?: SizeToken;
    border?: BorderOption;
    height?: number | string;
    width?: number | string;
    minHeight?: number | string;
    minWidth?: number | string;
    maxHeight?: number | string;
    maxWidth?: number | string;
    flex?: number | string;
    size?: number | string;
    minSize?: number | string;
    maxSize?: number | string;
    gap?: number | string;
    aspectRatio?: number | string;
  },
  theme: WidgetTheme = 'light'
): CSSProperties => {
  const style: CSSProperties = {};

  if (node.padding) applyEdgeSpacing(style, 'padding', node.padding);
  if (node.margin) applyEdgeSpacing(style, 'margin', node.margin);
  if (node.background) {
    style.backgroundColor = resolveColor(node.background, theme);
  }
  if (node.radius) applyRadius(style, node.radius);
  if (node.border) applyBorder(style, node.border, theme);

  if (node.height !== undefined) style.height = toCssValue(node.height);
  if (node.width !== undefined) style.width = toCssValue(node.width);
  if (node.minHeight !== undefined)
    style.minHeight = toCssValue(node.minHeight);
  if (node.minWidth !== undefined) style.minWidth = toCssValue(node.minWidth);
  if (node.maxHeight !== undefined)
    style.maxHeight = toCssValue(node.maxHeight);
  if (node.maxWidth !== undefined) style.maxWidth = toCssValue(node.maxWidth);

  if (node.size !== undefined) {
    const value = toCssValue(node.size);
    style.width = value;
    style.height = value;
  }

  if (node.minSize !== undefined) {
    const value = toCssValue(node.minSize);
    style.minWidth = value;
    style.minHeight = value;
  }

  if (node.maxSize !== undefined) {
    const value = toCssValue(node.maxSize);
    style.maxWidth = value;
    style.maxHeight = value;
  }

  if (node.flex !== undefined) {
    style.flex = typeof node.flex === 'number' ? `${node.flex} 1 0` : node.flex;
  }

  if (node.gap !== undefined) {
    style.gap = toCssValue(node.gap) as any;
  }

  if (node.aspectRatio !== undefined) {
    style.aspectRatio =
      typeof node.aspectRatio === 'number'
        ? String(node.aspectRatio)
        : node.aspectRatio;
  }

  return style;
};
