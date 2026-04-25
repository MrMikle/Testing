import { PropsWithChildren } from 'react';

type PageHeaderProps = PropsWithChildren<{
    title: string;
    subtitle?: string;
}>;

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
    return (
        <div className="page-header">
            <div>
                <h1>{title}</h1>
                {subtitle ? <p>{subtitle}</p> : null}
            </div>
            {children ? <div className="page-actions">{children}</div> : null}
        </div>
    );
}
