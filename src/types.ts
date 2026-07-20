export type Env = {
  Bindings: {
    itmoou_db: D1Database
    itmoou_files: R2Bucket
    ADMIN_PASSWORD: string
    RESEND_API_KEY: string
    CF_API_TOKEN: string
    TEAMS_WEBHOOK_URL: string
  }
}

export type AdminUser = {
  id: number
  name: string
  email: string
  role: string
  department: string
  password_hash: string
  salt: string
  created_at: string
}

export type AdminSession = {
  token: string
  user_id: number
  expires_at: string
}

export type ContactSubmission = {
  id: number
  name: string
  email: string
  phone: string
  inquiry_type: string
  message: string
  lang: string
  ticket_no: string
  status: string
  memo: string
  created_at: string
  assigned_to_id: number | null
  assigned_to_name: string | null
  assigned_to_id2: number | null
  assigned_to_name2: string | null
  ip: string | null
}

export type Announcement = {
  id: number
  number: number
  category: string
  title: string
  content: string
  title_en: string
  content_en: string
  notice_date: string
  created_at: string
  updated_at: string
}

export type NewsItem = {
  id: number
  title: string
  description: string
  title_en: string
  description_en: string
  date: string
  order_num: number
}

export type SlideItem = {
  id: number
  order_num: number
  title: string
  description: string
  title_en: string
  description_en: string
  image_filename: string
  active: number
}

export type HistoryItem = {
  id: number
  year: string
  content: string
  content_en: string
  order_num: number
}

export type SolutionData = {
  id: number
  slug: string
  subtitle: string
  description: string
  subtitle_en: string
  description_en: string
  f1_title: string; f1_desc: string
  f2_title: string; f2_desc: string
  f3_title: string; f3_desc: string
  f4_title: string; f4_desc: string
}

export type SolutionFeature = {
  id: number
  solution_slug: string
  order_num: number
  title: string
  description: string
  title_en: string
  description_en: string
  icon: string
  image_key: string
  image_position: string
}

export type Attachment = {
  id: number
  announcement_id: number
  filename: string
  storage_key: string
  size: number | null
  created_at: string
}
