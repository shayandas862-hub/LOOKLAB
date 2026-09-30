import { Registry, type AnyAction } from './registry.ts';
import { breakdownActions } from './domains/breakdown.ts';
import { adaptActions } from './domains/adapt.ts';
import { planActions } from './domains/plan.ts';
import { outputActions } from './domains/output.ts';
import { systemActions } from './domains/system.ts';

export const ALL_ACTIONS: AnyAction[] = [
  ...breakdownActions,
  ...adaptActions,
  ...planActions,
  ...outputActions,
  ...systemActions,
];

export function buildRegistry(): Registry {
  return new Registry(ALL_ACTIONS);
}

export { Registry, ActionError, mcpName, defineAction, DEFAULT_MAX_BYTES } from './registry.ts';
export type { AnyAction, Envelope } from './registry.ts';
