<template>
    <div class="contenedor-principal">
        <!-- Navbar -->
        <header>
            <NavBar />
        </header>

        <!-- Spinner de cierre de sesión -->
        <div v-if="isLoggingOut" class="spinner-overlay">
            <div class="spinner"></div>
            <p>Cerrando sesión...</p>
        </div>

        <!-- Contenedor principal para problemas y detalles -->
        <!-- Lista de Problemas -->
        <div id="problemas-container" class="problemas-container">
            <p v-if="loading">Cargando problemas...</p>
            <p v-else-if="!problemas.length">No hay problemas disponibles.</p>
            <div v-for="problema in problemas" :key="problema.idProblema" class="problema-card"
                @click="mostrarDetalle(problema)">
                <div class="problema-info">
                    <div class="informacion">
                        <h3>{{ problema.titulo }}</h3>
                        <p><strong>Descripción:</strong> {{ problema.descripcion }}</p>
                        <p><strong>Creado por:</strong> {{ problema.creadoPor }}</p>
                        <p><strong>Dirección:</strong> {{ problema.ubicacion.direccion }}</p>
                        <span :class="['badge', problema.estado]">{{ problema.estado }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal para mostrar los detalles del problema -->
        <div v-if="detalleVisible" class="modal-overlay" @click="cerrarDetalle">
            <div class="modal-content" @click.stop>
                <div class="modal-header">
                    <h3>{{ detalle.titulo }}</h3>
                    <button @click="cerrarDetalle" class="close-btn">×</button>
                </div>
                <div class="modal-body">
                    <p><strong>Descripción:</strong> {{ detalle.descripcion }}</p>
                    <p><strong>Creado por:</strong> {{ detalle.creadoPor }}</p>
                    <p><strong>Dirección:</strong> {{ detalle.ubicacion.direccion }}</p> <!-- Dirección -->
                    <p><strong>Estado:</strong> <span :class="['badge', detalle.estado]">{{ detalle.estado }}</span></p>
                    <img v-if="detalle.fotografia" :src="`data:image/jpeg;base64,${detalle.fotografia}`"
                        alt="Imagen del problema" class="detalle-imagen" />
                    <p v-else>No hay imagen disponible para este problema.</p>
                </div>
                <div class="modal-footer">
                    <button @click="aceptarProblema(detalle.idProblema)" class="accept-btn"
                        :disabled="detalle.estado !== 'ABIERTO'">
                        Aceptar problema
                    </button>
                    <button @click="cancelarProblema(detalle.idProblema)" class="cancel-btn"
                        :disabled="detalle.estado === 'ABIERTO'">
                        Cancelar problema
                    </button>
                    <button @click="cerrarDetalle" class="close-btn">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>


<script>
import Swal from 'sweetalert2';
import NavBar from '../NavBar';
const apiUrl = process.env.VUE_APP_API_URL;

export default {
    name: 'ProblemProveedor',
    components: {
        NavBar
    },
    data() {
        return {
            problemas: [],  // Array para almacenar los problemas
            loading: true,   // Estado de carga
            detalleVisible: false,  // Controlar la visibilidad del modal
            detalle: {},  // Detalles del problema
            username: '',
            problemaId: null,  // Nueva propiedad para almacenar el id del problema            // Nombre del usuario logueado
            userImage: '',  // Imagen del usuario (si está disponible)
            isLoggingOut: false,  // Estado para controlar el spinner de cierre de sesión
        };
    },
    created() {
        this.cargarProblemas();  // Cargar los problemas cuando el componente se crea
        this.obtenerPerfilUsuario();  // Obtener los datos del usuario
    },
    methods: {
        async aceptarProblema(problemaId) {
            const token = localStorage.getItem('authToken');

            if (!token) {
                Swal.fire({
                    icon: 'error',
                    title: 'No autenticado',
                    text: 'Por favor inicia sesión.',
                    timer: 3000,
                });
                return;
            }

            try {
                // Realiza la solicitud PUT al backend para cambiar el estado del problema a 'EN_PROCESO'
                const response = await fetch(`${apiUrl}/api/problemas/${problemaId}/aceptar`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Problema aceptado',
                        text: 'Se te ha asignado este problema.',
                        timer: 3000,
                    });
                    this.cargarProblemas();  // Recargar los problemas después de aceptar
                    this.cerrarDetalle();    // Cerrar el modal de detalle
                } else {
                    const errorData = await response.text();
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al aceptar problema',
                        text: errorData || 'Por favor intenta nuevamente.',
                        timer: 3000,
                    });
                }
            } catch (error) {
                console.error('Error al aceptar problema:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error de conexión',
                    text: 'No se pudo aceptar el problema.',
                    timer: 3000,
                });
            }
        },
        async cancelarProblema(problemaId) {
            const token = localStorage.getItem('authToken');
            if (!token) {
                Swal.fire({
                    icon: 'error',
                    title: 'No autenticado',
                    text: 'Por favor inicia sesión.',
                    timer: 3000,
                });
                return;
            }

            // Realizar la solicitud para cancelar el problema
            try {
                const response = await fetch(`${apiUrl}/api/problemas/${problemaId}/cancelar`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Problema cancelado',
                        text: 'Se ha cancelado el problema y se ha liberado.',
                        timer: 3000,
                    });
                    this.cargarProblemas();  // Recargar los problemas para reflejar el cambio
                    this.cerrarDetalle();    // Cerrar el modal
                } else {
                    const errorData = await response.text();
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al cancelar el problema',
                        text: errorData || 'Por favor intenta nuevamente.',
                        timer: 3000,
                    });
                }
            } catch (error) {
                console.error('Error al cancelar el problema:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error de conexión',
                    text: 'No se pudo cancelar el problema.',
                    timer: 3000,
                });
            }
        },


        abrirFormulario() {
            this.$router.push('/addproveedor');  // Redirigir al formulario para agregar un problema
        },

        // Método para cargar todos los problemas
        async cargarProblemas() {
            const token = localStorage.getItem('authToken');
            if (!token) {
                this.$router.push('/login');
                return;
            }

            try {
                const response = await fetch(`${apiUrl}/api/problemas`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                this.problemas = data.filter(problema => problema.estado === 'ABIERTO');

                // Procesa los datos de los problemas
                this.problemas.forEach((problema) => {
                    const usuario = problema.usuario;
                    problema.creadoPor = `${usuario.name} ${usuario.firstSurname} ${usuario.secondSurname}`;
                    // Asegúrate de que la ubicación esté bien mapeada
                    if (problema.ubicacion) {
                        problema.ubicacion.direccion = problema.ubicacion.direccion || 'Dirección no especificada';
                    }
                });

                console.log('Problemas cargados:', this.problemas);
                this.loading = false;
            } catch (error) {
                console.error('Error al cargar problemas:', error);
                this.loading = false;
            }
        },

        // Método para obtener el perfil del usuario
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
                    this.username = user.name || 'Usuario'; // Usamos el campo 'name' para mostrar el nombre completo
                    this.userId = user.id; // Guardar el ID del usuario
                    if (user.photo) {
                        this.userImage = `data:image/jpeg;base64,${user.photo}`; // Si existe una foto de usuario
                    }
                } else {
                    console.error('Error al obtener perfil de usuario');
                    this.username = 'Usuario';
                }
            } catch (error) {
                console.error('Error al obtener perfil:', error);
                this.username = 'Usuario';
            }
        },

        // Mostrar detalles de un problema
        mostrarDetalle(problema) {
            this.detalle = problema;
            this.detalleVisible = true;
        },
        // Cerrar detalle de un problema
        cerrarDetalle() {
            this.detalleVisible = false;
        },

        // Manejo de errores en la carga de imágenes de problemas
        handleImageError(event) {
            event.target.src = 'placeholder.jpg';
            event.target.alt = 'Imagen no disponible';
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
    },
};
</script>

<style scoped>
/* Navbar */
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

.logout-btn {
    background-color: #dc3545;
    color: white;
    border: none;
    padding: 8px 12px;
    font-size: 14px;
    cursor: pointer;
    border-radius: 5px;
}

.logout-btn:hover {
    background-color: #c82333;
}

/* Contenedor Principal */
.main-container {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    flex-wrap: wrap;
    /* Permite el ajuste de los cards en filas */
    gap: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

/* Lista de Problemas */
.problemas-container {
    display: flex;
    flex-wrap: wrap;
    /* Permite el ajuste de los elementos */
    gap: 20px;
    /* Espacio entre los cards */
    width: 100%;
    padding: 20px;
    justify-content: flex-start;
    margin-top: 2%;
}

/* Estilo para cada card de problema */
.problema-card {
    display: flex;
    flex-direction: column;
    /* Los elementos dentro del card se organizan de manera vertical */
    align-items: center;
    background-color: #e7e7e7;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    gap: 10px;
    /* Espacio entre los elementos dentro del card */
    cursor: pointer;
    transition: transform 0.3s ease;
    margin-bottom: 16px;
    width: 100%;
    max-width: 280px;
    /* Limita el tamaño máximo de los cards */
}

.problema-card:hover {
    transform: scale(1.05);
}

.problema-imagen {
    max-width: 100px;
    max-height: 75px;
    object-fit: cover;
    border-radius: 8px;
}

.informacion {
    display: flex;
    flex-direction: column;
    justify-content: center;
    max-width: 300px;
}

.informacion h3 {
    font-size: 18px;
    color: #333;
    margin-bottom: 10px;
}

.informacion p {
    font-size: 14px;
    color: #555;
    margin-bottom: 10px;
}


/* Modal */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
}

.modal-content {
    background-color: #fff;
    border-radius: 8px;
    padding: 15px;
    max-width: 600px;
    width: 80%;
    box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    gap: 15px;
    overflow-y: auto;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #f1f1f1;
    padding-bottom: 8px;
}

.modal-header h3 {
    margin: 0;
    font-size: 1.2rem;
}

.modal-body {
    font-size: 0.9rem;
    line-height: 1.4;
}

.detalle-imagen {
    max-width: 200px;
    height: auto;
    object-fit: contain;
    border-radius: 8px;
    margin-top: 15px;
}

.modal-footer {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    /* Controla el espacio entre los botones */
}

/* Estilo para el botón Aceptar problema */
.modal-footer .accept-btn {
    background-color: #007bff;
    color: white;
    padding: 8px 15px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.9rem;
}

.modal-footer .accept-btn:hover {
    background-color: #0056b3;
}

/* Estilo para el botón Aceptar problema deshabilitado */
.modal-footer .accept-btn:disabled {
    background-color: #e0e0e0;
    /* Color de fondo gris claro */
    color: #b0b0b0;
    /* Color de texto gris oscuro */
    cursor: not-allowed;
    /* Cambia el cursor para indicar que está deshabilitado */
}

.modal-footer .cancel-btn {
    background-color: #f8c30f;
    /* Color de fondo amarillo */
    color: white;
    padding: 8px 15px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.9rem;
}

/* Cambio de color cuando el botón "Cancelar problema" está habilitado */
.modal-footer .cancel-btn:hover {
    background-color: #e0a800;
    /* Cambio de color cuando se pasa el mouse */
}

/* Estilo para el botón Cancelar problema deshabilitado */
.modal-footer .cancel-btn:disabled {
    background-color: #e0e0e0;
    /* Color de fondo gris claro */
    color: #b0b0b0;
    /* Color de texto gris oscuro */
    cursor: not-allowed;
    /* Cambia el cursor para indicar que está deshabilitado */
}

/* Estilo para el botón Cerrar */
.modal-footer .close-btn {
    background-color: #dc3545;
    /* Color de fondo rojo */
    color: white;
    padding: 8px 15px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.9rem;
}

.modal-footer .close-btn:hover {
    background-color: #c82333;
}



/* Botón flotante */
.floating-button {
    position: fixed;
    bottom: 15px;
    right: 15px;
    background-color: #007bff;
    color: white;
    border: none;
    padding: 12px;
    border-radius: 50%;
    font-size: 20px;
    cursor: pointer;
}

.floating-button:hover {
    background-color: #0056b3;
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

.badge {
    display: inline-block;
    padding: 5px 10px;
    border-radius: 12px;
    color: white;
    font-weight: bold;
    text-transform: uppercase;
}

.badge.ABIERTO {
    background-color: green;
}

.badge.EN_PROCESO {
    background-color: yellow;
    color: black;
    /* El texto en amarillo debe ser de color negro para visibilidad */
}

.badge.CERRADO {
    background-color: red;
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
