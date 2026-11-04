# Grocery Lambda

Public `GET /groceries`, returning JSON calculated from DynamoDB inventory.

## Run

```sh
npm ci
npm run typecheck
npm test
sam validate --lint
sam build
sam sync --watch
```

Use your configured AWS profile and region (or pass `--profile` / `--region`).
The stack name is `grocery-lambda`. No deployment is performed by this project setup.
After the initial sync, print only the endpoint URL with:

```sh
npm run --silent url
```

The CloudFormation output `GroceriesUrl` is the full HTTPS URL including `/groceries`.

## Calculation

Starting stock is the original grocery list, effective **4 November 2026 at
00:00 Europe/Amsterdam**. Each item's weekly usage is half its initial quantity.
Consumption is linear over elapsed time, clamped at zero stock. Shopping interval
is seven days. Pantry and freezer items have a fourteen-day reserve; fresh food
and dairy have no reserve. Purchase suggestions round up to the original pack
sizes (paprika is counted individually).

```
estimated stock = max(0, recorded stock - weekly usage * elapsed days / 7)
target stock = weekly usage * (reserve days + shopping interval days) / 7
packs to buy = ceil(max(0, target stock - estimated stock) / pack size)
```

A three-week target means reserve items need an initial top-up even on day one:
the recorded starting inventory covers only two weeks. Fresh items initially
cover two weeks, so they do not need replenishment on day one or at exactly day
seven. Whole packs can exceed the target. No shelf-life/expiry model is included.

The JSON object contains `generatedAt`, `shoppingIntervalDays`, `groceries`
(only items with positive purchase quantities), and `needsConfiguration` (olives,
whose quantity, usage, unit and pack size remain unspecified). Quantities use
`g`, `ml`, or `piece`; `packsToBuy` is the shopping count.

## Storage and later corrections

The first request conditionally creates one document with `id = inventory`,
`schemaVersion = 1`, `shoppingIntervalDays = 7` and the 24-item `items` array.
Concurrent first requests cannot overwrite the document. Subsequent GET requests
only read and calculate; refreshing never records a purchase or decrements stock.
Changing seed code does not overwrite existing DynamoDB inventory.

Until purchase management is added, edit the inventory document directly in the
DynamoDB console: set an item's `stock` to its actual remaining amount **including
purchases**, and set `stockAsOf` to the corresponding ISO timestamp. Edit
`weeklyUsage`, `packSize` and `reserveDays` as needed. Set all four null fields on
olives to include them in calculations. Without stock updates after purchases,
suggestions will continue to assume the original stock was consumed.

## Infrastructure

One Lambda, one API Gateway HTTP API route, one DynamoDB table using
`PAY_PER_REQUEST`, and basic Lambda logs retained for seven days. No X-Ray,
Application Insights, provisioned concurrency, API access logs, VPC/NAT gateway,
DynamoDB streams, secondary indexes or point-in-time recovery. Standard service
usage charges still apply. The endpoint is public as requested.

The table is retained if the stack is deleted or the table replaced, preserving
inventory. Retained storage remains billable until you explicitly delete it.
