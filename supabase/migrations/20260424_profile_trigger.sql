-- Automatically sync auth.users → public.profiles on OAuth sign-in.
-- Derives school_id by matching the email domain against the schools table.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_domain  TEXT;
  v_school_id UUID;
BEGIN
  v_domain := split_part(NEW.email, '@', 2);

  SELECT id INTO v_school_id
  FROM public.schools
  WHERE domain = v_domain
  LIMIT 1;

  INSERT INTO public.profiles (id, email, school_domain, school_id, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    v_domain,
    v_school_id,
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
