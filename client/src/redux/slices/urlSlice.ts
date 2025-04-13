import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UrlType, UrlPayloadType, AnalyticsEntry } from '../../types';
import {
  createUrl,
  deleteUrlByUrlCode,
  getUrlsForUser,
  getUrlAnalytics,
  generateQRCode,
  updateUrlCode
} from '../../Services/urlServices';

// Define types for the slice state
interface UrlState {
  urlData: UrlType[];
  urlDataLoading: boolean;
  showUrlAddView: boolean;
  newUrlPayload: UrlPayloadType;
  selectedUrlCode: string;
  analyticsData: { urlCode: string, visitCount: number, analytics: AnalyticsEntry[] } | null;
  analyticsLoading: boolean;
  qrCodeUrl: string;
  currentPage: number;
  itemsPerPage: number;
  searchQuery: string;
  error: string | null;
}

// Define initial state
const initialState: UrlState = {
  urlData: [],
  urlDataLoading: false,
  showUrlAddView: false,
  newUrlPayload: {
    originalLink: '',
    name: '',
    expirationDate: ''
  },
  selectedUrlCode: '',
  analyticsData: null,
  analyticsLoading: false,
  qrCodeUrl: '',
  currentPage: 1,
  itemsPerPage: 5,
  searchQuery: '',
  error: null
};

// Async thunks
export const fetchUrls = createAsyncThunk(
  'url/fetchUrls',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUrlsForUser();
      return response;
    } catch (error) {
      console.error(error);
      return rejectWithValue('Failed to fetch URLs');
    }
  }
);

export const addUrl = createAsyncThunk(
  'url/addUrl',
  async (payload: UrlPayloadType, { rejectWithValue }) => {
    try {
      const response = await createUrl(payload);
      return response;
    } catch (error) {
      console.error(error);
      return rejectWithValue('Failed to create URL');
    }
  }
);

export const removeUrl = createAsyncThunk(
  'url/removeUrl',
  async (urlCode: string, { rejectWithValue }) => {
    try {
      await deleteUrlByUrlCode(urlCode);
      return urlCode;
    } catch (error) {
      console.error(error);
      return rejectWithValue('Failed to delete URL');
    }
  }
);

export const fetchAnalytics = createAsyncThunk(
  'url/fetchAnalytics',
  async (urlCode: string, { rejectWithValue }) => {
    try {
      const response = await getUrlAnalytics(urlCode);
      return response;
    } catch (error) {
      console.error(error);
      return rejectWithValue('Failed to fetch analytics');
    }
  }
);

export const getQRCode = createAsyncThunk(
  'url/getQRCode',
  async (urlCode: string, { rejectWithValue }) => {
    try {
      const response = await generateQRCode(urlCode);
      return response;
    } catch (error) {
      console.error(error);
      return rejectWithValue('Failed to generate QR code');
    }
  }
);

export const updateUrl = createAsyncThunk(
  'url/updateUrl',
  async (payload: Partial<UrlType>, { rejectWithValue }) => {
    try {
      const response = await updateUrlCode(payload);
      return response;
    } catch (error) {
      console.error(error);
      return rejectWithValue('Failed to update URL');
    }
  }
);

// Create slice
const urlSlice = createSlice({
  name: 'url',
  initialState,
  reducers: {
    setShowUrlAddView: (state, action: PayloadAction<boolean>) => {
      state.showUrlAddView = action.payload;
    },
    setNewUrlPayload: (state, action: PayloadAction<Partial<UrlPayloadType>>) => {
      state.newUrlPayload = { ...state.newUrlPayload, ...action.payload };
    },
    resetNewUrlPayload: (state) => {
      state.newUrlPayload = initialState.newUrlPayload;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setItemsPerPage: (state, action: PayloadAction<number>) => {
      state.itemsPerPage = action.payload;
      state.currentPage = 1; // Reset to first page
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.currentPage = 1; // Reset to first page
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchUrls
      .addCase(fetchUrls.pending, (state) => {
        state.urlDataLoading = true;
        state.error = null;
      })
      .addCase(fetchUrls.fulfilled, (state, action) => {
        state.urlDataLoading = false;
        state.urlData = action.payload;
      })
      .addCase(fetchUrls.rejected, (state, action) => {
        state.urlDataLoading = false;
        state.error = action.payload as string;
      })
      
      // addUrl
      .addCase(addUrl.pending, (state) => {
        state.error = null;
      })
      .addCase(addUrl.fulfilled, (state) => {
        state.showUrlAddView = false;
        state.newUrlPayload = initialState.newUrlPayload;
      })
      .addCase(addUrl.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // removeUrl
      .addCase(removeUrl.fulfilled, (state, action) => {
        state.urlData = state.urlData.filter(url => url.urlCode !== action.payload);
      })
      
      // fetchAnalytics
      .addCase(fetchAnalytics.pending, (state) => {
        state.analyticsLoading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.analyticsData = action.payload;
        state.selectedUrlCode = action.payload.urlCode;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.error = action.payload as string;
      })
      
      // getQRCode
      .addCase(getQRCode.fulfilled, (state, action) => {
        state.qrCodeUrl = action.payload;
      })
      
      // updateUrl
      .addCase(updateUrl.fulfilled, (state) => {
        // The URL list will be refreshed by a subsequent fetchUrls call
      });
  }
});

// Export actions
export const {
  setShowUrlAddView,
  setNewUrlPayload,
  resetNewUrlPayload,
  setCurrentPage,
  setItemsPerPage,
  setSearchQuery
} = urlSlice.actions;

// Export selectors
export const selectPaginatedUrls = (state: { url: UrlState }) => {
  const { urlData, searchQuery, currentPage, itemsPerPage } = state.url;
  
  // First filter by search query if one exists
  let filteredUrls = urlData;
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredUrls = urlData.filter(url => 
      url.name?.toLowerCase().includes(query) || 
      url.originalLink.toLowerCase().includes(query) ||
      url.urlCode.toLowerCase().includes(query)
    );
  }
  
  // Then paginate
  const startIndex = (currentPage - 1) * itemsPerPage;
  return filteredUrls.slice(startIndex, startIndex + itemsPerPage);
};

export const selectTotalPages = (state: { url: UrlState }) => {
  const { urlData, searchQuery, itemsPerPage } = state.url;
  
  let filteredUrls = urlData;
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredUrls = urlData.filter(url => 
      url.name?.toLowerCase().includes(query) || 
      url.originalLink.toLowerCase().includes(query) ||
      url.urlCode.toLowerCase().includes(query)
    );
  }
  
  return Math.ceil(filteredUrls.length / itemsPerPage);
};

export default urlSlice.reducer; 