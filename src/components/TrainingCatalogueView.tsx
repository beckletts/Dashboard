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
  Chip,
} from '@mui/material';
import { 
  DataGrid, 
  GridColDef, 
  GridRenderCellParams
} from '@mui/x-data-grid';
import { TrainingCatalogue } from '../types';
import { dataService } from '../services/DataService';
import TrainingCompletionChart from './charts/TrainingCompletionChart';
import DateRangeFilter from './DateRangeFilter';

const getColumns = (data: TrainingCatalogue[]): GridColDef[] => [
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
    headerName: data.some(item => item.trainingType.toLowerCase().includes('webinar')) 
      ? 'Completed / Enrolled' 
      : 'Completed',
    renderHeader: () => {
      return data.some(item => item.trainingType.toLowerCase().includes('webinar')) 
        ? 'Completed / Enrolled' 
        : 'Completed';
    },
    renderCell: (params: GridRenderCellParams) => {
      const isWebinar = params.row.trainingType.toLowerCase().includes('webinar');
      return (
        <>
          {params.value}
          {isWebinar && (
            <Chip 
              label="Webinar Enrollments" 
              size="small" 
              color="primary" 
              sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} 
            />
          )}
        </>
      );
    },
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
  const [fullData, setFullData] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const processedData = await dataService.loadData();
        setFullData(processedData);
        setData(processedData.trainingCatalogue);
        setAvailableDates(processedData.availableDates);
        
        // Set default to last 30 days
        const today = new Date();
        const last30 = new Date();
        last30.setDate(today.getDate() - 30);
        
        // Apply initial filter for cleaner visualization
        const filteredData = dataService.filterByDateRange(
          processedData,
          last30.toISOString().split('T')[0],
          today.toISOString().split('T')[0]
        );
        setData(filteredData.trainingCatalogue);
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
    if (!fullData) return;
    
    // Apply date filtering to display a subset of data
    const filteredData = dataService.filterByDateRange(
      fullData,
      newStartDate,
      newEndDate
    );
    setData(filteredData.trainingCatalogue);
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

  // Get columns dynamically based on the data
  const columns = getColumns(data);

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