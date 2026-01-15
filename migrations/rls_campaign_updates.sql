-- RLS Policies for campaign_updates table
-- This allows organization users to create and manage their campaign updates

-- Enable RLS on campaign_updates (if not already enabled)
ALTER TABLE campaign_updates ENABLE ROW LEVEL SECURITY;

-- Policy: Allow organization users to insert updates for their own campaigns
CREATE POLICY "Organizations can insert their campaign updates"
ON campaign_updates
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM campaigns
    WHERE campaigns.id = campaign_updates.campaign_id
    AND campaigns.creator_id = auth.uid()
  )
);

-- Policy: Allow organization users to view their campaign updates
CREATE POLICY "Organizations can view their campaign updates"
ON campaign_updates
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM campaigns
    WHERE campaigns.id = campaign_updates.campaign_id
    AND campaigns.creator_id = auth.uid()
  )
);

-- Policy: Allow public to view all campaign updates (for transparency)
CREATE POLICY "Public can view all campaign updates"
ON campaign_updates
FOR SELECT
TO anon
USING (true);

-- Policy: Allow organization users to update their campaign updates
CREATE POLICY "Organizations can update their campaign updates"
ON campaign_updates
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM campaigns
    WHERE campaigns.id = campaign_updates.campaign_id
    AND campaigns.creator_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM campaigns
    WHERE campaigns.id = campaign_updates.campaign_id
    AND campaigns.creator_id = auth.uid()
  )
);

-- Policy: Allow organization users to delete their campaign updates
CREATE POLICY "Organizations can delete their campaign updates"
ON campaign_updates
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM campaigns
    WHERE campaigns.id = campaign_updates.campaign_id
    AND campaigns.creator_id = auth.uid()
  )
);

-- Policy: Allow admins to manage all campaign updates
CREATE POLICY "Admins can manage all campaign updates"
ON campaign_updates
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
