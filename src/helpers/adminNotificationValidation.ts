import { check, sanitize, validationResult } from "express-validator";
import { Request, Response, NextFunction } from 'express';
import * as config from '../config/constant';


export async function adminNotificationValidation(req: Request, res: Response, next: NextFunction) {
    //image, title, link, message, platform

    await check("image", "something went wrong in image.").run(req)

    await check("title", "something went wrong in title.").trim().run(req)

    await check("link", "something went wrong in link.").matches(config.CONSTANT.REGEX.URL).trim().optional()

    await check("message", "something went wrong in message.").trim().run(req)

    await check("appPlatform").isIn([
        config.CONSTANT.DEVICE_TYPE.ANDROID,
        config.CONSTANT.DEVICE_TYPE.IOS,
        config.CONSTANT.DEVICE_TYPE.ALL
    ]).run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(config.CONSTANT.HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY).json({ errors: errors.mapped() });//array() })
    }
    else {
        return next();
    }

}
export async function editNotificationValidation(req: Request, res: Response, next: NextFunction) {
    //image, title, link, message, platform

    await check("image", "something went wrong in image.").run(req)

    await check("title", "something went wrong in title.").trim().run(req)

    await check("link", "something went wrong in link.").matches(config.CONSTANT.REGEX.URL).trim().optional()

    await check("message", "something went wrong in message.").trim().run(req)
    
    await check("appPlatform").isIn([
        config.CONSTANT.DEVICE_TYPE.ANDROID,
        config.CONSTANT.DEVICE_TYPE.IOS,
        config.CONSTANT.DEVICE_TYPE.ALL
    ]).run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(config.CONSTANT.HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY).json({ errors: errors.mapped() });//array() })
    }
    else {
        return next();
    }

}


export async function sendOneToOneNotificationValidation(req: Request, res: Response, next: NextFunction) {
    //image, title, link, message, platform

    await check("image", "something went wrong in image.").run(req)

    await check("title", "something went wrong in title.").trim().run(req)

    await check("link", "something went wrong in link.").matches(config.CONSTANT.REGEX.URL).trim().optional()

    await check("message", "something went wrong in message.").trim().run(req)
    
    await check("appPlatform").isIn([
        config.CONSTANT.DEVICE_TYPE.ANDROID,
        config.CONSTANT.DEVICE_TYPE.IOS,
        config.CONSTANT.DEVICE_TYPE.ALL
    ]).run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(config.CONSTANT.HTTP_STATUS_CODE.UNPROCESSABLE_ENTITY).json({ errors: errors.mapped() });//array() })
    }
    else {
        return next();
    }

}