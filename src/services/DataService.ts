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
  availableDates: string[];
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
    const response = await fetch('/storylane.csv');
    const csvText = await response.text();
    const result = Papa.parse<StorylaneRecord>(csvText, {
      header: true,
      skipEmptyLines: true
    });
    this.storylaneData = result.data;
  }

  private extractAvailableDates(): void {
    // Extract dates from LMS data, format them, and get unique values
    const dates = this.lmsData
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

    // Get unique dates
    this.availableDates = Array.from(new Set(dates)).sort();
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

      moduleData.dateMap.set(dateKey, dateEntry);
      current.modules.set(record.Course, moduleData);
      centreData.set(centreNumber, current);
    });

    // Format the catalogue data for all dates
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

    return {
      trainingCatalogue: catalogueData,
      centreData: centreDataFormatted,
      centreUserData: userDataFormatted,
      availableDates: this.availableDates
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
      if (!item.date) return false;
      const itemDate = new Date(item.date);
      return itemDate >= start && itemDate <= end;
    });

    // Return filtered data
    // Note: For catalogue and centre data, we'll need to recalculate based on the filtered user data
    // This is a simplification - for a production app, you'd want to aggregate the metrics properly
    return {
      ...data,
      centreUserData: filteredUserData
    };
  }
}

export const dataService = new DataService(); 