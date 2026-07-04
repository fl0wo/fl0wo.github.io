Target language: Chinese (中文)
Target locale: zh-CN
Text direction: ltr
Expected destination path: src/content/pages/projects/index.zh.md

Translate the source file below from English into the target language.
Return only the translated file content. Do not wrap the whole answer in Markdown fences. Do not add explanations.

Rules:
- Translate human-readable prose only.
- Preserve every frontmatter key and data type.
- Preserve Markdown and MDX syntax.
- Preserve code fences, inline code, raw HTML tags, directives, image URLs, local file paths, external URLs, and technical identifiers.
- Preserve the slug and do not rename files.
- Preserve image paths exactly, including relative paths such as ./cover.jpg.
- Keep dates, booleans, arrays, and nested frontmatter objects valid.

Source file:
```markdown
---
layout: '~/layouts/MarkdownLayout.astro'
title: Projects I'm Proud Of
---

### Throw The Alien Go
[View on GitHub](https://github.com/fl0wo/trajectory-go)  
**Technologies:** 2D Game Development, Math, Shaders, Line Interpolation

![Throw The Alien Go Gameplay](/images/trajectory.gif)

• Developed a 2D physics-based puzzle game with complex mathematical calculations  
• Implemented custom shaders for visual effects and line interpolation for trajectory prediction  
• Created gravity mechanics with planets and black holes that affect the alien's trajectory  
• Designed challenging levels where players must throw an alien to reach white holes while avoiding obstacles  
• Built physics simulation system that accounts for gravitational attraction and collision detection

### Airport Logistic
[View on GitHub](https://github.com/fl0wo/AirportLogistic)  
**Technologies:** C++, Dijkstra's Algorithm, Math, Geometric, SFML

![Airport Logistic Animation 1](/images/ezgif2.gif)
![Airport Logistic Animation 2](/images/ezgif3.gif)

• Developed a C++ program that simulates the logistic operations of an airport  
• Implemented Dijkstra's algorithm to find the shortest path between two points considering transportation carpet that moves objects 2X faster  
• Utilized geometric calculations to optimize the angle at which the object should join or leave each carpet  
• Created a friendly view with SFML library

### RogueLike Game
[View on GitHub](https://github.com/fl0wo/SquareGame)  
**Technologies:** C++, Dijkstra's Algorithm, Math, Geometric, SFML

![RogueLike Game](/images/square-game.gif)

• Developed a C++ game that simulates a RogueLike game  
• Implemented Dijkstra's algorithm to find the shortest path between players  
• Built custom data-structure to handle lighting and shadows  
• Created a friendly UI with SFML library

### Training Worms to Eat (Genetic Algorithm)
[View on GitHub](https://github.com/fl0wo/training-worms-to-eat)  
**Technologies:** Rust, ML Genetic Algorithm, Raylib, Geometric

![Worms Animation 1](/images/worm-gif-1.gif)
![Worms Animation 2](/images/worm-gif-2.gif)

• Developed a Rust program that simulates worms eating food  
• Implemented a genetic algorithm to train worms to eat food  
• Built and trained a model to predict the best path for the worm to eat food  
• Created a friendly UI with Raylib library
```
