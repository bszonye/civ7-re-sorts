// eslint.config.js
import js from "@eslint/js";

export default [
    js.configs.recommended,
    {
        rules: {
            "no-unused-vars": [
                "warn",
                {
                    "varsIgnorePattern": "^_",
                    "argsIgnorePattern": "^_",
                }
            ]
        },
        languageOptions: {
            globals: {
                CategoryType: "readonly",
                Cities: "readonly",
                Controls: "readonly",
                Game: "readonly",
                GameInfo: "readonly",
                GrowthTypes: "readonly",
                HTMLElement: "readonly",
                InputActionStatuses: "readonly",
                Locale: "readonly",
                Options: "readonly",
                OptionType: "readonly",
                UI: "readonly",
                clearInterval: "readonly",
                console: "readonly",
                document: "readonly",
                engine: "readonly",
                localStorage: "readonly",
                performance: "readonly",
                setInterval: "readonly",
                waitForLayout: "readonly",
            }
        }

    }
];
