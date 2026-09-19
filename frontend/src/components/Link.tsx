/** Envoltorio de <Link> de react-router que reenvía la ref. */

import { forwardRef } from 'react';
import { Link as RouterLink, LinkProps } from 'react-router-dom';

const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ children, ...props }, ref) => {
    return <RouterLink ref={ref} {...props}>{children}</RouterLink>;
  }
);

Link.displayName = 'Link';
export default Link;