import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: { sans: ['var(--font-manrope)', 'system-ui', 'sans-serif'] },
      colors: {
        brand: { 50:'#eff6ff',100:'#dbeafe',200:'#bfdbfe',300:'#93c5fd',400:'#60a5fa',500:'#3b82f6',600:'#2563eb',700:'#1d4ed8',800:'#1e40af',900:'#1e3a8a',950:'#0c1a2b' },
        gold: { 50:'#fbf6ea',100:'#f3e6c4',200:'#e8d093',300:'#d9b261',400:'#c89a40',500:'#b2812f',600:'#8f6525',700:'#6f4e1f',800:'#573e1b',900:'#3c2a14' },
        ink: '#10182a',
        paper: '#f5f6f9',
      },
      borderRadius: { '4xl': '2rem' },
    },
  },
  plugins: [],
};
export default config;
