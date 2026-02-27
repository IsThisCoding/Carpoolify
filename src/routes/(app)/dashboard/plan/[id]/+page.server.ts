import type { people } from "$lib/server/db/schema";
import { createGroup, getAllGroupsInPlan } from "$lib/server/db/utils/groups";
import { createPerson, getAllPeople } from "$lib/server/db/utils/people";
import { error, type Actions, type ServerLoad } from "@sveltejs/kit";
import type { Action } from "svelte/action";

export const load: ServerLoad = async ({ locals, params }) => {
  const userId = locals.user?.id;
  const planId = params.id;

  console.log("Loading data for plan", planId);

  if (!userId || !planId) {
    error(404, "Userid not valid");
  }

  const drivingGroups = await getAllGroupsInPlan(userId, planId, {
    driver: true,
    passengers: true,
  });

  const allPeople = await getAllPeople(userId);

  return { drivingGroups, allPeople };
};

export const actions: Actions = {
  createGroup: async ({ locals, params, request }) => {
    const formData = await request.formData();
    const driverId = formData.get("driver") as string;
    const capacity = formData.get("capacity") as string;

    if (!params.id || driverId) {
      error(403, "error with creating group");
    }
    createGroup(params.id, driverId, capacity ? parseInt(capacity) : undefined);
  },
  createPerson: async ({ locals, params, request }) => {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const userId = locals.user?.id;

    if (!userId || !name || !address) {
      return error(403);
    }

    createPerson({ userId, name, address });
  },
  updateGroup: async ({ locals, params, request }) => {},
};
