"use server";

import { getCurrentUser } from "@/lib/auth";
import {
  generateLinkedInSearchUrl,
  generatePersonalizedOutreach,
  saveContact,
  updateContactStatus,
  getContacts,
  ConnectionContact,
  OutreachMessage,
} from "@/lib/networking-service";

export async function generateSearchUrlAction(filters: {
  roles?: string[];
  companies?: string[];
  keywords?: string[];
  location?: string;
}) {
  return generateLinkedInSearchUrl(filters);
}

export async function generateOutreachAction(contact: {
  fullName: string;
  title: string;
  company: string;
  sharedInterests?: string;
}): Promise<OutreachMessage> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }

  return await generatePersonalizedOutreach(user.id, contact);
}

export async function saveContactAction(contactData: Partial<ConnectionContact>): Promise<ConnectionContact> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }

  return await saveContact(user.id, contactData);
}

export async function updateContactStatusAction(
  contactId: string,
  status: "saved" | "contacted" | "dismissed"
) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }

  return await updateContactStatus(user.id, contactId, status);
}

export async function loadContactsAction(): Promise<ConnectionContact[]> {
  const user = await getCurrentUser();
  if (!user) {
    return [];
  }

  return await getContacts(user.id);
}
