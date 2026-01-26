import { userProfile } from "@/src/domain/entities/user-profile";

export const defaultUserProfile: userProfile = {
  mustHaveKeywords: [],
  hardNoKeywords: [],
  preferredKeywords: [],
  excludedKeywords: [],
  notes: "",
};
