import * as React from 'react';

interface TabsProps {
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
}
interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}
interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}
interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}
const TabsContext = React.createContext<{
  activeTab: string;
  setActiveTab: (value: string) => void;
} | null>(null);
const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  className = '',
  children,
}) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

const TabsList: React.FC<TabsListProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-600 ${className}`}
    >
      {children}
    </div>
  );
};

const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  children,
  className = '',
}) => {
  const context = React.useContext(TabsContext);
  if (!context) return null;
  const { activeTab, setActiveTab } = context;
  const isActive = activeTab === value;
  return (
    <button
      onClick={() => setActiveTab(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${
        isActive
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-600 hover:text-gray-900'
      } ${className}`}
    >
      {children}
    </button>
  );
};

const TabsContent: React.FC<TabsContentProps> = ({
  value,
  children,
  className = '',
}) => {
  const context = React.useContext(TabsContext);
  if (!context) return null;
  const { activeTab } = context;
  if (activeTab !== value) return null;
  return <div className={`mt-2 ${className}`}>{children}</div>;
};

export { Tabs, TabsList, TabsTrigger, TabsContent };