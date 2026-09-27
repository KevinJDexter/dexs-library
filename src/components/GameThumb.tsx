// Mock games have no images, so draw a colored tile with the game's initials.
const hue = (name: string) => [...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 360;

export default function GameThumb({ name, src }: { name: string, src?: string }) {
  if (src) {
    return <img className="game-thumb" src={src} />
  }
  const initials = name.split(' ').map(word => word[0]).join('').toUpperCase();
  return (
    <div className="game-thumb" style={{ background: `hsl(${hue(name)}, 45%, 45%)`}}>
      {initials}
    </div>
  )
}