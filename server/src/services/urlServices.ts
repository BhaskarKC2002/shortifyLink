import { generate as generateUrlcode } from "generate-password";

import { UrlPayloadType, UrlType, AnalyticsEntry } from "../types";
import Url from "../models/UrlModel";

//create
export const createUrl = async (payload: UrlPayloadType) => {
  if (!payload.originalLink || !payload.userId)
    throw Error("Missing required paramaters");
  try {
    let url = new Url(payload);

    //create urlcode
    const urlCode = generateUrlcode({
      length: 8,
      uppercase: true,
    });

    url.urlCode = urlCode;

    url = await url.save();

    return url;
  } catch (error) {
    Error(error);
  }
};

//get
export const getUrlByUrlCode = async (urlCode: string) => {
  try {
    let data = await Url.findOne({ urlCode });
    data.visitCount = data.visitCount + 1;
    return await Url.findOneAndUpdate({ urlCode: urlCode }, data);
  } catch (error) {
    console.log(error);
    Error(error);
  }
};

export const updateUrlCode = async (payload: Partial<UrlType>) => {
  if (!payload.urlCode) throw Error("Invalid urlCode");
  try {
    let data = await Url.findOne({ urlCode: payload.urlCode });

    //editable column restriction
    const editableColumn: Array<Partial<keyof UrlType>> = [
      "name",
      "originalLink",
      "expirationDate",
    ];

    Object.keys(payload).forEach((key: any) => {
      if (editableColumn.includes(key)) {
        data[key] = payload[key];
      }
    });

    return await Url.findOneAndUpdate({ urlCode: payload.urlCode }, data);
  } catch (error) {
    console.log(error);
    Error(error);
  }
};

export const deleteUrlByUrlCode = async (urlCode: string) => {
  try {
    const deleted = await Url.deleteOne({ urlCode });
    return "Deleted successfully";
  } catch (error) {
    console.log(error);
    Error(error);
  }
};

export const getUrlsForUser = async (userId: string) => {
  try {
    const urls = await Url.find({ userId: userId }).exec();
    console.log("urls", urls);
    return urls;
  } catch (error) {
    throw new Error("Interal server error");
  }
};

// Function to track analytics for URL visits
export const trackUrlAnalytics = async (urlCode: string, clientInfo: any) => {
  try {
    const url = await Url.findOne({ urlCode });
    if (!url) {
      throw new Error("URL not found");
    }

    // Parse user agent to get device, browser and OS info
    const userAgent = clientInfo.userAgent || '';
    
    // Create analytics entry
    const analyticsEntry: AnalyticsEntry = {
      timestamp: new Date(),
      ipAddress: clientInfo.ipAddress,
      // Basic device detection (can be improved with a proper user-agent parsing library)
      device: userAgent.match(/mobile|android|iphone|ipad/i) ? 'Mobile' : 'Desktop',
      browser: getBrowserInfo(userAgent),
      os: getOSInfo(userAgent),
      // For location, you would typically use a geo-IP service
      location: 'Unknown' // Placeholder
    };

    // Add analytics entry to URL document
    url.analytics = url.analytics || [];
    url.analytics.push(analyticsEntry);
    
    // Save the updated URL document
    await url.save();
    
    return analyticsEntry;
  } catch (error) {
    console.error("Error tracking analytics:", error);
    throw error;
  }
};

// Helper function to determine browser from user agent
function getBrowserInfo(userAgent: string): string {
  if (!userAgent) return 'Unknown';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) return 'Internet Explorer';
  return 'Unknown';
}

// Helper function to determine OS from user agent
function getOSInfo(userAgent: string): string {
  if (!userAgent) return 'Unknown';
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac OS')) return 'Mac OS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
  return 'Unknown';
}
