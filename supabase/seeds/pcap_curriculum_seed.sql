-- PCAP June 2026 curriculum seed.
-- Copy/paste runnable in Supabase SQL Editor after:
-- 1. supabase/migrations/20260620053000_pcap_cohort_curriculum_ai_liferaft.sql
-- 2. public.cohorts.program_id has been set for slug 'pcap-cohort-1'

begin;

do $$
declare
  v_program_id uuid;
  v_cohort_id uuid;
  v_module jsonb;
  v_lesson jsonb;
  v_module_id uuid;
  v_lesson_id uuid;
  v_topic_id uuid;
  v_quiz_id uuid;
  v_question_id uuid;
  v_module_order integer;
  v_lesson_order integer;
begin
  select id, program_id
    into v_cohort_id, v_program_id
  from public.cohorts
  where slug = 'pcap-cohort-1';

  if v_cohort_id is null then
    raise exception 'Missing cohort pcap-cohort-1. Run the PCAP cohort curriculum migration first.';
  end if;

  if v_program_id is null then
    raise exception 'Cohort pcap-cohort-1 has no program_id. Update public.cohorts.program_id to the PCAP program UUID before running this seed.';
  end if;

  insert into public.curriculum_topics (slug, name, description)
  values
    ('python-fundamentals', 'Python Fundamentals', 'Interpreter, syntax, literals, and basic code tracing.'),
    ('variables-data-types', 'Variables and Data Types', 'Assignment, type conversion, truthiness, and None.'),
    ('built-in-functions', 'Built-In Functions', 'Core Python built-ins used across the curriculum.'),
    ('operators-expressions', 'Operators and Expressions', 'Arithmetic, comparison, boolean, string, and bitwise operations.'),
    ('control-flow', 'Control Flow', 'Branching, loops, break, continue, and loop else.'),
    ('functions-scope', 'Functions and Scope', 'Definitions, calls, parameters, return values, scope, recursion, and yield.'),
    ('collections', 'Collections', 'Lists, tuples, dictionaries, sets, nesting, mutation, and aliasing.'),
    ('modules-packages', 'Modules and Packages', 'Imports, module discovery, standard modules, and packages.'),
    ('exceptions', 'Exceptions', 'Exception handling, hierarchy, raising, assert, and custom exceptions.'),
    ('strings', 'Strings', 'Encoding, slicing, immutability, methods, and text processing.'),
    ('oop', 'Object-Oriented Programming', 'Classes, objects, methods, constructors, inheritance, introspection, and polymorphism.'),
    ('advanced-io-readiness', 'Advanced Patterns and Readiness', 'Comprehensions, lambdas, closures, file I/O, and exam readiness.')
  on conflict (slug) do update
  set name = excluded.name,
      description = excluded.description;

  for v_module_order, v_module in
    select row_number() over () - 1, value
    from jsonb_array_elements(
      '[
        {
          "slug": "python-fundamentals",
          "title": "Python Fundamentals",
          "phase": "foundation",
          "topic": "python-fundamentals",
          "objective": "Give beginners enough interpreter, syntax, and code-reading fluency to reason about small Python programs.",
          "lessons": [
            ["what-python-runs", "What Python Runs", "Understand scripts, the interpreter, statements, expressions, and program output."],
            ["reading-code-top-to-bottom", "Reading Code Top to Bottom", "Trace execution order one line at a time."],
            ["syntax-indentation-comments", "Syntax, Indentation, and Comments", "Recognize valid syntax, indentation blocks, and comments."],
            ["literals-and-basic-values", "Literals and Basic Values", "Identify integers, floats, strings, booleans, and None."],
            ["errors-are-information", "Errors Are Information", "Read basic error messages without panic."]
          ]
        },
        {
          "slug": "variables-and-data-types",
          "title": "Variables and Data Types",
          "phase": "foundation",
          "topic": "variables-data-types",
          "objective": "Build confidence with assignment, type conversion, truthiness, and basic value behavior.",
          "lessons": [
            ["assignment-names-values", "Assignment Names Values", "Understand that variables are names bound to values."],
            ["numbers-int-and-float", "Numbers: int and float", "Distinguish integer and floating-point arithmetic."],
            ["strings-as-text-values", "Strings as Text Values", "Create, combine, and inspect simple strings."],
            ["booleans-and-truthiness", "Booleans and Truthiness", "Predict truthiness for common values."],
            ["converting-between-types", "Converting Between Types", "Use int(), float(), str(), and bool() safely."],
            ["none-and-missing-results", "None and Missing Results", "Recognize None as a value and distinguish it from falsey values."]
          ]
        },
        {
          "slug": "built-in-python-functions",
          "title": "Built-In Python Functions",
          "phase": "foundation",
          "topic": "built-in-functions",
          "objective": "Respond to cohort feedback by making built-ins familiar before advanced control flow and collections.",
          "lessons": [
            ["print-and-visible-output", "print() and Visible Output", "Use print() and understand sep/end behavior."],
            ["input-and-string-input", "input() and String Input", "Understand that input() returns strings."],
            ["len-type-inspecting-values", "len(), type(), and Inspecting Values", "Use built-ins to inspect sequences and value types."],
            ["int-float-str-bool", "int(), float(), str(), bool()", "Convert values and predict conversion errors."],
            ["range-for-counting", "range() for Counting", "Read range() boundaries and step behavior."],
            ["min-max-sum", "min(), max(), sum()", "Aggregate numeric collections with common built-ins."],
            ["sorted-vs-sort-preview", "sorted() vs sort() Preview", "Preview return-value vs mutation differences."],
            ["dir-discovery-tool", "dir() as a Discovery Tool", "Use dir() to inspect available attributes."]
          ]
        },
        {
          "slug": "operators-and-expressions",
          "title": "Operators and Expressions",
          "phase": "foundation",
          "topic": "operators-expressions",
          "objective": "Develop reliable expression evaluation skills for arithmetic, comparison, boolean, string, and bitwise operations.",
          "lessons": [
            ["arithmetic-precedence", "Arithmetic Operators and Precedence", "Evaluate arithmetic with precedence and parentheses."],
            ["division-modulo-floor-division", "Division, Modulo, and Floor Division", "Use /, //, and % in PCAP-style expressions."],
            ["comparison-operators", "Comparison Operators", "Predict equality and ordering results."],
            ["boolean-operators", "Boolean Operators", "Evaluate not, and, or with short-circuit logic."],
            ["assignment-shortcuts", "Assignment Shortcuts", "Read +=, -=, *= and related operators."],
            ["string-operators", "String Operators", "Use + and * with strings and predict TypeError cases."],
            ["bitwise-operators", "Bitwise Operators", "Recognize and evaluate basic bitwise operations."]
          ]
        },
        {
          "slug": "control-flow",
          "title": "Control Flow",
          "phase": "foundation",
          "topic": "control-flow",
          "objective": "Teach learners to follow branching, looping, nesting, and loop-control behavior precisely.",
          "lessons": [
            ["if-elif-else", "if, elif, else", "Trace conditional branches and exclusive paths."],
            ["nested-conditions", "Nested Conditions", "Read nested if statements without losing scope."],
            ["while-loops", "while Loops", "Trace loop state changes and termination."],
            ["for-loops-and-range", "for Loops and range()", "Use for loops over ranges and sequences."],
            ["break-and-continue", "break and continue", "Predict loop interruption and skipped iterations."],
            ["loop-else-blocks", "Loop else Blocks", "Understand while-else and for-else behavior."],
            ["nesting-loops-and-conditions", "Nesting Loops and Conditions", "Trace small nested loops and branch combinations."]
          ]
        },
        {
          "slug": "functions-and-scope",
          "title": "Functions and Scope",
          "phase": "foundation",
          "topic": "functions-scope",
          "objective": "Build function fluency before modules, lambdas, closures, and OOP methods.",
          "lessons": [
            ["defining-and-calling-functions", "Defining and Calling Functions", "Create functions and understand call execution."],
            ["parameters-and-arguments", "Parameters and Arguments", "Distinguish parameters from passed values."],
            ["return-and-none", "return and None", "Understand returned values and default None."],
            ["default-and-keyword-arguments", "Default and Keyword Arguments", "Use defaults and keyword calls safely."],
            ["local-and-global-scope", "Local and Global Scope", "Predict name resolution and shadowing."],
            ["recursion-basics", "Recursion Basics", "Recognize base cases and recursive calls."],
            ["generators-and-yield-preview", "Generators and yield Preview", "Understand yield as producing a sequence lazily."]
          ]
        },
        {
          "slug": "collections-and-data-aggregates",
          "title": "Collections and Data Aggregates",
          "phase": "foundation",
          "topic": "collections",
          "objective": "Prepare learners for PCAP data manipulation, comprehensions, and code-reading scenarios.",
          "lessons": [
            ["lists-indexing-slicing", "Lists: Indexing and Slicing", "Access, slice, and reason about list positions."],
            ["list-mutation-append", "List Mutation and append()", "Understand in-place mutation and append() returning None."],
            ["tuples-and-immutability", "Tuples and Immutability", "Distinguish tuple behavior from list behavior."],
            ["dictionaries-keys-values", "Dictionaries: Keys and Values", "Create, index, update, and iterate dictionaries."],
            ["dictionary-methods", "Dictionary Methods", "Use keys(), values(), items(), and membership checks."],
            ["sets-and-uniqueness", "Sets and Uniqueness", "Understand unordered unique collections."],
            ["nested-collections", "Nested Collections", "Read lists inside tuples, dictionaries inside lists, and matrices."],
            ["copying-and-aliasing", "Copying and Aliasing", "Predict effects of shared references."]
          ]
        },
        {
          "slug": "modules-and-packages",
          "title": "Modules and Packages",
          "phase": "pcap_core",
          "topic": "modules-packages",
          "objective": "Cover PCAP module/package objectives: imports, discovery, sys.path, standard modules, and custom packages.",
          "lessons": [
            ["import-variants", "Import Variants", "Read import, from-import, aliases, and wildcard imports."],
            ["qualifying-names", "Qualifying Names", "Understand module namespaces and nested qualification."],
            ["dir-and-module-discovery", "dir() and Module Discovery", "Use dir() to inspect module attributes."],
            ["sys-path-module-search", "sys.path and Module Search", "Understand where Python searches for modules."],
            ["math-module", "math Module", "Use ceil(), floor(), trunc(), factorial(), hypot(), and sqrt()."],
            ["random-module", "random Module", "Understand seed(), random(), choice(), and sample()."],
            ["platform-module", "platform Module", "Read host and Python implementation information."],
            ["user-defined-modules", "User-Defined Modules", "Create and import your own module files."],
            ["packages-init-py", "Packages and __init__.py", "Understand packages, __init__.py, nested packages, and directory trees."],
            ["name-pycache-public-private", "__name__, __pycache__, Public and Private Names", "Recognize module metadata and naming conventions."]
          ]
        },
        {
          "slug": "exceptions",
          "title": "Exceptions",
          "phase": "pcap_core",
          "topic": "exceptions",
          "objective": "Cover PCAP exception handling, hierarchy, raising, assertions, and custom exceptions.",
          "lessons": [
            ["try-and-except", "try and except", "Handle Python-defined exceptions with specific handlers."],
            ["multiple-except-forms", "Multiple except Forms", "Read except chains, bare except, and tuple handlers."],
            ["exception-hierarchy", "Exception Hierarchy", "Understand subclass relationships and handler order."],
            ["else-and-finally", "else and finally", "Predict try/except/else/finally execution."],
            ["raise-and-reraising", "raise and Re-Raising", "Raise exceptions intentionally and understand propagation."],
            ["assert", "assert", "Use assert to check assumptions and understand AssertionError."],
            ["custom-exceptions", "Custom Exceptions", "Create self-defined exception classes."]
          ]
        },
        {
          "slug": "strings-and-text-processing",
          "title": "Strings and Text Processing",
          "phase": "pcap_core",
          "topic": "strings",
          "objective": "Cover PCAP string objectives: encoding, escape sequences, operations, indexing, methods, and transformations.",
          "lessons": [
            ["characters-code-points-encoding", "Characters, Code Points, and Encoding", "Understand ASCII, Unicode, UTF-8, and code points."],
            ["escape-sequences", "Escape Sequences", "Read newline, tab, quote, and backslash escapes."],
            ["string-indexing-slicing", "String Indexing and Slicing", "Access characters and substrings, including negative indexes."],
            ["string-immutability", "String Immutability", "Recognize that string operations return new strings."],
            ["searching-strings", "Searching Strings", "Use find(), rfind(), index(), count(), startswith(), and endswith()."],
            ["changing-case-classification", "Changing Case and Classification", "Use upper(), lower(), capitalize(), isalpha(), isdigit(), and related methods."],
            ["splitting-and-joining", "Splitting and Joining", "Use split(), join(), strip(), replace()."],
            ["string-comparison-ordering", "String Comparison and Ordering", "Predict lexicographic comparison and case effects."]
          ]
        },
        {
          "slug": "object-oriented-programming",
          "title": "Object-Oriented Programming",
          "phase": "pcap_core",
          "topic": "oop",
          "objective": "Spend the most curriculum weight on PCAP classes, objects, methods, introspection, inheritance, construction, and polymorphism.",
          "lessons": [
            ["objects-classes-properties-methods", "Objects, Classes, Properties, Methods", "Identify OOP concepts and class components."],
            ["instance-attributes", "Instance Attributes", "Assign and read object-specific state."],
            ["class-variables", "Class Variables", "Distinguish class variables from instance variables."],
            ["dict-on-objects-and-classes", "__dict__ on Objects and Classes", "Inspect attributes with __dict__."],
            ["private-components-name-mangling", "Private Components and Name Mangling", "Recognize underscore conventions and name mangling."],
            ["methods-and-self", "Methods and self", "Declare and call methods using self."],
            ["constructors-init", "Constructors with __init__", "Initialize objects with constructor parameters."],
            ["str-representation", "__str__ and Representation", "Override __str__ for readable object output."],
            ["introspection", "Introspection: hasattr(), __name__, __module__, __bases__", "Discover class and object structure."],
            ["single-inheritance", "Single Inheritance", "Build subclass relationships and inherit behavior."],
            ["overriding-methods", "Overriding Methods", "Predict method resolution when subclasses override methods."],
            ["super", "super()", "Call superclass behavior from subclasses."],
            ["multiple-inheritance-diamonds", "Multiple Inheritance and Diamonds", "Recognize multiple inheritance and method resolution challenges."],
            ["polymorphism", "Polymorphism", "Use different objects through shared method names."],
            ["identity-is-vs-equality", "Identity: is, is not, and ==", "Distinguish equality from identity."]
          ]
        },
        {
          "slug": "advanced-patterns-io-readiness",
          "title": "Advanced Patterns, I/O, and Exam Readiness",
          "phase": "readiness",
          "topic": "advanced-io-readiness",
          "objective": "Finish PCAP miscellaneous objectives and transition learners into realistic exam practice and readiness decisions.",
          "lessons": [
            ["list-comprehensions", "List Comprehensions", "Build and read list comprehensions with filters."],
            ["nested-comprehensions", "Nested Comprehensions", "Read simple nested comprehensions without losing order."],
            ["lambda-functions", "Lambda Functions", "Define and use small anonymous functions."],
            ["map-filter-sorted-key-functions", "map(), filter(), sorted(), and key Functions", "Use functions as values in common higher-order patterns."],
            ["closures", "Closures", "Recognize functions capturing outer variables."],
            ["basic-io-terminology", "Basic I/O Terminology", "Understand streams, files, handles, paths, and modes."],
            ["reading-files", "Reading Files", "Read text files with context managers."],
            ["writing-files", "Writing Files", "Write text safely and understand overwrite vs append."],
            ["debugging-code-output-questions", "Debugging Code Output Questions", "Use a repeatable strategy for exam-style output prediction."],
            ["final-review-weak-areas", "Final Review: Weak Areas", "Use progress and discussion signals to choose refreshers."]
          ]
        }
      ]'::jsonb
    )
  loop
    insert into public.program_modules (
      program_id,
      slug,
      title,
      summary,
      objective,
      phase,
      sort_order,
      is_published
    )
    values (
      v_program_id,
      v_module ->> 'slug',
      v_module ->> 'title',
      v_module ->> 'objective',
      v_module ->> 'objective',
      v_module ->> 'phase',
      v_module_order,
      true
    )
    on conflict (program_id, slug) do update
    set title = excluded.title,
        summary = excluded.summary,
        objective = excluded.objective,
        phase = excluded.phase,
        sort_order = excluded.sort_order,
        is_published = true,
        updated_at = now()
    returning id into v_module_id;

    select id into v_topic_id
    from public.curriculum_topics
    where slug = v_module ->> 'topic';

    v_lesson_order := 0;
    for v_lesson in
      select value
      from jsonb_array_elements(v_module -> 'lessons')
    loop
      insert into public.program_lessons (
        module_id,
        slug,
        title,
        objective,
        summary,
        content_markdown,
        lesson_type,
        estimated_minutes,
        sort_order,
        is_published
      )
      values (
        v_module_id,
        v_lesson ->> 0,
        v_lesson ->> 1,
        v_lesson ->> 2,
        v_lesson ->> 2,
        format(
          E'## Learning objective\n\n%s\n\n## Short explanation\n\nThis short lesson focuses on one PCAP concept and shows how to reason about it in code.\n\n## Code example\n\n```python\nprint(\"%s\")\n```\n\n## Expected output\n\n```text\n%s\n```\n\n## Common mistake\n\nMoving too quickly from reading the code to guessing the output. Trace the value changes first.\n\n## Checkpoint\n\nExplain the concept in your own words, then answer the checkpoint question below.\n\n## Discussion prompt\n\nWhat part of this concept would be easiest for another learner to misunderstand?',
          v_lesson ->> 2,
          v_lesson ->> 1,
          v_lesson ->> 1
        ),
        case when (v_module ->> 'slug') like '%refresher%' then 'refresher' else 'core' end,
        7,
        v_lesson_order,
        true
      )
      on conflict (module_id, slug) do update
      set title = excluded.title,
          objective = excluded.objective,
          summary = excluded.summary,
          content_markdown = excluded.content_markdown,
          lesson_type = excluded.lesson_type,
          estimated_minutes = excluded.estimated_minutes,
          sort_order = excluded.sort_order,
          is_published = true,
          updated_at = now()
      returning id into v_lesson_id;

      if v_topic_id is not null then
        insert into public.lesson_topics (lesson_id, topic_id, is_primary)
        values (v_lesson_id, v_topic_id, true)
        on conflict (lesson_id, topic_id) do update
        set is_primary = true;
      end if;

      insert into public.lesson_quizzes (
        lesson_id,
        slug,
        title,
        description,
        quiz_type,
        sort_order,
        current_question_ratio,
        refresher_question_ratio,
        passing_percent,
        is_published
      )
      values (
        v_lesson_id,
        'checkpoint',
        'Checkpoint: ' || (v_lesson ->> 1),
        'One short checkpoint that asks the learner to explain and apply the lesson concept.',
        'lesson_checkpoint',
        0,
        0.70,
        0.30,
        70,
        true
      )
      on conflict (lesson_id, slug) where lesson_id is not null do update
      set title = excluded.title,
          description = excluded.description,
          is_published = true,
          updated_at = now()
      returning id into v_quiz_id;

      insert into public.quiz_questions (
        quiz_id,
        slug,
        question_type,
        question_role,
        prompt_markdown,
        choices,
        correct_answer,
        explanation_markdown,
        discussion_prompt,
        primary_topic_id,
        source_module_id,
        source_lesson_id,
        refresher_lesson_id,
        sort_order,
        is_published
      )
      values (
        v_quiz_id,
        'explain-the-concept',
        'free_response',
        case when v_lesson_order % 4 = 3 then 'refresher' else 'current' end,
        'In your own words, explain the key idea from **' || (v_lesson ->> 1) || '** and describe how you would recognize it in a code-output question.',
        '[]'::jsonb,
        '{"rubric":"Learner should accurately explain the lesson objective and connect it to code behavior."}'::jsonb,
        'This checkpoint is discussion-oriented. Compare your reasoning with the cohort and refine your explanation.',
        'What example would you use to teach this concept to another learner?',
        v_topic_id,
        v_module_id,
        v_lesson_id,
        v_lesson_id,
        0,
        true
      )
      on conflict (quiz_id, slug) do update
      set prompt_markdown = excluded.prompt_markdown,
          question_role = excluded.question_role,
          correct_answer = excluded.correct_answer,
          explanation_markdown = excluded.explanation_markdown,
          discussion_prompt = excluded.discussion_prompt,
          primary_topic_id = excluded.primary_topic_id,
          source_module_id = excluded.source_module_id,
          source_lesson_id = excluded.source_lesson_id,
          refresher_lesson_id = excluded.refresher_lesson_id,
          is_published = true,
          updated_at = now()
      returning id into v_question_id;

      insert into public.discussion_threads (
        cohort_id,
        lesson_id,
        question_id,
        title
      )
      values (
        v_cohort_id,
        v_lesson_id,
        v_question_id,
        'Discussion: ' || (v_lesson ->> 1)
      )
      on conflict (cohort_id, question_id) where question_id is not null do update
      set title = excluded.title,
          updated_at = now();

      v_lesson_order := v_lesson_order + 1;
    end loop;
  end loop;
end $$;

do $$
declare
  v_program_id uuid;
  v_cohort_id uuid;
  v_lesson jsonb;
  v_question jsonb;
  v_module_id uuid;
  v_lesson_id uuid;
  v_quiz_id uuid;
  v_question_id uuid;
  v_topic_id uuid;
  v_secondary_topic_id uuid;
  v_source_lesson_id uuid;
  v_refresher_lesson_id uuid;
  v_secondary_slug text;
  v_question_order integer;
begin
  select id, program_id
    into v_cohort_id, v_program_id
  from public.cohorts
  where slug = 'pcap-cohort-1';

  if v_cohort_id is null then
    raise exception 'Missing cohort pcap-cohort-1. Run the PCAP cohort curriculum migration first.';
  end if;

  if v_program_id is null then
    raise exception 'Cohort pcap-cohort-1 has no program_id. Update public.cohorts.program_id to the PCAP program UUID before running this seed.';
  end if;

  for v_lesson in
    select value
    from jsonb_array_elements(
      jsonb_build_array(
        jsonb_build_object(
          'module_slug', 'python-fundamentals',
          'lesson_slug', 'what-python-runs',
          'objective', 'Understand scripts, the interpreter, statements, expressions, and program output.',
          'summary', 'Learn what Python actually runs and how source code becomes visible output.',
          'content', $md$## Learning objective

Understand what happens when Python runs a small program: it reads statements, evaluates expressions, and shows output only when code asks for output.

## Short explanation

A Python program is a text file made of instructions. When you run it, the Python interpreter reads the file from top to bottom. Some lines tell Python to do work silently. Other lines, such as `print(...)`, make something visible on the screen.

This distinction matters for PCAP code-output questions. A line can calculate a value without printing it. If a question asks "what is printed?", only visible output counts.

## Code example

```python
2 + 3
print(2 + 3)
print("Python")
```

## Expected output

```text
5
Python
```

The first line evaluates to `5`, but it is not printed. The second line prints `5`. The third line prints text.

## Common mistake

Assuming every expression appears in the output. In a script, expression results are usually invisible unless passed to `print()`.

## Discussion prompt

When you read a code-output question, how can you mark which lines create visible output and which lines only compute values?$md$,
          'questions', jsonb_build_array(
            jsonb_build_object('slug','current-visible-output','type','multiple_choice','role','current','topic','python-fundamentals','secondary_topics',jsonb_build_array(),'source_lesson','what-python-runs','prompt','Which line in a Python script makes text visible to the learner?','choices',jsonb_build_array(jsonb_build_object('id','A','label','2 + 3'),jsonb_build_object('id','B','label','print(2 + 3)'),jsonb_build_object('id','C','label','answer = 2 + 3'),jsonb_build_object('id','D','label','# show 2 + 3')),'correct_answer',jsonb_build_object('choiceIds',jsonb_build_array('B')),'explanation','`print(2 + 3)` asks Python to display the value. Assignment and bare expressions can do work without creating script output.','discussion','What clues tell you that a line will produce visible output?'),
            jsonb_build_object('slug','code-output-print-only','type','code_output','role','current','topic','python-fundamentals','secondary_topics',jsonb_build_array(),'source_lesson','what-python-runs','prompt','What is the output of this code?','code',E'4 + 1\nprint(4 + 1)\nprint("done")','expected_output',E'5\ndone','choices',jsonb_build_array(),'correct_answer',jsonb_build_object('expectedOutput',E'5\ndone'),'explanation','The bare expression `4 + 1` is evaluated but not printed. The two `print()` calls create the only visible output.','discussion','Why is it useful for Python to let code calculate values without printing them?'),
            jsonb_build_object('slug','refresher-expression-vs-output','type','fill_blank','role','current','topic','python-fundamentals','secondary_topics',jsonb_build_array(),'source_lesson','what-python-runs','prompt','Fill in the blank: in a script, visible output usually comes from the built-in function `_____()`.','choices',jsonb_build_array(),'correct_answer',jsonb_build_object('answer','print'),'explanation','`print()` is the built-in function used throughout these early lessons to make values visible.','discussion','What would be harder about learning Python if `print()` did not exist?')
          )
        ),
        jsonb_build_object(
          'module_slug', 'python-fundamentals',
          'lesson_slug', 'reading-code-top-to-bottom',
          'objective', 'Trace execution order one line at a time.',
          'summary', 'Practice reading a Python program in the same order the interpreter executes it.',
          'content', $md$## Learning objective

Trace a short Python script from top to bottom and predict how each line changes what happens next.

## Short explanation

Python normally executes one statement at a time, starting at the top of the file and moving downward. Later lines can depend on earlier lines. If a variable is assigned on line 1, line 2 can use that value. If line 2 changes the variable, line 3 sees the new value.

When you answer PCAP output questions, do not jump to the final line first. Keep a small mental notebook of what each name means after each statement.

## Code example

```python
score = 1
print(score)
score = score + 4
print(score)
```

## Expected output

```text
1
5
```

First, `score` is `1`. Then Python prints it. Next, Python calculates `score + 4`, stores `5`, and prints the new value.

## Common mistake

Reading assignments as permanent facts. A name can be reassigned, so the value may change as the program runs.

## Discussion prompt

What strategy do you use to avoid losing track of variable values while tracing code?$md$,
          'questions', jsonb_build_array(
            jsonb_build_object('slug','current-execution-order','type','multiple_choice','role','current','topic','python-fundamentals','secondary_topics',jsonb_build_array('variables-data-types'),'source_lesson','reading-code-top-to-bottom','prompt','When Python runs a simple script without loops or functions, what is the usual execution order?','choices',jsonb_build_array(jsonb_build_object('id','A','label','Bottom to top'),jsonb_build_object('id','B','label','Top to bottom'),jsonb_build_object('id','C','label','Alphabetical by variable name'),jsonb_build_object('id','D','label','Only lines containing print() run')),'correct_answer',jsonb_build_object('choiceIds',jsonb_build_array('B')),'explanation','Python normally runs top to bottom unless control-flow features change the path.','discussion','What kinds of Python features might change the usual top-to-bottom flow later?'),
            jsonb_build_object('slug','code-output-reassignment','type','code_output','role','current','topic','python-fundamentals','secondary_topics',jsonb_build_array('variables-data-types'),'source_lesson','reading-code-top-to-bottom','prompt','What is printed?','code',E'level = 2\nprint(level)\nlevel = level + 1\nprint(level)','expected_output',E'2\n3','choices',jsonb_build_array(),'correct_answer',jsonb_build_object('expectedOutput',E'2\n3'),'explanation','The first print sees `2`. After reassignment, `level` stores `3`, so the second print shows `3`.','discussion','How would you annotate this code while reading it by hand?'),
            jsonb_build_object('slug','refresher-visible-output','type','multiple_choice','role','refresher','topic','python-fundamentals','secondary_topics',jsonb_build_array(),'source_lesson','reading-code-top-to-bottom','refresher_lesson','what-python-runs','prompt','Which statement is true about `total = 10` in a script?','choices',jsonb_build_array(jsonb_build_object('id','A','label','It prints 10.'),jsonb_build_object('id','B','label','It stores 10 using the name total.'),jsonb_build_object('id','C','label','It creates an error because numbers cannot be stored.'),jsonb_build_object('id','D','label','It runs only after print().')),'correct_answer',jsonb_build_object('choiceIds',jsonb_build_array('B')),'explanation','Assignment stores a value under a name. It does not display output by itself.','discussion','Why is assignment separate from printing?')
          )
        ),
        jsonb_build_object(
          'module_slug', 'python-fundamentals',
          'lesson_slug', 'syntax-indentation-comments',
          'objective', 'Recognize valid syntax, indentation blocks, and comments.',
          'summary', 'Learn the visual rules that make Python readable and executable.',
          'content', $md$## Learning objective

Recognize the basic syntax rules that let Python understand your code: spelling, punctuation, indentation, and comments.

## Short explanation

Syntax is the grammar of code. Python expects certain symbols in certain places. Parentheses must close, strings need matching quotes, and indentation is meaningful.

Unlike some languages, Python uses indentation to group code. A block is a set of indented statements that belong together. You will see blocks with `if`, `for`, `while`, functions, and classes later. For now, know that random indentation can cause an error.

Comments start with `#`. Python ignores comments when running code, but comments help humans understand why code exists.

## Code example

```python
# This line is a comment.
print("ready")
print("set")
print("go")
```

## Expected output

```text
ready
set
go
```

The comment explains the code but does not print.

## Common mistake

Thinking indentation is only decoration. In Python, indentation can change whether code is valid and which block a statement belongs to.

## Discussion prompt

Why might Python choose indentation as part of syntax instead of using braces like some other languages?$md$,
          'questions', jsonb_build_array(
            jsonb_build_object('slug','current-comment-behavior','type','multiple_choice','role','current','topic','python-fundamentals','secondary_topics',jsonb_build_array(),'source_lesson','syntax-indentation-comments','prompt','What happens to a line that starts with `#` in Python?','choices',jsonb_build_array(jsonb_build_object('id','A','label','It always prints.'),jsonb_build_object('id','B','label','Python treats it as a comment and ignores it while running.'),jsonb_build_object('id','C','label','It creates a string.'),jsonb_build_object('id','D','label','It must be indented.')),'correct_answer',jsonb_build_object('choiceIds',jsonb_build_array('B')),'explanation','A `#` starts a comment. Comments are for readers, not for execution.','discussion','What kinds of ideas are worth putting in comments?'),
            jsonb_build_object('slug','code-output-comments','type','code_output','role','current','topic','python-fundamentals','secondary_topics',jsonb_build_array(),'source_lesson','syntax-indentation-comments','prompt','What is printed?','code',E'# print("hidden")\nprint("shown")\n# another comment','expected_output','shown','choices',jsonb_build_array(),'correct_answer',jsonb_build_object('expectedOutput','shown'),'explanation','The commented-out print line does not run. Only `print("shown")` creates output.','discussion','When could commenting out code be useful while debugging?'),
            jsonb_build_object('slug','refresher-top-to-bottom','type','fill_blank','role','refresher','topic','python-fundamentals','secondary_topics',jsonb_build_array(),'source_lesson','syntax-indentation-comments','refresher_lesson','reading-code-top-to-bottom','prompt','Fill in the blank: Python normally reads a simple script from _____ to bottom.','choices',jsonb_build_array(),'correct_answer',jsonb_build_object('answer','top'),'explanation','Without control flow, Python runs statements from top to bottom.','discussion','How do comments affect the top-to-bottom execution path?')
          )
        ),
        jsonb_build_object(
          'module_slug', 'python-fundamentals',
          'lesson_slug', 'literals-and-basic-values',
          'objective', 'Identify integers, floats, strings, booleans, and None.',
          'summary', 'Meet the basic literal values that appear in beginner Python programs.',
          'content', $md$## Learning objective

Identify common Python literal values and describe what kind of value each one represents.

## Short explanation

A literal is a value written directly in code. `42` is an integer literal. `3.5` is a floating-point literal. `"hello"` is a string literal. `True` and `False` are Boolean literals. `None` represents the absence of a value.

These values behave differently. Numbers can be used in arithmetic. Strings represent text. Booleans are used in decisions. `None` often appears when something has no useful result.

PCAP questions often combine values in small snippets. Before solving the code, identify the value types.

## Code example

```python
print(7)
print(3.5)
print("7")
print(True)
print(None)
```

## Expected output

```text
7
3.5
7
True
None
```

The integer `7` and string `"7"` look similar when printed, but they are different types.

## Common mistake

Assuming a value's printed appearance tells the whole story. `"7"` prints like 7, but it is text, not a number.

## Discussion prompt

Why is it important to know whether `7` is a number or text before using it in an expression?$md$,
          'questions', jsonb_build_array(
            jsonb_build_object('slug','current-literal-type','type','multiple_choice','role','current','topic','python-fundamentals','secondary_topics',jsonb_build_array('variables-data-types'),'source_lesson','literals-and-basic-values','prompt','Which value is a string literal?','choices',jsonb_build_array(jsonb_build_object('id','A','label','42'),jsonb_build_object('id','B','label','3.14'),jsonb_build_object('id','C','label','"42"'),jsonb_build_object('id','D','label','False')),'correct_answer',jsonb_build_object('choiceIds',jsonb_build_array('C')),'explanation','Quotes make `"42"` a string literal, even though the characters are digits.','discussion','What bugs can happen when a number is stored as text?'),
            jsonb_build_object('slug','code-output-basic-literals','type','code_output','role','current','topic','python-fundamentals','secondary_topics',jsonb_build_array(),'source_lesson','literals-and-basic-values','prompt','What is printed?','code',E'print("True")\nprint(True)\nprint(None)','expected_output',E'True\nTrue\nNone','choices',jsonb_build_array(),'correct_answer',jsonb_build_object('expectedOutput',E'True\nTrue\nNone'),'explanation','The first line prints string text. The second prints the Boolean value. They look the same as output but are different values in code.','discussion','How can two different values produce similar output?'),
            jsonb_build_object('slug','refresher-comments-output','type','multiple_choice','role','refresher','topic','python-fundamentals','secondary_topics',jsonb_build_array(),'source_lesson','literals-and-basic-values','refresher_lesson','syntax-indentation-comments','prompt','Which line is ignored by Python during execution?','choices',jsonb_build_array(jsonb_build_object('id','A','label','print(7)'),jsonb_build_object('id','B','label','# print(7)'),jsonb_build_object('id','C','label','"hello"'),jsonb_build_object('id','D','label','None')),'correct_answer',jsonb_build_object('choiceIds',jsonb_build_array('B')),'explanation','A line starting with `#` is a comment and does not run.','discussion','How do comments help when a program contains many literal values?')
          )
        ),
        jsonb_build_object(
          'module_slug', 'python-fundamentals',
          'lesson_slug', 'errors-are-information',
          'objective', 'Read basic error messages without panic.',
          'summary', 'Learn to treat Python errors as clues about what the interpreter could not do.',
          'content', $md$## Learning objective

Read a simple Python error as information about where execution failed and what kind of problem Python found.

## Short explanation

Errors are part of programming. When Python cannot understand or complete a program, it reports an exception or syntax problem. The message usually gives a line number, an error type, and a short description.

For beginners, the most important habit is to slow down. Ask: did Python fail before the program started because the syntax was invalid? Or did it start running and then fail on a specific operation?

You do not need to memorize every error yet. Learn to recognize errors as signals.

## Code example

```python
print("before")
print(10 / 0)
print("after")
```

## Expected output

```text
before
ZeroDivisionError: division by zero
```

The final print does not run because execution stops at the error.

## Common mistake

Ignoring the line before the error. Output can happen before a runtime error stops the program.

## Discussion prompt

How can an error message help a cohort discussion move from "it broke" to a specific question?$md$,
          'questions', jsonb_build_array(
            jsonb_build_object('slug','current-error-as-clue','type','multiple_choice','role','current','topic','python-fundamentals','secondary_topics',jsonb_build_array(),'source_lesson','errors-are-information','prompt','What is the most useful first reaction to a Python error message?','choices',jsonb_build_array(jsonb_build_object('id','A','label','Delete random lines until it disappears.'),jsonb_build_object('id','B','label','Read the error type, message, and line location as clues.'),jsonb_build_object('id','C','label','Assume Python is wrong.'),jsonb_build_object('id','D','label','Ignore all output before the error.')),'correct_answer',jsonb_build_object('choiceIds',jsonb_build_array('B')),'explanation','Error messages are diagnostic clues. They help you locate and understand the failure.','discussion','Which part of an error message do you usually look at first?'),
            jsonb_build_object('slug','code-output-before-error','type','code_output','role','current','topic','python-fundamentals','secondary_topics',jsonb_build_array(),'source_lesson','errors-are-information','prompt','What appears before the error stops this program?','code',E'print("start")\nprint(8 / 0)\nprint("finish")','expected_output',E'start\nZeroDivisionError: division by zero','choices',jsonb_build_array(),'correct_answer',jsonb_build_object('expectedOutput',E'start\nZeroDivisionError: division by zero'),'explanation','`start` is printed before division by zero fails. The final line is not reached.','discussion','Why does output before an error still matter when tracing code?'),
            jsonb_build_object('slug','refresher-literals-error','type','multiple_choice','role','refresher','topic','python-fundamentals','secondary_topics',jsonb_build_array(),'source_lesson','errors-are-information','refresher_lesson','literals-and-basic-values','prompt','Which literal represents the absence of a value?','choices',jsonb_build_array(jsonb_build_object('id','A','label','False'),jsonb_build_object('id','B','label','0'),jsonb_build_object('id','C','label','""'),jsonb_build_object('id','D','label','None')),'correct_answer',jsonb_build_object('choiceIds',jsonb_build_array('D')),'explanation','`None` is Python''s value for no value or missing result.','discussion','How might confusing `None` with an error lead to misunderstanding?')
          )
        ),
        jsonb_build_object(
          'module_slug', 'variables-and-data-types',
          'lesson_slug', 'assignment-names-values',
          'objective', 'Understand that variables are names bound to values.',
          'summary', 'Learn assignment as naming a value, not putting a value inside a box forever.',
          'content', $md$## Learning objective

Understand assignment as connecting a name to a value, and trace what happens when the name is reused.

## Short explanation

In Python, a variable is a name that refers to a value. The statement `age = 30` binds the name `age` to the integer value `30`.

The equals sign in assignment does not mean "is always equal to." It means "store this reference now." A later assignment can make the same name refer to a different value.

This is why tracing matters. At each line, ask what value the name currently refers to.

## Code example

```python
count = 2
print(count)
count = 5
print(count)
```

## Expected output

```text
2
5
```

The second assignment changes what `count` refers to.

## Common mistake

Reading assignment like algebra. In Python, `count = count + 1` means calculate the right side using the old value, then bind the name to the new value.

## Discussion prompt

What metaphor for variables helps you remember that names can be rebound?$md$,
          'questions', jsonb_build_array(
            jsonb_build_object('slug','current-assignment-meaning','type','multiple_choice','role','current','topic','variables-data-types','secondary_topics',jsonb_build_array('python-fundamentals'),'source_lesson','assignment-names-values','prompt','What does `total = 12` do?','choices',jsonb_build_array(jsonb_build_object('id','A','label','Prints 12.'),jsonb_build_object('id','B','label','Binds the name total to the value 12.'),jsonb_build_object('id','C','label','Compares total with 12.'),jsonb_build_object('id','D','label','Creates a comment.')),'correct_answer',jsonb_build_object('choiceIds',jsonb_build_array('B')),'explanation','Assignment binds a name to a value. It does not print and it is not a comparison.','discussion','Why might the equals sign be confusing for new programmers?'),
            jsonb_build_object('slug','code-output-rebind-name','type','code_output','role','current','topic','variables-data-types','secondary_topics',jsonb_build_array('python-fundamentals'),'source_lesson','assignment-names-values','prompt','What is printed?','code',E'points = 3\npoints = points + 2\nprint(points)','expected_output','5','choices',jsonb_build_array(),'correct_answer',jsonb_build_object('expectedOutput','5'),'explanation','The right side uses the old value `3`, calculates `5`, then rebinds `points` to `5`.','discussion','How would you explain `points = points + 2` to someone thinking in algebra?'),
            jsonb_build_object('slug','refresher-output-vs-assignment','type','multiple_choice','role','refresher','topic','python-fundamentals','secondary_topics',jsonb_build_array('variables-data-types'),'source_lesson','assignment-names-values','refresher_lesson','what-python-runs','prompt','Which line creates visible output?','choices',jsonb_build_array(jsonb_build_object('id','A','label','name = "Ada"'),jsonb_build_object('id','B','label','print(name)'),jsonb_build_object('id','C','label','# name'),jsonb_build_object('id','D','label','name')),'correct_answer',jsonb_build_object('choiceIds',jsonb_build_array('B')),'explanation','`print(name)` displays the current value of `name`.','discussion','How do assignment and printing work together in small scripts?')
          )
        ),
        jsonb_build_object(
          'module_slug', 'variables-and-data-types',
          'lesson_slug', 'numbers-int-and-float',
          'objective', 'Distinguish integer and floating-point arithmetic.',
          'summary', 'Learn the difference between whole-number `int` values and decimal `float` values.',
          'content', $md$## Learning objective

Distinguish `int` and `float` values and predict the output of simple numeric expressions.

## Short explanation

Python has different numeric types. An `int` stores a whole number such as `4`, `0`, or `-12`. A `float` stores a decimal number such as `4.0` or `3.5`.

Some operations keep integers. Other operations produce floats. Regular division with `/` produces a float even when the result looks whole. This is a common PCAP detail.

## Code example

```python
print(6 + 2)
print(6 / 2)
print(7 / 2)
```

## Expected output

```text
8
3.0
3.5
```

The first result is an integer. Division produces floating-point results.

## Common mistake

Expecting `6 / 2` to print `3`. In Python, `/` means true division, so the result is `3.0`.

## Discussion prompt

Why might Python keep `3` and `3.0` as different kinds of values?$md$,
          'questions', jsonb_build_array(
            jsonb_build_object('slug','current-int-float','type','multiple_choice','role','current','topic','variables-data-types','secondary_topics',jsonb_build_array(),'source_lesson','numbers-int-and-float','prompt','Which value is a float literal?','choices',jsonb_build_array(jsonb_build_object('id','A','label','8'),jsonb_build_object('id','B','label','0'),jsonb_build_object('id','C','label','8.0'),jsonb_build_object('id','D','label','"8.0"')),'correct_answer',jsonb_build_object('choiceIds',jsonb_build_array('C')),'explanation','`8.0` is a floating-point literal. `"8.0"` is a string because it is quoted.','discussion','When does seeing `.0` in output matter?'),
            jsonb_build_object('slug','code-output-division-float','type','code_output','role','current','topic','variables-data-types','secondary_topics',jsonb_build_array('python-fundamentals'),'source_lesson','numbers-int-and-float','prompt','What is printed?','code',E'print(9 + 1)\nprint(10 / 2)','expected_output',E'10\n5.0','choices',jsonb_build_array(),'correct_answer',jsonb_build_object('expectedOutput',E'10\n5.0'),'explanation','Addition of integers gives `10`. True division with `/` gives the float `5.0`.','discussion','Why do you think PCAP questions often include division output?'),
            jsonb_build_object('slug','refresher-assignment','type','fill_blank','role','refresher','topic','variables-data-types','secondary_topics',jsonb_build_array('python-fundamentals'),'source_lesson','numbers-int-and-float','refresher_lesson','assignment-names-values','prompt','Fill in the blank: `x = 4` _____ the name `x` to the integer value `4`.','choices',jsonb_build_array(),'correct_answer',jsonb_build_object('answer','binds'),'explanation','Assignment binds a name to a value.','discussion','How does naming a numeric value make later expressions easier to read?')
          )
        ),
        jsonb_build_object(
          'module_slug', 'variables-and-data-types',
          'lesson_slug', 'strings-as-text-values',
          'objective', 'Create, combine, and inspect simple strings.',
          'summary', 'Learn strings as text values and predict simple string output.',
          'content', $md$## Learning objective

Recognize strings as text values, create them with quotes, and predict simple string concatenation and repetition.

## Short explanation

A string is text. In Python, strings are written with quotes, such as `"hello"` or `'hello'`. The quotes are part of the code syntax; they are not usually printed.

Strings can be joined with `+` and repeated with `*`. This is different from numeric addition. `"2" + "3"` creates `"23"`, not `5`.

## Code example

```python
word = "Py"
print(word + "thon")
print(word * 3)
```

## Expected output

```text
Python
PyPyPy
```

`+` joins strings. `*` repeats a string when used with an integer.

## Common mistake

Confusing numeric digits stored as text with actual numbers. `"7"` is a string and cannot be used like the integer `7` without conversion.

## Discussion prompt

How can you tell whether `+` means addition or concatenation when reading Python code?$md$,
          'questions', jsonb_build_array(
            jsonb_build_object('slug','current-string-quotes','type','multiple_choice','role','current','topic','variables-data-types','secondary_topics',jsonb_build_array('python-fundamentals'),'source_lesson','strings-as-text-values','prompt','Which expression joins two strings?','choices',jsonb_build_array(jsonb_build_object('id','A','label','"Py" + "thon"'),jsonb_build_object('id','B','label','2 + 3'),jsonb_build_object('id','C','label','print + "text"'),jsonb_build_object('id','D','label','"Py" / "thon"')),'correct_answer',jsonb_build_object('choiceIds',jsonb_build_array('A')),'explanation','The `+` operator concatenates strings when both operands are strings.','discussion','Why does the same `+` symbol behave differently for numbers and strings?'),
            jsonb_build_object('slug','code-output-string-repeat','type','code_output','role','current','topic','variables-data-types','secondary_topics',jsonb_build_array('python-fundamentals'),'source_lesson','strings-as-text-values','prompt','What is printed?','code',E'part = "ha"\nprint(part * 3)\nprint(part + "!")','expected_output',E'hahaha\nha!','choices',jsonb_build_array(),'correct_answer',jsonb_build_object('expectedOutput',E'hahaha\nha!'),'explanation','`part * 3` repeats the string three times. `part + "!"` joins two strings.','discussion','What is a real program where repeating or joining text would be useful?'),
            jsonb_build_object('slug','refresher-float-vs-string','type','multiple_choice','role','refresher','topic','variables-data-types','secondary_topics',jsonb_build_array(),'source_lesson','strings-as-text-values','refresher_lesson','numbers-int-and-float','prompt','Which value is text, not a number?','choices',jsonb_build_array(jsonb_build_object('id','A','label','3'),jsonb_build_object('id','B','label','3.0'),jsonb_build_object('id','C','label','"3"'),jsonb_build_object('id','D','label','-3')),'correct_answer',jsonb_build_object('choiceIds',jsonb_build_array('C')),'explanation','Quotes make `"3"` a string.','discussion','How could quoted numbers create bugs in user input?')
          )
        ),
        jsonb_build_object(
          'module_slug', 'variables-and-data-types',
          'lesson_slug', 'booleans-and-truthiness',
          'objective', 'Predict truthiness for common values.',
          'summary', 'Learn Boolean values and the idea that some values count as true or false in conditions.',
          'content', $md$## Learning objective

Understand `True` and `False`, and recognize that common values have truthiness.

## Short explanation

A Boolean value is either `True` or `False`. Booleans are used to make decisions. Python also treats other values as true-like or false-like in conditions.

For now, remember a few common falsey values: `0`, `0.0`, empty strings like `""`, and `None`. Many non-empty or non-zero values are truthy.

You will use this heavily in control flow later. For now, focus on reading Boolean output.

## Code example

```python
print(bool(0))
print(bool(5))
print(bool(""))
print(bool("Python"))
```

## Expected output

```text
False
True
False
True
```

The `bool()` function converts a value to its Boolean truth value.

## Common mistake

Assuming the string `"False"` is falsey. It is non-empty text, so it is truthy.

## Discussion prompt

Why might Python treat empty text as falsey and non-empty text as truthy?$md$,
          'questions', jsonb_build_array(
            jsonb_build_object('slug','current-falsey-value','type','multiple_choice','role','current','topic','variables-data-types','secondary_topics',jsonb_build_array('built-in-functions'),'source_lesson','booleans-and-truthiness','prompt','Which value is falsey in Python?','choices',jsonb_build_array(jsonb_build_object('id','A','label','"False"'),jsonb_build_object('id','B','label','"0"'),jsonb_build_object('id','C','label','0'),jsonb_build_object('id','D','label','"Python"')),'correct_answer',jsonb_build_object('choiceIds',jsonb_build_array('C')),'explanation','The integer `0` is falsey. Non-empty strings are truthy, even if their text says `"False"` or `"0"`.','discussion','Why is `"False"` truthy even though it looks like a Boolean word?'),
            jsonb_build_object('slug','code-output-bool','type','code_output','role','current','topic','variables-data-types','secondary_topics',jsonb_build_array('built-in-functions'),'source_lesson','booleans-and-truthiness','prompt','What is printed?','code',E'print(bool(""))\nprint(bool(" "))\nprint(bool(0))','expected_output',E'False\nTrue\nFalse','choices',jsonb_build_array(),'correct_answer',jsonb_build_object('expectedOutput',E'False\nTrue\nFalse'),'explanation','An empty string is falsey. A string containing a space is non-empty, so it is truthy. `0` is falsey.','discussion','What makes `" "` different from `""` when a program checks truthiness?'),
            jsonb_build_object('slug','refresher-string-concat','type','fill_blank','role','refresher','topic','variables-data-types','secondary_topics',jsonb_build_array(),'source_lesson','booleans-and-truthiness','refresher_lesson','strings-as-text-values','prompt','Fill in the blank: `"Py" + "thon"` produces the string `_____`.','choices',jsonb_build_array(),'correct_answer',jsonb_build_object('answer','Python'),'explanation','String `+` concatenates text values.','discussion','How do string operations and truthiness both depend on value type?')
          )
        ),
        jsonb_build_object(
          'module_slug', 'variables-and-data-types',
          'lesson_slug', 'converting-between-types',
          'objective', 'Use int(), float(), str(), and bool() safely.',
          'summary', 'Learn explicit conversion between common beginner value types.',
          'content', $md$## Learning objective

Use `int()`, `float()`, `str()`, and `bool()` to convert values, and predict when conversion changes behavior.

## Short explanation

Python does not always guess how you want to combine values of different types. If user input gives you `"7"` as text and you need arithmetic, convert it with `int("7")` or `float("7")`.

Conversion is explicit. `str(7)` gives `"7"`. `int("7")` gives `7`. `float("7")` gives `7.0`. `bool(value)` gives the value's truthiness.

Not every conversion is valid. `int("seven")` raises an error.

## Code example

```python
text = "7"
number = int(text)
print(number + 3)
print(str(number) + " days")
```

## Expected output

```text
10
7 days
```

The first print uses numeric addition. The second uses string concatenation.

## Common mistake

Trying to add a string and an integer directly, such as `"7" + 3`.

## Discussion prompt

Where do programs commonly receive numbers as strings before converting them?$md$,
          'questions', jsonb_build_array(
            jsonb_build_object('slug','current-int-conversion','type','multiple_choice','role','current','topic','variables-data-types','secondary_topics',jsonb_build_array('built-in-functions'),'source_lesson','converting-between-types','prompt','Which expression converts the string `"12"` into the integer `12`?','choices',jsonb_build_array(jsonb_build_object('id','A','label','str("12")'),jsonb_build_object('id','B','label','int("12")'),jsonb_build_object('id','C','label','bool("12")'),jsonb_build_object('id','D','label','float("twelve")')),'correct_answer',jsonb_build_object('choiceIds',jsonb_build_array('B')),'explanation','`int("12")` converts digit text into an integer.','discussion','Why should conversion be explicit instead of automatic all the time?'),
            jsonb_build_object('slug','code-output-conversions','type','code_output','role','current','topic','variables-data-types','secondary_topics',jsonb_build_array('built-in-functions'),'source_lesson','converting-between-types','prompt','What is printed?','code',E'value = "5"\nprint(int(value) + 2)\nprint(value + "2")','expected_output',E'7\n52','choices',jsonb_build_array(),'correct_answer',jsonb_build_object('expectedOutput',E'7\n52'),'explanation','`int(value) + 2` performs numeric addition. `value + "2"` joins two strings.','discussion','How does this example show why type matters?'),
            jsonb_build_object('slug','refresher-truthiness','type','multiple_choice','role','refresher','topic','variables-data-types','secondary_topics',jsonb_build_array('built-in-functions'),'source_lesson','converting-between-types','refresher_lesson','booleans-and-truthiness','prompt','What does `bool("")` return?','choices',jsonb_build_array(jsonb_build_object('id','A','label','True'),jsonb_build_object('id','B','label','False'),jsonb_build_object('id','C','label','""'),jsonb_build_object('id','D','label','None')),'correct_answer',jsonb_build_object('choiceIds',jsonb_build_array('B')),'explanation','An empty string is falsey, so `bool("")` returns `False`.','discussion','What other values should a beginner memorize as falsey?')
          )
        ),
        jsonb_build_object(
          'module_slug', 'variables-and-data-types',
          'lesson_slug', 'none-and-missing-results',
          'objective', 'Recognize None as a value and distinguish it from falsey values.',
          'summary', 'Learn `None` as Python''s explicit "no value here" marker.',
          'content', $md$## Learning objective

Recognize `None` as Python's value for "no value" and distinguish it from `0`, `False`, and empty strings.

## Short explanation

`None` is a real Python value. It often means "there is no useful result here." It is not the same as `0`, `False`, or `""`, even though it is falsey when converted with `bool()`.

You will see `None` often when a function does work but does not return a meaningful value. Later, list methods like `append()` will be important examples.

## Code example

```python
result = None
print(result)
print(bool(result))
```

## Expected output

```text
None
False
```

`None` prints as `None`, and its truthiness is `False`.

## Common mistake

Treating `None` as an error. `None` is not automatically an error; it is a value. An error happens when code tries to use it in an invalid way.

## Discussion prompt

When might a program need a value that means "nothing has been chosen yet"?$md$,
          'questions', jsonb_build_array(
            jsonb_build_object('slug','current-none-meaning','type','multiple_choice','role','current','topic','variables-data-types','secondary_topics',jsonb_build_array(),'source_lesson','none-and-missing-results','prompt','What does `None` usually represent?','choices',jsonb_build_array(jsonb_build_object('id','A','label','The number zero'),jsonb_build_object('id','B','label','An empty string'),jsonb_build_object('id','C','label','No value or no useful result'),jsonb_build_object('id','D','label','The text "None"')),'correct_answer',jsonb_build_object('choiceIds',jsonb_build_array('C')),'explanation','`None` is Python''s special value for absence or no useful result.','discussion','Why is it useful for Python to have a specific no-value marker?'),
            jsonb_build_object('slug','code-output-none-bool','type','code_output','role','current','topic','variables-data-types','secondary_topics',jsonb_build_array('built-in-functions'),'source_lesson','none-and-missing-results','prompt','What is printed?','code',E'answer = None\nprint(answer)\nprint(bool(answer))','expected_output',E'None\nFalse','choices',jsonb_build_array(),'correct_answer',jsonb_build_object('expectedOutput',E'None\nFalse'),'explanation','`None` prints as `None`. It is falsey, so `bool(None)` is `False`.','discussion','How is `None` different from an empty string in meaning?'),
            jsonb_build_object('slug','refresher-conversion','type','multiple_choice','role','refresher','topic','built-in-functions','secondary_topics',jsonb_build_array('variables-data-types'),'source_lesson','none-and-missing-results','refresher_lesson','converting-between-types','prompt','Which expression converts the integer `9` to text?','choices',jsonb_build_array(jsonb_build_object('id','A','label','int(9)'),jsonb_build_object('id','B','label','str(9)'),jsonb_build_object('id','C','label','float("nine")'),jsonb_build_object('id','D','label','bool("9")')),'correct_answer',jsonb_build_object('choiceIds',jsonb_build_array('B')),'explanation','`str(9)` creates the string `"9"`.','discussion','Why might output hide the difference between `9` and `"9"`?')
          )
        ),
        jsonb_build_object(
          'module_slug', 'built-in-python-functions',
          'lesson_slug', 'print-and-visible-output',
          'objective', 'Use print() and understand sep/end behavior.',
          'summary', 'Build confidence with the most visible built-in function: `print()`.',
          'content', $md$## Learning objective

Use `print()` to display values and understand how `sep` and `end` change the output.

## Short explanation

`print()` is a built-in function. It displays values as text. If you pass multiple values, Python separates them with a space by default. After each `print()` call, Python adds a newline by default.

Two optional keyword arguments matter early: `sep` controls what goes between printed values, and `end` controls what comes after the print call.

## Code example

```python
print("A", "B", "C")
print("A", "B", "C", sep="-")
print("Hello", end=" ")
print("Python")
```

## Expected output

```text
A B C
A-B-C
Hello Python
```

The third call ends with a space instead of a newline, so the next print continues on the same line.

## Common mistake

Forgetting that `print()` adds a newline unless `end` changes it.

## Discussion prompt

How would you explain the difference between `sep` and `end` to another beginner?$md$,
          'questions', jsonb_build_array(
            jsonb_build_object('slug','current-print-sep-end','type','multiple_choice','role','current','topic','built-in-functions','secondary_topics',jsonb_build_array('python-fundamentals'),'source_lesson','print-and-visible-output','prompt','What does the `sep` argument in `print()` control?','choices',jsonb_build_array(jsonb_build_object('id','A','label','What appears between multiple printed values'),jsonb_build_object('id','B','label','What appears after the entire print call'),jsonb_build_object('id','C','label','Whether comments run'),jsonb_build_object('id','D','label','The type of each value')),'correct_answer',jsonb_build_object('choiceIds',jsonb_build_array('A')),'explanation','`sep` is inserted between values passed to one `print()` call. `end` controls what is appended after the call.','discussion','When would changing `sep` make output easier to read?'),
            jsonb_build_object('slug','code-output-print-end','type','code_output','role','current','topic','built-in-functions','secondary_topics',jsonb_build_array('python-fundamentals'),'source_lesson','print-and-visible-output','prompt','What is printed?','code',E'print("red", "blue", sep="/")\nprint("go", end="!")\nprint("now")','expected_output',E'red/blue\ngo!now','choices',jsonb_build_array(),'correct_answer',jsonb_build_object('expectedOutput',E'red/blue\ngo!now'),'explanation','The first print uses `/` between values. The second ends with `!` instead of a newline, so `now` appears immediately after it.','discussion','Why are newline details important in output prediction questions?'),
            jsonb_build_object('slug','refresher-none-output','type','multiple_choice','role','refresher','topic','variables-data-types','secondary_topics',jsonb_build_array('built-in-functions'),'source_lesson','print-and-visible-output','refresher_lesson','none-and-missing-results','prompt','What does `print(None)` display?','choices',jsonb_build_array(jsonb_build_object('id','A','label','Nothing at all'),jsonb_build_object('id','B','label','False'),jsonb_build_object('id','C','label','None'),jsonb_build_object('id','D','label','An error')),'correct_answer',jsonb_build_object('choiceIds',jsonb_build_array('C')),'explanation','`None` is a value, and printing it displays `None`.','discussion','How can printing `None` help debug a missing result?')
          )
        ),
        jsonb_build_object(
          'module_slug', 'built-in-python-functions',
          'lesson_slug', 'input-and-string-input',
          'objective', 'Understand that input() returns strings.',
          'summary', 'Learn how `input()` collects text and why conversion is often needed.',
          'content', $md$## Learning objective

Understand that `input()` returns a string, even when the learner types digits.

## Short explanation

`input()` pauses the program and waits for the user to type. Whatever the user types comes back as a string. That means `"12"` is text until you convert it.

This is one reason built-in conversion functions matter early. If a program asks for an age and then wants arithmetic, use `int()` after `input()`.

## Code example

```python
age_text = "12"  # imagine this came from input()
age = int(age_text)
print(age + 1)
print(age_text + "1")
```

## Expected output

```text
13
121
```

The converted value supports arithmetic. The original text supports concatenation.

## Common mistake

Assuming `input()` returns a number because the user typed digits.

## Discussion prompt

Why is it safer for `input()` to return text first instead of guessing a type automatically?$md$,
          'questions', jsonb_build_array(
            jsonb_build_object('slug','current-input-string','type','multiple_choice','role','current','topic','built-in-functions','secondary_topics',jsonb_build_array('variables-data-types'),'source_lesson','input-and-string-input','prompt','What type of value does `input()` return?','choices',jsonb_build_array(jsonb_build_object('id','A','label','Always int'),jsonb_build_object('id','B','label','Always float'),jsonb_build_object('id','C','label','String'),jsonb_build_object('id','D','label','Boolean')),'correct_answer',jsonb_build_object('choiceIds',jsonb_build_array('C')),'explanation','`input()` returns user input as a string. Convert it if you need another type.','discussion','What problems could happen if input guessed types automatically?'),
            jsonb_build_object('slug','code-output-input-simulated','type','code_output','role','current','topic','built-in-functions','secondary_topics',jsonb_build_array('variables-data-types'),'source_lesson','input-and-string-input','prompt','Assume `text` is what `input()` returned. What is printed?','code',E'text = "4"\nprint(text + "5")\nprint(int(text) + 5)','expected_output',E'45\n9','choices',jsonb_build_array(),'correct_answer',jsonb_build_object('expectedOutput',E'45\n9'),'explanation','The first line joins strings. The second converts `"4"` to `4` before numeric addition.','discussion','How can you decide when to keep input as text and when to convert it?'),
            jsonb_build_object('slug','refresher-print-end','type','fill_blank','role','refresher','topic','built-in-functions','secondary_topics',jsonb_build_array('python-fundamentals'),'source_lesson','input-and-string-input','refresher_lesson','print-and-visible-output','prompt','Fill in the blank: in `print("A", "B", sep="-")`, the output is `_____`.','choices',jsonb_build_array(),'correct_answer',jsonb_build_object('answer','A-B'),'explanation','`sep="-"` places a hyphen between printed values.','discussion','How do `print()` and `input()` work together in interactive programs?')
          )
        ),
        jsonb_build_object(
          'module_slug', 'built-in-python-functions',
          'lesson_slug', 'len-type-inspecting-values',
          'objective', 'Use built-ins to inspect sequences and value types.',
          'summary', 'Use `len()` and `type()` to answer "how many?" and "what kind?" questions.',
          'content', $md$## Learning objective

Use `len()` to count items in a collection or characters in a string, and use `type()` to inspect what kind of value you have.

## Short explanation

The cohort asked for a built-in functions refresher, and `len()` and `type()` are two of the best debugging tools for beginners.

`len(value)` returns the number of items in a sequence or collection. For a string, it counts characters. For a list, it counts elements.

`type(value)` tells you the value's type. Its printed form includes words such as `<class 'str'>` or `<class 'int'>`.

## Code example

```python
name = "Ada"
scores = [10, 20, 30]
print(len(name))
print(len(scores))
print(type(name))
```

## Expected output

```text
3
3
<class 'str'>
```

Both values have length 3, but they are different types.

## Common mistake

Assuming length and type answer the same question. Length asks "how many"; type asks "what kind."

## Discussion prompt

When would `type()` help you understand a surprising output?$md$,
          'questions', jsonb_build_array(
            jsonb_build_object('slug','current-len-type-purpose','type','multiple_choice','role','current','topic','built-in-functions','secondary_topics',jsonb_build_array('variables-data-types'),'source_lesson','len-type-inspecting-values','prompt','What does `len("Python")` return?','choices',jsonb_build_array(jsonb_build_object('id','A','label','5'),jsonb_build_object('id','B','label','6'),jsonb_build_object('id','C','label','<class ''str''>'),jsonb_build_object('id','D','label','Python')),'correct_answer',jsonb_build_object('choiceIds',jsonb_build_array('B')),'explanation','`"Python"` has six characters, so `len("Python")` returns `6`.','discussion','What should spaces or punctuation count as in string length?'),
            jsonb_build_object('slug','code-output-len-type','type','code_output','role','current','topic','built-in-functions','secondary_topics',jsonb_build_array('variables-data-types'),'source_lesson','len-type-inspecting-values','prompt','What is printed?','code',E'value = "42"\nprint(len(value))\nprint(type(value))','expected_output',E'2\n<class ''str''>','choices',jsonb_build_array(),'correct_answer',jsonb_build_object('expectedOutput',E'2\n<class ''str''>'),'explanation','The string `"42"` has two characters and its type is `str`.','discussion','How does this output prove that `"42"` is not the integer `42`?'),
            jsonb_build_object('slug','refresher-input-conversion','type','multiple_choice','role','refresher','topic','built-in-functions','secondary_topics',jsonb_build_array('variables-data-types'),'source_lesson','len-type-inspecting-values','refresher_lesson','input-and-string-input','prompt','If `input()` returns `"8"` and you need arithmetic, what should you usually do first?','choices',jsonb_build_array(jsonb_build_object('id','A','label','Use int() to convert it'),jsonb_build_object('id','B','label','Use len() to convert it'),jsonb_build_object('id','C','label','Use print() to convert it'),jsonb_build_object('id','D','label','Add it directly to 2')),'correct_answer',jsonb_build_object('choiceIds',jsonb_build_array('A')),'explanation','`int("8")` converts digit text to an integer for arithmetic.','discussion','How could `type()` help catch forgotten input conversion?')
          )
        ),
        jsonb_build_object(
          'module_slug', 'built-in-python-functions',
          'lesson_slug', 'int-float-str-bool',
          'objective', 'Convert values and predict conversion errors.',
          'summary', 'Practice the four conversion built-ins that show up constantly in beginner Python.',
          'content', $md$## Learning objective

Use `int()`, `float()`, `str()`, and `bool()` deliberately, and predict simple conversion results.

## Short explanation

Conversion functions create a new value of a requested type when possible. `int("10")` creates integer `10`. `float("10")` creates float `10.0`. `str(10)` creates string `"10"`. `bool(10)` creates `True`.

The original value does not magically change unless you assign the converted result to a name.

## Code example

```python
text = "10"
number = int(text)
print(number + 5)
print(float(text))
print(str(number) + "!")
print(bool(""))
```

## Expected output

```text
15
10.0
10!
False
```

Each conversion answers a specific need.

## Common mistake

Calling a conversion function without storing or using its result.

## Discussion prompt

Which conversion feels easiest to forget, and what bug might it cause?$md$,
          'questions', jsonb_build_array(
            jsonb_build_object('slug','current-conversion-result','type','multiple_choice','role','current','topic','built-in-functions','secondary_topics',jsonb_build_array('variables-data-types'),'source_lesson','int-float-str-bool','prompt','What does `str(3.5)` produce?','choices',jsonb_build_array(jsonb_build_object('id','A','label','3'),jsonb_build_object('id','B','label','3.5 as a string'),jsonb_build_object('id','C','label','True'),jsonb_build_object('id','D','label','An integer')),'correct_answer',jsonb_build_object('choiceIds',jsonb_build_array('B')),'explanation','`str(3.5)` creates the text value `"3.5"`.','discussion','Why might converting numbers to strings be useful before printing messages?'),
            jsonb_build_object('slug','code-output-four-conversions','type','code_output','role','current','topic','built-in-functions','secondary_topics',jsonb_build_array('variables-data-types'),'source_lesson','int-float-str-bool','prompt','What is printed?','code',E'x = "6"\nprint(int(x) + 1)\nprint(float(x))\nprint(bool(x))','expected_output',E'7\n6.0\nTrue','choices',jsonb_build_array(),'correct_answer',jsonb_build_object('expectedOutput',E'7\n6.0\nTrue'),'explanation','`int(x)` supports numeric addition, `float(x)` gives `6.0`, and the non-empty string `"6"` is truthy.','discussion','Which line would change if `x` were an empty string?'),
            jsonb_build_object('slug','refresher-len-type','type','fill_blank','role','refresher','topic','built-in-functions','secondary_topics',jsonb_build_array('variables-data-types'),'source_lesson','int-float-str-bool','refresher_lesson','len-type-inspecting-values','prompt','Fill in the blank: `len("hi")` returns `_____`.','choices',jsonb_build_array(),'correct_answer',jsonb_build_object('answer','2'),'explanation','The string `"hi"` has two characters.','discussion','How can `len()` and conversion functions work together when checking input?')
          )
        ),
        jsonb_build_object(
          'module_slug', 'built-in-python-functions',
          'lesson_slug', 'range-for-counting',
          'objective', 'Read range() boundaries and step behavior.',
          'summary', 'Learn how `range()` creates integer sequences for counting.',
          'content', $md$## Learning objective

Read `range()` calls and predict the integers they produce.

## Short explanation

`range()` creates a sequence of integers. It is often used with loops, but you can inspect it by converting it to a list.

`range(stop)` starts at `0` and stops before `stop`. `range(start, stop)` starts at `start` and still stops before `stop`. `range(start, stop, step)` changes by `step`.

The stop value is not included. This is the detail most beginners miss.

## Code example

```python
print(list(range(4)))
print(list(range(2, 6)))
print(list(range(1, 8, 2)))
```

## Expected output

```text
[0, 1, 2, 3]
[2, 3, 4, 5]
[1, 3, 5, 7]
```

## Common mistake

Including the stop value in the result.

## Discussion prompt

Why might Python choose to exclude the stop value from `range()`?$md$,
          'questions', jsonb_build_array(
            jsonb_build_object('slug','current-range-stop','type','multiple_choice','role','current','topic','built-in-functions','secondary_topics',jsonb_build_array('python-fundamentals'),'source_lesson','range-for-counting','prompt','What does `list(range(3))` produce?','choices',jsonb_build_array(jsonb_build_object('id','A','label','[1, 2, 3]'),jsonb_build_object('id','B','label','[0, 1, 2]'),jsonb_build_object('id','C','label','[0, 1, 2, 3]'),jsonb_build_object('id','D','label','3')),'correct_answer',jsonb_build_object('choiceIds',jsonb_build_array('B')),'explanation','`range(3)` starts at 0 and stops before 3.','discussion','How can you remember that the stop value is excluded?'),
            jsonb_build_object('slug','code-output-range-list','type','code_output','role','current','topic','built-in-functions','secondary_topics',jsonb_build_array('variables-data-types'),'source_lesson','range-for-counting','prompt','What is printed?','code',E'print(list(range(2, 7, 2)))','expected_output','[2, 4, 6]','choices',jsonb_build_array(),'correct_answer',jsonb_build_object('expectedOutput','[2, 4, 6]'),'explanation','Start at 2, add 2 each time, and stop before 7.','discussion','Why is converting `range()` to `list()` useful while learning?'),
            jsonb_build_object('slug','refresher-bool-conversion','type','multiple_choice','role','refresher','topic','built-in-functions','secondary_topics',jsonb_build_array('variables-data-types'),'source_lesson','range-for-counting','refresher_lesson','int-float-str-bool','prompt','What does `bool("0")` return?','choices',jsonb_build_array(jsonb_build_object('id','A','label','True'),jsonb_build_object('id','B','label','False'),jsonb_build_object('id','C','label','0'),jsonb_build_object('id','D','label','"0"')),'correct_answer',jsonb_build_object('choiceIds',jsonb_build_array('A')),'explanation','`"0"` is a non-empty string, so it is truthy.','discussion','Why is this a common beginner trap?')
          )
        ),
        jsonb_build_object(
          'module_slug', 'built-in-python-functions',
          'lesson_slug', 'min-max-sum',
          'objective', 'Aggregate numeric collections with common built-ins.',
          'summary', 'Use `min()`, `max()`, and `sum()` to summarize numbers.',
          'content', $md$## Learning objective

Use `min()`, `max()`, and `sum()` to answer questions about a group of numeric values.

## Short explanation

Some built-ins summarize a collection. `min(values)` gives the smallest item. `max(values)` gives the largest item. `sum(values)` adds numeric items.

These functions make code easier to read than writing manual comparisons for simple cases. They also appear in PCAP snippets because they combine built-ins, lists, and numeric reasoning.

## Code example

```python
scores = [8, 10, 7]
print(min(scores))
print(max(scores))
print(sum(scores))
```

## Expected output

```text
7
10
25
```

## Common mistake

Using `sum()` on strings. `sum()` is for numeric addition, not string joining.

## Discussion prompt

When is a built-in summary function clearer than writing the logic by hand?$md$,
          'questions', jsonb_build_array(
            jsonb_build_object('slug','current-min-max-sum','type','multiple_choice','role','current','topic','built-in-functions','secondary_topics',jsonb_build_array('variables-data-types'),'source_lesson','min-max-sum','prompt','What does `sum([2, 3, 4])` return?','choices',jsonb_build_array(jsonb_build_object('id','A','label','2'),jsonb_build_object('id','B','label','4'),jsonb_build_object('id','C','label','9'),jsonb_build_object('id','D','label','[2, 3, 4]')),'correct_answer',jsonb_build_object('choiceIds',jsonb_build_array('C')),'explanation','`sum()` adds the numeric items: 2 + 3 + 4 = 9.','discussion','How would you explain the difference between `sum()` and `len()`?'),
            jsonb_build_object('slug','code-output-aggregates','type','code_output','role','current','topic','built-in-functions','secondary_topics',jsonb_build_array('variables-data-types'),'source_lesson','min-max-sum','prompt','What is printed?','code',E'values = [4, 1, 6]\nprint(min(values))\nprint(max(values))\nprint(sum(values))','expected_output',E'1\n6\n11','choices',jsonb_build_array(),'correct_answer',jsonb_build_object('expectedOutput',E'1\n6\n11'),'explanation','The smallest value is 1, largest is 6, and the total is 11.','discussion','Which of these three functions do you think is easiest to misuse?'),
            jsonb_build_object('slug','refresher-range','type','multiple_choice','role','refresher','topic','built-in-functions','secondary_topics',jsonb_build_array(),'source_lesson','min-max-sum','refresher_lesson','range-for-counting','prompt','Which value is included in `list(range(1, 4))`?','choices',jsonb_build_array(jsonb_build_object('id','A','label','0'),jsonb_build_object('id','B','label','1'),jsonb_build_object('id','C','label','4'),jsonb_build_object('id','D','label','5')),'correct_answer',jsonb_build_object('choiceIds',jsonb_build_array('B')),'explanation','`range(1, 4)` includes 1, 2, and 3. It excludes 4.','discussion','How could `sum(range(1, 4))` combine two built-ins?')
          )
        ),
        jsonb_build_object(
          'module_slug', 'built-in-python-functions',
          'lesson_slug', 'sorted-vs-sort-preview',
          'objective', 'Preview return-value vs mutation differences.',
          'summary', 'Learn that `sorted()` returns a new sorted list, while `.sort()` changes a list in place.',
          'content', $md$## Learning objective

Distinguish `sorted(values)` from `values.sort()` at a beginner level.

## Short explanation

`sorted()` is a built-in function. It takes an iterable and returns a new sorted list. The original list remains available unchanged.

`.sort()` is a list method, not a built-in function. It changes the list in place and returns `None`. This return-value difference is a major PCAP pattern and prepares you for list mutation later.

## Code example

```python
numbers = [3, 1, 2]
ordered = sorted(numbers)
print(numbers)
print(ordered)
```

## Expected output

```text
[3, 1, 2]
[1, 2, 3]
```

`sorted()` made a new list and left `numbers` unchanged.

## Common mistake

Expecting `sorted(numbers)` to mutate `numbers`. It returns a new list instead.

## Discussion prompt

Why might Python provide both a non-mutating built-in and a mutating list method?$md$,
          'questions', jsonb_build_array(
            jsonb_build_object('slug','current-sorted-returns','type','multiple_choice','role','current','topic','built-in-functions','secondary_topics',jsonb_build_array('variables-data-types'),'source_lesson','sorted-vs-sort-preview','prompt','What does `sorted([3, 1, 2])` return?','choices',jsonb_build_array(jsonb_build_object('id','A','label','[3, 1, 2]'),jsonb_build_object('id','B','label','[1, 2, 3]'),jsonb_build_object('id','C','label','None'),jsonb_build_object('id','D','label','3')),'correct_answer',jsonb_build_object('choiceIds',jsonb_build_array('B')),'explanation','`sorted()` returns a new sorted list.','discussion','Why is "returns a new list" different from "changes the old list"?'),
            jsonb_build_object('slug','code-output-sorted-original','type','code_output','role','current','topic','built-in-functions','secondary_topics',jsonb_build_array('variables-data-types'),'source_lesson','sorted-vs-sort-preview','prompt','What is printed?','code',E'items = [2, 1]\nnew_items = sorted(items)\nprint(items)\nprint(new_items)','expected_output',E'[2, 1]\n[1, 2]','choices',jsonb_build_array(),'correct_answer',jsonb_build_object('expectedOutput',E'[2, 1]\n[1, 2]'),'explanation','`items` is unchanged. `new_items` receives the sorted list returned by `sorted()`.','discussion','How could this difference prevent accidental data changes?'),
            jsonb_build_object('slug','refresher-min-max','type','fill_blank','role','refresher','topic','built-in-functions','secondary_topics',jsonb_build_array('variables-data-types'),'source_lesson','sorted-vs-sort-preview','refresher_lesson','min-max-sum','prompt','Fill in the blank: `max([4, 9, 1])` returns `_____`.','choices',jsonb_build_array(),'correct_answer',jsonb_build_object('answer','9'),'explanation','`max()` returns the largest value in the collection.','discussion','How is sorting related to finding a minimum or maximum?')
          )
        ),
        jsonb_build_object(
          'module_slug', 'built-in-python-functions',
          'lesson_slug', 'dir-discovery-tool',
          'objective', 'Use dir() to inspect available attributes.',
          'summary', 'Use `dir()` as a discovery tool without feeling like you must understand every result yet.',
          'content', $md$## Learning objective

Use `dir()` to inspect what names or attributes are available, while recognizing that the output can be large.

## Short explanation

`dir(value)` returns a list of attribute names available on a value. Beginners do not need to memorize the entire list. The goal is to learn that Python objects come with capabilities, and `dir()` can help you explore them.

Many names in `dir()` start and end with double underscores. These are special method names. You will learn more about them in object-oriented programming. For now, focus on using `dir()` as a map, not as something to memorize.

## Code example

```python
word = "hello"
print("upper" in dir(word))
print("append" in dir(word))
```

## Expected output

```text
True
False
```

Strings have an `upper` method. They do not have a list-style `append` method.

## Common mistake

Panicking when `dir()` returns many names. You are usually looking for one clue, not trying to understand everything at once.

## Discussion prompt

How could `dir()` help a cohort answer "what can this value do?" without immediately asking AI?$md$,
          'questions', jsonb_build_array(
            jsonb_build_object('slug','current-dir-purpose','type','multiple_choice','role','current','topic','built-in-functions','secondary_topics',jsonb_build_array('python-fundamentals'),'source_lesson','dir-discovery-tool','prompt','What is `dir()` mainly useful for?','choices',jsonb_build_array(jsonb_build_object('id','A','label','Displaying a value to the user'),jsonb_build_object('id','B','label','Inspecting available names or attributes'),jsonb_build_object('id','C','label','Converting text to numbers'),jsonb_build_object('id','D','label','Sorting a list')),'correct_answer',jsonb_build_object('choiceIds',jsonb_build_array('B')),'explanation','`dir()` helps you inspect what attributes are available on an object or module.','discussion','What makes `dir()` more like a map than an answer key?'),
            jsonb_build_object('slug','code-output-dir-membership','type','code_output','role','current','topic','built-in-functions','secondary_topics',jsonb_build_array('variables-data-types'),'source_lesson','dir-discovery-tool','prompt','What is printed?','code',E'text = "abc"\nprint("upper" in dir(text))\nprint("append" in dir(text))','expected_output',E'True\nFalse','choices',jsonb_build_array(),'correct_answer',jsonb_build_object('expectedOutput',E'True\nFalse'),'explanation','Strings have `upper`, but `append` belongs to list-style mutation, not strings.','discussion','What would you try next after discovering a method name with `dir()`?'),
            jsonb_build_object('slug','refresher-sorted','type','multiple_choice','role','refresher','topic','built-in-functions','secondary_topics',jsonb_build_array('variables-data-types'),'source_lesson','dir-discovery-tool','refresher_lesson','sorted-vs-sort-preview','prompt','Which expression returns a new sorted list?','choices',jsonb_build_array(jsonb_build_object('id','A','label','sorted([2, 1])'),jsonb_build_object('id','B','label','[2, 1].sort()'),jsonb_build_object('id','C','label','dir([2, 1])'),jsonb_build_object('id','D','label','print([2, 1])')),'correct_answer',jsonb_build_object('choiceIds',jsonb_build_array('A')),'explanation','`sorted([2, 1])` returns a new sorted list.','discussion','How might `dir()` help you discover `.sort()` later?')
          )
        )
      )
    )
  loop
    select m.id
      into v_module_id
    from public.program_modules m
    where m.program_id = v_program_id
      and m.slug = v_lesson ->> 'module_slug';

    if v_module_id is null then
      raise exception 'Missing module % for production PCAP content.', v_lesson ->> 'module_slug';
    end if;

    select l.id
      into v_lesson_id
    from public.program_lessons l
    where l.module_id = v_module_id
      and l.slug = v_lesson ->> 'lesson_slug';

    if v_lesson_id is null then
      raise exception 'Missing lesson % for production PCAP content.', v_lesson ->> 'lesson_slug';
    end if;

    update public.program_lessons
    set objective = v_lesson ->> 'objective',
        summary = v_lesson ->> 'summary',
        content_markdown = v_lesson ->> 'content',
        estimated_minutes = 7,
        is_published = true,
        updated_at = now()
    where id = v_lesson_id;

    select q.id
      into v_quiz_id
    from public.lesson_quizzes q
    where q.lesson_id = v_lesson_id
      and q.slug = 'checkpoint';

    if v_quiz_id is null then
      raise exception 'Missing checkpoint quiz for lesson %.', v_lesson ->> 'lesson_slug';
    end if;

    update public.lesson_quizzes
    set description = 'Three production questions: one current concept check, one code/output or fill-in reasoning question, and one spiral refresher.',
        current_question_ratio = 0.70,
        refresher_question_ratio = 0.30,
        passing_percent = 70,
        is_published = true,
        updated_at = now()
    where id = v_quiz_id;

    delete from public.quiz_questions
    where quiz_id = v_quiz_id
      and slug = 'explain-the-concept';

    for v_question_order, v_question in
      select row_number() over () - 1, value
      from jsonb_array_elements(v_lesson -> 'questions')
    loop
      select id
        into v_topic_id
      from public.curriculum_topics
      where slug = v_question ->> 'topic';

      select l.id
        into v_source_lesson_id
      from public.program_lessons l
      join public.program_modules m on m.id = l.module_id
      where m.program_id = v_program_id
        and l.slug = v_question ->> 'source_lesson'
      limit 1;

      v_refresher_lesson_id := null;
      if v_question ->> 'refresher_lesson' is not null then
        select l.id
          into v_refresher_lesson_id
        from public.program_lessons l
        join public.program_modules m on m.id = l.module_id
        where m.program_id = v_program_id
          and l.slug = v_question ->> 'refresher_lesson'
        limit 1;
      end if;

      insert into public.quiz_questions (
        quiz_id,
        slug,
        question_type,
        question_role,
        prompt_markdown,
        code_snippet,
        expected_output,
        choices,
        correct_answer,
        explanation_markdown,
        discussion_prompt,
        primary_topic_id,
        source_module_id,
        source_lesson_id,
        refresher_lesson_id,
        sort_order,
        is_published
      )
      values (
        v_quiz_id,
        v_question ->> 'slug',
        v_question ->> 'type',
        v_question ->> 'role',
        v_question ->> 'prompt',
        v_question ->> 'code',
        v_question ->> 'expected_output',
        coalesce(v_question -> 'choices', '[]'::jsonb),
        coalesce(v_question -> 'correct_answer', '{}'::jsonb),
        v_question ->> 'explanation',
        v_question ->> 'discussion',
        v_topic_id,
        v_module_id,
        coalesce(v_source_lesson_id, v_lesson_id),
        v_refresher_lesson_id,
        v_question_order,
        true
      )
      on conflict (quiz_id, slug) do update
      set question_type = excluded.question_type,
          question_role = excluded.question_role,
          prompt_markdown = excluded.prompt_markdown,
          code_snippet = excluded.code_snippet,
          expected_output = excluded.expected_output,
          choices = excluded.choices,
          correct_answer = excluded.correct_answer,
          explanation_markdown = excluded.explanation_markdown,
          discussion_prompt = excluded.discussion_prompt,
          primary_topic_id = excluded.primary_topic_id,
          source_module_id = excluded.source_module_id,
          source_lesson_id = excluded.source_lesson_id,
          refresher_lesson_id = excluded.refresher_lesson_id,
          sort_order = excluded.sort_order,
          is_published = true,
          updated_at = now()
      returning id into v_question_id;

      delete from public.quiz_question_secondary_topics
      where question_id = v_question_id;

      for v_secondary_slug in
        select jsonb_array_elements_text(coalesce(v_question -> 'secondary_topics', '[]'::jsonb))
      loop
        select id into v_secondary_topic_id
        from public.curriculum_topics
        where slug = v_secondary_slug;

        if v_secondary_topic_id is not null and v_secondary_topic_id <> v_topic_id then
          insert into public.quiz_question_secondary_topics (question_id, topic_id)
          values (v_question_id, v_secondary_topic_id)
          on conflict (question_id, topic_id) do nothing;
        end if;
      end loop;

      insert into public.discussion_threads (
        cohort_id,
        lesson_id,
        question_id,
        title
      )
      values (
        v_cohort_id,
        v_lesson_id,
        v_question_id,
        'Discussion: ' || (v_lesson ->> 'summary')
      )
      on conflict (cohort_id, question_id) where question_id is not null do update
      set title = excluded.title,
          updated_at = now();
    end loop;
  end loop;
end $$;

commit;
