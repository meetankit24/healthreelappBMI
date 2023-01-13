"use strict";

import FCM = require("fcm-node");

import * as envSecret from "../config/environment";

let fcmServerKey = envSecret.SERVER.FCM_SERVER_KEY; // put your server key here

let fcm = new FCM(fcmServerKey);

export let sendPush = async function (deviceToken, payload) {

	let message = { // this may vary according to the message type (single recipient, multicast, topic, et cetera)
		to: deviceToken,                    //"862648041451405",
		data: payload,
		// sound: 'default'

	};
	console.log(message);

	return new Promise(async (resolve, reject) => {
		try {
			fcm.send(message, function (error, response) {

				// console.log(error, response);

				if (error) {
					// console.log(error);
					console.log("Notification not sent", error);
					// reject(error);
				} else {
					console.log("Successfully sent with response: ", response);
					resolve(response);
				}
			});
		} catch (error) {
			reject(error);
		}
	});
};

export let subscribeToTopic = async function (deviceIds, payload) {
	return new Promise(async (resolve, reject) => {
		try {
			fcm.subscribeToTopic(deviceIds, "some_topic_name", (err, res) => {
				console.log(err, res);
			});
		} catch (error) {
			reject(error);
		}
	});
};

export let unsubscribeToTopic = async function (deviceIds, payload) {
	return new Promise(async (resolve, reject) => {
		try {
			fcm.unsubscribeToTopic(deviceIds, "some_topic_name", (err, res) => {
				console.log(err, res);
			});
		} catch (error) {
			reject(error);
		}
	});
};