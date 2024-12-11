<template>
    <div class="contenedor-principal">
        <!-- Navbar -->
        <header>
            <NavBar />
        </header>

        <!-- Contenedor principal para problemas y detalles -->
        <div id="problemas-container" class="problemas-container">
            <div class="filtro-categorias">
                <label for="categoria">Filtrar por categoría:</label>
                <select id="categoria" v-model="categoriaSeleccionada" @change="filtrarProblemas">
                    <option value="">Todas</option>
                    <option v-for="categoria in categoriasUnicas" :key="categoria" :value="categoria">
                        {{ categoria }}
                    </option>
                </select>
            </div>

            <!-- Mostrar mensaje de carga si loading es verdadero -->
            <div v-if="loading" class="spinner-container">
                <div class="spinner"></div>
                <p class="loading-text">Cargando...</p>
            </div>


            <p v-else-if="!problemas.length">No tienes problemas registrados.</p>

            <div v-for="problema in problemasFiltrados" :key="problema.id" class="problema-card"
                @click="mostrarDetalle(problema)">
                <div class="problema-info">
                    <div class="informacion">
                        <h3>{{ problema.titulo }}</h3>
                        <p><strong>Descripción:</strong> {{ problema.descripcion }}</p>
                        <p v-if="problema.ubicacion"><strong>Ubicación:</strong> {{ problema.ubicacion.direccion }}</p>
                        <p><strong>Categoria:</strong> {{ problema.categoria }}</p>
                    </div>
                    <span :class="`badge ${problema.estado}`">{{ problema.estado }}</span>
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
                    <p v-if="detalle.ubicacion"><strong>Ubicación:</strong> {{ detalle.ubicacion.direccion }}</p>
                    <p><strong>Categoria:</strong> {{ detalle.categoria }}</p>
                    <img v-if="detalle.fotografia" :src="`data:image/jpeg;base64,${detalle.fotografia}`"
                        alt="Imagen del problema" class="detalle-imagen" />
                    <p v-else>No hay imagen disponible para este problema.</p>
                </div>
                <div class="modal-footer">
                    <button @click="cerrarDetalle" class="close-btn">Cerrar</button>
                </div>
            </div>
        </div>

        <!-- Botón flotante -->
        <button class="floating-button" @click="abrirFormulario">
            <font-awesome-icon icon="plus" class="button-icon" />
        </button>
    </div>
</template>

<script>
import NavBar from '../NavBar.vue';
const apiUrl = process.env.VUE_APP_API_URL;

export default {
    components: {
        NavBar
    },
    /* eslint-disable vue/multi-word-component-names */
    name: 'Problem',
    data() {
        return {
            problemas: [],
            loading: true,
            detalleVisible: false,
            detalle: {},
            username: '', // Nombre del usuario logueado
            userImage: '', // Imagen del usuario (si está disponible)
            isLoggingOut: false, // Estado para controlar el spinner
            categoriaSeleccionada: '', // Categoría seleccionada
        };
    },
    computed: {
        // Categorías únicas para mostrar en el selector
        categoriasUnicas() {
            const categorias = this.problemas.map((problema) => problema.categoria);
            return [...new Set(categorias)];
        },
        // Filtrar problemas según la categoría seleccionada
        problemasFiltrados() {
            if (!this.categoriaSeleccionada) {
                return this.problemas;
            }
            return this.problemas.filter(
                (problema) => problema.categoria === this.categoriaSeleccionada
            );
        },
    },
    created() {
        this.cargarProblemas();
        this.obtenerPerfilUsuario();
    },
    methods: {
        filtrarProblemas() {
            // Este método es opcional ya que `problemasFiltrados` es reactivo
            console.log('Categoría seleccionada:', this.categoriaSeleccionada);
        },
        abrirFormulario() {
            this.$router.push('/addproblem');
        },
        // Método para cargar los problemas del usuario logueado
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
                this.problemas = data || [];
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


    },
};
</script>

<style scoped>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: "Poppins", sans-serif;
}


/* Contenedor Principal */
.main-container {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

/* Lista de Problemas */
.problemas-container {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    width: 100%;
    padding: 20px;
    justify-content: flex-start;
    margin-top: 2%;
}

/* Estilo para cada card de problema */
.problema-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #e7e7e7;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    gap: 10px;
    cursor: pointer;
    transition: transform 0.3s ease;
    margin-bottom: 16px;
    width: 100%;
    max-width: 280px;
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

/* Estilos para el badge de estado */
.badge {
    display: inline-block;
    padding: 5px 10px;
    font-size: 14px;
    font-weight: bold;
    border-radius: 12px;
    color: white;
    text-transform: uppercase;
    text-align: center;
}

.badge.ABIERTO {
    background-color: #28a745;
    /* Verde */
}

.badge.EN_PROCESO {
    background-color: #ffc107;
    /* Amarillo */
}

.badge.CERRADO {
    background-color: #dc3545;
    /* Rojo */
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

.close-btn {
    background: none;
    border: none;
    font-size: 1.2rem;
    color: #333;
    cursor: pointer;
}

.close-btn:hover {
    color: #dc3545;
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
    justify-content: flex-end;
}

.modal-footer .close-btn {
    background-color: #007bff;
    color: white;
    padding: 8px 15px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.9rem;
}

.modal-footer .close-btn:hover {
    background-color: #0056b3;
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

#problemas-container {
    margin-top: 0;
    /* Asegura que no haya margen extra */
}

.filtro-categorias {
    width: 100%;
    margin-bottom: 1rem;
    /* Espacio con el contenedor de problemas */
    display: flex;
    justify-content: flex-start;
    /* Alinear el contenido a la izquierda */
    align-items: center;
    gap: 0.5rem;
    /* Espacio entre el label y el select */
}

.filtro-categorias label {
    font-weight: bold;
    font-size: 1rem;
}


.spinner-container {
    display: flex;
    flex-direction: column;
    /* Asegura que el spinner y el texto estén en una columna */
    justify-content: center;
    align-items: center;
    margin-top: 10%;
    /* Asegura que ocupe toda la altura de la ventana */
    width: 100%;
    /* Asegura que ocupe todo el ancho disponible */
    text-align: center;
    /* Centra el texto debajo del spinner */
}

.spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    width: 100px;
    height: 100px;
    animation: spin 2s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.loading-text {
    margin-top: 10px;
    /* Espacio entre el spinner y el texto */
    font-size: 18px;
    color: #3498db;
    /* Color opcional para el texto */
}
</style>
