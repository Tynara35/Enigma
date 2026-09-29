export const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, ' ');
export function validateBank(data) {
  if (!Array.isArray(data) || data.length < 10 || data.length > 2000) throw Error('O JSON deve conter uma lista de 10 a 2.000 perguntas.');
  return data.map((q,i) => {
    const fail = m => { throw Error(`Pergunta ${i+1}: ${m}`); };
    if (!q || typeof q.q !== 'string' || !q.q.trim()) fail('escreva o enigma no campo q.');
    if (q.hint !== undefined && typeof q.hint !== 'string') fail('hint deve ser um texto.');
    const base = {type:q.type,q:q.q.trim(),hint:q.hint?.trim() || ''};
    if (q.type === 'multiple') {
      if (!Array.isArray(q.options) || q.options.length<2 || q.options.length>8 || q.options.some(o=>typeof o!=='string'||!o.trim())) fail('use de 2 a 8 alternativas em options.');
      if (!Number.isInteger(q.correct)||q.correct<0||q.correct>=q.options.length) fail('correct deve ser o índice da resposta, começando em zero.');
      return {...base,options:q.options.map(o=>o.trim()),correct:q.correct};
    }
    if(q.type === 'open') {
      const answers = q.answers ?? (typeof q.answer==='string'?[q.answer]:null);
      if (!Array.isArray(answers)||!answers.length||answers.some(a=>typeof a!=='string'||!a.trim())) fail('informe answers com as respostas aceitas.');
      return {...base,answers:answers.map(a=>a.trim())};
    }
    fail('type deve ser multiple ou open.');
  });
}
export function shuffled(a,random=Math.random){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
export class Expedition {
  constructor(bank,seconds,prize,now=Date.now){this.questions=shuffled(validateBank(bank)).slice(0,10);this.seconds=seconds;this.prize=prize;this.now=now;this.index=0;this.pieces=0;this.used={sense:false,chance:false,torch:false};this.shield=false;this.hidden=[];this.status='playing';this.deadline=now()+seconds*1000;}
  get question(){return this.questions[this.index];}
  remaining(){return Math.max(0,Math.ceil((this.deadline-this.now())/1000));}
  tick(){if(this.status==='playing'&&this.now()>=this.deadline)this.status='timeout';return this.status;}
  use(card){this.tick();if(this.status!=='playing'||!(card in this.used)||this.used[card])return false;const q=this.question;if(card==='sense'&&(q.type!=='multiple'||q.options.length<=2))return false;if(card==='torch'&&!q.hint)return false;this.used[card]=true;if(card==='chance')this.shield=true;if(card==='sense'){const wrong=shuffled(q.options.map((_,i)=>i).filter(i=>i!==q.correct));this.hidden=wrong.slice(1);}return true;}
  answer(value){this.tick();if(this.status!=='playing')return this.status;const q=this.question;const correct=q.type==='multiple'?value===q.correct:q.answers.some(a=>normalize(a)===normalize(value));if(!correct){if(this.shield){this.shield=false;return 'retry';}this.status='lost';return 'lost';}this.pieces++;this.status=this.pieces===10?'won':'solved';return this.status;}
  next(){if(this.status!=='solved')return;this.index++;this.hidden=[];this.shield=false;this.status='playing';this.deadline=this.now()+this.seconds*1000;}
}
