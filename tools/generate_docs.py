#!/usr/bin/env python

from documentation.generator import DocumentationGenerator

def main():
    """Generiert die Dokumentation"""
    print("Generiere Dokumentation...")
    
    generator = DocumentationGenerator()
    generator.generate()
    
    print("Dokumentation erfolgreich generiert!")
    
if __name__ == "__main__":
    main() 