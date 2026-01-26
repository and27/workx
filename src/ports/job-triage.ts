import { job } from "@/src/domain/entities/job";
import { userProfile } from "@/src/domain/entities/user-profile";
import { triageProvider } from "@/src/domain/types/triage-provider";
import { triageStatus } from "@/src/domain/types/triage-status";

export type jobTriageDecision = {
  status: triageStatus;
  reasons: string[];
  provider: triageProvider;
};

export type jobTriagePort = {
  coarse: (input: {
    job: job;
    profile: userProfile;
  }) => Promise<jobTriageDecision | null>;
  disambiguate: (input: {
    job: job;
    profile: userProfile;
    previous: jobTriageDecision;
  }) => Promise<jobTriageDecision | null>;
};
