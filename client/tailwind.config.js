/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
        fontFamily: {
        grotesk: ["SpaceGrotesk_400Regular"],
        "grotesk-bold": ["SpaceGrotesk_700Bold"],
        inter: ["InterTight_400Regular"],
        "inter-bold": ["InterTight_700Bold"],
      },
    },
  },
  plugins: [],
}


