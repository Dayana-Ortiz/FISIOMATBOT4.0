# Simulador y robot educativo

## Simulador interactivo

El simulador permite experimentar con la energía potencial y la energía cinética sin necesidad de materiales físicos. El estudiante cambia variables como la masa, la altura o la pendiente y observa cómo cambian las energías. La idea central del proyecto es que el simulador se construya en Unity con la librería UBlockly-Robot, que permite programar el robot por bloques.

Actualmente existe un prototipo web en 3D que valida el modelo físico. El simulador en Unity se integrará al REDA en las siguientes fases del proyecto.

## Cómo usar el simulador 3D

En la barra superior del simulador están los controles: Reproducir o Pausar, Avanzar un paso, Reiniciar, Agregar cubo y Agregar esfera. Con el selector de Gravedad se elige el entorno: Tierra (9,81 m/s²), Luna (1,62 m/s²), Marte (3,71 m/s²) o Espacio libre (0 m/s²). La vista de cámara se cambia entre Isométrica y Cenital.

En el panel lateral, la sección "Objeto seleccionado" permite cambiar la masa, la fricción y la restitución (qué tanto rebota) del objeto, y la sección "Entorno" permite cambiar la inclinación de la rampa, la fricción del suelo y la restitución del suelo.

Mientras corre la simulación se muestran en tiempo real la altura (h), la velocidad (v), la energía potencial (Ep), la energía cinética (Ec) y la energía total, en julios (J), junto con una gráfica de las energías en el tiempo. Así se puede comprobar que, cuando un objeto baja, la energía potencial se transforma en cinética. El botón "Quiz" abre preguntas de práctica sobre el tema.

## Programación por bloques

La programación por bloques permite construir instrucciones arrastrando piezas visuales, sin escribir código de texto. Es un paradigma pensado para el pensamiento computacional: el estudiante descompone un problema, crea una secuencia de pasos, prueba y corrige.

## Robot Lego Spike Prime

El kit Lego Spike Prime incluye un hub con procesador, sensores (movimiento, color, fuerza) y motores. El hub se comunica por Bluetooth Low Energy (BLE). En los experimentos, el robot recorre un plano inclinado y los sensores capturan datos que luego se comparan con el cálculo teórico.

## Talleres

Los talleres de robótica con el kit Lego Spike Prime en los colegios están planeados para el siguiente semestre. En ellos los estudiantes recolectarán datos con los sensores y calcularán el error relativo.

## Pensamiento computacional

La prueba PISA 2025 evaluó por primera vez la resolución de problemas computacionales. Colombia obtuvo 432 puntos frente a un promedio de 500 de la OCDE. FisioMathBot busca fortalecer esta competencia mediante experimentación, análisis de datos y programación.
