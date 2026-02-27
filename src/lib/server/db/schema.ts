import {
  integer,
  pgTable,
  primaryKey,
  uuid,
  decimal,
  timestamp,
  text,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  username: text("username").unique().notNull(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
});

export const people = pgTable("people", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  lat: decimal("lat", { precision: 9, scale: 6 }).notNull(),
  lng: decimal("lng", { precision: 9, scale: 6 }).notNull(),
  address: text("address").notNull(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey().notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const plans = pgTable("plans", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  editedAt: timestamp("edited_at").defaultNow().notNull(),
});

export const drivingGroups = pgTable("drivingGroups", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  planId: uuid("plan_id")
    .references(() => plans.id, { onDelete: "cascade" })
    .notNull(),
  driverId: uuid("driver_id")
    .references(() => people.id, { onDelete: "cascade" })
    .notNull(),
  capacity: integer("capacity").default(4).notNull(),
});

export const groupMembers = pgTable(
  "group_members",
  {
    groupId: uuid("group_id")
      .references(() => drivingGroups.id, { onDelete: "cascade" })
      .notNull(),
    personId: uuid("person_id")
      .references(() => people.id)
      .notNull(),
    pickupOrder: integer("pickup_order").default(0).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.groupId, table.personId] }),
  }),
);

export const userRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  plans: many(plans),
  people: many(people),
}));

export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const plansRelations = relations(plans, ({ one, many }) => ({
  user: one(users, {
    fields: [plans.userId],
    references: [users.id],
  }),
  drivingGroups: many(drivingGroups),
}));

export const drivingGroupRelations = relations(
  drivingGroups,
  ({ one, many }) => ({
    plan: one(plans, {
      fields: [drivingGroups.planId],
      references: [plans.id],
    }),
    driver: one(people, {
      fields: [drivingGroups.driverId],
      references: [people.id],
    }),
    passengers: many(groupMembers),
  }),
);

export const peopleRelations = relations(people, ({ one, many }) => ({
  user: one(users, {
    fields: [people.userId],
    references: [users.id],
  }),
  drivingGroup: many(drivingGroups),
  passengerGroup: many(groupMembers),
}));

export const passengersRelations = relations(groupMembers, ({ one }) => ({
  drivingGroup: one(drivingGroups, {
    fields: [groupMembers.groupId],
    references: [drivingGroups.id],
  }),
  people: one(people, {
    fields: [groupMembers.personId],
    references: [people.id],
  }),
}));
