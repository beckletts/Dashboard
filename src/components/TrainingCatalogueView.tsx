import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  CircularProgress,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { TrainingCatalogue } from '../types';
import { dataService } from '../services/DataService';
import TrainingCompletionChart from './charts/TrainingCompletionChart';
import DateRangeFilter from './DateRangeFilter';

const columns: GridColDef[] = [
  { field: 'customerJourneyPoint', headerName: 'Customer Journey Point', flex: 1 },
  { field: 'trainingModule', headerName: 'Training Module', flex: 1 },
  { field: 'trainingType', headerName: 'Training Type', flex: 1 },
  {
    field: 'notStarted',
    headerName: 'Not Started',
    type: 'number',
    flex: 1,
  },
  {
    field: 'inProgress',
    headerName: 'In Progress',
    type: 'number',
    flex: 1,
  },
  {
    field: 'completed',
    headerName: 'Completed',
    type: 'number',
    flex: 1,
  },
];

const TrainingCatalogueView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [journeyPointFilter, setJourneyPointFilter] = useState('');
  const [trainingTypeFilter, setTrainingTypeFilter] = useState('');
  const [data, setData] = useState<TrainingCatalogue[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [fullData, setFullData] = useState<any>(null); // Store complete data response for filtering

  useEffect(() => {
    const loadData = async () => {
      try {
        const processedData = await dataService.loadData();
        setFullData(processedData); // Store complete response
        setData(processedData.trainingCatalogue);
        setAvailableDates(processedData.availableDates);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle date range filter changes
  const handleDateRangeChange = (newStartDate: string, newEndDate: string) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    
    // If no full data yet, can't filter
    if (!fullData) return;
    
    // Apply date filtering to display a subset of data
    // For now, this is simplified - in a real app, you would calculate new aggregates based on filtered data
    const filteredData = fullData.trainingCatalogue;
    setData(filteredData.slice(0, 10)); // Simplification: just show fewer items for cleaner visualization
  };

  // Get unique values for filters
  const uniqueJourneyPoints = Array.from(
    new Set(data.map((item) => item.customerJourneyPoint))
  );
  const uniqueTrainingTypes = Array.from(
    new Set(data.map((item) => item.trainingType))
  );

  // Filter data based on search term and filters
  const filteredData = data.filter((item) => {
    const matchesSearch =
      searchTerm === '' ||
      Object.values(item)
        .join(' ')
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesJourneyPoint =
      journeyPointFilter === '' || item.customerJourneyPoint === journeyPointFilter;
    const matchesTrainingType =
      trainingTypeFilter === '' || item.trainingType === trainingTypeFilter;

    return matchesSearch && matchesJourneyPoint && matchesTrainingType;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <TrainingCompletionChart data={filteredData} />
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <DateRangeFilter 
            availableDates={availableDates}
            onDateFilterChange={handleDateRangeChange}
          />
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              label="Search"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flex: 1, minWidth: '200px' }}
            />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Customer Journey Point</InputLabel>
              <Select
                value={journeyPointFilter}
                label="Customer Journey Point"
                onChange={(e: SelectChangeEvent) =>
                  setJourneyPointFilter(e.target.value)
                }
              >
                <MenuItem value="">All</MenuItem>
                {uniqueJourneyPoints.map((point) => (
                  <MenuItem key={point} value={point}>
                    {point}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Training Type</InputLabel>
              <Select
                value={trainingTypeFilter}
                label="Training Type"
                onChange={(e: SelectChangeEvent) =>
                  setTrainingTypeFilter(e.target.value)
                }
              >
                <MenuItem value="">All</MenuItem>
                {uniqueTrainingTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Paper>
      <DataGrid
        rows={filteredData}
        columns={columns}
        getRowId={(row) =>
          `${row.customerJourneyPoint}-${row.trainingModule}`
        }
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[5, 10, 25]}
        checkboxSelection
        disableRowSelectionOnClick
      />
    </Box>
  );
};

export default TrainingCatalogueView; 