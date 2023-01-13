"use strict";
import * as mongoose from 'mongoose';
import { rateAndReviewModel, RateReview } from '../models/appRateReview';
import { userModel, IUser } from '../models/userModels'
import { Request, Response, NextFunction } from 'express';
import * as config from '../config/constant';
import * as envSecret from '../config/environment';
import * as appUtils from '../utils/appUtils';


/**
* @Function RATE AND REVIEW =>POST.
**/
const rateAndReview = async (req: any, res: Response, next: NextFunction) => {
    try {

        let userToken: any = req.token;

        let query: any = {};
        query._id = userToken._id;
        query.status = { "$ne": config.CONSTANT.STATUS.DELETED };

        let projection: any = {};
        projection._id = 1;

        let options: any = {};
        options.lean = true;

        let isUserExist: IUser = await userModel.findOne(query, projection, options);

        console.log(isUserExist, "previous");

        if (isUserExist) {

            let userToken = req.token;

            let { rating, review } = req.body;

            let save: any = {};
            save.userId = userToken._id;
            save.rating = rating ? rating : "";
            save.review = review ? review : "";

            console.log(save);

            let addRateReview = new rateAndReviewModel(save);
            let result = await addRateReview.save();

            console.log(result);

            if (result) {

                res.send({
                    message: config.CONSTANT.MESSAGES.SUCCESS.RATE_REVIEW,
                    response: result
                });
            }
            else {
                res.send(config.CONSTANT.MESSAGES.ERROR.INTERNAL_SERVER_ERROR);
            }
        }
        else {
            res.send(config.CONSTANT.MESSAGES.ERROR.USER_NOT_FOUND);
        }

    }
    catch (error) {
        throw error;
    }
};
/**
 * 
 * @param req 
 * @param res 
 * @param next 
 */
const getAverageRatingWithStars = async (req: any, res: Response, next: NextFunction) => {
    try {
        let aggpipe: any = [];

        let group1: any = {};
        group1._id = "$rating";
        group1.count = { $sum: 1 };
        // group1.avg = { $avg: "$rating" }

        // aggpipe.push({ "$group": group1 });

        // let sort1: any = {};
        // sort1.rating = { "$rate": -1 }

        // aggpipe.push({ "$sort": sort1 })

        aggpipe.push({
            "$facet": {

                data: [
                    { "$group": group1 },
                    { "$avg": "$rating" }
                ],

                metadata: [
                    { "$count": "total" }
                ]
            }

        });


        let result = await rateAndReviewModel.aggregate(aggpipe);

        if (result) {
            res.send({
                message: config.CONSTANT.MESSAGES.SUCCESS.GET_RATE_REVIEW,
                response: result
            });
        } else {
            res.send(config.CONSTANT.MESSAGES.ERROR.INTERNAL_SERVER_ERROR);
        }




    }
    catch (error) {
        throw error;

    }

}

/**
* @Function RATE AND REVIEW =>GET.
**/
const getAllUserRatingWithReview = async (req: any, res: Response, next: NextFunction) => {
    try {

        let { pageNo, limit } = req.body;

        let aggPipe: any = [];

        aggPipe.push({ "$addFields": { created: { "$subtract": ["$createdAt", new Date("1970-01-01")] } } });

        let lookup = {
            "from": "users",
            "localField": "userId",
            "foreignField": "_id",
            "as": "rating_reviews"
        };
        aggPipe.push({ "$lookup": lookup });


        aggPipe.push({ "$unwind": "$rating_reviews" });

        let project1: any = {};
        project1._id = 0;
        project1.userName = "$rating_reviews.userName";
        project1.profilePic = "$rating_reviews.profilePicture";
        project1.rate = "$rate";
        project1.review = "$review";
        project1.createdAt = "$createdAt";

        aggPipe.push({ "$project": project1 });


        // let match1: any = {};
        // match1.review = { $elemMatch: { $gt: 0 } };

        // aggPipe.push({ "$match": match1 })

        //here we will check pagination data ------
        if (limit) {
            //Math.abs(limit) will 
            limit = Math.abs(limit);

            // If limit exceeds max limit
            if (limit > 100) {
                limit = 100;
            }
        } else {
            limit = 10;
        }
        //pageNo will not be negative
        if (pageNo && (pageNo !== 0)) {
            pageNo = Math.abs(pageNo);
        } else {
            pageNo = 1;
        }

        let skip = (limit * (pageNo - 1));
		/**
		 * let fill the data for query----------
		 */
        let query = aggPipe || [];

        query.push({
            "$facet": {

                data: [
                    { "$skip": skip },
                    { "$limit": limit },
                ],


                metadata: [
                    { "$count": "total" }
                ]
            }

        });

        let result = await rateAndReviewModel.aggregate(query);
        let responseData = {
            "data": result[0]["data"],
            "total": result[0]["metadata"] && result[0]["metadata"][0] ? result[0]["metadata"][0]["total"] : 0
        };

        console.log(responseData);

        if (responseData) {

            res.send({
                message: config.CONSTANT.MESSAGES.SUCCESS.GET_RATE_REVIEW,
                response: responseData
            })

        } else {
            res.send(config.CONSTANT.MESSAGES.ERROR.INTERNAL_SERVER_ERROR);

        }
    }
    catch (error) {
        throw new error;
    }


}



/**
 * @Here Module-2 API'S 
 */
export const appController = {
    rateAndReview: rateAndReview,
    getAllUserRatingWithReview: getAllUserRatingWithReview,
    getAverageRatingWithStars: getAverageRatingWithStars
};
