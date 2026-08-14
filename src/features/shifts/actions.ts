"use server";

import { redirect } from "next/navigation";

import { requireManager } from "@/lib/auth";
import { db } from "@/lib/db";

import { shiftSchema } from "./schema";

function formatShiftError(message: string, shiftId?: string): never {
  redirect(
    shiftId
      ? `/shifts/${shiftId}/edit?error=${encodeURIComponent(message)}`
      : `/shifts/new?error=${encodeURIComponent(message)}`,
  );
}

async function validateShiftWithinEvent(eventId: string, startTime: Date, endTime: Date) {
  const event = await db.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    return { ok: false, message: "Selected event could not be found." };
  }

  if (startTime < event.startDate || endTime > event.endDate) {
    return { ok: false, message: "Shift must fall within the event start and end dates." };
  }

  return { ok: true as const, event };
}

function getShiftPayload(formData: FormData) {
  return shiftSchema.safeParse({
    eventId: formData.get("eventId"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    requiredWorkers: formData.get("requiredWorkers"),
    status: formData.get("status"),
  });
}

export async function createShift(formData: FormData) {
  await requireManager();
  const parsed = getShiftPayload(formData);

  if (!parsed.success) {
    formatShiftError(parsed.error.issues[0]?.message ?? "Invalid shift data.");
  }

  const data = parsed.data;

  const eventValidation = await validateShiftWithinEvent(
    data.eventId,
    data.startTime,
    data.endTime,
  );

  if (!eventValidation.ok) {
    formatShiftError(eventValidation.message);
  }

  await db.shift.create({
    data,
  });

  redirect("/shifts?success=Shift created successfully.");
}

export async function updateShift(formData: FormData) {
  await requireManager();
  const shiftId = String(formData.get("shiftId") ?? "");
  const parsed = getShiftPayload(formData);

  if (!parsed.success) {
    formatShiftError(parsed.error.issues[0]?.message ?? "Invalid shift data.", shiftId);
  }

  const data = parsed.data;

  const eventValidation = await validateShiftWithinEvent(
    data.eventId,
    data.startTime,
    data.endTime,
  );

  if (!eventValidation.ok) {
    formatShiftError(eventValidation.message, shiftId);
  }

  await db.shift.update({
    where: { id: shiftId },
    data,
  });

  redirect(`/shifts/${shiftId}?success=Shift updated successfully.`);
}

export async function cancelShift(formData: FormData) {
  await requireManager();
  const shiftId = String(formData.get("shiftId") ?? "");

  await db.shift.update({
    where: { id: shiftId },
    data: {
      status: "CANCELLED",
    },
  });

  redirect(`/shifts/${shiftId}?success=Shift cancelled.`);
}
