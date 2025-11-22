# Builder "Beaver"

Beaver is the entry point to the entire MLC infrastructure. It provides a comprehensive management interface for the entire project, allowing you to control shared components, all applications and their parts. With this builder, you can install, remove, and edit applications within the project, manage build processes, and configure the overall project structure.

## Requirements

Before installing, ensure you have the following prerequisites:

- **Node.js** version 25 or higher
- **pnpm** version 10.8 or higher

## Setup

Create a directory named `mlc` on your computer. Clone this repository into it, navigate to the directory, and run the following commands sequentially:

1. Install dependencies:

```bash
pnpm install --frozen-lockfile
```

If you encounter an error with `--frozen-lockfile`, run:

```bash
pnpm install
```

2. Build the project:

```bash
pnpm build
```

3. Start the server:

```bash
pnpm start
```

For development mode, use:

```bash
pnpm dev
```

## Scripts

The following commands are available in `package.json`:

- **`pnpm build`** - Builds the application for production
- **`pnpm dev`** - Starts the development server with hot module replacement
- **`pnpm start`** - Starts the production server
- **`pnpm lint`** - Runs ESLint to check code for linting errors
- **`pnpm lint:fix`** - Runs ESLint and automatically fixes linting errors where possible
- **`pnpm postinstall`** - Automatically runs after `pnpm install` to prepare Nuxt (runs `nuxt prepare`)

## License

[CC BY-NC-ND 4.0](LICENSE)
