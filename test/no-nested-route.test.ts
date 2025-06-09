import { describe, it, expect } from "vitest";
import { createTestHost } from "@typespec/compiler/testing";
import { noNestedRouteRule } from "../src/rules/no-nested-route.rule.js";

describe("no-nested-route rule", () => {
  it("should report error for nested @route in namespace", async () => {
    const testCode = `
      @route("/api/v1/pets")
      namespace Pets {
        @route("/list")
        @get
        op list(): Pet[];
      }
    `;
    
    const host = await createTestHost();
    const diagnostics = await host.diagnose(testCode, { linters: [noNestedRouteRule] });
    
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].message).toContain("Nested @route decorators are not allowed");
  });

  it("should report error for multiple nested routes in namespace", async () => {
    const testCode = `
      @route("/api/v1/store")
      namespace Store {
        @route("/inventory")
        @get
        op getInventory(): Inventory;

        @route("/orders")
        @get
        op getOrders(): Order[];
      }
    `;
    
    const host = await createTestHost();
    const diagnostics = await host.diagnose(testCode, { linters: [noNestedRouteRule] });
    
    expect(diagnostics).toHaveLength(2);
    expect(diagnostics[0].message).toContain("Nested @route decorators are not allowed");
    expect(diagnostics[1].message).toContain("Nested @route decorators are not allowed");
  });

  it("should report error for nested @route in interface", async () => {
    const testCode = `
      @route("/api/v1/users")
      interface Users {
        @route("/profile")
        @get
        getProfile(): UserProfile;
      }
    `;
    
    const host = await createTestHost();
    const diagnostics = await host.diagnose(testCode, { linters: [noNestedRouteRule] });
    
    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0].message).toContain("Nested @route decorators are not allowed");
  });

  it("should not report error for non-nested @route", async () => {
    const testCode = `
      @route("/api/v1/pets")
      interface Pets {
        @get list(): Pet[];
      }
      
      @route("/api/v1/store")
      interface Store {
        @get getInventory(): Inventory;
      }
    `;
    
    const host = await createTestHost();
    const diagnostics = await host.diagnose(testCode, { linters: [noNestedRouteRule] });
    
    expect(diagnostics).toHaveLength(0);
  });

  it("should not report error for operations without @route in @route namespace", async () => {
    const testCode = `
      @route("/api/v1/pets")
      namespace Pets {
        @get
        op findByStatus(@query status: PetStatus): Pet[];
        
        @post
        op addPet(@body pet: Pet): Pet;
      }
    `;
    
    const host = await createTestHost();
    const diagnostics = await host.diagnose(testCode, { linters: [noNestedRouteRule] });
    
    expect(diagnostics).toHaveLength(0);
  });

  it("should handle deeply nested structures correctly", async () => {
    const testCode = `
      @route("/api/v1")
      namespace PetStore {
        @route("/pets")
        namespace Pets {
          @route("/categories")
          @get
          op getCategories(): Category[];
        }
      }
    `;
    
    const host = await createTestHost();
    const diagnostics = await host.diagnose(testCode, { linters: [noNestedRouteRule] });
    
    expect(diagnostics).toHaveLength(2);
    expect(diagnostics[0].message).toContain("Nested @route decorators are not allowed");
    expect(diagnostics[1].message).toContain("Nested @route decorators are not allowed");
  });

  it("should not report error for sibling namespaces with @route", async () => {
    const testCode = `
      namespace PetStoreAPI {
        @route("/pets")
        namespace Pets {
          @get findByStatus(@query status: PetStatus): Pet[];
        }
        
        @route("/store")
        namespace Store {
          @get getInventory(): Inventory;
        }
      }
    `;
    
    const host = await createTestHost();
    const diagnostics = await host.diagnose(testCode, { linters: [noNestedRouteRule] });
    
    expect(diagnostics).toHaveLength(0);
  });
});
