{
    'name': 'Custom Finance',
    'version': '1.0.0',
    'summary': 'Erweiterung für Finanzbuchhaltung, inspiriert von Odoo',
    'author': 'AI_driven_ERP Team',
    'category': 'Accounting',
    'depends': [],
    'data': [
        'security/ir.model.access.csv',
        'views/custom_finance_views.xml',
        'data/demo_data.xml',
    ],
    'installable': True,
    'application': True,
    'auto_install': False,
} 