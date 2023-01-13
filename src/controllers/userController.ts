"use strict";
import * as mongoose from 'mongoose';
import { userModel, encryptPassword, validUSerPassword, IUser } from '../models/userModels';
import { guestUserModel, GuestUser } from '../models/guestUserModels';
import { bodyMetabolicReportModel, BMI } from '../models/bodyMetabolicReport';
import * as jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import * as config from '../config/constant';
import * as envSecret from '../config/environment';
import { MailManager } from '../taskmanager/mailmanager'
import { sendMessage, sendForgotPasswordLink } from '../taskmanager/smsmanager';
import * as randomstring from 'randomstring';
import * as appUtils from '../utils/appUtils';
import { loginHistoryDao } from '../loginHistory/LoginHistoryDao';
import { TemplateUtil } from '../utils/TemplateUtils';
import { Object } from 'aws-sdk/clients/s3';
import { param } from 'express-validator';
// require('../interfaces/index');

/**
 *@Constructor FOR MAIL MANAGER
 **/
let mailManager = new MailManager();


/**
 * @Function SIGNUP. 
 **/
const signup = async (req: Request, res: Response, next: NextFunction) => {

    try {

        if (!req.body.email || (!req.body.countryCode && !req.body.mobileNo)) {

            res.send(config.CONSTANT.MESSAGES.ERROR.EMAIL_OR_PHONE_REQUIRED);

        } else {
            let { userName,
                email,
                countryCode,
                mobileNo,
                password,
                deviceId,
                deviceToken
            } = req.body;

            let { platform }: any = req.headers,
                //due to some issue from ios this will be adding for few time.
                remoteAddress: any = req.header('x-forwarded-for') || req.connection.remoteAddress;

            console.log(req.body);

            let query: any = {};
            query["$or"] = [{ "email": email }, { "countryCode": countryCode, "mobileNo": mobileNo }];
            query.status = { "$ne": config.CONSTANT.STATUS.DELETED };

            let projection: any = {};


            let options: any = {};
            options.lean = true;

            let isEmailMobileExist: any = await userModel.find(query, projection, options);

            if (isEmailMobileExist.length > 0) {

                console.log("User already present");

                if (isEmailMobileExist[0].email === req.body.email) {

                    res.send(config.CONSTANT.MESSAGES.ERROR.EMAIL_ALREADY_EXIST);
                }
                else if (isEmailMobileExist[0].mobileNo === req.body.mobileNo) {
                    res.send(config.CONSTANT.MESSAGES.ERROR.MOBILE_NO_ALREADY_EXIST);

                }
                else {
                    res.send(config.CONSTANT.MESSAGES.ERROR.USER_NOT_FOUND);
                }

            } else {
                console.log("No user present!");

                let hashedPassword: any = await encryptPassword(password);
                var verificationCode = await randomstring.generate({ charset: "numeric", length: 4 });

                let dataToSave = {
                    userName: userName,
                    email: email,
                    countryCode: countryCode,
                    mobileNo: mobileNo,
                    hash: hashedPassword,
                    verificationCode: verificationCode,

                };

                // console.log(dataToSave);
                let dataToInsert: IUser = new userModel(dataToSave);
                let userResult: IUser = await dataToInsert.save();

                console.log(userResult);

                if (userResult) {

                    // console.log(user_result);
                    let userId = userResult._id;

                    let payload: any =
                    {
                        _id: userId,
                        countryCode: countryCode,
                        mobileNo: mobileNo,
                        userName: userName
                    };

                    let mobileVerificationToken = await jwt.sign(payload, envSecret.SERVER.JWT_CERT_KEY,
                        {
                            algorithm: "HS256",
                            // expiresIn: Math.floor(Date.now() / 1000) + (60 * 15)   //hardly 10 minutes
                        });

                    let sendOTP: any = await sendMessage(userResult.countryCode, userResult.mobileNo, userResult.userName, verificationCode);
                    let params = {
                        userName: userResult.userName,
                        email: userResult.email,
                        accessToken: mobileVerificationToken
                    };
                    let verifyEmail = await mailManager.sendVerificationEmail(params);


                    //in this step we will create user's login history
                    let paramReq: object = {
                        userId,
                        deviceId,
                        deviceToken,
                        platform,
                        remoteAddress
                    };

                    let createUserLoginHistory = await loginHistoryDao.createUserLoginHistory(paramReq);

                    if (createUserLoginHistory) {

                        res.send({
                            message: config.CONSTANT.MESSAGES.SUCCESS.SIGNUP,
                            verify_info: "4-digit OTP has been sent to your registered mobile number.",
                            response: userResult,
                            token: mobileVerificationToken
                        });
                    } else {

                        res.send(config.CONSTANT.MESSAGES.ERROR.INTERNAL_SERVER_ERROR);
                    }
                }
                else {
                    res.send(config.CONSTANT.MESSAGES.ERROR.INTERNAL_SERVER_ERROR);

                }
            }
        }
    }
    catch (error) {
        throw error;
    }
}

/**
*@Function SIGNIN. 
**/
const signin = async (req: Request, res: Response, next: NextFunction) => {


    try {

        if (!req.body.email && (!req.body.countryCode || !req.body.mobileNo)) {

            res.send(config.CONSTANT.MESSAGES.ERROR.EMAIL_OR_PHONE_REQUIRED);

        } else {


            let { platform }: any = req.headers;

            let { remoteAddress }: any = req.header('x-forwarded-for') || req.connection.remoteAddress;


            let { email, password, countryCode, mobileNo, deviceId, deviceToken } = req.body;


            if (!email && (!countryCode || !mobileNo)) {

                return Promise.reject(config.CONSTANT.MESSAGES.ERROR.EMAIL_OR_PHONE_REQUIRED);

            }
            else {

                let query: any = {};
                query["$or"] = [{ email: email }, { countryCode: countryCode, mobileNo: mobileNo }];
                query.status = { "$ne": config.CONSTANT.STATUS.DELETED };
                //.isMobileVerified = { "$eq": true };

                let projection: any = {};

                let options: any = {};
                options.lean = true;

                let isUserExist = await userModel.findOne(query, projection, options);

                // console.log(isUserExist);

                if (isUserExist) {

                    // console.log(typeof (isUserExist[0].status));

                    if (isUserExist.status === config.CONSTANT.STATUS.BLOCKED) {

                        console.log("Blocked user");

                        res.send(config.CONSTANT.MESSAGES.ERROR.BLOCKED);

                    }
                    else if (isUserExist.isMobileVerified === false) {

                        console.log("Un-verified Mobile user");

                        res.send(config.CONSTANT.MESSAGES.ERROR.MOBILE_NOT_VERIFY);

                    }
                    else {

                        console.log("Unblocked user");
                        // res.send(isUserExist);
                        /*****************check user's password is matched with db password******************/
                        const savedPassword = isUserExist.hash;

                        let decrypt = await validUSerPassword(password, savedPassword);

                        console.log(decrypt);


                        if (decrypt) {

                            let payload: any =
                            {
                                _id: isUserExist._id,
                                mobileNo: isUserExist.mobileNo,
                                email: isUserExist.email,
                                deviceId: req.body.deviceId
                            };

                            let token = await jwt.sign(payload, envSecret.SERVER.JWT_CERT_KEY,
                                {
                                    algorithm: "HS256",
                                    // expiresIn: "10d"   //hardly 10 days
                                });


                            let paramsReq = {
                                userId: isUserExist._id,
                                deviceId: deviceId,
                                deviceToken: deviceToken,
                                remoteAddress: remoteAddress,
                                platform: platform,

                            };

                            let update_user_login_history: any = await loginHistoryDao.removeUserDeviceByUserId(paramsReq);

                            let createUserLoginHistory = await loginHistoryDao.createUserLoginHistory(paramsReq);

                            if (createUserLoginHistory) {

                                res.status(config.CONSTANT.HTTP_STATUS_CODE.OK).json({
                                    message: config.CONSTANT.MESSAGES.SUCCESS.LOGIN,
                                    response: isUserExist,
                                    token: token
                                })

                            }
                            else {
                                res.send(config.CONSTANT.HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR);
                            }

                        } else {
                            res.send(config.CONSTANT.MESSAGES.ERROR.INCORRECT_PASSWORD)
                        }

                    }

                } else if (email) {

                    res.send(config.CONSTANT.MESSAGES.ERROR.EMAIL_NOT_REGISTERED);

                } else {

                    res.send(config.CONSTANT.MESSAGES.ERROR.MOBILE_NO_NOT_REGISTERED);

                }

            }
        }
    }
    catch (error) {
        throw error;
    }

}
/**
*@Function GUEST Mode. 
**/
const guestMode = async (req: Request, res: Response, next: NextFunction) => {

    try {


        let { platform }: any = req.headers;

        let { remoteAddress }: any = req.header('x-forwarded-for') || req.connection.remoteAddress;
        let { gender, dob, diabeticStatus, racialBackground, activityLevel, weight, waist, type, deviceId, deviceToken } = req.body;


        let height: any = {
            feet: req.body.feet,
            inch: req.body.inch
        };
        let birthdate = new Date(dob).toDateString();

        console.log(typeof (gender));

        //first we will fill user's data into userModel collection
        let dataToSave: any = {
            userName: "Guest-user",
            gender: gender,
            dob: birthdate,
            weight: weight,
            height: height,
            waist: waist,
            diabeticStatus: diabeticStatus,
            racialBackground: racialBackground
        };

        // console.log(dataToSave);

        let dataToInsert: GuestUser = new guestUserModel(dataToSave);
        let userResult: GuestUser = await dataToInsert.save();

        if (userResult) {

            // here we will create login history of guest users
            let paramsReq = {
                userId: userResult._id,
                deviceId: deviceId,
                deviceToken: deviceToken,
                remoteAddress: remoteAddress,
                platform: platform,

            };

            let updateUserLoginHistory: any = await loginHistoryDao.removeUserDeviceByUserId(paramsReq);
            let createUserLoginHistory = await loginHistoryDao.createUserLoginHistory(paramsReq);


            //here we will calculate BMI of guest users
            let heightForBMI = userResult.height.feet + "." + userResult.height.inch,
                age = await appUtils.calculate_age(userResult.dob);

            let getBMI = await appUtils.calculateBMI(heightForBMI, age, gender, type, weight, activityLevel);

            // let getBMI = await appUtils.calculateBMI(height, age, gender, type, weight, activityLevel);
            let cBMI = getBMI.correctBMI,
                bfpercent = getBMI.bodyFatPercentage;

            let getHealthRiskReport = await appUtils.calculateHealthRiskReport(cBMI, bfpercent, age, gender);

            console.log("body and Metabolic Report :", getBMI, "\n Healthrisk Report :", getHealthRiskReport);


            console.log(getBMI, "getBMI");

            // save report data in bodyMetabolicReportModel-
            let saveReportData: object = {
                userId: userResult._id,
                waist,
                activityLevel,
                totalBodyWeight: weight,
                correctBMI: getBMI.correctBMI,
                BMI: getBMI.BMI,

                bodyFatPercentage: getBMI.bodyFatPercentage,
                leanBodyMass: getBMI.leanBodyMass,
                fatMass: getBMI.fatMass,
                restingMetabolicRate: getBMI.restingMetabolicRate,
                activeMetabolicRate: getBMI.activeMetabolicRate,
                reportFinalType: getBMI.reportFinalType,
                compositionGrade: getHealthRiskReport.compositionGrade,
                respiratory: getHealthRiskReport.respiratory,
                heart: getHealthRiskReport.heart,
                diabetes: getHealthRiskReport.diabetes,
                cancer: getHealthRiskReport.cancer,
                stroke: getHealthRiskReport.stroke

            };
            // console.log(saveReportData, "saveReportData");

            let insertReportData: BMI = await new bodyMetabolicReportModel(saveReportData);
            // console.log(insertReportData)
            let response: BMI = await insertReportData.save();
            // console.log(response)

            if (response) {

                res.send({
                    message: config.CONSTANT.MESSAGES.SUCCESS.ASSESMENT_UPLOAD,
                    response: response

                });
            } else {
                res.send(config.CONSTANT.MESSAGES.ERROR.INTERNAL_SERVER_ERROR);
            }

        } else {
            res.send(config.CONSTANT.MESSAGES.ERROR.INTERNAL_SERVER_ERROR);
        }

    } catch (error) {
        throw error;
    }

}

/**
 * @Function FORGOT-PASSWORD SEND=>USING EMAIL & MOBILE.
 **/
const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { email, countryCode, mobileNo } = req.body;


        //console.log(req.body);

        if (!email && (!countryCode || !mobileNo)) {

            return res.send(config.CONSTANT.MESSAGES.ERROR.EMAIL_OR_PHONE_REQUIRED);

        } else {
            let query: any = {};
            query["$or"] = [{ email: email }, { countryCode: countryCode, mobileNo: mobileNo }];
            query.status = { "$ne": config.CONSTANT.STATUS.DELETED };

            let projection: any = {};

            let options: any = {};
            options.lean = true;

            let isUserExist = await userModel.findOne(query, projection, options);

            // console.log(isUserExist);

            if (isUserExist) {

                if (isUserExist.status === config.CONSTANT.STATUS.BLOCKED) {

                    res.send(config.CONSTANT.MESSAGES.ERROR.BLOCKED);

                } else {

                    let forgotPasswordPayload = {
                        _id: isUserExist._id,
                        userName: isUserExist.userName,
                        email: isUserExist.email

                    };
                    let forgotAccessToken = await jwt.sign(forgotPasswordPayload, envSecret.SERVER.JWT_CERT_KEY,
                        {
                            algorithm: 'HS256',
                            expiresIn: "10m"   //hardly 10 minutes
                        });

                    // console.log(forgotAccessToken)

                    if (email) {
                        let userName = appUtils.captalizeFirstLetter(isUserExist.userName),
                            userId = isUserExist._id,
                            send = await mailManager.sendForgotPasswordEmail({ "email": email, "userName": userName, "userId": userId, "accessToken": forgotAccessToken });
                        // console.log(forgotAccessToken);

                        res.send(config.CONSTANT.MESSAGES.SUCCESS.FORGOT_PASSWORD_ON_EMAIL);


                    } else {
                        /**
                         * @send variable will be enable when we get twilio service 
                         */
                        let userName = isUserExist.userName,

                            verificationCode = await randomstring.generate({ charset: "numeric", length: 4 });

                        let query: any = {};
                        query["$and"] = [{ countryCode: countryCode }, { mobileNo: mobileNo }];
                        query.status = { "$ne": config.CONSTANT.STATUS.DELETED };

                        let update: any = {};
                        update["$set"] = { verificationCode: verificationCode };

                        let options: any = {};
                        options.upsert = true;

                        let updateVerificationPin: any = await userModel.updateOne(query, update, options);
                        console.log(updateVerificationPin);

                        if (updateVerificationPin) {

                            let sendOTP = await sendMessage(countryCode, mobileNo, userName, verificationCode);

                            res.send({
                                // message: config.CONSTANT.MESSAGES.SUCCESS.FORGOT_PASSWORD_OTP_ON_PHONE,
                                statusCode: config.CONSTANT.HTTP_STATUS_CODE.OK,
                                message: "4-digit verification code has been sent to your registered mobile number.",
                                type: "FORGOT_PASSWORD_OTP_ON_PHONE",
                                token: forgotAccessToken
                            });

                        } else {
                            res.send(config.CONSTANT.MESSAGES.ERROR.INTERNAL_SERVER_ERROR)
                        }
                    }
                }
            }
            else {
                res.send(config.CONSTANT.MESSAGES.ERROR.USER_NOT_FOUND);
            }

        }
    } catch (error) {
        throw error;
    }
};

/**
 * @Function TO DISPLAY RESET-PASSWORD WEB PAGE.
 **/
const resetPasswordWebPage = async (req: Request, res: Response, next: NextFunction) => {
    try {

        let resetPasswordTemplate = await new TemplateUtil(envSecret.SERVER.TEMPLATE_PATH + "reset-password.html")
            .compileFile({
                // userName: updateVerifyStatus.userName,
                gsgAddress: config.CONSTANT.EMAIL_TEMPLATE.GSG_ADDRESS,
            })

        res.send(resetPasswordTemplate);

    } catch (error) {
        throw console.error(error);

    }
}
/**
 * @Function TO CHECK WHETHER APP IS INSTALLED OR NOT.
 **/
const deepLink = async (req: Request, res: Response, next: NextFunction) => {
    try {

        let deepLinkTemplate = await new TemplateUtil(envSecret.SERVER.TEMPLATE_PATH + "deeplink.html")
            .compileFile({
                title: "Healthreel.com",
                fallback: "http://3.92.170.227:7001/api/user" + "/web-reset-password-page/", //+ "?token=" + params.accessToken,
                url: "nasaapp://3.92.170.227:7001",
                iosLink: 'nasaapp://3.92.170.227:7001',  //+ "?token=" + params.accessToken,    
                ios_store_link: 'https://testflight.apple.com/join/EuxjaJiu',
                android_package_name: 'com.healthreel'
            })

        res.send(deepLinkTemplate);

    } catch (error) {
        throw error;

    }
}

/**
 * @Function VERIFY OTP. 
 **/
const verifyOTP = async (req: any, res: Response, next: NextFunction) => {
    try {
        if (!req.body.verificationPin) {

            res.send(config.CONSTANT.MESSAGES.ERROR.FIELD_REQUIRED("4-digit pin "));

        }
        else {

            let userToken: any = req.token;

            let query: any = {};
            query._id = userToken._id;
            query.status = { "$ne": config.CONSTANT.STATUS.DELETED };

            let projection: any = {};

            let options: any = {};
            options.lean = true;

            let isUserExist: IUser = await userModel.findOne(query, projection, options);

            // console.log(isUserExist.hash, "previous");

            if (isUserExist) {
                let verificationPin: any = req.body.verificationPin ? req.body.verificationPin : new Error("Oops! Please Enter your password.");

                console.log(verificationPin);
                console.log(isUserExist.verificationCode);

                if (verificationPin == isUserExist.verificationCode) {

                    let query: any = {};
                    query._id = userToken._id;

                    let update: any = {};
                    update["$set"] = { verificationCode: null, isMobileVerified: true };

                    let options: any = {};
                    options.upsert = true;

                    let update_user_verificationPin: any = await userModel.updateOne(query, update, options);

                    console.log(update_user_verificationPin);

                    if (update_user_verificationPin) {

                        res.send(config.CONSTANT.MESSAGES.SUCCESS.MOBILE_NO_VERIFIED);
                    }
                    else {
                        res.send(config.CONSTANT.MESSAGES.ERROR.INTERNAL_SERVER_ERROR);
                    }
                } else {
                    res.send(config.CONSTANT.MESSAGES.ERROR.WRONG_PIN_NUMBER);
                }
            } else {
                res.send(config.CONSTANT.MESSAGES.ERROR.USER_NOT_FOUND);
            }

        }
    } catch (error) {
        throw error;
    }
};

/**
 * @Function VERIFY EMAIL ADDRESS. 
 **/
const verifyEmailAddress = async (req: any, res: Response, next: NextFunction) => {
    try {
        let userToken = req.query.token;
        let decode = await jwt.decode(userToken);

        let query: any = {};
        query._id = decode["_id"];
        query.status = { "$ne": config.CONSTANT.STATUS.DELETED };

        let projection: any = {};

        let options: any = {};
        options.lean = true;

        let isUserExist: IUser = await userModel.findOne(query, projection, options);

        console.log(isUserExist);

        if (isUserExist) {

            let query: any = {};
            query._id = decode["_id"];

            let update: any = {};
            update["$set"] = { isEmailVerified: true };

            let options: any = {};
            options.upsert = true;
            options.new = true;

            let updateVerifyStatus: IUser = await userModel.findByIdAndUpdate(query, update, options);

            console.log(updateVerifyStatus);

            if (updateVerifyStatus) {

                console.log("<><><><update><><><>");

                let emailVerifiedTemplate = await new TemplateUtil(
                    envSecret.SERVER.TEMPLATE_PATH + "email-verified.html"
                ).compileFile({
                    userName: updateVerifyStatus.userName,
                    gsgAddress: config.CONSTANT.EMAIL_TEMPLATE.GSG_ADDRESS,
                });

                res.send(emailVerifiedTemplate);
            }
            else {
                res.send(config.CONSTANT.MESSAGES.ERROR.INTERNAL_SERVER_ERROR);
            }

        } else {
            res.send(config.CONSTANT.MESSAGES.ERROR.USER_NOT_FOUND);
        }

    } catch (error) {
        throw error;
    }
};

/**
 *@Resend otp
 */
const reSendOtp = async (req: any, res: Response, next: NextFunction) => {
    try {

        let userToken: any = req.token;

        let query: any = {};
        query._id = userToken._id;
        query.status = { "$ne": config.CONSTANT.STATUS.DELETED };

        let projection: any = {};

        let options: any = {};
        options.lean = true;

        let isUserExist: IUser = await userModel.findOne(query, projection, options);

        // console.log(isUserExist.hash, "previous");

        if (isUserExist) {
            let countryCode = isUserExist.countryCode,
                mobileNo = isUserExist.mobileNo,
                userName = isUserExist.userName;

            let verificationCode = await randomstring.generate({ charset: "numeric", length: 4 });

            let query: any = {};
            query._id = userToken._id;

            let update: any = {};
            update["$set"] = { isMobileVerified: false, verificationCode: verificationCode };

            let options: any = {};
            options.upsert = true;

            let updateVerificationCode: any = await userModel.updateOne(query, update, options);

            console.log(updateVerificationCode);

            let sendOTP: any = await sendMessage(countryCode, req.body.mobileNo, userName, verificationCode);

            console.log(updateVerificationCode);
            console.log(req.body)

            res.send(config.CONSTANT.MESSAGES.SUCCESS.REFRESH_OTP);


        }
        else {
            res.send(config.CONSTANT.MESSAGES.ERROR.INVALID_TOKEN);
        }
    }


    catch (error) {
        throw error;
    }
};

/**
 * @Function RESET FORGOT PASSWORD. 
 **/
const resetPassword = async (req: any, res: Response, next: NextFunction) => {

    try {
        let userToken: string = req.body.token;
        let decode: any = await jwt.verify(userToken, envSecret.SERVER.JWT_CERT_KEY);

        let currentTime: number = new Date().getTime() / 1000;
        let expTime: number = decode['exp'];

        if (currentTime > expTime) {

            res.send(config.CONSTANT.MESSAGES.ERROR.TOKEN_EXPIRED);

        } else {
            let query: any = {};
            query._id = decode["_id"];
            query.status = { "$ne": config.CONSTANT.STATUS.DELETED };

            let projection: any = {};

            let options: any = {};
            options.lean = true;

            let isUserExist: IUser = await userModel.findOne(query, projection, options);

            // console.log(isUserExist.hash, "previous");

            if (isUserExist) {
                let newPassword: any = req.body.password ? req.body.password : new Error("Oops! Please Enter your password.");
                //console.log(newPassword)
                let hashed_password: any = await encryptPassword(newPassword);

                console.log(hashed_password);

                let query: any = {};
                query._id = decode["_id"];

                let update: any = {};
                update["$set"] = { hash: hashed_password, isEmailVerified: true };

                let options: any = {};
                options.upsert = true;

                let updateUserPassword: any = await userModel.updateOne(query, update, options);

                console.log(updateUserPassword);

                if (updateUserPassword) {

                    res.send(config.CONSTANT.MESSAGES.SUCCESS.CHANGE_FORGOT_PASSWORD);
                    // res.redirect(301, 'http://healthreel.com');
                }
                else {
                    res.send(config.CONSTANT.MESSAGES.ERROR.INTERNAL_SERVER_ERROR);
                }
            } else {
                res.send(config.CONSTANT.MESSAGES.ERROR.USER_NOT_FOUND)
            }
        }
    } catch (error) {
        throw error;
    }
};

/**
 * @Function RESET FORGOT PASSWORD. 
 **/
const changePassword = async (req: any, res: Response, next: NextFunction) => {

    try {
        let userToken: any = req.token;

        let query: any = {};
        query._id = userToken._id;
        query.status = { "$ne": config.CONSTANT.STATUS.DELETED };

        let projection: any = {};
        projection._id = 1;
        projection.hash = 1;

        let options: any = {};
        options.lean = true;

        let isUserExist: IUser = await userModel.findOne(query, projection, options);

        console.log(isUserExist);

        if (isUserExist) {

            let dbhash = isUserExist.hash;

            let { oldPassword, newPassword } = req.body;

            console.log(req.body);

            let decrypt: any = await validUSerPassword(oldPassword, dbhash);

            console.log(decrypt);

            if (!decrypt) {

                res.send(config.CONSTANT.MESSAGES.ERROR.INCORRECT_PASSWORD);

            } else {

                let newHash: any = await encryptPassword(newPassword);

                let query: any = {};
                query._id = userToken._id;

                let update: any = {};
                update["$set"] = { hash: newHash };

                let options: any = {};
                options.upsert = true;

                let updateUserPassword: any = await userModel.updateOne(query, update, options);

                console.log(updateUserPassword);

                if (updateUserPassword) {

                    res.send(config.CONSTANT.MESSAGES.SUCCESS.CHANGE_FORGOT_PASSWORD);
                }
                else {
                    res.send(config.CONSTANT.MESSAGES.ERROR.INTERNAL_SERVER_ERROR);
                }
            }

        } else {
            res.send(config.CONSTANT.MESSAGES.ERROR.USER_NOT_FOUND)
        }
    } catch (error) {
        throw error;
    }
};

/**
 * @create Profile
 */
const createUserProfile = async (req: any, res: Response, next: NextFunction) => {

    try {
        let userToken: any = req.token;
        let userId: any = userToken._id;

        let { dob,
            feet,
            inch,
            gender,
            diabeticStatus,
            racialBackground }: any = req.body;

        let birthdate = new Date(dob).toDateString();

        console.log(birthdate);
        let address = {
            country: req.body.country ? req.body.country : '',
            state: req.body.state ? req.body.state : '',
            city: req.body.city ? req.body.city : ''
        };
        // console.log(req.body);

        let height = { feet, inch };

        console.log(userId);

        let query: any = {};
        query._id = userId;

        let update: any = {};
        update["$set"] = {
            "dob": birthdate ? birthdate : '',
            "height": height ? height : '',
            "gender": gender,
            "address": address,
            "diabeticStatus": diabeticStatus,
            "racialBackground": racialBackground,
        };

        let options: any = {};
        options.new = true;

        let createProfile = await userModel.findByIdAndUpdate(query, update, options);

        console.log(createProfile);

        if (createProfile) {

            res.send({
                message: config.CONSTANT.MESSAGES.SUCCESS.USER_CREATED,
                response: createProfile,
            })

        }
        else {
            res.send(config.CONSTANT.MESSAGES.ERROR.INTERNAL_SERVER_ERROR);
        }

    } catch (error) {
        throw error;
    }
};

/**
 *@Get user's profile 
 */
const getUserProfile = async (req: any, res: Response, next: NextFunction) => {

    try {
        let userToken: any = req.token;

        let query: any = {};
        query._id = userToken._id;
        query.status = { "$ne": config.CONSTANT.STATUS.DELETED };

        let projection: any = {};
        projection._id = 0;
        projection.profilePicture = 1;
        projection.userName = 1;
        projection.dob = 1;
        projection.membership = 1;
        projection.height = 1;
        projection.email = 1;
        projection.countryCode = 1;
        projection.mobileNo = 1;

        let options: any = {};

        let getUserProfile = await userModel.findOne(query, projection, options);
        // let age = appUtils.calculate_age(getUserProfile.dob);

        // await getUserProfile.age;
        // getUserProfile["age"] = age;
        // console.log(getUserProfile);

        if (getUserProfile) {

            res.send(config.CONSTANT.MESSAGES.SUCCESS.PROFILE(getUserProfile));

        }
        else {
            res.send(config.CONSTANT.MESSAGES.ERROR.USER_NOT_FOUND)
        }
    }
    catch (error) {
        throw error;
    }
};

/*
 *@Edit user's profile          
 */
const editUserProfile = async (req: any, res: Response, next: NextFunction) => {

    try {

        let userToken: any = req.token;

        let query1: any = {};
        query1._id = userToken._id;

        let projection: any = {};
        projection.email = 1;
        projection.countryCode = 1;
        projection.mobileNo = 1;

        let options1: any = {};
        options1.lean = true;

        let isEmailMobileExist: any = await userModel.findById(query1, projection, options1);

        console.log(isEmailMobileExist);


        if (isEmailMobileExist) {

            let { userName, email, countryCode, mobileNo } = req.body,
                profile = req.file.key || isEmailMobileExist.profilePicture;

            console.log(req.file.key);

            let address = {
                country: req.body.country ? req.body.country : "",
                state: req.body.state ? req.body.state : "",
                city: req.body.city ? req.body.city : ""
            }

            let oldEmail = isEmailMobileExist.email;
            let oldCountryCode = isEmailMobileExist.countryCode;
            let oldMobileNo = isEmailMobileExist.mobileNo;

            //passing object to isUpdatedEmailMobileExist() for checking--
            let paramReq: any = {
                id: isEmailMobileExist._id,
                email: email,
                countryCode: countryCode,
                mobileNo: mobileNo
            }
            //check if updated email is already exist or not--
            let isUpdatedEmailMobileExist: any = await appUtils.isUpdatedEmailMobileExist(paramReq);

            console.log(isUpdatedEmailMobileExist, "<<<<<<<<<<>>>>>>>>>>");

            if (isUpdatedEmailMobileExist) {

                // res.send('user already exist');

                if (isUpdatedEmailMobileExist.email == email) {

                    res.send(config.CONSTANT.MESSAGES.ERROR.EMAIL_ALREADY_EXIST);
                }
                else {
                    res.send(config.CONSTANT.MESSAGES.ERROR.MOBILE_NO_ALREADY_EXIST);
                }
            } else {

                //first we save the data into the database

                let query: any = {};
                query._id = userToken._id;

                let update: any = {};
                update["$set"] = {
                    "userName": userName,
                    "profilePicture": profile,
                    "email": email,
                    "countryCode": countryCode ? countryCode : '',
                    "mobileNo": mobileNo ? mobileNo : '',
                    "address": address
                };

                let options: any = {};
                options.new = true;

                let editUserProfile: IUser = await userModel.findOneAndUpdate(query, update, options);

                if (editUserProfile) {

                    let editProfilePayload = {
                        _id: isEmailMobileExist._id,
                        userName: isEmailMobileExist.userName
                    };
                    let editProfileAccesstoken = await jwt.sign(editProfilePayload, envSecret.SERVER.JWT_CERT_KEY,
                        {
                            algorithm: 'HS256',
                            // expiresIn: "10m"   //hardly 10 minutes
                        });

                    if (email !== oldEmail) {
                        console.log("email differ from previous...")
                        //here we'll change status of isemailverified-->
                        let query: any = {};
                        query._id = isEmailMobileExist._id;

                        let update: any = {};
                        update["$set"] = { isEmailVerified: false };

                        let options: any = {};
                        options.upsert = true;
                        options.new = true;

                        let updateEmailVerifiedStatus: any = await userModel.findByIdAndUpdate(query, update, options);

                        //here we'll send email for email verification------
                        let userName = isEmailMobileExist.userName,
                            userId = isEmailMobileExist._id;

                        let send = await mailManager.sendVerificationEmail({ "email": email, "userName": userName, "accessToken": editProfileAccesstoken });

                        res.send({
                            message: config.CONSTANT.MESSAGES.SUCCESS.VERIFY_EMAIL,
                            response: editUserProfile,
                        });

                    } else {
                        console.log("everything is same....")
                        res.send({
                            message: config.CONSTANT.MESSAGES.SUCCESS.USER_UPDATED,
                            response: editUserProfile,
                        })
                    }
                } else {
                    res.send(config.CONSTANT.MESSAGES.ERROR.INTERNAL_SERVER_ERROR);
                }
            }
        } else {
            res.send(config.CONSTANT.MESSAGES.ERROR.USER_NOT_FOUND)
        }
    } catch (error) {
        throw error;
    }
};

/**
 * 
 * @param req 
 * @param res 
 * @param next 
 */
const socialLogin = async (req: any, res: Response, next: NextFunction) => {
    try {
        let { platform } = req.headers;
        let remoteAddress = req.header('x-forwarded-for') || req.connection.remoteAddress;

        let {
            socialLoginType,
            socialId,
            userName,
            email,
            countryCode,
            mobileNo,
            deviceId,
            deviceToken }: any = req.body;

        //here we will check social id which is given by req.body is exist or not---
        let query: any = {};

        if (socialLoginType === config.CONSTANT.SOCIAL_LOGIN_TYPE.FACEBOOK) {

            // query["$or"] = [{ "email": email }, { "countryCode": countryCode, "mobileNo": mobileNo }];
            query.facebookId = socialId;

        } else {

            query.googleId = socialId;

        }
        query.status = { "$ne": config.CONSTANT.STATUS.DELETED };

        let projection: any = {};

        let options: any = {};
        options.lean = true;

        let isUserExistWithSocialLogin = await userModel.findOne(query, projection, options);

        if (isUserExistWithSocialLogin) {

            if (isUserExistWithSocialLogin.status === config.CONSTANT.STATUS.BLOCKED) {

                res.send(config.CONSTANT.MESSAGES.ERROR.BLOCKED);

            } else {

                //now we will check if user exist so fromwhich type--then we will update following documents--

                let query: any = {};
                query._id = isUserExistWithSocialLogin._id;

                let set: any = {};

                let update: any = {};
                update["$set"] = set;


                if (socialLoginType === config.CONSTANT.SOCIAL_LOGIN_TYPE.FACEBOOK) {
                    set.socialLoginType = config.CONSTANT.SOCIAL_LOGIN_TYPE.FACEBOOK;
                    set.facebookId = socialId;
                    set.isFacebookLogin = true;
                    set.userName = userName;
                    set.email = email ? email : '';
                    set.countryCode = countryCode ? countryCode : '';
                    set.mobileNo = mobileNo ? mobileNo : '';

                } else {
                    set.socialLoginType = config.CONSTANT.SOCIAL_LOGIN_TYPE.GOOGLE;
                    set.googleId = socialId;
                    set.isGoogleLogin = true;
                    set.userName = userName;
                    set.email = email ? email : '';
                    set.countryCode = countryCode ? countryCode : '';
                    set.mobileNo = mobileNo ? mobileNo : '';

                }

                let options: any = {};
                options.upsert = true;

                let updateSocialData = await userModel.findOneAndUpdate(query, update, options);

                if (updateSocialData) {

                    let payload: any =
                    {
                        _id: isUserExistWithSocialLogin._id,
                        mobileNo: isUserExistWithSocialLogin.mobileNo,
                        email: isUserExistWithSocialLogin.email,
                        deviceId: req.body.deviceId
                    };

                    let token = await jwt.sign(payload, envSecret.SERVER.JWT_CERT_KEY,
                        {
                            algorithm: "HS256",
                            // expiresIn: "10d"   //hardly 10 days
                        });


                    let paramsReq = {
                        userId: isUserExistWithSocialLogin._id,
                        deviceId: deviceId,
                        deviceToken: deviceToken,
                        remoteAddress: remoteAddress,
                        platform: platform,

                    };

                    let updateUserLoginHistory: any = await loginHistoryDao.removeUserDeviceByUserId(paramsReq);

                    let createUserLoginHistory = await loginHistoryDao.createUserLoginHistory(paramsReq);

                    if (createUserLoginHistory) {

                        res.send({
                            message: config.CONSTANT.MESSAGES.SUCCESS.LOGIN,
                            response: isUserExistWithSocialLogin,
                            token: token
                        })

                    } else {
                        res.send(config.CONSTANT.MESSAGES.ERROR.INTERNAL_SERVER_ERROR);
                    }

                } else {
                    res.send(config.CONSTANT.MESSAGES.ERROR.INTERNAL_SERVER_ERROR);

                }
            }
        }
        else {

            let socialSignupData: any = {

                userName: userName,
                email: email ? email : '',
                countryCode: countryCode ? countryCode : '',
                mobileNo: mobileNo ? mobileNo : ''
            };

            if (socialLoginType === config.CONSTANT.SOCIAL_LOGIN_TYPE.FACEBOOK) {

                socialSignupData.facebookId = socialId;
                socialSignupData.isFacebookLogin = true;

            } else {

                socialSignupData.googleId = socialId;
                socialSignupData.isGoogleLogin = true;
            }


            let dataToInsert: IUser = new userModel(socialSignupData);
            let socialSignup: IUser = await dataToInsert.save();

            if (socialSignup) {

                let payload: any =
                {
                    _id: socialSignup._id,
                    mobileNo: socialSignup.mobileNo,
                    email: socialSignup.email,
                    deviceId: deviceId
                };

                let token = await jwt.sign(payload, envSecret.SERVER.JWT_CERT_KEY,
                    {
                        algorithm: "HS256",
                        // expiresIn: "10d"   //hardly 10 days
                    });


                let paramsReq = {
                    userId: socialSignup._id,
                    deviceId: deviceId,
                    deviceToken: deviceToken,
                    remoteAddress: remoteAddress,
                    platform: platform,

                };

                let updateUserLoginHistory: any = await loginHistoryDao.removeUserDeviceByUserId(paramsReq);

                let createUserLoginHistory = await loginHistoryDao.createUserLoginHistory(paramsReq);

                if (createUserLoginHistory) {

                    res.send({
                        message: config.CONSTANT.MESSAGES.SUCCESS.SIGNUP,
                        response: socialSignup,
                        token: token
                    })
                }
                else {
                    res.send(config.CONSTANT.MESSAGES.ERROR.INTERNAL_SERVER_ERROR)
                }

            }
        }
    }

    catch (error) {
        throw error;
    }

}

/**
 * 
 * @param req 
 * @param res 
 * @param next 
 */
const healthReport = async (req: any, res: Response, next: NextFunction) => {

    try {
        let userToken: any = req.token;
        //getting user's data
        let query: any = {};
        query._id = userToken._id;
        query.status = { "$ne": config.CONSTANT.STATUS.DELETED };

        let projection: any = {};
        projection._id = 1;
        projection.profilePicture = 1;
        projection.dob = 1;
        projection.height = 1;
        projection.gender = 1;
        projection.email = 1;
        projection.userName = 1;

        let options: any = {};

        let getUserProfile = await userModel.findOne(query, projection, options);


        console.log(getUserProfile);
        /**
         * for calculation these thing there are two kinds one is standard & second is Metric.
         * for -1>.Standard= height will be in feet & weight wiil be in pound(lbs).
         * for -2>.metric= height will be in centimeter & weight wiil be in kilogram.
         * but user's given height is in feet.inch and weight in lbs.
         */

        if (getUserProfile) {

            let { weight, waist, type, activityLevel } = req.body,  //weight=lbs
                gender = getUserProfile.gender,
                height = getUserProfile.height.feet + "." + getUserProfile.height.inch,
                age = await appUtils.calculate_age(getUserProfile.dob);


            let getBMI = await appUtils.calculateBMI(height, age, gender, type, weight, activityLevel);
            let cBMI = getBMI.correctBMI,
                bfpercent = getBMI.bodyFatPercentage;

            let getHealthRiskReport = await appUtils.calculateHealthRiskReport(cBMI, bfpercent, age, gender);

            // console.log("body and Metabolic Report :", getBMI, "\n Healthrisk Report :", getHealthRiskReport);


            // data to save -
            let dataToSave: object = {
                userId: userToken._id,
                waist,
                activityLevel,
                totalBodyWeight: weight,
                correctBMI: getBMI.correctBMI,
                BMI: getBMI.BMI,

                bodyFatPercentage: getBMI.bodyFatPercentage,
                leanBodyMass: getBMI.leanBodyMass,
                reportFinalType: getBMI.reportFinalType,
                fatMass: getBMI.fatMass,
                restingMetabolicRate: getBMI.restingMetabolicRate,
                activeMetabolicRate: getBMI.activeMetabolicRate,
                compositionGrade: getHealthRiskReport.compositionGrade,

                respiratory: getHealthRiskReport.respiratory,
                heart: getHealthRiskReport.heart,
                diabetes: getHealthRiskReport.diabetes,
                cancer: getHealthRiskReport.cancer,
                stroke: getHealthRiskReport.stroke

            };

            let dataToInsert: BMI = new bodyMetabolicReportModel(dataToSave);
            let response: BMI = await dataToInsert.save();

            // console.log(response);

            if (response) {

                let payload = {
                    _id: getUserProfile._id,
                    userName: getUserProfile.userName
                };
                let accessToken = await jwt.sign(payload, envSecret.SERVER.JWT_CERT_KEY,
                    {
                        algorithm: 'HS256',
                        // expiresIn: "10m"   //hardly 10 minutes
                    });

                let params = {
                    userId: getUserProfile._id,
                    fitScore: response.compositionGrade,
                    reportFinalType: response.reportFinalType,
                    userName: getUserProfile.userName,
                    email: getUserProfile.email,
                    accessToken: accessToken
                };
                // console.log(params)
                //here we will update fit score , add latest fit score to users collection
                let updateFitScoreToUser = await appUtils.updateFitScoreToUser(params);

                // here we will notify through email to users
                let healthReportOnEmail = await mailManager.healthReportOnEmail(params);

                //autoNotificationAfterReport to user
                let autoNotificationAfterReport = await appUtils.autoNotificationAfterReport(params);

                res.send({
                    message: config.CONSTANT.MESSAGES.SUCCESS.ASSESMENT_UPLOAD,
                    response: response

                });
            }
            else {
                res.send(config.CONSTANT.MESSAGES.ERROR.INTERNAL_SERVER_ERROR)
            }
        } else {
            res.send(config.CONSTANT.MESSAGES.ERROR.USER_NOT_FOUND);
        }
    } catch (error) {
        throw error;
    }
}
/**
 * 
 * @param req 
 * @param res 
 * @param next 
 */
const gethealthReport = async (req: any, res: Response, next: NextFunction) => {

    try {
        let userToken: any = req.token,
            userId: any = userToken._id;

        let query: any = {};
        query.userId = userToken._id;

        let projection: any = {};
        projection._id = 0;
        projection.updatedAt = 0;

        let options: any = {};
        options.sort = { createdAt: -1 };
        options.limit = 7;
        options.lean = true;
        options.new = true;

        let getReport = await bodyMetabolicReportModel.find(query, projection, options);


        if (getReport) {

            res.send({
                message: config.CONSTANT.MESSAGES.SUCCESS.ASSESMENT_GET,
                response: { report: getReport }
            });

        } else {
            res.send(config.CONSTANT.MESSAGES.ERROR.INTERNAL_SERVER_ERROR);
        }

    } catch (error) {
        throw error;
    }
}



/**
 * @Function LOGOUT USER.
 **/
const signout = async (req: any, res: Response, next: NextFunction) => {
    try {

        let userToken: any = req.token;
        let userId = userToken._id;
        let { deviceId } = req.body;

        let paramReq = {
            userId: userId,
            deviceId: deviceId
        };

        let update_user_login_history = await loginHistoryDao.removeUserDeviceByUserId(paramReq);

        if (update_user_login_history) {

            res.send(config.CONSTANT.MESSAGES.SUCCESS.LOGOUT);

        } else {
            res.send(config.CONSTANT.MESSAGES.ERROR.INTERNAL_SERVER_ERROR);
        }

    } catch (error) {
        throw error;
    }
};






/*
 * @Users Panel Controller 
 */
export const userController = {
    signup: signup,
    signin: signin,
    guestMode: guestMode,
    forgotPassword: forgotPassword,
    resetPasswordWebPage: resetPasswordWebPage,
    verifyOTP: verifyOTP,
    verifyEmailAddress: verifyEmailAddress,
    deepLink: deepLink,
    reSendOtp: reSendOtp,
    resetPassword: resetPassword,
    changePassword: changePassword,
    createUserProfile: createUserProfile,
    getUserProfile: getUserProfile,
    editUserProfile: editUserProfile,
    socialLogin: socialLogin,
    healthReport: healthReport,
    gethealthReport: gethealthReport,
    signout: signout
};