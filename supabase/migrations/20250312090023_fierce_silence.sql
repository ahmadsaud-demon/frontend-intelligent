/*
  # Add Billing and Analytics Support

  1. New Tables
    - `subscriptions`
      - Track school subscription status and details
    - `api_usage`
      - Track API calls per school for billing
    - `billing_invoices`
      - Store billing history and details

  2. Security
    - Enable RLS on all tables
    - Add policies for system and school admins
*/

-- Create subscriptions table
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) NOT NULL,
  plan_name text NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'inactive', 'trial', 'expired')),
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  max_users integer NOT NULL DEFAULT 100,
  max_api_calls integer NOT NULL DEFAULT 10000,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create api_usage table
CREATE TABLE api_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) NOT NULL,
  endpoint text NOT NULL,
  method text NOT NULL,
  status_code integer NOT NULL,
  response_time integer NOT NULL, -- in milliseconds
  timestamp timestamptz DEFAULT now()
);

-- Create billing_invoices table
CREATE TABLE billing_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) NOT NULL,
  amount decimal(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL CHECK (status IN ('draft', 'pending', 'paid', 'void')),
  due_date timestamptz NOT NULL,
  paid_date timestamptz,
  billing_period_start timestamptz NOT NULL,
  billing_period_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_invoices ENABLE ROW LEVEL SECURITY;

-- Create policies for subscriptions
CREATE POLICY "System admins can manage all subscriptions"
  ON subscriptions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'system_admin'
    )
  );

CREATE POLICY "School admins can view their subscription"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'school_admin'
      AND users.school_id = subscriptions.school_id
    )
  );

-- Create policies for api_usage
CREATE POLICY "System admins can view all API usage"
  ON api_usage
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'system_admin'
    )
  );

CREATE POLICY "School admins can view their API usage"
  ON api_usage
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'school_admin'
      AND users.school_id = api_usage.school_id
    )
  );

-- Create policies for billing_invoices
CREATE POLICY "System admins can manage all invoices"
  ON billing_invoices
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'system_admin'
    )
  );

CREATE POLICY "School admins can view their invoices"
  ON billing_invoices
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'school_admin'
      AND users.school_id = billing_invoices.school_id
    )
  );

-- Create indexes for performance
CREATE INDEX idx_api_usage_school_timestamp ON api_usage(school_id, timestamp);
CREATE INDEX idx_subscriptions_school_status ON subscriptions(school_id, status);
CREATE INDEX idx_billing_invoices_school_status ON billing_invoices(school_id, status);