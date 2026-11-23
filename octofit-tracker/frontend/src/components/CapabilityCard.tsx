import type { ReactNode } from 'react';

type Props<T> = {
  title: string;
  description: string;
  emptyText: string;
  items: T[] | null;
  error: string | null;
  renderItem: (item: T, index: number) => ReactNode;
};

export function CapabilityCard<T>({ title, description, emptyText, items, error, renderItem }: Props<T>) {
  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {error ? (
          <p role="alert">Unable to load data: {error}</p>
        ) : items === null ? (
          <p role="status">Loading {title.toLowerCase()}...</p>
        ) : items.length === 0 ? (
          <p>{emptyText}</p>
        ) : (
          <ul className="list-unstyled">
            {items.map((item, index) => <li key={index}>{renderItem(item, index)}</li>)}
          </ul>
        )}
      </div>
    </section>
  );
}
