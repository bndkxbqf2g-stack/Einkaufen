-- Keep the database payload contract aligned with the app backup arrays.
alter table app_private.household_state
  add constraint household_state_recipe_history_check
  check (
    case
      when payload ? 'recipeHistory' then
        case
          when jsonb_typeof(payload -> 'recipeHistory') = 'array'
            then jsonb_array_length(payload -> 'recipeHistory') <= 5000
          else false
        end
      else true
    end
  );
