import type { Config } from "tailwindcss";
const {
  default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");
const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    screens: {
      xxxl: { max: "2263px" },
      xlx: { max: "2097px" },
      xxl: { max: "1957px" },
      xxds: { max: "1771px" },
      xds: { max: "1583px" },
      xl: { max: "1440px" },

      //ignore just for search page
      h1text: { max: "1368px" },
      h1text2: { max: "1683px" },
      h1text3: { max: "1567px" },
      h1text4: { max: "1452px" },
      h1text5: { max: "1400px" },
      ds: { max: "1380px" },
      h1text6: { max: "1309px" },
      h1text7: { max: "1139px" },
      // => @media (max-width: 1279px) { ... }
      lg: { max: "1024px" },
      // => @media (max-width: 1023px) { ... }
      h1text8: { max: "946px" },

      xmd: { max: "890px" },
      xssmd: { max: "863px" },
      xsmd: { max: "774px" },
      md: { max: "770px" },
      // => @media (max-width: 767px) { ... }
      //ignore just for search page
      smd: { max: "655px" },
      //-----

      sm: { max: "639px" },

      //ignore just for search page
      ss: { max: "620px" },
      sss: { max: "560px" },
      //--------

      s: { max: "480px" }, //use to be 425

      //ignore just for search page
      h1text9: { max: "385px" },
      //---------

      xss: { max: "375px" },
      xs: { max: "320px" },

      // => @media (max-width: 639px) { ... }
    },
    extend: {
      fontFamily: {
        chillax: ["var(--font-chillax)"],
      },
      colors: {
        backgroundM: "#0d0c0f",
        textMain: "#F8FCFF",
        primaryM: {
          50: "#fefaed",
          100: "#fcf0c8",
          200: "#fae9ad",
          300: "#f8df88",
          400: "#f7d971",
          500: "#f5cf4d",
          600: "#dfbc46",
          700: "#ae9337",
          800: "#87722a",
          900: "#675720",
        },
        border: "hsl(var(--b0order))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "#10100E",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), addVariablesForColors],
} satisfies Config;

export default config;

// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
function addVariablesForColors({ addBase, theme }: any) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val]),
  );

  addBase({
    ":root": newVars,
  });
}
