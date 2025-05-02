export type Interviewer = {
  id: string;
  name: string;
  image?: string;
  role?: string;
  status?: 'Active' | 'Inactive' | 'Draft';
  personality_traits?: string[];
  interviews_count?: number;
  last_used?: string;
};
