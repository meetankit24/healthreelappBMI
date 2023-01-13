"use strict";

import * as nodemailer from "nodemailer";
// import * as sgTransport from "nodemailer-sendgrid-transport";
// import * as ses from "nodemailer-ses-transport";

import * as config from "../config/environment";
import * as config2 from '../config/constant';
import { TemplateUtil } from "../utils/TemplateUtils";
import { Utils } from "handlebars";




let transporter = nodemailer.createTransport({
    host: config.SERVER.MAIL.SMTP.HOST,
    port: 465,
    secure: true,
    auth: {
        user: config.SERVER.MAIL.SMTP.USER,
        pass: config.SERVER.MAIL.SMTP.PASSWORD
    }
});


export class MailManager {
    private fromEmail: string = config2.CONSTANT.EMAIL_TEMPLATE.FROM_MAIL;

    constructor() { }

    async sendMailViaSmtp(params) {
        try {
            let mailOptions = {
                from: `'Health Reel App' <${this.fromEmail}>`,
                to: params.email,
                subject: params.subject,
                html: params.content,
                // bcc: config2.CONSTANT.EMAIL_TEMPLATE.BCC_MAIL
            };
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Message sent: " + info.response);
                }
            });
        } catch (error) {
            console.log(error);
        }
        return {};
    }



    async sendMail(params) {
        if (config.SERVER.MAIL_TYPE === config2.CONSTANT.MAIL_SENDING_TYPE.SMTP) {
            return await this.sendMailViaSmtp(params);

        } else {
            throw new Error("something went wrong !!");
        }
    }

    async sendVerificationEmail(params) {
        let mailContent = await (new TemplateUtil(config.SERVER.TEMPLATE_PATH + "email-verification.html"))
            .compileFile({
                "url": "http://3.92.170.227:7001/api/user" + "/verify-email-address/" + "?token=" + params.accessToken,
                "year": new Date().getFullYear(),
                "userName": params.userName
            });
        await this.sendMail({ "email": params.email, "subject": config2.CONSTANT.EMAIL_TEMPLATE.SUBJECT.VERIFY_EMAIL, "content": mailContent });
    };

    async healthReportOnEmail(params) {
        let mailContent = await (new TemplateUtil(config.SERVER.TEMPLATE_PATH + "health-report.html"))
            .compileFile({
                "url": "http://localhost:3020/api/user" + "/deeplink/" + "?type=health-report & token=" + params.accessToken,
                "year": new Date().getFullYear(),
                "userName": params.userName
            });
        await this.sendMail({ "email": params.email, "subject": config2.CONSTANT.EMAIL_TEMPLATE.SUBJECT.HEALTH_REPORT_ON_EMAIL, "content": mailContent });
    };


    async sendForgotPasswordEmail(params) {
        let mailContent = await (new TemplateUtil(config.SERVER.TEMPLATE_PATH + "forgot-password2.html"))
            .compileFile({
                "userName": params.userName,
                "url": "http://3.92.170.227:7001/api/user" + "/deeplink/" + "?type= reset-password & token=" + params.accessToken,
            });
        await this.sendMail({ "email": params.email, "subject": config2.CONSTANT.EMAIL_TEMPLATE.SUBJECT.FORGOT_PWD_EMAIL, "content": mailContent });
    }

}
