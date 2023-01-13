"use strict";
import * as jwt from 'jsonwebtoken';
import { NextFunction } from 'express';
import * as  config from '../config/constant';
import * as envSecret from '../config/environment'


const validateToken = (req:any, res: any, next: NextFunction) => {

    const authorizationHeader = req.headers.authorization;
    let result: any;

    if (authorizationHeader) {
        const token = req.headers.authorization.split(' ')[1]; // Bearer <token>

        try {
            // verify makes sure that the token hasn't expired and has been issued by us
            result = jwt.verify(token, envSecret.SERVER.JWT_CERT_KEY);

            // Let's pass back the decoded token to the request object

            req.token = result;

            // We call next to pass execution to the subsequent middleware
            next();

        } catch (err) {
            // Throw an error just in case anything goes wrong with verification
            throw new Error(err);
        }
    } else {

        res.send(config.CONSTANT.MESSAGES.ERROR.INVALID_TOKEN);
    }
}




export { validateToken };









