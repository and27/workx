export const TRIAGE_STATUS_EVENT = "workx:triage-status";

export type triageStatusDetail = {
  active: boolean;
};

export const emitTriageStatus = (active: boolean) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<triageStatusDetail>(TRIAGE_STATUS_EVENT, {
      detail: { active },
    })
  );
};
