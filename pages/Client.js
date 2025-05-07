import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yxqdswberwmvuybqclwi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4cWRzd2JlcndtdnV5YnFjbHdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjQ0MDQsImV4cCI6MjA2MjEwMDQwNH0.pGSJP60z2Fi1Em5Qp2vC9ciKxsD1IB9GoI49tDfHMRk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
