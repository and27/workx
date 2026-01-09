-- Seed data generated from memory adapter
begin;
delete from public.application_logs;
delete from public.applications;
delete from public.jobs;
insert into public.jobs (id, company, role, source, location, seniority, tags, created_at, updated_at) values
  ('000003e9-03e9-03e9-03e9-0000000003e9', 'FluxLabs', 'Frontend Engineer', 'LinkedIn', 'Ciudad de Mexico', 'Mid', '{React,TypeScript,Design Systems}', '2025-12-19T14:00:00Z', '2025-12-26T14:00:00Z'),
  ('000003ea-03ea-03ea-03ea-0000000003ea', 'NovaHealth', 'Fullstack Engineer', 'Referral', 'Remoto - LATAM', 'Senior', '{Node,React,Postgres}', '2025-12-22T14:00:00Z', '2025-12-30T14:00:00Z'),
  ('000003eb-03eb-03eb-03eb-0000000003eb', 'Redwood Finance', 'Data Engineer', 'Indeed', 'Monterrey', 'Mid', '{Python,ETL,Snowflake}', '2025-12-24T14:00:00Z', '2026-01-01T14:00:00Z'),
  ('000003ec-03ec-03ec-03ec-0000000003ec', 'Atlas Robotics', 'Backend Engineer', 'AngelList', 'Guadalajara', 'Senior', '{Go,gRPC,Kubernetes}', '2025-12-25T14:00:00Z', '2025-12-31T14:00:00Z'),
  ('000003ed-03ed-03ed-03ed-0000000003ed', 'Vista Retail', 'Product Designer', 'LinkedIn', 'Remoto', 'Mid', '{Figma,Design Systems}', '2025-12-28T14:00:00Z', '2026-01-03T14:00:00Z'),
  ('000003ee-03ee-03ee-03ee-0000000003ee', 'Lumen Energy', 'DevOps Engineer', 'Company Site', 'Ciudad de Mexico', 'Senior', '{AWS,Terraform,CI/CD}', '2025-12-28T14:00:00Z', '2026-01-04T14:00:00Z'),
  ('000003ef-03ef-03ef-03ef-0000000003ef', 'Kite Travel', 'Mobile Engineer', 'LinkedIn', 'Remoto', 'Mid', '{React Native,TypeScript}', '2025-12-29T14:00:00Z', '2026-01-05T14:00:00Z'),
  ('000003f0-03f0-03f0-03f0-0000000003f0', 'Orbit Payments', 'Platform Engineer', 'Referral', 'Ciudad de Mexico', 'Senior', '{Kubernetes,Terraform,Go}', '2025-12-30T14:00:00Z', '2026-01-06T14:00:00Z'),
  ('000003f1-03f1-03f1-03f1-0000000003f1', 'Clearpath Logistics', 'Analytics Engineer', 'Indeed', 'Remoto - LATAM', 'Mid', '{dbt,Snowflake,Python}', '2025-12-31T14:00:00Z', '2026-01-07T14:00:00Z'),
  ('000003f2-03f2-03f2-03f2-0000000003f2', 'Mosaic Education', 'Frontend Engineer', 'LinkedIn', 'Bogota', 'Mid', '{React,TypeScript,Accessibility}', '2026-01-01T14:00:00Z', '2026-01-08T14:00:00Z'),
  ('000003f3-03f3-03f3-03f3-0000000003f3', 'Harbor Media', 'Growth Engineer', 'Company Site', 'Remoto', 'Mid', '{Next.js,Experimentation}', '2026-01-02T14:00:00Z', '2026-01-08T14:00:00Z'),
  ('000003f4-03f4-03f4-03f4-0000000003f4', 'Pulse Fitness', 'Backend Engineer', 'LinkedIn', 'Sao Paulo', 'Senior', '{Node,GraphQL,Postgres}', '2026-01-02T14:00:00Z', '2026-01-09T14:00:00Z'),
  ('000003f5-03f5-03f5-03f5-0000000003f5', 'Aurora Analytics', 'Data Scientist', 'Indeed', 'Remoto', 'Senior', '{Python,ML,Product Analytics}', '2026-01-03T14:00:00Z', '2026-01-09T14:00:00Z'),
  ('000003f6-03f6-03f6-03f6-0000000003f6', 'Northwind', 'Fullstack Engineer', 'LinkedIn', 'Ciudad de Mexico', 'Mid', '{React,Node,MongoDB}', '2026-01-03T14:00:00Z', '2026-01-09T14:00:00Z'),
  ('000003f7-03f7-03f7-03f7-0000000003f7', 'Skyline Realty', 'Product Manager', 'Company Site', 'Remoto', 'Senior', '{B2B,Roadmapping}', '2026-01-04T14:00:00Z', '2026-01-09T14:00:00Z'),
  ('000003f8-03f8-03f8-03f8-0000000003f8', 'Beacon Security', 'Security Engineer', 'LinkedIn', 'Monterrey', 'Senior', '{AppSec,Threat Modeling}', '2026-01-05T14:00:00Z', '2026-01-10T14:00:00Z'),
  ('000003f9-03f9-03f9-03f9-0000000003f9', 'Wave Commerce', 'Frontend Engineer', 'AngelList', 'Remoto', 'Mid', '{React,TypeScript,Commerce}', '2026-01-05T14:00:00Z', '2026-01-10T14:00:00Z'),
  ('000003fa-03fa-03fa-03fa-0000000003fa', 'BrightFleet', 'Ops Analyst', 'Indeed', 'Guadalajara', 'Junior', '{SQL,Excel,Ops}', '2026-01-06T14:00:00Z', '2026-01-10T14:00:00Z'),
  ('000003fb-03fb-03fb-03fb-0000000003fb', 'Evergreen Foods', 'Supply Chain Manager', 'LinkedIn', 'Monterrey', 'Senior', '{Supply Chain,Operations}', '2026-01-06T14:00:00Z', '2026-01-10T14:00:00Z'),
  ('000003fc-03fc-03fc-03fc-0000000003fc', 'Citrus Cloud', 'Site Reliability Engineer', 'Company Site', 'Remoto', 'Senior', '{SRE,AWS,Observability}', '2026-01-07T14:00:00Z', '2026-01-11T14:00:00Z'),
  ('000003fd-03fd-03fd-03fd-0000000003fd', 'Sierra Telecom', 'Network Engineer', 'LinkedIn', 'Ciudad de Mexico', 'Mid', '{Networking,Security}', '2026-01-07T14:00:00Z', '2026-01-11T14:00:00Z'),
  ('000003fe-03fe-03fe-03fe-0000000003fe', 'Pioneer AI', 'Machine Learning Engineer', 'AngelList', 'Remoto', 'Senior', '{Python,ML,MLOps}', '2026-01-08T14:00:00Z', '2026-01-11T14:00:00Z'),
  ('000003ff-03ff-03ff-03ff-0000000003ff', 'Summit HR', 'Product Designer', 'LinkedIn', 'Remoto', 'Mid', '{UX Research,Design Systems}', '2026-01-08T14:00:00Z', '2026-01-11T14:00:00Z'),
  ('00000400-0400-0400-0400-000000000400', 'Vertex Studios', 'Technical Writer', 'Company Site', 'Remoto', 'Mid', '{Docs,APIs}', '2026-01-09T14:00:00Z', '2026-01-12T14:00:00Z'),
  ('00000401-0401-0401-0401-000000000401', 'Copperline', 'QA Engineer', 'Indeed', 'Tijuana', 'Mid', '{Testing,Automation}', '2026-01-09T14:00:00Z', '2026-01-12T14:00:00Z');

insert into public.applications (id, company, role, status, priority, next_action_at, source, notes, created_at, updated_at, job_id) values
  ('000007d1-07d1-07d1-07d1-0000000007d1', 'FluxLabs', 'Frontend Engineer', 'screen', 'high', '2026-01-07', 'LinkedIn', 'Entrevista inicial completada. Esperando feedback.', '2025-12-20T14:00:00Z', '2026-01-08T14:00:00Z', '000003e9-03e9-03e9-03e9-0000000003e9'),
  ('000007d2-07d2-07d2-07d2-0000000007d2', 'NovaHealth', 'Fullstack Engineer', 'applied', 'medium', '2026-01-09', 'Referral', 'Enviar seguimiento con el reclutador.', '2025-12-23T14:00:00Z', '2026-01-09T14:00:00Z', '000003ea-03ea-03ea-03ea-0000000003ea'),
  ('000007d3-07d3-07d3-07d3-0000000007d3', 'Orbit Payments', 'Platform Engineer', 'tech', 'high', '2026-01-10', 'Referral', 'Preparar caso de estudio técnico.', '2025-12-31T14:00:00Z', '2026-01-09T14:00:00Z', '000003f0-03f0-03f0-03f0-0000000003f0'),
  ('000007d4-07d4-07d4-07d4-0000000007d4', 'Mosaic Education', 'Frontend Engineer', 'saved', 'medium', '2026-01-12', 'LinkedIn', 'Revisar posicionamiento salarial.', '2026-01-03T14:00:00Z', '2026-01-07T14:00:00Z', '000003f2-03f2-03f2-03f2-0000000003f2'),
  ('000007d5-07d5-07d5-07d5-0000000007d5', 'Pulse Fitness', 'Backend Engineer', 'applied', 'medium', '2026-01-14', 'LinkedIn', 'Confirmar stack exacto con el hiring manager.', '2026-01-02T14:00:00Z', '2026-01-08T14:00:00Z', '000003f4-03f4-03f4-03f4-0000000003f4'),
  ('000007d6-07d6-07d6-07d6-0000000007d6', 'Aurora Analytics', 'Data Scientist', 'rejected', 'low', NULL, 'Indeed', 'No encajo con el enfoque del rol.', '2026-01-03T14:00:00Z', '2026-01-06T14:00:00Z', '000003f5-03f5-03f5-03f5-0000000003f5'),
  ('000007d7-07d7-07d7-07d7-0000000007d7', 'Wave Commerce', 'Frontend Engineer', 'screen', 'high', '2026-01-08', 'AngelList', 'Agendar entrevista técnica.', '2026-01-05T14:00:00Z', '2026-01-08T14:00:00Z', '000003f9-03f9-03f9-03f9-0000000003f9'),
  ('000007d8-07d8-07d8-07d8-0000000007d8', 'Citrus Cloud', 'Site Reliability Engineer', 'ghosted', 'low', '2026-01-05', 'Company Site', 'Sin respuesta desde el envío.', '2025-12-30T14:00:00Z', '2026-01-03T14:00:00Z', '000003fc-03fc-03fc-03fc-0000000003fc'),
  ('000007d9-07d9-07d9-07d9-0000000007d9', 'Pioneer AI', 'Machine Learning Engineer', 'applied', 'medium', '2026-01-16', 'AngelList', 'Pendiente de revisión.', '2026-01-07T14:00:00Z', '2026-01-09T14:00:00Z', '000003fe-03fe-03fe-03fe-0000000003fe'),
  ('000007da-07da-07da-07da-0000000007da', 'Copperline', 'QA Engineer', 'saved', 'medium', '2026-01-19', 'Indeed', 'Actualizar CV con experiencia en automatizacion.', '2026-01-08T14:00:00Z', '2026-01-09T14:00:00Z', '00000401-0401-0401-0401-000000000401');

insert into public.application_logs (id, application_id, type, message, created_at) values
  ('00000bb9-0bb9-0bb9-0bb9-000000000bb9', '000007d1-07d1-07d1-07d1-0000000007d1', 'created_from_job', 'Postulacion creada desde trabajo guardado.', '2025-12-20T14:10:00Z'),
  ('00000bba-0bba-0bba-0bba-000000000bba', '000007d1-07d1-07d1-07d1-0000000007d1', 'status_changed', 'Estado actualizado a screen.', '2026-01-04T14:20:00Z'),
  ('00000bbb-0bbb-0bbb-0bbb-000000000bbb', '000007d2-07d2-07d2-07d2-0000000007d2', 'created_from_job', 'Postulacion creada desde referido.', '2025-12-23T14:15:00Z'),
  ('00000bbc-0bbc-0bbc-0bbc-000000000bbc', '000007d2-07d2-07d2-07d2-0000000007d2', 'next_action_set', 'Se agendo seguimiento para hoy.', '2026-01-09T14:30:00Z'),
  ('00000bbd-0bbd-0bbd-0bbd-000000000bbd', '000007d3-07d3-07d3-07d3-0000000007d3', 'created_from_job', 'Postulacion creada desde referido.', '2025-12-31T14:40:00Z'),
  ('00000bbe-0bbe-0bbe-0bbe-000000000bbe', '000007d3-07d3-07d3-07d3-0000000007d3', 'notes_updated', 'Notas actualizadas con preparacion tecnica.', '2026-01-07T14:50:00Z'),
  ('00000bbf-0bbf-0bbf-0bbf-000000000bbf', '000007d4-07d4-07d4-07d4-0000000007d4', 'created', 'Postulacion creada manualmente.', '2026-01-03T14:20:00Z'),
  ('00000bc0-0bc0-0bc0-0bc0-000000000bc0', '000007d5-07d5-07d5-07d5-0000000007d5', 'created_from_job', 'Postulacion creada desde LinkedIn.', '2026-01-02T14:10:00Z'),
  ('00000bc1-0bc1-0bc1-0bc1-000000000bc1', '000007d5-07d5-07d5-07d5-0000000007d5', 'next_action_set', 'Seguimiento programado.', '2026-01-08T14:25:00Z'),
  ('00000bc2-0bc2-0bc2-0bc2-000000000bc2', '000007d6-07d6-07d6-07d6-0000000007d6', 'created_from_job', 'Postulacion creada desde Indeed.', '2026-01-03T14:05:00Z'),
  ('00000bc3-0bc3-0bc3-0bc3-000000000bc3', '000007d6-07d6-07d6-07d6-0000000007d6', 'status_changed', 'Estado actualizado a rejected.', '2026-01-06T14:15:00Z'),
  ('00000bc4-0bc4-0bc4-0bc4-000000000bc4', '000007d7-07d7-07d7-07d7-0000000007d7', 'created_from_job', 'Postulacion creada desde AngelList.', '2026-01-05T14:10:00Z'),
  ('00000bc5-0bc5-0bc5-0bc5-000000000bc5', '000007d7-07d7-07d7-07d7-0000000007d7', 'next_action_set', 'Entrevista tecnica pendiente.', '2026-01-08T14:20:00Z'),
  ('00000bc6-0bc6-0bc6-0bc6-000000000bc6', '000007d8-07d8-07d8-07d8-0000000007d8', 'created_from_job', 'Postulacion creada desde sitio de la empresa.', '2025-12-30T14:10:00Z'),
  ('00000bc7-0bc7-0bc7-0bc7-000000000bc7', '000007d8-07d8-07d8-07d8-0000000007d8', 'next_action_cleared', 'Seguimiento cancelado por falta de respuesta.', '2026-01-03T14:30:00Z'),
  ('00000bc8-0bc8-0bc8-0bc8-000000000bc8', '000007d9-07d9-07d9-07d9-0000000007d9', 'created_from_job', 'Postulacion creada desde AngelList.', '2026-01-07T14:12:00Z'),
  ('00000bc9-0bc9-0bc9-0bc9-000000000bc9', '000007da-07da-07da-07da-0000000007da', 'created_from_job', 'Postulacion creada desde Indeed.', '2026-01-08T14:14:00Z');

commit;
