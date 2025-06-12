import {
  LinterRuleTester,
  createLinterRuleTester,
  createTestHost,
  createTestWrapper,
} from "@typespec/compiler/testing";
import { HttpTestLibrary } from "@typespec/http/testing";
import { beforeEach, describe, it } from "vitest";
import { noNestedRouteRule } from "../src/rules/no-nested-route.rule.js";

describe("no-nested-route rule", () => {
  let ruleTester: LinterRuleTester;

  beforeEach(async () => {
    const host = await createTestHost({
      libraries: [HttpTestLibrary],
    });
    const runner = createTestWrapper(host, {
      autoUsings: ["TypeSpec.Http"]
    });
    ruleTester = createLinterRuleTester(runner, noNestedRouteRule, "typespec-route-linter");
  });

  it("should report error for nested @route in namespace", async () => {
    await ruleTester.expect(`
      @route("/api")
      namespace PetStore {
        @route("/pets")
        interface Pets {
          op list(): string[];
        }
      }
    `).toEmitDiagnostics({
      code: "typespec-route-linter/no-nested-route",
      message: "Nested @route decorators are not allowed. This @route is nested within another @route decorator.",
    });
  });

  it("should report error for multiple nested routes in namespace", async () => {
    await ruleTester.expect(`
      @route("/api")
      namespace Store {
        @route("/v1")
        namespace V1 {
          @route("/orders")
          interface Orders {
            op getOrders(): string[];
          }
        }
      }
    `).toEmitDiagnostics([
      {
        code: "typespec-route-linter/no-nested-route",
        message: "Nested @route decorators are not allowed. This @route is nested within another @route decorator.",
      },
      {
        code: "typespec-route-linter/no-nested-route", 
        message: "Nested @route decorators are not allowed. This @route is nested within another @route decorator.",
      }
    ]);
  });

  it("should report error for nested @route in interface", async () => {
    await ruleTester.expect(`
      @route("/users")
      interface Users {
        @route("/profile")
        getProfile(): string;
      }
    `).toEmitDiagnostics({
      code: "typespec-route-linter/no-nested-route",
      message: "Nested @route decorators are not allowed. This @route is nested within another @route decorator.",
    });
  });

  it("should not report error for non-nested @route", async () => {
    await ruleTester.expect(`
      @route("/inventory")
      interface Inventory {
        @get getInventory(): string;
      }
    `).toBeValid();
  });

  it("should not report error for operations without @route in @route namespace", async () => {
    await ruleTester.expect(`
      @route("/pets")
      namespace PetStore {
        @get
        op addPet(pet: string): string;
      }
    `).toBeValid();
  });

  it("should handle deeply nested structures correctly", async () => {
    await ruleTester.expect(`
      @route("/api")
      namespace API {
        @route("/v2")
        namespace V2 {
          @route("/products")
          interface Products {
            op getProducts(): string[];
          }
        }
      }
    `).toEmitDiagnostics([
      {
        code: "typespec-route-linter/no-nested-route",
        message: "Nested @route decorators are not allowed. This @route is nested within another @route decorator.",
      },
      {
        code: "typespec-route-linter/no-nested-route",
        message: "Nested @route decorators are not allowed. This @route is nested within another @route decorator.",
      }
    ]);
  });

  it("should not report error for sibling namespaces with @route", async () => {
    await ruleTester.expect(`
      @route("/users")
      interface Users {
        op getUsers(): string[];
      }
      
      @route("/orders")
      interface Orders {
        op getOrders(): string[];
      }
    `).toBeValid();
  });
});
