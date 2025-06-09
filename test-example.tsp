import "@typespec/rest";

using TypeSpec.Http;

@route("/api/v1/pets")
namespace Pets {
  @route("/list")
  @get
  op list(): Pet[];
}

model Pet {
  id: int32;
  name: string;
  status: "available" | "pending" | "sold";
}
