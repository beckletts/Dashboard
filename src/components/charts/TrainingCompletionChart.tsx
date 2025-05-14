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
  numberOfTimesCourseAttempted: number;
  numberOfTimesCourseCompleted: number;
}

interface Props {
  data: TrainingData[];
}

const TrainingCompletionChart: React.FC<Props> = ({ data }) => {
  const theme = useTheme();

  const chartData = data.map(item => ({
    name: item.trainingModule,
    Attempted: item.numberOfTimesCourseAttempted,
    Completed: item.numberOfTimesCourseCompleted,
    CompletionRate: item.numberOfTimesCourseAttempted > 0
      ? Math.round((item.numberOfTimesCourseCompleted / item.numberOfTimesCourseAttempted) * 100)
      : 0
  }));

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom fontFamily="Plus Jakarta Sans" fontWeight={500}>
        Training Completion Rates
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
            <Bar yAxisId="left" dataKey="Attempted" fill={theme.palette.pearson.purple} />
            <Bar yAxisId="left" dataKey="Completed" fill={theme.palette.pearson.turquoise} />
            <Bar yAxisId="right" dataKey="CompletionRate" fill={theme.palette.pearson.yellow} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default TrainingCompletionChart; 