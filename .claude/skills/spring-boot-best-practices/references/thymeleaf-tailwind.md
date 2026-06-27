# Thymeleaf + Tailwind layout (Spring Web monolith)

Use this when the Spring Boot app renders HTML pages (not just JSON). The goal is
a single reusable layout with `header` / `navbar` / `footer` and a centered main
content area, plus shared fragments, so every page stays consistent.

## Dependency

Add the Thymeleaf Layout Dialect on top of `spring-boot-starter-thymeleaf` so
pages can `layout:decorate` a base template:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>
<dependency>
    <groupId>nz.net.ultraq.thymeleaf</groupId>
    <artifactId>thymeleaf-layout-dialect</artifactId>
</dependency>
```

## Tailwind CSS

For a course/simple setup, pull Tailwind via the Play CDN in the base layout
(`<script src="https://cdn.tailwindcss.com"></script>`). For production, install
the Tailwind CLI and build `static/css/app.css` from a source stylesheet, then
link that instead of the CDN. Default to the CDN unless the user asks for a build
pipeline.

## File structure

```
src/main/resources/templates/
├── layouts/base.html
├── fragments/header.html
├── fragments/footer.html
└── index.html            # a page that decorates the base layout
```

## `layouts/base.html`

Semantic shell: `<header>` + nav, centered `<main>`, `<footer>`. The
`layout:fragment="content"` slot is where each page injects its body.

```html
<!DOCTYPE html>
<html lang="en"
      xmlns:th="http://www.thymeleaf.org"
      xmlns:layout="http://www.ultraq.net.nz/thymeleaf/layout">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title layout:title-pattern="$CONTENT_TITLE">App</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="flex min-h-screen flex-col bg-slate-50 text-slate-900">

    <header th:replace="~{fragments/header :: header}"></header>

    <main class="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <div layout:fragment="content">
            <!-- page content goes here -->
        </div>
    </main>

    <footer th:replace="~{fragments/footer :: footer}"></footer>

</body>
</html>
```

## `fragments/header.html`

```html
<header xmlns:th="http://www.thymeleaf.org"
        th:fragment="header"
        class="border-b border-slate-200 bg-white">
    <div class="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <a th:href="@{/}" class="text-lg font-semibold text-slate-800">App</a>
        <nav class="flex gap-4 text-sm text-slate-600">
            <a th:href="@{/}" class="hover:text-slate-900">Home</a>
            <a th:href="@{/about}" class="hover:text-slate-900">About</a>
        </nav>
    </div>
</header>
```

## `fragments/footer.html`

```html
<footer xmlns:th="http://www.thymeleaf.org"
        th:fragment="footer"
        class="border-t border-slate-200 bg-white">
    <div class="mx-auto max-w-3xl px-4 py-4 text-center text-sm text-slate-500">
        <span th:text="|© ${#dates.format(#dates.createNow(), 'yyyy')} App|">© App</span>
    </div>
</footer>
```

## A page using the layout — `index.html`

```html
<!DOCTYPE html>
<html lang="en"
      xmlns:th="http://www.thymeleaf.org"
      xmlns:layout="http://www.ultraq.net.nz/thymeleaf/layout"
      layout:decorate="~{layouts/base}">
<head>
    <title>Home</title>
</head>
<body>
    <section layout:fragment="content">
        <h1 class="text-2xl font-bold text-slate-800">Welcome</h1>
        <p class="mt-2 text-slate-600">Server-rendered with Thymeleaf + Tailwind.</p>
    </section>
</body>
</html>
```

## Controller for views

For pages, use `@Controller` (not `@RestController`) and return the **view name**:

```java
@Controller
public class HomeController {
    @GetMapping("/")
    public String index(Model model) {
        // model.addAttribute("products", ...);
        return "index";   // resolves to templates/index.html
    }
}
```

Keep the REST API controllers (`@RestController`, returning DTOs) separate from
the view controllers (`@Controller`, returning template names).
