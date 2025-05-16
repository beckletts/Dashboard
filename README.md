# Pearson Training Dashboard

A comprehensive dashboard for visualizing training data from CSV files. This dashboard provides insights into training completion rates, webinar enrollments, and Storylane demo usage.

## Features

- **Training Catalogue View**: View and filter training modules by type, completion status, and date range
- **Centre View**: Analyze training progress across different centers with top 5 center rankings
- **Centre User View**: Detailed user-level training data
- **Storylane Demos View**: Visualize demo usage metrics including completion rates and CTA click rates

## Technology Stack

- React
- TypeScript
- Material-UI
- Recharts for data visualization
- Papa Parse for CSV parsing

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```
git clone https://github.com/beckletts/Dashboard.git
cd Dashboard
```

2. Install dependencies
```
npm install
```

3. Start the development server
```
npm start
```

The application will be available at http://localhost:3000

### Data Files

The dashboard uses two CSV files for data:
- `LMS.csv`: Contains training completion data
- `storylane all.csv`: Contains demo usage metrics

Place these files in the `public` directory.

## Deployment

To build the application for production:

```
npm run build
```

## License

This project is licensed under the MIT License. 