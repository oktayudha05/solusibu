import { Composition } from 'remotion'
import { Short, ShortProps, frameAdegan } from './Short'
import { FPS, H, W } from './gaya'

const kosong: ShortProps = { judul: '', suara: '', kecepatan: '', adegan: [] }

export const Root = () => (
  <Composition
    id="Short"
    component={Short}
    width={W}
    height={H}
    fps={FPS}
    durationInFrames={FPS}
    defaultProps={kosong}
    calculateMetadata={({ props }) => ({
      durationInFrames: Math.max(1, props.adegan.reduce((n, a) => n + frameAdegan(a), 0)),
    })}
  />
)
