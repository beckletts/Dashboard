import React from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, Typography } from '@mui/material';

interface DateRangeFilterProps {
  availableDates: string[];
  onDateFilterChange: (startDate: string, endDate: string) => void;
}

// Options for common date range presets
const DATE_PRESETS = [
  { value: 'all', label: 'All Time' },
  { value: 'last30', label: 'Last 30 Days' },
  { value: 'last90', label: 'Last 90 Days' },
  { value: 'thisYear', label: 'This Year' },
  { value: 'lastYear', label: 'Last Year' },
  { value: 'custom', label: 'Custom Range' }
];

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ availableDates, onDateFilterChange }) => {
  const [preset, setPreset] = React.useState('last30');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [showCustomRange, setShowCustomRange] = React.useState(false);

  // Sort dates in ascending order
  const sortedDates = [...availableDates].sort();
  
  // Set up default dates on component mount
  React.useEffect(() => {
    if (availableDates.length > 0 && preset === 'last30') {
      const today = new Date();
      const last30 = new Date();
      last30.setDate(today.getDate() - 30);
      
      const newStartDate = last30.toISOString().split('T')[0];
      const newEndDate = today.toISOString().split('T')[0];
      
      setStartDate(newStartDate);
      setEndDate(newEndDate);
      onDateFilterChange(newStartDate, newEndDate);
    }
  }, [availableDates, onDateFilterChange]);
  
  const handlePresetChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setPreset(value);
    
    // Calculate date range based on preset
    let newStartDate = '';
    let newEndDate = '';
    const today = new Date();
    
    switch (value) {
      case 'all':
        // No filtering, use all dates
        newStartDate = '';
        newEndDate = '';
        setShowCustomRange(false);
        break;
      case 'last30':
        // Last 30 days
        const last30 = new Date();
        last30.setDate(today.getDate() - 30);
        newStartDate = last30.toISOString().split('T')[0];
        newEndDate = today.toISOString().split('T')[0];
        setShowCustomRange(false);
        break;
      case 'last90':
        // Last 90 days
        const last90 = new Date();
        last90.setDate(today.getDate() - 90);
        newStartDate = last90.toISOString().split('T')[0];
        newEndDate = today.toISOString().split('T')[0];
        setShowCustomRange(false);
        break;
      case 'thisYear':
        // This year
        newStartDate = `${today.getFullYear()}-01-01`;
        newEndDate = today.toISOString().split('T')[0];
        setShowCustomRange(false);
        break;
      case 'lastYear':
        // Last year
        newStartDate = `${today.getFullYear() - 1}-01-01`;
        newEndDate = `${today.getFullYear() - 1}-12-31`;
        setShowCustomRange(false);
        break;
      case 'custom':
        // Show custom date pickers
        setShowCustomRange(true);
        // Set default custom range to be the first and last available dates
        if (sortedDates.length > 0) {
          newStartDate = sortedDates[0];
          newEndDate = sortedDates[sortedDates.length - 1];
        }
        break;
      default:
        setShowCustomRange(false);
    }
    
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    onDateFilterChange(newStartDate, newEndDate);
  };
  
  const handleStartDateChange = (event: SelectChangeEvent) => {
    const newStartDate = event.target.value;
    setStartDate(newStartDate);
    onDateFilterChange(newStartDate, endDate);
  };
  
  const handleEndDateChange = (event: SelectChangeEvent) => {
    const newEndDate = event.target.value;
    setEndDate(newEndDate);
    onDateFilterChange(startDate, newEndDate);
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
      <Typography variant="body2" fontWeight="medium" sx={{ minWidth: '80px' }}>
        Date Range:
      </Typography>
      <FormControl sx={{ minWidth: 180 }}>
        <InputLabel>Time Period</InputLabel>
        <Select
          value={preset}
          label="Time Period"
          onChange={handlePresetChange}
        >
          {DATE_PRESETS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      {showCustomRange && (
        <>
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>Start Date</InputLabel>
            <Select
              value={startDate}
              label="Start Date"
              onChange={handleStartDateChange}
            >
              {sortedDates.map((date) => (
                <MenuItem key={`start-${date}`} value={date}>
                  {date}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>End Date</InputLabel>
            <Select
              value={endDate}
              label="End Date"
              onChange={handleEndDateChange}
            >
              {sortedDates
                .filter(date => new Date(date) >= new Date(startDate || '0000-01-01'))
                .map((date) => (
                  <MenuItem key={`end-${date}`} value={date}>
                    {date}
                  </MenuItem>
              ))}
            </Select>
          </FormControl>
        </>
      )}
    </Box>
  );
};

export default DateRangeFilter; 