// /lib/routes/crmRoutes.ts
import { Request, Response } from "express";
import { appController } from "../controllers/appController";
import { validateToken } from "../middlewares/user-Auth";


export class appRoutes {

    public routes(app: any): void {

        /***
         *@Base ROUTE FOR TESTING
         **/
        app.route('/app-base-route')
            .get((req: Request, res: Response) => {
                res.status(200).send({
                    message: "Your server's first request run successfulll!!!!"
                })
            });

        /***
  *@RATE AND REVIEW POST ROUTE 
  **/
        app.route('/api/app/user-rating-review')
            .post(validateToken, appController.rateAndReview)
            .get(appController.getAllUserRatingWithReview);

        /***
    *@RATE AND REVIEWS ON THE BASIS OF AVERAGE AND STARS------ 
    **/
        app.route('/api/app/rating-review-stars')
            .get(appController.getAverageRatingWithStars);

    }


}

/********************************************************************* */