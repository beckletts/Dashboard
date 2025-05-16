import React from 'react';
import { Box, Typography, Paper, useTheme, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

interface CentreData {
  centreNumber: string;
  numberOfRolesAvailable: number;
  completedTraining: number;
  inProgressTraining: number;
  notStartedTraining: number;
  trainingType?: string;
}

interface ChartData {
  name: string;
  numberOfRolesAvailable: number;
  completedTraining: number;
  inProgressTraining: number;
  notStartedTraining: number;
  completionRate: number;
  isELearning: boolean;
}

interface Props {
  data: CentreData[];
}

const CentreProgressChart: React.FC<Props> = ({ data }) => {
  const theme = useTheme();
  
  // Check if we're currently filtering for eLearning
  const isELearningFiltered = data.length > 0 && 
    data.every(item => item.trainingType?.toLowerCase().includes('elearning'));

  // Aggregate data by centre
  const centreProgress: ChartData[] = data.reduce((acc: ChartData[], curr) => {
    const existing = acc.find(item => item.name === curr.centreNumber);
    
    // Check if current item is eLearning
    const isELearning = curr.trainingType?.toLowerCase().includes('elearning') || false;
    
    if (existing) {
      existing.numberOfRolesAvailable += curr.numberOfRolesAvailable;
      existing.completedTraining += curr.completedTraining;
      existing.inProgressTraining += curr.inProgressTraining;
      existing.notStartedTraining += curr.notStartedTraining;
      existing.completionRate = Math.round((existing.completedTraining / existing.numberOfRolesAvailable) * 100);
      existing.isELearning = existing.isELearning || isELearning;
    } else {
      acc.push({
        name: curr.centreNumber,
        numberOfRolesAvailable: curr.numberOfRolesAvailable,
        completedTraining: curr.completedTraining,
        inProgressTraining: curr.inProgressTraining,
        notStartedTraining: curr.notStartedTraining,
        completionRate: Math.round((curr.completedTraining / curr.numberOfRolesAvailable) * 100) || 0,
        isELearning: isELearning
      });
    }
    return acc;
  }, [] as ChartData[]);

  // Sort centers based on either completion rate or completed training count
  let topCentres;
  if (isELearningFiltered) {
    // When eLearning filter is applied, sort by number of completed trainings
    topCentres = [...centreProgress]
      .sort((a, b) => b.completedTraining - a.completedTraining)
      .slice(0, 5);
  } else {
    // Otherwise sort by completion rate
    topCentres = [...centreProgress]
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 5);
  }

  // Calculate overall metrics
  const totalRoles = centreProgress.reduce((sum, centre) => sum + centre.numberOfRolesAvailable, 0);
  const totalCompleted = centreProgress.reduce((sum, centre) => sum + centre.completedTraining, 0);
  const totalInProgress = centreProgress.reduce((sum, centre) => sum + centre.inProgressTraining, 0);
  const totalNotStarted = centreProgress.reduce((sum, centre) => sum + centre.notStartedTraining, 0);
  const overallCompletionRate = totalRoles > 0 ? Math.round((totalCompleted / totalRoles) * 100) : 0;

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" fontFamily="Plus Jakarta Sans" fontWeight={500} sx={{ mb: 2 }}>
        Centre Training Progress (Top 5 Centres {isELearningFiltered ? 'by eLearning Completions' : 'by Completion Rate'})
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        <Box sx={{ flex: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Centre Number</TableCell>
                  <TableCell>Completion Rate</TableCell>
                  <TableCell>Completed</TableCell>
                  <TableCell>In Progress</TableCell>
                  <TableCell>Not Started</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topCentres.map((centre) => (
                  <TableRow key={centre.name}>
                    <TableCell>{centre.name}</TableCell>
                    <TableCell>{centre.completionRate}%</TableCell>
                    <TableCell>{centre.completedTraining}</TableCell>
                    <TableCell>{centre.inProgressTraining}</TableCell>
                    <TableCell>{centre.notStartedTraining}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          p: 2,
          borderRadius: 1,
          bgcolor: theme.palette.pearson.lightPurple + '20' // Using hex alpha for light background
        }}>
          <Typography variant="h6" gutterBottom fontFamily="Plus Jakarta Sans" fontWeight={500}>
            Overall Progress
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" fontFamily="Plus Jakarta Sans">
              Completion Rate: <strong>{overallCompletionRate}%</strong>
            </Typography>
            <Typography variant="body2" fontFamily="Plus Jakarta Sans" color="text.secondary">
              {totalCompleted} of {totalRoles} roles completed
            </Typography>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" fontFamily="Plus Jakarta Sans">
              In Progress: <strong>{Math.round((totalInProgress / totalRoles) * 100)}%</strong>
            </Typography>
            <Typography variant="body2" fontFamily="Plus Jakarta Sans" color="text.secondary">
              {totalInProgress} roles in progress
            </Typography>
          </Box>
          <Box>
            <Typography variant="body1" fontFamily="Plus Jakarta Sans">
              Not Started: <strong>{Math.round((totalNotStarted / totalRoles) * 100)}%</strong>
            </Typography>
            <Typography variant="body2" fontFamily="Plus Jakarta Sans" color="text.secondary">
              {totalNotStarted} roles not started
            </Typography>
          </Box>
          <Box sx={{ mt: 3 }}>
            <Typography variant="caption" fontFamily="Plus Jakarta Sans" color="text.secondary">
              * Showing top 5 centres {isELearningFiltered ? 'by number of completed eLearning courses' : 'by completion rate'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default CentreProgressChart; 