export type UrlPayloadType = {
  originalLink: string;
  name?: string;
  expirationDate?: string;
};

export type AnalyticsEntry = {
  timestamp: string;
  ipAddress?: string;
  device?: string;
  browser?: string;
  os?: string;
  location?: string;
};

export type UrlType = {
  id?: string;
  urlCode: string;
  originalLink: string;
  visitCount: number;
  createdAt: string;
  updatedAt: string;
  name?: string;
  userId: string;
  expirationDate?: string;
  analytics?: AnalyticsEntry[];
};
