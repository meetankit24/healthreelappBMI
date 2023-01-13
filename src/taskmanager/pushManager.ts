"use strict";

// import * as apns from '@lib/pushNotification/apns';
import * as config from "../config/constant";
import * as envSecret from '../config/environment'
import * as fcm from "./fcm";
// import
export let pushNotification = async function (data) {
	return new Promise(async (resolve, reject) => {
		try {
			if (envSecret.SERVER.PUSH_TYPE === config.CONSTANT.PUSH_SENDING_TYPE.FCM) {
				let promiseResult = [];
				for (let j = 0; j < data.data.length; j++) {
					promiseResult.push(fcm.sendPush(data.data[j].deviceToken, data.payload));
				}
				resolve(Promise.all(promiseResult));

			} else {
				return config.CONSTANT.MESSAGES.ERROR.INTERNAL_SERVER_ERROR;
			}
		} catch (error) {
			reject(error);
		}
	});
};