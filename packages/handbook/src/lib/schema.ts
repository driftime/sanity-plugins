import { isDefined, isRecord, readPath } from "@repo/lib/utils";
import type { FieldDefinition, Schema } from "sanity";

/** A schema field as Sanity compiles it, with its type resolved to an object. */
interface CompiledField {
  /** Field name. */
  name: string;
  /** Resolved type, with its name and base type details. */
  type: { name: string; title?: string; description?: string; fields?: unknown[]; of?: unknown[] };
  /** Title set on an inline object definition. */
  title?: string;
  /** Description set on an inline object definition. */
  description?: string;
  /** Fields defined on an inline object definition. */
  fields?: unknown[];
  /** Members defined on an inline array definition. */
  of?: unknown[];
  /** Handbook documentation for the field. */
  handbook?: FieldDefinition["handbook"];
}

/** A schema field in the shape the Handbook renders, with its type reduced to a name. */
export interface NormalizedField {
  /** Field name. */
  name: string;
  /** Type name. */
  type: string;
  /** Title, falling back to the base type's. */
  title?: string;
  /** Description, falling back to the base type's. */
  description?: string;
  /** Handbook documentation for the field. */
  handbook?: FieldDefinition["handbook"];
  /** Subfields, on object types. */
  fields?: NormalizedField[];
  /** Members, on array types. */
  of?: NormalizedField[];
}

/** Types whose subfields aren't shown. */
const opaqueTypes = new Set([
  "block",
  "boolean",
  "crossDatasetReference",
  "date",
  "datetime",
  "file",
  "geopoint",
  "image",
  "number",
  "reference",
  "slug",
  "string",
  "text",
  "url",
]);

/** Fields Sanity adds to its built-in types when compiling the schema. */
const inheritedFieldNames: Partial<Record<string, Set<string>>> = {
  block: new Set(["children", "level", "listItem", "markDefs", "style"]),
  file: new Set(["asset", "media"]),
  geopoint: new Set(["alt", "lat", "lng"]),
  image: new Set(["asset", "crop", "hotspot", "media"]),
  slug: new Set(["current", "source"]),
};

/**
 * Checks whether a value is a compiled schema field with a type object.
 *
 * @param value - The value to check.
 * @returns True if the value is a compiled field.
 */
function isCompiledField(value: unknown): value is CompiledField {
  if (!isRecord(value)) return false;
  if (!("name" in value) || !("type" in value)) return false;

  return isRecord(value["type"]);
}

/**
 * Checks whether a value has a `fields` array.
 *
 * @param value - The value to check.
 * @returns True if the value has a `fields` array.
 */
function hasFieldsArray(value: unknown): value is { fields: unknown[] } {
  return isRecord(value) && Array.isArray(value["fields"]);
}

/**
 * Checks whether a value has an `of` array.
 *
 * @param value - The value to check.
 * @returns True if the value has an `of` array.
 */
function hasOfArray(value: unknown): value is { of: unknown[] } {
  return isRecord(value) && Array.isArray(value["of"]);
}

/**
 * Reads the type name a value declares.
 *
 * @param value - The value.
 * @returns The type name, or undefined when there isn't one.
 */
function getTypeName(value: unknown) {
  const typeName = readPath(value, ["type"]);

  return typeof typeName === "string" ? typeName : undefined;
}

/**
 * Reads the parent type name from a compiled schema type.
 *
 * @param resolvedType - The compiled schema type.
 * @returns The parent type name, or undefined when there isn't one.
 */
function getParentTypeName(resolvedType: unknown) {
  const parentName = readPath(resolvedType, ["type", "name"]);

  return isDefined(parentName) ? String(parentName) : undefined;
}

/**
 * Converts a compiled schema field into the shape the Handbook renders. Types already seen are tracked,
 * so a type that refers to itself doesn't recurse forever.
 *
 * @param field - A compiled field or a plain field definition.
 * @param visited - Type names already seen.
 * @returns The normalised field.
 */
function normalizeField(field: unknown, visited = new Set<string>()) {
  if (isCompiledField(field)) {
    const typeName = field.type.name;

    const result: NormalizedField = {
      name: field.name,
      type: typeName,
      title: field.title ?? field.type.title,
      description: field.description ?? field.type.description,
      handbook: field.handbook,
    };

    if (!visited.has(typeName)) {
      const shouldTrack = !opaqueTypes.has(typeName) && typeName !== "object" && typeName !== "array";
      const next = shouldTrack ? new Set([...visited, typeName]) : visited;
      const fieldSource = hasFieldsArray(field) ? field : field.type;
      const ofSource = hasOfArray(field) ? field : field.type;

      if (hasFieldsArray(fieldSource)) {
        result.fields = fieldSource.fields.map((subfield) => normalizeField(subfield, next));
      }
      if (hasOfArray(ofSource)) result.of = ofSource.of.map((member) => normalizeField(member, next));
    }

    return result;
  }

  // oxlint-disable-next-line no-unsafe-type-assertion -- An already normalised value carries no marker to narrow on.
  return field as NormalizedField;
}

/**
 * Lists the fields a custom type adds to an opaque base type, leaving out the base type's own.
 *
 * @param resolvedType - The compiled or normalised schema type.
 * @param parentName - The opaque base type's name.
 * @returns The custom fields, or undefined when there are none.
 */
function resolveCustomFields(resolvedType: unknown, parentName: string) {
  if (!hasFieldsArray(resolvedType)) return undefined;

  const inherited = inheritedFieldNames[parentName];

  const customFields = resolvedType.fields
    .map((field: unknown) => normalizeField(field))
    .filter((field) => !isDefined(inherited) || !inherited.has(field.name));

  return isDefined(customFields) ? customFields : undefined;
}

/**
 * Normalises a list of raw fields.
 *
 * @param items - The raw fields.
 * @returns The normalised fields, or undefined when there are none.
 */
function resolveNormalizedFields(items: unknown[]) {
  const normalized = items.map((item) => normalizeField(item));

  return isDefined(normalized) ? normalized : undefined;
}

/**
 * Normalises array members, leaving out opaque types.
 *
 * @param members - The raw array members.
 * @returns The normalised members, or undefined when there are none.
 */
function resolveNormalizedMembers(members: unknown[]) {
  const normalized = members.map((member) => normalizeField(member)).filter((member) => !opaqueTypes.has(member.type));

  return isDefined(normalized) ? normalized : undefined;
}

/**
 * Works out a value's parent type name, looking it up in the schema when the value only names its type.
 *
 * @param value - The value.
 * @param schema - The Sanity schema.
 * @returns The parent type name, or undefined when there isn't one.
 */
function resolveParentName(value: unknown, schema: Schema) {
  const direct = getParentTypeName(value);
  if (isDefined(direct)) return direct;

  const typeName = getTypeName(value);
  if (!isDefined(typeName)) return undefined;

  const resolvedType = schema.get(typeName);
  return isDefined(resolvedType) ? getParentTypeName(resolvedType) : undefined;
}

/**
 * Works out the fields a value shows, whether it holds them directly, has array members that do, or
 * names a type that does.
 *
 * @param value - The value.
 * @param schema - The Sanity schema.
 * @returns The fields, or undefined when there are none.
 */
function resolveFields(value: unknown, schema: Schema) {
  if (hasFieldsArray(value)) {
    const parentName = resolveParentName(value, schema);
    if (isDefined(parentName) && opaqueTypes.has(parentName)) return resolveCustomFields(value, parentName);

    return resolveNormalizedFields(value.fields);
  }

  if (hasOfArray(value)) {
    const members = value.of;

    if (members.length === 1) {
      const [member] = members;
      const normalized = normalizeField(member);

      if (opaqueTypes.has(normalized.type)) return undefined;

      if (hasFieldsArray(normalized)) {
        const parentName = resolveParentName(normalized, schema);
        if (isDefined(parentName) && opaqueTypes.has(parentName)) return resolveCustomFields(normalized, parentName);

        return resolveNormalizedFields(normalized.fields);
      }

      const memberType = schema.get(normalized.type);
      if (isDefined(memberType)) return resolveFields(memberType, schema);
    }

    return resolveNormalizedMembers(members);
  }

  return undefined;
}

/**
 * Works out a field's visible subfields by looking through the schema.
 *
 * @param field - The field.
 * @param schema - The Sanity schema.
 * @returns The subfields, or undefined when there are none.
 */
export function getSubfields(field: FieldDefinition | NormalizedField, schema: Schema) {
  if (opaqueTypes.has(field.type)) return undefined;

  const directFields = resolveFields(field, schema);
  if (isDefined(directFields)) return directFields;

  const resolvedType = schema.get(field.type);
  if (!isDefined(resolvedType)) return undefined;

  const parentName = getParentTypeName(resolvedType);
  if (isDefined(parentName) && opaqueTypes.has(parentName)) {
    return resolveCustomFields(resolvedType, parentName);
  }

  return resolveFields(resolvedType, schema);
}
