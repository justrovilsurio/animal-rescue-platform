import { createContext, useContext } from 'react';

/** Visitor mode vs. the group's Preview. Same screens, different data rules. */
export interface PublicCtxValue { preview: boolean; base: string }
export const PublicCtx = createContext<PublicCtxValue>({ preview: false, base: '/' });
export const usePublic = () => useContext(PublicCtx);
