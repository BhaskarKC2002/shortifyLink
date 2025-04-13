import { CorsOptions } from 'cors';

const corsOptions: CorsOptions = {
  origin: true, // Allow all origins for troubleshooting
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'refresh_token', 'Origin', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Authorization', 'refresh_token'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

export default corsOptions; 