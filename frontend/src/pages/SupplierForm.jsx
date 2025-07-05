import React from 'react';
import { useParams } from 'react-router-dom';
import SupplierFormComponent from '../components/supplier/SupplierForm';
import Layout from '../components/Layout';

/**
 * Lieferantenformular Seite
 * Container-Komponente für das Lieferantenformular
 */
const SupplierForm = ({ mode = 'create' }) => {
  const { id } = useParams();
  
  return (
    <Layout>
      <SupplierFormComponent mode={mode} />
    </Layout>
  );
};

export default SupplierForm; 