export const API_BASE_URL = "eilflawyers.com/api/api/v1/"
export const REFRESH_TOKEN_ENDPOINT = `${API_BASE_URL}token/refresh/`;
export const LOGIN_ENDPOINT = `${API_BASE_URL}auth/login/`;
export const REGISTER_ENDPOINT = `${API_BASE_URL}auth/register/`;
export const PROFILE_ENDPOINT = `${API_BASE_URL}auth/profile/`;
export const PROFILE_UPDATE_ENDPOINT = `${API_BASE_URL}auth/profile/update/`;

export const CASES_ENDPOINT = `${API_BASE_URL}cases/`;
export const CASES_CREATE_ENDPOINT = `${API_BASE_URL}cases/create/`;

export const CASES_STATISTICS_ENDPOINT = `${API_BASE_URL}cases/statistics/`;
export const DOCUMENTS_ENDPOINT = `${API_BASE_URL}documents/`;
export const NOTES_ENDPOINT = `${API_BASE_URL}notes/`
export const NOTIFICATIONS_ENDPOINT = `${API_BASE_URL}notifications/`
export const UNREAD_NOTIFICATION = `${API_BASE_URL}notifications/unread-count/`
export const REQUESTS_CLIENTS_ENDPOINT = `${API_BASE_URL}marketplace/requests/client/`
export const SERVICES_LAWYERSENDPOINT = `${API_BASE_URL}marketplace/services/lawyer/`
//export const REQUESTS_CLIENTS_ENDPOINT = `${API_BASE_URL}marketplace/requests/client/`
//export const REQUESTS_CLIENTS_ENDPOINT = `${API_BASE_URL}marketplace/requests/client/`



// Contract endpoints
export const CONTRACTS_ENDPOINT = "/contracts/"
export const CONTRACT_DETAIL_ENDPOINT = (id: number) => `/contracts/${id}/`
export const CONTRACT_GENERATE_ENDPOINT = (id: number) => `/contracts/${id}/generate/`
export const CONTRACT_SIGN_ENDPOINT = (id: number) => `/contracts/${id}/sign/`
export const CONTRACT_REVIEW_ENDPOINT = (id: number) => `/contracts/${id}/review/`
export const CONTRACT_EXPORT_ENDPOINT = (id: number) => `/contracts/${id}/export/`
export const CONTRACT_ANALYZE_ENDPOINT = (id: number) => `/contracts/${id}/analyze/`
export const CONTRACT_ANALYTICS_ENDPOINT = "/contracts/analytics/"
export const CONTRACT_ENHANCE_ENDPOINT = (id: number) => `/contracts/${id}/enhance/`
export const SIGNATURE_VERIFY_ENDPOINT = (signatureId: number) => `/contracts/verify/${signatureId}/`
export const CONTRACT_SIGNATURES_ENDPOINT = (contractId: number) => `/contracts/${contractId}/signatures/`
export const CONTRACT_ASSIGN_LAWYER_ENDPOINT = (id: number) => `/contracts/${id}/assign-lawyer/`;

export const LAWYER_SERVICES_ENDPOINT = "/marketplace/services/lawyer/"
export const SERVICE_DETAIL_ENDPOINT = (id: number) => `/marketplace/services/${id}/`
export const CREATE_SERVICE_ENDPOINT = "/marketplace/services/create/"
export const SERVICE_UPDATE_ENDPOINT = (id: number) => `/marketplace/services/${id}/update/`
export const SERVICE_DELETE_ENDPOINT = (id: number) => `/marketplace/services/${id}/delete/`


export const MARKETPLACE_SERVICES_ENDPOINT = "/marketplace/services/"
export const REQUEST_SERVICE_ENDPOINT = "/marketplace/requests/create/"




export const AI_ASSISTANT_BASE_URL = "ai-assistant/";
export const WS_BASE_URL = "ws://localhost:8001/ws/ai-assistant/";

// AI Assistant endpoints
export const AI_RESPONSES_ENDPOINT = `${AI_ASSISTANT_BASE_URL}responses/`;
export const AI_RESPONSE_DETAIL_ENDPOINT = (id: number) => `${AI_ASSISTANT_BASE_URL}responses/${id}/`;
export const AI_RESPONSE_RATE_ENDPOINT = (id: number) => `${AI_ASSISTANT_BASE_URL}responses/${id}/rate/`;

// WebSocket endpoint
export const AI_WEBSOCKET_ENDPOINT = WS_BASE_URL;


export const INVOICES_LIST_ENDPOINT = "/invoices/";
export const INVOICE_DETAIL_ENDPOINT = (invoiceNumber: string) => `/invoices/${invoiceNumber}/`;
export const INVOICE_DOWNLOAD_ENDPOINT = (invoiceNumber: string) => `/${invoiceNumber}/download/`;




// ADMIN MANAGEMENT ENDPOINTS
export const ADMIN_USER_LIST_ENDPOINT = `${API_BASE_URL}users/`;
export const ADMIN_USER_DETAIL_ENDPOINT = (id: number) => `${API_BASE_URL}admin/users/${id}/`;
export const ADMIN_USER_UPDATE_ENDPOINT = (id: number) => `${API_BASE_URL}admin/users/${id}/update/`;
export const ADMIN_USER_DELETE_ENDPOINT = (id: number) => `${API_BASE_URL}admin/users/${id}/delete/`;
export const ADMIN_USER_TOGGLE_ACTIVE_ENDPOINT = (id: number) => `${API_BASE_URL}admin/users/${id}/toggle-active/`;
export const ADMIN_NOTIFICATION_CREATE_ENDPOINT = `${API_BASE_URL}admin/notifications/create/`;
export const USER_NOTIFICATION_LIST_ENDPOINT = `${API_BASE_URL}notifications/`;
export const USER_NOTIFICATION_MARK_READ_ENDPOINT = (id: number) => `${API_BASE_URL}notifications/${id}/mark-read/`;



// Admin marketplace endpoints
export const ADMIN_SERVICES_ENDPOINT = `${API_BASE_URL}marketplace/admin/services/`;
export const ADMIN_SERVICE_CREATE_ENDPOINT = `${API_BASE_URL}marketplace/admin/services/create/`;
export const ADMIN_SERVICE_UPDATE_ENDPOINT = (id: number) => `${API_BASE_URL}marketplace/admin/services/${id}/update/`;
export const ADMIN_SERVICE_DELETE_ENDPOINT = (id: number) => `${API_BASE_URL}marketplace/admin/services/${id}/delete/`;
export const ADMIN_PAYMENTS_ENDPOINT = `${API_BASE_URL}marketplace/admin/payments/`;
export const ADMIN_PAYMENT_UPDATE_ENDPOINT = (id: number) => `${API_BASE_URL}marketplace/admin/payments/${id}/update/`;
export const ADMIN_PAYMENT_DELETE_ENDPOINT = (id: number) => `${API_BASE_URL}marketplace/admin/payments/${id}/delete/`;
export const ADMIN_DOCUMENTS_ENDPOINT = `${API_BASE_URL}marketplace/admin/documents/`;
export const ADMIN_DOCUMENT_UPDATE_ENDPOINT = (id: number) => `${API_BASE_URL}marketplace/admin/documents/${id}/update/`;
export const ADMIN_DOCUMENT_DELETE_ENDPOINT = (id: number) => `${API_BASE_URL}marketplace/admin/documents/${id}/delete/`;
export const ADMIN_REVIEWS_ENDPOINT = `${API_BASE_URL}marketplace/admin/reviews/`;
export const ADMIN_REVIEW_UPDATE_ENDPOINT = (id: number) => `${API_BASE_URL}marketplace/admin/reviews/${id}/update/`;
export const ADMIN_REVIEW_DELETE_ENDPOINT = (id: number) => `${API_BASE_URL}marketplace/admin/reviews/${id}/delete/`;


export const ADMIN_CONTRACT_LIST_ENDPOINT = `${API_BASE_URL}admin/contracts/`;
export const ADMIN_CONTRACT_UPDATE_ENDPOINT = (id: number) => `${API_BASE_URL}admin/contracts/${id}/update/`;
export const ADMIN_CONTRACT_DELETE_ENDPOINT = (id: number) => `${API_BASE_URL}admin/contracts/${id}/delete/`;
export const ADMIN_CONTRACT_ASSIGN_LAWYER_ENDPOINT = (id: number) => `${API_BASE_URL}admin/contracts/${id}/assign-lawyer/`;
export const ADMIN_CONTRACT_STATUS_ENDPOINT = (id: number) => `${API_BASE_URL}admin/contracts/${id}/status/`;
export const ADMIN_CONTRACT_FORCE_SIGN_ENDPOINT = (id: number) => `${API_BASE_URL}admin/contracts/${id}/force-sign/`;
export const ADMIN_CONTRACT_EXPORT_ALL_ENDPOINT = `${API_BASE_URL}admin/contracts/export-all/`;





// ADMIN MANAGEMENT ENDPOINTS
export const ADMIN_POSTS_ENDPOINT = `${API_BASE_URL}admin/posts/`;
export const ADMIN_POSTS_STATS_ENDPOINT = `${API_BASE_URL}admin/posts/stats/`;
export const ADMIN_USER_CONTENT_CREATORS_ENDPOINT = `${API_BASE_URL}admin/users/content_creators/`;
