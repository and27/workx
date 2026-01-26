export type userProfile = {
  mustHaveKeywords: string[];
  hardNoKeywords: string[];
  preferredKeywords: string[];
  excludedKeywords: string[];
  notes?: string;
};
