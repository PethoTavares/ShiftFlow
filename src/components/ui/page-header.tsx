type PageHeaderProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl space-y-2">
        <h1 className="app-title">{title}</h1>
        <p className="app-subtitle">{description}</p>
      </div>
      {action}
    </div>
  );
}
