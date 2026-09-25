import { guideTypeName, handbookTypeName } from "@/types";

/** Document types hidden from the create menu. */
export const singletonTypes = new Set<string>([handbookTypeName]);

/** Every Handbook document type, hidden from the create menu for people who can't edit them. */
export const documentTypes = new Set<string>([handbookTypeName, guideTypeName]);
