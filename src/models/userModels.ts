"use strict";

import * as bcrypt from "bcrypt";
import * as mongoose from "mongoose";
import { Model } from "mongoose";
import * as config from '../config/constant'
// import { number, array } from "joi";

let Schema = mongoose.Schema;

export interface IUser extends mongoose.Document {
    length: never[];
    facebookTokens: any;
    facebookId: string;
    isFacebookLogin: boolean;
    facebookToken: [];
    googleId: string;
    isGoogleLogin: boolean;
    userName: string;
    email: string;
    countryCode: string;
    mobileNo: string;
    // salt: string;
    hash: string;
    gender: string;
    age: number;
    dob: Date;
    profilePicture: string;
    address: object;
    height: {
        feet: string,
        inch: string
    },
    status: string;
    isMobileVerified: boolean,
    isEmailVerified: boolean,
    verificationCode: number
}

// let geoSchema = new Schema({
//     address: { type: String, trim: true, required: true },
//     type: { type: String, default: "Point" },
//     coordinates: { type: [Number], index: "2dsphere" }// [longitude, latitude]
// }, {
//     _id: false
// });

let userSchema = new Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, required: true, auto: true },
    // social data
    socialLoginType: { type: String },
    facebookId: { type: String, trim: true, index: true },
    isFacebookLogin: { type: Boolean, default: false },
    facebookToken: Array,
    googleId: { type: String, trim: true, index: true },
    isGoogleLogin: { type: Boolean, default: false },
    //personal data
    userName: { type: String, trim: true, lowercase: true, index: true },
    email: { type: String, trim: true, index: true, lowercase: true, default: "" },
    countryCode: { type: String, trim: true, index: true, default: "" },
    mobileNo: { type: String, trim: true, index: true, default: "" },
    hash: { type: String, required: false },
    gender: {
        type: String,
        trim: true,
        lowercase: true,
        enum: [
            config.CONSTANT.GENDER.MALE,
            config.CONSTANT.GENDER.FEMALE
        ]
    },
    membership: {
        type: String,
        enum: [
            config.CONSTANT.MEMBERSHIP.FREEMIUM,
            config.CONSTANT.MEMBERSHIP.PREMIUM,
        ],
        default: config.CONSTANT.MEMBERSHIP.FREEMIUM
    },

    dob: { type: Date, default: new Date() },

    height: {
        feet: { type: String },
        inch: { type: String }
    },
    diabeticStatus: {
        type: String,
        index: true,
        // required: true,
        enum: [
            config.CONSTANT.DIABETIC_STATUS.YES,
            config.CONSTANT.DIABETIC_STATUS.NO,
        ],
    },

    racialBackground: {
        type: String,
        index: true,
        // required: true,
        enum: [
            config.CONSTANT.RACIAL_BACKGROUND.WHITE,
            config.CONSTANT.RACIAL_BACKGROUND.BLACK,
            config.CONSTANT.RACIAL_BACKGROUND.HISPANIC,
            config.CONSTANT.RACIAL_BACKGROUND.ASIAN,
            config.CONSTANT.RACIAL_BACKGROUND.MULTIRACIAL,
            config.CONSTANT.RACIAL_BACKGROUND.OTHERS
        ],
    },
    fitScore: { type: Number, default: 0 },

    profilePicture: { type: String, default: "default.png" },

    address: {
        country: { type: String, lowercase: true, index: true },
        state: { type: String, lowercase: true, index: true },
        city: { type: String, lowercase: true, index: true },

    },
    isMobileVerified: { type: Boolean, default: false },
    verificationCode: { type: Number, default: null },
    isEmailVerified: { type: Boolean, default: false },
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
    timestamps: true
});

//bcrypting password here

const encryptPassword = async function (password: any) {

    //console.log("entered for hashing!")
    let salt = 10;
    return await bcrypt.hash(password, salt);
}
const validUSerPassword = async function (password: any, savedPassword: any) {
    return bcrypt.compareSync(password, savedPassword);
}

let userModel: Model<IUser> = mongoose.model<IUser>('Users', userSchema);

// Export user
export { userModel, encryptPassword, validUSerPassword };