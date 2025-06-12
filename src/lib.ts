import { createTypeSpecLibrary, defineLinter } from "@typespec/compiler";
import { noNestedRouteRule } from "./rules/no-nested-route.rule.js";

export const $lib = createTypeSpecLibrary({
  name: "typespec-route-linter",
  diagnostics: {},
});

export const $linter = defineLinter({
  rules: [noNestedRouteRule],
  ruleSets: {
    recommended: {
      enable: { [`typespec-route-linter/${noNestedRouteRule.name}`]: true },
    },
  },
});

export const { reportDiagnostic, createStateSymbol } = $lib;
