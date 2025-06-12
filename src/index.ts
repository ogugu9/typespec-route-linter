import { defineLinter } from "@typespec/compiler";
import { noNestedRouteRule } from "./rules/no-nested-route.rule.js";

export const $linter = defineLinter({
  rules: [noNestedRouteRule],
  ruleSets: {
    recommended: {
      enable: { [`@ogugu9/typespec-route-linter/${noNestedRouteRule.name}`]: true },
    },
    all: {
      enable: { [`@ogugu9/typespec-route-linter/${noNestedRouteRule.name}`]: true },
    },
  },
});

export const rules = {
  "no-nested-route": noNestedRouteRule,
};

export { noNestedRouteRule };
