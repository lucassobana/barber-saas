// src/lib/theme.ts
import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false, // Mude para true se quiser que siga o sistema do usuário
};

export const theme = extendTheme({
  config,
  semanticTokens: {
    colors: {
      // --- Backgrounds ---
      "bg-app": { default: "#090909" },
      "bg-sidebar": { default: "#111111" },
      "bg-surface": { default: "#181818" },
      "bg-surface-secondary": { default: "#202020" },
      "bg-surface-hover": { default: "#292929" },

      // --- Borders ---
      "border-subtle": { default: "#2F2F2F" },
      "border-hover": { default: "#4A4A4A" },

      // --- Typography ---
      "text-primary": { default: "#F5F5F5" },
      "text-secondary": { default: "#B3B3B3" },
      "text-muted": { default: "#7A7A7A" },

      // --- Brand (Cobre da logo) ---
      "brand-primary": { default: "#A45B24" },
      "brand-hover": { default: "#C87433" },
      "brand-active": { default: "#7F4418" },
      "brand-soft": { default: "rgba(164,91,36,.14)" },

      // --- Status ---
      "status-success": { default: "#3FB950" },
      "status-warning": { default: "#F0B429" },
      "status-error": { default: "#F85149" },
      "status-info": { default: "#58A6FF" },
    },
    shadows: {
      "card-shadow": {
        default: "0 0 0 1px rgba(255,255,255,.03), 0 20px 40px rgba(0,0,0,.35)",
        _dark: "0 1px 3px rgba(0,0,0,0.05), 0 10px 15px -3px rgba(0,0,0,0.05)",
      },
      "focus-glow": {
        default: "0 0 0 3px rgba(34, 211, 238, 0.25)",
        _dark: "0 0 0 3px rgba(8, 145, 178, 0.25)",
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: "bg-app",
        color: "text-primary",
      },
    },
  },
  // --- Princípios de Design (Bordas arredondadas 10-14px e visual clean) ---
  components: {
    Button: {
      baseStyle: {
        borderRadius: "xl", // ~12px
        fontWeight: "medium",
      },
    },
    Input: {
      defaultProps: {
        focusBorderColor: "transparent",
      },
      variants: {
        outline: {
          field: {
            borderRadius: "xl",
            bg: "bg-surface",
            borderColor: "border-subtle",
            _hover: { borderColor: "border-hover" },
            _focus: {
              borderColor: "brand-primary",
              boxShadow: "focus-glow",
            },
          },
        },
      },
    },
    Select: {
      variants: {
        outline: {
          field: {
            borderRadius: "xl",
            bg: "bg-surface",
            borderColor: "border-subtle",
            _hover: { borderColor: "border-hover" },
            _focus: {
              borderColor: "brand-primary",
              boxShadow: "focus-glow",
            },
          },
        },
      },
    },
  },
});
