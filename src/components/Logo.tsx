import icon from '../assets/icon.png';
import iconLight from '../assets/icon-light.png';
import wordmark from '../assets/wordmark.png';
import wordmarkLight from '../assets/wordmark-light.png';
import full from '../assets/logo-full.png';
import fullLight from '../assets/logo-full-light.png';

// The client's logo is used exactly as supplied: these are cut-outs of the original artwork,
// recoloured to ivory for dark backgrounds. Nothing is redrawn.
export const logoSrc = { icon, iconLight, wordmark, wordmarkLight, full, fullLight };

export function Lockup({ light = false, height = 44 }: { light?: boolean; height?: number }) {
  return (
    <span className="lockup" style={{ height }}>
      <img src={light ? iconLight : icon} alt="" style={{ height }} />
      <img src={light ? wordmarkLight : wordmark} alt="Regalia Aesthetics" style={{ height: height * 0.52 }} />
    </span>
  );
}
