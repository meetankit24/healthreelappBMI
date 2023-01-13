"use strict";

import * as bcrypt from "bcrypt";
import * as mongoose from "mongoose";
import { Model } from "mongoose";

import * as appUtils from "../utils/appUtils";
import * as config from "../config/constant";

let Schema = mongoose.Schema;

export interface IAdmin extends mongoose.Document {
	adminName: string;
	email: string;
	// salt: string;
	hash: string;
	adminType: string;
	profilePicture: string;
	isLogin: boolean;
	lastLogin: number;
	lastLogout: number;
	loginAttempts: object;
	accessToken: string;
	status: string;
}

let loginAttempts = new Schema({
	remoteAddress: { type: String },
	platform: { type: String }
}, {
	_id: false
});

let adminSchema = new Schema({
	adminName: { type: String, trim: true, required: true },
	email: { type: String, index: true, lowercase: true, required: true, unique: true },
	hash: { type: String, required: false },
	adminType: { type: String, default: config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN },
   	// profilePicture: { type: String, default: "default.png" },
	isLogin: { type: Boolean, default: false, required: true },
	lastLogin: { type: Date },
	lastLogout: { type: Date },
	loginAttempts: [loginAttempts],
	// accessToken: { type: String, trim: true },
	status: {
		type: String,
		enum: [
			config.CONSTANT.STATUS.BLOCKED,
			config.CONSTANT.STATUS.UN_BLOCKED,
			config.CONSTANT.STATUS.DELETED
		],
		default: config.CONSTANT.STATUS.UN_BLOCKED
	}
}, {
	versionKey: false,
	timestamps: true,

});

adminSchema.set("toObject", {
	virtuals: true
});

//bcrypting password here

const encryptPassword = async function (password: any) {

	//console.log("entered for hashing!")
	let salt = 10;
	return await bcrypt.hash(password, salt);
}
const validUSerPassword = async function (password: any, savedPassword: any) {
	return await bcrypt.compare(password, savedPassword);
}


// Export admin
let admins: Model<IAdmin> = mongoose.model<IAdmin>("Admins", adminSchema);

export { admins, encryptPassword, validUSerPassword };