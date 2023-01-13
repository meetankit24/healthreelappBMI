import * as  mongoose from 'mongoose';
//import * as  config from './ts/config/environment';
import * as  config from "./environment";

export class Database {

	async connectToDb() {
		return new Promise((resolve, reject) => {
			try {
				const dbName: any = config.SERVER.MONGO.DB_NAME;
				let dbUrl: any = config.SERVER.MONGO.DB_URL;
				const dbOptions = config.SERVER.MONGO.OPTIONS;

				if (config.SERVER.ENVIRONMENT === "production") {
					//logger.info("Configuring db in " + config.SERVER.TAG + " mode");
					dbUrl = dbUrl + dbName;
				} else {
					//	logger.info("Configuring db in " + config.SERVER.TAG + " mode");
					dbUrl = process.env.DB_AUTH_URL;
					console.log(dbUrl);
					mongoose.set("debug", true);
				}

				//logger.info("Connecting to -> " + dbUrl);h
				mongoose.connect(dbUrl, dbOptions);

				// CONNECTION EVENTS
				// When successfully connected
				mongoose.connection.on("connected", function () {
					// clearconsole.info(config.SERVER.DISPLAY_COLORS ? "\x1b[32m%s\x1b[0m" : "%s", `Connected to ${dbUrl}`);
					//logger.info("Connected to DB", dbName, "at", dbUrl);
					resolve();
				});

				// If the connection throws an error
				mongoose.connection.on("error", error => {
					//logger.error("DB connection error: " + error);
					reject(error);
				});

				// When the connection is disconnected
				mongoose.connection.on("disconnected", () => {
					//logger.error("DB connection disconnected.");
					reject("DB connection disconnected.");
				});
			} catch (error) {
				reject(error);
			}
		});
	}
}

