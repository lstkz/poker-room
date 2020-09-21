import { getBindings } from '../common/bindings';
import { logger } from '../common/logger';
import { AppEvent } from '../types';

export async function dispatch(event: AppEvent) {
  const bindings = getBindings('event').filter(x => x.type === event.type);
  await Promise.all(
    bindings.map(async binding => {
      try {
        await binding.handler(event.payload);
      } catch (e) {
        logger.error('Error when handing', event, e);
      }
    })
  );
}
