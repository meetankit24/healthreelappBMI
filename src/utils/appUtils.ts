"use strict";
// import * as Boom from 'boom';
import * as config from '../config/constant';
import * as TinyURL from "tinyurl";
import { userModel } from '../models/userModels';
import { notification_chunks } from '../models/notificationChunk';
import { pushNotification } from '../taskmanager/pushManager'
import * as  envSecret from '../config/environment'
import { param } from 'express-validator';
import * as mongoose from 'mongoose';


export let stringReplace = function (value: string) {
	return value.replace(config.CONSTANT.REGEX.STRING_REPLACE, "");
};

export let isValidMobileNumber = function (countryCode, mobileNo) {
	mobileNo = Number(stringReplace(mobileNo));
	let reExp = config.CONSTANT.REGEX.MOBILE_NUMBER;
	return reExp.test(mobileNo);
};
export let tinyUrl = (url: string) => {
	return new Promise((resolve, reject) => {
		TinyURL.shorten(url, async (response) => {
			resolve(response);
		});
	});
};

export let captalizeFirstLetter = async function (str) {
	// return value.charAt(0).toUpperCase() + value.substr(1);
	str = str.split(" ");

	for (var i = 0, x = str.length; i < x; i++) {
		str[i] = str[i][0].toUpperCase() + str[i].substr(1);
	}

	return await str.join(" ");
};
export let toTitleCase = (phrase) => {
	return phrase
		.toLowerCase()
		.split(' ')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
};

export let calculate_age = (dob) => {
	var diff_ms = Date.now() - dob.getTime();
	var age_dt = new Date(diff_ms);

	return Math.abs(age_dt.getUTCFullYear() - 1970);
};


export let clean = function (object) {
	for (let propName in object) {
		if (object[propName] === null || object[propName] === undefined || object[propName] === "") {
			delete object[propName];
		}
	}
	delete object["id"];
	delete object["createdAt"];
	delete object["updatedAt"];
	return object;
};

export let isUpdatedEmailMobileExist = async function (params) {

	let query: any = {};
	query["$or"] = [{ "email": params.email }, { "countryCode": params.countryCode, "mobileNo": params.mobileNo }];
	query._id = { "$ne": params.id };

	let projection: any = {};
	projection._id = 1;
	projection.userName = 1;
	projection.email = 1;
	projection.countryCode = 1;
	projection.mobileNo = 1;


	let options: any = {};
	options.lean = true;

	let isEmailMobileExist: any = await userModel.findOne(query, projection, options);

	return isEmailMobileExist;

}

export let updateFitScoreToUser = async function (params) {
	console.log(params, "<<<<<<<<<<<<<<>>>>>>>>>>>>>>")

	let query: any = {};
	query._id = params.userId;

	let update: any = {};
	update["$set"] = { "fitScore": params.fitScore };

	let options: any = {};
	options.upsert = true;
	options.new = true;

	return await userModel.findOneAndUpdate(query, update, options);

}

export let createIOSPushPayload = function (data) {
	data.alert = data.title;
	data.body = data.message;
	data.attachmentUrl = data.image;
	data.type = data.notificationType;
	data.mutableContent = data.mutableContent ? data.mutableContent : 0;
	data.contentType = data.image ? "image" : "text";
	data.category = "action";
	data.badge = data.badge ? data.badge : 0;
	data.threadId = "RichPush";

	let set: any = {};
	let fieldsToFill = ["alert", "link", "body", "attachmentUrl", "type", "mutableContent", "contentType", "category", "badge", "threadId"];
	return set = this.setInsertObject(data, set, fieldsToFill);
};

export let convertISODateToTimestamp = function (value) {
	// 2018-12-06T07:28:14.793Z to 1545578721887
	return new Date(value).getTime();
};

const queryBuilder = (pipeline: Array<Object>, skip: number, limit: number, pageNo: number): Array<Object> => {
	let query = pipeline || [];

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
	return query;
};

export const paginate = async (Model: any, pipeline?: Array<Object>, limit?: number, pageNo?: number) => {
	try {
		if (limit) {
			limit = Math.abs(limit);

			// If limit exceeds max limit
			if (limit > 100) {
				limit = 100;
			}
		} else {
			limit = 10;
		}
		if (pageNo && (pageNo !== 0)) {
			pageNo = Math.abs(pageNo);
		} else {
			pageNo = 1;
		}
		let skip = (limit * (pageNo - 1));
		const result = await Model.aggregate(queryBuilder(pipeline, skip, limit, pageNo)).exec();

		return {
			"data": result[0]["data"],
			"total": result[0]["metadata"] && result[0]["metadata"][0] ? result[0]["metadata"][0]["total"] : 0
		};
	} catch (error) {
		throw new Error(error);
	}
};

// export let splitArrayInToChunks = function (data) {
// 	return data.chunk_inefficient(2);
// };
export let splitArrayInToChunks = function chunk(arr, len) {

	var chunks = [],
		i = 0,
		n = arr.length;

	while (i < n) {
		chunks.push(arr.slice(i, i += len));
	}

	return chunks;
}

export let getSingleChunksOfUser = async (params) => {
	console.log(params.userId, "<<<<<<<<<<<<<<<<<<<IN the get single chunk of user>>>>>>>>>>>>>>>>")

	const ObjectId = mongoose.Types.ObjectId;

	let aggPipe: any = [];

	// let match1: any = {};
	// match1._id =params.userId;

	aggPipe.push(
		{ "$match": { _id: ObjectId(params.userId) } }
	)

	let lookup = {
		"from": "login_histories",
		"localField": "_id",
		"foreignField": "userId",
		"as": "users"
	};

	aggPipe.push({ "$lookup": lookup })
	aggPipe.push({ "$unwind": "$users" })

	let project1: any = {};
	project1._id = 1;
	project1.isLogin = true;
	project1.platform = "$users.platform";
	project1.deviceId = "$users.deviceId";
	project1.deviceToken = "$users.deviceToken";
	project1.profilePicture = 1;

	aggPipe.push({ "$project": project1 })

	let group1: any = {};
	group1._id = "$_id"
	group1.profilePicture = { "$first": "profilePicture" }
	group1.data = { "$push": { platform: "$platform", deviceToken: "$deviceToken" } }

	aggPipe.push({ "$group": group1 })


	console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")

	let response = await userModel.aggregate(aggPipe)

	return response;
}

export const getChunksOfUser = async (params) => {
	// console.log(params.platform, "PARAMSSSSSSSSSSSSSSSSSSSSSSSSSSsss");

	//aggPipe.push({ "$addFields": { created: { "$subtract": ["$createdAt", new Date("1970-01-01")] } } });
	let pipeline: any = [];

	let lookup = {
		"from": "login_histories",
		"localField": "_id",
		"foreignField": "userId",
		"as": "users"
	};
	pipeline.push(
		{ $lookup: lookup },
		{ $unwind: "$users" },
		{
			$match: {
				"users.platform": params.platform,
				"users.isLogin": true
			}
		})

	// if (params.platform !== config.CONSTANT.DEVICE_TYPE.ALL) {

	// 	pipeline.push(
	// 		{
	// 			$match: { "platform": params.platform }
	// 		}
	// 	)
	// }

	if (params.fromDate && params.toDate) {
		pipeline.push(
			{
				$match: { "createdAt": { "$gte": new Date(params.fromDate), "$lte": new Date(params.toDate) } }
			}
		);
	}

	pipeline.push(
		{
			$project: {
				_id: 1,
				createdAt: 1,
				isLogin: "$users.isLogin",
				platform: "$users.platform",
				deviceToken: "$users.deviceToken",
				userName: "$userName",
				gender: "$gender",
				created: "$createdAt",

			}
		}
	)

	console.log(pipeline);
	console.log("<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
	return await userModel.aggregate(pipeline);
}

/**
* @function autoNotificationAfterReport
* @description "internal function of internal function  send autoNotificationAfterReport to user"
*/
export const autoNotificationAfterReport = async (params) => {
	try {
		// console.log(req.params,"<<<<<<<<<<<<>>>>>>>>>>>>>>>>>")
		let title = "Report Recommendation",
			image = 'public/avatar9c1254f1-029d-4c15-a5de-582041392f70.jpeg',
			url = 'NasaApp://3.92.170.227:7001',
			message;

		if (params.reportFinalType == "underweight") {
			message = "You're under-weight.To stay fit and healthy take subscription and get more guidance ";
		} else if (params.reportFinalType == "healthy weight") {
			message = "You're healthy-weight.To stay fit and healthy take subscription and get more guidance";
		} else if (params.reportFinalType == "overweight") {
			message = "You're over-weight.To stay fit and healthy take subscription and get more guidance ";
		} else { //obese
			message = "You're obese.To stay fit and healthy take subscription and get more guidance ";
		}


		let userParams = { userId: params.userId };
		let singleUserChunk = await getSingleChunksOfUser(userParams);

		console.log(singleUserChunk, "<>>>>>>>>>>>>>>>singleUserChunk<<<<>>>>>>>>>>>>>");

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
		console.log(iosUsers, "<<<<<<<<<<<<<<<<<iosUsers>>>>>>>>>>>>>>>");
		console.log(androidUsers, "<<<<<<<<<<<<<<<<<iosUsers>>>>>>>>>>>>>>>");

		// separate android user data and ios user data to android user chunks and ios user chunks
		let androidUserChunks = splitArrayInToChunks(androidUsers, 2);
		let iosUserChunks = splitArrayInToChunks(iosUsers, 2);

		console.log(iosUserChunks);


		// create android payload
		let androidPushPayload = {
			title: title,
			link: url,
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
			sound: '',
			type: config.CONSTANT.NOTIFICATION_TYPE.ONE_TO_ONE,
			// mutableContent: req.body.mutableContent ? req.body.mutableContent : 0,
			contentType: image ? "image" : "text",
			category: "action",
			// badge: req.body.badge ? req.body.badge : 0,
			threadId: "RichPush",
		};

		// save android chunk data
		await androidUserChunks.map(async (data) => {

			let chunkNoticiationData = {
				// "notificationId": notificationId,
				"data": data,
				"payload": androidPushPayload,
				"chunkType": config.CONSTANT.DEVICE_TYPE.ANDROID
			};

			let dataToInsert: any = new notification_chunks(chunkNoticiationData);
			let AddNotification: any = await dataToInsert.save();

			let sendToPushNotificationFunction: any = await pushNotification(chunkNoticiationData);
			console.log(AddNotification);

			return AddNotification && sendToPushNotificationFunction;

		});

		// save ios chunk data
		await iosUserChunks.map(async (data) => {

			let chunkNoticiationData = {
				// "notificationId": notificationId,
				"data": data,
				"payload": IOSPushPayload,
				"chunkType": config.CONSTANT.DEVICE_TYPE.IOS
			};
			let dataToInsert: any = new notification_chunks(chunkNoticiationData);
			let AddNotification: any = await dataToInsert.save();

			let sendToPushNotificationFunction: any = await pushNotification(chunkNoticiationData);

			console.log(AddNotification);

			return AddNotification && sendToPushNotificationFunction;

		})
		// console.log(androidResult);
		// console.log(iosResult);



		// }
	} catch (error) {
		throw new Error();
	}

}

/**
 * @Calculate BMI ,BODY & METABOLIC REPORT-
* @description "internal function of internal function calculate body and metabolic Report for calculating calculate Health risk report"
 */
export const calculateBMI = async (height, age, gender, type, weight, activityLevel) => {

	console.log(height, age, gender, type, weight, activityLevel);

	let BMI,
		correctBMI,
		bodyFatPercentage,
		leanBodyMass,
		BMR,
		activeMetabolicRate, //for calculating this step1 is to calculate BasalMR then -AMR
		restingMetabolicRate;



	if (gender === config.CONSTANT.GENDER.MALE) {
		// For men,
		console.log("BMR FOR MEN")
		BMR = await Math.round(66 + (6.3 * weight) + (12.9 * height * 12) - (6.8 * age)); //weight=pound/lbs & height=inches

	} else {
		// For women,
		console.log("BMR FOR WOMEN")
		BMR = await 655 + (4.35 * weight) + (4.7 * height * 12) - (4.7 * age);
	}

	/*Active Metabolic Rate(exercise 6 - 7 days / week):-
	 Light Active = 1.25 –> If you do some basic household chores and / or light exercise or sports 1 - 3 days / week
	 Habitual Daily Exercise = 1.40 –> If you are doing some daily walking or cycling for atleast 5 kilometers and / or moderate exercise or sports 3 - 5 days / week
	 Highly Active = 1.60 –> If you are an athlete or do hard exercise or sports 6 - 7 days / week or has a physical job*/

	activeMetabolicRate = await Math.round(BMR * 1.40);   //calories burnt a day.


	// console.log(height)

	//for metric purposes
	if (type === 'metric') {
		weight = await (weight * 0.453592);   // into kg
		console.log("metric weight in kg", weight)
		BMI = await (weight / ((height * 0.3048) * (height * 0.3048)));
		correctBMI = await Math.round(BMI * Math.pow(10, 2)) / Math.pow(10, 2);

		height = await (height * 30.48);    //into cm
		console.log("metric height into m", height)

	}
	//for standard purposes
	if (type === 'standard') {

		BMI = await 703 * (weight / ((height * 12) * (height * 12)));
		correctBMI = await Math.round(BMI * Math.pow(10, 2)) / Math.pow(10, 2);

		weight = await (weight * 0.453592);   // into kg
		console.log("standard weight in pound/lbs", weight)

		height = await (height * 30.48);    //into cm
		console.log("standard height in feet.inch", height)

	}

	//Now we'll calculate bodyFatPercentage, leanBodyMass,restingMetabolicRate
	if (gender === config.CONSTANT.GENDER.MALE) {

		// Body fat percentage(BFP) formula for adult males:
		bodyFatPercentage = (1.20 * BMI) + (0.23 * age) - 16.2;

		//using The Boer Formula:1 for male
		leanBodyMass = (0.407 * weight) + (0.267 * height) - 19.2; //weight=kg & height=cm for metric as same for standard

		// (RMR) kcal / day for males:
		restingMetabolicRate = (9.99 * weight) + (6.25 * height) - (4.92 * age) + 5;  //weight=kg & height=cm for metric
		//kgCal/day for metric

	}
	else if (gender === config.CONSTANT.GENDER.FEMALE) {

		// Body fat percentage(BFP) formula for adult females:
		bodyFatPercentage = (1.20 * BMI) + (0.23 * age) - 5.4;

		//using The Boer Formula:1 for female
		leanBodyMass = (0.252 * weight) + (0.473 * height) - 48.3;

		// (RMR) kcal / day for women:
		restingMetabolicRate = (9.99 * weight) + (6.25 * height) - (4.92 * age) - 161;

	} else {
		return {};
	}

	// calOut =  ((kilograms / (meters * meters)) * (120)).toFixed(2);
	// calIn = ((kilograms / (meters * meters)) * (150)).toFixed(2);

	let fatMass = ((bodyFatPercentage / 100) * weight);//((bodyFatPercentage / 100) * weight);
	let reportFinalType;

	//  BMI is less than 18.5 underweight range.
	//  BMI is 18.5 to 24.9, normal or Healthy Weight range.
	//  BMI is 25.0 to 29.9, overweight range.
	//  BMI is 30.0 or higher obese range.

	if (BMI <= 18.5) {

		reportFinalType = "underweight";

	} else if (BMI >= 18.5 && BMI <= 24.9) {

		reportFinalType = "healthy weight";

	}
	else if (BMI >= 25.0 && BMI <= 29.9) {

		reportFinalType = "overweight";

	} else {

		reportFinalType = "obese";
	}

	return {
		BMI,
		correctBMI,
		bodyFatPercentage,
		leanBodyMass,
		fatMass,
		BMR,
		reportFinalType,
		activeMetabolicRate,
		restingMetabolicRate,
	};

}

/**
* @function calculateIdealBodyFatPercent
* @description "internal function of internal function calculateHealthReport for calculating calculate ideal body fat percent"
*/
let calculateIdealBodyFatPercent = async function (bodyFatPercent, userAge, gender) {
	let age = [20.0, 25.0, 30.0, 35.0, 40.0, 45.0, 50.0, 55.0];
	let fat_percentage_man = [8.5, 10.5, 12.7, 13.7, 15.3, 16.4, 18.9, 20.9];
	let fat_percentage_woman = [17.7, 18.4, 19.3, 21.5, 22.2, 22.9, 25.2, 26.3];
	if (userAge >= 55.0) {
		if (gender == config.CONSTANT.GENDER.MALE) {
			return await fat_percentage_man[fat_percentage_man.length - 1];
		} else {
			return await fat_percentage_woman[fat_percentage_woman.length - 1];
		}
	}
	var i = -1, j;
	for (j = 0; j < age.length - 1; j++) {
		if (userAge >= age[j] && userAge < age[j + 1]) {
			i = j;
			break
		}
	}
	if (i == -1) {
		if (gender == config.CONSTANT.GENDER.MALE) {
			return await fat_percentage_man[0];
		} else {
			return await fat_percentage_woman[0];
		}
	}
	let difference = await userAge - age[i];
	let percentage = await (difference * 100) / (age[i + 1] - age[i]);
	console.log("gender, fat_percentage_man[i], (percentage / 100): ", gender, fat_percentage_man[i], (percentage / 100))
	if (gender == config.CONSTANT.GENDER.MALE) {
		return await fat_percentage_man[i] + (percentage / 100) * (fat_percentage_man[i + 1] - fat_percentage_man[i]);
	} else {
		return await fat_percentage_woman[i] + (percentage / 100) * (fat_percentage_woman[i + 1] - fat_percentage_woman[i]);
	}
};

/**
* @function calculateBFvalue
* @description "internal function of internal function calculateHealthReport for calculating calculate b f value"
*/
let calculateBFvalue = async function (Gender, bfVal, age) {
	if (Gender == config.CONSTANT.GENDER.MALE) {
		// comparing to ideal bf % of 9.5% for male according to https://www.builtlean.com/2010/08/03/ideal-body-fat-percentage-chart/
		if (bfVal <= 8) {
			return await bfVal;
		}
		if (age >= 18 && age < 24) {
			bfVal += 1;
		}
		else if (age >= 24 && age < 28) {
			bfVal -= 1;
		}
		else if (age >= 28 && age < 33) {
			bfVal -= 3.2;
		}
		else if (age >= 33 && age < 38) {
			bfVal -= 4.2;
		}
		else if (age >= 38 && age < 43) {
			bfVal -= 5.8;
		}
		else if (age >= 43 && age < 48) {
			bfVal -= 6.9;
		}
		else if (age >= 48 && age < 53) {
			bfVal -= 9.4;
		}
		else if (age >= 53 && age < 59) {
			bfVal -= 11.4;
		}
		else if (age >= 59) {
			bfVal -= 13.4;
		}
	} else {
		// comparing to ideal bf % of 17% for female according to https://www.builtlean.com/2010/08/03/ideal-body-fat-percentage-chart/
		if (bfVal <= 17) {
			return await bfVal;
		}
		if (age >= 18 && age < 24) {
			bfVal -= 0.7;
		}
		else if (age >= 24 && age < 28) {
			bfVal -= 1.4;
		}
		else if (age >= 28 && age < 33) {
			bfVal -= 2.3;
		}
		else if (age >= 33 && age < 38) {
			bfVal -= 4.5;
		}
		else if (age >= 38 && age < 43) {
			bfVal -= 5.2;
		}
		else if (age >= 43 && age < 48) {
			bfVal -= 5.9;
		}
		else if (age >= 48 && age < 53) {
			bfVal -= 8.2;
		}
		else if (age >= 53 && age < 59) {
			bfVal -= 9.3;
		}
		else if (age >= 59) {
			bfVal -= 12.4;
		}
	}
	return await bfVal;
};

/**
* @function calculateBFGradeImpact
* @description "internal function of internal function calculateHealthReport for calculating calculate b f grade impact"
*/
let calculateBFGradeImpact = async function (bfVal, Gender) {
	let bfGradeImpact;

	if (Gender == config.CONSTANT.GENDER.MALE) {
		if (bfVal >= 6 && bfVal <= 12.99) {
			bfGradeImpact = 47.5;
		}
		else if ((bfVal >= 5 && bfVal <= 5.99) || (bfVal >= 13 && bfVal <= 16.99)) {
			bfGradeImpact = 42.5;
		}
		else if ((bfVal >= 2 && bfVal <= 4.99) || (bfVal >= 17 && bfVal <= 23.99)) {
			bfGradeImpact = 37.5;
		}
		else if ((bfVal >= 0 && bfVal <= 1.99) || (bfVal >= 24 && bfVal <= 24.99)) {
			bfGradeImpact = 32.5;
		}
		else if ((bfVal >= 25)) {
			bfGradeImpact = 25;
		}
	} else {
		if (bfVal >= 14 && bfVal <= 19.99) {
			bfGradeImpact = 47.5;
		}
		else if ((bfVal >= 13 && bfVal <= 13.99) || (bfVal >= 20 && bfVal <= 23.99)) {
			bfGradeImpact = 42.5;
		}
		else if ((bfVal >= 10 && bfVal <= 12.99) || (bfVal >= 24 && bfVal <= 30.99)) {
			bfGradeImpact = 37.5;
		}
		else if ((bfVal >= 0 && bfVal <= 9.99) || (bfVal >= 31 && bfVal <= 31.99)) {
			bfGradeImpact = 32.5;
		}
		else if ((bfVal >= 32)) {
			bfGradeImpact = 25;
		}
	}
	return bfGradeImpact;
};

/**
* @function calculateBMIGradeImpact
* @description "internal function of internal function calculateHealthReport for calculating calculate b m i grade impact"
*/
let calculateBMIGradeImpact = async function (bmiValStart) {
	if ((bmiValStart > 40.0) || (bmiValStart < 7.0)) {
		return 0;
	} else if ((bmiValStart >= 18.5) && (bmiValStart <= 21.75)) {
		let p = ((21.75 - bmiValStart) / (21.75 - 18.5));
		let score = 50 - (p) * (50 - 45);
		return await score;
	} else if ((bmiValStart >= 22.75) && (bmiValStart <= 25)) {
		let p = ((bmiValStart - 22.75) / (25 - 22.75));
		let score = 50 - (p) * (50 - 45);
		return await score;
	} else if (bmiValStart < 18.5) {
		let p = ((18.5 - bmiValStart) / (18.5 - 7.0));
		let score = 45 - (p) * (45 - 0);
		return await score;
	} else if (bmiValStart > 25) {
		let p = ((bmiValStart - 25) / (40 - 25));
		let score = 45 - (p) * (45 - 0);
		return await score;
	} else {
		return 50;
	}
};

/**
 * @CALCULATE HRR[ HEALTH RISK REPORT]
 */
export const calculateHealthRiskReport = async (bmiVal, bodyFatPercent, age, gender) => {

	let actualBmi = bmiVal;
	// console.log("actualBmi: ", actualBmi)

	let roundOffbmiVal = await bmiVal.toFixed(1);
	let bmiQuad = await Math.pow(roundOffbmiVal, 4);
	let bmiCube = await Math.pow(roundOffbmiVal, 3);
	let bmiSquare = await Math.pow(roundOffbmiVal, 2);

	let respiratory = await (-0.0002242 * bmiCube) + (0.0317 * bmiSquare) + (-1.236 * roundOffbmiVal) + 15.49;
	respiratory = await (respiratory - 1) * 100;

	let heart = await (0.0001357 * bmiCube) + (-0.007179 * bmiSquare) + (0.1327 * roundOffbmiVal) + 0.1598;
	heart = await (heart - 1) * 100;

	let diabetes = await (-0.0001775 * bmiCube) + (0.01929 * bmiSquare) + (-0.6228 * roundOffbmiVal) + 7.201;
	diabetes = await (diabetes - 1) * 100;

	let cancer = await (-0.00006523 * bmiCube) + (0.007485 * bmiSquare) + (-0.2334 * roundOffbmiVal) + 3.202;
	cancer = await (cancer - 1) * 100;

	let stroke = await (0.0000191 * bmiQuad) + (-0.002406 * bmiCube) + (0.1166 * bmiSquare) + (-2.466 * roundOffbmiVal) + 19.96;
	stroke = await (stroke - 1) * 100;

	//Check if user is having ideal body fat % or below according to his age and assign 50 points as BFGradeImpact
	let getBFGradeImpact = 50;
	let idealBodyFatPercentageTemp = await calculateIdealBodyFatPercent(bodyFatPercent, age, gender);

	if (bodyFatPercent > idealBodyFatPercentageTemp) {

		let getBodyFatPercentValue = await calculateBFvalue(bodyFatPercent, age, gender);

		//here we calculate BFG GRADE IMPACT-
		getBFGradeImpact = await calculateBFGradeImpact(getBodyFatPercentValue, gender);

	}

	//here we calculate BMI GRADE IMPACT-
	let getBMIGradeImpact = await calculateBMIGradeImpact(actualBmi);

	console.log("getBMIGradeImpact, getBFGradeImpact: ", getBMIGradeImpact, getBFGradeImpact);

	let getGradeString = await getBMIGradeImpact + getBFGradeImpact;


	return await {
		compositionGrade: String(Math.round(getGradeString)),
		respiratory,
		heart,
		diabetes,
		cancer,
		stroke
	};
};




/**
 * @description Add skip and limit to pipleine
 */
	// addSkipLimit = (limit, pageNo) => {
	// 	if (limit) {
	// 		limit = Math.abs(limit);
	// 		// If limit exceeds max limit
	// 		if (limit > 100) {
	// 			limit = 100;
	// 		}
	// 	} else {
	// 		limit = 10;
	// 	}
	// 	if (pageNo && (pageNo !== 0)) {
	// 		pageNo = Math.abs(pageNo);
	// 	} else {
	// 		pageNo = 1;
	// 	}
	// 	let skip = (limit * (pageNo - 1));
	// 	return [
	// 		{ "$skip": skip },
	// 		{ "$limit": limit + 1 }
	// 	];
	// }

	// paginate = async (model: ModelNames, pipeline: Array<Object>, limit: number, pageNo: number, options: any = {}, pageCount = false) => {
	// 	try {
	// 		pipeline = [...pipeline, ...this.addSkipLimit(limit, pageNo)];
	// 		let ModelName: any = models[model];
	// 		//////////////////////////////
	// 		if (limit) {
	// 			limit = Math.abs(limit);
	// 			// If limit exceeds max limit
	// 			if (limit > 100) {
	// 				limit = 100;
	// 			}
	// 		} 
	// 		else {
	// 			limit = 10;
	// 		}
    //        ///////////////////////////////
	// 		if (pageNo && (pageNo !== 0)) {
	// 			pageNo = Math.abs(pageNo);
	// 		} else {
	// 			pageNo = 1;
	// 		}
    //       /////////////////////////////////
	// 		let promiseAll = [];
	// 		if (!_.isEmpty(options)) {
	// 			if (options.collation) {
	// 				promiseAll = [
	// 					ModelName.aggregate(pipeline).collation({ "locale": "en" }).allowDiskUse(true)
	// 				];
	// 			} else {
	// 				promiseAll = [
	// 					ModelName.aggregate(pipeline).allowDiskUse(true)
	// 				];
	// 			}
	// 		} else {
	// 			promiseAll = [
	// 				ModelName.aggregate(pipeline).allowDiskUse(true)
	// 			];
	// 		}

	// 		if (pageCount) {
	// 			for (let index = 0; index < pipeline.length; index++) {
	// 				if ("$skip" in pipeline[index]) {
	// 					pipeline = pipeline.slice(0, index);
	// 				} else {
	// 					pipeline = pipeline;
	// 				}
	// 			}
	// 			pipeline.push({ "$count": "total" });
	// 			promiseAll.push(ModelName.aggregate(pipeline));
	// 		}

	// 		//////////////////////////////////////////
	// 		let result = await Promise.all(promiseAll);
	// 		let nextHit = 0;
	// 		let total = 0;
	// 		let totalPage = 0;

	// 		if (pageCount) {
	// 			total = result[1] && result[1][0] ? result[1][0]["total"] : 0;
	// 			totalPage = Math.ceil(total / limit);
	// 		}

	// 		let data: any = result[0];
	// 		if (result[0].length > limit) {
	// 			nextHit = pageNo + 1;
	// 			data = result[0].slice(0, limit);
	// 		}
	// 		return {
	// 			"data": data,
	// 			"total": total,
	// 			"pageNo": pageNo,
	// 			"totalPage": totalPage,
	// 			"nextHit": nextHit,
	// 			"limit": limit
	// 		};
	// 	} catch (error) {
	// 		throw new Error(error);
	// 	}
	// }


/**
 * @function userList
 */
	// async userList(params: ListingRequest) {
	// 	try {
	// 		const { pageNo, limit, searchKey, sortBy, sortOrder, status, fromDate, toDate } = params;
	// 		const aggPipe = [];

	// 		const match: any = {};
	// 		if (searchKey) {
	// 			match["$or"] = [
	// 				{ "firstName": { "$regex": searchKey, "$options": "-i" } },
	// 				{ "middleName": { "$regex": searchKey, "$options": "-i" } },
	// 				{ "lastName": { "$regex": searchKey, "$options": "-i" } },
	// 				{ "email": { "$regex": searchKey, "$options": "-i" } }
	// 			];
	// 		}
	// 		if (status) {
	// 			match["$and"] = [{ status: status }, { status: { "$ne": config.CONSTANT.STATUS.DELETED } }];
	// 		} else {
	// 			match.status = { "$ne": config.CONSTANT.STATUS.DELETED };
	// 		}
	// 		if (fromDate && !toDate) {
	// 			match.created = { "$gte": fromDate };
	// 		}
	// 		if (toDate && !fromDate) {
	// 			match.created = { "$lte": toDate };
	// 		}
	// 		if (fromDate && toDate) {
	// 			match.created = { "$gte": fromDate, "$lte": toDate };
	// 		}
	// 		aggPipe.push({ "$match": match });

	// 		const project = {
	// 			_id: 1, firstName: 1, middleName: 1, lastName: 1, email: 1, countryCode: 1, mobileNo: 1, dob: 1, gender: 1,
	// 			created: 1, status: 1
	// 		};
	// 		aggPipe.push({ "$project": project });

	// 		let sort = {};
	// 		if (sortBy && sortOrder) {
	// 			if (sortBy === "firstName") {
	// 				sort = { "firstName": sortOrder };
	// 			} else if (sortBy === "middleName") {
	// 				sort = { "middleName": sortOrder };
	// 			} else if (sortBy === "lastName") {
	// 				sort = { "lastName": sortOrder };
	// 			} else if (sortBy === "dob") {
	// 				sort = { "dob": sortOrder };
	// 			} else {
	// 				sort = { "created": sortOrder };
	// 			}
	// 		} else {
	// 			sort = { "created": -1 };
	// 		}
	// 		aggPipe.push({ "$sort": sort });

	// 		return await this.paginate("users", aggPipe, limit, pageNo, true);
	// 	} catch (error) {
	// 		throw error;
	// 	}
	// }