import express, { Router, NextFunction, Request, Response } from "express";

import Url from "../models/UrlModel";
import {
  createUrl,
  deleteUrlByUrlCode,
  getUrlByUrlCode,
  getUrlsForUser,
  updateUrlCode,
  trackUrlAnalytics,
} from "../services/urlServices";
import { verifyAccessToken } from "../middlewares/authToken";

const router = Router();

router.post("/", verifyAccessToken, async (req: Request, res: Response) => {
  //TODO you can move this to a seperate controller
  //TODO add validation here

  const { originalLink, expirationDate } = req.body;

  if (originalLink) {
    try {
      let urlData = await Url.findOne({ originalLink });
      if (urlData) {
        res.status(200).json(urlData);
      } else {
        const data = await createUrl({ ...req.body, userId: req["user"].id });
        res.status(201).json(data);
      }
    } catch (error) {
      console.log(error);
      res.status(500).json("Internal server error");
    }
  } else {
    res.status(400).json("Missing required paramaters");
  }
});

router.get("/:urlCode", async (req: Request, res: Response) => {
  const urlCode = req.params.urlCode;
  if (!urlCode) {
    res.status(400).send("Bad request");
  }
  try {
    // Check if URL exists
    const urlData = await getUrlByUrlCode(urlCode);
    
    // Check if URL has expired
    if (urlData.expirationDate && new Date(urlData.expirationDate) < new Date()) {
      return res.status(410).json("This link has expired");
    }
    
    // Track analytics asynchronously (don't wait for it to complete)
    const clientInfo = {
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    };
    trackUrlAnalytics(urlCode, clientInfo).catch(err => console.error('Analytics tracking error:', err));
    
    // Redirect to original URL
    res.status(301).redirect(urlData.originalLink);
  } catch (error) {
    console.error(error);
    res.status(500).json("Internal server error");
  }
});

router.get(
  "/user/:userId",
  verifyAccessToken,
  async (req: Request, res: Response) => {
    const userId = req.params.userId;
    if (userId !== req["user"].id) {
      res.status(401).json("Access denied");
      return;
    }

    try {
      const data = await getUrlsForUser(userId);
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json("Internal server error");
    }
  }
);

router.get(
  "/analytics/:urlCode",
  verifyAccessToken,
  async (req: Request, res: Response) => {
    const urlCode = req.params.urlCode;
    if (!urlCode) {
      return res.status(400).send("Bad request");
    }
    
    try {
      const url = await Url.findOne({ urlCode });
      
      if (!url) {
        return res.status(404).json("URL not found");
      }
      
      // Check if user has access to this URL
      if (url.userId !== req["user"].id) {
        return res.status(401).json("Access denied");
      }
      
      // Return analytics data
      res.status(200).json({
        urlCode: url.urlCode,
        visitCount: url.visitCount,
        analytics: url.analytics || []
      });
    } catch (error) {
      console.error(error);
      res.status(500).json("Internal server error");
    }
  }
);

router.put(
  "/:urlCode",
  verifyAccessToken,
  async (req: Request, res: Response) => {
    const urlCode = req.params.urlCode;
    if (!urlCode) {
      res.status(400).send("Bad request");
    }
    try {
      const udpatedData = await updateUrlCode(req.body);
      res.status(200).json(udpatedData);
    } catch (error) {
      res.status(500).json("Internal server error");
    }
  }
);

router.delete(
  "/:urlCode",
  verifyAccessToken,
  async (req: Request, res: Response) => {
    const urlCode = req.params.urlCode;
    if (!urlCode) {
      res.status(400).send("Bad request");
    }
    try {
      const data = await deleteUrlByUrlCode(urlCode);
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json("Internal server error");
    }
  }
);

export default router;
