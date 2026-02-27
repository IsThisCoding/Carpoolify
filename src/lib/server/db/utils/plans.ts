import { db } from '$lib/server/db/index';
import { plans, drivingGroups, users, groupMembers } from '$lib/server/db/schema';
import { and, eq } from 'drizzle-orm';
import { getAllGroupsInPlan, updateGroup } from './groups';
import type { DrivingGroupWithPassengersAndDriver } from '../types';

export async function initializePlan(userId: string, name: string) {
	const planId = await db.insert(plans).values({ userId, name }).returning({ id: plans.id });
	console.log('Plan created!');
	return planId;
}

export async function getPlanByName(userId: string, name: string) {
	const plan = await db.query.plans.findFirst({
		where: and(eq(plans.userId, userId), eq(plans.name, name)),
	});
	return plan;
}

export async function deletePlan(userId: string, planId: string) {
	return await db.delete(plans).where(and(eq(plans.userId, userId), eq(plans.id, planId)));
}

export async function getPlanById(userId: string, id: string) {
	const plan = await db.query.plans.findFirst({
		where: and(eq(plans.userId, userId), eq(plans.id, id)),
	});
	return plan;
}

type PlanRelationalOptions = { drivingGroups?: true; user?: true };

export async function getAllPlans<T extends PlanRelationalOptions | undefined = undefined>(
	userId: string,
	relations: T = {} as T,
) {
	const planList = await db.query.plans.findMany({
		where: eq(plans.userId, userId),
		with: relations,
	});
	return planList;
}

export async function updatePlanName(planId: string, userId: string, name: string) {
	await db
		.update(plans)
		.set({ name })
		.where(and(eq(plans.id, planId), eq(plans.userId, userId)));
}

export async function updatePlanGroups(
	userId: string,
	planId: string,
	updatedGroups: DrivingGroupWithPassengersAndDriver[],
) {
	const oldGroups = await getAllGroupsInPlan(userId, planId, { driver: true, passengers: true });

	const oldGroupsMap = new Map(oldGroups.map((group) => [group.id, group]));

	for (const updatedGroup of updatedGroups) {
		const oldGroup = oldGroupsMap.get(updatedGroup.id);
		if (oldGroup) {
			//update old group with new group info
			updateGroup(userId, planId, oldGroup, updatedGroup);
			oldGroupsMap.delete(oldGroup.id);
		}
	}
	oldGroupsMap.forEach((_, key) => {
		db.delete(drivingGroups).where(
			and(eq(drivingGroups.planId, planId), eq(drivingGroups.id, key)),
		);
	});
}
