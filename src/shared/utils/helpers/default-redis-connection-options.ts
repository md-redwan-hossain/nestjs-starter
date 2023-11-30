export function defaultRedisConnectionOptions(useForBullMq: boolean = false) {
  return {
    lazyConnect: false,
    maxRetriesPerRequest: useForBullMq ? null : 3,
    retryStrategy(times: number) {
      let delay: number | null;
      delay = times * 1000;
      if (times >= 3) delay = null;
      return delay;
    }
  };
}
