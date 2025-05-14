# Training Dashboard

A React-based dashboard for visualizing training data across different centers. Built using Material-UI and Recharts, following Pearson's brand guidelines.

## Features

- Training Catalogue View: Visualize training completion rates and attempts
- Centre View: Track progress across different centers
- Centre User View: Individual user progress tracking
- Interactive charts and data grids
- Responsive design
- Pearson brand-compliant UI

## Tech Stack

- React
- TypeScript
- Material-UI (MUI)
- Recharts
- Papa Parse (CSV parsing)

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/training-dashboard.git
```

2. Install dependencies:
```bash
cd training-dashboard
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Data Format

The dashboard expects two CSV files in the `public` directory:
- `LMS.csv`: Learning Management System data
- `storylane.csv`: Storylane training data

## Building for Production

To create a production build:

```bash
npm run build
```

The build artifacts will be stored in the `build/` directory.

## License

MIT 