export type UrlPayloadType = {
  originalLink: string;
  name?: string;
  userId: string;
  expirationDate?: Date;
};

export type AnalyticsEntry = {
  timestamp: Date;
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
  expirationDate?: Date;
  analytics?: AnalyticsEntry[];
};
