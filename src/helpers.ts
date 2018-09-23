import axios from 'axios';

import { IAddress, IAddressDetails, IPoint, IRect } from './models';

axios.defaults.baseURL = 'https://staging-api.naviaddress.com/api/v1.5/';

export function createRect(point: IPoint, delta: number): IRect {
  return {
    lt: {
      lat: point.lat - delta,
      lng: point.lng - delta,
    },
    rb: {
      lat: point.lat + delta,
      lng: point.lng + delta,
    },
  };
}

export async function getAddressList(rect: IRect, limit = 10): Promise<IAddress[]> {
  return axios
    .get('Map', {
      params: {
        address_type: 'event',
        lang: ['en', 'ru'],
        limit,
        zoom: 15,
        lt_lat: rect.lt.lat,
        lt_lng: rect.lt.lng,
        rb_lat: rect.rb.lat,
        rb_lng: rect.rb.lng,
      },
    })
    .then(response => response.data.result)
    .catch(error => {
      console.error(`Error. getAddressList`);
    });
}

export async function getAddressDetails(address: IAddress): Promise<IAddressDetails> {
  const url = `Addresses/${address.container}/${encodeURIComponent(address.naviaddress)}`;

  return axios
    .get(url, {
      params: {
        lang: ['en', 'ru']
      }
    })
    .then(response => response.data.result)
    .catch(error => {
      console.error(`Error. getAddressDetails`);
    });
}

export function getSortedAddressList(point: IPoint, list: IAddress[]): IAddress[] {
  return list.slice().sort((a, b) => distance(point, a) - distance(point, b));
}

function distance(point: IPoint, address: IAddress): number {
  return Math.sqrt(Math.pow(address.point.lat - point.lat, 2) + Math.pow(address.point.lng - point.lng, 2));
}

function getFirstArrayItem<T>(arr: T[]): T | undefined {
  if (Array.isArray(arr) && arr.length > 0) {
    return arr[0];
  }

  return undefined;
}

export function getAddressImage(details: IAddressDetails): string | undefined {
  const cover = getFirstArrayItem(details.cover);

  if (cover && cover.image) {
    return cover.image;
  }

  const sharableCover = getFirstArrayItem(details.sharable_cover);

  if (sharableCover && sharableCover.image) {
    return sharableCover.image;
  }

  return undefined;
}
