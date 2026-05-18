// Hand-rolled DB types. Will be replaced by `supabase gen types typescript`
// once the project is linked. Keep in sync with supabase/migrations/0001_initial.sql.

export type ApplicationStage =
  | "wishlist"
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "rejected"
  | "withdrawn";

export const APPLICATION_STAGES: readonly ApplicationStage[] = [
  "wishlist",
  "applied",
  "screening",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
] as const;

export const STAGE_LABELS: Record<ApplicationStage, string> = {
  wishlist: "Wishlist",
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export type ChatMessage = {
  role: "interviewer" | "user" | "system";
  content: string;
  timestamp: string;
};

export type CompanyResearch = {
  values: string[];
  recent_news: string[];
  culture_notes: string[];
  likely_questions: string[];
};

export type InterviewFeedback = {
  strengths: string[];
  gaps: string[];
  suggested_followups: string[];
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          course: string | null;
          graduation_year: number | null;
          resume_text: string | null;
          avatar_url: string | null;
          gmail_refresh_token_encrypted: string | null;
          gmail_email: string | null;
          gmail_last_synced_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          course?: string | null;
          graduation_year?: number | null;
          resume_text?: string | null;
          avatar_url?: string | null;
          gmail_refresh_token_encrypted?: string | null;
          gmail_email?: string | null;
          gmail_last_synced_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      jobs: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          company: string;
          location: string | null;
          description: string | null;
          source_url: string;
          posted_at: string | null;
          ai_match_score: number | null;
          ai_match_reasons: string[] | null;
          discovered_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          company: string;
          location?: string | null;
          description?: string | null;
          source_url: string;
          posted_at?: string | null;
          ai_match_score?: number | null;
          ai_match_reasons?: string[] | null;
          discovered_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["jobs"]["Insert"]>;
        Relationships: [];
      };
      applications: {
        Row: {
          id: string;
          user_id: string;
          job_id: string | null;
          company: string;
          position: string | null;
          stage: ApplicationStage;
          applied_at: string | null;
          last_email_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          job_id?: string | null;
          company: string;
          position?: string | null;
          stage?: ApplicationStage;
          applied_at?: string | null;
          last_email_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["applications"]["Insert"]>;
        Relationships: [];
      };
      email_events: {
        Row: {
          id: string;
          user_id: string;
          application_id: string | null;
          gmail_message_id: string | null;
          subject: string | null;
          snippet: string | null;
          ai_classified_stage: ApplicationStage | null;
          ai_summary: string | null;
          received_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          application_id?: string | null;
          gmail_message_id?: string | null;
          subject?: string | null;
          snippet?: string | null;
          ai_classified_stage?: ApplicationStage | null;
          ai_summary?: string | null;
          received_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["email_events"]["Insert"]>;
        Relationships: [];
      };
      interviews: {
        Row: {
          id: string;
          user_id: string;
          company: string;
          ai_research: CompanyResearch | null;
          transcript: ChatMessage[];
          feedback: InterviewFeedback | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company: string;
          ai_research?: CompanyResearch | null;
          transcript?: ChatMessage[];
          feedback?: InterviewFeedback | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["interviews"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: { application_stage: ApplicationStage };
    CompositeTypes: Record<string, never>;
  };
};
