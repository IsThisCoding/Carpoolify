import * as schema from '$lib/server/db/schema';
import type {
	BuildQueryResult,
	DBQueryConfig,
	ExtractTablesWithRelations,
	InferSelectModel,
} from 'drizzle-orm';

export type Plan = InferSelectModel<typeof schema.plans>;

type TSchema = ExtractTablesWithRelations<typeof schema>;

export type DrivingGroupWithPassengersAndDriver = BuildQueryResult<
	TSchema,
	TSchema['drivingGroups'],
	{ with: { passengers: true; driver: true } }
>;
