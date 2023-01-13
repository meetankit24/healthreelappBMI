"use strict";

import * as bcrypt from "bcrypt";
import * as mongoose from "mongoose";
import * as config from '../config/constant'
// import { number, array } from "joi";

let Schema = mongoose.Schema;

export interface RateReview extends mongoose.Document {
    rating: number,
    review: string
}


let rateAndReviewSchema = new Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, required: true, auto: true },
    //personal data
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "users"
    },
    rating: {
        type: Number,
        enum: [
            config.CONSTANT.RATE.S1,
            config.CONSTANT.RATE.S2,
            config.CONSTANT.RATE.S3,
            config.CONSTANT.RATE.S4,
            config.CONSTANT.RATE.S5,
        ],
        default: ""
    },
    review: { type: String, trim: true, lowercase: true }


}, {
    versionKey: false,
    timestamps: true
});


let rateAndReviewModel: mongoose.Model<RateReview> = mongoose.model<RateReview>('RatesAndReviews', rateAndReviewSchema);

// Export user
export { rateAndReviewModel };