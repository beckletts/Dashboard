import React from 'react';
import { Box, Tab, Tabs, ThemeProvider } from '@mui/material';
import TrainingCatalogueView from './components/TrainingCatalogueView';
import CentreView from './components/CentreView';
import CentreUserView from './components/CentreUserView';
import StorylaneView from './components/StorylaneView';
import { theme } from './theme';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function App() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'pearson.lightPurple' }}>
          <Tabs 
            value={value} 
            onChange={handleChange}
            TabIndicatorProps={{
              style: {
                backgroundColor: 'pearson.purple'
              }
            }}
          >
            <Tab 
              label="Training Catalogue" 
              sx={{ 
                fontWeight: 500,
                '&.Mui-selected': {
                  color: 'pearson.purple'
                }
              }} 
            />
            <Tab 
              label="Centre View" 
              sx={{ 
                fontWeight: 500,
                '&.Mui-selected': {
                  color: 'pearson.purple'
                }
              }} 
            />
            <Tab 
              label="Centre User View" 
              sx={{ 
                fontWeight: 500,
                '&.Mui-selected': {
                  color: 'pearson.purple'
                }
              }} 
            />
            <Tab 
              label="Storylane Demos" 
              sx={{ 
                fontWeight: 500,
                '&.Mui-selected': {
                  color: 'pearson.purple'
                }
              }} 
            />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <TrainingCatalogueView />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <CentreView />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <CentreUserView />
        </TabPanel>
        <TabPanel value={value} index={3}>
          <StorylaneView />
        </TabPanel>
      </Box>
    </ThemeProvider>
  );
}

export default App; 