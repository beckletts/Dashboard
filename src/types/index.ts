export interface TrainingCatalogue {
  customerJourneyPoint: string;
  trainingModule: string;
  trainingType: string;
  inProgress: number;
  notStarted: number;
  completed: number;
  date?: string;
}

export interface CentreData {
  centreNumber: string;
  customerJourneyPoint: string;
  trainingModule: string;
  trainingType: string;
  numberOfRolesAvailable: number;
  completedTraining: number;
  inProgressTraining: number;
  notStartedTraining: number;
  date?: string;
}

export interface CentreUserData {
  centreNumber: string;
  customerJourneyPoint: string;
  trainingModule: string;
  trainingType: string;
  userEmailAddress: string;
  status: string;
  progress: number;
  date?: string;
}

export interface StorylaneData {
  demoName: string;
  link: string;
  lastView: string;
  totalTime: string;
  stepsCompleted: string;
  percentComplete: number;
  openedCTA: boolean;
  country: string;
} 