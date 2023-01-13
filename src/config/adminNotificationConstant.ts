"use strict";

import * as config from "./constant";

export const MESSAGES = {
	ERROR: {
		UNAUTHORIZED_ACCESS: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.UNAUTHORIZED,
			"message": "You are not authorized to perform this action.",
			"type": "UNAUTHORIZED_ACCESS"
		},
		INTERNAL_SERVER_ERROR: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
			"message": "Please try after some time.",
			"type": "INTERNAL_SERVER_ERROR"
		},
		ACCESS_DENIED: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.ACCESS_FORBIDDEN,
			"message": "Access denied.",
			"type": "ACCESS_DENIED"
		},
	},
	SUCCESS: {
		ADD_NOTIFICATION: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.CREATED,
			"message": "Notification added successfully.",
			"type": "ADD_NOTIFICATION"
		},
		EDIT_NOTIFICATION: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.UPDATED,
			"message": "Notification edited and send successfully.",
			"type": "EDIT_NOTIFICATION"
		},
		NOTIFICATION_LIST: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Notification list get successfully.",
			"type": "NOTIFICATION_LIST"
		},
		NOTIFICATION_DETAILS: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Notification details successfully.",
			"type": "NOTIFICATION_DETAILS"
		},
		SEND_NOTIFICATION: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Notification sent successfully.",
			"type": "SEND_NOTIFICATION"
		},
		DELETE_NOTIFICATION: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Notification deleted successfully.",
			"type": "DELETE_NOTIFICATION"
		}
	}
};