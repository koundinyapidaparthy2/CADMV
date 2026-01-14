import { QuizConfig } from './types';

// A verified dictionary of stable Wikimedia URLs for CA DMV signs
export const SIGN_LIBRARY = {
  "STOP": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/STOP_sign.svg/1200px-STOP_sign.svg.png",
  "YIELD": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Yield_sign.svg/1200px-Yield_sign.svg.png",
  "SCHOOL_ZONE": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/S1-1_School_Sign.svg/1200px-S1-1_School_Sign.svg.png",
  "NO_U_TURN": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/California_R3-4.svg/1200px-California_R3-4.svg.png",
  "ONE_WAY": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/One_Way_sign.svg/1200px-One_Way_sign.svg.png",
  "SLIPPERY_WHEN_WET": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Slippery_Road_Sign.svg/1200px-Slippery_Road_Sign.svg.png",
  "PEDESTRIAN_CROSSING": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/MUTCD_W11-2.svg/1200px-MUTCD_W11-2.svg.png",
  "DO_NOT_ENTER": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Do_Not_Enter.svg/1200px-Do_Not_Enter.svg.png",
  "DIVIDED_HIGHWAY_ENDS": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/W6-2_sign.svg/1200px-W6-2_sign.svg.png",
  "MERGING_TRAFFIC": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/MUTCD_W4-1.svg/1200px-MUTCD_W4-1.svg.png",
  "KEEP_RIGHT": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Keep_Right_sign.svg/1200px-Keep_Right_sign.svg.png",
  "NO_LEFT_TURN": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/No_Left_Turn.svg/1200px-No_Left_Turn.svg.png",
  "SIGNAL_AHEAD": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Signal_Ahead_sign.svg/1200px-Signal_Ahead_sign.svg.png",
  "RR_CROSSING": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Railroad_Crossing_Warning_Sign.svg/1200px-Railroad_Crossing_Warning_Sign.svg.png",
  "HILL_AHEAD": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/MUTCD_W7-1.svg/1200px-MUTCD_W7-1.svg.png"
};

export const HANDBOOK_HIGHLIGHTS_2025 = `
CRITICAL KNOWLEDGE FROM CALIFORNIA DRIVER'S HANDBOOK (2025 EDITION):

1. SPEED LIMITS:
   - 25 mph: School zones, Residential, Business districts.
   - 15 mph: Blind intersections, Alleys, Near RR tracks.
   - 65 mph: Max on most highways.
   - 55 mph: Two-lane undivided highways.

2. NUMBERS & DISTANCES:
   - 3 seconds: Following distance.
   - 100 feet: Signal before turn.
   - 200 feet: Distance in center left-turn/bike lane.
   - 18 inches: Max curb distance.
   - 10 days: Notify DMV after accident/move.

3. MINORS & DUI:
   - Under 21: 0.01% BAC Zero Tolerance. 
   - Provisional: No driving 11pm-5am first year.
   - DUI: 0.08% for 21+.

4. SIGN LIBRARY (USE THESE EXACT URLS):
${JSON.stringify(SIGN_LIBRARY, null, 2)}
`;

const getFocusInstruction = (focus: string) => {
  switch (focus) {
    case 'numeric': return 'The quiz MUST be "Math Oriented". Every question must involve numeric values.';
    case 'minors': return 'The quiz MUST focus on "Students Under 21".';
    case 'dui': return 'The quiz MUST focus on Alcohol, Drugs, and DUI laws.';
    case 'signs': return 'The quiz MUST focus on Traffic Signs. Use the SIGN LIBRARY URLs for questionImageUrl or optionImageUrls. For "Which sign means..." questions, provide 4 different URLs in optionImageUrls.';
    case 'fines': return 'The quiz MUST focus on Fines and Penalties.';
    default: return 'Generate a balanced mix of all handbook topics.';
  }
};

const getStyleInstruction = (style: string) => {
  switch (style) {
    case 'scenario': return 'All questions must be "Scenario-based".';
    case 'straightforward': return 'All questions must be "Straightforward" factual questions.';
    default: return 'Provide a mix of scenario-based and straightforward factual questions.';
  }
};

const getDifficultyInstruction = (difficulty: string) => {
  if (difficulty === 'mix') {
    return 'Vary the difficulty of questions between "easy", "medium", and "hard". IMPORTANT: The "difficulty" field in JSON must NOT be "mix", it must be one of the specific levels.';
  }
  return `All questions should be "${difficulty}" difficulty.`;
};

export const getGenerationPrompt = (config: QuizConfig, seenHashes: string[]) => `
You are an expert CA DMV examiner. Generate a JSON quiz.

PARAMETERS:
- Count: ${config.questionCount}
- Difficulty Setting: ${getDifficultyInstruction(config.difficulty)}
- Focus: ${getFocusInstruction(config.focus)}
- Style: ${getStyleInstruction(config.style)}

UNIQUENESS:
AVOID questions related to these hashes: [${seenHashes.join(', ')}]. 

IMAGE RELIABILITY:
- If a question is about a sign, ALWAYS provide a 'questionImageUrl'.
- Use the EXACT URLs from the SIGN LIBRARY provided in Section 4. 
- If asking "Identify this sign", provide the URL in questionImageUrl and text answers.
- If asking "Which of these is the YIELD sign", provide text in options and matching URLs in optionImageUrls.

JSON SCHEMA:
{
  "quizTitle": "CA DMV Practice Test",
  "totalQuestions": ${config.questionCount},
  "questions": [
    {
      "questionId": "u_1",
      "difficulty": "medium",
      "question": "What does this sign mean?",
      "options": ["Stop", "Yield", "No Entry", "Caution"],
      "correctAnswer": "Yield",
      "questionImageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Yield_sign.svg/1200px-Yield_sign.svg.png"
    }
  ]
}

${HANDBOOK_HIGHLIGHTS_2025}
`;

export const FALLBACK_QUIZ_DATA = {
  "quizTitle": "CA DMV Practice Test",
  "totalQuestions": 1,
  "questions": [
    {
      "questionId": "demo1",
      "difficulty": "medium",
      "question": "Which of these signs means Yield?",
      "options": ["Triangle", "Octagon", "Diamond", "Rectangle"],
      "correctAnswer": "Triangle",
      "questionImageUrl": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Yield_sign.svg/1200px-Yield_sign.svg.png"
    }
  ]
};