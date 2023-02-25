# Services

Services are stand alone modules which offer a simple abstraction over a 3rd
party library, external service or system api. Typically the service interface
is a subset of the entire api and only represents that which this application
needs to function.

Services should be designed to be easily mockable, and replaceable with as
little redesign to the calling code as possible.

## Example Services

> todo: add links to external service implementations...

## Example initServices implementation

```ts
export async function initServices<T>(config: T) {
  const mongo = await MongoService.create(config);
  const github = await GithubService.create(config);
  const analytics = await AnalyticsService.create(config);
  const logger = new LoggerService();
  return {
    mongo,
    github,
    analytics,
    logger,
  };
}
```
