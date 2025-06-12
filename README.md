# TypeSpec Route Linter

TypeSpec linter to prevent nested `@route` decorators for better API path graspability.

## Problem

When `@route` decorators are nested within namespaces or interfaces that already have `@route` decorators, it creates confusing API paths where the full route is not immediately clear from looking at a single location. This reduces code graspability and makes API maintenance more difficult.

### Example of Problematic Pattern

```typespec
@route("/stores/{storeId}")
interface Store {
  @route("/pets") // Nested route creates confusion
  listPets(@path storeId: string): Store;
  @route("/pets") // Nested route creates confusion
  createPet(@path storeId: string, @body pet: Pet): Pet;
  @route("/pets/{petId}") // Nested route creates confusion
  getPet(@path storeId: string, @path petId: string): Pet;
  // Other operations...
}
```

In this example, the actual API paths become:
- `/stores/{storeId}/pets`
- `/stores/{storeId}/pets/{petId}`

This nesting leads to low greppability and makes it hard to understand the full API structure at a glance. 

## Solution

This linter detects and prevents nested `@route` decorators, encouraging clearer API path definitions.

### Recommended Pattern

```typespec
// ✅ Clear, non-nested routes
@route("/stores/{storeId}/pets")
interface PetInStore {
  @get
  list(@path storeId: string): Pet[]; // Clear path: GET /stores/{storeId}/pets
  @post
  create(@path storeId: string, @body pet: Pet): Pet; // Clear path: POST /stores/{storeId}/pets
}

@route("/stores/{storeId}/pets/{petId}")
op getPetInStore(@path storeId: string, @path petId: string): Pet; // Clear path: /stores/{storeId}/pets/{petId}
```

## Installation

```bash
npm install -D typespec-route-linter
```

## Usage

### In your TypeSpec project configuration

Add the linter to your `tspconfig.yaml`:

```yaml
linter:
  enable:
    "typespec-route-linter/no-nested-route": true
```

## Rule Details

### `no-nested-route`

**Severity**: Warning

**Description**: Prevents `@route` decorators from being nested within other `@route` decorated elements.

**What it catches**:
- `@route` decorators on operations within `@route` decorated namespaces
- `@route` decorators on operations within `@route` decorated interfaces
- `@route` decorators on namespaces within `@route` decorated namespaces
- Deeply nested `@route` structures

**What it allows**:
- Multiple sibling namespaces/interfaces with `@route` decorators
- Operations without `@route` decorators within `@route` decorated containers
- Single-level `@route` usage

## Examples

### ❌ Will trigger linter error

```typespec
@route("/api/v1")
namespace Users {
  @route("/list")  // Error: nested @route
  @get
  op list(): User[];
}
```

```typespec
@route("/api/v1")
interface Users {
  @route("/create")  // Error: nested @route
  @post
  create(@body user: User): User;
}
```

### ✅ Will pass linter

```typespec
@route("/api/v1/users")
namespace Users {
  @get
  op list(): User[];  // OK: no @route on operation
  
  @post
  op create(@body user: User): User;  // OK: no @route on operation
}
```

```typespec
// OK: sibling routes, not nested
@route("/api/v1/users")
interface Users {
  @get list(): User[];
}

// OK: sibling routes, not nested
@route("/api/v1/users")
op createUser(@body user: User): User;
```

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
```

## License

MIT
