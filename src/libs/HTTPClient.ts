interface IMap {
  [key: string]: string;
}
type CacheStrategy = "no-store" | "force-cache";
type InternalClient = (method: string, route: string, cacheStrategy: CacheStrategy, body?: BodyInit) => Promise<Response | null>;
export default class HTTPClient {
  private readonly uri: string;

  private cachedHeaders: IMap;
  public get CachedHeaders(): HeadersInit { return this.cachedHeaders; }
  public set NewHeaders(value: IMap) { this.cachedHeaders = {...this.cachedHeaders, ...value}; }
  public set Header(value: [string, string]) { this.cachedHeaders[value[0]] = value[1]; };

  private cacheStrategy: CacheStrategy;
  private cacheLifetime: number; 

  constructor(uri: string, headers?: IMap, cacheStrategy: CacheStrategy = "no-store", cacheLifetime = 0) {
    if (!uri) {
        console.error("API_URL environment variable is not set. Please create a .env.local file with API_URL=http://localhost:8080");
        uri = "http://localhost:8080"; // Fallback to localhost for development
    }
    this.uri = uri;
    this.cachedHeaders = headers ?? {
        "content-type": "application/json",
        "Authorization": process.env.API_KEY || "development_key", // Fallback for development
    };
    this.cacheStrategy = cacheStrategy;
    this.cacheLifetime = cacheLifetime;
  }

  private async getClientAsync(reset?: boolean): Promise<InternalClient> {
    const headers = this.cachedHeaders;
    if (headers === undefined || reset) {
      this.NewHeaders = {
        // update headers if necessary (e.g., tokens n stuff)
        // Don't put anything sensitive, unless explicitly from process.env
        
      };
    }

    const client: InternalClient =
      async (method: string, route: string, body?: BodyInit) => {
        try {
          const url = new URL(route, this.uri);
          const requestBody = body ? JSON.stringify(body) : undefined;
          
          // Debug: Log the request details
          console.log(`HTTP ${method} ${url.toString()}`);
          console.log("Headers:", headers);
          if (requestBody) {
            console.log("Body:", requestBody);
          }
          
          return await fetch(
            new Request(
              url,
              {
                method: method,
                headers: headers,
                body: requestBody,
                cache: this.cacheStrategy,
                next: {
                  revalidate: this.cacheLifetime
                }
              }
            )
          )
        } catch (err) {
          console.error(`fetch failed: ${err}`);
          console.error("route was: " + route);
          return null;
        }
      };

    return client;
  }

  private async actAsyncInternal(mode: string, route: string, body?: any): Promise<Response | null> {
    const action = async (client: InternalClient) => await client(mode, route, body);

    let client = await this.getClientAsync();
    const httpResponse = await action(client);

    if (!httpResponse) {
        console.error(`Failed to connect to API at ${this.uri}. Make sure the API server is running.`);
        return null;
    }

    // Debug: Log the response status
    console.log(`Response status: ${httpResponse.status} ${httpResponse.statusText}`);

    if (httpResponse.status === 401) { // Unauthorized
        client = await this.getClientAsync(true);
        return await action(client);
    } else {
        return httpResponse;
    }
  }

  private async actAsync<T = any>(mode: string, route: string, body?: any, isVoid: boolean = false): Promise<[T | null, number, string | null]> {
    const httpResponse = await this.actAsyncInternal(mode, route, body);
    if (!httpResponse)
      return [null, 404, "fetch failed"];

    const resBody = await httpResponse.text();
    if (isVoid)
      return [null, httpResponse.status, null];

    let json;
    try {
      // Only try to parse if we have a non-empty response
      json = resBody ? JSON.parse(resBody) : null;
    } catch (err) {
      const message = `Error processing request ${route} -> ${err}`;
      console.error(message);
      return [null, httpResponse.status || 500, message];
    }

    // For non-2xx responses, return the error message from the JSON if available
    if (!httpResponse.ok) {
      const errorMessage = json?.error || json?.message || httpResponse.statusText;
      console.error(`HTTP ${httpResponse.status} error:`, errorMessage);
      return [null, httpResponse.status, errorMessage];
    }
    
    return [json as T, httpResponse.status, null];
  }

  public GetAsync = async <T = any>(route: string, body?: any): Promise<[T | null, number, string | null]> =>
    await this.actAsync<T>("get", route, body);

  public PostAsync = async <T = any>(route: string, body?: any, isVoid: boolean = false): Promise<[T | null, number, string | null]> =>
    await this.actAsync<T>("post", route, body, isVoid);

  public PutAsync = async <T = any>(route: string, body?: any, isVoid: boolean = false): Promise<[T | null, number, string | null]> =>
    await this.actAsync<T>("put", route, body, isVoid);

  public DeleteAsync = async <T = any>(route: string, body?: any, isVoid: boolean = false): Promise<[T | null, number, string | null]> =>
    await this.actAsync<T>("delete", route, body, isVoid);
}
