export interface QuestSchema {
  name: string;
  questid: string;
  description: string;
  steps: QuestSchemaStep[];
  rewards: QuestSchemaReward[];
}

interface QuestSchemaStep {
  name: string;
  id: number;
  progress: [number, number];
  completed: boolean;
}

interface QuestSchemaReward {
  type: string;
  amount: number;
  rewardid: string;
}
