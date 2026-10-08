import './GameThumb.css';

// Mock games have no images, so draw a colored tile with the game's initials.
const hue = (name: string) => [...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 360;

export default function GameThumb({ name, src, size = 48 }: { name: string, src?: string, size?: number }) {
  const style = { width: size, height: size, fontSize: size / 3};
  if (src) {
    return <img className="game-thumb" src={src} style={style}/>
  }
  const initials = name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 3);
  return (
    <div className="game-thumb" style={{ ...style, background: `hsl(${hue(name)}, 45%, 45%)`}}>
      {initials}
    </div>
  )
}