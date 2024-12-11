<template>
    <div>
        <!-- Navbar -->
        <header>
            <NavBar />
        </header>

        <!-- Contenido del Perfil -->
        <div class="wrapper">
            <div class="title"><span>Perfil de Usuario</span></div>
            <div class="profile-content">
                <!-- Perfil del Usuario -->
                <div v-if="profile.name" class="profile-header">
                    <img :src="'data:image/jpeg;base64,' + profile.profileImage" alt="Imagen de perfil"
                        class="profile-img" />
                    <div class="profile-info">
                        <h3>{{ profile.name }}</h3>
                        <form @submit.prevent="updateProfile">
                            <div class="form-grid">
                                <!-- Campos del perfil -->
                                <div class="input-group">
                                    <label for="name">Nombre:</label>
                                    <input type="text" id="name" v-model="profile.name" />
                                </div>
                                <div class="input-group">
                                    <label for="paternalSurname">Apellido Paterno:</label>
                                    <input type="text" id="firstSurname" v-model="profile.firstSurname" />
                                </div>
                                <div class="input-group">
                                    <label for="maternalSurname">Apellido Materno:</label>
                                    <input type="text" id="secondSurname" v-model="profile.secondSurname" />
                                </div>
                                <div class="input-group">
                                    <label for="email">Email:</label>
                                    <input type="email" disabled id="email" v-model="profile.email" />
                                </div>
                                <div class="input-group">
                                    <label for="phone">Teléfono:</label>
                                    <input type="text" id="phone" v-model="profile.phone" />
                                </div>
                            </div>
                            <button type="submit">Guardar Cambios</button>
                        </form>
                    </div>
                </div>

                <!-- Lista de direcciones -->
                <div v-if="addresses.length" class="address-list">
                    <h4>Direcciones:</h4>
                    <ul>
                        <li v-for="(address, index) in addresses" :key="index">
                            {{ address.direccion }} (Lat: {{ address.latitud }}, Lng: {{ address.longitud }})
                            <!-- Ícono de eliminación -->
                            <i @click="deleteAddress(address.id)" title="Eliminar dirección"><font-awesome-icon
                                    icon="trash" class="input-icon" /></i>
                        </li>
                    </ul>
                </div>


                <!-- Botón para abrir el modal de dirección -->
                <button @click="openModal">Agregar Nueva Dirección</button>



                <!-- Modal para Agregar Dirección -->
                <div v-if="showModal" class="modal-overlay">
                    <div class="modal-content">
                        <h4>Agregar Nueva Dirección</h4>

                        <div class="modal-grid">
                            <!-- Input y lista de autocompletado -->
                            <div class="input-container">
                                <div class="input-group">
                                    <label for="direccion">Dirección:</label>
                                    <input type="text" id="direccion" v-model="newAddress.direccion"
                                        @input="onAddressInput" />
                                    <ul v-if="autocompleteResults.length" class="autocomplete-list">
                                        <li v-for="(result, index) in autocompleteResults" :key="index"
                                            @click="selectAddress(result)">
                                            {{ result.description }}
                                        </li>
                                    </ul>
                                </div>
                                <button class="save-btn" @click="addAddress">Guardar Dirección</button>
                            </div>

                            <!-- Contenedor del mapa -->
                            <div class="map-container">
                                <GMapMap :center="mapCenter" :zoom="14" style="width: 100%; height: 400px;"
                                    @click="updateMarker">
                                    <GMapMarker v-if="markerPosition" :position="markerPosition" :clickable="true"
                                        :draggable="true" @dragend="onMarkerDragged" />
                                </GMapMap>
                            </div>
                        </div>
                        <button @click="closeModal">Cerrar</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Swal from "sweetalert2";  // Importa SweetAlert2
import { GMapMap, GMapMarker } from "@fawmi/vue-google-maps";
import NavBar from '../NavBar.vue'
const apiUrl = process.env.VUE_APP_API_URL;


export default {
    /* eslint-disable vue/multi-word-component-names */

    components: {
        NavBar,
        GMapMap,
        GMapMarker,
    },
    name: "ProfileProveedor",
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
            newAddress: {
                direccion: "",
                latitud: null,
                longitud: null,
            },
            showModal: false,
            mapCenter: { lat: 19.4326, lng: -99.1332 }, // CDMX por defecto
            markerPosition: { lat: 19.4326, lng: -99.1332 }, // Coordenadas iniciales
            autocompleteResults: [],
            autocompleteService: null,
            geocoder: null,
            addresses: [], // Aquí almacenaremos las direcciones
            isLoading: false, // Para el spinner
        };
    },
    created() {
        this.fetchUserProfile();
        this.initGoogleServices();
    },
    methods: {

        async deleteAddress(addressId) {
            const token = localStorage.getItem("authToken");
            if (!token) {
                this.$router.push("/login");
                return;
            }

            try {
                const result = await Swal.fire({
                    title: "¿Estás seguro?",
                    text: "Esta acción eliminará la dirección de forma permanente.",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Sí, eliminar",
                    cancelButtonText: "Cancelar",
                });

                if (result.isConfirmed) {
                    const response = await fetch(`${apiUrl}/api/ubicaciones/${addressId}`, {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    if (response.ok) {
                        await this.fetchUserAddresses(); // Actualiza la lista de direcciones
                        Swal.fire("Eliminada", "La dirección fue eliminada con éxito.", "success");
                    } else {
                        this.showError("No se pudo eliminar la dirección. Inténtelo más tarde.");
                    }
                }
            } catch (error) {
                console.error("Error al eliminar la dirección:", error);
                this.showError("Ocurrió un error al intentar eliminar la dirección.");
            }
        },
        async fetchUserAddresses() {
            const token = localStorage.getItem("authToken");
            if (!token) {
                this.$router.push("/login");
                return;
            }
            try {
                this.isLoading = true;  // Activamos el spinner
                const response = await fetch(`${apiUrl}/api/ubicaciones/usuario/${this.profile.id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    this.addresses = data || [];
                    console.log("Direcciones obtenidas:", this.addresses);  // Verificar que llega la data
                } else {
                    this.showError("Error al obtener las direcciones.");
                }
            } catch (error) {
                console.error("Error al obtener las direcciones:", error);
                this.showError("Ocurrió un error al cargar las direcciones.");
            } finally {
                this.isLoading = false; // Desactivamos el spinner
            }
        },
        initGoogleServices() {
            const google = window.google;
            this.autocompleteService = new google.maps.places.AutocompleteService();
            this.geocoder = new google.maps.Geocoder();
        },
        async fetchUserProfile() {
            const token = localStorage.getItem("authToken");
            if (!token) {
                this.$router.push("/login");
                return;
            }
            try {
                this.isLoading = true;
                const response = await fetch(`${apiUrl}/api/user/profile`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    this.profile = {
                        ...this.profile,
                        id: data.id,
                        name: data.name,
                        firstSurname: data.firstSurname,
                        secondSurname: data.secondSurname,
                        email: data.email,
                        phone: data.phone,
                        profileImage: data.photo,
                    };
                    await this.fetchUserAddresses();
                } else {
                    this.showError("Error al obtener el perfil. Por favor, inténtelo más tarde.");
                }
            } catch (error) {
                console.error("Error al obtener el perfil:", error);
                this.showError("Ocurrió un error al cargar el perfil.");
            } finally {
                this.isLoading = false;
            }
        },
        async updateProfile() {
            const token = localStorage.getItem("authToken");
            if (!token) {
                this.$router.push("/login");
                return;
            }
            try {
                this.isLoading = true;
                const response = await fetch(`${apiUrl}/api/user/profile`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(this.profile),
                });
                if (response.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Perfil actualizado',
                        text: 'Los cambios fueron guardados correctamente.',
                    });
                } else {
                    this.showError("No se pudo actualizar el perfil. Por favor, inténtelo más tarde.");
                }
            } catch (error) {
                console.error("Error al actualizar el perfil:", error);
                this.showError("Ocurrió un error al intentar actualizar el perfil.");
            } finally {
                this.isLoading = false;
            }
        },
        openModal() {
            this.showModal = true;
            this.markerPosition = { ...this.mapCenter };
            console.log("Modal abierto, marcador inicializado:", this.markerPosition);
        },
        closeModal() {
            this.showModal = false;
            this.newAddress = { direccion: "", latitud: null, longitud: null };
            this.markerPosition = null;
            console.log("Modal cerrado.");
        },
        updateMarker(event) {
            if (event.latLng) {
                const lat = event.latLng.lat();
                const lng = event.latLng.lng();
                this.markerPosition = { lat, lng };
                this.newAddress.latitud = lat;
                this.newAddress.longitud = lng;
                this.reverseGeocode(lat, lng);
            }
        },
        onMarkerDragged(event) {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            this.markerPosition = { lat, lng };
            this.newAddress.latitud = lat;
            this.newAddress.longitud = lng;
            this.reverseGeocode(lat, lng);
        },
        async addAddress() {
            const token = localStorage.getItem("authToken");
            if (!token) {
                this.$router.push("/login");
                return;
            }
            try {
                this.isLoading = true;
                const response = await fetch(`${apiUrl}/api/ubicaciones/${this.profile.id}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(this.newAddress),
                });
                if (response.ok) {
                    await this.fetchUserAddresses();
                    this.closeModal();
                    Swal.fire({
                        icon: 'success',
                        title: 'Dirección agregada',
                        text: 'La nueva dirección fue guardada correctamente.',
                    });
                } else {
                    this.showError("No se pudo agregar la dirección. Inténtelo más tarde.");
                }
            } catch (error) {
                console.error("Error al agregar dirección:", error);
                this.showError("Ocurrió un error al intentar agregar la dirección.");
            } finally {
                this.isLoading = false;
            }
        },

        onAddressInput() {
            if (this.newAddress.direccion.length > 3) {
                this.autocompleteService.getPlacePredictions(
                    { input: this.newAddress.direccion },
                    (predictions, status) => {
                        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                            this.autocompleteResults = predictions || [];
                        } else {
                            this.autocompleteResults = [];
                        }
                    }
                );
            } else {
                this.autocompleteResults = [];
            }
        },

        selectAddress(place) {
            this.newAddress.direccion = place.description;
            this.autocompleteResults = [];
            this.geocoder.geocode({ address: place.description }, (results, status) => {
                if (status === window.google.maps.GeocoderStatus.OK && results[0]) {
                    const location = results[0].geometry.location;
                    this.mapCenter = { lat: location.lat(), lng: location.lng() };
                    this.markerPosition = this.mapCenter;
                    this.newAddress.latitud = location.lat();
                    this.newAddress.longitud = location.lng();
                }
            });
        },
        reverseGeocode(lat, lng) {
            this.geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === window.google.maps.GeocoderStatus.OK && results[0]) {
                    this.newAddress.direccion = results[0].formatted_address;
                }
            });
        },

        showError(message) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: message,
            });
        },
    },
};
</script>

<style scoped>
/* Estilos CSS del componente */
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

/* Wrapper para el perfil */
.wrapper {
    width: 100%;
    max-width: 900px;
    /* Aumentado el tamaño máximo */
    min-width: 350px;
    /* Aumentado el tamaño mínimo */
    background: #fff;
    border-radius: 5px;
    box-shadow: 0px 4px 10px 1px rgba(0, 0, 0, 0.1);
    margin: 50px auto;
}


.wrapper .title {
    height: auto;
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

/* Contenido del perfil */
.profile-content {
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.profile-header {
    display: flex;
    align-items: center;
    gap: 20px;
}

.profile-img {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
}

.profile-info h3 {
    font-size: 24px;
    font-weight: 600;
    color: #003049;
}

.profile-info p {
    color: #555;
    font-size: 16px;
}

/* Estilos para los inputs y el formulario con dos columnas */
.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 20px;
}

.input-group {
    display: flex;
    flex-direction: column;
}

.input-group label {
    margin-bottom: 8px;
    font-weight: 600;
}

.input-group input {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
}

button {
    background-color: #003049;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    margin-top: 20px;
    width: 100%;
}

button:hover {
    background-color: #f78c42;
}

/* Estilos para agregar dirección */
/* Estilos adicionales del componente */
.add-address {
    margin-top: 20px;
    width: 100%;
}

.add-address h4 {
    margin-bottom: 15px;
    font-size: 24px;
    font-weight: 600;
}

.add-address .form-grid {
    margin-top: 10px;
}

/* Modal y mapa */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

/* Ajustando el contenido del modal */
.modal-content {
    background: #fff;
    padding: 30px;
    /* Más espacio dentro del modal */
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    width: 100%;
    /* Ocupa un 90% del ancho disponible */
    max-width: 900px;
    /* Cambia el max-width para hacerlo más grande */
    height: auto;
    /* Se ajustará según el contenido */
    max-height: 85%;
    /* Evita que el modal sea demasiado grande verticalmente */
    overflow-y: auto;
    /* Si el contenido es largo, agrega scroll */
}

.modal-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-top: 20px;
}

.input-container {
    display: flex;
    flex-direction: column;
    gap: 15px;
}



.input-group {
    display: flex;
    flex-direction: column;
}

.input-group label {
    margin-bottom: 8px;
    font-weight: 600;
}

.input-group input {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
}

.input-icon {
    color: #003049;
    font-size: 20px;
    margin: 15px;
}

.autocomplete-list {
    list-style: none;
    margin: 0;
    padding: 0;
    background: #fff;
    border: 1px solid #ccc;
    max-height: 150px;
    overflow-y: auto;
}

.autocomplete-list li {
    padding: 10px;
    cursor: pointer;
}

.autocomplete-list li:hover {
    background: #f1f1f1;
}

/* Estilos para las direcciones y su presentación */
.address-list {
    width: 100%;
    background-color: #f9f9f9;
    padding: 15px;
    border-radius: 5px;
    margin-top: 20px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.address-list h4 {
    font-size: 20px;
    font-weight: 600;
    color: #003049;
    margin-bottom: 15px;
    text-align: left;
}

.address-list ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.address-list li {
    background-color: #fff;
    padding: 10px;
    margin-bottom: 10px;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    font-size: 14px;
    color: #333;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.address-list li span {
    font-size: 12px;
    color: #888;
}

.address-list li:hover {
    background-color: #f1f1f1;
    cursor: pointer;
}

.add-address {
    margin-top: 30px;
    display: flex;
    justify-content: center;
}

.add-address button {
    background-color: #003049;
    color: white;
    padding: 10px 25px;
    border-radius: 5px;
    border: none;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    text-align: center;
}

.add-address button:hover {
    background-color: #f78c42;
}

.add-address button:focus {
    outline: none;
}

.delete-icon {
    color: red;
    cursor: pointer;
    margin-left: 10px;
    transition: color 0.3s;
}

.delete-icon:hover {
    color: darkred;
}
</style>
