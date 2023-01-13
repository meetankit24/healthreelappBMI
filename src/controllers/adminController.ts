"use strict";
import { admins, encryptPassword, validUSerPassword, IAdmin } from '../models/adminModel';
import { admin_notifications } from '../models/adminNotificationModel';
import { notification_chunks } from '../models/notificationChunk'
import { appVideoModel, AppVideo } from '../models/appVideo';
import { NextFunction } from 'express';
import * as constant from '../config/adminConstant'
import * as jwt from 'jsonwebtoken';
import * as envSecret from '../config/environment'
import * as config from '../config/constant';
import * as adminNotificationConstant from '../config/adminNotificationConstant'
import * as appUtils from "../utils/appUtils";
import { param } from 'express-validator';
// import { MailManager } from "../taskmanager/mailmanager";
import { pushNotification } from '../taskmanager/pushManager'
// let mailManager = new MailManager();

/**
 * @CREATE NEW ADMIN
 * @param req 
 * @param res 
 * @param next 
 */
const createAdmin = async (req: any, res: any, next: NextFunction) => {
	try {

		let { adminName, email, password, adminType } = req.body,
			{ platform }: any = req.headers,
			remoteAddress: any = req.header('x-forwarded-for') || req.connection.remoteAddress,
			loginAttempts: any = {
				platform,
				remoteAddress
			}



		let query: any = {};
		query.email = email;

		let projection: any = {};

		let options: any = {};
		options.lean = true;

		let isEmailExist = await admins.findOne(query, projection, options);

		if (isEmailExist) {

			res.send(constant.MESSAGES.ERROR.EMAIL_ALREADY_EXIST);

		} else {
			console.log("No Admin present!");

			let hashed_password: any = await encryptPassword(password);

			let data_to_save: any = {
				adminName: adminName,
				email: email,
				hash: hashed_password,
				loginAttempts: loginAttempts,
				isLogin: true,
				lastLogout: Date.now(),
			};

			console.log(data_to_save);

			let data_to_insert: IAdmin = new admins(data_to_save);
			let admin_result: IAdmin = await data_to_insert.save();

			console.log(admin_result);

			if (admin_result) {

				res.send({
					message: constant.MESSAGES.SUCCESS.CREATE_ADMIN,
					response: admin_result,
				});
			}
			else {
				res.send(constant.MESSAGES.ERROR.INTERNAL_SERVER_ERROR);
			}
		}
	}
	catch (error) {
		throw error;
	}
}

/**
 * @FORGOT PASSWORD
 * @param req 
 * @param res 
 * @param next 
 */
const forgotPassword = async (req: any, res: any, next: NextFunction) => {
	try {
		let { email, countryCode, mobileNo } = req.body;

		console.log(req.body);

		let query: any = {};
		query["$or"] = [{ email: email }, { countryCode: countryCode, mobileNo: mobileNo }];
		query.status = { "$ne": config.CONSTANT.STATUS.DELETED };

		let projection: any = {};

		let options: any = {};
		options.lean = true;

		let isAdminExist = await admins.findOne(query, projection, options);

		console.log(isAdminExist)

		if (isAdminExist) {

			if (isAdminExist.status === config.CONSTANT.STATUS.BLOCKED) {

				res.send(config.CONSTANT.MESSAGES.ERROR.BLOCKED);

			} else {
				let payload = {
					_id: isAdminExist._id,
					name: isAdminExist.adminName,
					email: isAdminExist.email
				};
				let forgot_accessToken = await jwt.sign(payload, envSecret.SERVER.JWT_CERT_KEY,
					{
						algorithm: "HS256",
						expiresIn: Math.floor(Date.now() / 1000) + (60 * 15)   //hardly 10 minutes
					});
				let receiverName = isAdminExist.adminName;
				// let sendMail = mailManager.sendForgotPasswordEmail({ "email": email, "userName": receiverName, "accessToken": forgot_accessToken });

				// if (sendMail) {
				res.send(config.CONSTANT.MESSAGES.SUCCESS.FORGOT_PASSWORD_ON_EMAIL);
				// } else {
				// 	res.send(config.CONSTANT.MESSAGES.ERROR.INTERNAL_SERVER_ERROR);
				// }
			}
		}
		else {
			return res.send(config.CONSTANT.MESSAGES.ERROR.EMAIL_NOT_REGISTERED);
		}
	} catch (error) {
		throw error;
	}
};
/**
 * @CHANGE FORGOT PASSWORD
 * @param req 
 * @param res 
 * @param next 
 */
const changeForgotPassword = async (req: any, res: any, next: NextFunction) => {
	try {
		let userToken: any = req.token;

		let query: any = {};
		query._id = userToken._id;
		query.status = { "$ne": config.CONSTANT.STATUS.DELETED };

		let projection: any = { accessToken: 0 };

		let options: any = {};

		let isAdminExist = await admins.findOne(query, projection, options);

		if (isAdminExist) {

			let newPassword: any = req.body.newPassword ? req.body.newPassword : new Error("Oops! Please Enter your password.");
			//console.log(newPassword)
			let hashed_password: any = await encryptPassword(newPassword);

			console.log(hashed_password);

			let query: any = {};
			query._id = userToken._id;

			let update: any = {};
			update["$set"] = { hash: hashed_password };

			let options: any = {};
			options.upsert = true;

			let update_admin_password: any = await admins.updateOne(query, update, options);

			console.log(update_admin_password);

			if (update_admin_password) {

				res.send(config.CONSTANT.MESSAGES.SUCCESS.CHANGE_FORGOT_PASSWORD);
			}
			else {
				res.send(config.CONSTANT.MESSAGES.ERROR.INTERNAL_SERVER_ERROR);
			}
		} else {
			res.send(config.CONSTANT.MESSAGES.ERROR.USER_NOT_FOUND)
		}
	} catch (error) {
		throw error;
	}
};

/**
 * 
 * @param req 
 * @param res 
 * @param next 
 */
const adminLogin = async (req: any, res: any, next: NextFunction) => {
	try {
		let { email, password } = req.body;
		let query: any = {};
		query.email = email;
		query.status = { "$ne": config.CONSTANT.STATUS.DELETED };

		let projection: any = {};

		let options: any = {};

		let isAdminExist = await admins.findOne(query, projection, options);

		if (isAdminExist) {

			if (isAdminExist.status === config.CONSTANT.STATUS.BLOCKED) {

				res.send(config.CONSTANT.MESSAGES.ERROR.BLOCKED);

			} else {
				let dbHash = isAdminExist.hash;
				let decrypt = await validUSerPassword(password, dbHash);

				if (!decrypt) {
					return res.send(config.CONSTANT.MESSAGES.ERROR.INCORRECT_PASSWORD);
				} else {

					let payload = {
						_id: isAdminExist._id,
						name: isAdminExist.adminName,
						adminType: isAdminExist.adminType,
						email: isAdminExist.email
					};
					let accessToken = await jwt.sign(payload, envSecret.SERVER.JWT_CERT_KEY,
						{
							algorithm: "HS256",
							expiresIn: Math.floor(Date.now() / 1000) + (60 * 15)   //hardly 10 minutes
						});

					// let loginObj = {
					// 	"userId": step1._id,
					// 	"accessToken": step2,
					// 	"remoteAddress": params.remoteAddress,
					// 	"platform": params.platform
					// };
					// let updateLoginHistory = await adminDao.updateLoginHistory(loginObj);

					res.status(config.CONSTANT.HTTP_STATUS_CODE.OK).json({
						message: config.CONSTANT.MESSAGES.SUCCESS.LOGIN,
						response: isAdminExist,
						token: accessToken
					});

				}
			}
		}
		else {
			return res.send(config.CONSTANT.MESSAGES.ERROR.EMAIL_NOT_REGISTERED);
		}
	} catch (error) {
		throw error;
	}
};

/**
 * @lOGOUT ADMIN
 * @param req 
 * @param res 
 * @param next 
 */
const logout = async (req: any, res: any, next: NextFunction) => {
	try {
		let userToken: any = req.token;

		let query: any = {};
		query._id = userToken._id;

		let update: any = {};
		update["$set"] = {
			"isLogin": false,
			"lastLogout": Date.now()
		};
		update["$unset"] = { accessToken: "" };

		let options: any = {};

		let logOut = await admins.findOneAndUpdate(query, update, options);

		if (logOut) {
			return res.send(config.CONSTANT.MESSAGES.SUCCESS.LOGOUT);
		}
		else {
			return res.send(config.CONSTANT.MESSAGES.ERROR.INTERNAL_SERVER_ERROR);
		}
	}
	catch (error) {
		throw error;
	}
};

/**
 * @CHANGE PASSWORD
 * @param req 
 * @param res 
 * @param next 
 */
const changePassword = async (req: any, res: any, next: NextFunction) => {
	try {
		let userToken: any = req.token;

		let query: any = {};
		query._id = userToken._id;
		query.status = { "$ne": config.CONSTANT.STATUS.DELETED };

		let projection: any = { accessToken: 0 };

		let options: any = {};

		let isAdminExist = await admins.findOne(query, projection, options);

		if (isAdminExist) {

			let dbhash = isAdminExist.hash;

			let { oldPassword, newPassword } = req.body;

			console.log(req.body);

			let decrypt: any = await validUSerPassword(oldPassword, dbhash);

			console.log(decrypt);

			if (!decrypt) {

				res.send(config.CONSTANT.MESSAGES.ERROR.INCORRECT_PASSWORD);

			} else {

				let newHash: any = await encryptPassword(newPassword);

				let query: any = {};
				query._id = userToken._id;

				let update: any = {};
				update["$set"] = { hash: newHash };

				let options: any = {};
				options.upsert = true;

				let update_admin_password: any = await admins.updateOne(query, update, options);

				console.log(update_admin_password);

				if (update_admin_password) {

					res.send(config.CONSTANT.MESSAGES.SUCCESS.CHANGE_FORGOT_PASSWORD);
				}
				else {
					res.send(config.CONSTANT.MESSAGES.ERROR.INTERNAL_SERVER_ERROR);
				}
			}
		} else {
			res.send(config.CONSTANT.MESSAGES.ERROR.USER_NOT_FOUND)
		}
	} catch (error) {
		throw error;
	}
};

/**
 * 
 * @param req 
 * @param res 
 * @param next 
 */
const adminDetails = async (req: any, res: any, next: NextFunction) => {
	try {
		let userToken = req.token;

		let query: any = {};
		query._id = userToken._id;
		query.status = { "$ne": config.CONSTANT.STATUS.DELETED };

		let projection: any = { accessToken: 0 };

		let options: any = {};

		let isAdminExist = await admins.findOne(query, projection, options);

		if (isAdminExist) {
			return res.send(config.CONSTANT.MESSAGES.SUCCESS.PROFILE(isAdminExist));
		} else {
			return res.send(config.CONSTANT.MESSAGES.ERROR.USER_NOT_FOUND);

		}
	} catch (error) {
		throw error;
	}
};

/**
 * 
 * @param req 
 * @param res 
 * @param next 
 */
const editProfile = async (req: any, res: any, next: NextFunction) => {
	try {
		let { newEmail, newName } = req.body;
		let userToken = req.token;

		let query: any = {};
		query._id = userToken._id;

		let update: any = {};
		update["$set"] = {
			"name": newName,
			"email": newEmail
		};

		let options: any = {};
		options.new = true;

		let editAdminProfile = await admins.findOneAndUpdate(query, update, options);

		if (editAdminProfile) {

			res.send(config.CONSTANT.MESSAGES.SUCCESS.USER_UPDATED);

		}
		else {
			res.send(config.CONSTANT.MESSAGES.ERROR.USER_NOT_FOUND)
		}

	} catch (error) {
		throw error;
	}
};

/**
 * 
 * @param req 
 * @param res 
 * @param next 
 */
const dashboard = async (req: any, res: any, next: NextFunction) => {
	try {
		let userToken = req.token;

		let query: any = {};
		query._id = userToken._id;
		query.status = { "$ne": config.CONSTANT.STATUS.DELETED };

		let projection: any = { accessToken: 0 };

		let options: any = {};

		let isAdminExist = await admins.findOne(query, projection, options);

		if (isAdminExist) {
			return res.status(config.CONSTANT.HTTP_STATUS_CODE.OK).json({
				message: constant.MESSAGES.SUCCESS.DASHBOARD,
				response: { "users": 6543, "posts": 23331, "reportedPosts": 4233, "category": 1112, "androidUsers": 4553, "iosUsers": 2343 }
			});

		} else {
			return res.send(config.CONSTANT.MESSAGES.ERROR.USER_NOT_FOUND);

		}
	} catch (error) {
		throw error;
	}
};

/**
 * ADD NOTIFICATION AND SEND NOTIFICATION TO USERS
 * @param req 
 * @param res 
 * @param next 
 */
const adminNotification = async (req: any, res: any, next: NextFunction) => {
	try {

		let adminToken: any = req.token;
		let adminDetail: any = adminToken._id;

		let { title, link, appPlatform, message, fromDate, toDate } = req.body;
		let image = req.file.key;
		console.log(image);

		// add notification
		let data_to_save: any = {
			image: image,
			title: title,
			link: link,
			message: message,
			platform: appPlatform,
			// gender: gender,
			fromDate: new Date(fromDate),
			toDate: new Date(toDate)
		};

		// console.log(data_to_save);
		// yahan data pehle hum "admin_notification" me save karenge
		let data_to_insert = new admin_notifications(data_to_save);
		let addNotification = await data_to_insert.save();

		// console.log(addNotification, "<<<<<<<<<<<<<<<ADMIN NOTIFIATION>>>>>>>>>>>>>>>>>>>>>>");

		//chunkdata me us notification ki id lenge
		let notificationId = addNotification._id;

		//getChunksUser stores arrays of objects of users
		let getUsers: any = await appUtils.getChunksOfUser(data_to_save);

		// console.log(getUsers)

		// separate user data to android user and ios user
		let androidUsers = [],
			iosUsers = [];

		for (let i = 0; i < getUsers.length; i++) {
			if (getUsers[i].platform === config.CONSTANT.DEVICE_TYPE.ANDROID) {
				androidUsers.push({ "userId": getUsers[i]._id, "deviceToken": getUsers[i].deviceToken });   //"arn": step1[i].arn
			}
			if (getUsers[i].platform === config.CONSTANT.DEVICE_TYPE.IOS) {
				iosUsers.push({ "userId": getUsers[i]._id, "deviceToken": getUsers[i].deviceToken });     //"arn": step1[i].arn 
			}
		}
		// separate android user data and ios user data to android user chunks and ios user chunks
		let androidUserChunks = appUtils.splitArrayInToChunks(androidUsers, 5);
		let iosUserChunks = appUtils.splitArrayInToChunks(iosUsers, 5);

		console.log(iosUsers);

		// create android payload
		let androidPushPayload = {
			title: title,
			link: link,
			message: message,
			image: image,
			type: config.CONSTANT.NOTIFICATION_TYPE.BULK_NOTIFICATION,
			priority: "high",
			contentType: image ? "image" : "text",
			category: "action"
		};

		// create ios payload
		let IOSPushPayload = {
			alert: title,
			body: message,
			attachmentUrl: image,
			type: config.CONSTANT.NOTIFICATION_TYPE.BULK_NOTIFICATION,
			mutableContent: req.body.mutableContent ? req.body.mutableContent : 0,
			contentType: image ? "image" : "text",
			category: "action",
			badge: req.body.badge ? req.body.badge : 0,
			threadId: "RichPush",
		};

		// save android chunk data
		let androidResult = await androidUserChunks.map(async (data) => {

			let chunkNoticiationData = {
				"notificationId": notificationId,
				"data": data,
				"payload": androidPushPayload,
				"chunkType": config.CONSTANT.DEVICE_TYPE.ANDROID
			};
			// let sum = 0;
			// console.log(sum++);

			let data_to_insert: any = new notification_chunks(chunkNoticiationData);
			let AddNotification: any = await data_to_insert.save();

			let sendToPushNotificationFunction: any = await pushNotification(chunkNoticiationData);
			console.log(AddNotification);

			return AddNotification && sendToPushNotificationFunction;

		});

		// save ios chunk data
		let iosResult = await iosUserChunks.map(async (data) => {
			// let sum = 0;
			// console.log(sum++);

			let chunkNoticiationData = {
				"notificationId": notificationId,
				"data": data,
				"payload": IOSPushPayload,
				"chunkType": config.CONSTANT.DEVICE_TYPE.IOS
			};
			let data_to_insert: any = new notification_chunks(chunkNoticiationData);
			let AddNotification: any = await data_to_insert.save();

			let sendToPushNotificationFunction: any = await pushNotification(chunkNoticiationData);

			console.log(AddNotification);

			return AddNotification && sendToPushNotificationFunction;

		})
		// console.log(androidResult);

		if (androidResult) {
			// console.log(androidResult);
			res.send({
				// message: adminNotificationConstant.MESSAGES.SUCCESS.SEND_NOTIFICATION,
				statusCode: config.CONSTANT.HTTP_STATUS_CODE.OK,
				message: "Notification added and sent successfully.",
				type: "ADD_AND_SEND_NOTIFICATION",
				response: addNotification
			})
		} else if (iosResult) {
			res.send({
				// message: adminNotificationConstant.MESSAGES.SUCCESS.SEND_NOTIFICATION,
				statusCode: config.CONSTANT.HTTP_STATUS_CODE.OK,
				message: "Notification added and sent successfully.",
				type: "ADD_AND_SEND_NOTIFICATION",
				response: addNotification
			})
		} else {
			res.send(config.CONSTANT.MESSAGES.ERROR.INTERNAL_SERVER_ERROR);
		}
	}
	catch (error) {
		throw error;
	}
}

/**
 * EDIT NOTIFICATION AND SEND NOTIFICATION TO USERS
 * @param req 
 * @param res 
 * @param next 
 */
const editNotification = async (req: any, res: any, next: NextFunction) => {
	try {
		let adminToken: any = req.token;
		let adminDetail: any = adminToken._id;

		let { notificationId } = req.params;

		let { image, title, link, message, appPlatform, fromDate, toDate, gender } = req.body;

		let dataForEdit: any = {
			image: image,
			title: title,
			link: link,
			message: message,
			platform: appPlatform,
			// gender: gender,
			fromDate: new Date(fromDate),
			toDate: new Date(toDate)
		};

		let query: any = {};
		query._id = notificationId;

		let update: any = {};
		update["$set"] = dataForEdit;


		let options: any = {};
		options.new = true;

		let editNotification = await admin_notifications.findOneAndUpdate(query, update, options);

		if (editNotification) {

			// chunkdata me us notification ki id lenge
			let notificationId = editNotification._id;

			//getChunksUser stores arrays of objects of users
			let getUsers: any = await appUtils.getChunksOfUser(dataForEdit);

			// separate user data to android user and ios user
			let androidUsers = [],
				iosUsers = [];

			for (let i = 0; i < getUsers.length; i++) {
				if (getUsers[i].platform === config.CONSTANT.DEVICE_TYPE.ANDROID) {
					androidUsers.push({ "userId": getUsers[i]._id, "deviceToken": getUsers[i].deviceToken });   //"arn": step1[i].arn
				}
				if (getUsers[i].platform === config.CONSTANT.DEVICE_TYPE.IOS) {
					iosUsers.push({ "userId": getUsers[i]._id, "deviceToken": getUsers[i].deviceToken });     //"arn": step1[i].arn 
				}
			}
			// separate android user data and ios user data to android user chunks and ios user chunks
			let androidUserChunks = appUtils.splitArrayInToChunks(androidUsers, 2);
			let iosUserChunks = appUtils.splitArrayInToChunks(iosUsers, 2);

			// create android and ios payload
			let androidPushPayload = {
				title: title,
				link: link,
				message: message,
				image: image,
				type: config.CONSTANT.NOTIFICATION_TYPE.BULK_NOTIFICATION,
				priority: "high",
				contentType: image ? "image" : "text",
				category: "action"
			};

			let IOSPushPayload = {
				alert: title,
				body: message,
				attachmentUrl: image,
				type: config.CONSTANT.NOTIFICATION_TYPE.BULK_NOTIFICATION,
				mutableContent: req.body.mutableContent ? req.body.mutableContent : 0,
				contentType: image ? "image" : "text",
				category: "action",
				badge: req.body.badge ? req.body.badge : 0,
				threadId: "RichPush",
			};

			// save android chunk data
			let androidResult = await androidUserChunks.map(async (data) => {

				let chunkNoticiationData = {
					"notificationId": notificationId,
					"data": data,
					"payload": androidPushPayload,
					"chunkType": config.CONSTANT.DEVICE_TYPE.ANDROID
				};

				let data_to_insert: any = new notification_chunks(chunkNoticiationData);
				let AddNotification: any = await data_to_insert.save();

				let sendToPushNotificationFunction: any = await pushNotification(chunkNoticiationData);
				console.log(AddNotification);

				return AddNotification && sendToPushNotificationFunction;

			});

			// save ios chunk data
			let iosResult = await iosUserChunks.map(async (data) => {

				let chunkNoticiationData = {
					"notificationId": notificationId,
					"data": data,
					"payload": IOSPushPayload,
					"chunkType": config.CONSTANT.DEVICE_TYPE.IOS
				};
				let data_to_insert: any = new notification_chunks(chunkNoticiationData);
				let AddNotification: any = await data_to_insert.save();

				let sendToPushNotificationFunction: any = await pushNotification(chunkNoticiationData);

				console.log(AddNotification);

				return AddNotification && sendToPushNotificationFunction;

			})
			// console.log(androidResult);

			if (androidResult) {
				// console.log(androidResult);
				res.send({
					statusCode: config.CONSTANT.HTTP_STATUS_CODE.OK,
					message: "Notification edited and sent successfully.",
					type: "EDIT_AND_SEND_NOTIFICATION",
					// message: adminNotificationConstant.MESSAGES.SUCCESS.SEND_NOTIFICATION,
					response: editNotification
				})
			} else if (iosResult) {
				res.send({
					// message: adminNotificationConstant.MESSAGES.SUCCESS.SEND_NOTIFICATION,
					statusCode: config.CONSTANT.HTTP_STATUS_CODE.OK,
					message: "Notification edited and sent successfully.",
					type: "EDIT_AND_SEND_NOTIFICATION",
					response: editNotification
				})
			} else {
				res.send(config.CONSTANT.MESSAGES.ERROR.INTERNAL_SERVER_ERROR);
			}
		}
	}
	catch (error) {
		throw error;
	}



}

/**
 * 
 * @param req 
 * @param res 
 * @param next 
 */
const notificationList = async (req: any, res: any, next: NextFunction) => {
	try {
		let { pageNo, limit, searchKey, sortBy, sortOrder } = req.body;
		console.log(req.body);
		/**
		 * let fill the data for aggpipe----------
		 */
		let aggPipe: any = [];

		if (searchKey) {
			let match1: any = {};
			match1.title = { "$regex": searchKey, "$options": "-i" };
			aggPipe.push({ "$match": match1 });
		}

		aggPipe.push({ "$addFields": { created: { "$subtract": ["$createdAt", new Date("1970-01-01")] } } });

		let sort: any = {};
		if (sortBy && sortOrder) {
			if (sortBy === "title") {
				sort = { "title": sortOrder };
			} else if (sortBy === "sentCount") {
				sort = { "sentCount": sortOrder };
			} else {
				sort = { "created": sortOrder };
			}
		} else {
			sort = { "createdAt": -1 };
		}
		aggPipe.push({ "$sort": sort });

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
					{ "$limit": limit }
				],

				metadata: [
					{ "$count": "total" }
				]
			}

		});
		/** It will looks like---------------->>>>>>>>>>
		 *  admin_notifications.aggregate([ { '$addFields': { created: { '$subtract': [ '$createdAt', 1970-01-01T00:00:00.000Z ] } } },
		 *  { '$sort': { createdAt: -1 } }, 
		 * { '$facet': 
		 * { data: [ { '$skip': 0 }, { '$limit': 4 } ],
		 *  metadata: [ { '$count': 'total' } ] } }],
		 *  {})
		 * 
		 */
		const result = await admin_notifications.aggregate(query).exec();

		// // for (let i = 0; i < result.length; i++) {
		// 	console.log("data:"+result[0]["metadata"][0]["total"]);
		// // }
		let responseData = {
			"data": result[0]["data"],
			"total": result[0]["metadata"] && result[0]["metadata"][0] ? result[0]["metadata"][0]["total"] : 0
		};

		if (responseData) {
			console.log(responseData);
			res.send({
				message: adminNotificationConstant.MESSAGES.SUCCESS.NOTIFICATION_LIST,
				response: responseData
			})
		} else {
			res.send(adminNotificationConstant.MESSAGES.ERROR.INTERNAL_SERVER_ERROR);
		}

	}
	catch (error) {
		throw new Error(error);
	}


}
/**
 * @Admin notification details--
 * @param req 
 * @param res 
 * @param next 
 */
const adminNotificationDetails = async (req: any, res: any, next: NextFunction) => {

	try {
		let { notificationId } = req.query;
		let query: any = {};
		query._id = notificationId;

		let projection: any = { created: 0, createdAt: 0 };

		let options: any = {};
		options.lean = true;

		let notification_detail = await admin_notifications.findOne(query, projection, options);

		if (notification_detail) {

			res.status(config.CONSTANT.HTTP_STATUS_CODE.OK).json({
				message: adminNotificationConstant.MESSAGES.SUCCESS.NOTIFICATION_DETAILS,
				response: notification_detail,
			})
		}
		else {
			res.send(config.CONSTANT.MESSAGES.ERROR.INTERNAL_SERVER_ERROR);

		}
	} catch (error) {
		throw error;
	}

}

/**
 * @SENDONE TO ONE NOTIFICATION
 * @param req 
 * @param res 
 * @param next 
 */

const sendOneToOneNotification = async (req: any, res: any, next: NextFunction) => {
	try {
		let adminToken = req.token,
			{ title, link, message } = req.body,
			{ userId } = req.params,
			image = req.file.key;

		// console.log(req.params,"<<<<<<<<<<<<>>>>>>>>>>>>>>>>>")

		let dataParam = {
			title,
			image,
			link,
			message,
			userId
		}
		// console.log(dataParam)

		// if (adminToken.adminType === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN) {

		let singleUserChunk = await appUtils.getSingleChunksOfUser(dataParam);

		console.log(singleUserChunk[0].data[0].platform);

		// separate user data to android user and ios user
		let androidUsers = [],
			iosUsers = [];
		for (let i = 0; i < singleUserChunk.length; i++) {
			if (singleUserChunk[i].data[i].platform === config.CONSTANT.DEVICE_TYPE.ANDROID) {
				androidUsers.push({ "userId": singleUserChunk[i]._id, "deviceToken": singleUserChunk[i].data[i].deviceToken });   //"arn": step1[i].arn
			}
			if (singleUserChunk[i].data[i].platform === config.CONSTANT.DEVICE_TYPE.IOS) {
				iosUsers.push({ "userId": singleUserChunk[i]._id, "deviceToken": singleUserChunk[i].data[i].deviceToken });     //"arn": step1[i].arn 
			}
		}
		console.log(iosUsers, "<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>");
		// separate android user data and ios user data to android user chunks and ios user chunks
		let androidUserChunks = appUtils.splitArrayInToChunks(androidUsers, 2);
		let iosUserChunks = appUtils.splitArrayInToChunks(iosUsers, 2);

		console.log(iosUserChunks);


		// create android payload
		let androidPushPayload = {
			title: title,
			link: link,
			message: message,
			image: image,
			type: config.CONSTANT.NOTIFICATION_TYPE.ONE_TO_ONE,
			priority: "high",
			contentType: image ? "image" : "text",
			category: "action"
		};

		// create ios payload
		let IOSPushPayload = {
			alert: title,
			body: message,
			attachmentUrl: image,
			type: config.CONSTANT.NOTIFICATION_TYPE.ONE_TO_ONE,
			mutableContent: req.body.mutableContent ? req.body.mutableContent : 0,
			contentType: image ? "image" : "text",
			category: "action",
			badge: req.body.badge ? req.body.badge : 0,
			threadId: "RichPush",
		};

		// save android chunk data
		let androidResult = await androidUserChunks.map(async (data) => {

			let chunkNoticiationData = {
				// "notificationId": notificationId,
				"data": data,
				"payload": androidPushPayload,
				"chunkType": config.CONSTANT.DEVICE_TYPE.ANDROID
			};

			let data_to_insert: any = new notification_chunks(chunkNoticiationData);
			let AddNotification: any = await data_to_insert.save();

			let sendToPushNotificationFunction: any = await pushNotification(chunkNoticiationData);
			console.log(AddNotification);

			return AddNotification && sendToPushNotificationFunction;

		});

		// save ios chunk data
		let iosResult = await iosUserChunks.map(async (data) => {

			let chunkNoticiationData = {
				// "notificationId": notificationId,
				"data": data,
				"payload": IOSPushPayload,
				"chunkType": config.CONSTANT.DEVICE_TYPE.IOS
			};
			let data_to_insert: any = new notification_chunks(chunkNoticiationData);
			let AddNotification: any = await data_to_insert.save();

			let sendToPushNotificationFunction: any = await pushNotification(chunkNoticiationData);

			console.log(AddNotification);

			return AddNotification && sendToPushNotificationFunction;

		})
		console.log(androidResult);

		if (androidResult) {
			// console.log(androidResult);
			res.send({
				// message: adminNotificationConstant.MESSAGES.SUCCESS.SEND_NOTIFICATION,
				statusCode: config.CONSTANT.HTTP_STATUS_CODE.OK,
				message: "Notification added and sent successfully.",
				type: "ADD_AND_SEND_NOTIFICATION",
				// response: addNotification
			})
		} else if (iosResult) {
			res.send({
				// message: adminNotificationConstant.MESSAGES.SUCCESS.SEND_NOTIFICATION,
				statusCode: config.CONSTANT.HTTP_STATUS_CODE.OK,
				message: "Notification added and sent successfully.",
				type: "ADD_AND_SEND_NOTIFICATION",
				// response: addNotification
			})
		} else {
			res.send(config.CONSTANT.MESSAGES.ERROR.INTERNAL_SERVER_ERROR);
		}
		// }
	} catch (error) {
		throw new Error();
	}
}
/**
 * @DELETE NOTIFICATION
 * @param req 
 * @param res 
 * @param next 
 */
const deleteNotification = async (req: any, res: any, next: NextFunction) => {
	try {
		let tokenData = req.token._id;
		let { notificationId } = req.params;

		if (tokenData.adminType === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN) {

			let query: any = {};
			query._id = notificationId;

			let deleteNotificationFromAdminNotification = await admin_notifications.findOneAndDelete(query);
			/*||================================================================================||*/
			let query2: any = {};
			query2.notificationId = notificationId;

			let deleteNotificationFromNotificationChunk = await notification_chunks.deleteOne(query2);

			if (deleteNotificationFromAdminNotification && deleteNotificationFromNotificationChunk) {

				res.send(adminNotificationConstant.MESSAGES.SUCCESS.DELETE_NOTIFICATION);

			} else {

				res.send(adminNotificationConstant.MESSAGES.ERROR.INTERNAL_SERVER_ERROR);
			}

		} else {
			res.send(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
		}
	}
	catch (error) {
		throw error;
	}


}
/**
 * 
 * @param req 
 * @param res 
 * @param next 
 */
const uploadHealthreelVideo = async (req: any, res: any, next: NextFunction) => {
	try {
		let { vname, link } = req.body,
			thumbnail = req.file.key;


		let dataToSave: any = {
			videoName: vname,
			thumbnail: thumbnail,
			link: link
		};

		console.log(dataToSave);

		let dataToInsert: AppVideo = new appVideoModel(dataToSave);
		let result: AppVideo = await dataToInsert.save();

		console.log(result);

		if (result) {

			res.send({
				message: constant.MESSAGES.SUCCESS.UPLOAD_VIDEO,
				response: result,
			});
		}
		else {
			res.send(constant.MESSAGES.ERROR.INTERNAL_SERVER_ERROR);
		}
	} catch (err) {
		throw err;
	}
}

/**
 * 
 * @param req 
 * @param res 
 * @param next 
 */
const getHealthreelVideo = async (req: any, res: any, next: NextFunction) => {
	try {

		let query: any = {};

		let projection: any = {};

		let options: any = {};
		options.lean = true;


		let getVideos = await appVideoModel.find(query, projection, options);

		if (getVideos) {

			res.send({
				message: constant.MESSAGES.SUCCESS.UPLOAD_VIDEO,
				response: { data: getVideos },
			});

		} else {

			res.send(constant.MESSAGES.ERROR.INTERNAL_SERVER_ERROR);

		}

	} catch (err) {
		throw err;
	}
}






/**
 * @Admin and Notification controllers
 */
export let adminController = {
	createAdmin: createAdmin,
	forgotPassword: forgotPassword,
	changeForgotPassword: changeForgotPassword,
	adminLogin: adminLogin,
	logout: logout,
	changePassword: changePassword,
	dashboard: dashboard,
	editProfile: editProfile,
	adminDetails: adminDetails,
	adminNotification: adminNotification,
	editNotification: editNotification,
	notificationList: notificationList,
	adminNotificationDetail: adminNotificationDetails,
	sendOneToOneNotification: sendOneToOneNotification,
	deleteNotification: deleteNotification,
	uploadHealthreelVideo: uploadHealthreelVideo,
	getHealthreelVideo: getHealthreelVideo

};