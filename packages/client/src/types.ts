export type ClientRequest = {
  path: string;
  label: string;
  trace: boolean;
};

export type ClientResponse = {
  status: number;
  body: string;
};

export type Transport = (request: ClientRequest) => Promise<ClientResponse>;

export type ClientOptions = {
  transport: Transport;
  /** Additional attempts after the first request; zero is valid. Default: 2. */
  maxRetries?: number;
  /** An empty or omitted label uses the default display label. */
  requestLabel?: string;
  trace?: boolean;
  verbose?: boolean;
};

export type Client = {
  request(path: string): Promise<ClientResponse>;
};
