import { createRouter, createWebHistory } from "vue-router";
import Login from "../components/auth/Login.vue";
import Register from "../components/auth/Register.vue";
import Problem from "../components/user/Problem.vue";
import AddProblem from "../components/user/AddProblem.vue";
import ProblemProveedor from "../components/userproveedor/ProblemProveedor.vue";
import Profile from "../components/user/Profile.vue";
import ProfileProveedor from "../components/userproveedor/ProfileProveedor.vue";
import WorksProveedor from "../components/userproveedor/WorksProveedor.vue";
import HistoryProveedor from "../components/userproveedor/HistoryProveedor.vue";
// Función para verificar si el usuario está autenticado
function isAuthenticated() {
  return !!localStorage.getItem("authToken");
}

const routes = [
  {
    path: "/",
    redirect: "/login", // Redirige al Login cuando accedes a la raíz
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    beforeEnter: (to, from, next) => {
      if (isAuthenticated()) {
        next("/problem"); // Si el usuario está logueado, redirige a la página de problemas
      } else {
        next(); // Si no está autenticado, permite el acceso a Login
      }
    },
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
    beforeEnter: (to, from, next) => {
      if (isAuthenticated()) {
        next("/problem"); // Si el usuario está logueado, redirige a la página de problemas
      } else {
        next(); // Si no está autenticado, permite el acceso a Register
      }
    },
  },
  {
    path: "/problem",
    name: "Problema",
    component: Problem,
    beforeEnter: (to, from, next) => {
      if (!isAuthenticated()) {
        next("/login"); // Si no está logueado, redirige al Login
      } else {
        next(); // Si está logueado, permite el acceso a la página de problemas
      }
    },
  },
  {
    path: "/problemProveedor",
    name: "ProblemaProveedor",
    component: ProblemProveedor,
    beforeEnter: (to, from, next) => {
      if (!isAuthenticated()) {
        next("/login"); // Si no está logueado, redirige al Login
      } else {
        next(); // Si está logueado, permite el acceso a la página de problemas
      }
    },
  },
  {
    path: "/addproblem", // Nueva ruta para agregar problemas
    name: "AddProblem",
    component: AddProblem, // Referencia al componente AddProblem
    beforeEnter: (to, from, next) => {
      if (!isAuthenticated()) {
        next("/login"); // Si no está logueado, redirige al Login
      } else {
        next(); // Si está logueado, permite el acceso a la página de agregar problema
      }
    },
  },
  {
    path: "/profile", // Nueva ruta para agregar problemas
    name: "Profile",
    component: Profile, // Referencia al componente AddProblem
    beforeEnter: (to, from, next) => {
      if (!isAuthenticated()) {
        next("/login"); // Si no está logueado, redirige al Login
      } else {
        next(); // Si está logueado, permite el acceso a la página de agregar problema
      }
    },
  },
  {
    path: "/profileproveedor", // Nueva ruta para agregar problemas
    name: "ProfileProveedor",
    component: ProfileProveedor, // Referencia al componente AddProblem
    beforeEnter: (to, from, next) => {
      if (!isAuthenticated()) {
        next("/login"); // Si no está logueado, redirige al Login
      } else {
        next(); // Si está logueado, permite el acceso a la página de agregar problema
      }
    },
  },
  {
    path: "/worksproveedor", // Nueva ruta para agregar problemas
    name: "WorksProveedor",
    component: WorksProveedor, // Referencia al componente AddProblem
    beforeEnter: (to, from, next) => {
      if (!isAuthenticated()) {
        next("/login"); // Si no está logueado, redirige al Login
      } else {
        next(); // Si está logueado, permite el acceso a la página de agregar problema
      }
    },
  },
  {
    path: "/history", // Nueva ruta para agregar problemas
    name: "HistoryProveedor",
    component: HistoryProveedor, // Referencia al componente AddProblem
    beforeEnter: (to, from, next) => {
      if (!isAuthenticated()) {
        next("/login"); // Si no está logueado, redirige al Login
      } else {
        next(); // Si está logueado, permite el acceso a la página de agregar problema
      }
    },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
