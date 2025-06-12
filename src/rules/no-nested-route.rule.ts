import { createRule, paramMessage } from "@typespec/compiler";
import type { Decorator, Interface, Namespace, Operation } from "@typespec/compiler";

export const noNestedRouteRule = createRule({
  name: "no-nested-route",
  severity: "warning",
  description: "Prevent nested @route decorators to improve API path graspability.",
  messages: {
    default: paramMessage`Nested @route decorators are not allowed. This @route is nested within another @route decorator.`,
  },
  create: (context) => {
    function hasRouteDecorator(type: Interface | Namespace | Operation): boolean {
      return type.decorators?.some((decorator: any) => {
        const name = decorator.decorator?.name;
        return name === "$route";
      }) ?? false;
    }

    function findParentWithRoute(type: Interface | Namespace | Operation): Interface | Namespace | Operation | null {
      if (!type.node?.parent) return null;
      
      let current: any = type.node.parent;
      while (current) {
        const semanticType = context.program.checker.getTypeForNode(current);
        if (semanticType && 
            (semanticType.kind === "Interface" || semanticType.kind === "Namespace" || semanticType.kind === "Operation") &&
            hasRouteDecorator(semanticType as any)) {
          return semanticType as any;
        }
        current = current.parent;
      }
      return null;
    }

    function checkForNestedRoute(type: Interface | Namespace | Operation) {
      if (hasRouteDecorator(type)) {
        const parentWithRoute = findParentWithRoute(type);
        if (parentWithRoute) {
          context.reportDiagnostic({
            target: type,
            messageId: "default",
            format: {},
          });
        }
      }
    }

    return {
      interface: checkForNestedRoute,
      namespace: checkForNestedRoute,
      operation: checkForNestedRoute,
    };
  },
});
