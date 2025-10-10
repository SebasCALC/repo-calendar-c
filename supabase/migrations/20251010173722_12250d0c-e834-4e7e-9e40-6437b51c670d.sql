create function public.ensure_user_role()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_roles (user_id, role)
  values (auth.uid(), 'user')
  on conflict (user_id, role) do nothing;
end;
$$;

grant execute on function public.ensure_user_role() to authenticated;