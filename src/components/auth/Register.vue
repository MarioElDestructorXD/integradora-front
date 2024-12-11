<template>
    <div>
        <!-- Navbar -->
        <header>
            <nav class="navbar">
                <div class="navbar-container">
                    <a class="navbar-logo" href="#">
                        <img src="../../assets/logo.png" alt="Logo de FixyPro" />
                    </a>
                    <span class="navbar-brand">FixyPro</span>
                </div>
            </nav>
        </header>

        <!-- Contenido de Registro -->
        <div class="wrapper">
            <div class="title"><span>Registro de Usuario</span></div>
            <form @submit.prevent="handleSubmit">
                <div class="row">
                    <div class="input-icon-container">
                        <font-awesome-icon icon="user" class="input-icon" />
                    </div>
                    <input v-model="name" type="text" placeholder="Ingrese su nombre" required />
                </div>
                <div class="row">
                    <div class="input-icon-container">
                        <font-awesome-icon icon="user" class="input-icon" />
                    </div>
                    <input v-model="firstSurname" type="text" placeholder="Primer Apellido" required />
                </div>
                <div class="row">
                    <div class="input-icon-container">
                        <font-awesome-icon icon="user" class="input-icon" />
                    </div>
                    <input v-model="secondSurname" type="text" placeholder="Segundo Apellido" required />
                </div>
                <div class="row">
                    <div class="input-icon-container">
                        <font-awesome-icon icon="phone" class="input-icon" />
                    </div>
                    <input v-model="phone" type="tel" placeholder="10 dígitos"
                        title="El número debe contener 10 dígitos" required />
                </div>
                <div class="row">
                    <div class="input-icon-container">
                        <font-awesome-icon icon="envelope" class="input-icon" />
                    </div>
                    <input v-model="email" type="email" placeholder="ejemplo@correo.com" required />
                </div>
                <div class="row">
                    <div class="input-icon-container">
                        <font-awesome-icon icon="lock" class="input-icon" />
                    </div>
                    <input v-model="password" type="password" placeholder="Ingrese su contraseña" required />
                </div>

                <div class="row">
                    <div class="input-icon-container">
                        <font-awesome-icon icon="user-shield" class="input-icon" />
                    </div>
                    <select v-model="role" required>
                        <option value="">Seleccione rol</option>
                        <option value="CLIENTE">Usuario</option>
                        <option value="PROVEEDOR">Proveedor</option>
                    </select>
                </div>
                <div class="row">
                    <div class="input-icon-container">
                        <font-awesome-icon icon="camera" class="input-icon" />
                    </div>
                    <input type="file" accept="image/*" @change="handlePhotoChange" required />
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">Registrar</button>
                </div>

                <!-- Enlace para iniciar sesión -->
                <div class="login-link">
                    <p>¿Ya tienes cuenta? <router-link to="/login">Inicia sesión aquí</router-link></p>
                </div>
            </form>
        </div>
    </div>
</template>


<script>
import Swal from 'sweetalert2';
const apiUrl = import.meta.env.VITE_BACKEND_URL; // Debe definirse en .env

/* eslint-disable vue/multi-word-component-names */
export default {
    name: 'Register',
    data() {
        return {
            name: '',
            firstSurname: '',
            secondSurname: '',
            phone: '',
            email: '',
            password: '',
            role: '',
            photo: null,
        };
    },
    methods: {

        async handleSubmit() {
            const confirmRegister = await Swal.fire({
                title: '¿Estás seguro?',
                text: '¿Quieres registrarte con los datos proporcionados?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, registrarme',
                cancelButtonText: 'No, cancelar',
            });

            if (!confirmRegister.isConfirmed) return;

            if (!this.name || !this.firstSurname || !this.secondSurname || !this.phone || !this.email || !this.password || !this.role || !this.photo) {
                await Swal.fire({
                    title: 'Campos incompletos',
                    text: 'Por favor, completa todos los campos.',
                    icon: 'warning',
                    confirmButtonText: 'Entendido',
                });
                return;
            }

            try {
                // Convertir la foto a Base64
                const photoBase64 = await this.toBase64(this.photo);

                // Crear el JSON para la petición
                const payload = {
                    name: this.name,
                    firstSurname: this.firstSurname,
                    secondSurname: this.secondSurname,
                    phone: this.phone,
                    email: this.email,
                    password: this.password,
                    role: this.role,
                    photo: photoBase64, // La foto como Base64
                };

                // Enviar el JSON al servidor
                const response = await fetch(`${apiUrl}/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    await Swal.fire({
                        title: 'Error',
                        text: errorData.message || 'No se pudo registrar.',
                        icon: 'error',
                        confirmButtonText: 'Entendido',
                    });
                    return;
                }

                await Swal.fire({
                    title: 'Registro exitoso',
                    text: 'Tu cuenta ha sido creada con éxito. Por favor, verifica tu correo electrónico para activarla.',
                    icon: 'success',
                    confirmButtonText: 'Continuar',
                });

                this.$router.push('/login');
            } catch (error) {
                await Swal.fire({
                    title: 'Error',
                    text: 'Error al conectarse al servidor.',
                    icon: 'error',
                    confirmButtonText: 'Entendido',
                });
            }
        },

        handlePhotoChange(event) {
            this.photo = event.target.files[0];
        },

        toBase64(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result.split(',')[1]); // Extraer solo la parte Base64
                reader.onerror = (error) => reject(error);
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

/* Navbar Styles */
header {
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
    background-color: #003049;
    padding: 12px 0;
    z-index: 1000;
}

.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    width: 100%;
}

.navbar-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.navbar-logo img {
    width: 40px;
    /* Logo tamaño uniforme */
    height: auto;
}

.navbar-brand {
    color: white !important;
    font-size: 24px;
    /* Tamaño uniforme de la fuente */
    font-weight: 600;
    text-align: center;
    flex-grow: 1;
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
.wrapper form .row select {
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
form .row select:focus {
    border-color: #003049;
}

form .row input::placeholder,
form .row select::placeholder {
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
    font-size: 20px;
}

/* Estilo para el botón */
.form-actions {
    display: flex;
    justify-content: center;
    grid-column: span 2;
    width: 100%;
    margin-top: 18px;
}

.form-actions button {
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    padding: 16px;
    background: #003049;
    border: 1px solid #003049;
    cursor: pointer;
    width: 100%;
    max-width: 280px;
    border-radius: 5px;
    text-align: center;
    transition: background-color 0.3s ease, transform 0.2s ease;
}

.form-actions button:hover {
    background: #001d30;
    transform: scale(1.05);
}

/* Enlace de login */
.wrapper form .login-link {
    text-align: center;
    margin-top: 18px;
    font-size: 14px;
    grid-column: span 2;
}

.wrapper form .login-link a {
    color: #003049;
    text-decoration: none;
}

form .login-link a:hover {
    text-decoration: underline;
}

/* Media query para pantallas pequeñas */
@media (max-width: 768px) {
    .wrapper form {
        grid-template-columns: 1fr;
        gap: 15px;
    }

    .form-actions button {
        max-width: 100%;
    }
}
</style>
