/// <reference types="vue/macros-global" />

import type { OpenAIChatKit } from '@openai/chatkit';

declare module 'vue' {
  interface GlobalComponents {
    'openai-chatkit': any;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'openai-chatkit': OpenAIChatKit;
  }
}

export {};
