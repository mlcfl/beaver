// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt({
  rules: {
    "vue/block-order": [
      "warn",
      {
        order: ["style", "template", "script"],
      },
    ],
    "vue/html-self-closing": [
      "warn",
      {
        html: {
          void: "always",
        },
      },
    ],
  },
});
