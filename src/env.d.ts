// The consumer's bundler replaces process.env.NODE_ENV (Vite, webpack, Vitest all do), so
// dev-only checks in the kit drop out of production builds. Vite library mode would bake
// import.meta.env.DEV in at the kit's own build time instead, so it can't be used here.
declare const process: { env: { NODE_ENV?: string } }
