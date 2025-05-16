export interface TrainingCatalogue {
  customerJourneyPoint: string;
  trainingModule: string;
  trainingType: string;
  inProgress: number;
  notStarted: number;
  completed: number;
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
}

export interface CentreUserData {
  centreNumber: string;
  customerJourneyPoint: string;
  trainingModule: string;
  trainingType: string;
  userEmailAddress: string;
  status: string;
  progress: number;
} 