"use strict";

import * as bcrypt from "bcrypt";
import * as mongoose from "mongoose";
import * as config from '../config/constant'

let Schema = mongoose.Schema;

export interface AppVideo extends mongoose.Document {
    vname: string,
    link: string,
    thumbnail: string
}


let appVideoSchema = new Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, required: true, auto: true },

    videoName: { type: String, trim: true, required: true },
    link: { type: String, trim: true, required: true },
    thumbnail: { type: String, trim: true, required: true }

}, {
    versionKey: false,
    timestamps: true
});


let appVideoModel: mongoose.Model<AppVideo> = mongoose.model<AppVideo>('app_videos', appVideoSchema);

// Export user
export { appVideoModel };