/**
 * Rich educational content rendered in the View-Only Reader
 * Contains structured spoken English study guides, vocabulary cheat sheets,
 * grammar timelines, and dialogue scripts authored by Wits Lingo Academy.
 */

export interface CurriculumContent {
  title: string;
  category: string;
  level: string;
  totalPages: number;
  pages: {
    pageNumber: number;
    heading: string;
    subheading?: string;
    sections: {
      type: 'vocabulary' | 'dialogue' | 'rule' | 'practice' | 'text' | 'table';
      title?: string;
      content?: string;
      items?: Array<{ word?: string; meaning?: string; sentence?: string; speaker?: string; text?: string }>;
      tableData?: { headers: string[]; rows: string[][] };
    }[];
  }[];
}

export const CURRICULUM_MATERIALS: Record<string, CurriculumContent> = {
  '500 Most Essential Spoken English Words with Real Sentences': {
    title: '500 Most Essential Spoken English Words with Real Sentences',
    category: 'English Vocabulary',
    level: 'All Levels',
    totalPages: 3,
    pages: [
      {
        pageNumber: 1,
        heading: 'Module 1: Daily Interaction & Conversation Verbs',
        subheading: 'High-frequency verbs used in everyday spoken interactions with context',
        sections: [
          {
            type: 'text',
            content: 'Mastering these 20 foundational verbs eliminates mental hesitation when transitioning from native language thought into spoken English sentences.'
          },
          {
            type: 'vocabulary',
            items: [
              { word: 'Hesitate', meaning: 'ہچکچانا / جھجھکنا (Pause before saying or doing something)', sentence: 'Don\'t hesitate to speak up in our live English class.' },
              { word: 'Articulate', meaning: 'صاف صاف بولنا (Express an idea clearly in words)', sentence: 'She articulated her thoughts with complete confidence in the meeting.' },
              { word: 'Interact', meaning: 'بات چیت کرنا / رابطہ رکھنا (Communicate or work together)', sentence: 'Try to interact with your batchmates every evening for 15 minutes.' },
              { word: 'Inquire', meaning: 'دریافت کرنا / پوچھنا (Ask for information from someone)', sentence: 'I called the academy to inquire about the upcoming batch schedule.' },
              { word: 'Overcome', meaning: 'قابو پانا (Succeed in dealing with a problem)', sentence: 'Practice will help you overcome stage fright.' }
            ]
          }
        ]
      },
      {
        pageNumber: 2,
        heading: 'Module 2: Professional & Work Environment Vocabulary',
        subheading: 'Vocabulary for interviews, meetings, and workplace communications',
        sections: [
          {
            type: 'vocabulary',
            items: [
              { word: 'Collaborate', meaning: 'مل کر کام کرنا (Work jointly on an activity)', sentence: 'Our team will collaborate on the new presentation.' },
              { word: 'Prioritize', meaning: 'ترجیح دینا (Treat something as more important than other things)', sentence: 'You must prioritize daily speaking drills over passive reading.' },
              { word: 'Comprehensive', meaning: 'جامع / مکمل (Complete including all or nearly all elements)', sentence: 'The teacher shared a comprehensive grammar guide with us.' },
              { word: 'Evaluate', meaning: 'جائزہ لینا (Form an opinion of the amount, value, or quality)', sentence: 'Sir Ziyaur Rehman evaluates each student\'s pronunciation weekly.' }
            ]
          },
          {
            type: 'rule',
            title: '⭐ Wits Lingo Golden Speaking Rule',
            content: 'Never memorize words in isolation. Always memorize a word inside a 3-to-5 word natural phrase or full sentence that you would actually use today.'
          }
        ]
      },
      {
        pageNumber: 3,
        heading: 'Module 3: Idiomatic Expressions & Transition Connectors',
        subheading: 'Natural conversational fillers to make your English sound fluent',
        sections: [
          {
            type: 'table',
            title: 'Native Speaking Connectors',
            tableData: {
              headers: ['Connector', 'Natural Usage Context', 'Example Sentence'],
              rows: [
                ['In my opinion', 'Expressing personal perspective', 'In my opinion, daily consistency is key.'],
                ['To be honest', 'Sharing candid thoughts', 'To be honest, I felt nervous on my first day.'],
                ['As far as I know', 'Sharing knowledge gently', 'As far as I know, the next batch starts Monday.'],
                ['On the other hand', 'Introducing a contrasting point', 'Grammar is helpful; on the other hand, speaking practice is essential.']
              ]
            }
          }
        ]
      }
    ]
  },

  '100 Daily Routine English Sentences for Natural Conversations': {
    title: '100 Daily Routine English Sentences for Natural Conversations',
    category: 'Daily Sentences',
    level: 'Beginner',
    totalPages: 2,
    pages: [
      {
        pageNumber: 1,
        heading: 'Morning Routine & Commute Expressions',
        subheading: 'Speak about your morning habits without translating word-for-word',
        sections: [
          {
            type: 'dialogue',
            title: 'Morning Expressions',
            items: [
              { speaker: 'Wake Up', text: 'I usually wake up around 6:30 AM before my alarm goes off.' },
              { speaker: 'Freshen Up', text: 'I head straight to the bathroom to brush my teeth and freshen up.' },
              { speaker: 'Breakfast', text: 'I grab a quick cup of tea and some toast before getting ready.' },
              { speaker: 'Commute', text: 'It takes me about 30 minutes to reach office due to morning traffic.' },
              { speaker: 'Greeting', text: 'Good morning everyone! How is your day going so far?' }
            ]
          }
        ]
      },
      {
        pageNumber: 2,
        heading: 'Work, Study & Evening Wind-Down Sentences',
        subheading: 'Expressing your daily schedule and evening habits',
        sections: [
          {
            type: 'dialogue',
            title: 'Evening & Night Expressions',
            items: [
              { speaker: 'Class Attendance', text: 'I join my Wits Lingo live spoken class promptly at 7:30 PM.' },
              { speaker: 'Speaking Drills', text: 'I partner with my batchmate to practice 1-on-1 speaking dialogues.' },
              { speaker: 'Dinner', text: 'We sit down for family dinner around 9:00 PM.' },
              { speaker: 'Sleep', text: 'I wind down by reviewing my vocabulary notes and hit the sack around 11:00 PM.' }
            ]
          }
        ]
      }
    ]
  },

  'Tenses Made Practical: A Real-Life Usage Handbook': {
    title: 'Tenses Made Practical: A Real-Life Usage Handbook',
    category: 'Grammar Guides',
    level: 'Intermediate',
    totalPages: 2,
    pages: [
      {
        pageNumber: 1,
        heading: 'The 4 Essential Spoken Tenses',
        subheading: '80% of daily conversation uses only these four tenses',
        sections: [
          {
            type: 'table',
            title: 'Practical Spoken Tenses Breakdown',
            tableData: {
              headers: ['Tense', 'When to Use in Real Life', 'Formula', 'Real Example'],
              rows: [
                ['Simple Present', 'Daily habits, general facts, routines', 'Subject + V1 (s/es)', 'I practice speaking English every day.'],
                ['Present Continuous', 'Action happening right now', 'Subject + is/am/are + V1-ing', 'I am preparing for an interview.'],
                ['Simple Past', 'Completed past action with time', 'Subject + V2', 'I attended yesterday\'s live session.'],
                ['Present Perfect', 'Past action with current relevance', 'Subject + has/have + V3', 'I have completed my homework.']
              ]
            }
          },
          {
            type: 'rule',
            title: 'Common Mistake Alert',
            content: 'Do not say: "I am having two brothers" ❌. Say: "I have two brothers" ✔️. (State verbs like have, know, believe are not used in continuous form for possession).'
          }
        ]
      },
      {
        pageNumber: 2,
        heading: 'Future Forms in Spoken English: Will vs. Going To',
        subheading: 'Knowing the optical difference in real spoken dialogues',
        sections: [
          {
            type: 'dialogue',
            items: [
              { speaker: 'Instant Decision (Will)', text: 'The phone is ringing. I\'ll pick it up.' },
              { speaker: 'Pre-planned (Going to)', text: 'I am going to visit Lahore this weekend with my family.' },
              { speaker: 'Prediction on Evidence', text: 'Look at those dark clouds; it\'s going to rain.' }
            ]
          }
        ]
      }
    ]
  }
};

/**
 * Fallback generator for materials without explicit preset curriculum
 */
export function getCurriculumForDocument(title: string, category?: string, description?: string): CurriculumContent {
  // Check exact or partial title match
  for (const [key, val] of Object.entries(CURRICULUM_MATERIALS)) {
    if (title.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(title.toLowerCase())) {
      return val;
    }
  }

  // Generate customized structured study guide
  return {
    title,
    category: category || 'Spoken English Notes',
    level: 'Batch Study Material',
    totalPages: 2,
    pages: [
      {
        pageNumber: 1,
        heading: 'Wits Lingo Academy Official Study Guide',
        subheading: description || 'Authorized lecture notes and practical speaking exercises.',
        sections: [
          {
            type: 'rule',
            title: '📌 Material Purpose & Instructions',
            content: `This document has been prepared by Ziyaur Rehman Zia for enrolled Wits Lingo Academy learners. Read each sentence aloud at least 3 times to build muscle memory in your tongue and eliminate mother tongue hesitation.`
          },
          {
            type: 'vocabulary',
            items: [
              { word: 'Pronunciation Drill', meaning: 'Correct tongue and lip placement for clear English articulation.', sentence: 'Focus on clean consonant transitions without rushing.' },
              { word: 'Dialogue Simulation', meaning: 'Real-world conversational scenario practice.', sentence: 'Practice speaking both roles aloud to develop rapid response capability.' },
              { word: 'Active Vocabulary', meaning: 'Words you can instantly retrieve and use while speaking.', sentence: 'Convert these passive words into your active daily speaking vocabulary.' }
            ]
          }
        ]
      },
      {
        pageNumber: 2,
        heading: 'Daily Speaking Workout & Reflection Checklist',
        subheading: 'Track your personal speaking consistency',
        sections: [
          {
            type: 'table',
            tableData: {
              headers: ['Checklist Item', 'Recommended Duration', 'Success Criteria'],
              rows: [
                ['Loud Reading Aloud', '15 Minutes', 'Clear voice projection, correct pause at commas'],
                ['Mirror Speaking Practice', '10 Minutes', 'Eye contact, natural facial expression, zero translation pause'],
                ['Batchmate Voice Call', '15 Minutes', 'Discussion on today\'s assigned topic using new vocabulary']
              ]
            }
          },
          {
            type: 'rule',
            title: '🔒 Proprietary Content Notice',
            content: 'All rights reserved by Wits Lingo Spoken English Academy. This study document is strictly for enrolled student view-only access. Copying, downloading, or redistributing is prohibited.'
          }
        ]
      }
    ]
  };
}
