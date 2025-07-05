import React from 'react';
import { Helmet } from 'react-helmet';
import EmployeeFormComponent from '../components/employee/EmployeeForm';

/**
 * Mitarbeiterformular-Seite für Erstellung und Bearbeitung
 */
const EmployeeForm = ({ mode = 'create' }) => {
  return (
    <div>
      <Helmet>
        <title>
          {mode === 'edit' ? 'Mitarbeiter bearbeiten' : 'Neuer Mitarbeiter'} | Folkerts ERP
        </title>
      </Helmet>
      
      <EmployeeFormComponent mode={mode} />
    </div>
  );
};

export default EmployeeForm; 