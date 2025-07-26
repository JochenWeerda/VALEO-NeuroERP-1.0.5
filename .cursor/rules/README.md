# Cursor Rules for the GENXAIS Framework

These rules are designed for use with the Cursor IDE and are based on the Agentic Project Management (APM) Framework. They serve to improve the effectiveness and consistency of the various work modes in the project.

## Available Modes

The project uses the following modes, which are supported by corresponding rule files:

1. **VAN Mode** (Vision, Analysis, Navigation): `van_mode_rules.json`
   - Focus on validation and analysis of systems and code
   - Systematic examination of architecture, environment, and code quality
   - Documentation of problems and recommendations

2. **PLAN Mode**: `plan_mode_rules.json`
   - Creation of structured implementation plans
   - Task assignment and dependency management
   - Identification of components that require creative phases

3. **CREATE Mode**: `creative_mode_rules.json`
   - Generation of multiple design options
   - Analysis of advantages and disadvantages of each option
   - Documentation of implementation guidelines

4. **IMPLEMENT Mode**: `implement_mode_rules.json`
   - Step-by-step implementation according to the plan
   - Documentation of commands and results
   - Verification of complete implementation

5. **REFLECT-ARCHIVE Mode**: `reflect_archive_rules.json`
   - Reflection on the implementation
   - Documentation of successes, challenges, and insights
   - Archiving of the completed task

## Integration with the Memory Bank

The rules are closely integrated with the project's memory bank structure:

```
memory-bank/
  ├── activeContext.md           # Active context
  ├── validation/                # VAN mode documents
  │   └── validation-template.md # Template for validation reports
  ├── planning/                  # PLAN mode documents
  │   └── implementation-plan-template.md # Template for implementation plans
  ├── creative/                  # CREATE mode documents
  ├── handover/                  # Handover documents
  │   ├── handover-template.md   # Template for handover documents
  │   └── handover-history/      # Historical handover documents
  ├── reflection/                # REFLECT mode documents
  └── archive/                   # Archived documents
```

## Using the Rules

To activate the rules, simply enter the corresponding mode command:

```
VAN-mode
PLAN-mode
CREATE-mode
IMPLEMENT-mode
REFLECT-mode
ARCHIVE NOW
```

The agent will then load the appropriate rules and adapt its work mode.

## Handover Protocol

The handover protocol enables seamless transitions between different work sessions or agents:

1. The departing agent creates a handover document based on `handover-template.md`
2. The document is saved in `memory-bank/handover/`
3. A copy is archived in `memory-bank/handover/handover-history/`
4. The receiving agent can read the handover document to understand the context

## Customizing the Rules

The rules can be customized as needed to meet specific project requirements. Follow these guidelines:

1. Maintain the basic structure of the modes
2. Ensure that new rules are compatible with the memory bank structure
3. Document all changes in this README file

## Further Information

For more information about the APM Framework and its concepts, see:
- The project documentation in the `docs/` directory
- `docs/handover_system.md` for details on the handover system
- `docs/architecture/development_flow.md` for the development flow in the project 