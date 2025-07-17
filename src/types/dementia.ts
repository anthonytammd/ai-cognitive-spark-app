export type TestStep = 'intro' | 'mini-cog' | 'slums' | 'results';

export interface MiniCogResults {
  recallScore: number;
  clockScore: number;
  total: number;
  type: 'mini-cog';
}

export interface SlumsResults {
  score: number;
  maxScore: number;
  type: 'slums';
}

export type TestResults = MiniCogResults | SlumsResults;