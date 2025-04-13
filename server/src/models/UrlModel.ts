import mongoose from "mongoose";

const UrlSchema = new mongoose.Schema({
  urlCode: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  originalLink: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: false,
  },
  visitCount: {
    type: Number,
    default: 0,
  },
  expirationDate: {
    type: Date,
    required: false,
  },
  analytics: [{
    timestamp: { type: Date, default: Date.now },
    ipAddress: { type: String },
    device: { type: String },
    browser: { type: String },
    os: { type: String },
    location: { type: String }
  }],
  createdAt: {
    type: String,
    default: Date.now(),
  },
  updatedAt: {
    type: String,
    default: Date.now(),
  },
  userId: {
    type: String,
    index: true,
  },
});

UrlSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

export default mongoose.model("urls", UrlSchema);
