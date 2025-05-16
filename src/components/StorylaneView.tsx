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
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { dataService } from '../services/DataService';
import DateRangeFilter from './DateRangeFilter';
import { useTheme } from '@mui/material/styles';
import { StorylaneData } from '../types';

const StorylaneView: React.FC = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [data, setData] = useState<StorylaneData[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [fullData, setFullData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const processedData = await dataService.loadData();
        
        if (!processedData.storylaneData || processedData.storylaneData.length === 0) {
          setError('No Storylane data was loaded. Check the CSV file format.');
        }
        
        // Adjust any percentages if they're in decimal format (0-1 range)
        const fixedPercentData = processedData.storylaneData?.map(item => {
          if (item.percentComplete <= 1) {
            return {
              ...item,
              percentComplete: Math.round(item.percentComplete * 100)
            };
          }
          return item;
        }) || [];
        
        setFullData({
          ...processedData,
          storylaneData: fixedPercentData
        });
        setData(fixedPercentData);
        setAvailableDates(processedData.availableDates);
        
        // Set default to last 30 days
        const today = new Date();
        const last30 = new Date();
        last30.setDate(today.getDate() - 30);
        
        // Apply initial filter
        const filteredData = dataService.filterByDateRange(
          {
            ...processedData,
            storylaneData: fixedPercentData
          },
          last30.toISOString().split('T')[0],
          today.toISOString().split('T')[0]
        );
        setData(filteredData.storylaneData || []);
      } catch (error) {
        console.error('Error loading data:', error);
        setError(`Error loading data: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle date range filter changes
  const handleDateRangeChange = (newStartDate: string, newEndDate: string) => {
    if (!fullData) return;
    
    const filteredData = dataService.filterByDateRange(
      fullData,
      newStartDate,
      newEndDate
    );
    setData(filteredData.storylaneData);
  };

  // Get unique values for filters
  const uniqueCountries = Array.from(
    new Set(data.map((item) => item.country))
  );

  // Filter data based on search term and filters
  const filteredData = data.filter((item) => {
    const matchesSearch =
      searchTerm === '' ||
      Object.values(item)
        .join(' ')
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesCountry =
      countryFilter === '' || item.country === countryFilter;

    return matchesSearch && matchesCountry;
  });

  // Calculate metrics for visualizations
  const calculateMetrics = () => {
    // Average completion percentage
    const avgCompletion = filteredData.length > 0
      ? Math.round(filteredData.reduce((sum, item) => sum + item.percentComplete, 0) / filteredData.length)
      : 0;
      
    // Count of demos by completion status
    const completionStatus = [
      { name: '0-25%', value: 0 },
      { name: '26-50%', value: 0 },
      { name: '51-75%', value: 0 },
      { name: '76-100%', value: 0 }
    ];
    
    filteredData.forEach(item => {
      if (item.percentComplete <= 25) {
        completionStatus[0].value++;
      } else if (item.percentComplete <= 50) {
        completionStatus[1].value++;
      } else if (item.percentComplete <= 75) {
        completionStatus[2].value++;
      } else {
        completionStatus[3].value++;
      }
    });
    
    // Count by country
    const countryData = uniqueCountries.map(country => {
      const count = filteredData.filter(item => item.country === country).length;
      return { name: country, value: count };
    }).sort((a, b) => b.value - a.value);
    
    // CTA open rate
    const ctaClicked = filteredData.filter(item => item.openedCTA).length;
    const ctaRate = filteredData.length > 0 ? Math.round((ctaClicked / filteredData.length) * 100) : 0;
    
    // CTA click data for pie chart
    const ctaClickData = [
      { name: 'Clicked', value: ctaClicked },
      { name: 'Not Clicked', value: filteredData.length - ctaClicked }
    ];
    
    return {
      avgCompletion,
      completionStatus,
      countryData,
      ctaClicked,
      ctaRate,
      ctaClickData
    };
  };
  
  const metrics = calculateMetrics();
  
  // Colors for charts
  const COLORS = [
    theme.palette.pearson.turquoise, 
    theme.palette.pearson.purple, 
    theme.palette.pearson.yellow,
    theme.palette.pearson.lightPurple
  ];
  
  // Colors for CTA chart
  const CTA_COLORS = [
    theme.palette.success.main,
    theme.palette.grey[400]
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, color: 'error.main' }}>
        <Typography variant="h6" component="h2">Error Loading Data</Typography>
        <Typography variant="body1">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <Typography variant="h5" gutterBottom fontFamily="Plus Jakarta Sans" fontWeight={500}>
        Storylane Performance Dashboard
      </Typography>
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <DateRangeFilter 
            availableDates={availableDates}
            onDateFilterChange={handleDateRangeChange}
          />
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              id="storylane-search"
              label="Search"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flex: 1, minWidth: '200px' }}
            />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="country-filter-label">Country</InputLabel>
              <Select
                id="country-filter"
                labelId="country-filter-label"
                value={countryFilter}
                label="Country"
                onChange={(e: SelectChangeEvent) => setCountryFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                {uniqueCountries.map((country) => (
                  <MenuItem key={country} value={country}>
                    {country}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Paper>

      {/* KPI Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Demos
              </Typography>
              <Typography variant="h4">
                {filteredData.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Completion
              </Typography>
              <Typography variant="h4">
                {metrics.avgCompletion}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                CTA Click Rate
              </Typography>
              <Typography variant="h4">
                {metrics.ctaRate}%
              </Typography>
              <Typography variant="body2">
                {metrics.ctaClicked} of {filteredData.length} clicked
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Countries
              </Typography>
              <Typography variant="h4">
                {uniqueCountries.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom fontFamily="Plus Jakarta Sans" fontWeight={500}>
              Demo Completion Rates
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.completionStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {metrics.completionStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} demos`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom fontFamily="Plus Jakarta Sans" fontWeight={500}>
              CTA Click Rate
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.ctaClickData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {metrics.ctaClickData.map((entry, index) => (
                    <Cell key={`cta-cell-${index}`} fill={CTA_COLORS[index % CTA_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} demos`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom fontFamily="Plus Jakarta Sans" fontWeight={500}>
              Demo Usage by Country
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={metrics.countryData.slice(0, 5)} // Show top 5 countries
                margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end"
                  height={60}
                  interval={0}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" name="Demo Views" fill={theme.palette.pearson.purple} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Demo Details Table */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom fontFamily="Plus Jakarta Sans" fontWeight={500}>
          Demo Details
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Demo Name</TableCell>
                <TableCell>Last Viewed</TableCell>
                <TableCell>Completion</TableCell>
                <TableCell>Steps</TableCell>
                <TableCell>CTA Clicked</TableCell>
                <TableCell>Country</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((demo, index) => (
                  <TableRow key={index}>
                    <TableCell>{demo.demoName}</TableCell>
                    <TableCell>{demo.lastView}</TableCell>
                    <TableCell>
                      {demo.percentComplete}%
                      {demo.percentComplete === 100 && (
                        <Chip 
                          size="small" 
                          label="Complete" 
                          color="success" 
                          sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} 
                        />
                      )}
                    </TableCell>
                    <TableCell>{demo.stepsCompleted}</TableCell>
                    <TableCell>
                      {demo.openedCTA ? (
                        <Chip 
                          size="small" 
                          label="Clicked" 
                          color="primary" 
                          sx={{ height: 20, fontSize: '0.7rem' }} 
                        />
                      ) : 'No'}
                    </TableCell>
                    <TableCell>{demo.country}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default StorylaneView; 