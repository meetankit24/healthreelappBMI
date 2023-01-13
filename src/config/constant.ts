"use strict";

const HTTP_STATUS_CODE = {
	OK: 200,
	CREATED: 201,
	UPDATED: 202,
	NO_CONTENT: 204,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	PAYMENY_REQUIRED: 402,
	ACCESS_FORBIDDEN: 403,
	URL_NOT_FOUND: 404,
	METHOD_NOT_ALLOWED: 405,
	UNREGISTERED: 410,
	PAYLOAD_TOO_LARGE: 413,
	UNPROCESSABLE_ENTITY: 422,
	CONCURRENT_LIMITED_EXCEEDED: 429,
	// TOO_MANY_REQUESTS: 429,
	INTERNAL_SERVER_ERROR: 500,
	BAD_GATEWAY: 502,
	SHUTDOWN: 503,
	// custom
	INVALID_TOKEN: 419,
	SESSION_EXPIRED: 423, // LOGIN_SESSION_EXPIRED
	SOCIAL_ACCOUNT_ALREADY_EXIST: 424
};

const ACCOUNT_LEVEL = {
	ADMIN: "admin",
	USER: "user"
};

const DB_MODEL_REF = {
	ADMIN: "admin",
	ADMIN_NOTIFICATION: "admin_notification",
	CONTACT: "contact",
	CONTENT: "content",
	COUPON: "coupon",
	LOG: "log",
	NOTIFICATION: "notification",
	USER: "user",
	LOGIN_HISTORY: "login_history",
	VERSION: "version"
};

const DEVICE_TYPE = {
	ANDROID: "android",
	IOS: "ios",
	WEB: "web",
	ALL: "all"
};

const ADMIN_TYPE = {
	SUPER_ADMIN: "super",
	SUB_ADMIN: "sub"
};

const GENDER = {
	MALE: "male",
	FEMALE: "female",
	ALL: "all"
};

const SOCIAL_LOGIN_TYPE = {
	FACEBOOK: "facebook",
	GOOGLE: "google",
	INSTA: "instagram",
	TWITTER: "twitter",
	LINKED_IN: "linkedin"
};

const STATUS = {
	BLOCKED: "blocked",
	UN_BLOCKED: "unblocked",
	DELETED: "deleted"
};
const MEMBERSHIP = {
	FREEMIUM: "freemium",
	PREMIUM: "premium"
}
const DIABETIC_STATUS = {

	YES: "yes",
	NO: "no"
};

const RACIAL_BACKGROUND = {
	WHITE: "white",
	BLACK: "black",
	HISPANIC: "hispanic",
	ASIAN: "asian",
	MULTIRACIAL: "multiracial",
	OTHERS: "others"

};
const RATE = {
	S1: 1,
	S2: 2,
	S3: 3,
	S4: 4,
	S5: 5,

}
const VALIDATION_CRITERIA = {
	FIRST_NAME_MIN_LENGTH: 3,
	FIRST_NAME_MAX_LENGTH: 10,
	MIDDLE_NAME_MIN_LENGTH: 3,
	MIDDLE_NAME_MAX_LENGTH: 10,
	LAST_NAME_MIN_LENGTH: 3,
	LAST_NAME_MAX_LENGTH: 10,
	NAME_MIN_LENGTH: 3,
	COUNTRY_CODE_MIN_LENGTH: 1,
	COUNTRY_CODE_MAX_LENGTH: 4,
	PASSWORD_MIN_LENGTH: 3,
	PASSWORD_MAX_LENGTH: 30
};

const MESSAGES = {
	ERROR: {
		EMAIL_ALREADY_EXIST: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "User with this email is already registered.",
			"type": "EMAIL_ALREADY_EXIST"
		},
		MOBILE_NO_ALREADY_EXIST: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "User with this mobile number is already registered.",
			"type": "MOBILE_NO_ALREADY_EXIST"
		},
		MOBILE_NO_NOT_REGISTERED: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Please register your mobile number.",
			"type": "MOBILE_NO_NOT_REGISTERED"
		},
		MOBILE_NOT_VERIFY: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Before login you need to verify your mobile number.",
			"type": "MOBILE_NO_NOT_VERIFY"
		},
		WRONG_PIN_NUMBER: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"message": " You entered wrong pin.",
			"type": "WRONG_PIN_NUMBER"
		},

		EMAIL_OR_PHONE_REQUIRED: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Email or phone number is required.",
			"type": "EMAIL_OR_PHONE_REQUIRED"
		},
		REFRESH_TOKEN_REQUIRED: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Refresh token is required.",
			"type": "REFRESH_TOKEN_REQUIRED"
		},
		EMPTY_FILE: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Please choose file or image.",
			"type": "EMPTY_FILE"
		},
		INVALID_REFRESH_TOKEN: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Invalid refresh token.",
			"type": "INVALID_REFRESH_TOKEN"
		},
		UNAUTHORIZED_ACCESS: {
			"statusCode": HTTP_STATUS_CODE.UNAUTHORIZED,
			"message": "You are not authorized to perform this action.",
			"type": "UNAUTHORIZED_ACCESS"
		},
		INTERNAL_SERVER_ERROR: {
			"statusCode": HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
			"message": "Please try after some time.",
			"type": "INTERNAL_SERVER_ERROR"
		},
		INVALID_TOKEN: {
			// "statusCode": HTTP_STATUS_CODE.INVALID_TOKEN,
			"statusCode": HTTP_STATUS_CODE.UNAUTHORIZED,
			"message": "Token is invalid.",
			"type": "INVALID_TOKEN"
		},
		TOKEN_EXPIRED: {
			"statusCode": HTTP_STATUS_CODE.INVALID_TOKEN,
			"message": "Token has been expired.",
			"type": "TOKEN_EXPIRED"
		},
		TOKEN_GENERATE_ERROR: (error: any) => {
			return {
				"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
				"message": `${error}.`,
				"type": "TOKEN_GENERATE_ERROR"
			};
		},
		EMAIL_NOT_REGISTERED: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Please register your email address.",
			"type": "EMAIL_NOT_REGISTERED"
		},
		BLOCKED: {
			"statusCode": HTTP_STATUS_CODE.UNAUTHORIZED,
			"message": "Your account have been blocked by admin.",
			"type": "USER_BLOCKED"
		},
		DELETED: {
			statusCode: HTTP_STATUS_CODE.UNAUTHORIZED,
			"message": "Your account have been blocked by admin.",
			type: "DELETED"
		},
		INCORRECT_PASSWORD: {
			"statusCode": HTTP_STATUS_CODE.ACCESS_FORBIDDEN,
			"message": "Authentication failed, wrong password.",
			"type": "INCORRECT_PASSWORD"
		},
		USER_NOT_FOUND: {
			"statusCode": HTTP_STATUS_CODE.UNREGISTERED,
			"message": "User not found.",
			"type": "USER_NOT_FOUND"
		},
		ACCESS_DENIED: {
			"statusCode": HTTP_STATUS_CODE.ACCESS_FORBIDDEN,
			"message": "Access denied.",
			"type": "ACCESS_DENIED"
		},
		INVALID_MOBILE_NUMBER: {
			"statusCode": HTTP_STATUS_CODE.UNAUTHORIZED,
			"message": "Please enter valid mobile number.",
			"type": "INVALID_MOBILE_NUMBER"
		},
		BLOCKED_MOBILE: {
			"statusCode": HTTP_STATUS_CODE.UNAUTHORIZED,
			"message": "Action blocked for illegal use of services.",
			"type": "BLOCKED_MOBILE"
		},
		SESSION_EXPIRED: {
			"statusCode": HTTP_STATUS_CODE.SESSION_EXPIRED,
			"message": "Your login session has been expired.",
			"type": "SESSION_EXPIRED"
		},
		FIELD_REQUIRED: (value: any) => {
			return {
				"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
				"message": value + " must be required.",
				"type": "FIELD_REQUIRED"
			};
		}
	},
	SUCCESS: {
		SIGNUP: {
			"statusCode": HTTP_STATUS_CODE.CREATED,
			"message": "Your account has been created successfully.",
			"type": "SIGNUP"
		},
		LOGIN: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"message": "Logged-In successfully.",
			"type": "LOGIN"
		},
		MOBILE_NO_VERIFY: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"message": "Please check your phone to verify your mobile number.",
			"type": "MOBILE_NO_VERIFY"
		},
		MOBILE_NO_VERIFIED: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"message": "your mobile number has been verified successfully.",
			"type": "MOBILE_NO_VERIFIED"
		},
		VERIFY_EMAIL: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"message": "Please check your e-mail for verify email.",
			"type": "VERIFY_EMAIL"

		},
		VERIFIED_EMAIL: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"message": "your e-mail has been verified successfully.",
			"type": "VERIFIED_EMAIL"

		},

		FORGOT_PASSWORD_ON_EMAIL: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"message": "Please check your e-mail for password reset link.",
			"type": "FORGOT_PASSWORD_ON_EMAIL"
		},
		FORGOT_PASSWORD_ON_PHONE: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"message": "Please check your number for password reset link.",
			"type": "FORGOT_PASSWORD_ON_PHONE"
		},
		FORGOT_PASSWORD_OTP_ON_PHONE: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"message": "4-digit verification code has been sent to your registered mobile number.",
			"type": "FORGOT_PASSWORD_OTP_ON_PHONE"
		},
		CHANGE_FORGOT_PASSWORD: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"message": "Password changed successfully.",
			"type": "CHANGE_FORGOT_PASSWORD"
		},
		LOGOUT: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"message": "Logout successfully.",
			"type": "LOGOUT"
		},
		BLOCK_USER: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"message": "User account successfully blocked.",
			"type": "BLOCK_USER"
		},
		UNBLOCK_USER: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"message": "User account successfully unblocked.",
			"type": "UNBLOCK_USER"
		},
		MULTI_BLOCK_USER: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"message": "Users account successfully blocked.",
			"type": "BLOCK_USER"
		},
		MULTI_UNBLOCK_USER: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"message": "Users account successfully unblocked.",
			"type": "UNBLOCK_USER"
		},
		DELETE_USER: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"message": "User deleted successfully.",
			"type": "DELETE_USER"
		},
		USER_DETAILS: (response) => {
			return {
				"statusCode": HTTP_STATUS_CODE.OK,
				"message": "User details get successfully.",
				"type": "USER_DETAILS",
				"response": response
			}
		},
		USER_UPDATED: {

			"statusCode": HTTP_STATUS_CODE.UPDATED,
			"message": "User details updated successfully.",
			"type": "USER_UPDATED",

		},
		USER_CREATED: {

			"statusCode": HTTP_STATUS_CODE.CREATED,
			"message": "User Profile created successfully.",
			"type": "USER_DETAILS",

		},
		PROFILE: (data: any) => {
			return {
				"statusCode": HTTP_STATUS_CODE.OK,
				"message": "User profile get successfully.",
				"type": "PROFILE",
				"data": data
			}
		},
		RATE_REVIEW: {
			"statusCode": HTTP_STATUS_CODE.CREATED,
			"message": "Thanks for your support.",
			"type": "RATE_REVIEW"

		},
		GET_RATE_REVIEW: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"message": "Rate and reviews get successfully.",
			"type": "GET_RATE_REVIEW"

		},
		IMPORT_USER: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"message": "Users imported successfully.",
			"type": "IMPORT_USER"
		},
		DEFAULT: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"message": "Success",
			"type": "DEFAULT"
		},
		ASSESMENT_UPLOAD: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"message": "Assesment uploaded succesfully.",
			"type": "ASSESMENT_UPLOAD"
		},
		ASSESMENT_GET: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"message": "Assesment get succesfully.",
			"type": "ASSESMENT_GET"
		},

		REFRESH_OTP: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"message": "Verification code refresh successfully",
			"type": "REFRESH_PIN",
		},

		REFRESH_TOKEN: (data: any) => {
			return {
				"statusCode": HTTP_STATUS_CODE.OK,
				"message": "Token refresh successfully",
				"type": "REFRESH_TOKEN",
				"data": data
			};
		}
	}
};

const EMAIL_TEMPLATE = {
	SOCIAL_LINK: {
		FB: "https://www.facebook.com",
		INSTAGRAM: "https://www.instagram.com",
		TWITTER: "https://twitter.com"
	},
	GSG_ADDRESS: "Appinventiv Technologies Pvt. Ltd. B-25 Nr Thomson Reuters, Sector 58, Noida, Uttar Pradesh 201301, India",
	SUBJECT: {
		FORGOT_PWD_EMAIL: "Reset Password Request",
		RESET_PASSWORD: "Reset password link",
		VERIFY_EMAIL: "Verify e-mail address",
		WELCOME: "Welcome to RCC!",
		IMPORT_SHEET_FAILURE: "Import Sheet Failure",
		HEALTH_REPORT_ON_EMAIL: "Health Report"

	},
	
	BCC_MAIL: ["ashish.sisodia@appinventiv.com", "varun.garg@appinventiv.com"],
	FROM_MAIL: "ankitkumarmeet1324@gmail.com"
};

const SMS = {
	TOKEN: "[TOKEN]",
	TEMPLATES: {
		FORGOT_PASSWORD: "Your forgot password link!\
		\nLINK\
		\n \
		\nRegards, \nHealthReel app",
		WELCOME: "Welcome! Thank you for creating Health Reel App user\
		\naccount. You are almost there… To start your service,\
		\nplease enter your Email as EMAIL and password as PASSWORD\
		\nin the below link\
		\nLINK\
		\n \
		\nRegards, \nHealth Reel App Team",
	}
};

const NOTIFICATION_TYPE = {
	BULK_NOTIFICATION: "1",
	ONE_TO_ONE: "2"
};

const SNS_SERVER_TYPE = {
	DEV: "APNS_SANDBOX",
	PROD: "APNS"
};

const CONTENT_TYPE = {
	PRIVACY_POLICY: "1",
	TERMS_AND_CONDITIONS: "2",
	FAQ: "3",
	CONTACT_US: "4",
	ABOUT_US: "5"
};

const REGEX = {
	EMAIL: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,63}$/,
	// EMAIL: /^(([^<>()\[\]\\.,;:\s@']+(\.[^<>()\[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
	/* URL: /^(http?|ftp|https):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|\
		int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/, */
	URL: /^(https?|http|ftp|torrent|image|irc):\/\/(-\.)?([^\s\/?\.#-]+\.?)+(\/[^\s]*)?$/i,
	SSN: /^(?!219-09-9999|078-05-1120)(?!666|000|9\d{2})\d{3}-(?!00)\d{2}-(?!0{4})\d{4}$/, // US SSN
	ZIP_CODE: /^[0-9]{5}(?:-[0-9]{4})?$/,
	PASSWORD: /(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])(?=[^0-9]*[0-9]).{8,}/, // Minimum 6 characters, At least 1 lowercase alphabetical character, At least 1 uppercase alphabetical character, At least 1 numeric character, At least one special character
	COUNTRY_CODE: /^\d{1,4}$/,
	MOBILE_NUMBER: /^\d{6,16}$/,
	STRING_REPLACE: /[-+ ()*_$#@!{}|\/^%`~=?,.<>:;'"]/g,
	MONGO_ID: /^[a-f\d]{24}$/i
};


const PUSH_SENDING_TYPE = {
	SNS: 1,
	FCM: 2,
	APNS: 3
};

const MAIL_SENDING_TYPE = {
	SENDGRID: 1,
	SMTP: 2,
	AMAZON: 3
};

const SMS_SENDING_TYPE = {
	TWILIO: 1,
	AWS_SDK: 2
};

const NOTIFICATION_DATA = {
	BULK_NOTIFICATION: (title: any, message: any) => {
		return {
			"type": NOTIFICATION_TYPE.BULK_NOTIFICATION,
			"message": `${message}`,
			"title": `${title}`
		};
	},
	ONE_TO_ONE: (title: any, message: any) => {
		return {
			"type": NOTIFICATION_TYPE.ONE_TO_ONE,
			"message": `${message}`,
			"title": `${title}`
		};
	}
};

let SOCKET = {
	DEFAULT: {
		CONNECTION: "connection",
		CONNECTED: "connected",
		DISCONNECT: "disconnect",
	},
	TYPE: {
		CONTACT_SYNCING: 1,
		BELL_COUNT: 2
	},
	ERROR: {
		FAILURE_ACKNOWLEDGEMENT: (listner: any) => {
			return {
				"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
				"message": "Message not recveived on server.",
				"type": "FAILURE_ACKNOWLEDGEMENT",
				"data": {
					"listner": listner
				}
			};
		},
		INVALID_LISTENER_TYPE: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Invalid Listener type.",
			"type": "INVALID_LISTENER_TYPE",
			"data": {}
		},
		AUTHORIZATION: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Error in authorization.",
			"type": "AUTHORIZATION_ERROR",
			"data": {}
		},
		NETWORK: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Implementation error.",
			"type": "NETWORK_ERROR",
			"data": {}
		},
		SOCKET: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Socket Implementation error.",
			"type": "SOCKET_ERROR",
			"data": {}
		}
	},
	SUCCESS: {
		CONNECTION_ESTABLISHED: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"message": "Connection Established",
			"data": {}
		},
		CONTACT_SYNCING: (data: { statusCode: any; contacts: any; lastSno: any; }) => {
			return {
				"statusCode": data.statusCode,
				"message": "Contacts synchronize successfully.",
				"type": "CONTACT_SYNCING",
				"data": {
					"contacts": data.contacts,
					"lastSno": data.lastSno
				}
			};
		}
	},
	EVENT: {
		NETWORK_ERROR: "network-error",
		SOCKET_ERROR: "socket-error",
		ACK_ERROR: "ack-error",
		INSUFFICIENT_INFO_ERROR: "insufficient-info",
		AUTHORIZATION_ERROR: "authorization-error",
		CONTACT_SYNC: "contact-sync", // add
		CONTACT_FETCH: "contact-fetch",
		CONTACT_DELETE: "contact-delete",
		CONTACT_UPDATE: "contact-update",
		BELL_COUNT: "bell-count"
	}
};

const LOG_HISTORY_TYPE = {
	ADD_USER: "1",
	EDIT_USER: "2",
	DELETE_USER: "3",
	BLOCK_USER: "4",
	UNBLOCK_USER: "5"
};

const TEMPLATES = {
	FAQ: (question: any, answer: any) => {
		return `<div class="coll-box">
			<div class="col-header clearfix">
			<span><img src="./public/images/plus.svg" > </span>
			<h3>
			${question}
				</h3>
				</div>
				<div class= "col-content hide-col-con">
				${answer} </div>
			</div>`;
	}
};

const GRAPH_TYPE = {
	DAILY: "DAILY",
	WEEKLY: "WEEKLY",
	MONTHLY: "MONTHLY",
	YEARLY: "YEARLY"
};

const MONTHS = [
	{ index: 1, day: 31, week: 5 },
	{ index: 2, day: 28, week: 4 },
	// { index: 2, day: 29, week: 5 },
	{ index: 3, day: 31, week: 5 },
	{ index: 4, day: 30, week: 5 },
	{ index: 5, day: 31, week: 5 },
	{ index: 6, day: 30, week: 5 },
	{ index: 7, day: 31, week: 5 },
	{ index: 8, day: 31, week: 5 },
	{ index: 9, day: 30, week: 5 },
	{ index: 10, day: 31, week: 5 },
	{ index: 11, day: 30, week: 5 },
	{ index: 12, day: 31, week: 5 }
];

const MONTH_NAME = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

const JOB_SCHEDULER_TYPE = {
	AUTO_SESSION_EXPIRE: "AUTO_SESSION_EXPIRE"
};

export const CONSTANT = Object.freeze({

	HTTP_STATUS_CODE: HTTP_STATUS_CODE,
	ACCOUNT_LEVEL: ACCOUNT_LEVEL,
	DB_MODEL_REF: DB_MODEL_REF,
	DEVICE_TYPE: DEVICE_TYPE,
	ADMIN_TYPE: ADMIN_TYPE,
	GENDER: GENDER,
	SOCIAL_LOGIN_TYPE: SOCIAL_LOGIN_TYPE,
	MEMBERSHIP: MEMBERSHIP,
	RATE: RATE,
	DIABETIC_STATUS: DIABETIC_STATUS,
	RACIAL_BACKGROUND: RACIAL_BACKGROUND,
	STATUS: STATUS,
	VALIDATION_CRITERIA: VALIDATION_CRITERIA,
	MESSAGES: MESSAGES,
	EMAIL_TEMPLATE: EMAIL_TEMPLATE,
	SMS: SMS,
	NOTIFICATION_TYPE: NOTIFICATION_TYPE,
	SNS_SERVER_TYPE: SNS_SERVER_TYPE,
	CONTENT_TYPE: CONTENT_TYPE,
	REGEX: REGEX,

	PUSH_SENDING_TYPE: PUSH_SENDING_TYPE,
	MAIL_SENDING_TYPE: MAIL_SENDING_TYPE,
	SMS_SENDING_TYPE: SMS_SENDING_TYPE,
	NOTIFICATION_DATA: NOTIFICATION_DATA,
	SOCKET: SOCKET,
	LOG_HISTORY_TYPE: LOG_HISTORY_TYPE,
	TEMPLATES: TEMPLATES,
	GRAPH_TYPE: GRAPH_TYPE,
	MONTHS: MONTHS,
	MONTH_NAME: MONTH_NAME,
	JOB_SCHEDULER_TYPE: JOB_SCHEDULER_TYPE,
	DEFAULT_PASSWORD: "String@123"
});