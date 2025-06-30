-- Leadsy Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor to set up the database

-- Create the leadsy_settings table
CREATE TABLE IF NOT EXISTS leadsy_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) - optional for admin-only access
ALTER TABLE leadsy_settings ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access (for the main website)
CREATE POLICY "Allow public read access" ON leadsy_settings
    FOR SELECT USING (true);

-- Create a policy to allow public insert/update access (for admin panel)
-- In production, you'd want to restrict this to authenticated admin users
CREATE POLICY "Allow public write access" ON leadsy_settings
    FOR ALL USING (true);

-- Create an index on the key column for faster lookups
CREATE INDEX IF NOT EXISTS idx_leadsy_settings_key ON leadsy_settings(key);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_leadsy_settings_updated_at
    BEFORE UPDATE ON leadsy_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings
INSERT INTO leadsy_settings (key, value) VALUES
    ('upi-id', 'pateldhaval063-5@okhdfcbank'),
    ('qr-code', 'https://cdn.builder.io/api/v1/assets/5cd7d452df194143adae29a269935d3d/googlepay_qr-1-54dabb?format=webp&width=800'),
    ('original-price', '9999'),
    ('discounted-price', '999'),
    ('timer', '{"hours": 4, "minutes": 0, "seconds": 0}'),
    ('meta-pixel', ''),
    ('admin-username', 'admin'),
    ('admin-password', 'admin123')
ON CONFLICT (key) DO NOTHING;

-- Insert default categories
INSERT INTO leadsy_settings (key, value) VALUES (
    'categories',
    '[
        {"id": 1, "name": "Pincode-wise Business Data", "count": "5.2 Cr+"},
        {"id": 2, "name": "Statewise Business Data", "count": "4.3 Cr+"},
        {"id": 3, "name": "Online Shoppers", "count": "4.1 Cr+"},
        {"id": 4, "name": "B2C Consumer Leads", "count": "3.9 Cr+"},
        {"id": 5, "name": "Import-Export Businesses", "count": "3.2 Cr+"},
        {"id": 6, "name": "Indiamart, Yellow Pages & Sulekha Leads", "count": "3.1 Cr+"},
        {"id": 7, "name": "Retailers & Wholesalers", "count": "2.8 Cr+"},
        {"id": 8, "name": "Ecommerce Sellers (Amazon, Flipkart)", "count": "2.7 Cr+"},
        {"id": 9, "name": "Distributors & Dealers", "count": "2.6 Cr+"},
        {"id": 10, "name": "Fashion & Beauty Enthusiasts", "count": "2.5 Cr+"},
        {"id": 11, "name": "Spa & Salon Owners", "count": "68 L+"},
        {"id": 12, "name": "Content Creators & Influencers", "count": "49 L+"},
        {"id": 13, "name": "Travel Agents & Agencies", "count": "1.25 Cr+"},
        {"id": 14, "name": "Chemist & Pharmacist Database", "count": "84 L+"},
        {"id": 15, "name": "HR Professionals & Recruiters", "count": "78 L+"},
        {"id": 16, "name": "Dairy & Agro Businesses", "count": "65 L+"},
        {"id": 17, "name": "Students (College/Competitive Exam)", "count": "1.05 Cr+"},
        {"id": 18, "name": "CA, CS & Financial Advisors", "count": "1.4 Cr+"},
        {"id": 19, "name": "App Developers & SaaS Companies", "count": "1.7 Cr+"},
        {"id": 20, "name": "IT Companies (Product & Service Based)", "count": "2.2 Cr+"},
        {"id": 21, "name": "Garment Manufacturers", "count": "1.2 Cr+"},
        {"id": 22, "name": "Manufacturing Companies", "count": "2.4 Cr+"},
        {"id": 23, "name": "Wedding Planners & Decorators", "count": "55 L+"},
        {"id": 24, "name": "B2B Business Data", "count": "1.8 Cr+"},
        {"id": 25, "name": "Real Estate Agents & Builders", "count": "95 L+"},
        {"id": 26, "name": "Freelancers & Digital Marketers", "count": "1.9 Cr+"},
        {"id": 27, "name": "Online Business Owners", "count": "2.1 Cr+"},
        {"id": 28, "name": "Tutors, Trainers & Institutes", "count": "39 L+"},
        {"id": 29, "name": "Shop Owners (Various Categories)", "count": "2.3 Cr+"},
        {"id": 30, "name": "Printing & Publishing Houses", "count": "51 L+"},
        {"id": 31, "name": "Logistics & Transport Companies", "count": "1.6 Cr+"},
        {"id": 32, "name": "Hospital & Clinic Contacts", "count": "98 L+"},
        {"id": 33, "name": "Gym & Fitness Enthusiasts", "count": "48 L+"},
        {"id": 34, "name": "Interior Designers", "count": "71 L+"},
        {"id": 35, "name": "Civil Engineers & Architects", "count": "61 L+"},
        {"id": 36, "name": "Event Management Companies", "count": "74 L+"},
        {"id": 37, "name": "Startups & Entrepreneurs", "count": "1.5 Cr+"},
        {"id": 38, "name": "Stationery Wholesalers", "count": "42 L+"},
        {"id": 39, "name": "Schools & Educational Institutes", "count": "64 L+"},
        {"id": 40, "name": "Advertising Agencies", "count": "52 L+"},
        {"id": 41, "name": "Consultants & Trainers", "count": "89 L+"},
        {"id": 42, "name": "Lawyers & Legal Advisors", "count": "62 L+"},
        {"id": 43, "name": "Jewellery Shop Owners", "count": "67 L+"},
        {"id": 44, "name": "FMCG Distributors", "count": "1.3 Cr+"},
        {"id": 45, "name": "Automobile Dealers", "count": "72 L+"},
        {"id": 46, "name": "Hardware & Tools Suppliers", "count": "59 L+"},
        {"id": 47, "name": "Hotel & Resort Owners", "count": "41 L+"},
        {"id": 48, "name": "Retail Electronics Stores", "count": "1.1 Cr+"},
        {"id": 49, "name": "Wholesale Grocery Suppliers", "count": "45 L+"},
        {"id": 50, "name": "Miscellaneous Business Services", "count": "37 L+"}
    ]'
) ON CONFLICT (key) DO NOTHING;

-- Insert default sample data
INSERT INTO leadsy_settings (key, value) VALUES (
    'sample-data',
    '[
        {
            "id": 1,
            "category": "Business Category 1",
            "records": "1000+ Records",
            "image": "https://cdn.builder.io/api/v1/assets/5cd7d452df194143adae29a269935d3d/image-cacc7d?format=webp&width=800"
        },
        {
            "id": 2,
            "category": "Business Category 2",
            "records": "800+ Records",
            "image": "https://cdn.builder.io/api/v1/assets/5cd7d452df194143adae29a269935d3d/image-cacc7d?format=webp&width=800"
        },
        {
            "id": 3,
            "category": "Business Category 3",
            "records": "1200+ Records",
            "image": "https://cdn.builder.io/api/v1/assets/5cd7d452df194143adae29a269935d3d/image-cacc7d?format=webp&width=800"
        },
        {
            "id": 4,
            "category": "Business Category 4",
            "records": "600+ Records",
            "image": "https://cdn.builder.io/api/v1/assets/5cd7d452df194143adae29a269935d3d/image-cacc7d?format=webp&width=800"
        }
    ]'
) ON CONFLICT (key) DO NOTHING;

-- Enable real-time subscriptions for the table
-- This allows the website to receive live updates when admin makes changes
ALTER PUBLICATION supabase_realtime ADD TABLE leadsy_settings;
