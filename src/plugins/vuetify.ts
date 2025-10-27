import { createVuetify } from "vuetify";

export default defineNuxtPlugin((app) => {
	const vuetify = createVuetify({
		display: {
			mobileBreakpoint: "md",
		},
	});

	app.vueApp.use(vuetify);
});
