import { check, sanitize, validationResult } from "express-validator";
import { Request, Response, NextFunction } from 'express';
import * as config from '../config/constant';


/**
 *@Admin validation 
 */
export async function signupValidation(req: Request, res: Response, next: NextFunction) {

    await check("adminName", "Admin name must not be empty or invalid.").isLength({ min: 4 }).isString().run(req)

    await check("email", "Email must not be empty or invalid.").isEmail().matches(config.CONSTANT.REGEX.EMAIL).isLowercase().run(req)

    await check("password", "Password must not be empty or invalid.").matches(config.CONSTANT.REGEX.PASSWORD).isLength({ min: 6 }).run(req)

    await sanitize("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(config.CONSTANT.HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY).json({ errors: errors.mapped() });//array() })
    }
    else {
        return next();
    }

}

export async function signinValidation(req: Request, res: Response, next: NextFunction) {

    await check("email", "Email must not be empty or invalid.").isEmail().matches(config.CONSTANT.REGEX.EMAIL).isLowercase().optional()
    await check("password", "Password must not be empty or invalid.").matches(config.CONSTANT.REGEX.PASSWORD).run(req)

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(config.CONSTANT.HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY).json({ errors: errors.mapped() })
    }
    else {
        return next();
    }

}

export async function forgotPasswordValidation(req: Request, res: Response, next: NextFunction) {

    await check("email", "Email must not be empty or invalid.").isEmail().matches(config.CONSTANT.REGEX.EMAIL).isLowercase().optional()
    await check("countryCode").matches(config.CONSTANT.REGEX.COUNTRY_CODE).optional()
    await check("mobileNo", "Mobile number must not be empty or invalid.").isEmpty({ ignore_whitespace: false }).matches(config.CONSTANT.REGEX.MOBILE_NUMBER).optional()
    await check("password", "Password must not be empty or invalid.").matches(config.CONSTANT.REGEX.PASSWORD).optional()

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(config.CONSTANT.HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY).json({ errors: errors.mapped() })
    }
    else {
        return next();
    }

}

export async function resetPasswordValidation(req: Request, res: Response, next: NextFunction) {

    await check("password", "Password must not be empty or invalid.").matches(config.CONSTANT.REGEX.PASSWORD);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(config.CONSTANT.HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY).json({ errors: errors.mapped() })
    }
    else {
        return next();
    }

}

export async function changePasswordValidation(req: Request, res: Response, next: NextFunction) {

    await check("password", "Password must not be empty or invalid.").matches(config.CONSTANT.REGEX.PASSWORD);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(config.CONSTANT.HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY).json({ errors: errors.mapped() })
    }
    else {
        return next();
    }

}

export async function adminNotificationValidation(req: Request, res: Response, next: NextFunction) {

    function isValidDate(value) {
        if (!value.match(/^\d{4}-\d{2}-\d{2}$/)) return false;

        const date = new Date(value);
        if (!date.getTime()) return false;
        return date.toISOString().slice(0, 10) === value;
    }

    await check("title", "Title must not be empty or invalid..!!").isString().run(req);
    await check("link", "Link must not be empty or invalid..!!").isString().run(req);
    await check("avatar", "Notification image must not be empty or invalid..!!").isString().optional()
    await check("appPlatform", "App platform must not be empty or invalid..!!").isString().run(req);
    await check("message", "Message must not be empty or invalid..!!").isString().run(req);
    await check("fromDate", "Date must not be empty or invalid..!!").custom(isValidDate).run(req);
    await check("toDate", "Date must not be empty or invalid..!!").custom(isValidDate).run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(config.CONSTANT.HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY).json({ errors: errors.mapped() })
    }
    else {
        return next();
    }
}
