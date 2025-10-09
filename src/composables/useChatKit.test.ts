import { describe, expect, it, vi } from 'vitest';
import { shallowRef, nextTick } from 'vue';
import type { OpenAIChatKit } from '@openai/chatkit';

import { useChatKit, type UseChatKitOptions } from './useChatKit';

describe('useChatKit', () => {
  it('splits handlers from options and updates reactively', async () => {
    const handler = vi.fn();
    const options = shallowRef<UseChatKitOptions>({
      api: { url: '/api/chatkit', domainKey: 'example' },
      theme: 'dark',
      onResponseStart: handler
    });

    const { control } = useChatKit(options);

    expect(control.options.theme).toBe('dark');
    expect(typeof control.handlers.onResponseStart).toBe('function');
    control.handlers.onResponseStart?.();
    expect(handler).toHaveBeenCalledTimes(1);

    options.value = {
      api: { url: '/api/chatkit', domainKey: 'example' },
      theme: 'light',
      onResponseStart: handler,
      onResponseEnd: handler
    };

    await nextTick();

    expect(control.options.theme).toBe('light');
    control.handlers.onResponseEnd?.();
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('warns when methods are invoked before the element is mounted', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const kit = useChatKit({
      api: { url: '/api/chatkit', domainKey: 'example' }
    });

    kit.focusComposer();
    expect(warn).toHaveBeenCalledWith('ChatKit element is not mounted');

    warn.mockRestore();
  });

  it('forwards method calls to the mounted ChatKit instance', async () => {
    const focusComposer = vi.fn(() => Promise.resolve());

    const kit = useChatKit({
      api: { url: '/api/chatkit', domainKey: 'example' }
    });

    const instance: Partial<OpenAIChatKit> = {
      focusComposer,
      setThreadId: vi.fn(),
      sendUserMessage: vi.fn(),
      setComposerValue: vi.fn(),
      fetchUpdates: vi.fn(),
      sendCustomAction: vi.fn(),
      setOptions: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    };

    kit.control.setInstance(instance as OpenAIChatKit);

    await kit.focusComposer();
    expect(focusComposer).toHaveBeenCalled();
  });
});
