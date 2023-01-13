declare interface UserId {
	userId?: string;
}

declare interface AuthTokenData {
	tokenData?: any;
}
declare interface Device extends UserId {
	platform?: string;
	deviceId?: string;
	deviceToken?: string;
	refreshToken?: string;
	accessToken?: string;
	remoteAddress?: string;
	arn?: string;
	salt?: string;
	timezone?: number;
}

declare interface TokenData extends Device {
	socialLoginType?: string;
	socialId?: string;
	email?: string;
	name?: string;
	firstName?: string;
	middleName?: string;
	lastName?: string;
	countryCode?: string;
	mobileNo?: string;
	salt?: string;
	hash?: string;
	permission?: string[];
	accountLevel?: string;
	adminType?: string;
	created?: number;
	createdAt?: number;
}

declare interface ForgotPasswordRequest {
	email?: string;
	countryCode?: string;
	mobileNo?: string;
	forgotToken: string;
	userId: UserId;
}

declare interface ChangeForgotPasswordRequest {
	salt: any;
	password: string;
	hash?: string;
}

declare interface ChangePasswordRequest {
	password: string;
	oldPassword: string;
	salt?: string;
	hash?: string;
}

declare interface Pagination {
	pageNo?: number;
	limit?: number;
}

declare interface Filter {
	searchKey: string;
	sortBy: string;
	sortOrder: number | string;
	status?: string;
	fromDate?: number;
	toDate?: number;
	type?: string;
}

declare interface RefreshTokenRequest {
	refreshToken?: string;
}

declare interface Address {
	address: string;
	type?: string;
	coordinates: number[];
}

declare interface ListingRequest extends Pagination, Filter { }

declare interface BlockRequest {
	status: string;
	userId: string;
}

declare interface DeeplinkRequest {
	android?: string;
	ios?: string;
	fallback?: string;
	token: string;
	name: string;
	type?: string;
	accountLevel: string;
}

declare interface UsedByRequest {
	userId: string;
	total: number;
}

// Model Type For DAO manager
declare type ModelNames =
	"admins" |
	"admin_notifications" |
	"contacts" |
	"contents" |
	"login_histories" |
	"notifications" |
	"users" |
	"versions";