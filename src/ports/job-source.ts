export type jobSourceQuery = {
  source?: string;
  limit?: number;
};

export type jobSourceRecord = {
  externalId: string;
  source: string;
  role: string;
  company: string;
  location: string;
  seniority: string;
  tags: string[];
  sourceUrl: string;
  publishedAt: string;
};

export type jobSource = {
  list: (query?: jobSourceQuery) => Promise<jobSourceRecord[]>;
};
