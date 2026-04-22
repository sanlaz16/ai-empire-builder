-- Add image_url column to product_index for easier access
ALTER TABLE product_index ADD COLUMN IF NOT EXISTS image_url text;

-- Populate image_url from the first element of images array if available
UPDATE product_index 
SET image_url = images[1] 
WHERE image_url IS NULL AND images IS NOT NULL AND cardinality(images) > 0;
