import { Request, Response } from "express";
import { userController } from "../controllers/userController";
import {
    signupValidation,
    signinValidation,
    verifyOTP,
    forgotPasswordValidation,
    resetPasswordValidation,
    changePasswordValidation,
    bodyMetabolicReportValidation,
    editProfileValidation,
    createProfileValidation,
} from '../helpers/userValidation';
import { validateToken } from "../middlewares/user-Auth";
import { AWSUpload } from '../utils/imageUtils';
import { bodyMetabolicReportModel } from "../models/bodyMetabolicReport";
import { TemplateUtil } from "../utils/TemplateUtils";
import * as envSecret from '../config/environment';


export class userRoutes {

    public routes(app: any): void {

        /***
      *@Base ROUTE FOR TESTING
      **/
        app.route('/user-base-route')
            .get((req: Request, res: Response) => {
                let remoteAddress = req.header('x-forwarded-for') || req.connection.remoteAddress;
                res.status(200).send({
                    message: "Your server's first request run successfulll!!!!",
                    ip: remoteAddress
                })
            });

        /**
         *@uplods route for testing
         */
        app.route('/uploads')
            .post(AWSUpload.single('avatar'), (req: Request, res: Response) => {
                let image = req.file;
                console.log(req.file);
                let remoteAddress = req.header('x-forwarded-for') || req.connection.remoteAddress;
                res.status(200).send({
                    message: "Your server's first request run successfulll!!!!",
                    image: image,
                    ip: remoteAddress
                })
            })

        /**
         *@SignUp ROUTE
         **/
        app.route('/api/user/signup')
            .post(signupValidation, userController.signup);

        /**
         *@SignIn ROUTE
         **/
        app.route('/api/user/signin')
            .post(signinValidation, userController.signin);

        /**
         *@GUEST MODE ROUTE
         **/
        app.route('/api/user/guest-mode')
            .post(userController.guestMode);

        /**
         *@Forgot PASSWORD ROUTE
         **/
        app.route('/api/user/forgot-password')
            .post(forgotPasswordValidation, userController.forgotPassword);
        /**
         *@WEBPAGE FOR RESET-PASSWORD IF USER OPEN MAIL IN DESKTOP IT RESPOND AS A WEB PAGE--
         */
        app.route('/api/user/web-reset-password-page')
            .get(userController.resetPasswordWebPage)
        /**
        *@Deeplink IF USER OPEN MAIL IN MOBILE IT REDIRECT TO EITHER APP OR PLAY STORE--
        */
        app.route('/api/user/deeplink')
            .get(userController.deepLink)

        /**
        *@Change PASSWORD ROUTE
        **/
        app.route('/api/user/change-password')
            .post(validateToken, changePasswordValidation, userController.changePassword);
        /**
        *@Verify OTP AFTER SIGNUP
        **/
        app.route('/api/user/verify-otp')
            .post(validateToken, verifyOTP, userController.verifyOTP);

        /**
        *@Verify EMAIL ADDRESS--
        **/
        app.route('/api/user/verify-email-address')
            .get(userController.verifyEmailAddress);//validateToken, 

        /**
        *@Resend OTP 
        **/
        app.route('/api/user/resend-otp')
            .post(validateToken, userController.reSendOtp);

        /**
         *@RESET PASSWORD ROUTE
         **/
        app.route('/api/user/reset-password/')
            .post(resetPasswordValidation, userController.resetPassword);

        /**
         * @Create users Profile
         */
        app.route('/api/user/create-profile')
            .post(validateToken, createProfileValidation, userController.createUserProfile)
        /**
       * @Get users Profile
       */
        app.route('/api/user/my-profile')
            .get(validateToken, userController.getUserProfile)
        /**
        * @Edit users Profile
        */
        app.route('/api/user/edit-my-profile')
            .post(validateToken, AWSUpload.single('avatar'), editProfileValidation, userController.editUserProfile)


        /**
        *@Social LOGIN FACEBOOK/GOOGLE
        **/
        app.route('/api/user/social-login')
            .post(userController.socialLogin);

        /**
        *@Change PASSWORD ROUTE
        **/
        app.route('/api/user/health-report')
            .post(validateToken, userController.healthReport)
            .get(validateToken, userController.gethealthReport)

        /**
        * @Logout ROUTE
        **/
        app.route('/api/user/signout')
            .post(validateToken, userController.signout);


    }
}

