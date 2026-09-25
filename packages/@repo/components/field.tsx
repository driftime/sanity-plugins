import { isDefined } from "@repo/lib/utils";
import { useState } from "react";
import type {
  ArrayOfObjectsFormNode,
  ArrayOfObjectsMember,
  BaseFormNode,
  DocumentFieldActionNode,
  ObjectFieldProps,
  ObjectFormNode,
  ObjectMember,
} from "sanity";
import {
  ChangeIndicator,
  FieldActionsProvider,
  FieldActionsResolver,
  FormField,
  getPublishedId,
  useFormValue,
} from "sanity";

/**
 * Checks whether a form node has members, as objects and arrays of objects do.
 *
 * @param node - The form node to check.
 * @returns True if the node has members.
 */
function hasMembers(node: BaseFormNode): node is ObjectFormNode | ArrayOfObjectsFormNode {
  return "members" in node;
}

/**
 * Collects the validation on a form node and everything inside it.
 *
 * @param node - The form node.
 * @returns Every validation result on the node or inside it.
 */
function collectNodeValidation(node: BaseFormNode): BaseFormNode["validation"] {
  return [...node.validation, ...(hasMembers(node) ? collectMemberValidation(node.members) : [])];
}

/**
 * Collects the validation anywhere inside a field's members. The form only passes a field the
 * validation at its own path, so a field that hides its members would otherwise show none of theirs.
 *
 * @param members - The members.
 * @returns Every validation result on the members or inside them.
 */
function collectMemberValidation(members: (ObjectMember | ArrayOfObjectsMember)[]): BaseFormNode["validation"] {
  return members.flatMap((member) => {
    if (member.kind === "field") return collectNodeValidation(member.field);
    if (member.kind === "fieldSet") return collectMemberValidation(member.fieldSet.members);
    if (member.kind === "item") return collectNodeValidation(member.item);

    return [];
  });
}

export type FieldProps = ObjectFieldProps;

export function Field({
  actions,
  schemaType,
  title,
  description,
  presence,
  validation,
  level,
  inputId,
  path,
  changed,
  children,
  inputProps,
}: FieldProps) {
  const [headerActions, setHeaderActions] = useState<DocumentFieldActionNode[]>([]);

  const documentId = useFormValue(["_id"]);
  const publishedId = typeof documentId === "string" ? getPublishedId(documentId) : undefined;
  const focused = inputProps.focused === true;
  const fieldValidation = [...validation, ...collectMemberValidation(inputProps.members)];

  return (
    <>
      {isDefined(publishedId) && isDefined(actions) && (
        <FieldActionsResolver
          actions={actions}
          documentId={publishedId}
          documentType={schemaType.name}
          onActions={setHeaderActions}
          path={path}
          schemaType={schemaType}
        />
      )}
      <FieldActionsProvider actions={headerActions} focused={focused} path={path}>
        <FormField
          __unstable_headerActions={headerActions}
          __unstable_presence={presence}
          description={description}
          inputId={inputId}
          level={level}
          title={title}
          validation={fieldValidation}
          deprecated={schemaType.deprecated}
          path={path}
          readOnly={inputProps.readOnly}
        >
          <ChangeIndicator path={path} hasFocus={focused} isChanged={changed}>
            {children}
          </ChangeIndicator>
        </FormField>
      </FieldActionsProvider>
    </>
  );
}
