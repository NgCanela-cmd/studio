# Especificación para Court Commander (Android/KMP)

## Objetivo
Recrear la aplicación "Court Commander" utilizando **Kotlin Multiplatform (KMP)** y **Compose Multiplatform**. La app debe ser funcional en Android e iOS, manteniendo el diseño "Premium Dark" y la lógica de "Rey de la Cancha".

## Paleta de Colores y Estilo
- **Fondo (Background):** `#2c2821` (Gris muy oscuro/marrón)
- **Primario (Gold):** `#FBc251` (Oro vibrante para victorias y coronas)
- **Acento (Accent):** `#e63b1a` (Rojo deportivo para alertas y estados dinámicos)
- **Tipografía:** Inter o Roboto, con pesos Bold y Black para encabezados itálicos.

## Modelos de Datos (Kotlin)
```kotlin
data class Player(val id: String, val name: String, val registeredAt: Long)
data class Team(val id: String, val name: String, val players: List<Player>, val wins: Int = 0)
data class Match(val id: String, val teamAName: String, val teamBName: String, val winnerName: String, val timestamp: Long)
data class GameState(
    val queue: List<Player> = emptyList(),
    val teamA: Team? = null,
    val teamB: Team? = null,
    val matches: List<Match> = emptyList(),
    val playerStats: Map<String, Int> = emptyMap() // Map<PlayerId, Wins>
)
```

## Lógica de Negocio Principal
1. **El Ganador se Queda:** Si el Equipo B (Retador) gana, debe moverse automáticamente al Slot A para el siguiente partido.
2. **Draft Inteligente:** 
   - Si la cancha está vacía: Pedir 10 jugadores.
   - Si hay un ganador (A): Pedir 5 jugadores para el Retador (B).
3. **Nombres con IA:** Integrar el SDK de Gemini para Kotlin.
   - Equipo B: Temática "Challengers/Aspirantes".
   - Equipo A (cuando es recién promocionado de B): Temática "Alpha Squad/Kings".
4. **Sistema de Deshacer (Undo):** Implementar un Stack de estados para revertir la última acción.

## Componentes UI Sugeridos (Compose)
- **LaCanchaView:** Un Layout vertical con dos tarjetas grandes para los equipos y un divisor "VS".
- **LaBancaView:** Una lista con `LazyColumn` para la cola de jugadores y un `OutlinedTextField` estilizado para agregar nuevos.
- **DraftDialog:** Un Modal de selección donde se asignan los jugadores del tope de la lista.
- **StatsDashboard:** Un BottomSheet o Pantalla con Tabs para el historial de partidos y el ranking individual.

## Prompt para IA Generadora de Código
"Actúa como un experto en Kotlin Multiplatform. Implementa una app de gestión de baloncesto con Compose Multiplatform. Usa un StateFlow para manejar un GameState que incluya una cola de jugadores y dos equipos de 5 personas. La lógica debe permitir declarar un ganador; el ganador permanece en el Slot A y el perdedor vuelve a la cola. Implementa un sistema de 'Undo' usando una lista de estados previos. El diseño debe ser oscuro con acentos en oro (#FBc251), usando sombras y gradientes para dar un aspecto de 'Trono'."
