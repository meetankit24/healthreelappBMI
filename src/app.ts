"user strict";
// lib/app.ts
import * as express from "express";
import * as dotenv from 'dotenv';
import * as session from 'express-session';
import * as mongoose from "mongoose";
import * as bodyParser from "body-parser";
// import * as ejs from 'ejs'
import * as path from 'path';
import { userRoutes } from "./routes/userRoutes";
import { adminRoutes } from './routes/adminRoute';
import { appRoutes } from './routes/appRoutes';

class App {

    public app: express.Application;
    public routePrv: userRoutes = new userRoutes();
    public routePrv1: adminRoutes = new adminRoutes();
    public routePrv2: appRoutes = new appRoutes();

    // public mongoUrl: string = 'mongodb://127.0.0.1:27017/HealthReal';  


    constructor() {
        this.app = express();
        this.config();
        this.routePrv.routes(this.app);
        this.routePrv1.routes(this.app);
        this.routePrv2.routes(this.app);
        // this.mongoSetup();  
        this.setEnvironment();

    }
    /**
     * app environment configuration
     */
    private setEnvironment(): void {
        dotenv.config({ path: '.env' });
    }

    // private mongoSetup(): void{
    //     mongoose.set('useCreateIndex', true)
    //     // mongoose.Promise = global.Promise;
    //     mongoose.connect(this.mongoUrl, {
    //         useNewUrlParser: true,
    //         useUnifiedTopology: true
    //     });

    //     mongoose.connection.on('connected', () => {
    //         console.log('MongoDB connected successfully.');
    //         //process.exit();
    //     });

    //     mongoose.connection.on('error', () => {
    //         console.log('MongoDB connection error. Please make sure MongoDB is running.');
    //         process.exit();
    //     });   
    // }

    private config(): void {

        this.app.use(function (req, res, next) {
            console.log("/" + req.method + "   " + req.url);
            next();
        });
       
        // support application/json type post data

        this.app.use(bodyParser.json());

        //support application/x-www-form-urlencoded post data

        this.app.use(bodyParser.urlencoded({ extended: false }));

        //Prevents from CORS ERROR

        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'OPTIONS,GET,PUT,POST,DELETE');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            if (req.method === 'OPTIONS') {
                res.status(200).send();
            } else {
                next();
            }
        });
        //here we will use session
        this.app.use(session({
            secret: '2:P6)<VR#WXytKw$',
            resave: true,
            saveUninitialized: true
        }));

    }

}

export default new App().app;