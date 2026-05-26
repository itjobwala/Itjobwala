import Image from 'next/image';

interface Props {
  name:  string | null;
  photo?: string | null;
  size?: number;
  online?: boolean;
}

export default function ChatAvatar({ name, photo, size = 40, online }: Props) {
  const initials = (name ?? '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {photo ? (
        <Image src={photo} alt={name ?? ''} width={size} height={size}
          className="rounded-full object-cover" style={{ width: size, height: size }} />
      ) : (
        <div
          className="rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white font-bold"
          style={{ width: size, height: size, fontSize: size * 0.36 }}
        >
          {initials}
        </div>
      )}
      {online !== undefined && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-2 border-white ${online ? 'bg-emerald-400' : 'bg-gray-300'}`}
          style={{ width: size * 0.28, height: size * 0.28 }}
        />
      )}
    </div>
  );
}
