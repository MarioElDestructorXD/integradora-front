// vue.config.js
const apiUrl = process.env.VUE_APP_API_URL;

module.exports = {
  devServer: {
    port: 3000, // Cambia a cualquier puerto que desees (3000 es solo un ejemplo)
    proxy: {
      "/api": {
        target: `${apiUrl}`, // Redirige todas las peticiones /api a tu backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
};
