export interface ReverseGeocoder {
	getLatAndLong(address: string): LatLngPair;
}

export interface LatLngPair {
	lat: number;
	lng: number;
}
