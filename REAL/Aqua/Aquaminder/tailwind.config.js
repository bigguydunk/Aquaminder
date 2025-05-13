const {heroui} = require('@heroui/theme');
module.exports = {
  content: [
    "./node_modules/@heroui/theme/dist/components/(date-picker|button|ripple|spinner|calendar|date-input|form|popover).js"
],
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [heroui()],
}
