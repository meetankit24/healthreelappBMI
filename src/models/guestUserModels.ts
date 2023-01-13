"use strict";

import * as mongoose from "mongoose";
import { Model } from "mongoose";
import * as config from '../config/constant'
import { dateType } from "aws-sdk/clients/iam";
// import { number, array } from "joi";

let Schema = mongoose.Schema;

export interface GuestUser extends mongoose.Document {
    userName: string,
    gender: string,
    weight: string,
    waist: string,
    height: {
        feet: string,
        inch: string
    },
    dob: dateType,
    diabeticStatus: string,
    racialBackground: string
}

let guestUsersSchema = new Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        auto: true
    },
    userName: { type: String },
    
    gender: {
        type: String,
        trim: true,
        lowercase: true,
        enum: [
            config.CONSTANT.GENDER.MALE,
            config.CONSTANT.GENDER.FEMALE
        ]
    },

    dob: { type: Date, default: new Date() },

    weight: { type: String, required: true, lowercase: true },

    waist: { type: String, required: true, lowercase: true },

    height: {
        feet: { type: String, required: true },
        inch: { type: String, required: true },
    },

    diabeticStatus: {
        type: String,
        index: true,
        required: true,
        enum: [
            config.CONSTANT.DIABETIC_STATUS.YES,
            config.CONSTANT.DIABETIC_STATUS.NO,
        ],
    }, racialBackground: {
        type: String,
        index: true,
        required: true,
        enum: [
            config.CONSTANT.RACIAL_BACKGROUND.WHITE,
            config.CONSTANT.RACIAL_BACKGROUND.BLACK,
            config.CONSTANT.RACIAL_BACKGROUND.HISPANIC,
            config.CONSTANT.RACIAL_BACKGROUND.ASIAN,
            config.CONSTANT.RACIAL_BACKGROUND.MULTIRACIAL,
            config.CONSTANT.RACIAL_BACKGROUND.OTHERS
        ],
    },
},
    {
        versionKey: false,
        timestamps: true
    });

let guestUserModel: Model<GuestUser> = mongoose.model<GuestUser>('Guest_users', guestUsersSchema);

// Export model
export { guestUserModel };







// getBmi(bmi) {
//     if(bmi < 18.5) {
//         return "Underweight";
//     }
//     if(bmi >= 18.5 && bmi < 24.9) {
//         return "Normal weight";
//     }
//     if(bmi >= 25 && bmi < 29.9) {
//         return "Overweight";
//     }
//     if(bmi >= 30) {
//         return "Obesity";
//     }
// }
// if (bmi < 18.5) {
//     //     res.send("You are underweight. Consult a doctor!");
//     // }
//     // else if (bmi > 24.9 && bmi < 30) {
//     //     res.send("You are overweight. Consult a doctor!");
//     // }
//     // else if (bmi > 29.9) {
//     //     res.send("You are obese. It's an alarming health situation. Go to the doctor!");
//     // }
//     // else {
//     //     res.send("You're okay but a little workout never hurt anybody!");
// // }
// let calories = ((weight / (height * height)) * (120));
//             let bodyMass = bmi;
//             let intakeCalories = ((weight / (height * height)) * (150));
