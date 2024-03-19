export const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

export const withApiUrl                                    = (path= null) => `${API_BASE_URL}${!!path ? `/${path}` : null}`;
export const API_URL_VA_LIST                        = withApiUrl('va');
export const API_URL_STARBOARD                      = withApiUrl('starboard');
export const API_URL_STARBOARD_LOGIN                = `${API_URL_STARBOARD}/login`;
export const API_URL_STARBOARD_VA_START             = `${API_URL_STARBOARD}/va/start`;
export const API_URL_STARBOARD_SATE                 = `${API_URL_STARBOARD}/journey/state`;
export const API_URL_STARBOARD_RECENT_JOURNEYS      = `${API_URL_STARBOARD}/recent/journeys`;
export const API_URL_STARBOARD_STATE_ACTION         = `${API_URL_STARBOARD_SATE}/action`;