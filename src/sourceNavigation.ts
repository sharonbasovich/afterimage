/** Move keyboard and visual position together when inspecting a distant source. */
export function focusAndReveal(
  target: Pick<HTMLElement, 'isConnected' | 'focus' | 'scrollIntoView'> | null,
  reducedMotion: boolean,
  block: ScrollLogicalPosition = 'center',
): boolean {
  if (!target?.isConnected) return false;
  target.focus({preventScroll: true});
  target.scrollIntoView({block, behavior: reducedMotion ? 'instant' : 'smooth'});
  return true;
}
