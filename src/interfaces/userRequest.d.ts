declare interface UserData {
	_id?: string;
	email?: string;
	countryCode?: string;
	mobileNo?: string;
	salt?: string;
	hash?: string;
	socialLoginType?: string;
	socialId?: string;
	facebookId?: string;
	isFacebookLogin?: boolean;
	googleId?: string;
	isGoogleLogin?: boolean;
	dob?: number;
	age?: number;
	gender?: string;
	profilePicture?: string;
}

declare interface SignupRequest extends Device {
	email?: string;
	password: string;
	countryCode?: string;
	mobileNo?: string;
	userName: string;
	// middleName: string;
	// lastName: string;
	createdAt?: number;
}

declare interface LoginRequest extends Device, UserData {
	email?: string;
	password: string;
	countryCode?: string;
	mobileNo?: string;
}

declare interface SocialLoginRequest extends Device, UserData {
	email?: string;
	password?: string;
	countryCode?: string;
	mobileNo?: string;
	firstName: string;
	middleName: string;
	lastName: string;
}

declare interface MultiBlockRequest extends AuthTokenData {
	userIds: string[];
	status: number;
}

declare interface DeleteRequest extends AuthTokenData, UserId { }

declare interface ImportUsersRequest extends AuthTokenData {
	file: any;
}