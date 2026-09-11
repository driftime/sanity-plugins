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
 * Checks whether a form node holds members of its own, as an object or an array of objects does.
 *
 * @param node - The form node to check.
 * @returns True if the node holds members.
 */
function hasMembers(node: BaseFormNode): node is ObjectFormNode | ArrayOfObjectsFormNode {
  return "members" in node;
}

/**
 * Gathers the validation reported on a form node and on anything inside it.
 *
 * @param node - The form node to gather validation from.
 * @returns Every validation reported on the node or within it.
 */
function collectNodeValidation(node: BaseFormNode): BaseFormNode["validation"] {
  return [...node.validation, ...(hasMembers(node) ? collectMemberValidation(node.members) : [])];
}

/**
 * Gathers the validation reported anywhere inside a field's members. The form hands a field only what
 * is reported at its own path, which suits a frame drawing its members inline but leaves one that
 * hides them showing nothing they report.
 *
 * @param members - The members to gather validation from.
 * @returns Every validation reported on a member or within one.
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
