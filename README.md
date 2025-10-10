# chatkit-vue

> ⚠️ **Unofficial package.** This project is a community-maintained Vue 3 port
> of OpenAI’s ChatKit bindings and is not published or supported by OpenAI.
> Please be aware that the API surface is still evolving; breaking changes may
> occur with little advance notice. Evaluate your tolerance for change before
> relying on this library in production.

Vue 3 bindings and headless components for building ChatKit experiences with
Tailwind-first styling. This package mirrors the ergonomics of
`@openai/chatkit-react` while providing opinionated Vue components for chat
history, message rendering, composers, and widget rendering.

## Features

- Vue composables (`useChatKit`, `useStableOptions`) that wrap the ChatKit web
  component and keep options stable across renders.
- `<ChatKit />` wrapper to mount the native `<openai-chatkit>` element.
- Tailwind-crafted UI primitives: `ChatKitRoot`, `ChatHistory`,
  `ChatMessageList`, `ChatMessageBubble`, `ChatComposer`, and `WidgetRenderer`.
- Complete widget renderer that understands ChatKit widget JSON (Card, ListView,
  Button, Select, DatePicker, Markdown, etc.) with action forwarding helpers.
- Ready-to-ship shadcn-inspired styles compiled via Tailwind.

## Installation

```bash
npm install chatkit-vue @openai/chatkit vue@^3.4
# or
pnpm add chatkit-vue @openai/chatkit vue@^3.4
```

Import the packaged styles once (typically in your app entry):

```ts
import 'chatkit-vue/dist/styles.css';
```

If you already run Tailwind, you can alternatively import
`chatkit-vue/src/styles/tailwind.css` and merge it with your build.

## Quick start

```vue
<script setup lang="ts">
import { ChatKitRoot, useChatKit } from 'chatkit-vue';

const {
  control,
  sendUserMessage,
  ref: chatKitRef,
} = useChatKit({
  api: {
    url: '/api/chatkit',
    domainKey: 'my-domain-key',
  },
  theme: 'light',
  header: { enabled: true },
});

const threads = ref([]);
const messages = ref([]);
const composer = ref('');

async function handleSubmit() {
  await sendUserMessage({ text: composer.value });
  composer.value = '';
}
</script>

<template>
  <div class="h-screen bg-muted/20 p-6">
    <ChatKitRoot
      :threads="threads"
      :messages="messages"
      :composer-value="composer"
      @update:composerValue="composer = $event"
      @submit="handleSubmit"
    />
    <!-- Mount the native web component (optional if you render your own UI) -->
    <ChatKit :control="control" class="hidden" ref="chatKitRef" />
  </div>
</template>
```

### Rendering widgets

Whenever a message includes ChatKit widget payload, pass it directly to
`WidgetRenderer`:

```vue
<WidgetRenderer
  :root="widgetDefinition"
  @action="(action, context) => handleWidgetAction(action, context)"
/>
```

The component handles all widget node types listed in the ChatKit widget
documentation, translating layout primitives (`Card`, `Box`, `Row`, `Col`) into
Tailwind-friendly containers and emitting `action` events when interactive nodes
(`Button`, `Select`, `DatePicker`, `ListViewItem`) are triggered.

### Custom layout

`ChatKitRoot` composes the included building blocks. You can mix and match
individual pieces:

- `ChatHistory` – sidebar history list with search, rename, delete hooks.
- `ChatMessageList` – scrollable renderer for `ChatMessage` objects.
- `ChatComposer` – shadcn-styled textarea composer with attachments & tools.
- `ChatMessageBubble` – role-aware message bubble with widget support.

Because these components are headless, you can wire them to a custom data model
or to the `OpenAIChatKit` instance returned by `useChatKit`.

## Tailwind configuration

The package ships a Tailwind config (`tailwind.config.ts`) and base styles under
`src/styles/tailwind.css`. If you bundle your own CSS, extend your Tailwind
content paths to include:

```js
// tailwind.config.js
module.exports = {
  content: [
    './node_modules/chatkit-vue/dist/**/*.{js,mjs}',
    './node_modules/chatkit-vue/src/**/*.{vue,ts}',
    './src/**/*.{vue,js,ts}',
  ],
};
```

## Handling hosted client secrets

When you integrate with the hosted ChatKit API (`getClientSecret`) the frontend
must request a short-lived `client_secret` from your backend before the widget
can talk to OpenAI. `chatkit-vue` exposes a helper that wires this up for you
with caching, refresh, and optional request customization:

```ts
import { createHostedClientSecret, useChatKit } from 'chatkit-vue';

const hosted = createHostedClientSecret({
  url: '/api/chatkit/client-secret',
  headers: () => ({
    Authorization: `Bearer ${window.sessionToken}`,
  }),
  body: () => ({
    user_id: window.currentUserId,
  }),
});

const { control } = useChatKit({
  api: hosted,
});
```

Your backend endpoint should mint and return JSON with a `client_secret`
property (matching the ChatKit documentation). `createHostedClientSecret`
caches the last secret that was issued, retries transparently when the widget
asks for a refresh, and lets you override the HTTP method, headers, body, or
response parser if your integration needs a custom shape.

## Building & testing locally

```bash
npm install
npm run test   # Vitest unit tests for composables
npm run build  # Emits ESM/UMD bundles, type declarations, and compiled CSS
```

## License

MIT © ChatKit Vue contributors
