# Future Tasks — Auth

## OAuth Providers (Google / Apple)

`AuthProvider` enum in `Parent` already has `GOOGLE` and `APPLE` values.
To enable OAuth:

1. Add provider config in `src/auth.ts` following [Better Auth docs](https://www.better-auth.com/docs/authentication/oauth)
2. Run `pnpm db:auth:generate` to refresh schema if needed
3. Create a `POST /parents/link` endpoint for OAuth users to create their Parent profile
4. Update request protection if needed

## Production Migration Strategy

Currently auth tables are managed by `TYPEORM_SYNC=true`. In production,
`synchronize` is risky — it can drop columns or data if an entity definition
changes. Options:

- Stay with `synchronize` (convenient but risky)
- Add a proper `db:migrate` script using `typeorm migration:run`
- Use `typeorm migration:generate` to produce migrations from entity changes

## Consider Prisma or Drizzle

If the Better Auth TypeORM adapter's field workflow proves too tedious
(editing `additionalFields` + running generate), consider migrating the
auth layer to Prisma or Drizzle, which handle custom fields more cleanly.
This would only affect the `typeorm/entities/` directory — application
entities would stay on TypeORM unless also migrated.
