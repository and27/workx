import { applicationLogEventType } from "@/src/domain/types/application-log-event-type";
import { isoDateTime } from "@/src/domain/types/iso-date-time";

export type applicationLogEntry = {
  id: string;
  applicationId: string;
  type: applicationLogEventType;
  message: string;
  createdAt: isoDateTime;
};
