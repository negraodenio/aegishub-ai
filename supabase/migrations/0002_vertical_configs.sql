create table vertical_configs (
  id uuid primary key default gen_random_uuid(),
  vertical text not null unique,
  label text not null,
  instruments text[] not null default '{}',
  risk_weights jsonb not null default '{}',
  created_at timestamptz not null default now()
);

insert into vertical_configs (vertical, label, instruments, risk_weights) values
('oil_and_gas', 'Óleo e Gás', array['PHQ9','GAD7','WHO5','PSYCHOSOCIAL_WORK_RISK','VOICE_SIGNAL'], '{"psychosocial":1.5,"burnout":1.2}'::jsonb),
('bpo_callcenter', 'BPO / Call Center', array['PHQ9','GAD7','WHO5','PSYCHOSOCIAL_WORK_RISK'], '{"gad7":1.2,"burnout":1.3}'::jsonb),
('healthcare', 'Saúde / Hospitalar', array['PHQ9','GAD7','WHO5','PSYCHOSOCIAL_WORK_RISK'], '{"burnout":1.4}'::jsonb),
('logistics', 'Logística', array['PHQ9','GAD7','WHO5','PSYCHOSOCIAL_WORK_RISK'], '{"psychosocial":1.3}'::jsonb),
('generic', 'Corporativo Geral', array['PHQ9','GAD7','WHO5','PSYCHOSOCIAL_WORK_RISK'], '{"default":true}'::jsonb);
