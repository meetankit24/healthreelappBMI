"use strict";

import * as mongoose from "mongoose";
import { Model } from "mongoose";
import * as config from "../config/constant";
import * as appUtils from "../utils/appUtils";

let Schema = mongoose.Schema;

export interface IAdminNotification extends mongoose.Document {
	image: string;
	title: string;
	link: string;
	message: string;
	platform: string;
	fromDate: number;
	toDate: number;
}

let adminNotificationSchema = new Schema({
	image: { type: String, trim: true },
	title: { type: String, trim: true, index: true, required: true },
	link: { type: String, required: true },
	message: { type: String, required: true },
	platform: {
		type: String,
		required: true,
		enum: [
			config.CONSTANT.DEVICE_TYPE.ANDROID,
			config.CONSTANT.DEVICE_TYPE.IOS,
			config.CONSTANT.DEVICE_TYPE.ALL
		]
	},
	fromDate: { type: Date },
	toDate: { type: Date },
	sentCount: { type: Number }
}, {
	versionKey: false,
	timestamps: true
});

adminNotificationSchema.set("toObject", {
	virtuals: true
});

adminNotificationSchema.virtual("created")
	.get(function () {
		return appUtils.convertISODateToTimestamp(this.createdAt);
	});

adminNotificationSchema.methods.toJSON = function () {
	let object = appUtils.clean(this.toObject());
	return object;
};

// Export admin notifications
let admin_notifications: Model<IAdminNotification> = mongoose.model<IAdminNotification>(config.CONSTANT.DB_MODEL_REF.ADMIN_NOTIFICATION, adminNotificationSchema);
export { admin_notifications };