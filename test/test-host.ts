import { createTestHost, createTestWrapper } from "@typespec/compiler/testing";
import { HttpTestLibrary } from "@typespec/http/testing";
import { TypeSpecRouteLinterTestLibrary } from "../src/testing/index.js";

export async function createTypeSpecRouteLinterTestHost() {
  return createTestHost({
    libraries: [HttpTestLibrary, TypeSpecRouteLinterTestLibrary],
  });
}

export async function createTypeSpecRouteLinterTestRunner() {
  const host = await createTypeSpecRouteLinterTestHost();

  return createTestWrapper(host, {
    autoUsings: ["TypeSpec.Http"]
  });
}
