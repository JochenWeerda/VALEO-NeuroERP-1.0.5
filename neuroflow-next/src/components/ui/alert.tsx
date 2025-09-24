import * as React from 'react';

interface AlertProps {
  children: React.ReactNode;
  className?: string;
}
interface AlertDescriptionProps {
  children: React.ReactNode;
  className?: string;
}
const Alert: React.FC<AlertProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`p-4 border rounded-lg bg-blue-50 border-blue-200 ${className}`}
    >
      {children}
    </div>
  );
};

const AlertDescription: React.FC<AlertDescriptionProps> = ({
  children,
  className = '',
}) => {
  return <div className={`text-sm text-blue-800 ${className}`}>{children}</div>;
};
export { Alert, AlertDescription };