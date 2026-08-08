-- MUTUAL – Seed v2, Teil 3/3.

insert into public.question_cards
  (slug, title, prompt, context, category, intensity_level, risk_level, role_model,
   content_sensitivity, requires_opt_in, requires_safety_confirmation, safety_note, consent_note)
values
-- ── Service und Hingabe (10) ───────────────────────────────────────────────
('sh-01','Einen Abend dienen','Reizt es dich, deiner Partnerperson einen Abend lang zu dienen – aufmerksam, hingebungsvoll, auf ihr Zeichen hin?',null,'service_hingabe',2,'low','directional','explicit',false,false,null,null),
('sh-02','Bedient werden','Reizt es dich, einen Abend lang bedient zu werden – ohne selbst etwas tun zu müssen, außer zu genießen und zu lenken?',null,'service_hingabe',2,'low','directional','explicit',false,false,null,null),
('sh-03','Rituale des Dienens','Reizt dich ein festes kleines Ritual – etwa das Ausziehen der Schuhe, ein vorbereitetes Bad, ein servierter Drink – als Beginn einer Szene?',null,'service_hingabe',2,'low','directional','explicit',false,false,null,null),
('sh-04','Dienst mit Details','Reizt es dich, sehr genaue Vorgaben zu bekommen, wie du dienen sollst – und daran gemessen zu werden?',null,'service_hingabe',3,'low','directional','explicit',false,false,null,null),
('sh-05','Unsichtbarer Dienst','Reizt dich stiller Dienst – vorbereiten, bereitstehen, aufmerksam sein, ohne im Mittelpunkt zu stehen?',null,'service_hingabe',3,'low','directional','explicit',false,false,null,null),
('sh-06','Dank und Anerkennung','Reizt dich der Moment, in dem dein Dienst ausdrücklich anerkannt und belohnt wird?',null,'service_hingabe',2,'low','directional','explicit',false,false,null,null),
('sh-07','Körperlicher Dienst','Reizt dich körperlicher Dienst – Massage, Pflege, Verwöhnen – als Ausdruck von Hingabe statt als Gegenseitigkeit?',null,'service_hingabe',2,'low','directional','explicit',false,false,null,null),
('sh-08','Dienen und geführt werden','Reizt dich die Kombination: du dienst, und deine Partnerperson führt dich dabei mit klaren Worten?',null,'service_hingabe',3,'low','directional','explicit',false,false,null,null),
('sh-09','Rollen tauschen','Reizt es dich, beide Seiten zu kennen – zu dienen und dir dienen zu lassen?',null,'service_hingabe',2,'low','switchable','explicit',false,false,null,null),
('sh-10','Dienst als Alltagssignal','Reizt dich eine kleine Alltagsgeste, die nur für euch beide „heute Abend gehöre ich dir" bedeutet?',null,'service_hingabe',2,'low','symmetric','explicit',false,false,null,null),
-- ── Wechselnde Rollen (8) ──────────────────────────────────────────────────
('rw-01','Switch','Reizt es dich grundsätzlich, zwischen führender und folgender Rolle zu wechseln – je nach Stimmung und Szene?',null,'rollenwechsel',2,'low','switchable','explicit',false,false,null,null),
('rw-02','Wechsel in einer Nacht','Reizt dich ein Rollenwechsel innerhalb derselben Nacht – erst führst du, dann wirst du geführt?',null,'rollenwechsel',3,'low','switchable','explicit',false,false,null,null),
('rw-03','Wechsel per Zeichen','Reizt dich ein vereinbartes Zeichen, mit dem die Führung mitten in der Szene wechselt?',null,'rollenwechsel',3,'low','switchable','explicit',false,false,null,null),
('rw-04','Umkehrung des Gewohnten','Reizt dich die bewusste Umkehrung eurer gewohnten Dynamik – wer sonst führt, folgt heute?',null,'rollenwechsel',2,'low','switchable','explicit',false,false,null,null),
('rw-05','Kampf um die Führung','Reizt dich ein spielerisches Kräftemessen darum, wer heute führt – mit klaren Regeln und jederzeit beendbar?',null,'rollenwechsel',3,'medium','switchable','explicit',false,true,'Nur mit vereinbartem Stoppsignal. Ein Nein gilt sofort.',null),
('rw-06','Elemente statt Rollen','Reizt es dich, nur einzelne Elemente einer Rolle zu übernehmen – etwa Anweisungen geben, ohne die ganze Szene zu führen?',null,'rollenwechsel',2,'low','switchable','explicit',false,false,null,null),
('rw-07','Rolle noch unklar','Bist du dir bei manchen Themen unsicher, welche Rolle dich reizt – und möchtest das gemeinsam herausfinden?',null,'rollenwechsel',1,'low','symmetric','standard',false,false,null,null),
('rw-08','Wochen-Rhythmus','Reizt dich ein fester Wechsel – etwa: diese Woche führt eine Person, nächste Woche die andere?',null,'rollenwechsel',2,'low','switchable','explicit',false,false,null,null),
-- ── Sinnliche Langsamkeit (10) ─────────────────────────────────────────────
('sl-01','Extrem verlangsamt','Reizt dich eine Szene, die bewusst auf ein Vielfaches der üblichen Dauer gedehnt wird – jede Berührung einzeln?',null,'sinnliche_langsamkeit',1,'low','symmetric','explicit',false,false,null,null),
('sl-02','Nur Hände','Reizt dich eine ganze Szene, in der nur Hände erlaubt sind – nichts anderes?',null,'sinnliche_langsamkeit',2,'low','symmetric','explicit',false,false,null,null),
('sl-03','Massage mit Absicht','Reizt dich eine lange Massage, die sich sehr langsam und gezielt in Erregung verwandelt?',null,'sinnliche_langsamkeit',1,'low','switchable','explicit',false,false,null,null),
('sl-04','Atem synchron','Reizt es dich, euren Atem bewusst zu synchronisieren und die Erregung darüber zu steuern?',null,'sinnliche_langsamkeit',2,'low','symmetric','explicit',false,false,null,null),
('sl-05','Eine Körperregion','Reizt dich eine ganze Szene für eine einzige Körperregion – nichts anderes wird berührt?',null,'sinnliche_langsamkeit',2,'low','switchable','explicit',false,false,null,null),
('sl-06','Blickkontakt halten','Reizt dich durchgehender Blickkontakt – auch und gerade in den intensivsten Momenten?',null,'sinnliche_langsamkeit',2,'low','symmetric','explicit',false,false,null,null),
('sl-07','Wellen','Reizt es dich, Erregung mehrfach auf- und abklingen zu lassen, bevor ihr sie auflöst?',null,'sinnliche_langsamkeit',2,'low','symmetric','explicit',false,false,null,null),
('sl-08','Stille Szene','Reizt dich eine Szene ganz ohne Worte – nur Berührung, Atem und Blicke?',null,'sinnliche_langsamkeit',2,'low','symmetric','explicit',false,false,null,null),
('sl-09','Aufwachen und weitermachen','Reizt dich langsame, verschlafene Nähe am Morgen – ohne Ziel, ohne Eile?',null,'sinnliche_langsamkeit',1,'low','symmetric','standard',false,false,null,null),
('sl-10','Verbot der Eile','Reizt dich die Regel, dass an einem Abend nichts beschleunigt werden darf – egal wie sehr ihr wollt?',null,'sinnliche_langsamkeit',2,'low','symmetric','explicit',false,false,null,null),
-- ── Körperliche Kontrolle (10) ─────────────────────────────────────────────
('kk-01','Festhalten','Reizt es dich, mit den Händen festgehalten und in Position gehalten zu werden – ohne Hilfsmittel, jederzeit beendbar?',null,'koerperliche_kontrolle',2,'low','directional','explicit',false,false,null,null),
('kk-02','Führen mit den Händen','Reizt es dich, deine Partnerperson mit deinen Händen zu führen – Kopf, Hüfte, Hände – und die Bewegung zu bestimmen?',null,'koerperliche_kontrolle',2,'low','directional','explicit',false,false,null,null),
('kk-03','Gewicht spüren','Reizt es dich, das Gewicht deiner Partnerperson bewusst zu spüren – gehalten, bedeckt, umschlossen?',null,'koerperliche_kontrolle',2,'low','directional','explicit',false,false,null,null),
('kk-04','Positionen bestimmen','Reizt es dich, während des Sex die Positionen klar zu bestimmen – und zu wechseln, wann du willst?',null,'koerperliche_kontrolle',2,'low','directional','explicit',false,false,null,null),
('kk-05','An die Wand','Reizt dich der Moment, sanft aber bestimmt an eine Wand oder aufs Bett gedrückt zu werden?',null,'koerperliche_kontrolle',3,'medium','directional','explicit',false,false,'Kopf und Hals bleiben immer frei. Ein Nein gilt sofort.',null),
('kk-06','Bewegung verbieten','Reizt dich die Anweisung, dich nicht zu bewegen – und die Anstrengung, ihr zu folgen?',null,'koerperliche_kontrolle',3,'low','directional','explicit',false,false,null,null),
('kk-07','Getragen werden','Reizt es dich, getragen oder gehoben zu werden – als Ausdruck von Kraft und Vertrauen?',null,'koerperliche_kontrolle',2,'low','directional','explicit',false,false,'Nur, wenn es körperlich sicher möglich ist.',null),
('kk-08','Tempo mit dem Körper diktieren','Reizt es dich, das Tempo deiner Partnerperson mit deinem Körper zu diktieren – bremsen, halten, freigeben?',null,'koerperliche_kontrolle',3,'low','directional','explicit',false,false,null,null),
('kk-09','Kontrolliert werden wollen','Reizt es dich, körperlich geführt zu werden, ohne vorher zu wissen, was als Nächstes kommt?',null,'koerperliche_kontrolle',3,'medium','directional','explicit',false,false,'Stoppsignal vereinbaren.',null),
('kk-10','Beide Richtungen','Reizt es dich, körperliche Kontrolle sowohl auszuüben als auch dich ihr zu überlassen?',null,'koerperliche_kontrolle',3,'low','switchable','explicit',false,false,null,null),
-- ── Fantasien mit mehreren Erwachsenen (8, Opt-in, Fantasie-Fokus) ─────────
('me-01','Fantasie: Zu dritt','Reizt dich die Fantasie von Intimität mit einer weiteren erwachsenen Person – zunächst nur als Gedanke und Gespräch zwischen euch?','Diese Karte fragt nach der Fantasie, nicht nach einer Umsetzung.','mehrere_erwachsene_fantasie',3,'low','symmetric','explicit',true,false,null,'Ein Match bedeutet: Ihr dürft darüber sprechen. Nicht mehr.'),
('me-02','Fantasie erzählen','Reizt es dich, deiner Partnerperson eine Fantasie mit mehreren Personen zu erzählen – detailliert, aber als Geschichte?',null,'mehrere_erwachsene_fantasie',3,'low','symmetric','explicit',true,false,null,null),
('me-03','Rollenspiel statt Realität','Reizt dich ein Rollenspiel, in dem ihr eine dritte Person nur spielt – mit Stimme, Namen, Szenario, aber nur zu zweit?',null,'mehrere_erwachsene_fantasie',3,'low','symmetric','explicit',true,false,null,null),
('me-04','Dirty Talk über Dritte','Reizt dich Dirty Talk, der eine dritte Person imaginiert – während real nur ihr beide da seid?',null,'mehrere_erwachsene_fantasie',3,'low','symmetric','explicit',true,false,null,null),
('me-05','Zusehen als Fantasie','Reizt dich die Fantasie, dass deine Partnerperson von jemand anderem begehrt wird – als Gedanke, der euch beiden gehört?',null,'mehrere_erwachsene_fantasie',3,'low','symmetric','explicit',true,false,null,null),
('me-06','Grenzen dieser Fantasie','Möchtest du klar festhalten, ob diese Fantasien für dich reine Fantasie bleiben oder grundsätzlich mehr denkbar wäre?',null,'mehrere_erwachsene_fantasie',2,'low','symmetric','explicit',true,false,null,'Auch „mehr denkbar" wäre nur der Anfang eines langen, ehrlichen Gesprächs – niemals ein Startsignal.'),
('me-07','Eifersucht ehrlich','Möchtest du offen darüber sprechen, wo bei diesen Fantasien Erregung endet und Eifersucht beginnt?',null,'mehrere_erwachsene_fantasie',2,'low','symmetric','standard',true,false,null,null),
('me-08','Tabu und trotzdem erregend','Reizt dich gerade, dass diese Fantasie ein Tabu bleibt – und genau deshalb funktioniert?',null,'mehrere_erwachsene_fantasie',2,'low','symmetric','explicit',true,false,null,null),
-- ── Besitzsymbolik und Rituale (10) ────────────────────────────────────────
('bs-01','Ein Zeichen tragen','Reizt es dich, ein unauffälliges Zeichen zu tragen, das nur für euch beide „ich gehöre zu dir" bedeutet – etwa ein Armband oder eine Kette?','Symbolik in einem privaten, einvernehmlichen Rahmen zwischen Gleichen.','besitz_rituale',2,'low','directional','explicit',false,false,null,null),
('bs-02','Ein Zeichen geben','Reizt es dich, deiner Partnerperson ein solches Zeichen zu geben – und zu sehen, dass sie es trägt?',null,'besitz_rituale',2,'low','directional','explicit',false,false,null,null),
('bs-03','Mein und Dein','Reizt dich besitzergreifende Sprache im Spiel – „du gehörst mir" – als vereinbarter Ausdruck von Intensität?',null,'besitz_rituale',3,'low','directional','explicit',false,false,null,'Symbolische Sprache im Spiel; im Alltag bleibt ihr gleichberechtigt und frei.'),
('bs-04','Beginn-Ritual','Reizt dich ein festes Ritual, mit dem eine Szene offiziell beginnt – eine Geste, ein Satz, ein Gegenstand?',null,'besitz_rituale',2,'low','symmetric','explicit',false,false,null,null),
('bs-05','Ende-Ritual','Reizt dich ein ebenso festes Ritual, mit dem eine Szene endet und ihr in den Alltag zurückkehrt?',null,'besitz_rituale',2,'low','symmetric','explicit',false,false,null,null),
('bs-06','Regeln für einen Zeitraum','Reizt dich eine vereinbarte Regel, die für einen klaren Zeitraum gilt – ein Wochenende, eine Woche – und dann automatisch endet?',null,'besitz_rituale',3,'low','directional','explicit',false,false,null,'Regeln enden zum vereinbarten Zeitpunkt oder sofort auf Wunsch – je nachdem, was früher eintritt.'),
('bs-07','Morgens und abends','Reizt dich ein kleines tägliches Ritual innerhalb eines vereinbarten Zeitraums – etwa eine bestimmte Nachricht oder Geste?',null,'besitz_rituale',2,'low','directional','explicit',false,false,null,null),
('bs-08','Zeremonie zu zweit','Reizt dich eine kleine private Zeremonie, in der ihr eine Dynamik bewusst und feierlich vereinbart?',null,'besitz_rituale',3,'low','symmetric','explicit',false,false,null,null),
('bs-09','Symbol ablegen','Möchtet ihr genauso bewusst vereinbaren, wie ein Symbol oder Ritual wieder abgelegt wird – ohne dass es ein Scheitern ist?',null,'besitz_rituale',1,'low','symmetric','standard',false,false,null,null),
('bs-10','Nur Fantasie: Zugehörigkeit','Reizt dich Besitzsymbolik eher als Fantasie und Sprache denn als gelebtes Ritual?',null,'besitz_rituale',2,'low','symmetric','explicit',false,false,null,null),
-- ── Initiative und Überraschung (10) ───────────────────────────────────────
('iu-01','Klar initiieren','Reizt es dich, Sex deutlich und unmissverständlich zu initiieren – ohne Umwege, ohne Andeutung?',null,'initiative_ueberraschung',1,'low','switchable','explicit',false,false,null,null),
('iu-02','Überrascht werden','Reizt es dich, überrascht zu werden – deine Partnerperson hat geplant, du musst nur ja sagen?',null,'initiative_ueberraschung',2,'low','directional','explicit',false,false,null,null),
('iu-03','Geplante Entführung','Reizt dich eine „Entführung" aus dem Alltag – deine Partnerperson holt dich ab, das Ziel bleibt geheim?','Ein liebevoll geplantes Szenario, dem du vorher grundsätzlich zugestimmt hast.','initiative_ueberraschung',3,'low','directional','explicit',false,false,null,'Grundsätzliche Zustimmung zu Überraschungen wird vorher einmal geklärt; ein Nein im Moment gilt trotzdem immer.'),
('iu-04','Zettel mit Anweisung','Reizt dich eine hinterlassene Nachricht mit einer klaren Anweisung für den Abend?',null,'initiative_ueberraschung',2,'low','directional','explicit',false,false,null,null),
('iu-05','Mitten am Tag','Reizt dich spontane Initiative zu ungewohnter Zeit – mitten am Tag, wenn es gerade passt?',null,'initiative_ueberraschung',2,'low','symmetric','explicit',false,false,null,null),
('iu-06','Rollen der Initiative','Wärst du gern häufiger die initiierende Person – oder häufiger die, die überrascht wird?',null,'initiative_ueberraschung',1,'low','switchable','standard',false,false,null,null),
('iu-07','Signal der Bereitschaft','Reizt dich ein vereinbartes stilles Signal, das „ich will dich – heute" bedeutet?',null,'initiative_ueberraschung',1,'low','symmetric','explicit',false,false,null,null),
('iu-08','Verabredung mit Ansage','Reizt dich das Gegenteil von Überraschung: ein fest verabredeter Termin, auf den ihr euch beide gezielt vorbereitet?',null,'initiative_ueberraschung',2,'low','symmetric','explicit',false,false,null,null),
('iu-09','Initiative üben','Möchtest du bewusst üben, öfter zu initiieren – und dabei erleben, dass dein Wunsch willkommen ist?',null,'initiative_ueberraschung',1,'low','symmetric','standard',false,false,null,null),
('iu-10','Abgelehnt werden dürfen','Möchtet ihr vereinbaren, wie ein Nein auf Initiative aussieht, damit es sich für beide gut anfühlt?',null,'initiative_ueberraschung',1,'low','symmetric','standard',false,false,null,null),
-- ── Nachsorge (8) ──────────────────────────────────────────────────────────
('nc-01','Nachsorge planen','Möchtest du vor intensiveren Szenen festlegen, was ihr danach voneinander braucht – Nähe, Ruhe, Worte, Wasser?',null,'nachsorge',1,'low','symmetric','standard',false,false,null,null),
('nc-02','Halten nach der Szene','Reizt es dich, nach intensiven Szenen ausgiebig gehalten zu werden – ohne Worte, ohne Bewertung?',null,'nachsorge',1,'low','directional','standard',false,false,null,null),
('nc-03','Halten geben','Möchtest du nach intensiven Szenen bewusst die haltende, versorgende Rolle übernehmen?',null,'nachsorge',1,'low','directional','standard',false,false,null,null),
('nc-04','Nachsorge für beide Rollen','Ist dir bewusst wichtig, dass auch die führende Person nach einer Szene Nachsorge bekommen darf?',null,'nachsorge',1,'low','symmetric','standard',false,false,null,null),
('nc-05','Der Tag danach','Möchtest du am Tag nach einer intensiven Szene noch einmal ehrlich hören und sagen, wie es wirklich war?',null,'nachsorge',1,'low','symmetric','standard',false,false,null,null),
('nc-06','Emotionale Nachwellen','Möchtest du offen damit umgehen können, wenn eine Szene unerwartete Gefühle auslöst – auch Tage später?',null,'nachsorge',2,'low','symmetric','standard',false,false,null,null),
('nc-07','Nachsorge-Kiste','Reizt euch eine vorbereitete kleine Kiste – Decke, Wasser, Snack, Lieblingsdinge – die nach Szenen bereitsteht?',null,'nachsorge',1,'low','symmetric','standard',false,false,null,null),
('nc-08','Debrief-Ritual','Möchtet ihr ein festes kurzes Ritual, in dem ihr nach Szenen drei Dinge teilt: was gut war, was nicht, was ihr wieder wollt?',null,'nachsorge',1,'low','symmetric','standard',false,false,null,null),
-- ── Grenzen und Tabus (8) ──────────────────────────────────────────────────
('gt-01','Harte Grenzen','Möchtest du unabhängig voneinander festhalten, was für dich grundsätzlich und dauerhaft ausgeschlossen ist?',null,'grenzen_tabus',1,'low','symmetric','standard',false,false,null,null),
('gt-02','Weiche Grenzen','Möchtest du auch festhalten, was aktuell eine Grenze ist, sich aber vielleicht einmal verschieben könnte?',null,'grenzen_tabus',1,'low','symmetric','standard',false,false,null,null),
('gt-03','Safeword','Möchtet ihr ein Safeword vereinbaren, das immer und sofort alles beendet – ohne Diskussion?',null,'grenzen_tabus',1,'low','symmetric','standard',false,false,null,null),
('gt-04','Ampelsystem','Reizt euch ein Ampelsystem – Grün, Gelb, Rot – um während einer Szene laufend Tempo und Grenzen anzuzeigen?',null,'grenzen_tabus',1,'low','symmetric','standard',false,false,null,null),
('gt-05','Nonverbales Stopp','Möchtet ihr zusätzlich ein nonverbales Stoppsignal für Situationen, in denen Sprechen schwerfällt?',null,'grenzen_tabus',1,'low','symmetric','standard',false,false,null,null),
('gt-06','Körperliche Tabuzonen','Möchtest du klar benennen, welche Körperstellen nicht oder nur auf bestimmte Weise berührt werden sollen?',null,'grenzen_tabus',1,'low','symmetric','standard',false,false,null,null),
('gt-07','Worte, die verletzen','Möchtest du festhalten, welche Worte oder Szenarien für dich emotional tabu sind – ohne Begründungspflicht?',null,'grenzen_tabus',1,'low','symmetric','standard',false,false,null,null),
('gt-08','Grenzen ändern sich','Möchtet ihr fest vereinbaren, dass Grenzen sich jederzeit in beide Richtungen verschieben dürfen – und regelmäßig neu besprochen werden?',null,'grenzen_tabus',1,'low','symmetric','standard',false,false,null,null),
-- ── Fantasie ohne Umsetzungswunsch (8) ─────────────────────────────────────
('fu-01','Fantasien als Geschenk','Reizt es dich, einander Fantasien zu erzählen, die ausdrücklich nie umgesetzt werden – als Vertrauensbeweis?',null,'fantasie_ohne_umsetzung',2,'low','symmetric','explicit',false,false,null,null),
('fu-02','Kopfkino beim Sex','Reizt es dich, während des Sex eine Fantasie erzählt zu bekommen, die nur im Kopf stattfindet?',null,'fantasie_ohne_umsetzung',2,'low','switchable','explicit',false,false,null,null),
('fu-03','Tabu-Fantasien benennen','Möchtest du aussprechen dürfen, dass dich manche Gedanken erregen, obwohl – oder gerade weil – sie Tabus berühren?','Es geht um Gedanken und Worte zwischen euch, niemals um reale Handlungen.','fantasie_ohne_umsetzung',3,'low','symmetric','explicit',false,false,null,'Fantasien werden hier nicht bewertet. Reale Grenzen und Gesetze bleiben unberührt.'),
('fu-04','Fantasie schützen','Möchtest du sicher sein, dass eine geteilte Fantasie nie gegen dich verwendet oder im Streit zitiert wird?',null,'fantasie_ohne_umsetzung',1,'low','symmetric','standard',false,false,null,null),
('fu-05','Getrennte Welten','Kannst du gut damit leben, dass deine Partnerperson Fantasien hat, die dich nicht einschließen – und umgekehrt?',null,'fantasie_ohne_umsetzung',2,'low','symmetric','standard',false,false,null,null),
('fu-06','Fantasie aufschreiben','Reizt es dich, eine Fantasie aufzuschreiben und deiner Partnerperson zum Lesen zu geben – ohne Gespräch danach, wenn du nicht willst?',null,'fantasie_ohne_umsetzung',2,'low','symmetric','explicit',false,false,null,null),
('fu-07','Gemeinsame reine Fantasie','Reizt es dich, eine gemeinsame Fantasie zu pflegen und weiterzuspinnen, von der ihr beide wisst: Sie bleibt Fantasie?',null,'fantasie_ohne_umsetzung',2,'low','symmetric','explicit',false,false,null,null),
('fu-08','Vom Gedanken zur Frage','Möchtest du ein Ritual, mit dem eine Fantasie – wenn ihr beide wollt – irgendwann vorsichtig zur echten Frage werden darf?',null,'fantasie_ohne_umsetzung',2,'low','symmetric','explicit',false,false,null,null);

-- Rollenoptionen je Modell setzen (nur v2-Karten).
update public.question_cards set allowed_roles = case role_model
  when 'symmetric' then array['not_relevant']
  when 'not_relevant' then array['not_relevant']
  when 'directional' then array['initiating','receiving','switching','both']
  when 'observer' then array['observing','receiving','switching','both']
  when 'switchable' then array['initiating','receiving','switching','both']
end
where slug ~ '^(ds|br|mg|ff|se|sp|dt|lv|er|oc|tv|ty|rs|ur|ki|bz|fo|dn|oa|sh|rw|sl|kk|me|bs|iu|nc|gt|fu)-\d\d$';
