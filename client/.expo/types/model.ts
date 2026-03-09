interface Options {
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

export interface User {
	id: number;
	username: string;
	avatar_url:string;
	balance:number;
	created_at: string;
	updated_at: string;
	role: string;
	last_claim_date: string;
	current_streak: number;
}