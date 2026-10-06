// models/Slideshow.ts

import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ISlide {
  title: string;
  content: string;
  image?: string;
  background?: string;
  transition?: string;
  notes?: string;
  timer?: number;
}

export interface ISlideshow extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  description?: string;
  slides: ISlide[];
  theme: string;
  isPublic: boolean;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SlideSchema = new Schema<ISlide>(
  {
    title: {
      type: String,
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    image: {
      type: String,
    },

    background: {
      type: String,
    },

    transition: {
      type: String,
      default: "slide",
    },

    notes: {
      type: String,
    },

    timer: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: true,
  }
);

const SlideshowSchema = new Schema<ISlideshow>(
  {
    title: {
      type: String,
      required: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    description: {
      type: String,
    },

    slides: {
      type: [SlideSchema],
      default: [],
    },

    theme: {
      type: String,
      default: "black",
    },

    isPublic: {
      type: Boolean,
      default: true,
      index: true,
    },

    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Slideshow: Model<ISlideshow> =
  mongoose.models.Slideshow ||
  mongoose.model<ISlideshow>("Slideshow", SlideshowSchema);

export default Slideshow;