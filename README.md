# Stocket: Software de Gestión de Inventarios y Operaciones

![Stocket Logo](Frontend/src/assets/img/logoEM.jpg)

**Stocket** es una aplicación web full-stack diseñada para solucionar los desafíos operativos de la fábrica de Empanadas Emmanuel. Proporciona una solución integral y centralizada para la gestión de inventarios, producción, pedidos y ventas, transformando procesos manuales en un flujo de trabajo digital, eficiente y robusto.

Este proyecto fue desarrollado como una solución académica con un enfoque en prácticas del mundo real, incluyendo un backend seguro con Node.js/Express, un frontend dinámico con React, y una base de datos relacional con MySQL.

## ✨ Características Principales

El sistema cuenta con una amplia gama de módulos para cubrir todas las necesidades operativas:

* **📈 Dashboard Interactivo:** Visualización en tiempo real de métricas clave, como pedidos activos, lotes en producción y alertas de inventario.
* **📦 Gestión de Inventario:** Control detallado de materias primas, gestión de lotes con fechas de vencimiento y seguimiento de movimientos de inventario (entradas, salidas, ajustes).
* **🚨 Sistema de Alertas:** Notificaciones automáticas para materias primas con stock bajo y lotes próximos a expirar.
* **🚚 Gestión de Proveedores:** CRUD completo de proveedores e historial detallado de todas las compras realizadas.
* **👥 Gestión de Clientes:** Módulo para administrar la información de los clientes de la fábrica.
* **🛒 Gestión de Pedidos:** Registro y seguimiento de pedidos de clientes con estados dinámicos (`pendiente`, `en_proceso`, `listo_para_entrega`, `completado`, `cancelado`).
* **🏭 Gestión de Producción:** Flujo de trabajo completo que permite planificar la producción a partir de pedidos pendientes, iniciar la fabricación con validación y descuento de stock en tiempo real, y finalizarla actualizando el inventario de productos terminados.
* **💸 Gestión de Pagos:** Registro y consulta de los pagos asociados a cada pedido.
* **👤 Gestión de Usuarios y Roles (Admin):** Módulo exclusivo para administradores para crear, ver, actualizar y eliminar usuarios, asignando roles específicos (`Administrador`, `Líder de Producción`, etc.).
* **🔑 Seguridad:** Autenticación basada en tokens (JWT), rutas protegidas por roles y un flujo seguro para restablecer la contraseña a través de correo electrónico.
* **📋 Módulo de Auditoría:** Registro de acciones críticas realizadas en el sistema para una trazabilidad completa, visible solo para administradores.
* **📊 Reportes:** Generación de reportes de ventas y de los productos más vendidos por rango de fechas para la toma de decisiones.
* **🧾 Gestión de Recetas:** Creación de recetas por cada producto terminado, con cálculo de costo estimado basado en el precio de las materias primas.

## 🛠️ Tecnologías Utilizadas

#### **Backend**
* **Node.js**
* **Express**
* **MySQL** (gestionado con `mysql2`)
* **JSON Web Tokens (jsonwebtoken)** para autenticación.
* **bcrypt.js** para el hasheo de contraseñas.
* **Nodemailer** para el envío de correos electrónicos.
* **dotenv** para la gestión de variables de entorno.

#### **Frontend**
* **React.js**
* **React Router** para la navegación.
* **Axios** para las peticiones a la API.
* **React-Bootstrap** para componentes de UI.
* **React Toastify** para notificaciones.
* **React Icons** y **FontAwesome** para la iconografía.
* CSS personalizado para un estilo moderno y consistente.

## 🚀 Instalación y Puesta en Marcha

Sigue estos pasos para ejecutar el proyecto en un entorno de desarrollo local.

### **1. Requisitos Previos**
* Tener instalado [Node.js](https://nodejs.org/) (versión 16 o superior).
* Tener instalado un servidor de MySQL (como XAMPP, WAMP, o MySQL Community Server).

### **2. Configuración del Backend**

1.  Navega a la carpeta `Backend`:
    ```sh
    cd Backend
    ```
2.  Instala las dependencias:
    ```sh
    npm install
    ```
3.  Crea un archivo `.env` en la raíz de la carpeta `Backend` y añade las siguientes variables con tus datos:
    ```env
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=tu_contraseña_de_mysql
    DB_NAME=app_db_st
    JWT_SECRET=tu_secreto_para_jwt_muy_seguro

    # Configuración para el envío de correos (Gmail)
    EMAIL_USER=tu_correo@gmail.com
    EMAIL_PASS=tu_contraseña_de_aplicacion_de_google
    ```
4.  La aplicación está lista para conectarse a la base de datos.

### **3. Configuración de la Base de Datos**

Tienes la siguiente opción para configurar la base de datos:

* **Opción (Recomendada para probar): Usar los datos de prueba.**
    1.  Crea una base de datos en MySQL llamada `app_db_st`.
    2.  Importa el archivo `app_db_st.sql` usando una herramienta como phpMyAdmin. Esto creará todas las tablas y las llenará con datos de ejemplo.
    3.  **Importante:** Las contraseñas en estos datos están encriptadas. Para iniciar sesión como administrador, ejecuta la consulta SQL que te proporcioné para establecer la contraseña de un usuario admin a "admin123".


### **4. Configuración del Frontend**

1.  Abre una nueva terminal y navega a la carpeta `Frontend`:
    ```sh
    cd Frontend
    ```
2.  Instala las dependencias:
    ```sh
    npm install
    ```

### **5. Ejecutar la Aplicación**

Debes tener dos terminales abiertas: una para el backend y otra para el frontend.

1.  **En la terminal del Backend:**
    ```sh
    npm run dev
    ```
    El servidor se ejecutará en `http://localhost:3000`.

2.  **En la terminal del Frontend:**
    ```sh
    npm start
    ```
    La aplicación de React se abrirá en `http://localhost:3001`.

## 🧑‍💻 Autores

Este proyecto fue desarrollado por:

* [cite_start]**Licet Valentina Zambrano Morales**
* [cite_start]**Miguel Angel Guzman** 
* [cite_start]**Jhon Gomez** 
 

---