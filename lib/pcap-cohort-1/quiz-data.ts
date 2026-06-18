export const PCAP_COHORT_SLUG = "pcap-cohort-1";
export const PCAP_COHORT_PATH = "/pcap-cohort-1";
export const PCAP_QUIZ_ID = "pcap-python-basics-1";

export type PcapChoiceId = "A" | "B" | "C" | "D";

export type PcapQuizChoice = {
  id: PcapChoiceId;
  label: string;
};

export type PcapQuizQuestion = {
  id: string;
  prompt: string;
  choices: PcapQuizChoice[];
  correctChoiceId: PcapChoiceId;
  explanation: string;
  concept: string;
};

export type PcapQuiz = {
  id: string;
  title: string;
  description: string;
  questions: PcapQuizQuestion[];
};

export const pcapCohort = {
  slug: PCAP_COHORT_SLUG,
  name: "PCAP Cohort 1",
  description:
    "A small LearnWithMe cohort preparing for the PCAP Certified Associate Python Programmer exam together.",
};

export const pcapQuiz: PcapQuiz = {
  id: PCAP_QUIZ_ID,
  title: "Python fundamentals checkpoint",
  description:
    "Five PCAP-style questions about core Python behavior, data types, and control flow.",
  questions: [
    {
      id: "q1",
      concept: "List mutation",
      prompt:
        "What is printed by this code?\n\nitems = [1, 2, 3]\nitems.append([4, 5])\nprint(len(items))",
      choices: [
        { id: "A", label: "3" },
        { id: "B", label: "4" },
        { id: "C", label: "5" },
        { id: "D", label: "TypeError" },
      ],
      correctChoiceId: "B",
      explanation:
        "append() adds its argument as one new list element, so [4, 5] becomes the fourth item.",
    },
    {
      id: "q2",
      concept: "Boolean operators",
      prompt: "Which expression evaluates to True?",
      choices: [
        { id: "A", label: "bool(0)" },
        { id: "B", label: "bool(\"\")" },
        { id: "C", label: "bool(\"False\")" },
        { id: "D", label: "bool([])" },
      ],
      correctChoiceId: "C",
      explanation:
        "Any non-empty string is truthy in Python, even the string \"False\".",
    },
    {
      id: "q3",
      concept: "Collection constructors",
      prompt:
        "Which constructor creates a mutable sequence that can be changed in place?",
      choices: [
        { id: "A", label: "list()" },
        { id: "B", label: "tuple()" },
        { id: "C", label: "dict()" },
        { id: "D", label: "set()" },
      ],
      correctChoiceId: "A",
      explanation:
        "list() creates a mutable sequence. Tuples are immutable, while dicts and sets are mutable collections but not sequences.",
    },
    {
      id: "q4",
      concept: "Exception handling",
      prompt:
        "What does the else block in a try/except statement do?",
      choices: [
        {
          id: "A",
          label: "It runs only if an exception is raised and caught.",
        },
        {
          id: "B",
          label: "It runs only if no exception is raised in the try block.",
        },
        {
          id: "C",
          label: "It always runs after finally.",
        },
        {
          id: "D",
          label: "It runs before the try block.",
        },
      ],
      correctChoiceId: "B",
      explanation:
        "The else block runs after the try block completes successfully without an exception.",
    },
    {
      id: "q5",
      concept: "Function return values",
      prompt:
        "What is returned by a Python function that reaches the end without a return statement?",
      choices: [
        { id: "A", label: "0" },
        { id: "B", label: "False" },
        { id: "C", label: "None" },
        { id: "D", label: "An empty string" },
      ],
      correctChoiceId: "C",
      explanation:
        "Python functions return None by default when execution reaches the end without an explicit return value.",
    },
  ],
};

export function isPcapChoiceId(value: string): value is PcapChoiceId {
  return value === "A" || value === "B" || value === "C" || value === "D";
}

export function pcapQuestionById(id: string): PcapQuizQuestion | null {
  return pcapQuiz.questions.find((q) => q.id === id) ?? null;
}
