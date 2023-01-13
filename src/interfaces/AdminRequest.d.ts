declare interface CreateAdminRequest extends Device {
	name: string;
	email: string;
	password: string;
	adminType?: number;
	lastLogout?: number;
}

declare interface AdminLoginRequest extends Device {
	email?: string;
	password?: string;
	salt?: string;
	hash?: string;
}

declare interface EditProfileRequest extends AuthTokenData {
	name: string;
	email: string;
}