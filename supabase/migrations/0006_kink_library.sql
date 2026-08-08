-- MUTUAL – 0006: Kink-Library-Datenmodell.
-- Erweitert question_cards um Kontext, Sensitivität, Opt-in und Consent-Hinweise,
-- öffnet die Kategorienliste für die neue Bibliothek und deaktiviert die alte,
-- zu vorsichtige Kartengeneration (außer Gesprächsimpulse und Nachsorge-Basics).

alter table public.question_cards
  add column if not exists context text check (char_length(context) <= 400),
  add column if not exists content_sensitivity text not null default 'standard'
    check (content_sensitivity in ('standard','explicit','advanced')),
  add column if not exists requires_opt_in boolean not null default false,
  add column if not exists consent_note text check (char_length(consent_note) <= 400);

-- Kategorien: alte bleiben gültig (Wishes/Impulse), neue kommen hinzu.
alter table public.question_cards drop constraint question_cards_category_check;
alter table public.question_cards add constraint question_cards_category_check
  check (category in (
    -- legacy (v1-Seed, Wishes, Impulse)
    'naehe_atmosphaere','kommunikation','initiative','rollen_dynamik',
    'langsames_ausprobieren','sinnliche_wahrnehmung','kleidung_inszenierung',
    'fantasie_rollenspiel','beobachten_gesehen_werden','kontrolle',
    'orte_situationen','hilfsmittel','intensitaet','neues_ausprobieren',
    'digitale_naehe','nachsorge','grenzen_tabus','gespraechsimpulse',
    -- v2 Kink-Bibliothek
    'dominanz_unterwerfung','befehle_regeln','machtgefaelle',
    'fesseln_fixierung','sinnesentzug','spanking_schmerzreize',
    'dirty_talk','lob_verehrung','erniedrigung',
    'orgasmuskontrolle','teasing_verzoegerung','toys',
    'rollenspiele','uniformen_rollenbilder','beobachten_zeigen',
    'fotos_aufnahmen','digitale_intimitaet','orte_atmosphaere',
    'service_hingabe','rollenwechsel','sinnliche_langsamkeit',
    'koerperliche_kontrolle','mehrere_erwachsene_fantasie','besitz_rituale',
    'initiative_ueberraschung','fantasie_ohne_umsetzung'
  ));

alter table public.custom_wishes drop constraint custom_wishes_category_check;
alter table public.custom_wishes add constraint custom_wishes_category_check
  check (category in (
    'naehe_atmosphaere','kommunikation','initiative','rollen_dynamik',
    'langsames_ausprobieren','sinnliche_wahrnehmung','kleidung_inszenierung',
    'fantasie_rollenspiel','beobachten_gesehen_werden','kontrolle',
    'orte_situationen','hilfsmittel','intensitaet','neues_ausprobieren',
    'digitale_naehe','nachsorge','grenzen_tabus',
    'dominanz_unterwerfung','befehle_regeln','machtgefaelle',
    'fesseln_fixierung','sinnesentzug','spanking_schmerzreize',
    'dirty_talk','lob_verehrung','erniedrigung',
    'orgasmuskontrolle','teasing_verzoegerung','toys',
    'rollenspiele','uniformen_rollenbilder','beobachten_zeigen',
    'fotos_aufnahmen','digitale_intimitaet','orte_atmosphaere',
    'service_hingabe','rollenwechsel','sinnliche_langsamkeit',
    'koerperliche_kontrolle','mehrere_erwachsene_fantasie','besitz_rituale',
    'initiative_ueberraschung','fantasie_ohne_umsetzung'
  ));

-- Alte, zu generische Karten deaktivieren. Antworten darauf bleiben erhalten
-- (Referenzen bestehen weiter), sie erscheinen nur nicht mehr im Deck.
update public.question_cards
  set active = false
  where slug ~ '^(na|ko|in|ro|la|si|kl|fa|be|kn|or|hi|it|ne|di|gr)-\d\d$';
-- Behalten: gi-* (Impulse) und ns-* (Nachsorge-Basiskarten).

-- Discovery-Funktion um die neuen Felder erweitern.
drop function if exists public.fn_get_discovery_cards();
create or replace function public.fn_get_discovery_cards()
returns table (
  id uuid, slug text, title text, prompt text, description text, context text,
  category text, tags text[], intensity_level smallint, risk_level text,
  content_sensitivity text, requires_opt_in boolean,
  role_model text, allowed_roles text[], safety_note text, consent_note text,
  requires_safety_confirmation boolean, is_couple_card boolean
)
language plpgsql stable security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_couple uuid;
begin
  select cm.couple_id into v_couple from couple_members cm
    join couples c on c.id = cm.couple_id
    where cm.user_id = v_user and cm.left_at is null and c.status = 'active';

  return query
    select q.id, q.slug, q.title, q.prompt, q.description, q.context,
           q.category, q.tags, q.intensity_level, q.risk_level,
           q.content_sensitivity, q.requires_opt_in,
           q.role_model, q.allowed_roles, q.safety_note, q.consent_note,
           q.requires_safety_confirmation, false
    from question_cards q where q.active = true
    union all
    select w.id, 'wish-' || w.id, w.title, w.prompt, null, null, w.category,
           array['eigener-wunsch'], w.intensity_level, 'medium',
           'standard', false, w.role_model,
           array['initiating','receiving','switching','both','not_relevant'],
           null, null, false, true
    from custom_wishes w
    where v_couple is not null
      and w.couple_id = v_couple
      and w.status = 'active'
      and w.created_by <> v_user;
end $$;

revoke all on function public.fn_get_discovery_cards() from public;
grant execute on function public.fn_get_discovery_cards() to authenticated;
