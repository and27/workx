export type resultOk<T> = { ok: true; value: T };
export type resultErr<E> = { ok: false; error: E };
export type result<T, E> = resultOk<T> | resultErr<E>;

export const ok = <T>(value: T): resultOk<T> => ({ ok: true, value });
export const err = <E>(error: E): resultErr<E> => ({ ok: false, error });
