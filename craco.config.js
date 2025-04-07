const path = require("path");

module.exports = {
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@components": path.resolve(__dirname, "src/components"),
      "@lib": path.resolve(__dirname, "src/lib"),
      "@utils": path.resolve(__dirname, "src/lib/utils"),
      "@ui": path.resolve(__dirname, "src/components/ui"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
    },
  },
};
