export type DailyLesson = {
  day: number;
  topic: string;
  focus: string;
  ssbLink: string;
  objectives: string[];
  learn: string[];
  keyPoints: string[];
  example?: string;
  doDont?: { do: string[]; dont: string[] };
  practice: string;
  reflection: string;
};

export const SSB_DAILY_LESSONS: DailyLesson[] = [
  {
    day: 1, topic: "Officer Like Qualities (OLQs)", focus: "Introduction to the 15 OLQs", ssbLink: "All SSB stages",
    objectives: ["Understand the 4 OLQ factors", "Relate OLQs to daily behaviour", "Identify personal strengths and gaps"],
    learn: [
      "SSB assesses personality through 15 Officer Like Qualities grouped into four factors: (1) Planning & Organizing (Effective Intelligence, Reasoning Ability, Organizing Ability, Power of Expression), (2) Social Adjustment (Social Adaptability, Cooperation, Sense of Responsibility), (3) Social Effectiveness (Initiative, Self Confidence, Speed of Decision, Ability to Influence the Group, Liveliness), (4) Dynamic (Determination, Courage, Stamina).",
      "OLQs are not acted out in a single test; they emerge consistently across psychology tests, GTO tasks, interview, and conference. Assessors look for patterns over time, not one perfect answer.",
      "Preparation means building habits: take initiative, stay positive, communicate clearly, work with others, and follow through on responsibilities.",
    ],
    keyPoints: ["Consistency across all tests matters", "Show qualities through actions, not claims", "Balanced personality is valued over extremes"],
    example: "If a plan fails in GPE, a good response is to quickly reorganize resources and continue calmly (reasoning, organizing, determination) rather than blaming others.",
    doDont: { do: ["Give real examples from life", "Stay practical and positive"], dont: ["Memorize fake stories", "Claim qualities without evidence"] },
    practice: "Rate yourself 1-10 on each OLQ and write one real-life example for 5 OLQs you want to improve.",
    reflection: "Which OLQ did I demonstrate today in study, fitness, or family/team interactions?"
  },
  {
    day: 2, topic: "OIR - Verbal Reasoning", focus: "Analogies, series, coding-decoding, syllogism basics", ssbLink: "Screening (Day 1)",
    objectives: ["Improve speed and accuracy", "Recognize common verbal patterns", "Avoid careless errors under time pressure"],
    learn: [
      "OIR (Officer Intelligence Rating) includes verbal and non-verbal reasoning. Verbal questions test logic in words/numbers: series, analogies, odd-one-out, coding-decoding, direction sense, and basic syllogisms.",
      "A good method: read carefully, identify the rule/pattern, eliminate wrong options, and move on if stuck. Accuracy and steady pace both matter.",
      "Regular timed practice builds familiarity so you spend less time decoding question types on test day.",
    ],
    keyPoints: ["Understand the pattern before calculating", "Don't overthink easy questions", "Mark and revisit only if time permits"],
    example: "Series 2, 6, 12, 20, ? — differences are +4, +6, +8, so next is +10 => 30.",
    doDont: { do: ["Practice with a timer daily", "Review mistakes to find weak types"], dont: ["Spend too long on one question", "Guess randomly without eliminating options"] },
    practice: "Solve 30 verbal reasoning questions in a timed set; note 3 mistake patterns and revise them.",
    reflection: "Which verbal question type slowed me down today and why?"
  },
  {
    day: 3, topic: "OIR - Non-Verbal Reasoning", focus: "Figures, patterns, cubes, spatial ability", ssbLink: "Screening (Day 1)",
    objectives: ["Strengthen visual pattern recognition", "Handle rotation/mirror/cube questions", "Maintain speed"],
    learn: [
      "Non-verbal reasoning uses shapes and figures: series completion, mirror/water images, embedded figures, paper folding/cutting, cube and dice, and matrix patterns.",
      "Look for changes in shape, number of elements, rotation, shading, and position. Solve by comparing one change at a time.",
      "Spatial questions become easier with repeated exposure; train your eye to scan systematically.",
    ],
    keyPoints: ["Track one transformation at a time", "Check rotation direction carefully", "Practice common figure families"],
    example: "In a figure series, if each step rotates 90° clockwise and adds one dot, apply both rules to predict the next figure.",
    doDont: { do: ["Use rough mental checkpoints (count, angle, shading)", "Practice mixed sets"], dont: ["Assume symmetry without checking", "Rush and miss small details"] },
    practice: "Attempt 30 non-verbal questions with timer; redo incorrect ones and explain the rule.",
    reflection: "Did I make errors due to speed or due to concept gaps?"
  },
  {
    day: 4, topic: "PPDT - Picture Perception & Observation", focus: "Seeing clearly before writing", ssbLink: "Screening (Day 1)",
    objectives: ["Observe key details in 30 seconds", "Identify characters, mood, age, and setting", "Form a meaningful perception"],
    learn: [
      "In PPDT, you see a hazy picture briefly, note details, and write a story. Good perception starts with observation: number of characters, gender/age (approx.), mood, setting, and what is likely happening.",
      "Your story should be logical and positive. The 'hero' (main character) should perceive a situation, plan, act, and achieve a realistic outcome.",
      "Avoid forcing extreme themes (crime/disaster) unless clearly suggested. Keep it grounded and constructive.",
    ],
    keyPoints: ["Who, what, where, mood, action", "Hero takes initiative", "Outcome is realistic and positive"],
    example: "If you see people near a field, a practical story could be about organizing a community clean-up or helping set up an awareness camp with teamwork.",
    doDont: { do: ["Keep perception simple and clear", "Show planning and action"], dont: ["Invent irrelevant details", "Write a pessimistic or passive story"] },
    practice: "Observe any photo for 30 seconds, note characters/mood/action, then write a 1-minute perception summary.",
    reflection: "Was my perception based on what I saw or what I assumed?"
  },
  {
    day: 5, topic: "PPDT - Story Writing & Narration Basics", focus: "Structure and clarity", ssbLink: "Screening (Day 1)",
    objectives: ["Write a structured story in time", "Show OLQs through hero's actions", "Prepare for clear narration"],
    learn: [
      "A useful PPDT/TAT structure: past (what led to the scene), present (what is happening and what hero decides), future (actions taken and positive result).",
      "Narration/discussion later values clarity, confidence, and cooperation. Even in writing, clarity of thought helps: introduce the hero, define aim, take steps, conclude realistically.",
      "Assessors prefer constructive, responsible action over sensationalism.",
    ],
    keyPoints: ["Past-Present-Future flow", "Action-oriented hero", "Brief, clear, positive ending"],
    example: "Hero notices students lacking guidance, organizes a study group, coordinates resources, and improves results over weeks.",
    doDont: { do: ["Use simple language", "Show teamwork and responsibility"], dont: ["Leave story incomplete", "Make hero unrealistic/superhuman"] },
    practice: "Write one complete PPDT-style story in 4 minutes and underline hero actions showing OLQs.",
    reflection: "Did my hero take concrete steps or only have intentions?"
  },
  {
    day: 6, topic: "TAT - Thematic Apperception Test", focus: "Positive themes and purposeful action", ssbLink: "Psychology (Day 2)",
    objectives: ["Generate healthy, realistic themes", "Reflect OLQs naturally", "Manage 4-minute writing cycles"],
    learn: [
      "TAT presents ambiguous pictures; you write stories for each. The goal is to reveal your usual way of perceiving challenges and responding to them.",
      "Strong TAT stories show: need/goal, planning, effort, cooperation/leadership as relevant, handling obstacles, and a realistic positive outcome.",
      "Blank slide (if shown) is an opportunity to express a meaningful personal theme (goal, responsibility, improvement) — keep it genuine and constructive.",
    ],
    keyPoints: ["Meaningful goal", "Practical steps", "Realistic improvement/outcome"],
    example: "A scene suggesting an accident can become a story of providing first aid, calling help, managing crowd, and ensuring timely medical care.",
    doDont: { do: ["Stay calm and constructive", "Write legibly and completely"], dont: ["Write repeated/pre-memorized plots", "Over-dramatize or show helplessness"] },
    practice: "Write 2 TAT stories (4 minutes each). After writing, identify OLQs shown in each.",
    reflection: "Were my themes positive and action-driven under time pressure?"
  },
  {
    day: 7, topic: "WAT - Word Association Test", focus: "Quick, positive, and meaningful responses", ssbLink: "Psychology (Day 2)",
    objectives: ["Respond within 15 seconds", "Build constructive associations", "Avoid negative/preachy patterns"],
    learn: [
      "WAT shows 60 words one after another (about 15 seconds each). You write the thought/sentence that comes naturally. It reflects attitude, optimism, initiative, and social outlook.",
      "Good responses are short, positive, and action-oriented (e.g., effort, learning, teamwork, responsibility). It's okay to write phrases or brief sentences.",
      "If you miss a word, move on. Do not panic or try to go back during the test.",
    ],
    keyPoints: ["Positive attitude", "Action/solution mindset", "Simplicity and clarity"],
    example: "Word 'Failure' → 'Failure teaches lessons for better effort.' Word 'Team' → 'Teamwork achieves goals.'",
    doDont: { do: ["Practice common words daily", "Keep responses natural"], dont: ["Write negative/moral lectures", "Copy memorized sentences blindly"] },
    practice: "Practice 60 WAT words with a 15-second timer. Mark any negative or vague responses and improve them.",
    reflection: "Did my responses show optimism, responsibility, and initiative?"
  },
  {
    day: 8, topic: "SRT - Situation Reaction Test", focus: "Practical, prompt, responsible action", ssbLink: "Psychology (Day 2)",
    objectives: ["Prioritize actions sensibly", "Show responsibility and courage", "Write complete responses quickly"],
    learn: [
      "SRT gives everyday and challenging situations; you write what you will do. Responses should be practical, timely, ethical, and within your capacity.",
      "A strong approach: assess the situation, ensure safety/help if needed, take immediate action, inform relevant people/authority, and follow through.",
      "Quality and completeness matter more than fancy language. Use short, clear statements (you can use commas/steps).",
    ],
    keyPoints: ["Immediate + responsible action", "Use available resources", "Follow through to completion"],
    example: "Road accident: secure area, give first aid/call ambulance, inform police/family as needed, assist till help arrives.",
    doDont: { do: ["Be realistic and prompt", "Show initiative and care for others"], dont: ["Panic, ignore, or postpone", "Take illegal or impossible actions"] },
    practice: "Solve 30 SRTs in 15 minutes. Review: did each answer include action and completion?",
    reflection: "In my responses today, did I act promptly and responsibly?"
  },
  {
    day: 9, topic: "Self Description (SD)", focus: "Honest self-awareness and consistency", ssbLink: "Psychology (Day 2)",
    objectives: ["Write balanced SD paragraphs", "Maintain consistency with PIQ/interview", "Show self-improvement"],
    learn: [
      "SD typically asks what parents, teachers/employers, friends/colleagues think about you; what you think about yourself; and your aim/qualities you'd like to improve.",
      "Be honest and balanced: include strengths with examples and acknowledge improvement areas with efforts you are making. Consistency with your real life and interview answers is crucial.",
      "Avoid generic praise. Specific habits and actions make SD credible.",
    ],
    keyPoints: ["Balanced strengths and improvements", "Specific examples", "Consistency across SSB"],
    example: "Instead of 'I am hardworking', write 'I follow a daily study schedule and completed my project on time despite exams.'",
    doDont: { do: ["Be genuine and specific", "Mention how you improve weaknesses"], dont: ["Contradict your PIQ", "Copy idealized templates"] },
    practice: "Write 5 SD paragraphs (parents, teachers, friends, self, aim/improvement) and check for consistency.",
    reflection: "Do my strengths and weaknesses sound honest and supported by examples?"
  },
  {
    day: 10, topic: "Personal Interview - PIQ & Self Knowledge", focus: "Know your life facts and motivations", ssbLink: "Interview (Day 3/4)",
    objectives: ["Prepare PIQ thoroughly", "Answer confidently without bluffing", "Connect experiences to OLQs"],
    learn: [
      "The Personal Information Questionnaire (PIQ) drives many interview questions: education, family, responsibilities, hobbies, sports, achievements, NCC/training, and choices.",
      "Interviewing Officer checks honesty, clarity, reasoning, and self-awareness. If you don't know something, admit it calmly and show willingness to learn.",
      "Prepare explanations for decisions (branch, career, Army/technical entry), daily routine, strengths/weaknesses, and learning from failures.",
    ],
    keyPoints: ["Know your PIQ inside-out", "Be truthful and composed", "Give structured answers (point + example)"],
    example: "For 'Why Army?', connect motivation, aptitude, lifestyle readiness, and how your technical skills can contribute — with real experiences.",
    doDont: { do: ["Revise facts and dates", "Stay polite and confident"], dont: ["Bluff or exaggerate", "Blame others for failures"] },
    practice: "Prepare and speak answers for 10 PIQ-based questions (education, hobbies, responsibility, failure, why Army).",
    reflection: "Can I explain my choices and experiences clearly and honestly?"
  },
  {
    day: 11, topic: "Personal Interview - Current Affairs & Defence Awareness", focus: "Informed and balanced viewpoints", ssbLink: "Interview",
    objectives: ["Build daily current affairs habit", "Understand issues, not just headlines", "Express balanced opinions"],
    learn: [
      "Interview questions often cover national, international, and defence-related current affairs. You are expected to have a basic, accurate understanding and a reasoned opinion.",
      "Focus on: major national initiatives, security situation basics, defence exercises/inductions (conceptual), and regional issues. Prefer facts from reliable sources.",
      "When giving opinions, be balanced: state context, pros/concerns, and a practical viewpoint. It's fine to say you'll read more on unknown details.",
    ],
    keyPoints: ["Facts first, opinion second", "Balanced and mature responses", "Relate to national interest/responsibility"],
    example: "On a defence exercise: mention purpose (interoperability/training), participating nations (if known), and broader significance for preparedness.",
    doDont: { do: ["Follow reliable news daily", "Admit if unsure of a detail"], dont: ["Spread rumours", "Take extreme/biased positions without basis"] },
    practice: "Read 3 defence/national news items today and prepare 2 interview points + 1 possible question for each.",
    reflection: "Can I discuss today's important issues with clarity and balance?"
  },
  {
    day: 12, topic: "Personal Interview - Technical/Branch Knowledge", focus: "Engineering fundamentals for TGC/SSC Tech", ssbLink: "Interview (Technical Entry)",
    objectives: ["Revise core subjects", "Explain concepts simply", "Relate engineering to Army applications"],
    learn: [
      "For technical entries, expect questions on your engineering branch basics, final year projects, internships, and practical applications. Depth can vary, but fundamentals must be clear.",
      "Prepare 2-3 core subjects well, understand your project objectives, your role, challenges, and outcomes. Be ready to draw simple diagrams/explanations verbally.",
      "Link technical knowledge to Army roles where relevant (communications, infrastructure, mobility, maintenance, systems) without overclaiming.",
    ],
    keyPoints: ["Strong fundamentals", "Know your projects", "Clear, simple explanations"],
    example: "If asked about your project, explain problem statement, approach, your contribution, result, and what you learned.",
    doDont: { do: ["Revise basics daily", "Be honest about your contribution"], dont: ["Memorize definitions without understanding", "Claim expertise you don't have"] },
    practice: "Revise 2 core topics from your branch and explain one project/problem aloud in 3-4 minutes.",
    reflection: "Could I explain my technical knowledge clearly to a non-specialist?"
  },
  {
    day: 13, topic: "GTO - Group Discussion (GD)", focus: "Constructive and cooperative participation", ssbLink: "GTO (Day 3/4)",
    objectives: ["Contribute logical points", "Listen and build on others' ideas", "Maintain group harmony"],
    learn: [
      "In GD, assessors observe reasoning, communication, cooperation, and influence. The aim is not to 'win' but to help the group discuss meaningfully.",
      "Enter with a relevant point, support with examples/facts, listen actively, and encourage quieter members when possible. If the group digresses, help bring it back.",
      "Quality of contribution matters more than quantity. Stay calm and respectful even in disagreement.",
    ],
    keyPoints: ["Logical content", "Cooperation and listening", "Calm, positive influence"],
    example: "Instead of rejecting someone, say: 'I agree with your point on X, and we can also consider Y because...'",
    doDont: { do: ["Speak clearly and briefly", "Respect others' views"], dont: ["Dominate or shout", "Stay silent throughout"] },
    practice: "Discuss one current topic for 10 minutes (with peers or self-recording) focusing on structure and cooperation.",
    reflection: "Did I add value to the discussion and help the group progress?"
  },
  {
    day: 14, topic: "GTO - Group Planning Exercise (GPE)", focus: "Prioritization, planning, and teamwork", ssbLink: "GTO",
    objectives: ["Identify problems and priorities", "Allocate time/resources practically", "Present a coherent group plan"],
    learn: [
      "GPE presents multiple problems on a map/situation with limited time and resources. You must prioritize (life-threatening/urgent first), plan actions, assign groups/resources, and account for time and distance.",
      "A good plan states assumptions, sequence of actions, who does what, and how the group reunites/completes the main task. Practicality is key.",
      "In group discussion, contribute calmly, accept better ideas, and help converge to a workable plan.",
    ],
    keyPoints: ["Prioritize by urgency and impact", "Time-distance-resource awareness", "Clear, feasible plan"],
    example: "Handle casualty/fire first (immediate), inform authorities, delegate teams in parallel if possible, then proceed to original task.",
    doDont: { do: ["Be systematic and practical", "Coordinate parallel actions"], dont: ["Ignore time constraints", "Insist on your plan if impractical"] },
    practice: "Solve one GPE scenario: list problems, set priority, write a timed action plan, and review feasibility.",
    reflection: "Was my plan practical, prioritized, and easy for a group to execute?"
  },
  {
    day: 15, topic: "GTO - PGT/HGT & Group Tasks Concepts", focus: "Cooperation, ideas, and rule-following", ssbLink: "GTO",
    objectives: ["Understand group task expectations", "Contribute workable ideas", "Support team execution"],
    learn: [
      "Progressive/Half Group Tasks involve crossing obstacles using helping materials under rules. Assessors observe cooperation, initiative, practical intelligence, and physical/mental engagement.",
      "Focus on understanding rules, suggesting simple workable ideas, helping implement them, and encouraging others. If an idea fails, adapt quickly without frustration.",
      "Physical ability helps, but attitude, teamwork, and responsible behaviour matter greatly.",
    ],
    keyPoints: ["Follow rules", "Be useful to the group", "Adapt and stay positive"],
    example: "If a plank placement is unstable, suggest repositioning, check safety, and coordinate the team to try again.",
    doDont: { do: ["Volunteer and assist", "Communicate clearly"], dont: ["Break rules for speed", "Stand aside disengaged"] },
    practice: "Study common GTO structures/rules and visualize 2 obstacle solutions emphasizing teamwork and safety.",
    reflection: "Do I naturally contribute ideas and help others during group activities?"
  },
  {
    day: 16, topic: "Lecturette", focus: "3-minute structured talk", ssbLink: "GTO",
    objectives: ["Organize thoughts quickly", "Speak confidently and clearly", "Deliver relevant content"],
    learn: [
      "Lecturette requires choosing a topic (from options), preparing briefly, and speaking for about 3 minutes. Structure helps: introduction, 2-3 key points, and conclusion.",
      "Content should be relevant and factual where possible. Delivery matters: posture, eye contact, pace, and clarity. Avoid reading from notes (if any) continuously.",
      "Practice on diverse topics (current affairs, social issues, defence, technology, personal development) to build confidence.",
    ],
    keyPoints: ["Intro-body-conclusion", "Clear and confident delivery", "Stay on topic and within time"],
    example: "Topic 'Leadership': define briefly, give qualities with examples, link to Armed Forces/team settings, conclude with importance.",
    doDont: { do: ["Use simple structure and examples", "Maintain calm body language"], dont: ["Speak too fast/too softly", "Go off-topic or freeze after mistakes"] },
    practice: "Pick a random topic, prepare for 3 minutes, speak for 3 minutes, and review content + delivery.",
    reflection: "Was my talk structured, clear, and within time?"
  },
  {
    day: 17, topic: "Command Task & Individual Obstacles (Concepts)", focus: "Leadership, planning, and stamina mindset", ssbLink: "GTO",
    objectives: ["Understand command responsibilities", "Plan and brief effectively", "Build confidence for individual effort"],
    learn: [
      "In Command Task, you act as commander for a small obstacle task: choose subordinates, explain the plan, allocate tasks, and execute within rules. Clarity and calm leadership are important.",
      "In Individual Obstacles (IO), you attempt tasks in sequence by choice within time. It reflects stamina, courage, planning, and determination. Choose an order that suits your strengths but shows willingness to challenge yourself.",
      "In both, composure and sensible decision-making matter as much as physical performance.",
    ],
    keyPoints: ["Clear briefing and control", "Practical planning", "Courage with judgment"],
    example: "As commander: explain objective, assign roles, check resources/rules, execute stepwise, and encourage the team.",
    doDont: { do: ["Stay calm and decisive", "Choose a sensible obstacle sequence"], dont: ["Micromanage or panic", "Give up early without effort"] },
    practice: "Write/voice a 2-minute command briefing for a hypothetical task; plan an IO sequence based on your fitness.",
    reflection: "Do I communicate clearly and stay composed when responsible for outcomes?"
  },
  {
    day: 18, topic: "Army & Defence Knowledge", focus: "Organisation, ranks, and awareness basics", ssbLink: "Interview & GK",
    objectives: ["Know basic Army structure and ranks", "Build defence awareness habit", "Prepare for common interview questions"],
    learn: [
      "Aspirants should know foundational facts: Army structure (commands/corps/divisions at a high level), rank hierarchy, training academies, and roles of technical arms/services relevant to entry.",
      "Stay updated on major defence exercises, indigenous equipment/programmes, and current security issues at a factual level. Use official/reliable sources for verification.",
      "Understanding 'why' (purpose, significance) is more valuable than memorizing isolated facts.",
    ],
    keyPoints: ["Basics of structure and ranks", "Reliable, current information", "Significance over rote facts"],
    example: "When learning about an exercise, note participants, objective (interoperability/training), domain (land/sea/air/joint), and significance.",
    doDont: { do: ["Verify from official sources", "Revise regularly in small chunks"], dont: ["Rely on rumours/social media forwards", "Memorize without understanding"] },
    practice: "Revise rank structure and note 5 current defence/Army facts with their significance (verify from reliable sources).",
    reflection: "Can I explain basic Army facts and recent developments confidently and accurately?"
  },
  {
    day: 19, topic: "Physical Fitness & Medical Readiness (Awareness)", focus: "Stamina, routine, and injury prevention", ssbLink: "GTO & Medical readiness",
    objectives: ["Follow consistent fitness routine", "Understand basic medical readiness awareness", "Train safely and progressively"],
    learn: [
      "Physical fitness supports GTO performance and overall officer training readiness: running, strength (push-ups/pull-ups), core, flexibility, and endurance matter.",
      "Progress gradually (base → build → peak), include warm-up/cool-down, rest, hydration, sleep, and nutrition. Avoid overtraining and never push through pain.",
      "Medical standards are assessed officially; maintain general health awareness and consult qualified professionals for concerns. Use official sources for standards/information.",
    ],
    keyPoints: ["Consistency over intensity spikes", "Safety and recovery", "Official guidance for medical standards"],
    example: "A weekly plan can include runs, strength sessions, mobility work, and one rest/recovery day with gradual progression.",
    doDont: { do: ["Train progressively and log workouts", "Warm up, cool down, recover"], dont: ["Ignore pain/injury", "Rely on unverified medical advice"] },
    practice: "Complete and log today's workout (run/strength/flexibility) and note one recovery action (sleep/hydration/stretching).",
    reflection: "Did I train consistently and safely today?"
  },
  {
    day: 20, topic: "Communication, Confidence & Body Language", focus: "Power of expression in all SSB stages", ssbLink: "All stages",
    objectives: ["Improve clarity and confidence", "Use positive body language", "Practice active listening"],
    learn: [
      "Effective communication in SSB means expressing ideas clearly, listening actively, and responding respectfully. It's not about accent or vocabulary; it's about clarity and confidence.",
      "Body language supports your message: upright posture, eye contact, calm gestures, and attentive listening. In group tasks, encourage others and stay composed.",
      "Practice speaking on varied topics, summarizing thoughts, and giving examples. Self-recording helps identify pace, filler words, and clarity issues.",
    ],
    keyPoints: ["Clarity over complexity", "Confident, respectful conduct", "Listen as well as speak"],
    example: "In GD/Interview: answer to the point, give one example, pause briefly to think, and maintain composed posture.",
    doDont: { do: ["Practice aloud regularly", "Stay calm and respectful"], dont: ["Interrupt aggressively", "Use memorized robotic answers"] },
    practice: "Record a 2-minute self-introduction and a 2-minute opinion on a topic; review clarity, pace, and body language.",
    reflection: "Did I communicate clearly and listen actively in my interactions today?"
  },
  {
    day: 21, topic: "Conference, Self-Review & Weekly Consolidation", focus: "Consistency, learning, and improvement", ssbLink: "Conference (Day 5) & overall prep",
    objectives: ["Review performance across areas", "Identify weak points and actions", "Plan next week with consistency"],
    learn: [
      "Conference assesses overall suitability based on performance across psychology, GTO, and interview. Consistency of personality and behaviour is important throughout SSB.",
      "Regular self-review builds improvement: track what went well, what needs work, and specific actions for the next week (practice sets, fitness, current affairs, revision).",
      "Treat every practice session as feedback. Steady, disciplined preparation over time is more effective than last-minute bursts.",
    ],
    keyPoints: ["Consistency across tests", "Honest self-review", "Actionable next-week plan"],
    example: "If WAT responses were negative this week, plan daily 15-minute WAT practice and review improved responses each evening.",
    doDont: { do: ["Set specific weekly targets", "Maintain routine and discipline"], dont: ["Ignore repeated mistakes", "Prepare irregularly"] },
    practice: "Review this week's logs/practice, list 3 strengths and 3 improvement areas, and create next week's plan (study + fitness + SSB practice).",
    reflection: "What is my most important improvement priority for next week, and what daily action will address it?"
  },
];

export function getDailyLesson(date = new Date()): DailyLesson & { dateKey: string } {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86400000);
  const idx = (dayOfYear - 1 + SSB_DAILY_LESSONS.length) % SSB_DAILY_LESSONS.length;
  const lesson = SSB_DAILY_LESSONS[idx];
  return { ...lesson, dateKey: date.toISOString().slice(0, 10) };
}
