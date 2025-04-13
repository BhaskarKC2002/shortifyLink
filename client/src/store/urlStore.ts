import { makeAutoObservable } from "mobx";
import { UrlPayloadType, UrlType, AnalyticsEntry } from "../types";
import {
  createUrl,
  deleteUrlByUrlCode,
  getUrlsForUser,
  getUrlAnalytics,
  generateQRCode
} from "../Services/urlServices";
import snackBarStore from "../components/common/Snackbar/store/snackBarStore";

class UrlStore {
  urlData: Array<UrlType> = [];
  urlDataLoading: boolean = false;
  showUrlAddView: boolean = false;
  newUrlPayload: UrlPayloadType = {
    originalLink: "",
    name: "",
    expirationDate: ""
  };
  
  // Analytics related state
  selectedUrlCode: string = "";
  analyticsData: { urlCode: string, visitCount: number, analytics: AnalyticsEntry[] } | null = null;
  analyticsLoading: boolean = false;
  qrCodeUrl: string = "";
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 5;
  searchQuery: string = "";

  constructor() {
    makeAutoObservable(this);
  }

  init = () => {
    this.fetchUrlsForUser();
  };

  //Fetch urls for users
  fetchUrlsForUser = async () => {
    try {
      this.urlDataLoading = true;

      const data = await getUrlsForUser();
      this.setUrlData(data);
      this.urlDataLoading = false;
    } catch (error) {
      console.log(error);
    }
  };

  //create new url
  createNewUrl = async () => {
    try {
      if (!this.newUrlPayload.originalLink) {
        alert("Original link is required");
        return;
      }
      await createUrl(this.newUrlPayload);
      this.fetchUrlsForUser();
      this.showUrlAddView = false;
      // Reset the form
      this.newUrlPayload = {
        originalLink: "",
        name: "",
        expirationDate: ""
      };
    } catch (error) {}
  };

  //delete url
  deleteUrl = async (urlCode: string) => {
    await deleteUrlByUrlCode(urlCode);
    this.fetchUrlsForUser();
    snackBarStore.showSnackBar("Deleted Successfully", "success");
  };
  
  // Get analytics for a specific URL
  fetchAnalytics = async (urlCode: string) => {
    try {
      this.analyticsLoading = true;
      this.selectedUrlCode = urlCode;
      const data = await getUrlAnalytics(urlCode);
      this.analyticsData = data;
      this.analyticsLoading = false;
    } catch (error) {
      console.log(error);
      this.analyticsLoading = false;
    }
  };
  
  // Generate QR code for a URL
  generateQRCode = async (urlCode: string) => {
    try {
      const qrCodeUrl = await generateQRCode(urlCode);
      this.qrCodeUrl = qrCodeUrl;
      return qrCodeUrl;
    } catch (error) {
      console.log(error);
      return null;
    }
  };
  
  // Pagination methods
  get paginatedUrls() {
    // First filter by search query if one exists
    let filteredUrls = this.urlData;
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filteredUrls = this.urlData.filter(url => 
        url.name?.toLowerCase().includes(query) || 
        url.originalLink.toLowerCase().includes(query) ||
        url.urlCode.toLowerCase().includes(query)
      );
    }
    
    // Then paginate
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return filteredUrls.slice(startIndex, startIndex + this.itemsPerPage);
  }
  
  get totalPages() {
    let filteredUrls = this.urlData;
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filteredUrls = this.urlData.filter(url => 
        url.name?.toLowerCase().includes(query) || 
        url.originalLink.toLowerCase().includes(query) ||
        url.urlCode.toLowerCase().includes(query)
      );
    }
    return Math.ceil(filteredUrls.length / this.itemsPerPage);
  }
  
  setCurrentPage = (page: number) => {
    this.currentPage = page;
  };
  
  setItemsPerPage = (items: number) => {
    this.itemsPerPage = items;
    this.currentPage = 1; // Reset to first page when changing items per page
  };
  
  setSearchQuery = (query: string) => {
    this.searchQuery = query;
    this.currentPage = 1; // Reset to first page when searching
  };

  setUrlData = (data: Array<UrlType>) => (this.urlData = data);

  setShowUrlAddView = (val: boolean) => (this.showUrlAddView = val);
}

const urlStore = new UrlStore();
export default urlStore;
