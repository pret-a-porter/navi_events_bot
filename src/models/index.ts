export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

export interface IPoint {
	lat: number;
	lng: number;
}

export interface IRect {
	lt: IPoint;
	rb: IPoint;
}

export enum EAddressType {
	Event = 'event',
	Free = 'free',
}

export interface IAddressCategory {
	id: number;
	name: string;
}

export interface INaviImage {
	image_uuid: string;
	image: string;
}

export interface IAddress {
	address_type: EAddressType;
	category: IAddressCategory;
	container: string;
	id: number;
	naviaddress: string;
	point: IPoint;
	zoom_level: number;
}

// TODO don't use any
export interface IAddressDetails extends Omit<IAddress, 'zoom_level'> {
	address_description: any;
	contacts: any[];
	count_favorites: number;
	count_likes: number;
	count_views: number;
	cover: INaviImage[];
	default_lang: string;
	event_end: string;
	event_start: string;
	expires_on: string;
	is_external: boolean;
	is_html: boolean;
	langs: string[];
	last_mile: any;
	locale: string;
	map_visibility: boolean;
	name: string;
	owner_id: number;
	postal_address: string;
	priority: number;
	sharable_cover: INaviImage[];
	working_hours: any[];
}
