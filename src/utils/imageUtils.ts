"user strict";
import * as path from 'path';
import * as envSecret from '../config/environment';
import * as  AWS from 'aws-sdk';
import multer = require('multer');
const multerS3 = require('multer-s3');
import * as uuid from 'uuid';
const sharp = require('sharp');

AWS.config.update({
    accessKeyId: envSecret.SERVER.AWS_IAM_USER.ACCESS_KEY_ID,
    secretAccessKey: envSecret.SERVER.AWS_IAM_USER.SECRET_ACCESS_KEY,
    region: envSecret.SERVER.S3.REGION,
    apiVersion: "2006-03-01",
});

const s3 = new AWS.S3();
const maxSize = 5 * 1000 * 1000;
/* TODO Resize */

const AWSUpload = multer({

    storage: multerS3({
        s3: s3,
        bucket: "myhealthreelapp",
        acl: 'public-read',
        limits: {
            fileSize: maxSize,
            // files: 5
        },
        contentType: multerS3.AUTO_CONTENT_TYPE,
        // acl: envSecret.SERVER.S3.ACL,
        cacheControl: 'max-age=31536000',

        //The metadata object to be sent to S3
        metadata(req, file, cb) {
            cb(null, { fieldName: file.fieldname + "_" + Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname) })
        },
        key: function (req, file, cb) {
            const extension = file.mimetype.split('/')[1]; // gets the extension
            const area = file.fieldname;
            const destinationFolder = req.body.destFolder || "public";
            const fileName = `${destinationFolder}/${area}${uuid.v4()}.${extension}`;
            cb(null, fileName);
        },
        shouldTransform: function (req, file, cb) {
            cb(null, /^image/i.test(file.mimetype));
        },
        transforms: [
            {
                id: 'original',
                transform: function (req, file, cb) {
                    //Perform desired transformations
                    cb(
                        null,
                        sharp(file)
                            .png()
                            .toBuffer()
                            .resize({
                                width: 48,
                                height: 48,
                                channels: 4,
                                fit: sharp.fit.cover,
                                position: sharp.strategy.entropy,
                                background: { r: 255, g: 0, b: 0, alpha: 0.5 }

                            })
                            .max()
                    );
                }
            }
        ],
        fileFilter(req, file, next) {
            var ext = path.extname(file.originalname);
            const isPhoto = file.mimetype.startsWith('image/');
            if (isPhoto) {
                if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
                    next(null, true);
                }// null for error means it worked and it is fine to continue to next()
            } else {
                next({ message: 'Something went wrong' }, false); // with error
            }
        }
    })
});

export { AWSUpload };