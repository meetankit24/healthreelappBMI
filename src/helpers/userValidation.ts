import { check, sanitize, validationResult, header } from "express-validator";
import { Request, Response, NextFunction } from 'express';
import * as config from '../config/constant';


/**
 * 
 *@USER Validation
 */
export async function signupValidation(req: Request, res: Response, next: NextFunction) {


    await check("userName", "User name must not be empty or invalid..!!").isLength({ min: 4 }).isString().run(req)

    await check("email", "Email must not be empty or invalid..!!").isEmail().matches(config.CONSTANT.REGEX.EMAIL).isLowercase().run(req)

    await check("countryCode", "Country code must not be empty or invalid..!!").matches(config.CONSTANT.REGEX.COUNTRY_CODE);

    await check("mobileNo", "Mobile number must not be empty or invalid..!!").isNumeric().matches(config.CONSTANT.REGEX.MOBILE_NUMBER).run(req)

    await check("password", "Password must not be empty or invalid..!!").matches(config.CONSTANT.REGEX.PASSWORD).isLength({ min: 6 }).run(req)

    await check("deviceId", "DeviceID must not be empty or invalid..!!").run(req)

    await check("deviceToken", "Device-Token must not be empty or invalid..!!").run(req)

    await header("platform", "Platform must not be empty or invalid..!!").run(req)

    await check("remoteAddress", "Remote address must not be empty or invalid..!!").run(req)

    await sanitize("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

    const errors = validationResult(req);

    console.log(errors);

    if (!errors.isEmpty()) {
        return res.status(config.CONSTANT.HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY).json({ errors: errors.mapped() });//array() })
    }
    else {
        return next();
    }

}


export async function signinValidation(req: Request, res: Response, next: NextFunction) {


    await check("email", "Email must not be empty or invalid..!!").isEmail().matches(config.CONSTANT.REGEX.EMAIL).isLowercase().optional()

    await check("countryCode", "Country code must not be empty or invalid..!!").matches(config.CONSTANT.REGEX.COUNTRY_CODE)

    await check("mobileNo", "Mobile number must not be empty or invalid..!! ").isEmpty({ ignore_whitespace: false }).matches(config.CONSTANT.REGEX.MOBILE_NUMBER).optional()

    await check("password", "Password must not be empty or invalid..!! ").matches(config.CONSTANT.REGEX.PASSWORD).run(req)

    await check("deviceId", "DeviceID must not be empty or invalid..!!").run(req)

    await check("deviceToken", "Device-Token must not be empty..!!").run(req)

    await header("platform", "Platform must not be empty..!!").run(req)

    await check("remoteAddress", "RemoteAddress must not be empty..!!").run(req)

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(config.CONSTANT.HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY).json({ errors: errors.mapped() })
    }
    else {
        return next();
    }

}

export async function verifyOTP(req: Request, res: Response, next: NextFunction) {

    // await check('token', "Token must not be empty or invalid..!!").isString().run(req)
    await check("verificationPin", "Verification code must not be empty or invalid..!!").isLength({ min: 4, max: 4 }).isNumeric().run(req)

    // await check("pinAuthToken", "Authentication token missing").run(req)

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(config.CONSTANT.HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY).json({ errors: errors.mapped() })
    }
    else {
        return next();
    }

}

export async function forgotPasswordValidation(req: Request, res: Response, next: NextFunction) {

    // console.log(">>>>>>>>>reset password>>>>>>>>>>>>>>>>>>>>>")

    await check("email", "Email must not be empty or invalid..!!").isEmail().matches(config.CONSTANT.REGEX.EMAIL).isLowercase().optional()
    // await check('token', "Token must not be empty or invalid..!!").isString().run(req)
    await check("countryCode").matches(config.CONSTANT.REGEX.COUNTRY_CODE).optional()
    await check("mobileNo", "Mobile number must not be empty or invalid..!!").isEmpty({ ignore_whitespace: false }).matches(config.CONSTANT.REGEX.MOBILE_NUMBER).optional()
    await check("password", "Password must not be empty or invalid..!!").matches(config.CONSTANT.REGEX.PASSWORD).optional()

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(config.CONSTANT.HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY).json({ errors: errors.mapped() })
    }
    else {
        return next();
    }

}

export async function resetPasswordValidation(req: Request, res: Response, next: NextFunction) {

    console.log(">>>>>>>>>reset password>>>>>>>>>>>>>>>>>>>>>")
    // await check('token', "Token must not be empty or invalid..!!").isString().run(req)
    await check("password", "Password must not be empty or invalid..!!").matches(config.CONSTANT.REGEX.PASSWORD);

    // await check("confirmPassword", "Passwords do not match").equals(req.body.password).run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(config.CONSTANT.HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY).json({ errors: errors.mapped() })
    }
    else {
        return next();
    }

}

export async function changePasswordValidation(req: Request, res: Response, next: NextFunction) {

    console.log(">>>>>>>>>change password>>>>>>>>>>>>>>>>>>>>>")
    // await check('token', "Token must not be empty or invalid..!!").isString().run(req)
    await check("password", "Password must not be empty or invalid..!!").matches(config.CONSTANT.REGEX.PASSWORD);

    // await check("confirmPassword", "Passwords do not match").equals(req.body.password).run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(config.CONSTANT.HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY).json({ errors: errors.mapped() })
    }
    else {
        return next();
    }

}


export async function createProfileValidation(req: Request, res: Response, next: NextFunction) {

    console.log(">>>>>>>>>create Profile >>>>>>>>>>>>>>>>>>>>>")
    function isValidDate(value) {
        if (!value.match(/^\d{4}-\d{2}-\d{2}$/)) return false;

        const date = new Date(value);
        if (!date.getTime()) return false;
        return date.toISOString().slice(0, 10) === value;
    }
    await check("dob", "the date must be valid.").custom(isValidDate);
    await check('authorization').exists();
    await check("gender", " Gender must not be empty or invalid.").isString().run(req);
    await check("country", "Country must not be empty or invalid.").isString().run(req);
    await check("state", "State must not be empty or invalid.").isString().optional();
    await check("city", "City must not be empty or invalid.").isString().optional();
    await check("feet", "Height must not be empty or invalid.").isNumeric().run(req);
    await check("inch", "Height must not be empty or invalid.").isNumeric().optional();

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(config.CONSTANT.HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY).json({ errors: errors.mapped() })
    }
    else {
        return next();
    }

}

export async function editProfileValidation(req: Request, res: Response, next: NextFunction) {

    console.log(">>>>>>>>>edit Profile >>>>>>>>>>>>>>>>>>>>>");

    function isValidDate(value) {
        if (!value.match(/^\d{4}-\d{2}-\d{2}$/)) return false;

        const date = new Date(value);
        if (!date.getTime()) return false;
        return date.toISOString().slice(0, 10) === value;
    }

    await check("userName", "User name must not be empty or invalid..!!").isLength({ min: 4 }).isString().run(req)
    await check("avatar", "User image must not be empty or invalid..!!").isString().optional()
    await check("email", "Email must not be empty or invalid..!!").isEmail().matches(config.CONSTANT.REGEX.EMAIL).isLowercase().run(req)
    await check("countryCode", "Country code must not be empty or invalid..!!").matches(config.CONSTANT.REGEX.COUNTRY_CODE).optional()
    await check("mobileNo", "Mobile number must not be empty or invalid..!!").isNumeric().matches(config.CONSTANT.REGEX.MOBILE_NUMBER).optional()
    await check("dob", "the date must be valid.").custom(isValidDate);
    await check("country", "Country must not be empty or invalid.").isString().run(req);
    await check("state", "State must not be empty or invalid.").isString().optional();
    await check("city", "City must not be empty or invalid.").isString().optional();
   
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(config.CONSTANT.HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY).json({ errors: errors.mapped() })
    }
    else {
        return next();
    }

}

export async function bodyMetabolicReportValidation(req: Request, res: Response, next: NextFunction) {

    // await check('token', "Token must not be empty or invalid..!!").isString().run(req)
    await check("weight", "Weight must not be empty or invalid..!!").isNumeric().run(req)
    await check("waist", "Waist must not be empty or invalid..!!").isNumeric().run(req)
    await check("type", "Measurement must not be empty or invalid..!!").isString().run(req);
    await check("activityLevel", "Activity level must not be empty or invalid..!!").isString().run(req)

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(config.CONSTANT.HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY).json({ errors: errors.mapped() })
    }
    else {
        return next();
    }


}