export interface TrainingCatalogue {
  customerJourneyPoint: string;
  trainingModule: string;
  trainingType: string;
  numberOfTimesCourseAttempted: number;
  numberOfTimesCourseCompleted: number;
}

export interface CentreData {
  centreNumber: string;
  centreName: string;
  customerJourneyPoint: string;
  trainingModule: string;
  trainingType: string;
  numberOfRolesAvailable: number;
  completedTraining: number;
}

export interface CentreUserData {
  centreNumber: string;
  centreName: string;
  customerJourneyPoint: string;
  trainingModule: string;
  trainingType: string;
  userEmailAddress: string;
  startedTraining: number;
  completedTraining: number;
} 