import { createClient } from '@supabase/supabase-js';

// Supplied Supabase Credentials
const supabaseUrl = 'https://simeqwxkzaixmsirqvfb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpbWVxd3hremFpeG1zaXJxdmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxOTU5MTksImV4cCI6MjA5Mjc3MTkxOX0.pNaDDBE9aAy7obtm91ufjZ-NF5Qbpdp4Sx8N7tG6dks';

// Initialize Global Connection
export const supabase = createClient(supabaseUrl, supabaseKey);
