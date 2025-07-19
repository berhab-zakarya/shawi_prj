export interface UserAnalytics {
  total: number;
  by_role: {
    Admin: number;
    Lawyer: number;
    Client: number;
    "No Role": number;
  };
  new_users_last_30_days: number;
  active_users: number;
  inactive_users: number;
}

export interface DocumentAnalytics {
  total: number;
  by_type: {
    PDF: number;
    DOCX: number;
    TXT: number;
  };
  analyses_performed: number;
  avg_confidence_score: number;
}

export interface InvoiceAnalytics {
  total: number;
  by_status: {
    draft: number;
    sent: number;
    paid: number;
    cancelled: number;
  };
  overdue: number;
  total_revenue: number;
}

export interface ContractAnalytics {
  total: number;
  by_status: {
    DRAFT: number;
    UNDER_REVIEW: number;
    APPROVED: number;
    REJECTED: number;
    SIGNED_BY_CLIENT: number;
    SIGNED_BY_LAWYER: number;
    COMPLETED: number;
    EXPORTED: number;
  };
  by_type: {
    EMPLOYMENT: number;
    NDA: number;
    FREELANCE: number;
    LEASE: number;
    PARTNERSHIP: number;
    SALES: number;
    CUSTOM: number;
  };
  avg_review_time_days: number;
}

export interface MarketplaceAnalytics {
  service_requests: {
    total: number;
    by_status: {
      Pending: number;
      Accepted: number;
      Paid: number;
      "In Progress": number;
      Delivered: number;
      Completed: number;
    };
  };
  payments: {
    total: number;
    total_revenue: number;
  };
  avg_review_rating: number;
}

export interface ContentAnalytics {
  total_posts: number;
  by_content_type: {
    article: number;
    video: number;
    infographic: number;
    faq: number;
  };
  featured_posts: number;
  total_views: number;
  top_tags: Array<{
    name: string;
    count: number;
  }>;
}

export interface NotificationAnalytics {
  total: number;
  by_priority: {
    low: number;
    medium: number;
    high: number;
  };
  unread: number;
}