# SoccerPredict Pro ⚽

A powerful soccer match prediction calculator built with React and Vite, featuring Super Mario themed styling and advanced statistical calculations.

## 🎯 Features

- **Monte Carlo Simulation**: Advanced probabilistic match outcome predictions
- **Poisson Distribution**: Statistical modeling for goal probability calculations
- **Super Mario Theme**: Vibrant, colorful interface with Mario-inspired design
- **Dynamic Mode**: Animated effects and smooth transitions
- **Save/Load Calculations**: Store and retrieve your prediction results
- **Responsive Design**: Works perfectly on desktop and mobile devices

## 🎮 Theme

The application features a unique Super Mario color palette:
- Mario Red (#dc143c) - Primary actions and highlights
- Mario Blue (#1e90ff) - Secondary elements and buttons
- Coin Yellow (#ffd700) - Accents and special highlights
- Luigi Green (#32cd32) - Success states and confirmations

## 🚀 Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/thille6/soccerpredict_pro.git
cd soccerpredict_pro
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:4028`

## 📊 Calculation Methods

### Monte Carlo Simulation
- Uses random sampling to simulate thousands of matches
- Provides probability distributions for different outcomes
- Accounts for home advantage and team statistics

### Poisson Distribution
- Mathematical model based on average goal scoring rates
- Calculates exact probabilities for specific scorelines
- Considers league averages and adjustment factors

## 🛠️ Built With

- **React 18** - Frontend framework
- **Vite** - Build tool and development server
- **TailwindCSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Custom Hooks** - Theme management and state handling

## 🎨 Theme System

The application includes a sophisticated theme system with:
- Light mode with Super Mario colors (default)
- Dynamic mode with animations and transitions
- CSS custom properties for consistent styling
- Responsive design patterns

## 💾 Data Persistence

- LocalStorage integration for saving calculations
- Import/Export functionality for sharing predictions
- Calculation history with detailed metadata

## 🔧 Development

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run serve` - Preview production build

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components
│   └── AppIcon.jsx     # Icon component
├── contexts/           # React contexts
│   └── ThemeContext.jsx
├── pages/              # Page components
│   └── calculator/     # Calculator page
├── styles/             # Styling files
│   ├── themes.css      # Theme definitions
│   └── tailwind.css    # Tailwind imports
└── utils/              # Utility functions
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎉 Acknowledgments

- Inspired by the colorful world of Super Mario
- Built with modern React best practices
- Designed for soccer enthusiasts and data analysts

---

Made with ⚽ and 🍄 by thille6