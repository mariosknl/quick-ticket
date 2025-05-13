"use server";
import * as Sentry from "@sentry/nextjs";
import { prisma } from "@/db/prisma";
import { revalidatePath } from "next/cache";
import { logEvent } from "@/utils/sentry";

export async function createTicket(
  prevState: { success: boolean; message: string },
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  try {
    const subject = formData.get("subject") as string;
    const description = formData.get("description") as string;
    const priority = formData.get("priority") as string;

    if (!subject || !description || !priority) {
      logEvent(
        "Validation error: Missing Ticket Fields",
        "ticket",
        {},
        "warning"
      );
      return { success: false, message: "All fields are required" };
    }

    // Create the ticket
    const ticket = await prisma.ticket.create({
      data: {
        subject,
        description,
        priority,
      },
    });

    logEvent(
      `Ticket created successfully: ${ticket.id}`,
      "ticket",
      { ticketId: ticket.id },
      "info"
    );

    revalidatePath("/tickets");

    return { success: true, message: "Ticket created successfully" };
  } catch (error) {
    logEvent(
      "An error occured while creating the ticket",
      "ticket",
      {
        formData: Object.fromEntries(formData.entries()),
      },
      "error",
      error
    );

    return {
      success: false,
      message: "An error occurred while creating the ticket",
    };
  }
}
