<script lang="ts">
import { defineComponent, h } from 'vue';
import MarkdownIt from 'markdown-it';
import clsx from 'clsx';

import type {
  ActionConfig,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Icon,
  Image,
  ListView,
  ListViewItem,
  Markdown,
  Row,
  Select,
  Spacer,
  Text,
  Title,
  WidgetNode,
  WidgetRoot,
  WidgetTheme,
  Box,
  Divider,
  Caption,
  DatePicker
} from '@/widgets/types';
import { buildBoxStyles, resolveColor } from '@/widgets/utils';

type WidgetActionContext = {
  widgetId?: string;
  itemId?: string;
  node?: WidgetNode;
  value?: unknown;
};

const markdown = new MarkdownIt({
  linkify: true,
  breaks: true,
  html: false
});

const sizeClasses: Record<string, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
  '5xl': 'text-5xl'
};

const buttonVariants: Record<
  NonNullable<Button['variant']>,
  string
> = {
  solid: 'bg-primary text-primary-foreground hover:bg-primary/90',
  soft: 'bg-primary/10 text-primary hover:bg-primary/20',
  outline:
    'border border-input text-foreground hover:bg-muted hover:text-foreground',
  ghost: 'bg-transparent hover:bg-muted'
};

const toneColors: Record<string, string> = {
  primary: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  info: 'bg-sky-100 text-sky-700 dark:bg-sky-800/40 dark:text-sky-200',
  discovery: 'bg-purple-100 text-purple-700 dark:bg-purple-800/40 dark:text-purple-200',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-800/40 dark:text-emerald-200',
  caution: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-100',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-100',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200'
};

const badgeVariants: Record<
  NonNullable<Badge['variant']>,
  string
> = {
  solid: '',
  soft: 'bg-muted text-muted-foreground',
  outline: 'border border-border text-muted-foreground'
};

function renderMarkdown(value: string) {
  return h('div', {
    class: 'prose prose-sm dark:prose-invert max-w-none',
    innerHTML: markdown.render(value)
  });
}

function px(value: number | string | undefined) {
  if (value === undefined) return undefined;
  if (typeof value === 'number') return `${value}px`;
  return value;
}

type RenderContext = {
  theme: WidgetTheme;
  widgetId?: string;
  itemId?: string;
  emitAction: (action: ActionConfig, ctx: WidgetActionContext) => void;
};

export default defineComponent({
  name: 'WidgetRenderer',
  props: {
    root: {
      type: Object as () => WidgetRoot,
      required: true
    },
    theme: {
      type: String as () => WidgetTheme,
      default: 'light'
    },
    widgetId: {
      type: String,
      default: undefined
    }
  },
  emits: {
    action: (_action: ActionConfig, _context: WidgetActionContext) => true
  },
  setup(props, { emit }) {
    const emitAction = (action: ActionConfig, context: WidgetActionContext) => {
      emit('action', action, context);
    };

    const context: RenderContext = {
      theme: props.theme,
      widgetId: props.widgetId,
      emitAction
    };

    const render = (node: WidgetRoot | WidgetNode, ctx: RenderContext): any => {
      switch (node.type) {
        case 'Card':
          return renderCard(node as Card, ctx);
        case 'ListView':
          return renderListView(node as ListView, ctx);
        case 'ListViewItem':
          return renderListViewItem(node as ListViewItem, ctx);
        case 'Box':
          return renderFlexContainer(node as Box, ctx);
        case 'Row':
          return renderRow(node as Row, ctx);
        case 'Col':
          return renderCol(node as Col, ctx);
        case 'Badge':
          return renderBadge(node as Badge, ctx);
        case 'Button':
          return renderButton(node as Button, ctx);
        case 'Text':
          return renderText(node as Text, ctx);
        case 'Title':
          return renderTitle(node as Title, ctx);
        case 'Markdown':
          return renderMarkdown((node as Markdown).value);
        case 'Divider':
          return renderDivider(node as Divider, ctx);
        case 'Icon':
          return renderIcon(node as Icon, ctx);
        case 'Image':
          return renderImage(node as Image, ctx);
        case 'Caption':
          return renderCaption(node as Caption, ctx);
        case 'Spacer':
          return renderSpacer(node as Spacer);
        case 'Select':
          return renderSelect(node as Select, ctx);
        case 'DatePicker':
          return renderDatePicker(node as DatePicker, ctx);
        case 'Form':
          return renderForm(node as Form, ctx);
        case 'Transition':
          if ((node as any).children) {
            return render((node as any).children, ctx);
          }
          return null;
        default:
          return null;
      }
    };

    const renderChildren = (
      children: (WidgetNode | undefined)[] | undefined,
      ctx: RenderContext
    ) => {
      if (!children?.length) return [];
      return children
        .filter((child): child is WidgetNode => Boolean(child))
        .map((child) =>
          render(child, {
            ...ctx,
            widgetId: ctx.widgetId ?? child.key
          })
        );
    };

    const renderCard = (node: Card, ctx: RenderContext) => {
      const styles = buildBoxStyles(
        {
          padding: node.padding ?? 16,
          background: node.background ?? 'var(--card)',
          radius: 'lg',
          gap: 16
        },
        ctx.theme
      );

      const children: any[] = [];

      if (node.status) {
        children.push(
          h('div', { class: 'flex items-center gap-2 text-sm text-muted-foreground' }, [
            node.status.icon
              ? h('span', {
                  class:
                    'inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary'
                }, node.status.icon)
              : null,
            h('span', node.status.text)
          ])
        );
      }

      const renderedChildren = renderChildren(node.children, ctx);
      if (renderedChildren.length) {
        children.push(...renderedChildren);
      }

      if (node.confirm || node.cancel) {
        children.push(
          h('div', { class: 'flex items-center justify-end gap-2 pt-2' }, [
            node.cancel
              ? h(
                  'button',
                  {
                    class: 'btn btn-secondary h-9',
                    onClick: () => ctx.emitAction(node.cancel!.action, { widgetId: ctx.widgetId, node })
                  },
                  node.cancel.label
                )
              : null,
            node.confirm
              ? h(
                  'button',
                  {
                    class: 'btn btn-primary h-9',
                    onClick: () => ctx.emitAction(node.confirm!.action, { widgetId: ctx.widgetId, node })
                  },
                  node.confirm.label
                )
              : null
          ])
        );
      }

      return h(
        'div',
        {
          class: clsx(
            'card flex flex-col',
            node.collapsed ? 'opacity-75' : 'opacity-100',
            {
              'p-4': !node.padding
            }
          ),
          style: styles
        },
        children.length ? children : undefined
      );
    };

    const renderListView = (node: ListView, ctx: RenderContext) => {
      const limit =
        node.limit && node.limit !== 'auto'
          ? node.children?.slice(0, node.limit)
          : node.children;
      const children =
        limit?.map((item) =>
          renderListViewItem(item, {
            ...ctx,
            itemId: item.key,
            widgetId: ctx.widgetId ?? item.key
          })
        ) ?? [];

      const content: any[] = [];
      if (node.status) {
        content.push(
          h('div', { class: 'px-2 text-xs text-muted-foreground' }, [
            node.status.icon
              ? h('span', { class: 'mr-2 text-sm' }, node.status.icon)
              : null,
            node.status.text
          ])
        );
      }
      if (children.length) {
        content.push(...children);
      }

      return h(
        'div',
        {
          class:
            'flex flex-col gap-2 rounded-lg border border-border bg-card p-2'
        },
        content.length ? content : undefined
      );
    };

    const renderListViewItem = (node: ListViewItem, ctx: RenderContext) => {
      const content = renderChildren(node.children, ctx);
      const classes = clsx(
        'flex items-center gap-3 rounded-md px-3 py-2 transition',
        node.onClickAction
          ? 'cursor-pointer hover:bg-muted/70'
          : 'cursor-default'
      );

      const body = h('div', { class: classes }, content);
      if (!node.onClickAction) return body;
      return h(
        'button',
        {
          class: classes,
          type: 'button',
          onClick: () =>
            ctx.emitAction(node.onClickAction!, {
              widgetId: ctx.widgetId,
              itemId: node.key ?? ctx.itemId,
              node
            })
        },
        content
      );
    };

    const renderFlexContainer = (node: Box, ctx: RenderContext) => {
      const style = buildBoxStyles(
        {
          padding: node.padding,
          margin: node.margin,
          background: node.background,
          radius: node.radius,
          border: node.border,
          height: node.height,
          width: node.width,
          minHeight: node.minHeight,
          minWidth: node.minWidth,
          maxHeight: node.maxHeight,
          maxWidth: node.maxWidth,
          flex: node.flex,
          size: node.size,
          minSize: node.minSize,
          maxSize: node.maxSize,
          gap: node.gap,
          aspectRatio: node.aspectRatio
        },
        ctx.theme
      );

      const direction = node.direction ?? 'column';
      const content = renderChildren(node.children, ctx);
      return h(
        'div',
        {
          class: 'flex',
          style: {
            ...style,
            flexDirection: direction,
            alignItems: node.align ?? 'stretch',
            justifyContent: node.justify ?? 'flex-start',
            flexWrap: node.wrap ?? 'nowrap'
          }
        },
        content.length ? content : undefined
      );
    };

    const renderRow = (node: Row, ctx: RenderContext) => {
      const style = buildBoxStyles(
        {
          padding: node.padding,
          margin: node.margin,
          background: node.background,
          radius: node.radius,
          border: node.border,
          height: node.height,
          width: node.width,
          minHeight: node.minHeight,
          minWidth: node.minWidth,
          maxHeight: node.maxHeight,
          maxWidth: node.maxWidth,
          flex: node.flex,
          size: node.size,
          minSize: node.minSize,
          maxSize: node.maxSize,
          gap: node.gap,
          aspectRatio: node.aspectRatio
        },
        ctx.theme
      );

      const content = renderChildren(node.children, ctx);

      return h(
        'div',
        {
          class: 'flex flex-row',
          style: {
            ...style,
            alignItems: node.align ?? 'stretch',
            justifyContent: node.justify ?? 'flex-start'
          }
        },
        content.length ? content : undefined
      );
    };

    const renderCol = (node: Col, ctx: RenderContext) => {
      const style = buildBoxStyles(
        {
          padding: node.padding,
          margin: node.margin,
          background: node.background,
          radius: node.radius,
          border: node.border,
          height: node.height,
          width: node.width,
          minHeight: node.minHeight,
          minWidth: node.minWidth,
          maxHeight: node.maxHeight,
          maxWidth: node.maxWidth,
          flex: node.flex,
          size: node.size,
          minSize: node.minSize,
          maxSize: node.maxSize,
          gap: node.gap,
          aspectRatio: node.aspectRatio
        },
        ctx.theme
      );

      const content = renderChildren(node.children, ctx);

      return h(
        'div',
        {
          class: 'flex flex-col',
          style: {
            ...style,
            alignItems: node.align ?? 'stretch',
            justifyContent: node.justify ?? 'flex-start',
            flexWrap: node.wrap ?? 'nowrap'
          }
        },
        content.length ? content : undefined
      );
    };

    const renderBadge = (node: Badge, ctx: RenderContext) => {
      return h(
        'span',
        {
          class: clsx(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
            node.color ? toneColors[node.color] ?? 'bg-muted text-muted-foreground' : 'bg-muted text-muted-foreground',
            node.variant ? badgeVariants[node.variant] : ''
          )
        },
        node.label
      );
    };

    const renderButton = (node: Button, ctx: RenderContext) => {
      const variant = node.variant ?? 'solid';
      const toneClass = node.color ? toneColors[node.color] ?? '' : '';
      const classes = clsx(
        'btn h-9 px-3',
        buttonVariants[variant],
        toneClass,
        node.block ? 'w-full' : '',
        node.pill ? 'rounded-full' : ''
      );

      return h(
        'button',
        {
          type: node.submit ? 'submit' : 'button',
          class: classes,
          onClick: (event: MouseEvent) => {
            if (!node.onClickAction) return;
            ctx.emitAction(node.onClickAction, {
              widgetId: ctx.widgetId,
              itemId: ctx.itemId,
              node
            });
            if (!node.submit) {
              event.preventDefault();
            }
          }
        },
        [
          node.iconStart
            ? h('span', { class: 'mr-2 text-sm' }, node.iconStart)
            : null,
          node.label,
          node.iconEnd
            ? h('span', { class: 'ml-2 text-sm' }, node.iconEnd)
            : null
        ]
      );
    };

    const renderText = (node: Text, ctx: RenderContext) => {
      const classes = clsx(
        'whitespace-pre-wrap leading-relaxed',
        node.size ? sizeClasses[node.size] : 'text-sm',
        node.italic ? 'italic' : '',
        node.lineThrough ? 'line-through' : '',
        node.truncate ? 'truncate' : '',
        node.textAlign === 'center'
          ? 'text-center'
          : node.textAlign === 'end'
          ? 'text-right'
          : 'text-left',
        node.weight === 'medium'
          ? 'font-medium'
          : node.weight === 'semibold'
          ? 'font-semibold'
          : node.weight === 'bold'
          ? 'font-bold'
          : 'font-normal'
      );

      return h(
        'p',
        {
          class: classes,
          style: {
            width: px(node.width),
            color: resolveColor(node.color, ctx.theme),
            WebkitLineClamp: node.maxLines,
            display: node.maxLines ? '-webkit-box' : undefined,
            WebkitBoxOrient: node.maxLines ? 'vertical' : undefined,
            overflow: node.maxLines ? 'hidden' : undefined
          }
        },
        node.value
      );
    };

    const renderTitle = (node: Title, ctx: RenderContext) => {
      const classes = clsx(
        'font-semibold leading-tight',
        node.size ? sizeClasses[node.size] : 'text-lg',
        node.textAlign === 'center'
          ? 'text-center'
          : node.textAlign === 'end'
          ? 'text-right'
          : 'text-left'
      );

      return h(
        'h3',
        {
          class: classes,
          style: {
            color: resolveColor(node.color, ctx.theme),
            WebkitLineClamp: node.maxLines,
            display: node.maxLines ? '-webkit-box' : undefined,
            WebkitBoxOrient: node.maxLines ? 'vertical' : undefined,
            overflow: node.maxLines ? 'hidden' : undefined
          }
        },
        node.value
      );
    };

    const renderDivider = (node: Divider, ctx: RenderContext) => {
      return h('div', {
        class: clsx(node.flush ? 'mx-0' : 'my-2'),
        style: {
          height: node.size ? px(node.size) : '1px',
          backgroundColor: resolveColor(
            node.color ?? { light: 'var(--border)', dark: 'var(--border)' },
            ctx.theme
          )
        }
      });
    };

    const renderIcon = (node: Icon, ctx: RenderContext) => {
      const sizeClass: Record<string, string> = {
        xs: 'text-xs',
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl'
      };
      return h(
        'span',
        {
          class: clsx(
            'inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground',
            node.size ? sizeClass[node.size] : 'text-base'
          ),
          style: {
            color: resolveColor(node.color, ctx.theme)
          }
        },
        node.name
      );
    };

    const renderImage = (node: Image, ctx: RenderContext) => {
      const style = buildBoxStyles(
        {
          margin: node.margin,
          background: node.background,
          radius: node.radius,
          width: node.width ?? node.size,
          height: node.height ?? node.size,
          minHeight: node.minHeight ?? node.minSize,
          minWidth: node.minWidth ?? node.minSize,
          maxHeight: node.maxHeight ?? node.maxSize,
          maxWidth: node.maxWidth ?? node.maxSize,
          flex: node.flex,
          aspectRatio: node.aspectRatio
        },
        ctx.theme
      );

      return h('img', {
        src: node.src,
        alt: node.alt ?? '',
        class: clsx(
          'max-w-full rounded-lg object-cover',
          node.frame ? 'border border-border' : '',
          node.flush ? 'w-full' : ''
        ),
        style: {
          ...style,
          objectFit: node.fit ?? 'cover',
          objectPosition: node.position
        }
      });
    };

    const renderCaption = (node: Caption, ctx: RenderContext) => {
      return h(
        'span',
        {
          class: clsx(
            'text-xs text-muted-foreground',
            node.size ? sizeClasses[node.size] : 'text-xs',
            node.weight === 'medium'
              ? 'font-medium'
              : node.weight === 'semibold'
              ? 'font-semibold'
              : node.weight === 'bold'
              ? 'font-bold'
              : 'font-normal',
            node.textAlign === 'center'
              ? 'text-center block'
              : node.textAlign === 'end'
              ? 'text-right block'
              : 'text-left block',
            node.truncate ? 'truncate' : ''
          ),
          style: {
            color: resolveColor(node.color, ctx.theme),
            WebkitLineClamp: node.maxLines,
            display: node.maxLines ? '-webkit-box' : undefined,
            WebkitBoxOrient: node.maxLines ? 'vertical' : undefined,
            overflow: node.maxLines ? 'hidden' : undefined
          }
        },
        node.value
      );
    };

    const renderSpacer = (node: Spacer) => {
      return h('div', {
        style: {
          minHeight: px(node.minSize ?? 16)
        }
      });
    };

    const renderSelect = (node: Select, ctx: RenderContext) => {
      const optionNodes = node.options.map((option) =>
        h(
          'option',
          {
            value: option.value
          },
          option.label
        )
      );

      if (node.placeholder) {
        optionNodes.unshift(
          h('option', { value: '', disabled: true }, node.placeholder)
        );
      }

      return h(
        'select',
        {
          class:
            'h-9 rounded-md border border-input bg-transparent px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          name: node.name,
          value: node.defaultValue ?? '',
          onChange: (event: Event) => {
            const value = (event.target as HTMLSelectElement).value;
            if (!node.onChangeAction) return;
            ctx.emitAction(node.onChangeAction, {
              widgetId: ctx.widgetId,
              itemId: ctx.itemId,
              node,
              value
            });
          }
        },
        optionNodes
      );
    };

    const renderDatePicker = (node: DatePicker, ctx: RenderContext) => {
      return h('input', {
        type: 'date',
        name: node.name,
        class:
          'h-9 rounded-md border border-input bg-transparent px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        min: node.min,
        max: node.max,
        value: node.defaultValue,
        placeholder: node.placeholder,
        disabled: node.disabled,
        onChange: (event: Event) => {
          const value = (event.target as HTMLInputElement).value;
          if (!node.onChangeAction) return;
          ctx.emitAction(node.onChangeAction, {
            widgetId: ctx.widgetId,
            itemId: ctx.itemId,
            node,
            value
          });
        }
      });
    };

    const renderForm = (node: Form, ctx: RenderContext) => {
      const style = buildBoxStyles(
        {
          padding: node.padding,
          margin: node.margin,
          background: node.background,
          radius: node.radius,
          border: node.border,
          height: node.height,
          width: node.width,
          minHeight: node.minHeight,
          minWidth: node.minWidth,
          maxHeight: node.maxHeight,
          maxWidth: node.maxWidth,
          flex: node.flex,
          size: node.size,
          minSize: node.minSize,
          maxSize: node.maxSize,
          gap: node.gap
        },
        ctx.theme
      );

      const content = renderChildren(node.children, ctx);

      return h(
        'form',
        {
          class: 'flex flex-col',
          style: {
            ...style,
            alignItems: node.align ?? 'stretch',
            justifyContent: node.justify ?? 'flex-start'
          },
          onSubmit: (event: Event) => {
            event.preventDefault();
            ctx.emitAction(node.onSubmitAction, {
              widgetId: ctx.widgetId,
              itemId: ctx.itemId,
              node
            });
          }
        },
        content.length ? content : undefined
      );
    };

    return () => render(props.root, context);
  }
});
</script>
