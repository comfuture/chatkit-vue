export type ThemedColor = string | { dark: string; light: string };

export type WidgetTheme = 'light' | 'dark';

export type SizeToken =
  | '2xs'
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | 'full'
  | '100%'
  | 'none';

export type SpacingPrimitive = number | string;
export type EdgeSpacing = Partial<
  Record<'top' | 'right' | 'bottom' | 'left' | 'x' | 'y', SpacingPrimitive>
>;
export type SpacingOption = SpacingPrimitive | EdgeSpacing;

export type FlexAlign =
  | 'start'
  | 'center'
  | 'end'
  | 'baseline'
  | 'stretch';
export type FlexJustify =
  | 'start'
  | 'center'
  | 'end'
  | 'stretch'
  | 'between'
  | 'around'
  | 'evenly';
export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';

export type BorderStyle =
  | 'solid'
  | 'dashed'
  | 'dotted'
  | 'double'
  | 'groove'
  | 'ridge'
  | 'inset'
  | 'outset';

export type BorderConfig =
  | number
  | {
      size: number;
      color?: ThemedColor;
      style?: BorderStyle;
    };

export type BorderOption = BorderConfig | Partial<Record<'top' | 'right' | 'bottom' | 'left' | 'x' | 'y', BorderConfig>>;

export interface StatusIndicator {
  text: string;
  icon?: string;
  favicon?: string;
}

export interface ActionConfig {
  type: string;
  payload?: Record<string, unknown>;
}

export interface WidgetBase {
  key?: string;
}

export interface Card extends WidgetBase {
  type: 'Card';
  children?: WidgetNode[];
  size?: 'sm' | 'md' | 'lg' | 'full';
  padding?: SpacingOption;
  background?: ThemedColor;
  status?: StatusIndicator;
  collapsed?: boolean;
  asForm?: boolean;
  confirm?: { label: string; action: ActionConfig };
  cancel?: { label: string; action: ActionConfig };
  theme?: WidgetTheme;
}

export interface ListView extends WidgetBase {
  type: 'ListView';
  children?: ListViewItem[];
  limit?: number | 'auto';
  status?: StatusIndicator;
  theme?: WidgetTheme;
}

export interface ListViewItem extends WidgetBase {
  type: 'ListViewItem';
  children?: WidgetNode[];
  onClickAction?: ActionConfig;
  gap?: SpacingPrimitive;
  align?: FlexAlign;
}

export interface Badge extends WidgetBase {
  type: 'Badge';
  label: string;
  color?:
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info'
    | 'discovery';
  variant?: 'solid' | 'soft' | 'outline';
  pill?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export interface Box extends WidgetBase {
  type: 'Box';
  children?: WidgetNode[];
  direction?: 'row' | 'column';
  align?: FlexAlign;
  justify?: FlexJustify;
  wrap?: FlexWrap;
  flex?: number | string;
  height?: number | string;
  width?: number | string;
  minHeight?: number | string;
  minWidth?: number | string;
  maxHeight?: number | string;
  maxWidth?: number | string;
  size?: number | string;
  minSize?: number | string;
  maxSize?: number | string;
  gap?: SpacingPrimitive;
  padding?: SpacingOption;
  margin?: SpacingOption;
  border?: BorderOption;
  radius?: SizeToken;
  background?: ThemedColor;
  aspectRatio?: number | string;
}

export interface Row extends WidgetBase {
  type: 'Row';
  children?: WidgetNode[];
  gap?: SpacingPrimitive;
  padding?: SpacingOption;
  align?: FlexAlign;
  justify?: FlexJustify;
  flex?: number | string;
  height?: number | string;
  width?: number | string;
  minHeight?: number | string;
  minWidth?: number | string;
  maxHeight?: number | string;
  maxWidth?: number | string;
  size?: number | string;
  minSize?: number | string;
  maxSize?: number | string;
  margin?: SpacingOption;
  border?: BorderOption;
  radius?: SizeToken;
  background?: ThemedColor;
  aspectRatio?: number | string;
}

export interface Col extends WidgetBase {
  type: 'Col';
  children?: WidgetNode[];
  gap?: SpacingPrimitive;
  padding?: SpacingOption;
  align?: FlexAlign;
  justify?: FlexJustify;
  wrap?: FlexWrap;
  flex?: number | string;
  height?: number | string;
  width?: number | string;
  minHeight?: number | string;
  minWidth?: number | string;
  maxHeight?: number | string;
  maxWidth?: number | string;
  size?: number | string;
  minSize?: number | string;
  maxSize?: number | string;
  margin?: SpacingOption;
  border?: BorderOption;
  radius?: SizeToken;
  background?: ThemedColor;
  aspectRatio?: number | string;
}

export interface Button extends WidgetBase {
  type: 'Button';
  submit?: boolean;
  style?: 'primary' | 'secondary';
  label: string;
  onClickAction: ActionConfig;
  iconStart?: string;
  iconEnd?: string;
  color?:
    | 'primary'
    | 'secondary'
    | 'info'
    | 'discovery'
    | 'success'
    | 'caution'
    | 'warning'
    | 'danger';
  variant?: 'solid' | 'soft' | 'outline' | 'ghost';
  size?:
    | '3xs'
    | '2xs'
    | 'xs'
    | 'sm'
    | 'md'
    | 'lg'
    | 'xl'
    | '2xl'
    | '3xl';
  pill?: boolean;
  block?: boolean;
  uniform?: boolean;
  iconSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export interface Caption extends WidgetBase {
  type: 'Caption';
  value: string;
  size?: 'sm' | 'md' | 'lg';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  textAlign?: 'start' | 'center' | 'end';
  color?: ThemedColor;
  truncate?: boolean;
  maxLines?: number;
}

export interface DatePicker extends WidgetBase {
  type: 'DatePicker';
  onChangeAction?: ActionConfig;
  name: string;
  min?: string;
  max?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  placeholder?: string;
  defaultValue?: string;
  variant?: 'solid' | 'soft' | 'outline' | 'ghost';
  size?:
    | '3xs'
    | '2xs'
    | 'xs'
    | 'sm'
    | 'md'
    | 'lg'
    | 'xl'
    | '2xl'
    | '3xl';
  pill?: boolean;
  block?: boolean;
  clearable?: boolean;
  disabled?: boolean;
}

export interface Divider extends WidgetBase {
  type: 'Divider';
  spacing?: SpacingPrimitive;
  color?: ThemedColor;
  size?: number | string;
  flush?: boolean;
}

export interface Icon extends WidgetBase {
  type: 'Icon';
  name: string;
  color?: ThemedColor;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export interface Image extends WidgetBase {
  type: 'Image';
  src: string;
  alt?: string;
  size?: number | string;
  height?: number | string;
  width?: number | string;
  minHeight?: number | string;
  minWidth?: number | string;
  maxHeight?: number | string;
  maxWidth?: number | string;
  minSize?: number | string;
  maxSize?: number | string;
  radius?: SizeToken;
  background?: ThemedColor;
  margin?: SpacingOption;
  aspectRatio?: number | string;
  flex?: number | string;
  fit?: 'none' | 'cover' | 'contain' | 'fill' | 'scale-down';
  position?:
    | 'center'
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'top left'
    | 'top right'
    | 'bottom left'
    | 'bottom right';
  frame?: boolean;
  flush?: boolean;
}

export interface Markdown extends WidgetBase {
  type: 'Markdown';
  value: string;
  streaming?: boolean;
}

export interface Select extends WidgetBase {
  type: 'Select';
  options: Array<{ label: string; value: string }>;
  onChangeAction?: ActionConfig;
  name: string;
  placeholder?: string;
  defaultValue?: string;
  variant?: 'solid' | 'soft' | 'outline' | 'ghost';
  size?:
    | '3xs'
    | '2xs'
    | 'xs'
    | 'sm'
    | 'md'
    | 'lg'
    | 'xl'
    | '2xl'
    | '3xl';
  pill?: boolean;
  block?: boolean;
  clearable?: boolean;
  disabled?: boolean;
}

export interface Spacer extends WidgetBase {
  type: 'Spacer';
  minSize?: number | string;
}

export interface Text extends WidgetBase {
  type: 'Text';
  value: string;
  color?: ThemedColor;
  width?: number | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  textAlign?: 'start' | 'center' | 'end';
  italic?: boolean;
  lineThrough?: boolean;
  truncate?: boolean;
  minLines?: number;
  maxLines?: number;
  streaming?: boolean;
  editable?:
    | boolean
    | {
        name: string;
        autoComplete?: string;
        autoFocus?: boolean;
        autoSelect?: boolean;
        allowAutofillExtensions?: boolean;
        required?: boolean;
        placeholder?: string;
        pattern?: string;
      };
}

export interface Title extends WidgetBase {
  type: 'Title';
  value: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  textAlign?: 'start' | 'center' | 'end';
  color?: ThemedColor;
  truncate?: boolean;
  maxLines?: number;
}

export interface Form extends WidgetBase {
  type: 'Form';
  onSubmitAction: ActionConfig;
  children?: WidgetNode[];
  align?: FlexAlign;
  justify?: FlexJustify;
  flex?: number | string;
  gap?: SpacingPrimitive;
  height?: number | string;
  width?: number | string;
  minHeight?: number | string;
  minWidth?: number | string;
  maxHeight?: number | string;
  maxWidth?: number | string;
  size?: number | string;
  minSize?: number | string;
  maxSize?: number | string;
  padding?: SpacingOption;
  margin?: SpacingOption;
  border?: BorderOption;
  radius?: SizeToken;
  background?: ThemedColor;
}

export interface Transition extends WidgetBase {
  type: 'Transition';
  children?: WidgetNode;
}

export type WidgetRoot = Card | ListView;

export type WidgetNode =
  | Card
  | Badge
  | Box
  | Row
  | Col
  | Button
  | Caption
  | DatePicker
  | Divider
  | Icon
  | Image
  | Markdown
  | Select
  | Spacer
  | Text
  | Title
  | Form
  | Transition
  | ListView
  | ListViewItem;
