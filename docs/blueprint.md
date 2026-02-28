# **App Name**: Court Commander

## Core Features:

- Player Registration & Queue: Players register and are automatically added to a FIFO waiting list ('La Banca'). Admins can manage players in the queue in real-time.
- Live Court & Game Display: Real-time visualization of the 5v5 game on the main court area ('La Cancha'), displaying active teams and large, touch-optimized buttons to declare the winning team.
- Automated Game Logic & States: Backend logic to manage all game states: winner remains on court (+1 win), loser goes to the end of the queue, new challengers enter, and complex 'King of the Court' rules are enforced automatically.
- King & Throne Management: System for a team to achieve 'King' status after consecutive wins (and sufficient total players), ascend to the 'Trono' (waiting state), and prepare for the final challenge.
- Challenger Eliminator & Grand Final: Automated staging and management of the eliminator match among a new group of 10 challengers, leading to the grand final against the current 'King' for potential dethronement.
- Interactive Team Draft System: An interactive dialogue for administrators to manually select 5 players from the waiting queue to form Team A, with Team B being automatically composed of the remaining available players, to minimize input errors.
- AI Team Name Generator Tool: An AI tool that suggests creative and thematic team names for newly drafted teams, enhancing engagement and personality for each match.

## Style Guidelines:

- Overall dark theme for a 'dashboard' aesthetic, prioritizing contrast and touch usability. Primary color: a vibrant golden-yellow (#FBc251) evoking royalty and championship. Background: a desaturated dark charcoal with a subtle golden-brown tint (#2c2821). Accent color: a bold, analogous red-orange (#e63b1a) for crucial actions and highlights.
- Headline and body font: 'Inter' (sans-serif) for its modern, clear, and highly legible characteristics, suitable for data-rich displays and intuitive navigation within a Material Design 3 context.
- Utilize clean, modern, and easily recognizable vector icons following Material Design 3 guidelines. Focus on sports-related imagery (basketball, court elements), as well as regal motifs (crowns, thrones) for key game states.
- Split-screen layout: a prominent 60% left section ('La Cancha') dedicated to live game visualization with large, touch-friendly team and winner declaration buttons, including a distinct 'golden' section for the 'King'. The right 40% ('La Banca') for real-time player queue management and draft controls, optimized for technical desk use.
- Subtle and functional animations to provide instant feedback on game state changes, player queue updates, and transitions between game phases (e.g., King ascending the throne, team changes on court). Animations should be smooth and enhance the dashboard's responsive feel.