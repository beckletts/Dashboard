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
import { CentreData } from '../types';
import { dataService } from '../services/DataService';
import CentreProgressChart from './charts/CentreProgressChart';

const columns: GridColDef[] = [
  { field: 'centreNumber', headerName: 'Centre Number', flex: 1 },
  { field: 'centreName', headerName: 'Centre Name', flex: 1 },
  { field: 'customerJourneyPoint', headerName: 'Customer Journey Point', flex: 1 },
  { field: 'trainingModule', headerName: 'Training Module', flex: 1 },
  { field: 'trainingType', headerName: 'Training Type', flex: 1 },
  {
    field: 'numberOfRolesAvailable',
    headerName: 'Roles Available',
    type: 'number',
    flex: 1,
  },
  {
    field: 'completedTraining',
    headerName: 'Completed Training',
    type: 'number',
    flex: 1,
  },
];

const CentreView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [centreFilter, setCentreFilter] = useState('');
  const [journeyPointFilter, setJourneyPointFilter] = useState('');
  const [trainingTypeFilter, setTrainingTypeFilter] = useState('');
  const [data, setData] = useState<CentreData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const processedData = await dataService.loadData();
        setData(processedData.centreData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Get unique values for filters
  const uniqueCentres = Array.from(
    new Set(data.map((item) => item.centreName))
  );
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
    const matchesCentre =
      centreFilter === '' || item.centreName === centreFilter;
    const matchesJourneyPoint =
      journeyPointFilter === '' || item.customerJourneyPoint === journeyPointFilter;
    const matchesTrainingType =
      trainingTypeFilter === '' || item.trainingType === trainingTypeFilter;

    return (
      matchesSearch &&
      matchesCentre &&
      matchesJourneyPoint &&
      matchesTrainingType
    );
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
      <CentreProgressChart data={filteredData} />
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Search"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flex: 1, minWidth: '200px' }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Centre</InputLabel>
            <Select
              value={centreFilter}
              label="Centre"
              onChange={(e: SelectChangeEvent) => setCentreFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {uniqueCentres.map((centre) => (
                <MenuItem key={centre} value={centre}>
                  {centre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
      </Paper>
      <DataGrid
        rows={filteredData}
        columns={columns}
        getRowId={(row) => `${row.centreNumber}-${row.trainingModule}`}
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

export default CentreView; 