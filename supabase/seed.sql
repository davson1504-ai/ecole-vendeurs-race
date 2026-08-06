-- Seed de présentation idempotent. Ne crée aucun utilisateur.
do $seed$
declare
  course_record record;
  v_module_id uuid;
  module_title text;
  module_position integer;
  lesson_position integer;
  lesson_title text;
  objective_text text;
begin
  for course_record in
    select * from (values
      ('les-fondamentaux-de-la-vente', 'Les fondamentaux de la vente', 'Débutant', 150000, 250,
       array['Comprendre le métier de vendeur','Préparer sa journée commerciale','Découvrir les besoins du client','Présenter efficacement une offre','Conclure une vente']),
      ('techniques-de-vente-terrain', 'Techniques de vente terrain', 'Intermédiaire', 120000, 240,
       array['Organiser une tournée commerciale','Prospecter de nouveaux points de vente','Construire une argumentation commerciale','Traiter les objections','Fidéliser les clients']),
      ('excellence-commerciale-et-performance', 'Excellence commerciale et performance', 'Avancé', 180000, 260,
       array['Définir des objectifs commerciaux','Suivre les indicateurs de performance','Améliorer le taux de conversion','Développer le portefeuille client','Construire un plan d’action commercial'])
    ) as x(slug,title,level,price_xof,duration_minutes,module_titles)
  loop
    insert into public.courses(slug,title,short_description,description,status,price_xof,level,duration_minutes)
    values (course_record.slug, course_record.title,
      'Un parcours pratique pour renforcer durablement vos compétences commerciales.',
      'Cette formation associe méthodes concrètes, exemples terrain et exercices applicables dès votre prochaine action commerciale.',
      'published', course_record.price_xof, course_record.level, course_record.duration_minutes)
    on conflict (slug) do update set
      title=excluded.title, short_description=excluded.short_description,
      description=excluded.description, status=excluded.status, price_xof=excluded.price_xof,
      level=excluded.level, duration_minutes=excluded.duration_minutes, updated_at=now();

    for module_position in 1..5 loop
      module_title := course_record.module_titles[module_position];
      select id into v_module_id from public.modules
      where course_id=(select id from public.courses where slug=course_record.slug)
        and position=module_position;
      if v_module_id is null then
        insert into public.modules(course_id,title,description,position)
        values ((select id from public.courses where slug=course_record.slug), module_title,
          'Des repères opérationnels et une mise en pratique guidée.', module_position)
        returning id into v_module_id;
      else
        update public.modules set title=module_title,
          description='Des repères opérationnels et une mise en pratique guidée.'
        where id=v_module_id;
      end if;

      for lesson_position in 1..2 loop
        lesson_title := case lesson_position when 1 then 'Comprendre et préparer' else 'Appliquer sur le terrain' end;
        objective_text := case lesson_position
          when 1 then 'Identifier les principes essentiels de « ' || module_title || ' » et préparer une action structurée.'
          else 'Mettre en œuvre « ' || module_title || ' » dans une situation commerciale réaliste.' end;
        insert into public.lessons(module_id,slug,title,objective,content,exercise,duration_minutes,position,is_preview)
        values (v_module_id,
          'lecon-' || module_position || '-' || lesson_position,
          lesson_title || ' : ' || module_title,
          objective_text,
          'Commencez par observer la situation du client et formulez un objectif précis. Utilisez des questions ouvertes, reformulez les informations importantes puis proposez une prochaine étape mesurable. Exemple pratique : préparez un entretien avec un responsable de point de vente, identifiez son enjeu prioritaire et adaptez votre argumentation à son contexte.',
          'Rédigez trois questions de découverte et une phrase de reformulation adaptées à votre prochain client. Notez ensuite l’action concrète que vous réaliserez sous 24 heures.',
          case lesson_position when 1 then 12 else 15 end,
          lesson_position,
          module_position=1 and lesson_position=1)
        on conflict (module_id,slug) do update set
          title=excluded.title, objective=excluded.objective, content=excluded.content,
          exercise=excluded.exercise, duration_minutes=excluded.duration_minutes,
          position=excluded.position, is_preview=excluded.is_preview, updated_at=now();
      end loop;
    end loop;
  end loop;
end
$seed$;
