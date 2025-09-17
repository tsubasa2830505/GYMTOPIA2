-- Part 2: Create geographic indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_gyms_lat_lng ON gyms(latitude, longitude) 
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_gyms_prefecture_city ON gyms(prefecture, city);

-- Create a spatial point index using btree_gist extension
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Create functional index for distance calculations
CREATE INDEX IF NOT EXISTS idx_gyms_location ON gyms 
  USING gist(point(longitude, latitude))
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;;
