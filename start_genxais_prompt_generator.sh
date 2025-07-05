#!/bin/bash
# Shell-Skript zum Starten des GENXAIS-Prompt-Generators

echo
echo "==================================================="
echo "VALEO-NeuroERP GENXAIS-Prompt-Generator starten..."
echo "==================================================="
echo

# Pr�fe, ob Python installiert ist
if ! command -v python3 &> /dev/null; then
    echo "Python ist nicht installiert. Bitte installieren Sie Python 3.8 oder h�her."
    exit 1
fi

# Pr�fe, ob die erforderlichen Dateien existieren
if [ ! -f "scripts/genxais_prompt_generator.py" ]; then
    echo "Fehler: scripts/genxais_prompt_generator.py nicht gefunden."
    exit 1
fi

if [ ! -f "scripts/launch_genxais_prompt_generator.py" ]; then
    echo "Fehler: scripts/launch_genxais_prompt_generator.py nicht gefunden."
    exit 1
fi

# Starte den Generator
echo "Starte GENXAIS-Prompt-Generator..."
python3 scripts/launch_genxais_prompt_generator.py

# Falls der Generator beendet wurde
echo
echo "GENXAIS-Prompt-Generator wurde beendet."
