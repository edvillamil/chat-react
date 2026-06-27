---
name: spring-boot-best-practices
description: >-
  Generate and extend Spring Boot projects using a clean layered architecture
  (controllers, services, repositories, models) with Maven, Java 25 and Spring
  Boot 4.x. Use this skill WHENEVER the user asks to create a basic REST API
  with Spring Boot, scaffold a Spring Web monolith, bootstrap/initialize a
  Spring Boot project, OR create, add, or modify a Spring entity, repository,
  service, or controller — even if they don't say "best practices" or name the
  layers explicitly. It enforces the project conventions (package layout, DTO
  records, explicit mappers, Thymeleaf + Tailwind views) so generated code stays
  consistent.
---

# Spring Boot Best Practices

Scaffold and extend Spring Boot apps with a predictable, layered structure so
every controller, service, repository and entity follows the same conventions.

## When to use this skill

- "Create a basic Spring Boot REST API" / "crear una API con Spring Boot"
- "Build a Spring Web monolith with server-rendered pages"
- "Initialize / bootstrap a Spring Boot project"
- "Add a `Product` entity" / "create the service for X" / "add a controller for Y"
- Any request to **create, add, or modify** an entity, repository, service or
  controller in a Spring Boot project.

If a Spring Boot project already exists in the workspace, **extend it** following
the conventions below rather than regenerating it.

## Fixed conventions (do not deviate without being asked)

| Setting        | Value |
|----------------|-------|
| Language       | Java **25** |
| Framework      | Spring Boot **≥ 4.0.6** — use the latest GA (verify on https://spring.io/projects/spring-boot or start.spring.io; `4.1.0` at time of writing) |
| Build tool     | **Maven** (with Maven Wrapper) |
| Packaging      | **jar** |
| Config         | **`application.properties`** (NOT YAML) |
| Maven groupId  | `com.andres.course.claude.springboot` |
| Maven artifactId | same as the **workspace project directory name** |
| Base package   | `com.andres.course.claude.springboot.{artifactId}.app` |

**Sanitizing the artifactId into a package segment:** Java package segments
can't contain hyphens or start with a digit. Derive `{artifactId}` for the
package by lowercasing and removing illegal characters (e.g. directory
`order-api` → package segment `orderapi`; `1-chat` → `chat`). Keep the original
name for the Maven `artifactId`/`name`; use the sanitized form only inside the
package path. Tell the user the sanitized value you chose.

## Base dependencies to include

`web`, `validation`, `data-jpa` (Spring Data JPA), `h2`, `devtools`, `actuator`.

## Generating a new project

Prefer **Spring Initializr** — it produces a correct `pom.xml`, the Maven
Wrapper (`mvnw`, `mvnw.cmd`, `.mvn/`) and `application.properties` automatically,
so you don't hand-roll the build. Run from the workspace directory:

```bash
ARTIFACT="$(basename "$PWD")"          # artifactId = workspace dir name
PKG="<sanitized-artifact>"             # see sanitizing rule above

curl -s https://start.spring.io/starter.zip \
  -d type=maven-project \
  -d language=java \
  -d javaVersion=25 \
  -d packaging=jar \
  -d groupId=com.andres.course.claude.springboot \
  -d artifactId="$ARTIFACT" \
  -d name="$ARTIFACT" \
  -d packageName="com.andres.course.claude.springboot.${PKG}.app" \
  -d dependencies=web,validation,data-jpa,h2,devtools,actuator \
  -o starter.zip && unzip -o starter.zip -d . && rm starter.zip
```

Notes:
- Omit `-d bootVersion=...` to get the **current GA** (recommended). Only pin it
  (`-d bootVersion=4.1.0`) if the user asks; never go below `4.0.6`.
- If Initializr rejects `javaVersion=25`, generate with the default and then set
  `<java.version>25</java.version>` in `pom.xml`.
- If start.spring.io is unreachable, fall back to a manual `pom.xml` using
  `spring-boot-starter-parent` with the same dependencies and the Maven Wrapper.

Verify the wrapper is executable: `chmod +x mvnw` (POSIX). On Windows use `mvnw.cmd`.

## Package / folder structure

Create these packages under the base package, and add `dto` + `mapper`:

```
src/main/java/com/andres/course/claude/springboot/{artifactId}/app/
├── {Artifact}Application.java     # @SpringBootApplication entry point
├── models/                        # JPA @Entity classes
├── repositories/                  # interfaces extending JpaRepository
├── services/                      # business logic
├── controllers/                   # REST controllers (@RestController)
├── dto/                           # records (request = response)
└── mapper/                        # explicit entity <-> dto mappers
src/main/resources/
├── application.properties
├── templates/                     # Thymeleaf (web/monolith only)
└── static/                        # static assets (web/monolith only)
```

## Layer responsibilities

Keeping each layer focused is what makes the codebase navigable: controllers
stay thin, business rules live in one place, and persistence details don't leak
into the web layer.

### Controller (`controllers/`)
Exposes **only** REST endpoints. Validates input (`@Valid`), delegates to a
service, and returns **DTOs** (never entities). No business logic, no repository
access.

```java
@RestController
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    public ProductDto findById(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductDto create(@Valid @RequestBody ProductDto request) {
        return service.create(request);
    }
}
```

### Service (`services/`)
Holds business logic, orchestrates repositories, and converts between entities
and DTOs **using the mapper**. Returns DTOs to the controller.

```java
@Service
public class ProductService {
    private final ProductRepository repository;
    private final ProductMapper mapper;

    public ProductService(ProductRepository repository, ProductMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public ProductDto findById(Long id) {
        Product entity = repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return mapper.toDto(entity);
    }

    public ProductDto create(ProductDto request) {
        Product saved = repository.save(mapper.toEntity(request));
        return mapper.toDto(saved);
    }
}
```

### Repository (`repositories/`)
Interfaces that extend `JpaRepository`. Add derived query methods as needed.

```java
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByNameContainingIgnoreCase(String name);
}
```

### Model / Entity (`models/`)
Plain JPA `@Entity`. Sensitive and audit fields (e.g. `password`, `createdAt`,
`updatedAt`) live here but are **excluded from DTOs** (see below).

## DTO conventions (`dto/`)

- Use **`record`**, not `class` — DTOs are immutable data carriers.
- Use the **same DTO for request and response** (one record per entity).
- **Exclude sensitive / audit fields**: `password`, `created_at`/`createdAt`,
  `updated_at`/`updatedAt`, `create_at`, `update_at`. They must never be
  serialized to clients.
- Put validation annotations on the record components.

```java
public record ProductDto(
    Long id,
    @NotBlank String name,
    @NotNull @Positive BigDecimal price
) {}
```

## Mapper conventions (`mapper/`)

Add an **explicit mapper class** per entity so the service converts between DTO
and entity deliberately (not via reflection magic). This keeps field exclusion
visible and reviewable.

```java
@Component
public class ProductMapper {

    // entity -> dto  (omit sensitive/audit fields)
    public ProductDto toDto(Product entity) {
        return new ProductDto(entity.getId(), entity.getName(), entity.getPrice());
    }

    // dto -> entity
    public Product toEntity(ProductDto dto) {
        Product entity = new Product();
        entity.setId(dto.id());
        entity.setName(dto.name());
        entity.setPrice(dto.price());
        return entity;
    }
}
```

## Web / monolith views (Spring Web + Thymeleaf + Tailwind)

When the app serves server-rendered pages (a monolith with `spring-web`, not a
pure JSON API), use **Thymeleaf templates with a shared layout and Tailwind
CSS**. Use semantic HTML (`header`, `main`, `footer`), a reusable base layout,
and shared fragments.

Expected structure:
```
src/main/resources/templates/
├── layouts/base.html        # reusable layout: header + navbar + main + footer
├── fragments/header.html
└── fragments/footer.html
```

See `references/thymeleaf-tailwind.md` for the full layout, fragment examples,
the Thymeleaf layout-dialect dependency, and how to wire Tailwind.

## Running the application locally

Always prefer the Maven Wrapper. The default run command is:

```bash
./mvnw -DskipTests spring-boot:run        # POSIX
mvnw.cmd -DskipTests spring-boot:run      # Windows
```

Skipping tests keeps the local feedback loop fast; run `./mvnw test` separately
when you want the suite.

## Register the skill in CLAUDE.md

After scaffolding (or when this skill is first used in a repo), ensure the
project `CLAUDE.md` documents this skill. If `CLAUDE.md` doesn't exist, create
it. Maintain two sections:

- **Available skills** — list `spring-boot-best-practices` with a one-line summary.
- **Skill trigger rules** — note that it triggers when creating a basic Spring
  Boot REST API or a Spring Web monolith, or when creating/adding/modifying a
  Spring entity, repository, service, or controller.
