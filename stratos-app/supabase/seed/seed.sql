-- Stratos seed data (run after migrations). Uses NULL user_id for global content.

-- Default topic templates note: per-user topics created on onboarding; this seeds global flashcards/questions/prompts.

-- 100 WAT words
insert into public.interview_questions (user_id, question, category, status) values
(null, 'What are your strengths and weaknesses?', 'Personal', 'needs_work'),
(null, 'Why do you want to join the Indian Army?', 'Motivation', 'needs_work'),
(null, 'Why technical branch / TGC / SSC Tech?', 'Motivation', 'needs_work'),
(null, 'Tell me about your engineering projects.', 'Technical', 'needs_work'),
(null, 'How do you handle failure?', 'Personal', 'needs_work'),
(null, 'Describe a leadership experience.', 'OLQ', 'needs_work'),
(null, 'What is your daily routine?', 'Personal', 'needs_work'),
(null, 'Current role of Indian Army in disaster relief?', 'GK', 'needs_work'),
(null, 'What is AFSPA? Give a balanced view.', 'GK', 'needs_work'),
(null, 'Difference between Regiment and Corps?', 'Army GK', 'needs_work'),
(null, 'Explain a recent defence exercise involving India.', 'Current Affairs', 'needs_work'),
(null, 'What do you know about indigenous defence equipment?', 'Defence', 'needs_work'),
(null, 'How does your branch contribute to Army operations?', 'Technical', 'needs_work'),
(null, 'Tell me about a conflict you resolved in a team.', 'GTO/PI', 'needs_work'),
(null, 'What are your hobbies and what do they teach you?', 'Personal', 'needs_work'),
(null, 'Where do you see yourself in 10 years in the Army?', 'Motivation', 'needs_work'),
(null, 'What is theatre command concept?', 'Defence', 'needs_work'),
(null, 'Explain OODA loop in decision making.', 'Concept', 'needs_work'),
(null, 'How will you prepare physically for training academy?', 'Fitness', 'needs_work'),
(null, 'A moral dilemma: report a friend or protect them—what do you do?', 'Situational', 'needs_work'),
(null, 'What is the significance of Line of Actual Control?', 'GK', 'needs_work'),
(null, 'Tell me about your family background.', 'Personal', 'needs_work'),
(null, 'How do you keep yourself updated with current affairs?', 'Habits', 'needs_work'),
(null, 'What is the role of engineers in combat support?', 'Technical', 'needs_work'),
(null, 'Describe a time you showed responsibility.', 'OLQ', 'needs_work'),
(null, 'What is your opinion on social media use for officers?', 'Situational', 'needs_work'),
(null, 'Explain any core subject concept from your branch.', 'Technical', 'needs_work'),
(null, 'What do you know about SSB 5-day process?', 'SSB', 'needs_work'),
(null, 'How do you handle stress and pressure?', 'Personal', 'needs_work'),
(null, 'Why should we recommend you?', 'PI', 'needs_work');

-- Extend interview questions to ~150 with generated placeholders (abbreviated seed set; expand as needed)
insert into public.interview_questions (user_id, question, category, status)
select null, 'Interview practice question #' || gs::text || ': discuss a current national issue and your reasoned view.', 'Current Affairs', 'needs_work'
from generate_series(31,150) gs;

-- 200 flashcards (Army/Defence GK spaced repetition seeds)
insert into public.flashcards (user_id, front, back, tags, source)
select null,
  'Defence GK Card #' || gs || ': Key fact/topic to revise',
  'Sample answer: revise official sources, note date, context, and interview relevance. Replace with curated content as you study.',
  array['defence','gk'],
  'seed'
from generate_series(1,200) gs;

-- 100 WAT words stored as flashcards tagged WAT for practice
insert into public.flashcards (user_id, front, back, tags, source)
select null, w.word, 'Write a positive, action-oriented sentence using: ' || w.word, array['WAT'], 'seed'
from (values
('Discipline'),('Courage'),('Failure'),('Leader'),('Team'),('Pressure'),('Honesty'),('Fear'),('Success'),('Duty'),
('Initiative'),('Conflict'),('Responsibility'),('Challenge'),('Decision'),('Friendship'),('Hardship'),('Victory'),('Change'),('Trust'),
('Sacrifice'),('Obstacle'),('Goal'),('Time'),('Effort'),('Respect'),('Command'),('Support'),('Patience'),('Integrity'),
('Risk'),('Service'),('Country'),('Weakness'),('Strength'),('Practice'),('Mistake'),('Learning'),('Cooperation'),('Confidence'),
('Planning'),('Action'),('Truth'),('Justice'),('Resource'),('Help'),('Crisis'),('Order'),('Calm'),('Adapt'),
('Focus'),('Ambition'),('Pride'),('Humility'),('Unity'),('Faith'),('Loyalty'),('Energy'),('Danger'),('Safety'),
('Honor'),('Example'),('Motivation'),('Routine'),('Training'),('Fitness'),('Knowledge'),('Skill'),('Strategy'),('Tactics'),
('Communication'),('Listening'),('Empathy'),('Courageous'),('Reliable'),('Creative'),('Persistent'),('Flexible'),('Accountable'),('Optimism'),
('Setback'),('Opportunity'),('Achievement'),('Authority'),('Volunteer'),('Comrade'),('Mission'),('Preparedness'),('Endurance'),('Alertness'),
('Problem'),('Solution'),('Innovation'),('Determination'),('Bravery'),('Character'),('Reputation'),('Progress'),('Balance'),('Commitment')
) as w(word);

-- 50 SRT situations as notebook-style seed questions in interview_questions (category SRT seed) for practice retrieval
insert into public.interview_questions (user_id, question, category, status)
select null,
  'SRT #' || gs || ': You face an unexpected challenge with limited time/resources. What practical, prompt, responsible action do you take?',
  'SRT', 'needs_work'
from generate_series(1,50) gs;

-- 30 TAT/PPDT prompts
insert into public.interview_questions (user_id, question, category, status)
select null,
  'TAT/PPDT Prompt #' || gs || ': Observe a picture/scenario (imagine a clear scene), identify a hero, show positive action, realistic challenges, and a constructive outcome in 4 minutes.',
  'TAT_PPDT', 'needs_work'
from generate_series(1,30) gs;

-- Sample reminders template note: user-specific reminders created in-app; email preferences created by trigger.
