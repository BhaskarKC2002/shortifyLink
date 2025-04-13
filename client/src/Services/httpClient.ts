import axios from "axios";
import { handleRefreshToken } from "./authServices";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001/api/";
console.log("API URL configured as:", API_URL);
axios.defaults.baseURL = API_URL;

// Add CORS headers
axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';

axios.interceptors.request.use(
  function (config) {
    console.log("Making request to:", config.url);
    config.headers["authorization"] = `Bearer ${localStorage.getItem(
      "accessToken"
    )}`;
    config.headers["refresh_token"] =
      localStorage.getItem("refreshToken") || "";

    return config;
  },
  function (error) {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

//error and response

axios.interceptors.response.use(
  function (response) {
    //any status that lie within 2xx will trigger this
    console.log("success status request", response);
    return response;
  },
  async (error) => {
    //save original request
    const originalRequest = error.config;

    if (
      error.response.status === 401 &&
      originalRequest.url.includes("refresh-token")
    ) {
      //this means refresh token route is being called and refresh token is invalid
      //clear everything and show whatever the message needed
      //TODO redirect to logout route
      //TODO clear all the access and refresh token
      return Promise.reject(error);
    } else if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      //call refresh token handler
      await handleRefreshToken();

      return axios(originalRequest);
    }
    return Promise.reject(error);
  }
);

export default axios;
