'use strict';
let STORE='',BEST='';const SOUND='versearoo-sound-v2',RUN_LENGTH=100;
let selectedVersion='esv',difficulty='easy';const catalogs=new Map();
const VERSION_NAMES={"esv": "ESV (English Standard Version)", "nlt": "NLT (New Living Translation)", "nkjv": "NKJV (New King James Version)", "niv": "NIV (New International Version)", "kjv": "KJV (King James Version)"};
const $=id=>document.getElementById(id);
const ui={chapter:$('chapterLabel'),round:$('roundLabel'),progress:$('progress'),score:$('score'),high:$('highScore'),cleared:$('cleared'),reference:$('reference'),source:$('sourceLabel'),puzzle:$('puzzle'),status:$('status'),hearts:$('hearts'),keyboard:$('keyboard'),next:$('continue'),reset:$('reset'),sound:$('soundToggle'),overlay:$('endScreen'),title:$('endTitle'),icon:$('endIcon'),message:$('endMessage'),answer:$('endAnswer'),endReference:$('endReference'),stats:$('endStats'),retry:$('retry'),again:$('playAgain'),newRun:$('newRun'),roo:$('roo'),smile:$('smile')};
let collection=[],fingerprint='',state=null,loading=false,best=0,soundOn=true,audio=null,requestId=0;
try{soundOn=localStorage.getItem(SOUND)!=='false'}catch{}
function persist(){try{localStorage.setItem(STORE,JSON.stringify(state))}catch{}}
function shuffled(count){const a=Array.from({length:count},(_,i)=>i);for(let i=count-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function fresh(){return {fingerprint,order:shuffled(collection.length).slice(0,RUN_LENGTH),level:0,score:0,hearts:4,guessed:[],mistakes:0,phase:'playing',verse:null,source:null}}
function restore(){try{const x=JSON.parse(localStorage.getItem(STORE));if(x&&x.fingerprint===fingerprint&&Array.isArray(x.order)&&x.order.length===RUN_LENGTH&&new Set(x.order).size===RUN_LENGTH&&x.order.every(n=>Number.isInteger(n)&&n>=0&&n<collection.length)&&Number.isInteger(x.level)&&x.level>=0&&x.level<RUN_LENGTH&&Number.isFinite(x.score)&&x.score>=0&&Array.isArray(x.guessed)&&x.guessed.every(c=>/^[A-Z]$/.test(c))&&new Set(x.guessed).size===x.guessed.length&&Number.isInteger(x.hearts)&&x.hearts>=0&&x.hearts<=4&&Number.isInteger(x.mistakes)&&x.mistakes>=0&&x.mistakes<=4&&['playing','won','lost','complete'].includes(x.phase)&&(!x.verse||typeof x.verse==='string'))return x}catch{}return fresh()}
function entry(){return collection[state.order[state.level]]}
function verse(){return state.verse||entry().verse}
function playSound(kind){if(!soundOn)return;try{audio=audio||new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume().catch(()=>{});const patterns={right:[520,660],wrong:[190,145],win:[520,660,780],lost:[275,190,130],finish:[520,660,780,1040]};(patterns[kind]||[]).forEach((frequency,i)=>{const oscillator=audio.createOscillator(),gain=audio.createGain(),at=audio.currentTime+i*.12;oscillator.type=kind==='wrong'||kind==='lost'?'triangle':'sine';oscillator.frequency.setValueAtTime(frequency,at);gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(.075,at+.018);gain.gain.exponentialRampToValueAtTime(.0001,at+.17);oscillator.connect(gain);gain.connect(audio.destination);oscillator.start(at);oscillator.stop(at+.18)})}catch{}}
function loadVerse(){state.verse=entry().verse;state.source=selectedVersion.toUpperCase()+' · '+(difficulty==='easy'?'Easy':'Hard');loading=false;persist();render()}
function solved(){return [...verse().toUpperCase()].filter(c=>/^[A-Z]$/.test(c)).every(c=>state.guessed.includes(c))}
function renderPuzzle(){ui.puzzle.replaceChildren();if(loading)return;const words=verse().split(/\s+/);for(const [index,word] of words.entries()){const group=document.createElement('span');group.className='word';for(const c of word){const isLetter=/^[A-Z]$/i.test(c),box=document.createElement('span');if(isLetter){const visible=state.guessed.includes(c.toUpperCase())||state.phase==='lost'||state.phase==='complete';box.className='letter-box'+(visible?' revealed':'')+(state.phase==='lost'&&!state.guessed.includes(c.toUpperCase())?' shown-on-loss':'');box.textContent=visible?c.toUpperCase():'';box.setAttribute('aria-label',visible?c:'hidden letter')}else{box.className='punctuation';box.textContent=c}group.append(box)}if(index<words.length-1){const gap=document.createElement('span');gap.className='word-gap';gap.setAttribute('aria-label','space');group.append(gap)}ui.puzzle.append(group)}ui.puzzle.setAttribute('aria-label',state.phase==='lost'||state.phase==='complete'?verse():'Verse with hidden letters and visible word gaps')}
function fitPuzzle(){
  const words=[...ui.puzzle.children];
  if(!words.length)return;
  const bounds=ui.puzzle.getBoundingClientRect(),style=getComputedStyle(ui.puzzle);
  const top=bounds.top+parseFloat(style.paddingTop)+1,bottom=bounds.bottom-parseFloat(style.paddingBottom)-1;
  for(let step=0;step<=16;step++){
    const scale=1-step*.04;
    words.forEach(word=>word.style.zoom=String(scale));
    if(words.every(word=>{const r=word.getBoundingClientRect();return r.top>=top&&r.bottom<=bottom&&r.left>=bounds.left&&r.right<=bounds.right}))break;
  }
}
new ResizeObserver(()=>fitPuzzle()).observe(ui.puzzle);
function modal(){const lost=state.phase==='lost',done=state.phase==='complete',won=state.phase==='won',open=lost||done||won,wasHidden=ui.overlay.hidden;ui.overlay.hidden=!open;ui.next.hidden=!won;ui.retry.hidden=!lost||difficulty==='hard';ui.again.hidden=!done;ui.newRun.hidden=!lost;if(!open)return;ui.icon.textContent=lost?'☁':'✦';ui.title.textContent=lost?'Game over':done?'Journey complete!':'Verse solved!';ui.message.textContent=lost?'No hearts left. The answer was:':done?`You uncovered all ${RUN_LENGTH} verses in this run!`:'You uncovered the whole verse. Ready for the next one?';ui.endReference.textContent=entry().reference;ui.answer.textContent=verse();ui.stats.textContent=`Score: ${state.score} · High score: ${best} · Verses cleared: ${done?RUN_LENGTH:won?state.level+1:state.level}/${RUN_LENGTH}`;if(wasHidden)setTimeout(()=>{if(!ui.overlay.hidden)(lost?(difficulty==='hard'?ui.newRun:ui.retry):done?ui.again:ui.next).focus()},0)}
function render(){if(!state)return;ui.sound.textContent=soundOn?'🔊 Sound on':'🔇 Sound off';ui.sound.setAttribute('aria-pressed',String(soundOn));ui.high.textContent=best;ui.score.textContent=state.score;ui.cleared.textContent=`${state.phase==='complete'?RUN_LENGTH:state.level}/${RUN_LENGTH}`;ui.chapter.textContent=`VERSE ${String(state.level+1).padStart(2,'0')} / ${RUN_LENGTH}`;ui.round.textContent=`Level ${state.level+1} of ${RUN_LENGTH}`;ui.reference.textContent=entry().reference;ui.source.textContent=state.source||selectedVersion.toUpperCase();ui.progress.replaceChildren();for(let i=0;i<RUN_LENGTH;i++){const part=document.createElement('span');part.className='segment'+(i<state.level||state.phase==='complete'?' done':i===state.level?' current':'');ui.progress.append(part)}renderPuzzle();ui.hearts.replaceChildren();for(let i=0;i<4;i++){const heart=document.createElement('span');heart.className='heart'+(i>=state.hearts?' spent':'');heart.textContent='♥';ui.hearts.append(heart)}ui.hearts.setAttribute('aria-label',`${state.hearts} tries remaining`);ui.keyboard.replaceChildren();for(const c of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'){const key=document.createElement('button');key.type='button';key.className='key'+(state.guessed.includes(c)?verse().toUpperCase().includes(c)?' right':' wrong':'');key.textContent=c;key.setAttribute('aria-label',`Guess ${c}`);key.disabled=loading||state.phase!=='playing'||state.guessed.includes(c);key.addEventListener('click',()=>guess(c));ui.keyboard.append(key)}ui.roo.setAttribute('class','roo'+(state.phase==='lost'?' sad':state.phase==='won'||state.phase==='complete'?' celebrate':''));ui.smile.setAttribute('d',state.phase==='lost'?'M126 174 Q141 159 155 174':'M126 166 Q141 178 155 165');ui.status.textContent=state.phase==='playing'?state.guessed.length?`${state.hearts} tries left · ${state.guessed.length} letters guessed`:'Pick a letter to begin.':state.phase==='won'?'Verse solved! Continue when ready.':state.phase==='lost'?'No hearts left. Game over.':`All ${RUN_LENGTH} verses complete!`;modal();fitPuzzle()}
function guess(c){if(loading||state.phase!=='playing'||state.guessed.includes(c)||!/^[A-Z]$/.test(c))return;state.guessed.push(c);const correct=verse().toUpperCase().includes(c);if(!correct){state.mistakes++;state.hearts--;}if(solved()){state.score+=100-20*state.mistakes+(state.mistakes===0?30:0);if(state.score>best){best=state.score;try{localStorage.setItem(BEST,String(best))}catch{}}state.phase=state.level===RUN_LENGTH-1?'complete':'won';if(difficulty==='easy')state.hearts=4;else if((state.level+1)%2===0)state.hearts=Math.min(4,state.hearts+1);playSound(state.phase==='complete'?'finish':'win')}else if(state.hearts<=0){state.phase='lost';playSound('lost')}else playSound(correct?'right':'wrong');persist();render();document.dispatchEvent(new CustomEvent('versearoo:action',{detail:{kind:state.phase==='lost'?'lost':state.phase==='won'||state.phase==='complete'?'win':correct?'right':'wrong'}}))}
ui.next.addEventListener('click',()=>{if(state.phase!=='won')return;state.level++;state.guessed=[];state.mistakes=0;state.phase='playing';state.verse=null;state.source=null;persist();loadVerse()});ui.retry.addEventListener('click',()=>{if(difficulty==='hard')return;state.hearts=4;state.guessed=[];state.mistakes=0;state.phase='playing';persist();render()});function startNew(){++requestId;loading=false;state=fresh();persist();loadVerse()}ui.again.addEventListener('click',startNew);ui.newRun.addEventListener('click',startNew);ui.reset.addEventListener('click',showLanding);ui.sound.addEventListener('click',()=>{soundOn=!soundOn;try{localStorage.setItem(SOUND,String(soundOn))}catch{}render()});document.addEventListener('keydown',event=>{if(event.altKey||event.ctrlKey||event.metaKey||event.repeat||!state||!$('landing').hidden||!ui.overlay.hidden)return;const letter=event.key.toUpperCase();if(event.key.length===1&&/^[A-Z]$/.test(letter))guess(letter);else if(event.key==='Enter'&&state.phase==='won'&&document.activeElement===document.body)ui.next.click()});

function validateCatalog(data){
 if(!Array.isArray(data.verses))throw Error('Missing verses array');
 const seen=new Set();
 for(const v of data.verses){
  if(!v||typeof v.reference!=='string'||!v.reference.trim()||typeof v.verse!=='string'||!v.verse.trim()||v.verse.length>500||!/[a-z]/i.test(v.verse)||seen.has(v.reference.trim().toLowerCase()))throw Error('Invalid or duplicate verse');
  seen.add(v.reference.trim().toLowerCase());
 }
 return data.verses;
}
function showLanding(){
 $('landing').hidden=false;$('gameShell').hidden=true;ui.overlay.hidden=true;
 $('startError').textContent='';updateSelection();$('versionChoice').focus();
}
function updateSelection(){
 const version=$('versionChoice').value,mode=$('difficultyChoice').value;
 const count=catalogs.get(version)?.length||0;
 $('poolInfo').textContent=count>=RUN_LENGTH?'A fresh selection of verses for every journey.':`${version.toUpperCase()} verse collection not added yet.`;
 $('startGame').disabled=count<RUN_LENGTH;
 let saved=false;try{saved=!!localStorage.getItem(`versearoo-v3-${version}-${mode}`)}catch{}
 $('resumeGame').hidden=!saved||count<RUN_LENGTH;
 $('modeInfo').textContent=mode==='easy'?'Four hearts restored after each solved verse.':'Hearts carry over. Earn one heart every two solved verses, up to four.';
}
function launch(resume=false){
 selectedVersion=$('versionChoice').value;difficulty=$('difficultyChoice').value;
 collection=catalogs.get(selectedVersion)||[];if(collection.length<RUN_LENGTH)return;
 STORE=`versearoo-v3-${selectedVersion}-${difficulty}`;BEST=`versearoo-best-v3-${selectedVersion}-${difficulty}`;
 fingerprint=collection.map(v=>v.reference+'='+v.verse).join('|');best=0;
 try{best=Math.max(0,Number(localStorage.getItem(BEST))||0)}catch{}
 state=resume?restore():fresh();
 $('editionLabel').textContent=selectedVersion.toUpperCase()+' · '+difficulty.toUpperCase();
 $('landing').hidden=true;$('gameShell').hidden=false;loadVerse();requestAnimationFrame(fitPuzzle);ui.reset.focus();
}
$('versionChoice').addEventListener('change',updateSelection);
$('difficultyChoice').addEventListener('change',updateSelection);
$('startGame').addEventListener('click',()=>launch(false));
$('resumeGame').addEventListener('click',()=>launch(true));
async function init(){
 await Promise.all(['kjv','nlt','nkjv','esv','niv'].map(async version=>{
  const option=$('versionChoice').querySelector(`option[value="${version}"]`);
  try{
   const response=await fetch(version==='kjv'?'./verses.json':`./verses/${version}.json`,{cache:'no-store'});
   if(!response.ok)throw Error('Collection unavailable');
   const data=await response.json();if(data.translation!==version)throw Error('Translation mismatch');
   const verses=validateCatalog(data);catalogs.set(version,verses);
   option.disabled=verses.length<RUN_LENGTH;
   option.textContent=VERSION_NAMES[version]+(option.disabled?' — awaiting verses':'');
  }catch{option.disabled=true;option.textContent=VERSION_NAMES[version]+' — unavailable';}
 }));
 const playable=[...catalogs.keys()].filter(version=>catalogs.get(version).length>=RUN_LENGTH);
 if(!playable.includes($('versionChoice').value)&&playable.length)$('versionChoice').value=playable[0];
 updateSelection();$('startError').textContent=playable.length?'':'No playable verse collection is available.';
}
window.__versearooTest={current:()=>({reference:entry().reference,verse:verse()}),currentVerse:()=>verse()};init();
