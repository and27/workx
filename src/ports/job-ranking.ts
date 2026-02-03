import { job } from "@/src/domain/entities/job";
import { userProfile } from "@/src/domain/entities/user-profile";
import { triageProvider } from "@/src/domain/types/triage-provider";

export type jobRankDecision = {
  score: number;
  reason: string;
  provider: triageProvider;
};

export type jobRankPort = {
  rank: (input: {
    job: job;
    profile: userProfile;
    provider: triageProvider;
  }) => Promise<jobRankDecision | null>;
};
