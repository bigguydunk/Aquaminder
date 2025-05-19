const {heroui} = require('@heroui/theme');
module.exports = {
  content: [
    "./node_modules/@heroui/theme/dist/components/(button|date-picker|dropdown|radio|ripple|spinner|calendar|date-input|form|popover|menu|divider).js"
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
