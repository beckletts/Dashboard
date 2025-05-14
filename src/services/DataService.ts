import Papa from 'papaparse';

interface LMSRecord {
  Course: string;
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
    numberOfTimesCourseAttempted: number;
    numberOfTimesCourseCompleted: number;
  }[];
  centreData: {
    centreNumber: string;
    centreName: string;
    customerJourneyPoint: string;
    trainingModule: string;
    trainingType: string;
    numberOfRolesAvailable: number;
    completedTraining: number;
  }[];
  centreUserData: {
    centreNumber: string;
    centreName: string;
    customerJourneyPoint: string;
    trainingModule: string;
    trainingType: string;
    userEmailAddress: string;
    startedTraining: number;
    completedTraining: number;
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
      attempted: number;
      completed: number;
    }>();

    this.lmsData.forEach(record => {
      const key = record.Course;
      const current = trainingModules.get(key) || { attempted: 0, completed: 0 };
      
      if (record['Started Date (UTC TimeZone)']) {
        current.attempted++;
      }
      if (record['Completion Date (UTC TimeZone)']) {
        current.completed++;
      }
      
      trainingModules.set(key, current);
    });

    // Process centre data
    const centreData = new Map<string, {
      centreName: string;
      modules: Map<string, {
        available: number;
        completed: number;
      }>;
    }>();

    this.lmsData.forEach(record => {
      const centreNumber = record['Centre Number'];
      const current = centreData.get(centreNumber) || {
        centreName: record['Centre Country'], // Using country as name for now
        modules: new Map()
      };

      const moduleData = current.modules.get(record.Course) || {
        available: 0,
        completed: 0
      };

      moduleData.available++;
      if (record['Completion Date (UTC TimeZone)']) {
        moduleData.completed++;
      }

      current.modules.set(record.Course, moduleData);
      centreData.set(centreNumber, current);
    });

    return {
      trainingCatalogue: Array.from(trainingModules.entries()).map(([module, data]) => ({
        customerJourneyPoint: 'Training', // You might want to map this based on module name
        trainingModule: module,
        trainingType: 'LMS',
        numberOfTimesCourseAttempted: data.attempted,
        numberOfTimesCourseCompleted: data.completed
      })),

      centreData: Array.from(centreData.entries()).flatMap(([centreNumber, data]) =>
        Array.from(data.modules.entries()).map(([module, moduleData]) => ({
          centreNumber,
          centreName: data.centreName,
          customerJourneyPoint: 'Training', // You might want to map this based on module name
          trainingModule: module,
          trainingType: 'LMS',
          numberOfRolesAvailable: moduleData.available,
          completedTraining: moduleData.completed
        }))
      ),

      centreUserData: this.lmsData.map(record => ({
        centreNumber: record['Centre Number'],
        centreName: record['Centre Country'], // Using country as name for now
        customerJourneyPoint: 'Training', // You might want to map this based on course name
        trainingModule: record.Course,
        trainingType: 'LMS',
        userEmailAddress: 'user@example.com', // This data isn't in the CSV
        startedTraining: record['Started Date (UTC TimeZone)'] ? 1 : 0,
        completedTraining: record['Completion Date (UTC TimeZone)'] ? 1 : 0
      }))
    };
  }
}

export const dataService = new DataService(); 