<template>

    <header>
        <NavBar />
    </header>
    <div class="contenedor-principal">
        <!-- Navbar -->

        <!-- Spinner de carga -->
        <div v-if="loading" class="spinner-overlay">
            <div class="spinner"></div>
            <p>Cargando problemas cerrados...</p>
        </div>

        <!-- Lista de problemas cerrados -->
        <div v-else class="problemas-cerrados-container">
            <h2>Problemas Cerrados</h2>
            <p v-if="problemasCerrados.length === 0">
                No tienes problemas cerrados.
            </p>
            <table v-else class="problemas-cerrados-tabla">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Título</th>
                        <th>Descripción</th>
                        <th>Dirección</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="problema in problemasCerrados" :key="problema.idProblema">
                        <td>{{ problema.idProblema }}</td>
                        <td>{{ problema.titulo }}</td>
                        <td>{{ problema.descripcion }}</td>
                        <td>{{ problema.ubicacion.direccion }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
import NavBar from '../NavBar';
const apiUrl = process.env.VUE_APP_API_URL;

export default {
    /* eslint-disable vue/multi-word-component-names */
    name: 'HistoryProveedor',
    components: {
        NavBar,
    },
    data() {
        return {
            problemasCerrados: [], // Lista de problemas cerrados
            loading: true, // Estado de carga
        };
    },
    created() {
        this.cargarProblemasCerrados();
    },
    methods: {
        async cargarProblemasCerrados() {
            const token = localStorage.getItem('authToken');

            if (!token) {
                this.$router.push('/login'); // Redirigir al login si no hay token
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
                // Filtrar problemas con estado "CERRADO"
                this.problemasCerrados = data.filter(
                    (problema) => problema.estado === 'CERRADO'
                );
            } catch (error) {
                console.error('Error al cargar problemas cerrados:', error);
            } finally {
                this.loading = false; // Detener el spinner
            }
        },
    },
};
</script>

<style scoped>
.contenedor-principal {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    /* Centra el contenido principal */
}

.problemas-cerrados-container {
    margin-top: 2rem;
    width: 100%;
    /* Para que el contenedor se ajuste */
    text-align: center;
    /* Centra el título */
}

.problemas-cerrados-tabla {
    width: 100%;
    /* Ancho reducido */
    max-width: 800px;
    margin: 0 auto;
    /* Centra la tabla */
    border-collapse: collapse;
    margin-top: 1rem;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    /* Sombra para mejor visualización */
}

.problemas-cerrados-tabla th,
.problemas-cerrados-tabla td {
    border: 1px solid #ddd;
    padding: 6px;
    /* Reduce el espacio de las celdas */
    text-align: center;
    /* Centra el texto en las celdas */
    font-size: 14px;
    /* Letra más pequeña */
}

.problemas-cerrados-tabla th {
    background-color: #f4f4f4;
    font-size: 15px;
    /* Un poco más grande para los encabezados */
    font-weight: bold;
}

.spinner-overlay {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 5%;
}

.spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-top: 4px solid #3498db;
    border-radius: 50%;
    width: 36px;
    height: 36px;
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
