import { createApp } from "vue";
import App from "./App.vue";
import "bootstrap/dist/css/bootstrap.min.css";
import router from "../src/router/router";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faUser,
  faPhone,
  faEnvelope,
  faLock,
  faUserShield,
  faCamera,
  faPlus,
  faCloudArrowUp,
  faPen,
  faList,
  faCompass,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import VueGoogleMaps from "@fawmi/vue-google-maps";

// Configurar la biblioteca de iconos FontAwesome
library.add(
  faUser,
  faPhone,
  faEnvelope,
  faLock,
  faUserShield,
  faCamera,
  faPlus,
  faCloudArrowUp,
  faPen,
  faList,
  faCompass,
  faTrash,
);

// Crear la aplicación Vue
const app = createApp(App);

// Registrar componentes globales
app.component("font-awesome-icon", FontAwesomeIcon);

// Configurar el plugin de Google Maps para Vue 3
app.use(VueGoogleMaps, {
  load: {
    key: "AIzaSyCQgMteLzSxVMsiLHGZ9LFwPbqRsnIMUzU", // Cambia por tu clave API válida
    libraries: "places",
  },
});

// Usar el router
app.use(router);

// Montar la aplicación
app.mount("#app");
