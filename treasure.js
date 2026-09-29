export function showTreasure(prize,onReveal=()=>{}) {
  const previousFocus=document.activeElement;
  const dialog=document.createElement('dialog');
  dialog.className='treasure-cinema';dialog.setAttribute('aria-labelledby','reveal-title');
  dialog.innerHTML=`<div class="reveal-header"><span class="eyebrow">O SEGREDO DO BAÚ</span><button type="button" class="reveal-skip">Pular animação</button></div><h2 id="reveal-title">A última descoberta</h2><div class="reveal-scene" role="img" aria-label="Baú tridimensional com tampa articulada"><div class="reveal-3d"></div><img class="reveal-fallback" src="assets/chest-open.png" alt="Baú aberto" hidden></div><div class="reveal-reward" hidden><p class="eyebrow">VOCÊ CONQUISTOU</p><p class="reveal-prize"></p><button type="button" class="primary reveal-close">Continuar</button></div><p class="reveal-status" role="status" aria-live="polite">Preparando a descoberta…</p>`;
  const status=dialog.querySelector('.reveal-status'),skip=dialog.querySelector('.reveal-skip');
  let disposed=false,revealed=false,player=null;
  function reveal(){if(disposed||revealed)return;revealed=true;dialog.classList.add('is-revealed');dialog.querySelector('h2').textContent='O tesouro é seu!';dialog.querySelector('.reveal-prize').textContent=String(prize);dialog.querySelector('.reveal-reward').hidden=false;skip.hidden=true;status.textContent=`Tesouro revelado: ${prize}`;dialog.querySelector('.reveal-close').focus({preventScroll:true});onReveal();}
  function finish(){if(player)player.finish();else{dialog.querySelector('.reveal-fallback').hidden=false;reveal();}}
  function close(){if(disposed)return;disposed=true;player?.dispose();dialog.close();dialog.remove();if(previousFocus?.isConnected&&!previousFocus.disabled)previousFocus.focus({preventScroll:true});}
  skip.onclick=finish;dialog.querySelector('.reveal-close').onclick=close;
  dialog.addEventListener('cancel',e=>{e.preventDefault();revealed?close():finish();});
  document.body.append(dialog);dialog.showModal();
  import('./chest-3d.js').then(async({createChestScene})=>{
    if(disposed||revealed)return;
    const created=await createChestScene(dialog.querySelector('.reveal-3d'),prize,reveal);
    if(disposed||revealed){created.dispose();return;}
    player=created;status.textContent='O baú se abre. Seu tesouro está lá dentro.';
  }).catch(()=>{
    if(disposed)return;
    dialog.querySelector('.reveal-3d').replaceChildren();dialog.querySelector('.reveal-fallback').hidden=false;reveal();
  });
  return close;
}
