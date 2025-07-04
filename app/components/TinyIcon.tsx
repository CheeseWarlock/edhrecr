interface TinyIconProps {
  className?: string;
}

export function TinyIcon({ className }: TinyIconProps) {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className}>
      <polyline points="8.422291236000337 15.76182561467183 15 12 8.422291236000337 8.238174385328174" stroke="currentColor" fill="none" strokeWidth="1.5" />
      <circle cx="20" cy="12" r="2.5" fill="var(--color-mana-black)"/>
      <circle cx="14.47213595499958" cy="19.60845213036123" r="2.5" fill="var(--color-mana-red)"/>
      <circle cx="5.527864045000421" cy="16.702282018339787" r="2.5" fill="var(--color-mana-green)"/>
      <circle cx="5.5278640450004195" cy="7.297717981660216" r="2.5" fill="var(--color-mana-white)"/>
      <circle cx="14.472135954999578" cy="4.391547869638771" r="2.5" fill="var(--color-mana-blue)"/>
    </svg>
  );
}
