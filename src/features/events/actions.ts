"use server";

import { redirect } from "next/navigation";

import { requireManager } from "@/lib/auth";
import { db } from "@/lib/db";

import { eventSchema } from "./schema";

function getEventPayload(formData: FormData) {
  return eventSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    location: formData.get("location"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    status: formData.get("status"),
  });
}

export async function createEvent(formData: FormData) {
  const session = await requireManager();
  const parsed = getEventPayload(formData);

  if (!parsed.success) {
    redirect(`/events/new?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid event data.")}`);
  }

  await db.event.create({
    data: {
      ...parsed.data,
      createdById: session.user.id,
    },
  });

  redirect("/events?success=Event created successfully.");
}

export async function updateEvent(formData: FormData) {
  await requireManager();

  const eventId = String(formData.get("eventId") ?? "");
  const parsed = getEventPayload(formData);

  if (!parsed.success) {
    redirect(`/events/${eventId}/edit?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid event data.")}`);
  }

  await db.event.update({
    where: { id: eventId },
    data: parsed.data,
  });

  redirect(`/events/${eventId}?success=Event updated successfully.`);
}

export async function archiveEvent(formData: FormData) {
  await requireManager();
  const eventId = String(formData.get("eventId") ?? "");

  await db.event.update({
    where: { id: eventId },
    data: {
      status: "CANCELLED",
    },
  });

  redirect(`/events/${eventId}?success=Event archived.`);
}
