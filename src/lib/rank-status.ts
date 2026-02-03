export const RANK_STATUS_EVENT = "workx:rank-status";

export type rankStatusDetail = {
  active: boolean;
};

export const emitRankStatus = (active: boolean) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<rankStatusDetail>(RANK_STATUS_EVENT, {
      detail: { active },
    })
  );
};
