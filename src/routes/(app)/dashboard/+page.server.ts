import {
  getAllPlans,
  initializePlan,
  deletePlan,
} from "$lib/server/db/utils/plans";
import type { PageServerLoad, Actions } from "./$types";
import { redirect, fail } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user?.id) {
    return {
      plans: await getAllPlans(locals.user.id),
    };
  }
};

export const actions: Actions = {
  createPlan: async ({ locals, request }) => {
    const formData = await request.formData();
    const planName = formData.get("planName") as string;

    if (locals.user?.id && planName) {
      await initializePlan(locals.user.id, planName);
    }
    return { success: true };
  },

  deletePlan: async ({ request, locals }) => {
    const formData = await request.formData();
    const userId = locals.user?.id;
    if (!userId) {
      return fail(401, { message: "Unauthorized" });
    }
    const planId = formData.get("id") as string;
    const deleted = await deletePlan(userId, planId);
    console.log("deleted plan", planId);
    console.log(deleted);
    return { success: true };
  },
  editPlan: async ({ locals, request }) => {
    const formData = await request.formData();
    const planId = formData.get("id") as string;
    console.log(planId);
    if (!planId || !locals.user?.id) {
      console.log("Failed for ", planId);
      return fail(401, { message: "Unauthorized" });
    }

    return redirect(308, `/dashboard/plan/${planId}`);
  },
};
