import { useReveal } from '../hooks/useReveal.js';

export default function Reveal({ as: Tag = 'div', className = '', stagger = false, children, ...rest }) {
  const [ref, visible] = useReveal();
  const cls = `reveal${stagger ? ' reveal-stagger' : ''}${visible ? ' in-view' : ''}${className ? ` ${className}` : ''}`;
  return (
    <Tag ref={ref} className={cls} {...rest}>
      {children}
    </Tag>
  );
}
