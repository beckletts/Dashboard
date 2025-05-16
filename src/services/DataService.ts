import Papa from 'papaparse';

interface LMSRecord {
  Course: string;
  'Training type': string;
  'Enrollment Date (UTC TimeZone)': string;
  'Started Date (UTC TimeZone)': string;
  'Completion Date (UTC TimeZone)': string;
  Status: string;
  'Progress %': string;
  'Time Spent(minutes)': string;
  Quiz_score: string;
  'Centre Number': string;
  'Centre Country': string;
  'Completion Comment': string;
}

interface StorylaneRecord {
  Demo: string;
  Link: string;
  'Last View': string;
  'Total Time': string;
  'Steps Completed': string;
  'Percent Complete': string;
  'Opened CTA': string;
  Country: string;
}

export interface ProcessedData {
  trainingCatalogue: {
    customerJourneyPoint: string;
    trainingModule: string;
    trainingType: string;
    inProgress: number;
    notStarted: number;
    completed: number;
    date?: string;
  }[];
  centreData: {
    centreNumber: string;
    customerJourneyPoint: string;
    trainingModule: string;
    trainingType: string;
    numberOfRolesAvailable: number;
    completedTraining: number;
    inProgressTraining: number;
    notStartedTraining: number;
    date?: string;
  }[];
  centreUserData: {
    centreNumber: string;
    customerJourneyPoint: string;
    trainingModule: string;
    trainingType: string;
    userEmailAddress: string;
    status: string;
    progress: number;
    date?: string;
  }[];
  storylaneData: {
    demoName: string;
    link: string;
    lastView: string;
    totalTime: string;
    stepsCompleted: string;
    percentComplete: number;
    openedCTA: boolean;
    country: string;
  }[];
  availableDates: string[];
  catalogueByDate: Map<string, {
    customerJourneyPoint: string;
    trainingModule: string;
    trainingType: string;
    inProgress: number;
    notStarted: number;
    completed: number;
    date: string;
  }[]>;
}

class DataService {
  private lmsData: LMSRecord[] = [];
  private storylaneData: StorylaneRecord[] = [];
  private availableDates: string[] = [];

  async loadData(): Promise<ProcessedData> {
    await Promise.all([
      this.loadLMSData(),
      this.loadStorylaneData()
    ]);

    // Extract and format all available dates
    this.extractAvailableDates();

    return this.processData();
  }

  private async loadLMSData(): Promise<void> {
    const response = await fetch('/LMS.csv');
    const csvText = await response.text();
    const result = Papa.parse<LMSRecord>(csvText, {
      header: true,
      skipEmptyLines: true
    });
    this.lmsData = result.data;
  }

  private async loadStorylaneData(): Promise<void> {
    try {
      const response = await fetch('/storylane all.csv');
      if (!response.ok) {
        console.error(`Failed to fetch storylane all.csv: ${response.status} ${response.statusText}`);
        return;
      }
      
      const csvText = await response.text();
      
      const result = Papa.parse<StorylaneRecord>(csvText, {
        header: true,
        skipEmptyLines: true
      });
      
      if (result.errors && result.errors.length > 0) {
        console.error('Errors parsing Storylane CSV:', result.errors);
      }
      
      this.storylaneData = result.data;
    } catch (error) {
      console.error('Error loading Storylane data:', error);
    }
  }

  private extractAvailableDates(): void {
    // Extract dates from LMS data, format them, and get unique values
    const lmsDates = this.lmsData
      .map(record => {
        // Prioritize Enrollment Date if it exists
        const dateStr = record['Enrollment Date (UTC TimeZone)'] || '';
        if (!dateStr) return null;

        try {
          const date = new Date(dateStr);
          // Format as YYYY-MM-DD
          return date.toISOString().split('T')[0];
        } catch (e) {
          return null;
        }
      })
      .filter(date => date !== null) as string[];
      
    // Extract dates from Storylane data
    const storylaneDates = this.storylaneData
      .map(record => {
        const dateStr = record['Last View'] || '';
        if (!dateStr) return null;
        
        try {
          const date = new Date(dateStr);
          return date.toISOString().split('T')[0];
        } catch (e) {
          return null;
        }
      })
      .filter(date => date !== null) as string[];
      
    // Combine all dates and get unique values
    const allDates = [...lmsDates, ...storylaneDates];
    this.availableDates = Array.from(new Set(allDates)).sort();
  }

  private processData(): ProcessedData {
    // Process training catalogue data
    const trainingModules = new Map<string, {
      trainingType: string;
      inProgress: number;
      notStarted: number;
      completed: number;
      dateMap: Map<string, {
        inProgress: number;
        notStarted: number;
        completed: number;
      }>;
    }>();

    this.lmsData.forEach(record => {
      const key = record.Course;
      const current = trainingModules.get(key) || { 
        trainingType: record['Training type'] || 'Unknown',
        inProgress: 0, 
        notStarted: 0, 
        completed: 0,
        dateMap: new Map()
      };
      
      // Extract date
      let dateKey = 'Unknown';
      if (record['Enrollment Date (UTC TimeZone)']) {
        try {
          const date = new Date(record['Enrollment Date (UTC TimeZone)']);
          dateKey = date.toISOString().split('T')[0];
        } catch (e) {
          // Use default 'Unknown' if date parsing fails
        }
      }
      
      // Get or create date entry
      const dateEntry = current.dateMap.get(dateKey) || {
        inProgress: 0,
        notStarted: 0,
        completed: 0
      };
      
      // Special handling for webinars - only count enrollments, not completion status
      const isWebinar = current.trainingType.toLowerCase().includes('webinar');
      
      if (isWebinar) {
        // For webinars, we only care that they're enrolled, so count everything as "completed"
        current.completed++;
        dateEntry.completed++;
      } else {
        // Normal processing for non-webinar training
        if (record.Status && record.Status.toLowerCase().includes('complete')) {
          current.completed++;
          dateEntry.completed++;
        } else if (record.Status && record.Status.toLowerCase().includes('in progress')) {
          current.inProgress++;
          dateEntry.inProgress++;
        } else {
          current.notStarted++;
          dateEntry.notStarted++;
        }
      }
      
      current.dateMap.set(dateKey, dateEntry);
      trainingModules.set(key, current);
    });

    // Process centre data
    const centreData = new Map<string, {
      modules: Map<string, {
        trainingType: string;
        available: number;
        completed: number;
        inProgress: number;
        notStarted: number;
        dateMap: Map<string, {
          available: number;
          completed: number;
          inProgress: number;
          notStarted: number;
        }>;
      }>;
    }>();

    this.lmsData.forEach(record => {
      const centreNumber = record['Centre Number'];
      const current = centreData.get(centreNumber) || {
        modules: new Map()
      };

      const moduleData = current.modules.get(record.Course) || {
        trainingType: record['Training type'] || 'Unknown',
        available: 0,
        completed: 0,
        inProgress: 0,
        notStarted: 0,
        dateMap: new Map()
      };

      // Extract date
      let dateKey = 'Unknown';
      if (record['Enrollment Date (UTC TimeZone)']) {
        try {
          const date = new Date(record['Enrollment Date (UTC TimeZone)']);
          dateKey = date.toISOString().split('T')[0];
        } catch (e) {
          // Use default 'Unknown' if date parsing fails
        }
      }
      
      // Get or create date entry
      const dateEntry = moduleData.dateMap.get(dateKey) || {
        available: 0,
        completed: 0,
        inProgress: 0,
        notStarted: 0
      };

      moduleData.available++;
      dateEntry.available++;

      // Special handling for webinars
      const isWebinar = moduleData.trainingType.toLowerCase().includes('webinar');
      
      if (isWebinar) {
        // For webinars, count all enrolled as completed
        moduleData.completed++;
        dateEntry.completed++;
      } else {
        // Normal processing for non-webinar training
        if (record.Status && record.Status.toLowerCase().includes('complete')) {
          moduleData.completed++;
          dateEntry.completed++;
        } else if (record.Status && record.Status.toLowerCase().includes('in progress')) {
          moduleData.inProgress++;
          dateEntry.inProgress++;
        } else {
          moduleData.notStarted++;
          dateEntry.notStarted++;
        }
      }

      moduleData.dateMap.set(dateKey, dateEntry);
      current.modules.set(record.Course, moduleData);
      centreData.set(centreNumber, current);
    });

    // Create a map of dates to training catalogue data
    const catalogueByDate = new Map<string, {
      customerJourneyPoint: string;
      trainingModule: string;
      trainingType: string;
      inProgress: number;
      notStarted: number;
      completed: number;
      date: string;
    }[]>();

    // Create training catalogue entries for each date
    trainingModules.forEach((data, module) => {
      data.dateMap.forEach((dateData, dateKey) => {
        if (dateKey === 'Unknown') return;
        
        const dateEntries = catalogueByDate.get(dateKey) || [];
        dateEntries.push({
          customerJourneyPoint: 'Training',
          trainingModule: module,
          trainingType: data.trainingType,
          inProgress: dateData.inProgress,
          notStarted: dateData.notStarted,
          completed: dateData.completed,
          date: dateKey
        });
        catalogueByDate.set(dateKey, dateEntries);
      });
    });

    // Format the catalogue data for all dates (this will be used only if no date filter is applied)
    const catalogueData = Array.from(trainingModules.entries()).map(([module, data]) => ({
      customerJourneyPoint: 'Training',
      trainingModule: module,
      trainingType: data.trainingType,
      inProgress: data.inProgress,
      notStarted: data.notStarted,
      completed: data.completed
    }));

    // Format the centre data for all dates
    const centreDataFormatted = Array.from(centreData.entries()).flatMap(([centreNumber, data]) =>
      Array.from(data.modules.entries()).map(([module, moduleData]) => ({
        centreNumber,
        customerJourneyPoint: 'Training',
        trainingModule: module,
        trainingType: moduleData.trainingType,
        numberOfRolesAvailable: moduleData.available,
        completedTraining: moduleData.completed,
        inProgressTraining: moduleData.inProgress,
        notStartedTraining: moduleData.notStarted
      }))
    );

    // Format the user data with dates
    const userDataFormatted = this.lmsData.map(record => {
      let dateStr = '';
      if (record['Enrollment Date (UTC TimeZone)']) {
        try {
          const date = new Date(record['Enrollment Date (UTC TimeZone)']);
          dateStr = date.toISOString().split('T')[0];
        } catch (e) {
          // Keep empty string if date parsing fails
        }
      }
      
      return {
        centreNumber: record['Centre Number'],
        customerJourneyPoint: 'Training',
        trainingModule: record.Course,
        trainingType: record['Training type'] || 'Unknown',
        userEmailAddress: 'user@example.com', // This data isn't in the CSV
        status: record.Status || 'Unknown',
        progress: parseInt(record['Progress %'] || '0'),
        date: dateStr
      };
    });

    // Process Storylane data
    let storylaneDataFormatted: {
      demoName: string;
      link: string;
      lastView: string;
      totalTime: string;
      stepsCompleted: string;
      percentComplete: number;
      openedCTA: boolean;
      country: string;
    }[] = [];
    
    try {
      console.log('Raw Storylane data to process:', this.storylaneData);
      
      if (this.storylaneData && this.storylaneData.length > 0) {
        storylaneDataFormatted = this.storylaneData.map(record => {
          // Parse percent complete as a number
          const percentComplete = parseInt(record['Percent Complete'] || '0');
          
          // Parse steps completed
          let stepsCompleted = '0/0';
          if (record['Steps Completed']) {
            stepsCompleted = record['Steps Completed'];
          }
          
          // Convert 'Yes'/'No' to boolean
          const openedCTA = record['Opened CTA']?.toLowerCase() === 'yes';
          
          const result = {
            demoName: record.Demo || '',
            link: record.Link || '',
            lastView: record['Last View'] || '',
            totalTime: record['Total Time'] || '',
            stepsCompleted: stepsCompleted,
            percentComplete: percentComplete,
            openedCTA: openedCTA,
            country: record.Country || ''
          };
          
          console.log('Processed storylane record:', result);
          return result;
        });
      } else {
        console.warn('No Storylane data to process');
      }
    } catch (error) {
      console.error('Error processing Storylane data:', error);
    }
    
    console.log('Formatted Storylane data:', storylaneDataFormatted);

    return {
      trainingCatalogue: catalogueData,
      centreData: centreDataFormatted,
      centreUserData: userDataFormatted,
      storylaneData: storylaneDataFormatted,
      availableDates: this.availableDates,
      catalogueByDate: catalogueByDate // Store for date filtering
    };
  }

  // Method to filter data by date range
  filterByDateRange(data: ProcessedData, startDate?: string, endDate?: string): ProcessedData {
    if (!startDate && !endDate) {
      return data; // No filtering needed
    }

    // Parse start and end dates
    const start = startDate ? new Date(startDate) : new Date(0); // earliest possible date
    const end = endDate ? new Date(endDate) : new Date(); // current date if not specified

    // Filter user data by date
    const filteredUserData = data.centreUserData.filter(item => {
      // Keep all webinar data regardless of date
      const isWebinar = item.trainingType.toLowerCase().includes('webinar');
      if (isWebinar) return true;
      
      // Apply date filter for non-webinar data
      if (!item.date) return false;
      const itemDate = new Date(item.date);
      return itemDate >= start && itemDate <= end;
    });

    // Filter centre data - we'll recalculate based on the filtered user data
    const filteredCentreData = data.centreData.map(item => ({
      ...item,
      // We're just doing a straight copy for now, but in a real app, 
      // you would recalculate based on the filtered user data
    }));
    
    // Filter Storylane data by date
    const filteredStorylaneData = data.storylaneData.filter(item => {
      if (!item.lastView) return false;
      try {
        const itemDate = new Date(item.lastView);
        return itemDate >= start && itemDate <= end;
      } catch (e) {
        return false;
      }
    });

    // Calculate filtered training catalogue data by aggregating from the catalogueByDate Map
    const filteredCatalogueData: {
      customerJourneyPoint: string;
      trainingModule: string;
      trainingType: string;
      inProgress: number;
      notStarted: number;
      completed: number;
      date?: string;
    }[] = [];
    
    // First, collect webinar data from the full catalogue regardless of date
    const webinarModules = data.trainingCatalogue.filter(item => 
      item.trainingType.toLowerCase().includes('webinar')
    );
    
    // Add all webinar data to the filtered catalogue without date restrictions
    webinarModules.forEach(item => {
      filteredCatalogueData.push({
        customerJourneyPoint: item.customerJourneyPoint,
        trainingModule: item.trainingModule,
        trainingType: item.trainingType,
        inProgress: item.inProgress,
        notStarted: item.notStarted,
        completed: item.completed
      });
    });
    
    // Track which modules we've already added (the webinars)
    const processedModules = new Set(webinarModules.map(item => item.trainingModule));
    
    // Now handle non-webinar modules with date filtering
    const moduleAggregates = new Map<string, {
      trainingType: string;
      inProgress: number;
      notStarted: number;
      completed: number;
    }>();
    
    // Iterate through catalogueByDate to find entries within date range
    if (data.catalogueByDate) {
      data.catalogueByDate.forEach((entries, dateStr) => {
        const date = new Date(dateStr);
        if (date >= start && date <= end) {
          // This date is within range, aggregate its data
          entries.forEach(entry => {
            // Skip webinar entries as they're already included
            if (entry.trainingType.toLowerCase().includes('webinar')) return;
            
            const key = entry.trainingModule;
            const current = moduleAggregates.get(key) || {
              trainingType: entry.trainingType,
              inProgress: 0,
              notStarted: 0,
              completed: 0
            };
            
            current.inProgress += entry.inProgress;
            current.notStarted += entry.notStarted;
            current.completed += entry.completed;
            
            moduleAggregates.set(key, current);
          });
        }
      });
    }
    
    // Convert the aggregated data to array format
    moduleAggregates.forEach((data, module) => {
      // Only add if not already added (as a webinar)
      if (!processedModules.has(module)) {
        filteredCatalogueData.push({
          customerJourneyPoint: 'Training',
          trainingModule: module,
          trainingType: data.trainingType,
          inProgress: data.inProgress,
          notStarted: data.notStarted,
          completed: data.completed
        });
      }
    });

    // Return filtered data
    return {
      ...data,
      trainingCatalogue: filteredCatalogueData.length > 0 ? filteredCatalogueData : data.trainingCatalogue,
      centreData: filteredCentreData,
      centreUserData: filteredUserData,
      storylaneData: filteredStorylaneData
    };
  }
}

export const dataService = new DataService(); 