export type ApiClientOptions = {
  baseUrl: string;
  apiKey?: string;
  fetchImpl?: typeof fetch;
};

export type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
};

export class ZivvyApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly payload: unknown
  ) {
    super(message);
    this.name = "ZivvyApiError";
  }
}

export class ZivvyApiClient {
  private readonly fetchImpl: typeof fetch;

  constructor(private readonly options: ApiClientOptions) {
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = new URL(path, this.options.baseUrl);
    const headers: Record<string, string> = {
      "content-type": "application/json",
      ...options.headers
    };
    if (this.options.apiKey) headers.authorization = `Bearer ${this.options.apiKey}`;

    const response = await this.fetchImpl(url, {
      method: options.method ?? "GET",
      headers,
      body: options.body == null ? undefined : JSON.stringify(options.body)
    });

    const text = await response.text();
    const payload = text ? JSON.parse(text) : null;
    if (!response.ok) {
      throw new ZivvyApiError(`Zivvy API request failed: ${response.status}`, response.status, payload);
    }
    return payload as T;
  }
}
