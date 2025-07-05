from pathlib import Path
from typing import Dict, List, Optional

# Basis-Konfiguration
CONFIG = {
    # Verzeichnisse für Dokumentation
    "docs_dir": Path("docs"),
    "output_dir": Path("docs/generated"),
    "template_dir": Path("docs/templates"),
    
    # Zu analysierende Module
    "modules": [
        "backend",
        "frontend",
        "tools"
    ],
    
    # Zu ignorierende Dateien/Verzeichnisse
    "ignore": [
        "__pycache__",
        "*.pyc",
        "tests",
        "venv"
    ],
    
    # Dokumentationsformate
    "formats": [
        "markdown",
        "html"
    ],
    
    # Template-Variablen
    "variables": {
        "project_name": "VALEO NeuroERP",
        "version": "1.0.1",
        "author": "Jochen"
    },
    
    # Graphviz-Konfiguration
    "graphviz": {
        "format": "png",
        "dpi": 300,
        "layout": "dot"
    }
}

# Dokumentationstypen
DOC_TYPES = {
    "module": {
        "template": "module.md.j2",
        "sections": [
            "description",
            "classes",
            "functions",
            "variables",
            "dependencies"
        ]
    },
    "class": {
        "template": "class.md.j2",
        "sections": [
            "description",
            "methods",
            "attributes",
            "inheritance"
        ]
    },
    "function": {
        "template": "function.md.j2",
        "sections": [
            "description",
            "parameters",
            "returns",
            "raises",
            "examples"
        ]
    }
}

# Markdown-Formatierung
MARKDOWN = {
    "headers": {
        "module": "#",
        "class": "##",
        "function": "###",
        "section": "####"
    },
    "code_block": "```{language}\n{code}\n```",
    "link": "[{text}]({url})",
    "emphasis": "*{text}*",
    "strong": "**{text}**",
    "list_item": "- {text}",
    "table_header": "| {headers} |",
    "table_separator": "|---" * len("{headers}".split("|")) + "|",
    "table_row": "| {cells} |"
}

# HTML-Formatierung
HTML = {
    "page": """
<!DOCTYPE html>
<html>
<head>
    <title>{title}</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    {content}
</body>
</html>
""",
    "module": "<section class='module'>{content}</section>",
    "class": "<section class='class'>{content}</section>",
    "function": "<section class='function'>{content}</section>",
    "code": "<pre><code class='{language}'>{code}</code></pre>",
    "table": "<table>{content}</table>",
    "list": "<ul>{items}</ul>"
}

# Abhängigkeitsgraph-Konfiguration
GRAPH = {
    "node_styles": {
        "module": {
            "shape": "box",
            "style": "filled",
            "fillcolor": "lightblue"
        },
        "class": {
            "shape": "ellipse",
            "style": "filled",
            "fillcolor": "lightgreen"
        },
        "function": {
            "shape": "diamond",
            "style": "filled",
            "fillcolor": "lightyellow"
        }
    },
    "edge_styles": {
        "imports": {
            "color": "black",
            "style": "solid"
        },
        "inherits": {
            "color": "blue",
            "style": "dashed"
        },
        "calls": {
            "color": "red",
            "style": "dotted"
        }
    }
} 