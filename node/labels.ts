/**
 * Module labels. Distinct. Do not fold one into another.
 */
export const MODULES = {
  data: 'MB Data',
  account: 'MB Account',
  relay: 'MB Relay',
} as const;

export type ModuleId = keyof typeof MODULES;
