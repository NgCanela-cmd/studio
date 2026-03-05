# Especificación Maestra: Court Commander (Android/KMP)

## 1. Visión General
Recreación de la aplicación de gestión de baloncesto "Court Commander" utilizando **Kotlin Multiplatform (KMP)** y **Compose Multiplatform**. La app debe ofrecer una experiencia de usuario fluida, táctica y de alta gama para dispositivos móviles.

## 2. Funcionalidades y Lógica de Negocio (Minucioso)

### A. Sistema "Rey de la Cancha" (Core Loop)
- **Modo Normal:** Partidos estándar 5vs5 donde el ganador permanece en el Slot A y el perdedor vuelve al final de la cola.
- **Transición Dinámica:** Si el Equipo B (Retador) gana, el sistema debe reasignar automáticamente a sus integrantes al Slot A. En el historial, el partido se registra con los nombres originales, pero la UI se actualiza inmediatamente para mostrar al nuevo defensor.
- **Sistema de Draft:** 
  - **Estado Inicial:** Si no hay equipos, solicita 10 jugadores de la banca.
  - **Estado de Juego:** Si hay un defensor (Slot A), solicita 5 jugadores para el retador (Slot B).
- **Jerarquía de Equipos (IA):**
  - **Challengers (Equipo B):** Nombres generados con temática de aspirantes, hambrientos de victoria.
  - **Alphas (Equipo A):** Cuando un equipo gana y defiende el puesto, o es "promocionado" desde B, la IA debe asignarles un nombre con temática dominante (Reyes, Alphas, Titanes).

### B. Gestión de Datos y Persistencia
- **Cola de Jugadores (Queue):** Lista FIFO (First-In, First-Out). Al agregar un jugador, se registra su ID y timestamp de entrada.
- **Estadísticas Individuales:** Un diccionario/mapa que rastrea `PlayerID -> WinsCount`. Cada vez que un equipo gana, todos sus integrantes suman +1 victoria individual.
- **Historial de Partidos:** Registro de objetos `Match` que contienen: ID, Nombre Equipo A, Nombre Equipo B, Nombre Ganador y Timestamp.
- **Sistema de Deshacer (Undo):** Implementar un Stack de estados (`List<GameState>`). Cada acción que muta el juego (marcar ganador o finalizar draft) debe guardar un "snapshot" del estado completo para permitir reversiones instantáneas.

## 3. Diseño y Estructura de la Interfaz (Layout)

### A. Estilo Visual (Branding)
- **Fondo Primario:** `#2c2821` (Gris oscuro cálido).
- **Color de Acento (Gold):** `#FBc251` (Usado para victorias, coronas y botones principales).
- **Color de Alerta (Sport Red):** `#e63b1a` (Para estados de "En Vivo" y errores).
- **Tipografía:** Inter o Roboto. Uso de pesos **Black** e *Italic* para nombres de equipos para dar sensación de dinamismo deportivo.

### B. Distribución de Pantallas (Apartados)
1. **La Cancha (Main View):**
   - **Cabecera:** Título "GESTIÓN DE BATALLAS EN VIVO", botones de "Estadísticas" y "Deshacer", y un indicador pulsante de "Estado del Juego".
   - **Zona del Trono:** Un área superior con gradiente dorado que muestra al "Rey" actual o un slot vacío con una corona tenue.
   - **Arena Central:** Dos tarjetas (`Cards`) grandes separadas por un "VS" central. Cada tarjeta muestra el nombre del equipo en fuente gigante itálica y la lista de sus 5 jugadores.
   - **Botón de Victoria:** Un botón grande y prominente (`gold-gradient`) en la base de cada tarjeta de equipo.

2. **La Banca (Sidebar/Drawer):**
   - Lista vertical con scroll. Cada item muestra el nombre, la hora de llegada y su posición en la cola.
   - Formulario superior rápido para añadir nombres.
   - Contador visual de jugadores totales en el sistema.

3. **Modales (Overlays):**
   - **Draft:** Pantalla dividida. Izquierda: Selección de jugadores de la banca. Derecha: Vista previa de los equipos A y B con sus nombres generados por IA.
   - **Estadísticas:** Dos pestañas principales. Pestaña 1: Lista cronológica de partidos. Pestaña 2: Ranking de jugadores ordenado por victorias.

## 4. Implementación Técnica Sugerida (Kotlin/Compose)

### Modelos (KMP Common)
```kotlin
data class Player(val id: String, val name: String, val registeredAt: Long)
data class Team(val id: String, val name: String, val players: List<Player>, val wins: Int)
data class GameState(
    val queue: List<Player>,
    val teamA: Team?,
    val teamB: Team?,
    val matches: List<Match>,
    val playerStats: Map<String, Int>
)
```

### Prompt para IA (Generación de Código)
"Actúa como un desarrollador experto en Kotlin Multiplatform. Implementa la lógica de 'Court Commander': una app de baloncesto donde el ganador se queda en cancha. Usa StateFlow para manejar un estado inmutable que incluya una cola de jugadores y dos slots de equipos. Implementa una función `declareWinner(side: Side)` que mueva al equipo B al slot A si este gana. El diseño debe ser Dark Premium con acentos en dorado (#FBc251) y sombras suaves. Integra el SDK de Gemini para Kotlin para generar nombres de equipos basados en el estatus (Challenger vs Alpha).