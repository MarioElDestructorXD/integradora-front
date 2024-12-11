<template>
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

    <!-- Content Below Navbar -->
    <div>
        <div class="wrapper">
            <div class="title"><span>Iniciar Sesión</span></div>
            <form @submit.prevent="handleLogin">
                <div class="row">
                    <div class="input-icon-container">
                        <font-awesome-icon icon="user" class="input-icon" />
                    </div>
                    <input v-model="email" type="text" id="email" placeholder="Correo electrónico" required />
                </div>
                <div class="row">
                    <div class="input-icon-container">
                        <font-awesome-icon icon="lock" class="input-icon" />
                    </div>
                    <input v-model="password" type="password" id="password" placeholder="Contraseña" required />
                </div>
                <div class="pass"><a href="#">¿Olvidaste tu contraseña?</a></div>
                <div class="row button">
                    <input type="submit" value="Iniciar sesión" />
                </div>
                <div class="signup-link">
                    <p>¿No tienes cuenta? <router-link to="/register">Regístrate aquí</router-link></p>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import Swal from 'sweetalert2';
/* eslint-disable vue/multi-word-component-names */
export default {
    name: 'Login',
    data() {
        return {
            email: '',
            password: '',
        };
    },
    methods: {
        async handleLogin() {
            const apiUrl = process.env.VUE_APP_API_URL;
            if (!this.email || !this.password) {
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Por favor, completa todos los campos.",
                    showConfirmButton: false,
                    timer: 3000,
                });
                return;
            }

            try {
                const response = await fetch(`${apiUrl}/auth/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email: this.email, password: this.password }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: errorData.message || "No se pudo iniciar sesión.",
                        showConfirmButton: false,
                        timer: 3000,
                    });
                    return;
                }

                const data = await response.json();

                if (data.token) {
                    localStorage.setItem("authToken", data.token);

                    // Mostrar un spinner mientras se hace la redirección
                    Swal.fire({
                        title: 'Iniciando sesión...',
                        text: 'Por favor espera un momento.',
                        allowOutsideClick: false,
                        didOpen: () => {
                            Swal.showLoading(); // Muestra el spinner
                        }
                    });

                    // Redirigir después de que se haya mostrado el spinner
                    setTimeout(() => {
                        if (data.role === 'CLIENTE') {
                            this.$router.push('/problem');  // Redirige a página de administrador
                        } else if (data.role === 'PROVEEDOR') {
                            this.$router.push('/problemproveedor');   // Redirige a página de usuario
                        }
                        Swal.close(); // Cierra el spinner
                    }, 2000); // Mantén el spinner 2 segundos antes de redirigir
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "Error desconocido al iniciar sesión.",
                        showConfirmButton: false,
                        timer: 3000,
                    });
                }
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Error al conectarse al servidor.",
                    showConfirmButton: false,
                    timer: 3000,
                });
            }
        },
    },
};
</script>

<style scoped>
/* Importing Google Fonts - Poppins */
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap");

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: "Poppins", sans-serif;
}

html,
body {
    height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
    background: #f8f8f8;
}

body {
    display: flex;
    align-items: center;
    justify-content: center;
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
    max-width: 350px;
    min-width: 250px;
    background: #fff;
    border-radius: 5px;
    box-shadow: 0px 4px 10px 1px rgba(0, 0, 0, 0.1);
    margin: 5% auto;
}

.wrapper .title {
    height: 100px;
    background: #003049;
    border-radius: 5px 5px 0 0;
    color: #fff;
    font-size: 24px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
}

.wrapper form {
    padding: 20px 25px;
}

.wrapper form .row {
    display: flex;
    align-items: center;
    height: 50px;
    margin-top: 10px;
    position: relative;
}

.wrapper form .row input {
    height: 100%;
    width: 100%;
    outline: none;
    padding-left: 40px;
    border-radius: 5px;
    border: 1px solid lightgrey;
    font-size: 16px;
    transition: all 0.3s ease;
}

form .row input:focus {
    border-color: #003049;
}

form .row input::placeholder {
    color: #999;
}

.input-icon-container {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
}

.input-icon {
    color: #003049;
    font-size: 18px;
}

.wrapper form .pass {
    margin-top: 10px;
}

.wrapper form .pass a {
    color: #003049;
    font-size: 14px;
    text-decoration: none;
}

.wrapper form .pass a:hover {
    text-decoration: underline;
}

.wrapper form .button input {
    margin-top: 15px;
    color: #fff;
    font-size: 16px;
    font-weight: 500;
    padding-left: 0px;
    background: #003049;
    border: 1px solid #003049;
    cursor: pointer;
}

form .button input:hover {
    background: #001d30;
}

.wrapper form .signup-link {
    text-align: center;
    margin-top: 30px;
    font-size: 14px;
}

.wrapper form .signup-link a {
    color: #003049;
    text-decoration: none;
}

form .signup-link a:hover {
    text-decoration: underline;
}

@media (max-width: 768px) {
    .navbar {
        flex-direction: column;
        text-align: center;
    }
}
</style>
