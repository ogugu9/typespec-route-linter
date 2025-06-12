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
    function hasRouteDecorator(node: Interface | Namespace | Operation): boolean {
      if (!node.decorators) return false;
      return node.decorators.some((decorator: DecoratorApplication) => {
        return decorator?.decorator?.name === '$route';
      });
    }

    function findParentWithRoute(node: Interface | Namespace | Operation): Interface | Namespace | Operation | null {
      if (node.kind === "Interface") {
        if (node.namespace) {
          if (hasRouteDecorator(node.namespace)) {
            return node.namespace;
          }
          return findParentWithRoute(node.namespace);
        }
      }
      
      if (node.kind === "Operation") {
        if (node.interface) {
          if (hasRouteDecorator(node.interface)) {
            return node.interface;
          }
          const interfaceParent = findParentWithRoute(node.interface);
          if (interfaceParent) return interfaceParent;
        }
        if (node.namespace) {
          if (hasRouteDecorator(node.namespace)) {
            return node.namespace;
          }
          return findParentWithRoute(node.namespace);
        }
      }
      
      if (node.kind === "Namespace") {
        if (node.namespace) {
          if (hasRouteDecorator(node.namespace)) {
            return node.namespace;
          }
          return findParentWithRoute(node.namespace);
        }
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
