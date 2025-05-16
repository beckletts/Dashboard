import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Box, Typography, Paper, useTheme } from '@mui/material';

interface TrainingData {
  trainingModule: string;
  inProgress: number;
  notStarted: number;
  completed: number;
}

interface Props {
  data: TrainingData[];
}

const TrainingCompletionChart: React.FC<Props> = ({ data }) => {
  const theme = useTheme();

  const chartData = data.map(item => ({
    name: item.trainingModule,
    'Not Started': item.notStarted,
    'In Progress': item.inProgress,
    'Completed': item.completed,
    CompletionRate: (item.notStarted + item.inProgress + item.completed) > 0
      ? Math.round((item.completed / (item.notStarted + item.inProgress + item.completed)) * 100)
      : 0
  }));

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom fontFamily="Plus Jakarta Sans" fontWeight={500}>
        Training Status Overview
      </Typography>
      <Box sx={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 100
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.pearson.lightPurple} />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              interval={0}
              height={100}
              tick={{ fill: theme.palette.text.primary, fontFamily: 'Plus Jakarta Sans' }}
            />
            <YAxis 
              yAxisId="left"
              tick={{ fill: theme.palette.text.primary, fontFamily: 'Plus Jakarta Sans' }}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              unit="%"
              tick={{ fill: theme.palette.text.primary, fontFamily: 'Plus Jakarta Sans' }}
            />
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
            <Bar yAxisId="left" dataKey="Not Started" fill={theme.palette.pearson.lightPurple} />
            <Bar yAxisId="left" dataKey="In Progress" fill={theme.palette.pearson.amethyst} />
            <Bar yAxisId="left" dataKey="Completed" fill={theme.palette.pearson.purple} />
            <Bar yAxisId="right" dataKey="CompletionRate" fill={theme.palette.pearson.turquoise} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default TrainingCompletionChart; 