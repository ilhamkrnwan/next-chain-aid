-- RLS Policies for campaign_update_images table
-- This allows organization users to insert and manage their campaign update images

-- Enable RLS on campaign_update_images (if not already enabled)
ALTER TABLE campaign_update_images ENABLE ROW LEVEL SECURITY;

-- Policy: Allow organization users to insert images for their own campaign updates
CREATE POLICY "Organizations can insert their campaign update images"
ON campaign_update_images
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM campaign_updates cu
    JOIN campaigns c ON c.id = cu.campaign_id
    WHERE cu.id = campaign_update_images.campaign_update_id
    AND c.creator_id = auth.uid()
  )
);

-- Policy: Allow organization users to view their campaign update images
CREATE POLICY "Organizations can view their campaign update images"
ON campaign_update_images
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM campaign_updates cu
    JOIN campaigns c ON c.id = cu.campaign_id
    WHERE cu.id = campaign_update_images.campaign_update_id
    AND c.creator_id = auth.uid()
  )
);

-- Policy: Allow public to view all campaign update images (for transparency)
CREATE POLICY "Public can view all campaign update images"
ON campaign_update_images
FOR SELECT
TO anon
USING (true);

-- Policy: Allow organization users to delete their campaign update images
CREATE POLICY "Organizations can delete their campaign update images"
ON campaign_update_images
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM campaign_updates cu
    JOIN campaigns c ON c.id = cu.campaign_id
    WHERE cu.id = campaign_update_images.campaign_update_id
    AND c.creator_id = auth.uid()
  )
);

-- Policy: Allow admins to manage all campaign update images
CREATE POLICY "Admins can manage all campaign update images"
ON campaign_update_images
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
