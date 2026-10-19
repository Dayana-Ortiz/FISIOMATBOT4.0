# Cómo usar la plataforma

> Nota para el equipo: este archivo describe las pantallas reales del frontend (rutas de App.tsx y menú de Sidebar.tsx). Si cambian los menús o botones, actualízalo aquí.

## Registro de una cuenta nueva

Para registrarse, en la página de inicio de sesión se hace clic en "Regístrate aquí". Se abre la página "Registro de Usuario", donde se llenan los campos: Nombre completo, Correo electrónico, Grado (9, 10 u 11), Institución (opcional), Contraseña y Confirmar contraseña. Luego se hace clic en el botón "Crear Cuenta". Todos los campos son obligatorios excepto la institución. La contraseña debe tener mínimo 6 caracteres, las dos contraseñas deben coincidir y el correo debe tener un formato válido. Si el registro es exitoso, la plataforma lleva al estudiante a la página de inicio de sesión.

## Inicio de sesión

Para iniciar sesión se escribe el correo electrónico y la contraseña y se hace clic en el botón "Acceder". El botón del ojo en el campo de contraseña permite mostrarla u ocultarla. Si no tienes cuenta, haz clic en "Regístrate aquí". La sesión se protege con un token que expira; si expira, hay que iniciar sesión de nuevo. Para salir, abre el menú de tu usuario en la barra superior y elige "Cerrar sesión". Si olvidas tu contraseña, por ahora debes pedir ayuda a tu docente o al administrador de la plataforma, porque la recuperación de contraseña aún no está disponible.

## Menú lateral y navegación

El menú lateral (a la izquierda) tiene estas opciones: Inicio, Ciencia, Matemáticas, Tecnología, Simulador, Progreso y Perfil. Los docentes y administradores ven además la opción Admin. La opción activa se resalta en color naranja. En pantallas pequeñas el menú se oculta; se abre y se cierra con el botón de tres líneas de la esquina superior izquierda.

## Barra superior

La barra superior tiene un buscador ("Buscar lecciones, quizzes..."), el icono de campana de Notificaciones y el menú del usuario con las opciones Perfil, Configuración y Cerrar sesión. El buscador y la opción Configuración todavía están en desarrollo.

## Panel de Inicio (Dashboard)

Al entrar se muestra el panel de Inicio con el mensaje "¡Bienvenido de nuevo!" y tarjetas de estadísticas: Progreso total, Logros, Actividades esta semana y Actividades completadas. Más abajo aparecen las tarjetas de los módulos, cada una con su barra de progreso y un botón para entrar ("Empezar", "Continuar" o "Repasar"). Los botones Todos, En progreso y Completados filtran los módulos.

## Módulos de contenido: Ciencia, Matemáticas y Tecnología

Ciencia trata introducción a la física, movimiento rectilíneo y leyes de Newton. Matemáticas trata álgebra básica, geometría y cálculo diferencial. Tecnología trata programación básica, robótica educativa y redes y comunicaciones. Todos los módulos se usan igual: primero se lee la "Introducción al módulo"; luego, en la lista de "Lecciones", se elige una lección y su contenido aparece en el panel de la derecha, con fórmulas importantes, ejemplos prácticos y ejercicios. Se recomienda avanzar lección por lección en orden.

## Simulador

El Simulador está en la opción "Simulador" del menú lateral. Allí se experimenta con la energía potencial y la energía cinética en una escena 3D, y también hay un botón "Quiz" para practicar. Los detalles de cómo usarlo están en la sección del simulador interactivo.

## Progreso

En la opción "Progreso" del menú lateral, el estudiante ve la página "Tu progreso", con un resumen de estudio que muestra, módulo por módulo, qué actividades ya completó y cuáles le faltan, y un panel con el progreso general y la barra de avance de cada módulo (Ciencia, Matemáticas, Tecnología y Simulador). Sirve para identificar los módulos con menor avance y decidir qué repasar.

## Cómo avanza el progreso

El progreso de cada módulo se calcula con sus actividades completadas. En Ciencia, Matemáticas y Tecnología cada lección cuenta cuando el estudiante hace clic en el botón "Marcar como Completado" al final de la lección, y el quiz del módulo cuenta al terminarlo. En el Simulador cuenta correr la simulación al menos 3 segundos y terminar su quiz. Las lecciones completadas aparecen con un visto verde en la lista de lecciones. Al completar actividades se ganan logros, como "Primera lección" y "Módulo completado".

## Perfil

En la opción "Perfil" (o desde el menú del usuario en la barra superior) está la página "Mi Perfil". Muestra la información personal (nombre, email, grado, institución y biografía), la información de la cuenta (miembro desde y estado) y las estadísticas: Lecciones Completadas, Puntos Totales y Logros. Para cambiar los datos se hace clic en "Editar Perfil", se modifican los campos y se hace clic en "Guardar Cambios" (o "Cancelar"). Las acciones rápidas Cambiar Contraseña, Preferencias de Notificaciones, Tema de la Interfaz y Descargar Datos todavía están en desarrollo.

## Roles

Existen tres roles: estudiante, docente (profesor) y administrador. El estudiante consulta los módulos, usa el simulador, presenta los quizzes y revisa su progreso. El docente entra al "Panel de administración" desde la opción Admin para ver a los usuarios, buscarlos por nombre o correo, filtrarlos por rol y activar o desactivar cuentas, y crea y edita las preguntas de los quizzes desde la opción Quizzes. El administrador puede además cambiar el rol de cualquier usuario y gestionar las instituciones. Un estudiante no puede cambiar su propio rol; si necesita otro rol, debe pedírselo al administrador.

## Evaluaciones

Las evaluaciones son de selección múltiple. En Ciencia, Matemáticas y Tecnología se abren con el botón "Tomar quiz", y en el Simulador con el botón "Quiz". Lo que el estudiante elige queda registrado y no se puede cambiar; después se muestra si acertó y una explicación. Al final aparece el puntaje: cada acierto suma 10 puntos la primera vez.

## Crear, agregar y editar preguntas de los quizzes (solo profesores y administradores)

El profesor o docente gestiona los quizzes desde la opción "Quizzes" del menú lateral, o con el botón "Editar" de "Quizzes por módulo" en el panel Admin. Elige el módulo y usa "Nueva pregunta" para agregar una: escribe la pregunta, de 2 a 6 opciones, marca la correcta, añade una explicación opcional y elige la dificultad (fácil, media o difícil). Con los botones de cada pregunta puede editarla, cambiar su orden con las flechas, ocultarla o mostrarla a los estudiantes y eliminarla. Si a un estudiante le aparece que un módulo no tiene preguntas, es porque el profesor aún no las ha publicado.

## Asistente virtual (chat)

El asistente se abre con el botón redondo 💬 de la esquina inferior derecha de cualquier pantalla, y se cierra con la × o con la tecla Escape. Para enviar un mensaje se escribe la duda y se presiona Enter o el botón "Enviar"; Shift + Enter hace un salto de línea. La conversación se guarda y se puede retomar después.

## Reportar un problema, falla o error del sistema (soporte y PQR)

Si el estudiante quiere reportar un error o falla del sistema, o tiene una queja o una sugerencia, puede pedirle al asistente que registre un reporte de soporte (PQR). El asistente resume el reporte y pide confirmación antes de crearlo. El reporte queda guardado con un asunto, una descripción y un estado (abierto, cancelado o cerrado). El estudiante puede pedirle al asistente que le muestre sus reportes o que cancele uno que esté abierto, indicando su número.

## Buenas prácticas y requisitos

Se recomienda usar un navegador actualizado (Google Chrome, Microsoft Edge o Mozilla Firefox), tener conexión estable al usar el simulador y cerrar la sesión al terminar en equipos compartidos. La plataforma funciona en computador, tableta y celular, aunque para el simulador es mejor una pantalla grande. No se deben compartir las credenciales. Se recomienda estudiar en sesiones de 30 a 45 minutos y revisar con frecuencia la página de Progreso.
