-- Create gym_owner_applications table for storing gym ownership applications
CREATE TABLE IF NOT EXISTS gym_owner_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  business_name TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  website TEXT,
  message TEXT,
  documents TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id),
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create partial unique index to ensure one pending application per user-gym combination
CREATE UNIQUE INDEX unique_pending_application 
  ON gym_owner_applications(user_id, gym_id) 
  WHERE status = 'pending';

-- Create indexes for performance
CREATE INDEX idx_gym_owner_applications_user_id ON gym_owner_applications(user_id);
CREATE INDEX idx_gym_owner_applications_gym_id ON gym_owner_applications(gym_id);
CREATE INDEX idx_gym_owner_applications_status ON gym_owner_applications(status);
CREATE INDEX idx_gym_owner_applications_applied_at ON gym_owner_applications(applied_at DESC);

-- Enable RLS
ALTER TABLE gym_owner_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own applications
CREATE POLICY "Users can view own applications"
  ON gym_owner_applications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create applications for themselves
CREATE POLICY "Users can create own applications"
  ON gym_owner_applications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can cancel their own pending applications
CREATE POLICY "Users can cancel own pending applications"
  ON gym_owner_applications
  FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (status = 'cancelled');

-- Admin users can view all applications
-- Check if user has admin role
CREATE POLICY "Admins can view all applications"
  ON gym_owner_applications
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  ));

-- Admin users can update application status
CREATE POLICY "Admins can update applications"
  ON gym_owner_applications
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  ));

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_gym_owner_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_gym_owner_applications_updated_at
  BEFORE UPDATE ON gym_owner_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_gym_owner_applications_updated_at();

-- Add trigger to automatically approve and create gym_owner entry when approved
CREATE OR REPLACE FUNCTION process_approved_gym_owner_application()
RETURNS TRIGGER AS $$
BEGIN
  -- When an application is approved, create gym_owner entry
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Insert into gym_owners table if not exists
    INSERT INTO gym_owners (user_id, gym_id)
    VALUES (NEW.user_id, NEW.gym_id)
    ON CONFLICT (user_id, gym_id) DO NOTHING;
    
    -- Update user role to gym_owner if not already
    UPDATE users 
    SET is_gym_owner = true 
    WHERE id = NEW.user_id;
    
    -- Set reviewed timestamp
    NEW.reviewed_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER process_approved_application
  BEFORE UPDATE ON gym_owner_applications
  FOR EACH ROW
  WHEN (NEW.status = 'approved')
  EXECUTE FUNCTION process_approved_gym_owner_application();;
