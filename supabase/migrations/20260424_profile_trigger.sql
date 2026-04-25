-- Sync auth.users → public.profiles on every new sign-in.
-- Fail-safe: any error inside is caught so the user can always log in.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_domain    TEXT;
  v_school_id BIGINT;   -- matches schools.id (bigint generated always as identity)
BEGIN
  v_domain := lower(split_part(NEW.email, '@', 2));

  -- School lookup: stays NULL for unknown/non-.edu domains — never crashes.
  BEGIN
    SELECT id INTO v_school_id
    FROM public.schools
    WHERE domain = v_domain
    LIMIT 1;
  EXCEPTION WHEN OTHERS THEN
    v_school_id := NULL;
  END;

  -- Profile insert: if anything goes wrong, log a warning and let auth proceed.
  BEGIN
    INSERT INTO public.profiles (id, email, full_name, school_id, created_at)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(
        NEW.raw_user_meta_data ->> 'full_name',
        NEW.raw_user_meta_data ->> 'name',
        split_part(NEW.email, '@', 1)
      ),
      v_school_id,
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user: profile insert failed for % — %', NEW.email, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
