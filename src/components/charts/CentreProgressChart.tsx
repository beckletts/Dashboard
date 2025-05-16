import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Box, Typography, Paper, useTheme } from '@mui/material';

interface CentreData {
  centreNumber: string;
  numberOfRolesAvailable: number;
  completedTraining: number;
  inProgressTraining: number;
  notStartedTraining: number;
}

interface ChartData {
  name: string;
  numberOfRolesAvailable: number;
  completedTraining: number;
  inProgressTraining: number;
  notStartedTraining: number;
  completionRate: number;
}

interface Props {
  data: CentreData[];
}

const CentreProgressChart: React.FC<Props> = ({ data }) => {
  const theme = useTheme();

  const COLORS = [
    theme.palette.pearson.purple,
    theme.palette.pearson.turquoise,
    theme.palette.pearson.yellow,
    theme.palette.pearson.amethyst,
    theme.palette.pearson.lightTurquoise,
  ];

  // Aggregate data by centre
  const centreProgress = data.reduce((acc: ChartData[], curr) => {
    const existing = acc.find(item => item.name === curr.centreNumber);
    if (existing) {
      existing.numberOfRolesAvailable += curr.numberOfRolesAvailable;
      existing.completedTraining += curr.completedTraining;
      existing.inProgressTraining += curr.inProgressTraining;
      existing.notStartedTraining += curr.notStartedTraining;
      existing.completionRate = Math.round((existing.completedTraining / existing.numberOfRolesAvailable) * 100);
    } else {
      acc.push({
        name: curr.centreNumber,
        numberOfRolesAvailable: curr.numberOfRolesAvailable,
        completedTraining: curr.completedTraining,
        inProgressTraining: curr.inProgressTraining,
        notStartedTraining: curr.notStartedTraining,
        completionRate: Math.round((curr.completedTraining / curr.numberOfRolesAvailable) * 100)
      });
    }
    return acc;
  }, [] as ChartData[]);

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom fontFamily="Plus Jakarta Sans" fontWeight={500}>
        Centre Training Progress
      </Typography>
      <Box sx={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={centreProgress}
              dataKey="completedTraining"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              label={(entry) => `${entry.name}: ${entry.completionRate}%`}
            >
              {centreProgress.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                borderColor: theme.palette.pearson.purple,
                fontFamily: 'Plus Jakarta Sans'
              }}
            />
            <Legend
              wrapperStyle={{
                fontFamily: 'Plus Jakarta Sans'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default CentreProgressChart; 