export default function Card({ children, className = '', ...props }) {
  return (
    <div className={`glass-panel rounded-2xl shadow-sm p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}
