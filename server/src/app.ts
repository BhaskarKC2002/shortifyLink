import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

import dbConnect from "./config/db";
import baseRouter from "./routes";
import User from "./models/UserModel";
dotenv.config();

const app = express();

app.use(cors({ 
  origin: [
    "http://localhost:3000",
    "https://your-netlify-site.netlify.app", // Replace with your actual Netlify URL
    "https://shortifylink-bhaskar.netlify.app", // Common format for Netlify URLs
    "*" // During testing - remove in production
  ],
  credentials: true
}));
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

//print all the route calling
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`Route call : ${req.method}: ${req.originalUrl}`);
  next();
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
