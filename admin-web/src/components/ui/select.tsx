import * as React from 'react';
import { cn } from '../../lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, ...props }, ref) => {
  return <select className={cn('ui-input ui-select', className)} ref={ref} {...props} />;
});

Select.displayName = 'Select';

export { Select };
