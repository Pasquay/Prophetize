export type PredictionOption = {
  id: number;
  name: string;
  probability: number;
};

export type Prediction = {
  id: number;
  title: string;
  image: string;
  category: string;
  endDate: string;
  status: string;
  total_volume: number;
  options: PredictionOption[];
  description: string;
};
