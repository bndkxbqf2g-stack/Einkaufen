-- Keep JWT inspection in an initplan so the value is computed once per
-- statement rather than once per row.
alter policy household_members_read_self
  on app_private.household_members
  using (
    user_id = (select auth.uid())
    and not coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false)
  );

alter policy households_read_members
  on app_private.households
  using (
    not coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false)
    and exists (
      select 1
      from app_private.household_members as hm
      where hm.household_id = households.id
        and hm.user_id = (select auth.uid())
    )
  );

alter policy household_state_read_members
  on app_private.household_state
  using (
    not coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false)
    and exists (
      select 1
      from app_private.household_members as hm
      where hm.household_id = household_state.household_id
        and hm.user_id = (select auth.uid())
    )
  );
