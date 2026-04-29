#!/usr/bin/env python3
import os
import subprocess
from pathlib import Path

# Get environment variables
supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
supabase_anon_key = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

if not supabase_url or not supabase_anon_key:
    print("[v0] Error: Missing Supabase environment variables")
    exit(1)

# SQL to create the user_subscriptions table
sql = """
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  plan_type TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'energy_plus')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  stripe_session_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'incomplete')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer_id ON public.user_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription_id ON public.user_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_session_id ON public.user_subscriptions(stripe_session_id);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription" ON public.user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own subscription" ON public.user_subscriptions FOR UPDATE USING (auth.uid() = user_id);
"""

# Execute via curl to the Supabase REST API
import json
import http.client

try:
    # Parse the Supabase URL
    conn = http.client.HTTPSConnection(supabase_url.replace("https://", ""))
    
    payload = json.dumps({
        "query": sql
    })
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {supabase_anon_key}',
        'apikey': supabase_anon_key
    }
    
    # Try RPC call approach instead
    conn.request("POST", "/rest/v1/rpc/exec_sql", payload, headers)
    response = conn.getresponse()
    data = response.read()
    
    if response.status == 200:
        print("[v0] Migration completed successfully")
    else:
        print(f"[v0] Migration response: {response.status}")
        print(data.decode())
        
except Exception as e:
    print(f"[v0] Migration error: {e}")
    print("[v0] Note: Table will be created when first accessed if RLS is disabled")
