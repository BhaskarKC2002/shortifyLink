import { CorsOptions } from 'cors';

const corsOptions: CorsOptions = {
  origin: [
    "http://localhost:3000",
    "https://bhshortifylink.netlify.app"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'refresh_token']
};

export default corsOptions; 