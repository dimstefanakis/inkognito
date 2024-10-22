create table "public"."posts" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "lat" numeric,
    "lng" numeric,
    "content" text,
    "views" numeric default '0'::numeric
);


alter table "public"."posts" enable row level security;

CREATE UNIQUE INDEX posts_pkey ON public.posts USING btree (id);

alter table "public"."posts" add constraint "posts_pkey" PRIMARY KEY using index "posts_pkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.increment_multiple_views(post_ids uuid[])
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.posts
  SET views = COALESCE(views, 0) + 1
  WHERE id = ANY(post_ids);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.increment_post_views()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE posts
  SET views = views + 1
  WHERE id = NEW.id;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.increment_view(post_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.posts
  SET views = COALESCE(views, 0) + 1
  WHERE id = post_id;
END;
$function$
;

grant delete on table "public"."posts" to "anon";

grant insert on table "public"."posts" to "anon";

grant references on table "public"."posts" to "anon";

grant select on table "public"."posts" to "anon";

grant trigger on table "public"."posts" to "anon";

grant truncate on table "public"."posts" to "anon";

grant update on table "public"."posts" to "anon";

grant delete on table "public"."posts" to "authenticated";

grant insert on table "public"."posts" to "authenticated";

grant references on table "public"."posts" to "authenticated";

grant select on table "public"."posts" to "authenticated";

grant trigger on table "public"."posts" to "authenticated";

grant truncate on table "public"."posts" to "authenticated";

grant update on table "public"."posts" to "authenticated";

grant delete on table "public"."posts" to "service_role";

grant insert on table "public"."posts" to "service_role";

grant references on table "public"."posts" to "service_role";

grant select on table "public"."posts" to "service_role";

grant trigger on table "public"."posts" to "service_role";

grant truncate on table "public"."posts" to "service_role";

grant update on table "public"."posts" to "service_role";

create policy "Enable insert access for all users"
on "public"."posts"
as permissive
for insert
to public
with check (true);


create policy "Enable read access for all users"
on "public"."posts"
as permissive
for select
to public
using (true);



