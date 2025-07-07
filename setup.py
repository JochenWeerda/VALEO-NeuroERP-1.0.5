# -*- coding: utf-8 -*-
"""
GENXAIS Framework Setup
GENerative eXplainable Artificial Intelligence System
"""

from setuptools import setup, find_packages
import os

# Read README for long description
def read_readme():
    with open("README.md", "r", encoding="utf-8") as fh:
        return fh.read()

# Read requirements
def read_requirements():
    with open("requirements.txt", "r", encoding="utf-8") as fh:
        return [line.strip() for line in fh if line.strip() and not line.startswith("#")]

setup(
    name="valeo-neuroerp",
    version="1.0.1",
    author="Jochen",
    author_email="team@genxais.ai",
    description="VALEO NeuroERP System",
    long_description=read_readme(),
    long_description_content_type="text/markdown",
    url="https://github.com/genxais/framework",
    project_urls={
        "Documentation": "https://docs.genxais.ai",
        "Source": "https://github.com/genxais/framework",
        "Tracker": "https://github.com/genxais/framework/issues",
        "Discord": "https://discord.gg/genxais"
    },
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Topic :: Software Development :: Libraries :: Application Frameworks",
        "Topic :: Software Development :: Code Generators", 
        "Topic :: Artificial Intelligence",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Operating System :: OS Independent",
        "Environment :: Console",
        "Framework :: AsyncIO",
    ],
    python_requires=">=3.8",
    install_requires=[
        "langchain>=0.0.300",
        "networkx>=3.1",
        "matplotlib>=3.7.1",
        "jinja2>=3.1.2",
        "pydantic>=2.0.0",
        "prometheus-client>=0.17.1",
        "psutil>=5.9.5",
        "motor>=3.3.0",
        "aioredis>=2.0.0",
        "fastapi>=0.100.0",
        "uvicorn>=0.22.0",
        'pytest>=7.4.3',
        'pytest-mock>=3.12.0',
    ],
    extras_require={
        "dev": [
            "pytest>=7.0.0",
            "pytest-asyncio>=0.21.0",
            "black>=22.0.0",
            "flake8>=4.0.0",
            "mypy>=0.991",
            "coverage>=6.0.0"
        ],
        "monitoring": [
            "prometheus-client>=0.14.0",
            "grafana-api>=1.0.0"
        ],
        "ml": [
            "numpy>=1.21.0",
            "pandas>=1.3.0",
            "scikit-learn>=1.0.0"
        ],
        "web": [
            "fastapi>=0.68.0",
            "uvicorn>=0.15.0",
            "jinja2>=3.0.0"
        ]
    },
    entry_points={
        "console_scripts": [
            "genxais=genxais_sdk:main",
            "genxais-init=genxais_sdk:init_project",
            "genxais-start=genxais_sdk:start_apm_cycle",
        ]
    },
    include_package_data=True,
    package_data={
        "genxais": [
            "templates/*",
            "config/*",
            "docs/*"
        ]
    },
    keywords=[
        "ai", "framework", "development", "apm", "multi-agent", 
        "cursor", "automation", "code-generation", "intelligent",
        "software-development", "sdk", "rag", "mcp"
    ],
    zip_safe=False,
) 