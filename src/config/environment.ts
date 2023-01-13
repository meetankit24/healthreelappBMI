
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import * as config from '../config/constant'

const ENVIRONMENT = process.env.NODE_ENV;//|| "development";

switch (ENVIRONMENT) {
	case "dev":
	case "development": {
		if (fs.existsSync(path.join(process.cwd(), "/.env.development"))) {
			dotenv.config({ path: ".env.development" });
		} else {
			console.log("Unable to find Environment File");
			process.exit(1);
		}
		break;
	}
	case "stag":
	case "staging": {
		if (fs.existsSync(path.join(process.cwd(), "/.env.staging"))) {
			dotenv.config({ path: ".env.staging" });
		} else {
			process.exit(1);
		}
		break;
	}
	case "local": {
		if (fs.existsSync(path.join(process.cwd(), "/.env.local"))) {
			dotenv.config({ path: "/.env.local" });
		} else {
			process.exit(1);
		}
		break;
	}
	default: {
		if (fs.existsSync(path.join(process.cwd(), "/.env.local"))) {
			console.log("running on local machine ")
			dotenv.config({ path: ".env.local" });
		} else {
			process.exit(1);
		}
	}
}

export const SERVER = Object.freeze({
	UPLOAD_DIR: process.cwd() + "/uploads/",
	LOGIN_TOKEN_EXPIRATION_TIME: 10 * 24 * 60 * 60 * 1000, // 10 days
	TEMPLATE_PATH: process.cwd() + "/src/views/",

	JWT_CERT_KEY: "Rockon",
	SALT_ROUNDS: 10,
	// for private.key file use RS256, SHA256, RSA
	JWT_ALGO: "HS256", // HS384
	//CHUNK_SIZE: 100,
	APP_URL: process.env["APP_URL"],
	ADMIN_URL: process.env["ADMIN_URL"],
	API_BASE_URL: "/api",
	MONGO: {
		DB_NAME: process.env["DB_NAME"],
		DB_URL: process.env["DB_URL"],
		DB_AUTH_URL: process.env["DB_AUTH_URL"],
		OPTIONS: {
			useNewUrlParser: true,
			useCreateIndex: true,
			useUnifiedTopology: true,
			useFindAndModify: false
		}
	},
	ADMIN_CREDENTIALS: {
		EMAIL: "admin@rcc.com",
		PASSWORD: "admin@123",
		NAME: "User"
	},
	REDIS: {
		SERVER: "localhost",
		PORT: 6379,
		NAMESPACE: "rccapp",
		APP_NAME: "rcc"
	},
	MAIL: {
		SENDGRID: {
			API_USER: "rajat_maheshwari",
			API_KEY: "Rajat@123"
		},
		SMTP: {
			HOST: "smtp.gmail.com",
			PORT: "465",
			USER: "ankitkumarmeet1324@gmail.com",
			PASSWORD: "ankitkumarMeet@24"
		}
	},

	TWILIO: {
		ACCOUNT_SID: "AC56bfe4ab8e7343b948146e6d9aa9799d",
		AUTH_TOKEN: "2cfa0e7fd275a92fe967bbd3a42946f3",
		TWILIO_NUMBER: "+1 206 823 2184"
		// SERVICE_ID:         //"VA1b2d6e30c7a640598c148f944ada004e",   //"VAd7e0b06596463c2f0749f28bf9cc576b"
		// 	ACCOUNT_SID:        //"AC24a97d261730ebae7fe571685e387ca3",//"AC08beaf98fbae839300eec337823f91ac", //"VA325d8d2ac1c6f2eb6efa1c7c8467b20d",//process.env["ACCOUNT_SID"],
		// AUTH_TOKEN:         //"438fbe164ccf164dc7280574253b374d",//"4044a2664c3f01c35166f6efa2ad64b4",// process.env["AUTH_TOKEN"],
		// 	TWILIO_NUMBER: "+12058392820" //"+12564154430"  // process.env["TWILIO_NUMBER"]
	},
	BASIC_AUTH: {
		NAME: "rcc",
		PASS: "rcc@123"
	},
	API_KEY: "1234",

	AWS_IAM_USER: {
		ACCESS_KEY_ID: "AKIAV4F24LSAKTD6RQN6",// process.env["AWS_ACCESS_KEY"],
		SECRET_ACCESS_KEY: "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",// process.env["AWS_SECRET_KEY"]
	},
	SNS: {
		ACCESS_KEY_ID: process.env["SNS_ACCESS_KEY_ID"],
		SECRET_ACCESS_KEY: process.env["SNS_SECRET_ACCESS_KEY"],
		ANDROID_ARN: process.env["SNS_ANDROID_ARN"],
		IOS_ARN: process.env["SNS_IOS_ARN"],
		API_VERSION: process.env["SNS_API_VERSION"],
		REGION: process.env["SNS_REGION"],
		TOPIC_ARN: process.env["TOPIC_ARN"],
		PROTOCOL: process.env["SNS_PROTOCOL"]
	},
	// option parameters constantys for s3
	S3: {
		MAX_ASYNC_S3: process.env["MAX_ASYNC_S3"], // this is the default
		S3_RETRY_COUNT: process.env["S3_RETRY_COUNT"], // this is the default
		S3_RETRY_DELAY: process.env["S3_RETRY_DELAY"], // this is the default
		MULTIPART_UPLOAD_THREASHOLD: process.env["MULTIPART_UPLOAD_THREASHOLD"], // this is the default (20 MB)
		MULTIPART_UPLOAD_SIZE: process.env["MULTIPART_UPLOAD_SIZE"], // this is the default (15 MB)
		BUCKET_NAME: process.env["S3_BUCKET_NAME"],
		PUBLIC_BUCKET_NAME: "myhealthreelapp",                          //process.env["PUBLIC_BUCKET_NAME"],
		SIGNATURE_VERSION: process.env["SIGNATURE_VERSION"],
		REGION: "ap-south-1",//process.env["S3_REGION"],
		ACL: "public-read",// process.env["ACL"]
	},
	ENVIRONMENT: process.env["NODE_ENV"],
	IP: process.env["IP"],
	PORT: process.env["PORT"],
	ADMIN_PORT: process.env["ADMIN_PORT"],
	PROTOCOL: process.env["PROTOCOL"],
	TAG: process.env["TAG"],
	FCM_SERVER_KEY: "AAAAhf2dpVQ:APA91bHc6ifocJQfUn_loOOiQPOaea4W7zXEqIZ52V1yf-vDbJREkx8Wdb7FzSWYAgWpd22wKpwsDG8XdHR6MpaO9NED89yiND551uNVWVRO_pUUD0me1ioES75tRg0GS7bss81-yiXJ",  //process.env["FCM_SERVER_KEY"],

	// "AAAAJj5DUu8:APA91bHGrBG7gHFm6fye47UFrNMuW_LUMr7aswSeuLEuqoq9bk4mmY4QShOmxBoCHvSFoAeL9zIpFTBp_tzxyfNLXDIMw060g4V-FDvf-rqpk6mpHqOz11ZIgCHDsIobOEHq8Q7m2QyS",
	GOOGLE_API_KEY: process.env["GOOGLE_API_KEY"],
	PUSH_TYPE: config.CONSTANT.PUSH_SENDING_TYPE.FCM,
	MAIL_TYPE: config.CONSTANT.MAIL_SENDING_TYPE.SMTP,
	IS_REDIS_ENABLE: false

});