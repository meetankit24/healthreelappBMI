"use strict";
import * as envSecret from '../config/environment'
import * as appUtils from "../utils/appUtils";
import * as config from '../config/constant';
import * as dotenv from 'dotenv';


const LINKS = {
    // FORGOT_PASSWORTD_LINK: envSecret.SERVER.APP_URL + "/forgot-password/[TOKEN]"
    FORGOT_PASSWORTD_LINK: "http://3.92.170.227:7001/api/user" + "/deeplink/" + "?token=[Token]",

};

function validateNumber(countryCode: any, mobileNo: any) {
    if (!appUtils.isValidMobileNumber(countryCode, mobileNo)) {
        return Promise.reject(config.CONSTANT.MESSAGES.ERROR.INVALID_MOBILE_NUMBER);
    }
}

export async function sendMessage(countryCode: any, mobileNo: any, userName: any, verificationCode: any) {

    let smsCounter = 0;
    const accountSid = envSecret.SERVER.TWILIO.ACCOUNT_SID;
    const authToken = envSecret.SERVER.TWILIO.AUTH_TOKEN;
    const client = require('twilio')(accountSid, authToken);

    //validate number locally
    validateNumber(countryCode, mobileNo);
    // Validate Number With Twilio

    return client.messages.create({
        to: "+" + countryCode + mobileNo,
        from: envSecret.SERVER.TWILIO.TWILIO_NUMBER,
        body: 'Hi ' + userName + " , your verification code is " + verificationCode + ".keep this OTP to yourself for account safety. " + "\nRegards, \nHealth Reel App Team",

    })
        .then((err, message) => {
            if (err) {
                throw err;
            } else {
                console.log(message.sid)
                smsCounter++;
                console.log(smsCounter);
            }
        })
        .catch(function (error) {
            throw error;
        });

}
// export async function twilioVerifyOTP(mobileNo, code) {
//     const serviceId = envSecret.SERVER.TWILIO.SERVICE_ID;
//     const accountSid = envSecret.SERVER.TWILIO.ACCOUNT_SID;
//     const authToken = envSecret.SERVER.TWILIO.AUTH_TOKEN;
//     const client = require('twilio')(accountSid, authToken);

//     client.verify
//         .services(serviceId)
//         .verificationChecks
//         .create({
//             to: mobileNo,
//             code: code

//         }).then((verificationChecks) => {
//             console.log(verificationChecks.status, ">>>>>>>>>>>>>>>>>>>>>>>");
//             console.log("<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>")
//             return verificationChecks.status;
//         }).catch(function (error) {
//             throw error;
//         });
// }

/**
  * @param countryCode 
 * @param mobileNo 
 * @param token 
 */
export async function sendForgotPasswordLink(countryCode: any, mobileNo: any, userName: any, token: any) {

    return new Promise(async function (resolve, reject) {
        try {
            let link = LINKS.FORGOT_PASSWORTD_LINK.replace(config.CONSTANT.SMS.TOKEN, token);

            let tinyLink = await appUtils.tinyUrl(link);
            let sms = config.CONSTANT.SMS.TEMPLATES.FORGOT_PASSWORD.replace(/LINK/g, String(tinyLink));
            // resolve(sendMessage(countryCode, mobileNo, userName));
        } catch (error) {
            throw error;
        }
    });
};
