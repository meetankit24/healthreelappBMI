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
	CONCURRENT_LIMITED_EXCEEDED: 429,
	// TOO_MANY_REQUESTS: 429,
	INTERNAL_SERVER_ERROR: 500,
	BAD_GATEWAY: 502,
	SHUTDOWN: 503
};

export const MESSAGES = {
	ERROR: {
		EMAIL_ALREADY_EXIST: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Email already exists.",
			"type": "EMAIL_ALREADY_EXIST"
		},
		INVALID_OLD_PASSWORD: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Old password is invalid.",
			"type": "INVALID_OLD_PASSWORD"
		},
		INTERNAL_SERVER_ERROR: {
			"statusCode": HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
			"message": "Please try after some time.",
			"type": "INTERNAL_SERVER_ERROR"
		},
	},
	SUCCESS: {
		CREATE_ADMIN: {
			"statusCode": HTTP_STATUS_CODE.CREATED,
			"message": "Admin created successfully.",
			"type": "CREATE_ADMIN"
		},
		FORGOT_PASSWORD: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"message": "Please check your e-mail for password reset link.",
			"type": "FORGOT_PASSWORD"
		},
		CHANGE_FORGOT_PASSWORD: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"message": "Password changed successfully.",
			"type": "CHANGE_FORGOT_PASSWORD"
		},
		ADMIN_LOGIN: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"message": "Admin logged in successfully.",
			"type": "ADMIN_LOGIN"
		},
		LOGOUT: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"message": "Admin logout successfully.",
			"type": "LOGOUT"
		},
		CHANGE_PASSWORD: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"message": "Password changed successfully.",
			"type": "CHANGE_PASSWORD"
		},
		USER_LIST: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"message": "User list get successfully.",
			"type": "USER_LIST"
		},
		ADMIN_DETAILS: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"message": "Admin details get successfully.",
			"type": "ADMIN_DETAILS"
		},
		DASHBOARD: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"message": "Dashboard data get successfully.",
			"type": "DASHBOARD"
		},
		UPLOAD_VIDEO: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"message": "Videos uploaded successfully.",
			"type": "UPLOAD_VIDEO"
		},
		GET_VIDEO: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"message": "Videos uploaded successfully.",
			"type": "GET_VIDEO"
		},
		EDIT_PROFILE: {
			"statusCode": HTTP_STATUS_CODE.UPDATED,
			"message": "Profile edited successfully.",
			"type": "EDIT_PROFILE"
		}
	}
};