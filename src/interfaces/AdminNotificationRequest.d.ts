declare interface NotificationId extends AuthTokenData {
	notificationId?: string;
}

declare interface AddAdminNotificationRequest extends AuthTokenData, NotificationId {
	image: string;
	title: string;
	link: string;
	message: string;
	appPlatform?: number;
	platform?: number;
	fromDate: number;
	toDate?: number;
	gender?: string;
	sentCount?: number;
}

declare interface EditAdminNotificationRequest extends NotificationId {
	image: string;
	title: string;
	link: string;
	message: string;
	appPlatform?: number;
	platform?: number;
	fromDate: number;
	toDate?: number;
	gender?: string;
	sentCount?: number;
}

declare interface SendAdminNotificationRequest extends AuthTokenData, UserId {
	image?: string;
	title: string;
	link: string;
	message: string;
}