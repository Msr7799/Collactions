/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        "high-light-bg": "var(--high-light-bg)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
        "primary-hover": "var(--primary-hover)",
        secondary: "var(--secondary)",
        border: "var(--border)",
        muted: "var(--muted)",
        input: "var(--input)",
        danger: "var(--danger)",
        warning: "var(--warning)",
        success: "var(--success)",
        light: "var(--light)",
        glow: "var(--glow)",
        "bg-dark": "var(--bg-dark)",
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
}