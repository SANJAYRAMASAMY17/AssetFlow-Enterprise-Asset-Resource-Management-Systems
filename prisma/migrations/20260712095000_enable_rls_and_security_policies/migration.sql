-- Create custom JWT verification functions
CREATE OR REPLACE FUNCTION public.verify_custom_jwt(token text, secret text)
RETURNS jsonb AS $$
DECLARE
  parts text[];
  header_json jsonb;
  payload_json jsonb;
  computed_sig text;
BEGIN
  parts := string_to_array(token, '.');
  IF array_length(parts, 1) <> 3 THEN
    RETURN NULL;
  END IF;
  
  -- Decode payload
  payload_json := convert_from(decode(rpad(translate(parts[2], '-_', '+/'), 4 * ((length(parts[2]) + 3) / 4), '='), 'base64'), 'UTF8')::jsonb;
  
  -- Check expiration
  IF (payload_json->>'exp')::numeric < extract(epoch from now()) THEN
    RETURN NULL;
  END IF;
  
  -- Verify signature
  computed_sig := translate(encode(hmac(parts[1] || '.' || parts[2], secret, 'sha256'), 'base64'), '+/=', '-_');
  computed_sig := replace(computed_sig, '=', ''); -- base64url strips padding
  
  IF computed_sig = parts[3] THEN
    RETURN payload_json;
  ELSE
    RETURN NULL;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_custom_auth_claims()
RETURNS jsonb AS $$
DECLARE
  auth_header text;
  token text;
  secret text;
BEGIN
  -- Get the header
  auth_header := current_setting('request.headers', true)::json->>'x-custom-auth';
  IF auth_header IS NULL THEN
    auth_header := current_setting('request.headers', true)::json->>'authorization';
  END IF;
  
  IF auth_header IS NULL OR NOT (auth_header LIKE 'Bearer %') THEN
    RETURN NULL;
  END IF;
  
  token := substring(auth_header from 8);
  -- The JWT_SECRET value from the environment
  secret := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnZmFuc3lva3V3dmJlZHZmdnZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4MjkxNDAsImV4cCI6MjA5OTQwNTE0MH0.dPV5ENAAn2aKOJrA7Xy01zRJCgIWmBJrzRyMpA5VaVo';
  
  RETURN public.verify_custom_jwt(token, secret);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security on all application tables
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Department" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Asset" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AssetCategory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Location" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AssetAllocation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."TransferRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ResourceBooking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."MaintenanceRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AuditCycle" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AuditItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ActivityLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."_AuditCycleAuditors" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."_prisma_migrations" ENABLE ROW LEVEL SECURITY;

-- Protect the User table password column from Supabase REST exposure
REVOKE SELECT (password) ON TABLE public."User" FROM anon, authenticated;

-- Revoke all on _prisma_migrations from REST API
REVOKE ALL ON TABLE public."_prisma_migrations" FROM anon, authenticated;

-- Ensure the assets bucket exists in storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies on objects to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to view" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update" ON storage.objects;
DROP POLICY IF EXISTS "Allow only admins and service_role to delete" ON storage.objects;

-- Configure storage policies for the assets bucket
CREATE POLICY "Allow authenticated users to view" ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'assets' AND (
    auth.role() = 'authenticated' OR
    public.get_custom_auth_claims() IS NOT NULL
  )
);

CREATE POLICY "Allow authenticated users to upload" ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'assets' AND (
    auth.role() = 'authenticated' OR
    public.get_custom_auth_claims() IS NOT NULL
  )
);

CREATE POLICY "Allow authenticated users to update" ON storage.objects
FOR UPDATE
TO public
USING (
  bucket_id = 'assets' AND (
    auth.role() = 'authenticated' OR
    public.get_custom_auth_claims() IS NOT NULL
  )
)
WITH CHECK (
  bucket_id = 'assets' AND (
    auth.role() = 'authenticated' OR
    public.get_custom_auth_claims() IS NOT NULL
  )
);

CREATE POLICY "Allow only admins and service_role to delete" ON storage.objects
FOR DELETE
TO public
USING (
  bucket_id = 'assets' AND (
    auth.role() = 'service_role' OR
    public.get_custom_auth_claims()->>'role' = 'ADMIN' OR
    EXISTS (
      SELECT 1 FROM public."User" u 
      WHERE u.id::text = auth.uid()::text AND u.role = 'ADMIN'
    )
  )
);
