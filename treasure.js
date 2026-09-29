// The same reveal is used by the victory screen and the organizer's preview.
export function showTreasure(prize, onReveal = () => {}) {
  const previousFocus = document.activeElement;
  const dialog = document.createElement('dialog');
  dialog.className = 'treasure-cinema';
  dialog.setAttribute('aria-labelledby', 'reveal-title');
  dialog.innerHTML = `
    <div class="reveal-header"><span class="eyebrow">O SEGREDO DO BAÚ</span><button type="button" class="reveal-skip">Pular animação</button></div>
    <h2 id="reveal-title">O tesouro está despertando…</h2>
    <div class="reveal-scene" role="img" aria-label="Baú avançando em direção à tela e se abrindo com luz dourada">
      <div class="reveal-approach">
      <img class="reveal-open" src="assets/chest-open.png" alt="" width="1536" height="1024">
      <img class="reveal-closed" src="assets/chest.png" alt="" width="1536" height="1024">
      <img class="reveal-lid" src="assets/chest.png" alt="" width="1536" height="1024">
      <div class="reveal-light"></div>
      <div class="reveal-sparks" aria-hidden="true">${Array.from({length:22},(_,i)=>`<i style="--x:${19+(i*17)%65}%;--delay:${.9+(i%7)*.14}s;--drift:${(i%2?1:-1)*(20+i*4)}px"></i>`).join('')}</div>
      </div>
    </div>
    <div class="reveal-reward" hidden><p class="eyebrow">VOCÊ CONQUISTOU</p><p class="reveal-prize"></p><p class="reveal-caption">A recompensa de quem chegou até o fim.</p><button type="button" class="primary reveal-close">Continuar</button></div>
    <p class="reveal-status" role="status" aria-live="polite">O baú se aproxima…</p>`;
  const reward = dialog.querySelector('.reveal-reward');
  const skip = dialog.querySelector('.reveal-skip');
  const scene = dialog.querySelector('.reveal-scene');
  const title = dialog.querySelector('h2');
  const status = dialog.querySelector('.reveal-status');
  let timer, revealed = false, disposed = false;
  function reveal() {
    if (disposed || revealed) return;
    clearTimeout(timer);
    revealed = true;
    dialog.classList.add('is-revealed');
    scene.setAttribute('aria-label', 'Baú aberto, iluminado por dentro');
    title.textContent = 'O tesouro é seu!';
    dialog.querySelector('.reveal-prize').textContent = String(prize);
    reward.hidden = false;
    skip.hidden = true;
    status.textContent = `Tesouro revelado: ${prize}`;
    dialog.querySelector('.reveal-close').focus({preventScroll:true});
    onReveal();
  }
  function close() {
    if (disposed) return;
    disposed = true;
    clearTimeout(timer);
    dialog.close();
    dialog.remove();
    if (previousFocus?.isConnected && !previousFocus.disabled) previousFocus.focus({preventScroll:true});
  }
  skip.onclick = reveal;
  dialog.querySelector('.reveal-close').onclick = close;
  dialog.addEventListener('cancel', e => { e.preventDefault(); revealed ? close() : reveal(); });
  document.body.append(dialog);
  dialog.showModal();
  const images = [...dialog.querySelectorAll('img')];
  // Preload both states before starting, but never trap the user on an asset failure.
  Promise.all(images.map(img => img.decode().catch(() => {}))).then(() => {
    if (disposed || revealed) return;
    dialog.classList.add('is-opening');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) reveal();
    else timer = setTimeout(reveal, 4600);
  });
  return close;
}
