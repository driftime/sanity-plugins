import { guideTypeName, handbookTypeName } from "@/types";

/** Document types that should not appear in the "create new" menu. */
export const singletonTypes = new Set<string>([handbookTypeName]);

/** All Handbook document types used to filter template items for non-editors. */
export const documentTypes = new Set<string>([handbookTypeName, guideTypeName]);
