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
  }[];
  centreUserData: {
    centreNumber: string;
    customerJourneyPoint: string;
    trainingModule: string;
    trainingType: string;
    userEmailAddress: string;
    status: string;
    progress: number;
  }[];
}

class DataService {
  private lmsData: LMSRecord[] = [];
  private storylaneData: StorylaneRecord[] = [];

  async loadData(): Promise<ProcessedData> {
    await Promise.all([
      this.loadLMSData(),
      this.loadStorylaneData()
    ]);

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

  private processData(): ProcessedData {
    // Process training catalogue data
    const trainingModules = new Map<string, {
      trainingType: string;
      inProgress: number;
      notStarted: number;
      completed: number;
    }>();

    this.lmsData.forEach(record => {
      const key = record.Course;
      const current = trainingModules.get(key) || { 
        trainingType: record['Training type'] || 'Unknown',
        inProgress: 0, 
        notStarted: 0, 
        completed: 0 
      };
      
      if (record.Status && record.Status.toLowerCase().includes('complete')) {
        current.completed++;
      } else if (record.Status && record.Status.toLowerCase().includes('in progress')) {
        current.inProgress++;
      } else {
        current.notStarted++;
      }
      
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
        notStarted: 0
      };

      moduleData.available++;
      
      if (record.Status && record.Status.toLowerCase().includes('complete')) {
        moduleData.completed++;
      } else if (record.Status && record.Status.toLowerCase().includes('in progress')) {
        moduleData.inProgress++;
      } else {
        moduleData.notStarted++;
      }

      current.modules.set(record.Course, moduleData);
      centreData.set(centreNumber, current);
    });

    return {
      trainingCatalogue: Array.from(trainingModules.entries()).map(([module, data]) => ({
        customerJourneyPoint: 'Training', // You might want to map this based on module name
        trainingModule: module,
        trainingType: data.trainingType,
        inProgress: data.inProgress,
        notStarted: data.notStarted,
        completed: data.completed
      })),

      centreData: Array.from(centreData.entries()).flatMap(([centreNumber, data]) =>
        Array.from(data.modules.entries()).map(([module, moduleData]) => ({
          centreNumber,
          customerJourneyPoint: 'Training', // You might want to map this based on module name
          trainingModule: module,
          trainingType: moduleData.trainingType,
          numberOfRolesAvailable: moduleData.available,
          completedTraining: moduleData.completed,
          inProgressTraining: moduleData.inProgress,
          notStartedTraining: moduleData.notStarted
        }))
      ),

      centreUserData: this.lmsData.map(record => ({
        centreNumber: record['Centre Number'],
        customerJourneyPoint: 'Training', // You might want to map this based on course name
        trainingModule: record.Course,
        trainingType: record['Training type'] || 'Unknown',
        userEmailAddress: 'user@example.com', // This data isn't in the CSV
        status: record.Status || 'Unknown',
        progress: parseInt(record['Progress %'] || '0')
      }))
    };
  }
}

export const dataService = new DataService(); 