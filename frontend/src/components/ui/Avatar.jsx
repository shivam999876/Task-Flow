/**
 * Avatar component — shows user initials in a gradient circle.
 * Falls back to '?' if no name is provided.
 */
const Avatar = ({ name = '', size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  // Generate a consistent color from the name
  const hue = name
    ? name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360
    : 220;

  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0 ${className}`}
      style={{ background: `hsl(${hue}, 65%, 45%)` }}
      title={name}
    >
      {initials}
    </div>
  );
};

export default Avatar;
