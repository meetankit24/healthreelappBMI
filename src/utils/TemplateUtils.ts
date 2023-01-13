"use strict";

const fs = require("fs");
import * as handlebars from "handlebars";

import * as config from "../config/constant";

export class TemplateUtil {

    private template: string;

    constructor(template: any) {
        this.template = template;
    }

    compileFile(complieData: Object) {

        return new Promise((resolve, reject) => {
            complieData["fbLink"] = config.CONSTANT.EMAIL_TEMPLATE.SOCIAL_LINK.FB;
            complieData["twitterLink"] = config.CONSTANT.EMAIL_TEMPLATE.SOCIAL_LINK.TWITTER;
            complieData["instalLink"] = config.CONSTANT.EMAIL_TEMPLATE.SOCIAL_LINK.INSTAGRAM;
            complieData["gsgAddress"] = config.CONSTANT.EMAIL_TEMPLATE.GSG_ADDRESS;

            fs.readFile(this.template, "utf8", (error: any, content: any) => {
                if (error)
                    reject(error);
                try {
                    const template = handlebars.compile(content);
                    let html = template(complieData);
                    resolve(html);
                } catch (error) {
                    reject(error);
                }
            });
        });
    }
}