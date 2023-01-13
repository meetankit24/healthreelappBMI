"use strict";

import * as mongoose from "mongoose";
import { Model } from "mongoose";

import * as appUtils from "../utils/appUtils";
import * as config from "../config/constant";

let Schema = mongoose.Schema;

export interface ILoginHistory extends mongoose.Document {
	userId: object;
	// salt: string;
	isLogin: boolean;
	lastLogin: number;
	lastLogout: number;
	deviceId: string;
	remoteAddress: string;
	platform: number;
	deviceToken: string;
	// refreshToken: string;
	arn: string;
}

let loginHistorySchema = new Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: config.CONSTANT.DB_MODEL_REF.USER,
		required: true
	},
	// salt: { type: String }, // combination of userId.timestamp.deviceId
	// accessToken:{type:String,},
	isLogin: { type: Boolean, default: true },
	lastLogin: { type: Date },
	lastLogout: { type: Date },
	deviceId: { type: String, required: true },
	remoteAddress: { type: String },
	platform: {
		type: String,
		required: true,
		enum: [
			config.CONSTANT.DEVICE_TYPE.ANDROID,
			config.CONSTANT.DEVICE_TYPE.IOS,
			config.CONSTANT.DEVICE_TYPE.WEB
		]
	},
	deviceToken: { type: String, index: true },
	// refreshToken: { type: String, index: true },
	// arn: { type: String }
}, {
	versionKey: false,
	timestamps: true
});

loginHistorySchema.set("toObject", {
	virtuals: true
});

loginHistorySchema.methods.toJSON = function () {
	let object = appUtils.clean(this.toObject());
	return object;
};

// Export login history
let login_histories: Model<ILoginHistory> = mongoose.model<ILoginHistory>(config.CONSTANT.DB_MODEL_REF.LOGIN_HISTORY, loginHistorySchema);

export { login_histories };