import { createRule, paramMessage } from "@typespec/compiler";
import type { DecoratorApplication, Interface, Namespace, Operation } from "@typespec/compiler";

export const noNestedRouteRule = createRule({
  name: "no-nested-route",
  severity: "warning",
  description: "Prevent nested @route decorators to improve API path graspability.",
  messages: {
    default: paramMessage`Nested @route decorators are not allowed. This @route is nested within another @route decorator.`,
  },
  create: (context) => {
    function hasRouteDecorator(node: any): boolean {
      return node.decorators?.some((decorator: DecoratorApplication) => {
        return decorator.decorator.name === "$route" || 
               (decorator.decorator.namespace === "TypeSpec.Rest" && decorator.decorator.name === "route");
      }) ?? false;
    }

    function findParentWithRoute(node: any): any | null {
      let current = node.parent;
      while (current) {
        if (hasRouteDecorator(current)) {
          return current;
        }
        current = current.parent;
      }
      return null;
    }

    function checkForNestedRoute(node: Interface | Namespace | Operation) {
      if (hasRouteDecorator(node)) {
        const parentWithRoute = findParentWithRoute(node);
        if (parentWithRoute) {
          context.reportDiagnostic({
            target: node,
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
