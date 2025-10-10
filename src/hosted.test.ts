import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { createHostedClientSecret } from './hosted';

describe('createHostedClientSecret', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
  });

  afterEach(() => {
    fetchMock.mockReset();
  });

  it('fetches a client secret and caches it', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ client_secret: 'first-secret' }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      })
    );

    const hosted = createHostedClientSecret({
      url: '/api/secret',
      fetch: fetchMock
    });

    await expect(hosted.getClientSecret(null)).resolves.toBe('first-secret');
    await expect(hosted.getClientSecret('first-secret')).resolves.toBe('first-secret');

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('supports custom payload factories', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ clientSecret: 'another-secret' }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      })
    );

    const bodyFactory = vi.fn().mockResolvedValue({ userId: '123' });

    const hosted = createHostedClientSecret({
      url: '/api/secret',
      fetch: fetchMock,
      headers: async () => ({ Authorization: 'Bearer token' }),
      body: bodyFactory
    });

    await expect(hosted.getClientSecret(null)).resolves.toBe('another-secret');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(bodyFactory).toHaveBeenCalled();

    const requestInit = fetchMock.mock.calls[0][1];
    expect(requestInit?.method).toBe('POST');
    expect(requestInit?.headers).toEqual({
      'content-type': 'application/json',
      Authorization: 'Bearer token'
    });
    expect(requestInit?.body).toBe(JSON.stringify({ userId: '123' }));
  });

  it('throws when the response cannot be parsed', async () => {
    fetchMock.mockResolvedValueOnce(new Response('{}', { status: 200 }));

    const hosted = createHostedClientSecret({
      url: '/api/secret',
      fetch: fetchMock
    });

    await expect(hosted.getClientSecret(null)).rejects.toThrow(
      'Client secret response did not include a client_secret field.'
    );
  });
});
