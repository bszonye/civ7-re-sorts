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
                Configuration: "readonly",
                Constructibles: "readonly",
                Controls: "readonly",
                Game: "readonly",
                GameContext: "readonly",
                GameInfo: "readonly",
                GameplayMap: "readonly",
                GrowthTypes: "readonly",
                HTMLElement: "readonly",
                InputActionStatuses: "readonly",
                Locale: "readonly",
                Options: "readonly",
                OptionType: "readonly",
                PlayerOperationParameters: "readonly",
                PlayerOperationTypes: "readonly",
                UI: "readonly",
                clearInterval: "readonly",
                console: "readonly",
                document: "readonly",
                engine: "readonly",
                localStorage: "readonly",
                performance: "readonly",
                requestAnimationFrame: "readonly",
                setInterval: "readonly",
                setTimeout: "readonly",
                waitForLayout: "readonly",
            }
        }

    }
];
