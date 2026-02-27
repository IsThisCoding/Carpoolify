import { and, eq } from "drizzle-orm";
import { db } from "..";
import { people } from "../schema";
import { getLatAndLong } from "$lib/server/geocode";

export async function createPerson({
  userId,
  name,
  address,
}: {
  userId: string;
  name: string;
  address: string;
}) {
  const coords = await getLatAndLong(address);
  const newPerson: typeof people.$inferInsert = {
    userId,
    name,
    lat: coords.lat.toPrecision(6),
    lng: coords.lng.toPrecision(6),
    address: address,
  };
  await db.insert(people).values(newPerson);
}

export async function updatePerson(
  userId: string,
  personId: string,
  updateObject: { name?: string; lat?: string; lng?: string },
) {
  if (Object.keys(updateObject).length === 0) return;

  await db
    .update(people)
    .set(updateObject)
    .where(and(eq(people.userId, userId), eq(people.id, personId)));
}

export async function getAllPeople(userId: string) {
  const allPeople = await db.query.people.findMany({
    where: eq(people.userId, userId),
  });
  return allPeople;
}
