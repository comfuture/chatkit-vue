import type { HostedApiConfig } from '@openai/chatkit';

type MaybeAsync<T> = T | Promise<T>;

type MaybeFn<T> = T | (() => MaybeAsync<T>);

export interface HostedClientSecretOptions {
  /**
   * Endpoint on your server that returns a client secret payload.
   */
  url: string;
  /**
   * Optional domain key to keep alongside the hosted configuration.
   * Not sent automatically; useful for apps that need to store or forward it.
   */
  domainKey?: string;
  /**
   * Optional fetch implementation. Defaults to the global `fetch`.
   */
  fetch?: typeof fetch;
  /**
   * HTTP method to use when requesting the client secret.
   * Defaults to `POST` when a body is provided, otherwise `GET`.
   */
  method?: string;
  /**
   * Static headers or a factory that resolves to headers for the request.
   */
  headers?: MaybeFn<Record<string, string>>;
  /**
   * JSON payload or factory invoked for each request. When provided the
   * request method defaults to `POST` and the payload is stringified.
   */
  body?: MaybeFn<Record<string, unknown> | undefined>;
  /**
   * Custom parser that resolves a client secret from the response.
   * Defaults to reading a JSON body with a `client_secret` or
   * `clientSecret` field.
   */
  parse?: (response: Response) => MaybeAsync<string>;
  /**
   * Optional secret to use for the initial render. Useful when the server
   * embeds a freshly minted secret into the page payload.
   */
  initialClientSecret?: string | null;
}

function ensureFetch(fetchImpl: typeof fetch | undefined): typeof fetch {
  if (fetchImpl) return fetchImpl;
  if (typeof fetch === 'function') return fetch;
  throw new Error(
    'No fetch implementation available for createHostedClientSecret. Provide one via options.fetch.'
  );
}

async function resolveMaybeFn<T>(value: MaybeFn<T> | undefined): Promise<T | undefined> {
  if (typeof value === 'function') {
    return await (value as () => MaybeAsync<T>)();
  }
  return value;
}

async function defaultParse(response: Response): Promise<string> {
  const payload = await response.json();
  const secret =
    typeof payload === 'object' && payload !== null
      ? (payload as Record<string, unknown>).client_secret ??
        (payload as Record<string, unknown>).clientSecret ??
        (payload as Record<string, unknown>).secret
      : undefined;
  if (typeof secret !== 'string' || !secret) {
    throw new Error(
      'Client secret response did not include a valid secret field (expected client_secret, clientSecret, or secret).'
    );
  }
  return secret;
}

export function createHostedClientSecret(
  options: HostedClientSecretOptions
): HostedApiConfig {
  const {
    url,
    fetch: fetchImpl,
    method,
    headers,
    body,
    parse = defaultParse,
    initialClientSecret = null
  } = options;

  let cachedSecret: string | null = initialClientSecret ?? null;
  let inflight: Promise<string> | null = null;

  const getMethod = (hasBody: boolean) => method ?? (hasBody ? 'POST' : 'GET');

  const fetcher = ensureFetch(fetchImpl);

  const resolveHeaders = async (): Promise<Record<string, string> | undefined> => {
    const resolved = await resolveMaybeFn(headers);
    return resolved ? { ...resolved } : undefined;
  };

  const resolveBody = async (): Promise<Record<string, unknown> | undefined> => {
    const resolved = await resolveMaybeFn(body);
    return resolved ? { ...resolved } : undefined;
  };

  const requestSecret = async (): Promise<string> => {
    const payload = await resolveBody();
    const resolvedHeaders = await resolveHeaders();

    const init: RequestInit = {
      method: getMethod(Boolean(payload))
    };

    if (payload) {
      init.body = JSON.stringify(payload);
      init.headers = {
        'content-type': 'application/json',
        ...(resolvedHeaders ?? {})
      };
    } else if (resolvedHeaders) {
      init.headers = resolvedHeaders;
    }

    const response = await fetcher(url, init);
    if (!response.ok) {
      throw new Error(
        `Failed to retrieve client secret. Received ${response.status} ${response.statusText}.`
      );
    }

    const secret = await parse(response.clone());
    if (typeof secret !== 'string' || !secret) {
      throw new Error('Client secret parser did not return a secret string.');
    }

    cachedSecret = secret;
    return secret;
  };

  return {
    async getClientSecret(currentClientSecret: string | null): Promise<string> {
      const mustRefresh = currentClientSecret !== null && currentClientSecret === cachedSecret;

      if (cachedSecret && !mustRefresh) {
        return cachedSecret;
      }

      if (inflight) {
        return inflight;
      }

      inflight = requestSecret();
      try {
        return await inflight;
      } finally {
        inflight = null;
      }
    }
  };
}

export type { HostedApiConfig } from '@openai/chatkit';
