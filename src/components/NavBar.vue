<template>
    <header>
        <nav class="navbar">
            <div class="navbar-container">
                <div class="navbar-left">
                    <template v-if="role === 'CLIENTE'">
                        <router-link to="/" class="navbar-logo">
                            <span class="navbar-brand">FixyPro</span>
                        </router-link>
                    </template>
                    <template v-if="role === 'PROVEEDOR'">
                        <router-link to="/problemProveedor" class="navbar-logo">
                            <span class="navbar-brand">FixyPro</span>
                        </router-link>
                    </template>
                </div>
                <div class="navbar-right">
                    <!-- Mostrar enlaces solo si el usuario es CLIENTE -->
                    <template v-if="role === 'CLIENTE'">
                        <router-link to="/profile" class="navbar-profile-link">
                            Perfil
                        </router-link>
                        <router-link to="/problem" class="navbar-profile-link">
                            Mis Problemas
                        </router-link>
                    </template>
                    <template v-if="role === 'PROVEEDOR'">
                        <router-link to="/profileproveedor" class="navbar-profile-link">
                            Perfil
                        </router-link>
                        <router-link to="/problemProveedor" class="navbar-profile-link">
                            Todos Los Problemas
                        </router-link>
                        <router-link to="/worksproveedor" class="navbar-profile-link">
                            Problemas Pendientes
                        </router-link>
                        <router-link to="/history" class="navbar-profile-link">
                            Historial
                        </router-link>
                    </template>
                    <!-- Enlace de cerrar sesión visible para todos -->
                    <router-link to="#" @click.prevent="logout" class="logout-link">
                        Cerrar sesión
                    </router-link>
                </div>
            </div>
        </nav>
    </header>

    <!-- Spinner de cierre de sesión -->
    <div v-if="isLoggingOut" class="spinner-overlay">
        <div class="spinner"></div>
        <p>Cerrando sesión...</p>
    </div>
</template>

<script>
import Swal from 'sweetalert2';
const apiUrl = process.env.VUE_APP_API_URL;


export default {
    /* eslint-disable vue/multi-word-component-names */

    name: "Navbar",
    data() {
        return {
            problemas: [],
            loading: true,
            detalleVisible: false,
            detalle: {},
            username: '', // Nombre del usuario logueado
            userImage: '', // Imagen del usuario (si está disponible)
            isLoggingOut: false, // Estado para controlar el spinner
            role: '', // Rol del usuario
        };
    },
    created() {
        this.obtenerPerfilUsuario();
    },
    methods: {
        async obtenerPerfilUsuario() {
            const token = localStorage.getItem('authToken');
            if (!token) {
                this.$router.push('/login');
                return;
            }

            try {
                const response = await fetch(`${apiUrl}/api/user/profile`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const user = await response.json();
                    this.username = user.name || 'Usuario';
                    this.firstSurname = user.firstSurname;
                    this.role = user.role || 'Cliente'; // Suponemos que el rol se pasa desde el backend
                    if (user.photo) {
                        this.userImage = `data:image/jpeg;base64,${user.photo}`; // Si existe una foto de usuario
                    }
                } else {
                    console.error('Error al obtener perfil de usuario');
                    this.username = 'Usuario';
                    this.role = 'Cliente'; // Default a Cliente si no se puede obtener el perfil
                }
            } catch (error) {
                console.error('Error al obtener perfil:', error);
                this.username = 'Usuario';
                this.role = 'Cliente'; // Default a Cliente en caso de error
            }
        },
        async logout() {
            this.isLoggingOut = true; // Activar el estado de "cierre de sesión" para controlar el spinner

            const token = localStorage.getItem('authToken');
            if (token) {
                try {
                    // Mostrar el spinner de SweetAlert2 mientras hacemos la solicitud de cierre de sesión
                    Swal.fire({
                        title: 'Cerrando sesión...',
                        text: 'Por favor, espera un momento.',
                        allowOutsideClick: false,
                        didOpen: () => {
                            Swal.showLoading(); // Muestra el spinner
                        }
                    });

                    // Realizar la solicitud de cierre de sesión al backend
                    const response = await fetch(`${apiUrl}/auth/logout`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                    });

                    if (response.ok) {
                        // Si la respuesta es exitosa, limpiamos el localStorage
                        localStorage.removeItem('authToken');
                        localStorage.removeItem('username');

                        // Esperamos un pequeño retraso para asegurar que el spinner se vea antes de redirigir
                        setTimeout(() => {
                            Swal.close(); // Cerrar el spinner
                            this.$router.push('/login'); // Redirigir al login
                        }, 2000); // Esperar 2 segundos antes de redirigir (ajusta si lo necesitas)
                    } else {
                        // Si la respuesta no es exitosa
                        Swal.fire({
                            icon: 'error',
                            title: 'Error al cerrar sesión',
                            text: 'Por favor, intenta nuevamente.',
                            showConfirmButton: false,
                            timer: 3000
                        });
                    }
                } catch (error) {
                    console.error('Error al cerrar sesión:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al conectar',
                        text: 'No se pudo cerrar sesión.',
                        showConfirmButton: false,
                        timer: 3000
                    });
                } finally {
                    this.isLoggingOut = false; // Desactivar el spinner de la interfaz
                }
            } else {
                Swal.fire({
                    icon: 'warning',
                    title: 'No hay sesión activa',
                    text: 'Por favor, inicia sesión primero.',
                    showConfirmButton: false,
                    timer: 3000
                });
            }
        }
    }
};
</script>

<style scoped>
/* Navbar */
.navbar-profile-link {
    margin-right: 10px;
    color: #ffffff;
    text-decoration: none;
    font-size: 16px;
}

.navbar-profile-link:hover {
    text-decoration: underline;
}

.navbar {
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
    background-color: #003049;
    padding: 12px 0;
    z-index: 1000;
}

.navbar-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    width: 100%;
}

.navbar-left {
    display: flex;
    align-items: center;
}

.navbar-logo img {
    width: 40px;
    height: auto;
}

.navbar-brand {
    color: white;
    font-size: 24px;
    font-weight: 600;
    text-align: center;
    flex-grow: 1;
}

.navbar-right {
    display: flex;
    align-items: center;
}

.navbar-user {
    color: white;
    font-size: 16px;
    margin-right: 20px;
}


/* Enlace de logout */
.logout-link {
    color: white;
    text-decoration: none;
    cursor: pointer;
    font-size: 16px;
}

.logout-link:hover {
    text-decoration: underline;
}

/* Spinner de cierre de sesión */
.spinner-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
}

.spinner {
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top: 4px solid #fff;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
}


@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>
