import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

// Init render mode based on env
const mode = process.env.RENDER_MODE ?? "CSR";
const ssrEnabled = () => {
	return ["SSR", "SSG"].includes(mode);
};
const getNitroPreset = () => {
	return {
		CSR: "static",
		SSR: "node-listener",
		SSG: "static",
	}[mode];
};

export default defineNuxtConfig({
	ssr: ssrEnabled(),
	nitro: {
		preset: getNitroPreset(),
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
});
