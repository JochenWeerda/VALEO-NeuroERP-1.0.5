from odoo import models, fields

class CustomFinanceEntry(models.Model):
    _name = 'custom.finance.entry'
    _description = 'Finanzbuchung (Custom)'

    name = fields.Char(string='Buchungstext', required=True)
    amount = fields.Float(string='Betrag', required=True)
    date = fields.Date(string='Buchungsdatum', required=True)
    account = fields.Char(string='Konto')
    partner = fields.Char(string='Partner')
    note = fields.Text(string='Notiz') 