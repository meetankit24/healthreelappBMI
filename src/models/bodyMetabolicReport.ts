"use strict";

import * as bcrypt from "bcrypt";
import * as mongoose from "mongoose";
import { Model } from "mongoose";
import * as config from '../config/constant'
// import { number, array } from "joi";

let Schema = mongoose.Schema;

export interface BMI extends mongoose.Document {
    length: never[];
    activityLevel: string,
    userId: number,
    correctBMI: number,
    BMI: number,
    bodyFatPercentage: number,
    totalBodyWeight: number,
    leanBodyMass: number,
    fatMass: number,
    restingMetabolicRate: number,
    activeMetabolicRate: number,
    compositionGrade: string,
    respiratory: number,
    heart: number,
    diabetes: number,
    cancer: number,
    stroke: number
    reportFinalType: string

}

let bodyMetabolicReportSchema = new Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, required: true, auto: true },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: config.CONSTANT.DB_MODEL_REF.USER,
        required: true
    },
    waist: { type: Number, required: true },
    activityLevel: { type: String, required: true },
    correctBMI: { type: Number, required: true, },
    BMI: { type: Number, required: true },
    bodyFatPercentage: { type: Number, required: true },
    totalBodyWeight: { type: Number, required: true },
    leanBodyMass: { type: Number, required: true },
    fatMass: { type: Number, required: true },
    restingMetabolicRate: { type: Number, required: true },
    activeMetabolicRate: { type: Number, required: true },
    compositionGrade: { type: String, required: true },
    respiratory: { type: Number, required: true },
    heart: { type: Number, required: true },
    diabetes: { type: Number, required: true },
    cancer: { type: Number, required: true },
    stroke: { type: Number, required: true },
    reportFinalType: { type: String, required: true }

}, {
    versionKey: false,
    timestamps: true
});

let bodyMetabolicReportModel: Model<BMI> = mongoose.model<BMI>('body_metabolic_report', bodyMetabolicReportSchema);

// Export user
export { bodyMetabolicReportModel };
