"use strict";

// import { BaseDao } from "@modules/v1/shared/BaseDao";
import { login_histories } from './loginHistoryModel';
import { param } from 'express-validator';
import { partials } from 'handlebars';

export class LoginHistoryDao {

	// create user login history on login
	async createUserLoginHistory(params: any) {
		let data_login: any = {
			isLogin: true,
			lastLogin: Date.now(),
			lastLogout: Date.now(),
			userId: params.userId,
			deviceId: params.deviceId,
			deviceToken: params.deviceToken,
			platform: params.platform
		};
		//console.log(data_login);
		let data_to_save = new login_histories(data_login);
		return await data_to_save.save(params);

	}

	// remove user device on logout
	async removeUserDeviceByUserId(params) {

		let query: any = {};
		query.userId = params.userId;
		query.deviceId = params.deviceId;

		let update: any = {};
		update["$set"] = {
			isLogin: false,
			lastLogout: Date.now()
		};
		update["$unset"] = { deviceToken: null };

		let options: any = {};
		options.multi = true;
		// options.upsert=true;`

		return await login_histories.updateOne(query, update, options);
	}

	// find device by id and userId
	async findDeviceById(params) {

		let query: any = {};
		query.deviceId = params.deviceId;
		query.userId = params.userId;
		query.isLogin = true;

		let projection: any = { salt: 1, refreshToken: 1 };

		let options: any = {};
		options.lean = true;

		return await login_histories.findOne(query, projection, options);
	}

	// update refresh token
	async updateRefreshToken(params) {
		let query: any = {};
		query.deviceId = params.deviceId;
		query.userId = params.userId;
		query.isLogin = true;

		let update: any = {};
		update["$set"] = {
			"refreshToken": params.refreshToken
		};

		let options: any = {};

		return await login_histories.update(query, update, options);
	}
}

export let loginHistoryDao = new LoginHistoryDao();