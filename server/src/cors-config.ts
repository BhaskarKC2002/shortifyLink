import { CorsOptions } from 'cors';

const corsOptions: CorsOptions = {
  origin: ['https://bhshortifylink.netlify.app', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'refresh_token'],
  exposedHeaders: ['Authorization', 'refresh_token'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

export default corsOptions; 