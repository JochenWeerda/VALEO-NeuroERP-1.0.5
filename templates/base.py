# -*- coding: utf-8 -*-
"""
🎨 GENXAIS Base Template
"Build the Future from the Beginning"

Base template class for all GENXAIS project templates.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
import logging
import os

logger = logging.getLogger("GENXAIS.Templates")

class BaseTemplate(ABC):
    """Abstract base class for all GENXAIS templates."""
    
    def __init__(self, project_name: str, config: Optional[Dict[str, Any]] = None):
        self.project_name = project_name
        self.config = config or {}
        self.template_name = self.__class__.__name__.replace("Template", "").lower()
        
    @abstractmethod
    def get_template_info(self) -> Dict[str, Any]:
        """Return template information and metadata."""
        pass
    
    @abstractmethod
    def get_file_structure(self) -> Dict[str, Any]:
        """Return the file structure this template creates."""
        pass
    
    @abstractmethod
    def generate_files(self) -> Dict[str, str]:
        """Generate template files with content."""
        pass
    
    @abstractmethod
    def get_dependencies(self) -> Dict[str, List[str]]:
        """Return dependencies for this template."""
        pass
    
    def create_directory_structure(self, base_path: str = "."):
        """Create the directory structure for this template."""
        
        structure = self.get_file_structure()
        self._create_dirs_recursive(structure, base_path)
        
    def _create_dirs_recursive(self, structure: Dict[str, Any], current_path: str):
        """Recursively create directory structure."""
        
        for name, content in structure.items():
            path = os.path.join(current_path, name)
            
            if isinstance(content, dict):
                # It's a directory
                os.makedirs(path, exist_ok=True)
                self._create_dirs_recursive(content, path)
            else:
                # It's a file - ensure parent directory exists
                os.makedirs(os.path.dirname(path), exist_ok=True)
    
    def write_files(self, base_path: str = "."):
        """Write all template files to disk."""
        
        files = self.generate_files()
        
        for file_path, content in files.items():
            full_path = os.path.join(base_path, file_path)
            
            # Ensure directory exists
            os.makedirs(os.path.dirname(full_path), exist_ok=True)
            
            # Write file
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)
                
        logger.info(f"✅ {len(files)} template files written")
    
    def get_setup_commands(self) -> List[str]:
        """Get list of setup commands to run after template creation."""
        
        return [
            "pip install -r requirements.txt",
            "python -m pytest",
            "python main.py"
        ]
    
    def get_readme_content(self) -> str:
        """Generate README content for this template."""
        
        info = self.get_template_info()
        deps = self.get_dependencies()
        commands = self.get_setup_commands()
        
        readme = f"""# {self.project_name}

{info.get('description', 'GENXAIS project')}

## Template: {info.get('display_name', self.template_name.title())}

{info.get('long_description', 'Created with GENXAIS Framework')}

## Features

"""
        
        for feature in info.get('features', []):
            readme += f"- {feature}\n"
            
        readme += f"""

## Quick Start

### Prerequisites

"""
        
        for category, packages in deps.items():
            readme += f"**{category.title()}:**\n"
            for package in packages:
                readme += f"- {package}\n"
            readme += "\n"
            
        readme += """### Setup

```bash
"""
        
        for command in commands:
            readme += f"{command}\n"
            
        readme += f"""```

## Architecture

{info.get('architecture_notes', 'Built with GENXAIS APM Framework methodology.')}

## Development

This project follows the GENXAIS APM cycle:
- **VAN**: Vision-Alignment-Navigation
- **PLAN**: Project planning and resource allocation  
- **CREATE**: Prototype and design creation
- **IMPLEMENT**: Implementation and deployment
- **REFLECT**: Analysis and improvement

## Support

Created with GENXAIS Framework - "Build the Future from the Beginning"

For support and documentation: [GENXAIS Documentation](https://github.com/your-org/genxais)
"""
        
        return readme
    
    def validate_template(self) -> List[str]:
        """Validate template configuration and return any issues."""
        
        issues = []
        
        # Check required methods implementation
        try:
            info = self.get_template_info()
            if not info.get('name'):
                issues.append("Template info missing 'name' field")
        except Exception as e:
            issues.append(f"get_template_info() failed: {e}")
            
        try:
            structure = self.get_file_structure()
            if not structure:
                issues.append("File structure is empty")
        except Exception as e:
            issues.append(f"get_file_structure() failed: {e}")
            
        try:
            files = self.generate_files()
            if not files:
                issues.append("No files generated")
        except Exception as e:
            issues.append(f"generate_files() failed: {e}")
            
        try:
            deps = self.get_dependencies()
            if not deps:
                issues.append("No dependencies specified")
        except Exception as e:
            issues.append(f"get_dependencies() failed: {e}")
            
        return issues
    
    def get_template_variables(self) -> Dict[str, str]:
        """Get template variables for substitution."""
        
        return {
            "PROJECT_NAME": self.project_name,
            "PROJECT_NAME_UPPER": self.project_name.upper(),
            "PROJECT_NAME_LOWER": self.project_name.lower(),
            "TEMPLATE_NAME": self.template_name,
            "GENXAIS_VERSION": "1.0.0"
        }
    
    def substitute_variables(self, content: str) -> str:
        """Substitute template variables in content."""
        
        variables = self.get_template_variables()
        
        for var_name, var_value in variables.items():
            content = content.replace(f"{{{{{var_name}}}}}", var_value)
            
        return content
    
    def __str__(self) -> str:
        """String representation."""
        return f"{self.template_name.title()} Template[{self.project_name}]"
    
    def __repr__(self) -> str:
        """Detailed representation."""
        info = self.get_template_info()
        return f"BaseTemplate(name='{self.template_name}', project='{self.project_name}', version='{info.get('version', 'unknown')}')" 