export interface Options {
	id: number;
	name: string;
	probability: number;
}

export interface Prediction { 
	id: number; 
	title: string;
	image_url: string;
	category: string;
	end_date: Date; 
	status: string;
	volume: number;
	options: Options[];	
}