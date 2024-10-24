create table "public"."replies" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "post_id" uuid,
    "content" text,
    "upvotes" numeric default '0'::numeric
);


alter table "public"."replies" enable row level security;

CREATE UNIQUE INDEX replies_pkey ON public.replies USING btree (id);

alter table "public"."replies" add constraint "replies_pkey" PRIMARY KEY using index "replies_pkey";

alter table "public"."replies" add constraint "replies_post_id_fkey" FOREIGN KEY (post_id) REFERENCES posts(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."replies" validate constraint "replies_post_id_fkey";

grant delete on table "public"."replies" to "anon";

grant insert on table "public"."replies" to "anon";

grant references on table "public"."replies" to "anon";

grant select on table "public"."replies" to "anon";

grant trigger on table "public"."replies" to "anon";

grant truncate on table "public"."replies" to "anon";

grant update on table "public"."replies" to "anon";

grant delete on table "public"."replies" to "authenticated";

grant insert on table "public"."replies" to "authenticated";

grant references on table "public"."replies" to "authenticated";

grant select on table "public"."replies" to "authenticated";

grant trigger on table "public"."replies" to "authenticated";

grant truncate on table "public"."replies" to "authenticated";

grant update on table "public"."replies" to "authenticated";

grant delete on table "public"."replies" to "service_role";

grant insert on table "public"."replies" to "service_role";

grant references on table "public"."replies" to "service_role";

grant select on table "public"."replies" to "service_role";

grant trigger on table "public"."replies" to "service_role";

grant truncate on table "public"."replies" to "service_role";

grant update on table "public"."replies" to "service_role";

create policy "Enable insert for everyone"
on "public"."replies"
as permissive
for insert
to public
with check (true);


create policy "Enable read access for all users"
on "public"."replies"
as permissive
for select
to public
using (true);



