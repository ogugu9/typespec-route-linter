import { resolvePath } from "@typespec/compiler";
import { createTestLibrary, TypeSpecTestLibrary } from "@typespec/compiler/testing";
import { fileURLToPath } from "url";

export const TypeSpecRouteLinterTestLibrary: TypeSpecTestLibrary = createTestLibrary({
  name: "typespec-route-linter",
  packageRoot: resolvePath(fileURLToPath(import.meta.url), "../../../"),
});
