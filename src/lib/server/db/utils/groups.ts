import { and, eq } from 'drizzle-orm';
import { db } from '..';
import { drivingGroups, groupMembers, plans, users } from '../schema';
import type { DrivingGroupWithPassengersAndDriver } from '../types';

type AllowedRelations = {
	driver?: true;
	passengers?: true;
};

export async function getAllGroupsInPlan<T extends AllowedRelations | undefined = undefined>(
	userId: string,
	planId: string,
	relations: T = {} as T,
) {
	return await db.query.drivingGroups.findMany({
		where: (groups, { and, eq }) =>
			and(
				eq(users.id, userId), // Assuming 'users.id' meant the column in drivingGroups
				eq(groups.planId, planId),
			),
		with: relations,
	});
}

export async function createGroup(planId: string, driverId: string, capacity?: number, passengerIds: string[] = []) {
	const newGroup: typeof drivingGroups.$inferInsert = { driverId, capacity, planId };
	const [insertedGroup] = await db.insert(drivingGroups).values(newGroup).returning();

	if (passengerIds.length > 0) {
		const members = passengerIds.map((personId, index) => ({
			groupId: insertedGroup.id,
			personId,
			pickupOrder: index,
		}));
		await db.insert(groupMembers).values(members);
	}
}

export async function updateGroupFromIds(
	planId: string,
	groupId: string,
	driverId: string,
	capacity: number,
	passengerIds: string[],
) {
	await db.update(drivingGroups)
		.set({ driverId, capacity })
		.where(and(eq(drivingGroups.planId, planId), eq(drivingGroups.id, groupId)));

	await db.delete(groupMembers).where(eq(groupMembers.groupId, groupId));

	if (passengerIds.length > 0) {
		const members = passengerIds.map((personId, index) => ({
			groupId,
			personId,
			pickupOrder: index,
		}));
		await db.insert(groupMembers).values(members);
	}
}

export async function updateGroup(
	userId: string,
	planId: string,
	oldGroupData: DrivingGroupWithPassengersAndDriver,
	newGroupData: DrivingGroupWithPassengersAndDriver,
) {
	const groupDataUpdateObject: { capacity?: number; driverId?: string } = {
		capacity: oldGroupData.capacity !== newGroupData.capacity ? newGroupData.capacity : undefined,
		driverId: oldGroupData.driverId !== newGroupData.driverId ? newGroupData.driverId : undefined,
	};

	//if the data is the same, then we won't waste updating the db
	if (groupDataUpdateObject.capacity || groupDataUpdateObject.driverId) {
		await db
			.update(drivingGroups)
			.set(groupDataUpdateObject)
			.where(and(eq(drivingGroups.planId, planId), eq(drivingGroups.id, oldGroupData.id)));
	}

	const oldPassengers = oldGroupData.passengers;
	const newPassengersMap = new Map(
		newGroupData.passengers.map((passenger) => [passenger.personId, passenger]),
	);

	for (const oldPassenger of oldPassengers) {
		if (!newPassengersMap.has(oldPassenger.personId)) {
			await db
				.delete(groupMembers)
				.where(
					and(
						eq(groupMembers.groupId, oldGroupData.id),
						eq(groupMembers.personId, oldPassenger.personId),
					),
				);
		} else {
			if (oldPassenger.pickupOrder != newPassengersMap.get(oldPassenger.personId)?.pickupOrder) {
				await db
					.update(groupMembers)
					.set({ pickupOrder: newPassengersMap.get(oldPassenger.personId)?.pickupOrder })
					.where(
						and(
							eq(groupMembers.groupId, oldGroupData.id),
							eq(groupMembers.personId, oldPassenger.personId),
						),
					);
			}
			newPassengersMap.delete(oldPassenger.personId);
		}
	}

	for (const personId of newPassengersMap.keys()) {
		const passenger = newPassengersMap.get(personId);
		if (!passenger) continue;
		const insertion: typeof groupMembers.$inferInsert = {
			personId: passenger.personId,
			pickupOrder: passenger.pickupOrder,
			groupId: passenger.groupId,
		};
		await db.insert(groupMembers).values(insertion);
	}
}
