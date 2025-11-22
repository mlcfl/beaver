import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

const port = process.env.PORT ?? 7000;

export default defineNuxtConfig({
	ssr: false,
	nitro: {
		// Support API routes and preview
		preset: "node-server",
		// Important enable this to avoid MODULE_NOT_FOUND error from the server side
		noExternals: true,
		// Optional
		sourceMap: false,
		minify: true,
	},
	compatibilityDate: "2025-04-03",
	future: {
		compatibilityVersion: 4,
	},
	srcDir: "src",
	devtools: { enabled: false },
	build: {
		transpile: ["vuetify"],
	},
	css: [
		"@mdi/font/css/materialdesignicons.css",
		"vuetify/styles",
		"~/assets/styles/global.scss",
	],
	modules: [
		"@nuxt/eslint",
		"@pinia/nuxt",
		"@vueuse/nuxt",
		(_options, nuxt) => {
			nuxt.hooks.hook("vite:extendConfig", (config) => {
				config.plugins?.push(vuetify({ autoImport: true }));
			});
		},
	],
	vite: {
		vue: {
			template: {
				transformAssetUrls,
			},
		},
	},
	app: {
		head: {
			link: [
				// WebP favicon
				{
					rel: "icon",
					type: "image/webp",
					href: "/favicon.webp",
				},
			],
		},
	},
	runtimeConfig: {
		public: {
			apiBase: "", // overridden by NUXT_PUBLIC_API_BASE
		},
	},
	devServer: {
		port: Number(port),
	},
});
