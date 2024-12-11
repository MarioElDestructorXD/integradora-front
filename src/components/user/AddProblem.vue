<template>
    <div>
        <!-- Navbar -->
        <header>
            <NavBar />
        </header>

        <!-- Contenido de Creación de Problema -->
        <div class="wrapper">
            <div class="title"><span>Crear Problema</span></div>
            <form @submit.prevent="handleSubmit">
                <div class="row">
                    <div class="input-icon-container">
                        <font-awesome-icon icon="pen" class="input-icon" />
                    </div>
                    <input v-model="titulo" type="text" placeholder="Título del problema" required />
                </div>

                <div class="row">
                    <div class="input-icon-container">
                        <font-awesome-icon icon="pen" class="input-icon" />
                    </div>
                    <input v-model="descripcion" type="text" placeholder="Descripción del problema" required />
                </div>

                <div class="row">
                    <div class="input-icon-container">
                        <font-awesome-icon icon="cloud-arrow-up" class="input-icon" />
                    </div>
                    <input type="file" accept="image/*" @change="handleFotoChange" />
                </div>

                <div class="row">
                    <div class="input-icon-container">
                        <font-awesome-icon icon="list" class="input-icon" />
                    </div>
                    <select v-model="categoria" required>
                        <option value="">Selecciona categoría</option>
                        <option value="CARPINTERIA">Carpintería</option>
                        <option value="PLOMERIA">Plomería</option>
                        <option value="ELECTRICIDAD">Electricidad</option>
                        <option value="ALBAÑILERIA">Albañilería</option>
                    </select>
                </div>

                <!-- Select para direcciones -->
                <div class="row">
                    <div class="input-icon-container">
                        <font-awesome-icon icon="map-marker-alt" class="input-icon" />
                    </div>
                    <div class="row">
                        <div class="input-icon-container">
                            <font-awesome-icon icon="map-marker-alt" class="input-icon" />
                        </div>
                        <select v-model="ubicacionSeleccionada" required>
                            <option value="">Selecciona una dirección</option>
                            <option v-for="ubicacion in ubicaciones" :key="ubicacion.id" :value="ubicacion.id">
                                {{ ubicacion.direccion }}
                            </option>
                        </select>
                    </div>


                </div>


                <div class="form-actions">
                    <button type="submit" class="btn-primary">Crear Problema</button>
                </div>
            </form>
        </div>
    </div>
</template>


<script>
import Swal from 'sweetalert2';
import NavBar from '../NavBar.vue';

export default {
    name: 'AddProblem',
    components: {
        NavBar,
    },
    data() {
        return {
            profile: {
                id: "",
                name: "",
                firstSurname: "",
                secondSurname: "",
                email: "",
                phone: "",
                profileImage: "",
            },
            titulo: '',
            descripcion: '',
            foto: null,  // Almacena la foto seleccionada
            categoria: '',
            ubicaciones: [], // Lista de ubicaciones del usuario
            ubicacionSeleccionada: '', // Dirección seleccionada
        };
    },
    mounted() {
        console.log('Comenzando a obtener ubicaciones...');
        this.obtenerUbicaciones();
    },
    methods: {

        async obtenerUbicaciones() {
            const apiUrl = process.env.VUE_APP_API_URL;
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    console.log('No hay token de autenticación. Redirigiendo al login...');
                    this.$router.push('/login');
                    return;
                }

                // Aseguramos que profile.id esté disponible
                if (!this.profile.id) {
                    console.log('No se ha encontrado el profile.id, obteniendo perfil...');
                    await this.obtenerPerfilUsuario(); // Llamamos a la función para cargar el perfil
                }

                if (!this.profile.id) {
                    console.log('No se pudo obtener el perfil del usuario');
                    throw new Error('El perfil del usuario no está disponible.');
                }

                const url = `${apiUrl}/api/ubicaciones/usuario/${this.profile.id}`;
                console.log('URL de la solicitud de ubicaciones:', url); // Verificamos la URL

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    console.log('Error al obtener las ubicaciones:', response.status, response.statusText);
                    throw new Error('Error al obtener las ubicaciones');
                }

                const data = await response.json();
                console.log('Datos obtenidos de ubicaciones:', data);  // Verificamos los datos recibidos

                this.ubicaciones = data; // Asignamos las ubicaciones obtenidas al estado
            } catch (error) {
                console.error('Error al obtener ubicaciones:', error);
                await Swal.fire({
                    title: 'Error',
                    text: error.message || 'No se pudieron cargar las direcciones.',
                    icon: 'error',
                    confirmButtonText: 'Entendido',
                });
            }
        },

        async obtenerPerfilUsuario() {
            const apiUrl = process.env.VUE_APP_API_URL;

            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    console.log('No hay token de autenticación. Redirigiendo al login...');
                    this.$router.push('/login');
                    return;
                }

                const response = await fetch(`${apiUrl}/api/user/profile`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    console.log('Error al obtener el perfil del usuario:', response.status, response.statusText);
                    throw new Error('Error al obtener el perfil del usuario');
                }

                const data = await response.json();
                console.log('Datos obtenidos del perfil del usuario:', data); // Verificamos los datos del perfil

                this.profile = data; // Asignamos el perfil obtenido
            } catch (error) {
                console.error('Error al obtener el perfil del usuario:', error);
                await Swal.fire({
                    title: 'Error',
                    text: 'No se pudo cargar el perfil del usuario.',
                    icon: 'error',
                    confirmButtonText: 'Entendido',
                });
            }
        },

        // Este es un método auxiliar para comprobar y mostrar las direcciones
        async mostrarDirecciones() {
            console.log('Direcciones obtenidas:', this.ubicaciones);
            // Aquí puedes realizar cualquier lógica adicional para mostrar las direcciones en el frontend
        },
        handleFotoChange(event) {
            const file = event.target.files[0]; // Obtiene el archivo seleccionado
            if (file) {
                const reader = new FileReader(); // Crea una instancia de FileReader
                reader.onloadend = () => {
                    // Divide la cadena resultante para obtener solo los datos base64
                    this.foto = reader.result.split(',')[1];
                };
                reader.readAsDataURL(file); // Lee el archivo como una URL de datos (base64)
            }
        },

        async handleSubmit() {
            const apiUrl = process.env.VUE_APP_API_URL;

            const confirmCreate = await Swal.fire({
                title: '¿Estás seguro?',
                text: '¿Quieres crear este problema con los datos proporcionados?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, crear',
                cancelButtonText: 'No, cancelar',
            });

            if (!confirmCreate.isConfirmed) return;

            // Validación de campos requeridos
            if (!this.titulo || !this.descripcion || !this.categoria || !this.ubicacionSeleccionada) {
                await Swal.fire({
                    title: 'Campos incompletos',
                    text: 'Por favor, completa todos los campos.',
                    icon: 'warning',
                    confirmButtonText: 'Entendido',
                });
                return;
            }

            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    throw new Error('No autenticado');
                }

                // Payload que se enviará al backend
                const data = {
                    titulo: this.titulo,
                    descripcion: this.descripcion,
                    categoria: this.categoria,
                    fotografia: this.foto, // Ya convertida a base64 en handleFotoChange
                    ubicacionId: this.ubicacionSeleccionada, // Asignar correctamente el ID de la ubicación
                };

                const response = await fetch(`${apiUrl}/api/problemas/post`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(data),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al crear el problema');
                }

                await Swal.fire({
                    title: 'Problema creado',
                    text: 'Tu problema ha sido creado exitosamente.',
                    icon: 'success',
                    confirmButtonText: 'Continuar',
                });

                this.$router.push('/problem'); // Redirigir después de crear
            } catch (error) {
                await Swal.fire({
                    title: 'Error',
                    text: error.message || 'Error al conectarse al servidor.',
                    icon: 'error',
                    confirmButtonText: 'Entendido',
                });
            }
        }

    },
};
</script>



<style scoped>
/* Estilos CSS similares al formulario de registro */
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap");

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: "Poppins", sans-serif;
}

body {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    padding: 15px;
    background: #f8f8f8;
    overflow: hidden;
}

/* Wrapper para el formulario */
.wrapper {
    width: 100%;
    max-width: 700px;
    min-width: 250px;
    background: #fff;
    border-radius: 5px;
    box-shadow: 0px 4px 10px 1px rgba(0, 0, 0, 0.1);
    margin: 50px auto;
}

.wrapper .title {
    padding: 18px;
    background: #003049;
    border-radius: 5px 5px 0 0;
    color: #fff;
    font-size: 26px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
}

/* Estilo de formulario y sus campos */
.wrapper form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
    padding: 20px;
}

.wrapper form .row {
    position: relative;
}

.wrapper form .row input,
.wrapper form .row select,
.wrapper form .row textarea {
    height: 45px;
    width: 100%;
    outline: none;
    padding-left: 45px;
    border-radius: 5px;
    border: 1px solid lightgrey;
    font-size: 16px;
    transition: all 0.3s ease;
}

form .row input:focus,
form .row select:focus,
form .row textarea:focus {
    border-color: #003049;
}

form .row input::placeholder,
form .row select::placeholder,
form .row textarea::placeholder {
    color: #999;
}

/* Contenedor de icono */
.wrapper form .row .input-icon-container {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 35px;
}

.input-icon {
    color: #003049;
    font-size: 18px;
}

/* Botones de acción */
.form-actions {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}

.form-actions button {
    background-color: #003049;
    color: #fff;
    border: none;
    padding: 12px 30px;
    border-radius: 5px;
    font-size: 18px;
    cursor: pointer;
}

.form-actions button:hover {
    background-color: #022c47;
}
</style>
