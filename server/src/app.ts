import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

import dbConnect from "./config/db";
import baseRouter from "./routes";
import User from "./models/UserModel";
import corsOptions from "./cors-config";
dotenv.config();

const app = express();

// Use CORS middleware properly
app.use(cors(corsOptions));
console.log("Using CORS configuration with allowed origins:", corsOptions.origin);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const port = process.env.PORT || 5001;

//intialize the server
const server = app.listen(port, () =>
  console.log("Server up and running at port:", port)
);

//start db connection
dbConnect().then(async () => {
  console.log("Connected to MongoDB");
  
  // Create hardcoded user for testing
  try {
    // Check if test user already exists
    const existingUser = await User.findOne({ email: "intern@dacoid.com" });
    
    if (!existingUser) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("Test123", salt);
      
      // Create test user
      const testUser = new User({
        fullName: "Intern User",
        email: "intern@dacoid.com",
        password: hashedPassword,
      });
      
      await testUser.save();
      console.log("Test user created successfully");
    }
  } catch (error) {
    console.error("Error creating test user:", error);
  }
});

// Add OPTIONS preflight handling
app.options('*', cors(corsOptions));

// Print all route calling
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`Route call : ${req.method}: ${req.originalUrl}`);
  next();
});

// Add health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', env: process.env.NODE_ENV });
});

//initiate router
app.use("/api", baseRouter);

//listen unhandleRejection
process.on("unhandledRejection", (reason, p) => {
  //get slack notification about the error
  console.error("Unhandled Rejection at:", p, "reason:", reason);
  server.close();
  process.exit(1);
});
process.on("uncaughtException", (e) => {
  console.error("Uncaught exception at:", e);

  server.close();
  process.exit(1);
});
