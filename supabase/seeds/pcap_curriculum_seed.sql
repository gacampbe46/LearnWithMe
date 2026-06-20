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

commit;
