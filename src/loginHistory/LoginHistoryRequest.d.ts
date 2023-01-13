declare interface LoginHistoryRequest extends Device {
	isLogin?: boolean;
	lastLogout?: number;
	lastLogin?: number;
}