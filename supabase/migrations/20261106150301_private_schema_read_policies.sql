-- Private-schema tables remain absent from the Data API by default, but these
-- policies also protect them if a future configuration exposes the schema.
create index households_created_by_idx
  on app_private.households (created_by);

create index household_state_updated_by_idx
  on app_private.household_state (updated_by);

grant select on app_private.households,
  app_private.household_members,
  app_private.household_state
to authenticated;

create policy household_members_read_self
  on app_private.household_members
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    and not coalesce((select (auth.jwt() ->> 'is_anonymous')::boolean), false)
  );

create policy households_read_members
  on app_private.households
  for select
  to authenticated
  using (
    not coalesce((select (auth.jwt() ->> 'is_anonymous')::boolean), false)
    and exists (
      select 1
      from app_private.household_members as hm
      where hm.household_id = households.id
        and hm.user_id = (select auth.uid())
    )
  );

create policy household_state_read_members
  on app_private.household_state
  for select
  to authenticated
  using (
    not coalesce((select (auth.jwt() ->> 'is_anonymous')::boolean), false)
    and exists (
      select 1
      from app_private.household_members as hm
      where hm.household_id = household_state.household_id
        and hm.user_id = (select auth.uid())
    )
  );
