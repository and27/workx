export type userProfile = {
  profileVersion: number;
  mustHaveKeywords: string[];
  hardNoKeywords: string[];
  preferredKeywords: string[];
  excludedKeywords: string[];
  notes?: string;
};
