export type * from '@openai/chatkit';

import type { WidgetRoot, ActionConfig } from './widgets/types';

export type ChatRole = 'assistant' | 'user' | 'system' | 'tool';

export type ChatAttachment =
  | {
      type: 'file';
      id?: string;
      name: string;
      url?: string;
      mimeType?: string;
      size?: number;
    }
  | {
    type: 'image';
    id?: string;
    name: string;
    url: string;
    mimeType?: string;
    width?: number;
    height?: number;
  };

export type ChatMessageFormat = 'text' | 'markdown';

export type MessageAction = {
  label: string;
  action: ActionConfig;
};

export interface ChatMessageAuthor {
  name?: string;
  avatarUrl?: string;
  role?: ChatRole;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  format?: ChatMessageFormat;
  createdAt: string | Date;
  pending?: boolean;
  actions?: MessageAction[];
  attachments?: ChatAttachment[];
  widgets?: WidgetInstance[];
  author?: ChatMessageAuthor;
  metadata?: Record<string, unknown>;
}

export interface ChatThread {
  id: string;
  title: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
  preview?: string;
  unreadCount?: number;
  isPinned?: boolean;
  metadata?: Record<string, unknown>;
}

export interface WidgetInstance {
  id: string;
  widget: WidgetRoot;
  status?: {
    text: string;
    icon?: string;
    favicon?: string;
  };
}

export type { WidgetRoot, WidgetNode, ActionConfig } from './widgets/types';
