import httpClient from "./httpClient";

import { getAuthUser } from "../util/useAuth";
import { UrlPayloadType, UrlType, AnalyticsEntry } from "../types";

export const createUrl = async (payload: UrlPayloadType) => {
  try {
    const { data } = await httpClient.post("url", payload);
    return data;
  } catch (error) {
    //TODO error handling and showing error to UI
    console.log(error);
    return error;
  }
};

export const getUrlsForUser = async (): Promise<Array<UrlType> | any> => {
  const userId = getAuthUser()?.id;
  try {
    const { data } = await httpClient.get(`url/user/${userId}`);
    return data;
  } catch (error) {
    //TODO error handling and showing error to UI
    console.log(error);
    return error;
  }
};

export const deleteUrlByUrlCode = async (urlCode: string) => {
  try {
    const { data } = await httpClient.delete(`url/${urlCode}`);
    return data;
  } catch (error) {
    //TODO error handling and showing error to UI
    console.log(error);
    return error;
  }
};

export const updateUrlCode = async (payload: Partial<UrlType>) => {
  try {
    const { data } = await httpClient.put(`url/${payload.urlCode}`, payload);
    return data;
  } catch (error) {
    //TODO error handling and showing error to UI
    console.log(error);
    return error;
  }
};

export const getUrlAnalytics = async (urlCode: string): Promise<{urlCode: string, visitCount: number, analytics: AnalyticsEntry[]} | any> => {
  try {
    const { data } = await httpClient.get(`url/analytics/${urlCode}`);
    return data;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const generateQRCode = async (urlCode: string): Promise<string> => {
  // We'll use a free QR code API service to generate a QR code
  const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://shortifylink-api.onrender.com/api/url/${urlCode}`;
  
  return apiUrl; // This is just the URL to the QR code image
};
