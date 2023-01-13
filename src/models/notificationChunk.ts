"use strict";

import * as mongoose from "mongoose";
import { Model } from "mongoose";

import * as appUtils from "../utils/appUtils";
import * as config from "../config/constant";

let Schema = mongoose.Schema;

export interface INotificationChunk extends mongoose.Document {
    notificationId: string;
    data: any;
    payload: any;
    chunkType: number;
}

let notificationChunkSchema = new Schema({
    notificationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: config.CONSTANT.DB_MODEL_REF.ADMIN_NOTIFICATION
    },
    data: [{
        _id: false,
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: config.CONSTANT.DB_MODEL_REF.USER
        },
        deviceToken: { type: String },
        // arn: { type: String }
    }],
    payload: {
        title: { type: String },
        alert: { type: String },
        link: { type: String },
        message: { type: String },
        body: { type: String },
        attachmentUrl: { type: String },
        threadId: { type: String },
        image: { type: String },
        type: { type: Number, default: config.CONSTANT.NOTIFICATION_TYPE.BULK_NOTIFICATION },
        priority: { type: String },
        contentType: { type: String },
        category: { type: String },
        badge: { type: Number },
        mutableContent: { type: Number }
    },
    chunkType: {
        type: String,
        required: true,
        enum: [
            config.CONSTANT.DEVICE_TYPE.ANDROID,
            config.CONSTANT.DEVICE_TYPE.IOS
        ],
        // default:config.CONSTANT.DEVICE_TYPE.ALL
    }
}, {
    versionKey: false,
    timestamps: true
});

notificationChunkSchema.set("toObject", {
    virtuals: true
});

notificationChunkSchema.virtual("created")
    .get(function () {
        return appUtils.convertISODateToTimestamp(this.createdAt);
    });

notificationChunkSchema.methods.toJSON = function () {
    let object = appUtils.clean(this.toObject());
    return object;
};

// Export notification chunks schema

let notification_chunks: Model<INotificationChunk> = mongoose.model<INotificationChunk>("notification_chunk", notificationChunkSchema);

export { notification_chunks };