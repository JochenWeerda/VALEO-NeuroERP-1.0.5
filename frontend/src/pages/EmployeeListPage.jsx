import React from 'react';
import { Helmet } from 'react-helmet';
import EmployeeList from '../components/employee/EmployeeList';

/**
 * Mitarbeiter-Übersichtsseite
 */
const EmployeeListPage = () => {
  return (
    <div>
      <Helmet>
        <title>Mitarbeiter | Folkerts ERP</title>
      </Helmet>
      
      <EmployeeList />
    </div>
  );
};

export default EmployeeListPage; 