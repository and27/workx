import { jobSource } from "@/src/ports/job-source";

export const createRemotiveJobSource = (): jobSource => ({
  list: async () => [],
});
