// /lib/routes/crmRoutes.ts
import { Request, Response } from "express";
import { adminController } from "../controllers/adminController";
import {
    signupValidation,
    signinValidation,
    verifyOTP,
    forgotPasswordValidation,
    resetPasswordValidation,
    changePasswordValidation
} from '../helpers/userValidation';
import { validateToken } from "../middlewares/user-Auth";
import { AWSUpload } from '../utils/imageUtils';
// import { Upload } from '../helpers/AWSUploads';


export class adminRoutes {

    // public signupvalidation = new signupValidation(req, res, next);

    public routes(app: any): void {

        // app.router.use(express.static(__dirname+"./public/"))
        /***
         *@Base ROUTE FOR TESTING
         **/
        app.route('/admin-base-route')
            .get((req: Request, res: Response) => {
                let remoteAddress = req.header('x-forwarded-for') || req.connection.remoteAddress;

                res.status(200).send({
                    message: "Your Admin server's first request run successfulll!!!!",
                    ip: remoteAddress
                })
            });
        /**
         *@SignUp ROUTE
         **/

        app.route('/api/admin/signup')
            .post(adminController.createAdmin);

        /**
         *@SignIn ROUTE
         **/
        app.route('/api/admin/signin')
            .post(adminController.adminLogin);
        /**
         *@Forgot PASSWORD ROUTE
         **/
        app.route('/api/admin/forgot-password')
            .post(forgotPasswordValidation, adminController.forgotPassword);

        /**
      *@Change PASSWORD ROUTE
      **/
        app.route('/api/admin/change-password')
            .post(validateToken, adminController.changePassword);

        /**
         *@RESET PASSWORD ROUTE
         **/
        app.route('/api/admin/reset-password')
            .post(validateToken, adminController.changeForgotPassword);
        /**
        * @Get admins Profile
        */
        app.route('/api/admin/dashboard')
            .get(validateToken, adminController.dashboard)

        /**
       * @Get admins Profile
       */
        app.route('/api/admin/admin-profile')
            .get(validateToken, adminController.adminDetails)
        /**
        * @Edit admins Profile
        */
        app.route('/api/admin/edit-admin-profile')
            .post(validateToken, adminController.editProfile);

        /**
         * @ADD and send notification to bulk user-
         */

        app.route('/api/admin-notification')
            .post(validateToken, AWSUpload.single('avatar'), adminController.adminNotification);


        /**
         * @EDIT NOTIFICATION--
         */
        app.route('/api/edit-admin-notification/:notificationId')
            .post(validateToken, AWSUpload.single('avatar'), adminController.editNotification);
        /**
         * @LIST OF NOTIFICATION--
         */
        app.route('/api/admin/notification-list')
            .post(adminController.notificationList);
        /**
         * @GET notification details
         */
        app.route('/api/admin-notification/details')
            .post(validateToken, adminController.adminNotificationDetail)
        /**
         * @SEND NOTIFICATION ONE TO ONE USER
         */
        app.route('/api/admin-notification/send/:userId')
            .post(validateToken, AWSUpload.single('avatar'), adminController.sendOneToOneNotification);

        /**
         * @DELETE NOTIFICATION
         */
        app.route('/api/admin-notification/:notificationId')
            .delete(validateToken, adminController.deleteNotification)

        /**
         *@Healthreel videos
         */
        app.route('/api/app/healthreel-video')
            .post(validateToken, AWSUpload.single('avatar'), adminController.uploadHealthreelVideo)
            .get(adminController.getHealthreelVideo);


        /**
         * @Logout ROUTE
         **/
        app.route('/api/admin/signout')
            .get(validateToken, adminController.logout);


    }
}


























