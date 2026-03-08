export interface Options {
	id: number;
	name: string;
	probability: number;
}

export interface Prediction { 
	id: number; 
	title: string;
	image: string;
	category: string;
	endDate: string; 
	status: string;
	volume: number;
	options: Options[];	
	description: string;
}